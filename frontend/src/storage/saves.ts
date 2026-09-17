import type { Session } from "../game/types";
import { parseSession } from "./validate";

const KEY = "homeomorph-save-v1";
interface Saved {
  time: number;
  data: string;
}

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("homeomorph", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("saves");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("IndexedDB is unavailable."));
    request.onblocked = () => reject(new Error("Another tab blocked save storage."));
  });
}

async function accessDatabase(saved: Saved | null): Promise<unknown> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction("saves", saved ? "readwrite" : "readonly");
      const store = transaction.objectStore("saves");
      const request = saved ? store.put(saved, KEY) : store.get(KEY);
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(new Error("Could not access browser save storage."));
      transaction.onabort = () => reject(new Error("Browser save was interrupted."));
    });
  } finally {
    db.close();
  }
}

function parseEnvelope(value: unknown): Saved | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object") throw new Error("Damaged browser save.");
  if (!("time" in value) || typeof value.time !== "number" || !Number.isFinite(value.time))
    throw new Error("Damaged save timestamp.");
  if (!("data" in value) || typeof value.data !== "string")
    throw new Error("Damaged save contents.");
  return { time: value.time, data: value.data };
}

export async function loadSession(): Promise<Session | null> {
  const results = await Promise.allSettled([
    accessDatabase(null),
    Promise.resolve().then(() => {
      const stored = localStorage.getItem(KEY);
      return stored ? (JSON.parse(stored) as unknown) : null;
    }),
  ]);
  if (
    results.some((result) => result.status === "rejected" && result.reason instanceof SyntaxError)
  )
    throw new Error(
      "The browser save is damaged. Import a backup or explicitly start a new campaign."
    );
  const candidates = results
    .flatMap((result) => {
      if (result.status !== "fulfilled") return [];
      const saved = parseEnvelope(result.value);
      return saved ? [saved] : [];
    })
    .sort((a, b) => b.time - a.time);
  if (candidates[0]) return parseSession(candidates[0].data);
  if (results.every((result) => result.status === "rejected"))
    throw new Error("Browser storage is unavailable. You can still play and export a backup.");
  return null;
}

export async function saveSession(session: Session): Promise<string> {
  const saved: Saved = { time: Date.now(), data: JSON.stringify(session) };
  const results = await Promise.allSettled([
    accessDatabase(saved),
    Promise.resolve().then(() => localStorage.setItem(KEY, JSON.stringify(saved))),
  ]);
  if (results.every((result) => result.status === "rejected"))
    throw new Error("Could not save in this browser. Export a backup before closing the tab.");
  return "Saved on this device";
}

export function exportSession(session: Session): void {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(session, null, 2)], { type: "application/json" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "homeomorph-save.json";
  link.click();
  URL.revokeObjectURL(url);
}
