/**
 * AudioWorklet that converts microphone audio (any sample rate) into
 * 16 kHz mono 16-bit PCM chunks (~100 ms each), as required by the Gemini
 * Live API (audio/pcm;rate=16000). Also reports an RMS level for the UI meter.
 */
class PcmRecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRate = 16000;
    // `sampleRate` is a global in AudioWorkletGlobalScope.
    this.ratio = sampleRate / this.targetRate;
    this.leftover = new Float32Array(0);
    this.pos = 0;
    this.chunkSamples = 1600; // 100 ms at 16 kHz
    this.out = new Int16Array(this.chunkSamples);
    this.outLen = 0;
    this.sumSquares = 0;
  }

  flush() {
    const rms = Math.sqrt(this.sumSquares / Math.max(1, this.outLen));
    const chunk = this.out.slice(0, this.outLen);
    this.port.postMessage({ pcm: chunk.buffer, level: rms }, [chunk.buffer]);
    this.outLen = 0;
    this.sumSquares = 0;
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (!channel) return true;

    const data = new Float32Array(this.leftover.length + channel.length);
    data.set(this.leftover, 0);
    data.set(channel, this.leftover.length);

    let pos = this.pos;
    while (pos + 1 < data.length) {
      const i = Math.floor(pos);
      const frac = pos - i;
      let s = data[i] * (1 - frac) + data[i + 1] * frac;
      s = Math.max(-1, Math.min(1, s));
      this.sumSquares += s * s;
      this.out[this.outLen++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.outLen === this.chunkSamples) this.flush();
      pos += this.ratio;
    }

    const keepFrom = Math.floor(pos);
    this.leftover = data.slice(keepFrom);
    this.pos = pos - keepFrom;
    return true;
  }
}

registerProcessor("pcm-recorder", PcmRecorderProcessor);
