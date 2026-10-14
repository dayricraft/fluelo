"use client";

import { useState } from "react";

import { CEFR_LEVELS, LEVELS, type CefrLevel } from "@/lib/levels";
import { resetAll, updateProfile, type Profile } from "@/lib/storage";
import { Icon } from "./icon";

interface ProfileModalProps {
  profile: Profile;
  onClose: () => void;
}

export function ProfileModal({ profile, onClose }: ProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [level, setLevel] = useState<CefrLevel>(profile.level ?? "B1");
  const [targetBand, setTargetBand] = useState(profile.targetBand);
  const [saving, setSaving] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setStorageError(null);
    try {
      const persisted = await updateProfile({
        name: name.trim(),
        level,
        targetBand,
      });
      if (!persisted) {
        setStorageError("Profil belum tersimpan. Periksa izin atau ruang penyimpanan browser.");
        return;
      }
      onClose();
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : "Profil belum dapat disimpan.");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm("Hapus profil, riwayat sesi, XP, progres lesson, dan antrean review di perangkat ini?")) return;
    setSaving(true);
    setStorageError(null);
    try {
      const persisted = await resetAll();
      if (!persisted) {
        setStorageError("Reset belum tersimpan. Periksa izin penyimpanan browser.");
        return;
      }
      onClose();
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : "Progres belum dapat direset.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      aria-labelledby="profile-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-[#0d172b]/55 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="animate-rise w-full max-w-lg overflow-hidden rounded-[1.8rem] bg-white shadow-[0_30px_90px_rgba(15,27,52,.28)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#6e55df]">Profil belajar</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-900" id="profile-title">
              Sesuaikan targetmu
            </h2>
          </div>
          <button
            aria-label="Tutup pengaturan profil"
            className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            onClick={onClose}
            type="button"
          >
            <Icon name="x" className="size-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {storageError && (
            <p aria-live="polite" className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-800" role="status">
              {storageError}
            </p>
          )}
          <label className="block">
            <span className="text-sm font-extrabold text-slate-700">Nama panggilan</span>
            <input
              autoFocus
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#8a72ee] focus:bg-white focus:ring-4 focus:ring-violet-100"
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Ahmad"
              type="text"
              value={name}
            />
          </label>

          <div>
            <span className="text-sm font-extrabold text-slate-700">Level aktif</span>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {CEFR_LEVELS.map((item) => (
                <button
                  className={`rounded-xl border px-2 py-3 text-sm font-black transition ${
                    level === item
                      ? "border-[#6e55df] bg-[#6e55df] text-white shadow-lg shadow-violet-200"
                      : "border-slate-200 bg-white text-slate-500 hover:border-violet-300 hover:text-violet-700"
                  }`}
                  key={item}
                  onClick={() => setLevel(item)}
                  title={LEVELS[item].nameId}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{LEVELS[level].descriptionId}</p>
          </div>

          <label className="block">
            <span className="flex items-center justify-between text-sm font-extrabold text-slate-700">
              Target TOEFL
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700">{targetBand.toFixed(1)}</span>
            </span>
            <input
              aria-label="Target skor TOEFL"
              className="mt-4 h-2 w-full accent-[#6e55df]"
              max="6"
              min="1"
              onChange={(event) => setTargetBand(Number(event.target.value))}
              step="0.5"
              type="range"
              value={targetBand}
            />
            <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-400">
              <span>1.0</span>
              <span>3.5</span>
              <span>6.0</span>
            </div>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <button className="text-left text-xs font-bold text-rose-500 transition hover:text-rose-700 disabled:opacity-50" disabled={saving} onClick={() => void reset()} type="button">
            Reset seluruh progres
          </button>
          <div className="flex gap-2">
            <button className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50" disabled={saving} onClick={onClose} type="button">
              Batal
            </button>
            <button className="rounded-xl bg-[#6e55df] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-[#6047d4] disabled:opacity-60" disabled={saving} onClick={() => void save()} type="button">
              {saving ? "Menyimpan…" : "Simpan profil"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
