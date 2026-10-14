/** Browser audio helpers: mic capture, PCM playback, base64 and WAV encoding. */

export const INPUT_SAMPLE_RATE = 16000;
export const OUTPUT_SAMPLE_RATE = 24000;

/* ----------------------------- encoding ----------------------------- */

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Encode Int16 PCM chunks into a mono WAV file and return it as base64. */
export function pcmChunksToWavBase64(chunks: Int16Array[], sampleRate = INPUT_SAMPLE_RATE): string {
  const totalSamples = chunks.reduce((n, c) => n + c.length, 0);
  const dataBytes = totalSamples * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, "data");
  view.setUint32(40, dataBytes, true);

  const out = new Int16Array(buffer, 44);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return bytesToBase64(new Uint8Array(buffer));
}

/* --------------------------- mic recorder --------------------------- */

export interface MicRecorder {
  stop: () => void;
}

/**
 * Start capturing the microphone as 16 kHz PCM chunks.
 * `onChunk` receives each ~100 ms Int16Array chunk and its RMS level (0–1).
 */
export async function startMicRecorder(
  onChunk: (pcm: Int16Array, level: number) => void,
): Promise<MicRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
  const ctx = new AudioContext();
  try {
    await ctx.resume();
    await ctx.audioWorklet.addModule("/worklets/pcm-recorder.js");
    const source = ctx.createMediaStreamSource(stream);
    const node = new AudioWorkletNode(ctx, "pcm-recorder");
    node.port.onmessage = (e: MessageEvent<{ pcm: ArrayBuffer; level: number }>) => {
      onChunk(new Int16Array(e.data.pcm), e.data.level);
    };
    source.connect(node);
    // Keep the worklet in the rendered audio graph. Its processor never copies
    // input to output, so this destination connection remains silent.
    node.connect(ctx.destination);

    let stopped = false;
    return {
      stop: () => {
        if (stopped) return;
        stopped = true;
        node.port.onmessage = null;
        source.disconnect();
        node.disconnect();
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
      },
    };
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    void ctx.close();
    throw error;
  }
}

/* --------------------------- PCM player ----------------------------- */

/** Gapless player for streamed 24 kHz Int16 PCM chunks (Live API output). */
export class PcmPlayer {
  private ctx: AudioContext;
  private sourceSampleRate: number;
  private nextTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private resamplePosition = 0;
  private carrySample: number | null = null;
  onPlayingChange?: (playing: boolean) => void;

  constructor(sampleRate = OUTPUT_SAMPLE_RATE) {
    this.sourceSampleRate = sampleRate;
    this.ctx = new AudioContext();
  }

  async resume() {
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  get isPlaying() {
    return this.sources.size > 0;
  }

  /**
   * Resample the PCM stream as one continuous signal. Letting Web Audio
   * resample every network chunk independently can create clicks at chunk
   * boundaries because each AudioBufferSourceNode resets its interpolation.
   */
  private resampleChunk(pcm: Int16Array): Float32Array<ArrayBuffer> {
    const hasCarry = this.carrySample !== null;
    const inputLength = pcm.length + (hasCarry ? 1 : 0);
    if (inputLength === 0) return new Float32Array();

    const lastSample =
      pcm.length > 0 ? pcm[pcm.length - 1] / 0x8000 : (this.carrySample ?? 0);
    if (inputLength === 1) {
      this.carrySample = lastSample;
      return new Float32Array();
    }

    const ratio = this.sourceSampleRate / this.ctx.sampleRate;
    const available = inputLength - 1 - this.resamplePosition;
    const output = new Float32Array(Math.max(0, Math.ceil(available / ratio)));
    const sampleAt = (index: number) => {
      if (hasCarry && index === 0) return this.carrySample ?? 0;
      return pcm[index - (hasCarry ? 1 : 0)] / 0x8000;
    };

    let count = 0;
    let position = this.resamplePosition;
    while (position < inputLength - 1 && count < output.length) {
      const leftIndex = Math.floor(position);
      const fraction = position - leftIndex;
      const left = sampleAt(leftIndex);
      const right = sampleAt(leftIndex + 1);
      output[count] = left + (right - left) * fraction;
      count += 1;
      position += ratio;
    }

    this.resamplePosition = position - (inputLength - 1);
    this.carrySample = lastSample;
    return count === output.length ? output : output.slice(0, count);
  }

  private resetResampler() {
    this.resamplePosition = 0;
    this.carrySample = null;
  }

  enqueueBase64(b64: string) {
    const bytes = base64ToBytes(b64);
    const pcm = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
    const wasPlaying = this.isPlaying;
    if (!wasPlaying) this.resetResampler();

    const float = this.resampleChunk(pcm);
    if (float.length === 0) return;

    // Samples are already converted to the AudioContext rate, so adjacent
    // buffers remain sample-continuous when scheduled back-to-back.
    const buffer = this.ctx.createBuffer(1, float.length, this.ctx.sampleRate);
    buffer.copyToChannel(float, 0);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.ctx.destination);

    // Keep a small first-chunk cushion for main-thread/network jitter. Once a
    // turn is queued, all following chunks use sample-accurate scheduling.
    const startAt = wasPlaying
      ? Math.max(this.ctx.currentTime + 0.005, this.nextTime)
      : this.ctx.currentTime + 0.08;
    src.start(startAt);
    this.nextTime = startAt + buffer.duration;

    this.sources.add(src);
    if (!wasPlaying) this.onPlayingChange?.(true);
    src.onended = () => {
      this.sources.delete(src);
      if (!this.isPlaying) this.onPlayingChange?.(false);
    };
  }

  /** Stop everything immediately (used when the user interrupts the AI). */
  clear() {
    for (const s of this.sources) {
      s.onended = null;
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    }
    this.sources.clear();
    this.nextTime = 0;
    this.resetResampler();
    this.onPlayingChange?.(false);
  }

  close() {
    this.clear();
    void this.ctx.close();
  }
}
