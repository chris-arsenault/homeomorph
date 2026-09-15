import type { CharacterDefinition } from "./types";

export const characters = [
  {
    id: "mara",
    name: "Mara Ell",
    role: "Turn captain",
    combatIdentity: "Anchors positions and transfers actions between allies.",
    arc: "From containing uncertainty to making risk and authority public.",
    branches: ["Anchor", "Coordinator"],
  },
  {
    id: "iven",
    name: "Iven Ro",
    role: "Route-reader",
    combatIdentity: "Reveals routes, marks targets, and moves through shifting space.",
    arc: "From private restlessness to building legitimate contact beyond Nacre.",
    branches: ["Pathfinder", "Opportunist"],
  },
  {
    id: "sela",
    name: "Sela Om",
    role: "Medic and civic liaison",
    combatIdentity: "Restores allies, clears conditions, and creates surrender openings.",
    arc: "From neutral facilitator to advocate for enforceable consent.",
    branches: ["Triage", "Advocate"],
  },
  {
    id: "tarn",
    name: "Tarn Vey",
    role: "Structure technician",
    combatIdentity: "Builds cover, opens routes, and disables stabilizer machinery.",
    arc: "From solitary repair to transparent civic stewardship.",
    branches: ["Builder", "Breaker"],
  },
  {
    id: "nera",
    name: "Nera Quill",
    role: "Retrieval officer",
    combatIdentity: "Redirects enemy intents and disrupts Safekeeping command.",
    arc: "From proving doctrine works to accepting the people it failed as authorities.",
    branches: ["Interdictor", "Witness"],
  },
] as const satisfies readonly CharacterDefinition[];
