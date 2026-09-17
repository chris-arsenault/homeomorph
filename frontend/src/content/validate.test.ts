import { describe, expect, it } from "vitest";
import { campaign } from "./campaign";
import { characters } from "./characters";
import { enemies } from "./enemies";
import { skillChoices } from "./skills";
import type { GameContent } from "./validate";
import { validateContent } from "./validate";
import { validateCampaign } from "./validateEncounters";

const content: GameContent = {
  missions: campaign,
  characters,
  enemies,
  skills: skillChoices,
};

describe("validateContent", () => {
  it("validates playable maps and rejects deleted campaign content", () => {
    expect(validateCampaign()).toEqual([]);
    expect(validateContent({ ...content, missions: campaign.slice(0, 8) })).toContain(
      "Campaign requires nine missions and an epilogue."
    );
  });
  it("accepts the authored Homeomorph foundation", () => {
    expect(validateContent(content)).toEqual([]);
  });

  it("finds duplicate ids and campaign gaps", () => {
    const broken: GameContent = {
      ...content,
      missions: [campaign[0], { ...campaign[0], sequence: 2 }],
    };

    expect(validateContent(broken)).toContain("Duplicate content id: before-the-turn.");
    expect(validateContent(broken)).toContain(
      "Campaign sequence must be contiguous; expected 1, found 2."
    );
  });

  it("finds an incomplete skill tier", () => {
    const broken: GameContent = {
      ...content,
      skills: skillChoices.filter((skill) => skill.id !== "mara-holdfast"),
    };

    expect(validateContent(broken)).toContain("Mara Ell must have two distinct choices at tier 1.");
  });
});
