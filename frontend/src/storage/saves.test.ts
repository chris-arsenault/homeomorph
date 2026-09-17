import { beforeEach, describe, expect, it, vi } from "vitest";
import { newSession } from "../game/campaign";
import { loadSession, saveSession } from "./saves";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("browser storage fallback", () => {
  it("persists and loads through localStorage when IndexedDB is unavailable", async () => {
    const session = newSession();
    await expect(saveSession(session)).resolves.toBe("Saved on this device");
    await expect(loadSession()).resolves.toEqual(session);
  });
  it("reports damaged stored JSON and preserves the bytes for recovery", async () => {
    localStorage.setItem("homeomorph-save-v1", "{bad save");
    await expect(loadSession()).rejects.toThrow("damaged");
    expect(localStorage.getItem("homeomorph-save-v1")).toBe("{bad save");
  });
  it("reports quota failure instead of claiming the save succeeded", async () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    await expect(saveSession(newSession())).rejects.toThrow("Export a backup");
  });
});
