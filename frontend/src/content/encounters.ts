import type { Point } from "./types";
import boards from "./boards.json";

export interface TaskDefinition {
  id: string;
  name: string;
  position: Point;
  needed: number;
  optional: boolean;
  flag: string | null;
}

export interface Encounter {
  map: keyof typeof boards.maps;
  briefing: string;
  resolution: string;
  tasks: TaskDefinition[];
  enemies: string[];
  shiftRound: number;
  deadline: number;
  holdRounds: number;
  reinforcement: string | null;
  choices: readonly [string, string, string][];
}

function task(id: string, name: string, x: number, y: number, needed = 1): TaskDefinition {
  return { id, name, position: { x, y }, needed, optional: false, flag: null };
}

function optional(id: string, name: string, x: number, y: number, flag: string): TaskDefinition {
  return { ...task(id, name, x, y), optional: true, flag };
}

export const encounters: readonly Encounter[] = [
  {
    map: "depot",
    briefing:
      "Mara: Before the Turn, we check the routes people actually use. Inspect the three thresholds. The violet threshold closes at round 3; the upper passage opens. Nobody is an enemy here.",
    resolution:
      "Iven: Three thresholds, three different answers. Good thing we came to look. The residents move safely before the test shift.",
    tasks: [
      task("west", "Inspect west threshold", 3, 2),
      task("north", "Brace north threshold", 8, 2),
      task("residents", "Guide residents to shelter", 9, 6),
    ],
    enemies: [],
    shiftRound: 3,
    deadline: 0,
    holdRounds: 0,
    reinforcement: null,
    choices: [
      [
        "careful-routes",
        "Publish the maintenance report",
        "The crew records the neglected routes openly.",
      ],
    ],
  },
  {
    map: "receiving",
    briefing:
      "Sela: The surveyors came offering help. Now their commander calls this custody. Collect the survey team at the dock, inspect the anchor, and open the market exit. We need a route out, not a battlefield.",
    resolution:
      "Renn: Emergency custody remains in effect. Mara closes the channel. The surveyors have seen the damage with their own eyes; that knowledge belongs to everyone.",
    tasks: [
      task("survey", "Guide surveyors from the dock", 4, 2),
      task("anchor", "Inspect damaged anchor", 9, 2),
      task("exit", "Open market escape", 9, 6),
      optional("equipment", "Preserve survey equipment", 7, 7, "shared-repair"),
    ],
    enemies: ["retrieval-officer", "retrieval-officer"],
    shiftRound: 4,
    deadline: 12,
    holdRounds: 0,
    reinforcement: null,
    choices: [
      [
        "shared-repair",
        "Return the survey instruments",
        "A surveyor keeps a copy of the crew's measurements.",
      ],
      [
        "open-passage",
        "Use the instruments to open another exit",
        "Residents gain a second way through custody.",
      ],
    ],
  },
  {
    map: "receiving",
    briefing:
      "Tarn: Transit keys in the east office. Two public exits under lock. Take the keys and open both routes. The brace carrier protects the officer; approach from another lane or draw them away.",
    resolution:
      "Mara: We are not waiting for permission to maintain our home. Crew Seven now has a working transit route through Receiving.",
    tasks: [
      task("keys", "Recover transit keys", 9, 2),
      task("route", "Release concourse lock", 9, 6, 2),
      optional("detained", "Release detained passengers", 7, 1, "open-passage"),
    ],
    enemies: ["retrieval-officer", "brace-carrier", "retrieval-officer"],
    shiftRound: 4,
    deadline: 12,
    holdRounds: 0,
    reinforcement: "retrieval-officer",
    choices: [
      [
        "mercy",
        "Offer the detained officers safe passage",
        "An officer reports that Crew Seven kept its word.",
      ],
      [
        "local-truth",
        "Broadcast the custody orders",
        "The districts hear the orders in the commander's own words.",
      ],
    ],
  },
  {
    map: "civic",
    briefing:
      "Sela: These households are missing from the evacuation register. Reach all three and reconnect their routes. A restraint drone tethers people it cannot classify. Assist clears restraint; damage breaks the drone's hold.",
    resolution:
      "Sela: They were never missing. Someone stopped counting them. The households are connected again, and their names enter the public record.",
    tasks: [
      task("house-a", "Reconnect west household", 4, 1),
      task("house-b", "Reconnect east household", 9, 3),
      task("house-c", "Reconnect lower household", 9, 7),
      optional("medic", "Protect the field medic", 6, 6, "mercy"),
    ],
    enemies: ["restraint-drone", "retrieval-officer", "brace-carrier"],
    shiftRound: 3,
    deadline: 12,
    holdRounds: 0,
    reinforcement: "restraint-drone",
    choices: [
      [
        "mercy",
        "Share supplies with the field medic",
        "The medic will treat people from either side.",
      ],
      [
        "local-truth",
        "Publish the omitted register",
        "The Assembly must answer for every missing address.",
      ],
    ],
  },
  {
    map: "orchard",
    briefing:
      "Ari: Leaving is my choice. Help us cross the reservoir without giving either side our future. Open the route in order: gathering point, orchard crossing, civilian transport. Each step moves the evacuees to the next shelter.",
    resolution:
      "Ari: We can love this place from somewhere else. The transport departs by consent, with its passengers alive and its route still open.",
    tasks: [
      task("gather", "Gather voluntary evacuees", 4, 2),
      task("crossing", "Escort to orchard shelter", 7, 4),
      task("transport", "Escort onto civilian transport", 10, 6),
      optional("guide", "Persuade the local guide", 8, 1, "mercy"),
    ],
    enemies: ["departure-auxiliary", "retrieval-officer", "restraint-drone"],
    shiftRound: 4,
    deadline: 12,
    holdRounds: 0,
    reinforcement: "departure-auxiliary",
    choices: [
      [
        "public-passengers",
        "Publish the passenger list",
        "Public testimony establishes that departure was voluntary.",
      ],
      [
        "private-passengers",
        "Seal the passenger list",
        "Residents retain control of their whereabouts.",
      ],
      [
        "ari-trusted",
        "Entrust the record to Ari",
        "Ari will speak for the passengers at the Assembly.",
      ],
    ],
  },
  {
    map: "works",
    briefing:
      "Iven: The archive is still here. It is the door that moved. Recover both records and transmit the forecast. The surveyor commits to a firing lane; step away before it resolves.",
    resolution:
      "Tarn: The Assembly hid the failing anchors. The Safekeeping's lock is making them worse. Now both facts are public.",
    tasks: [
      task("record-a", "Recover transition records", 8, 1),
      task("record-b", "Recover concealed forecast", 9, 6),
      task("transmit", "Transmit the Quiet Map", 10, 4, 2),
      optional("privacy", "Redact private medical routes", 6, 7, "private-records"),
    ],
    enemies: ["surveyor", "brace-carrier", "retrieval-officer"],
    shiftRound: 3,
    deadline: 12,
    holdRounds: 0,
    reinforcement: "retrieval-officer",
    choices: [
      [
        "local-truth",
        "Release the full engineering record",
        "Neither government can suppress the measurements.",
      ],
      [
        "private-records",
        "Publish with residents' routes protected",
        "The evidence stands without exposing private journeys.",
      ],
    ],
  },
  {
    map: "works",
    briefing:
      "Nera: I was ordered to destroy those records. I refused. Let me help stop the lock. Disable three relays; engineers add lock pressure when left uninterrupted. At eight pressure the anchors fail.",
    resolution:
      "Vale: Your map predicts the damage my equipment is causing. I should have listened before I installed it. The relays fall silent.",
    tasks: [
      task("relay-a", "Disable upper lock relay", 8, 1, 2),
      task("relay-b", "Disable central lock relay", 10, 4, 2),
      task("relay-c", "Disable lower lock relay", 8, 7, 2),
      optional("vale", "Secure Vale's tools and team", 6, 6, "shared-repair"),
    ],
    enemies: ["lock-engineer", "linebreaker-rig", "retrieval-officer"],
    shiftRound: 4,
    deadline: 12,
    holdRounds: 0,
    reinforcement: "lock-engineer",
    choices: [
      [
        "shared-repair",
        "Keep Vale's team working with the crew",
        "Outside engineers join the final repairs.",
      ],
      [
        "independent-repair",
        "Put the network under neighborhood control",
        "Local crews share the procedures openly.",
      ],
    ],
  },
  {
    map: "civic",
    briefing:
      "Mara: No closed committee this time. Activate the three public relays and keep the crew standing through round 4. The field coordinator strengthens the first ready ally; disrupt its command or separate them.",
    resolution:
      "Mora admits the concealment on an open channel. Testimony crosses the custody lines. Some Safekeeping officers lower their weapons.",
    tasks: [
      task("relay-a", "Connect residents' testimony", 4, 1),
      task("relay-b", "Connect departure testimony", 9, 3),
      task("relay-c", "Open the Assembly broadcast", 9, 7, 2),
      optional("witness", "Protect independent witnesses", 6, 6, "local-truth"),
    ],
    enemies: ["field-coordinator", "retrieval-officer", "brace-carrier", "departure-auxiliary"],
    shiftRound: 3,
    deadline: 12,
    holdRounds: 4,
    reinforcement: "retrieval-officer",
    choices: [
      [
        "mora-speaks",
        "Let Mora answer last",
        "The Assembly commits its resources to public repair.",
      ],
      ["ari-trusted", "Give Ari the final word", "Civilian crews protect the passage lane."],
      [
        "nera-speaks",
        "Give Nera the final word",
        "Safekeeping personnel hear one of their own refuse custody.",
      ],
    ],
  },
  {
    map: "anchor",
    briefing:
      "Mara: Three anchors, Renn's lock, and a passage lane. We need all of them. Our earlier choices determine who helps. The Long Turn closes the middle threshold at round 3 and reopens it at round 6. Every route change is shown before it happens.",
    resolution:
      "Nacre completes the Turn. Water reaches the orchards through a connection nobody could have preserved by freezing the old map. The passage ships depart. Renn's custody order no longer has a network to enforce it.",
    tasks: [
      task("anchor-a", "Repair upper anchor", 4, 1, 2),
      task("anchor-b", "Repair east anchor", 9, 2, 2),
      task("anchor-c", "Repair lower anchor", 8, 7, 2),
      task("renn", "Disable Renn's central lock", 10, 4, 2),
      task("passage", "Keep voluntary passage open", 10, 7),
    ],
    enemies: ["lock-engineer", "field-coordinator", "linebreaker-rig", "surveyor"],
    shiftRound: 3,
    deadline: 12,
    holdRounds: 0,
    reinforcement: "retrieval-officer",
    choices: [
      [
        "open-oversight",
        "Place the repairs under public oversight",
        "Every district can inspect the new maintenance record.",
      ],
      [
        "shared-authority",
        "Share authority among local and visiting crews",
        "No single institution controls the routes again.",
      ],
    ],
  },
  {
    map: "depot",
    briefing:
      "Iven: Same depot. Different garden through the door. Walk the district and speak with five people before filing our report. There is no deadline and nobody to fight.",
    resolution:
      "Crew Seven submits its report. Nacre remains a home because the people who live here can change it, leave it, and hold its institutions to account.",
    tasks: [
      task("mara", "Hear Mara's account", 4, 1),
      task("iven", "Ask Iven about the voyage", 8, 1),
      task("sela", "Visit Sela's passage office", 9, 4),
      task("tarn", "Inspect Tarn's public workshop", 8, 7),
      task("nera", "Hear Nera's testimony", 4, 7),
    ],
    enemies: [],
    shiftRound: 0,
    deadline: 0,
    holdRounds: 0,
    reinforcement: null,
    choices: [
      [
        "report-stay",
        "Recommend open civic stewardship",
        "Mara and Tarn rebuild under public oversight. Iven leaves aboard a survey ship knowing his return is welcome.",
      ],
      [
        "report-passage",
        "Recommend a permanent right of passage",
        "Sela establishes an independent passage office. Ari's transports keep moving in both directions.",
      ],
      [
        "report-repair",
        "Recommend shared repair and accountability",
        "Nera testifies against custody doctrine. Local and visiting crews maintain the new routes together.",
      ],
    ],
  },
];

export const deploymentPoints: readonly Point[] = [
  { x: 1, y: 2 },
  { x: 1, y: 3 },
  { x: 1, y: 5 },
  { x: 1, y: 6 },
];
export const enemyPoints: readonly Point[] = [
  { x: 8, y: 1 },
  { x: 9, y: 4 },
  { x: 7, y: 7 },
  { x: 10, y: 6 },
];

export function mapTiles(mission: number): string[] {
  return [...boards.maps[encounters[mission].map]];
}
