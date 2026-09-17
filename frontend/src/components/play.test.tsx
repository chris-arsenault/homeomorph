import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";
import { loadSession, saveSession } from "../storage/saves";
import { newSession } from "../game/campaign";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  localStorage.clear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function button(text: string): HTMLButtonElement {
  const result = [...container.querySelectorAll("button")].find((element) =>
    element.textContent?.includes(text)
  );
  if (!result) throw new Error(`Missing button: ${text}`);
  return result;
}
async function click(text: string) {
  await act(async () => button(text).click());
}

function boardTile(x: number, y: number): HTMLButtonElement {
  const tile = container.querySelector<HTMLButtonElement>(`[aria-label^="${x}, ${y}:"]`);
  if (!tile) throw new Error("Missing board tile");
  return tile;
}

describe("playable browser controls", () => {
  it("previews a move, requires confirmation, saves it and rewinds after a reload", async () => {
    await act(async () => root.render(<App />));
    await click("Start campaign");
    await click("Begin Before the Turn");
    await click("Mara Ell");
    const tile = boardTile(3, 2);
    await act(async () => tile.click());
    expect((await loadSession())?.battle?.units[0].position).toEqual({ x: 1, y: 2 });
    expect(container.querySelector(".preview")?.textContent).toContain("moves to 3,2");
    await click("Confirm Move");
    expect((await loadSession())?.battle?.units[0].position).toEqual({ x: 3, y: 2 });
    await act(async () => root.unmount());
    root = createRoot(container);
    await act(async () => root.render(<App />));
    expect(container.querySelector("#action-heading")?.textContent).toContain("1 AP");
    await click("Rewind activation");
    const save = await loadSession();
    expect(save?.battle?.units[0].position).toEqual({ x: 1, y: 2 });
    expect(save?.rewindsUsed).toBe(1);
  });

  it("moves board focus with arrows without spending AP", async () => {
    await saveSession(newSession());
    await act(async () => root.render(<App />));
    await click("Begin Before the Turn");
    await click("Mara Ell");
    const tile = container.querySelector<HTMLButtonElement>('[aria-label^="1, 2:"]');
    if (!tile) throw new Error("Missing tile");
    await act(async () => {
      tile.focus();
      tile.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    });
    expect(document.activeElement?.getAttribute("aria-label")).toMatch(/^2, 2:/);
    expect((await loadSession())?.battle?.ap).toBe(2);
  });

  it("keeps progress when a new campaign is canceled", async () => {
    await saveSession(newSession());
    await act(async () => root.render(<App />));
    await click("Begin Before the Turn");
    await click("New campaign");
    expect(container.querySelector('[role="alertdialog"]')).not.toBeNull();
    await click("Keep current campaign");
    expect((await loadSession())?.stage).toBe("battle");
  });
});
