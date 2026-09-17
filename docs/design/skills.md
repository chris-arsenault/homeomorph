# Skills and Progression

The playable kit keeps the characters and branch identities below. Exact current costs and effects
come from `frontend/src/content/abilities.ts`, which supplies both deployment descriptions and
action controls. The gray-box adaptations are explicit: Clear Order moves an adjacent ally toward
the next objective; Known Way opens an internal passage for the mission; Open Corridor jams nearby
enemies; Good Brace grants Guard when building; Neighborhood Grid lays a straight cover line;
Return Order persuades a coordinator to stand down; Full Record copies a visible enemy weapon.
Read Threshold grants one movement range while all shifts remain public information. Movement
grants are bounded by AP or once-per-activation limits; Second Plan alone grants another activation.
These decisions make the complete kit executable without adding a second action economy.

Progression expands decisions without creating build traps. Each protagonist has a fixed core kit
and two thematic branches with three tiers. After missions 2, 5, and 7, the player selects one of
the two skills at the new tier for every protagonist. Earlier choices do not lock a branch, so each
character has eight complete builds rather than a combinatorial tree.

There are no experience points, gear levels, currencies, respec costs, or randomized rewards.
Before a mission, the player may switch any unlocked tier choice. Story difficulty also allows
switching during deployment without first completing the prior mission.

## Mara — Anchor / Coordinator

| Tier | Anchor                                                                           | Coordinator                                                            |
| ---- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1    | **Holdfast:** Guard also makes Mara Braced                                       | **Clear Order:** give an adjacent ally one movement-only AP            |
| 2    | **Shelter Line:** adjacent allies share Mara's cover                             | **Hand Signal:** retarget one declared enemy intent to Mara if legal   |
| 3    | **Here We Stand:** 2 AP; allies within two tiles gain Guard and clear Restrained | **Second Plan:** once per mission, ready an ally who has already acted |

Core: **Set Point** places one temporary cover brace; **Steady** grants Guard to an adjacent ally.

## Iven — Pathfinder / Opportunist

| Tier | Pathfinder                                                                       | Opportunist                                                                     |
| ---- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1    | **Read Threshold:** preview a shift one additional round early and gain one move | **Angle Found:** strikes after moving gain one power                            |
| 2    | **Slip Route:** move through one occupied allied tile and one closed threshold   | **Pass It On:** defeating or persuading a Marked target marks the nearest enemy |
| 3    | **Known Way:** once per mission, connect two mapped gates until round end        | **Already Gone:** after striking, move up to full range without reactions       |

Core: **Quick Mark** marks a visible target; **Traverse** moves farther than the standard Move.

## Sela — Triage / Advocate

| Tier | Triage                                                                                    | Advocate                                                                      |
| ---- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1    | **Field Care:** Assist restores two vitality instead of one                               | **Terms Spoken:** surrender threshold applies one vitality earlier            |
| 2    | **Stabilize:** an incapacitated adjacent ally returns with two vitality, once per mission | **Witness:** enemies adjacent to Sela cannot receive command bonuses          |
| 3    | **Nobody Lost:** 2 AP; clear all conditions in a two-tile area                            | **Open Corridor:** create a three-tile zone enemies will not enter this round |

Core: **Treat** restores one vitality and clears Marked; **Call Down** invites an eligible enemy to
surrender when isolated.

## Tarn — Builder / Breaker

| Tier | Builder                                                                   | Breaker                                                                |
| ---- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1    | **Good Brace:** constructed cover has two integrity                       | **Shear Pin:** strikes against devices gain two power                  |
| 2    | **Bypass:** interact with mechanisms from two tiles away                  | **Make a Door:** destroy one designated weak wall per mission          |
| 3    | **Neighborhood Grid:** link two braces so both project cover between them | **Clean Stop:** disable a machine without triggering its defeat effect |

Core: **Brace** places temporary cover; **Tool Strike** deals high adjacent damage to armor and devices.

## Nera — Interdictor / Witness

| Tier | Interdictor                                                               | Witness                                                                        |
| ---- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1    | **Countermand:** Jam an enemy whose intent targets an objective           | **Known Procedure:** reveal reinforcement tiles and timing immediately         |
| 2    | **Return Order:** force a coordinator's granted intent back onto itself   | **Chain of Custody:** evidence interactions cost zero AP once per activation   |
| 3    | **Stand Down:** 2 AP; all eligible human enemies in three tiles surrender | **Full Record:** copy one enemy command skill for the remainder of the mission |

Core: **Interpose** changes a visible intent's target to Nera when legal; **Service Codes** disables
an adjacent Safekeeping device.

## Tuning constraints

- A tier-three skill may change one encounter but cannot solve a primary objective alone.
- Extra actions are limited to Mara's once-per-mission capstone.
- Player damage remains mostly flat; growth adds position, information, and objective tools.
- Every branch must be valuable in at least three missions and optional in every mission.
- Balance assumes the player chose any legal combination, not an expected optimal build.
