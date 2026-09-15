# Combat

## Format

- Authored square-grid maps viewed from an oblique top-down angle
- Four deployed heroes from a fixed roster of five
- Alternating individual activations; the player chooses the next ready hero, then the enemy side
  resolves one declared intent
- Two action points per unit activation
- Eight to twelve rounds and a target duration of twenty to thirty-five minutes
- Keyboard, mouse, and touch-capable controls; no timing or dexterity requirement

## Actions

| Action   | Cost      | Rule                                                               |
| -------- | --------- | ------------------------------------------------------------------ |
| Move     | 1 AP      | Travel up to movement range through open orthogonal tiles          |
| Strike   | 1 AP      | Deal previewed damage to a valid target in range and line of sight |
| Skill    | 1 or 2 AP | Use a character ability; cost and effects are always explicit      |
| Interact | 1 AP      | Operate an adjacent objective, door, person, or device             |
| Guard    | 1 AP      | Gain one guard until the unit's next activation                    |
| Assist   | 1 AP      | Help an adjacent surrendering, injured, or restrained unit         |

Unused action points do not carry between activations. Most attacks allow movement before and after
because each action is independent. A small number of two-AP skills intentionally consume the
whole activation.

## Deterministic resolution

An attack is legal when range and line of sight permit it. There is no hit roll and no critical-hit
roll. The preview shows exact vitality loss and conditions before confirmation.

`damage = max(0, power - armor - cover - guard)`

Armor is printed on the unit. Cover contributes one when the attack crosses protected terrain.
Guard contributes one and is consumed by the first damaging attack. Zero-damage attacks can still
apply a condition only when the skill explicitly says so.

Vitality usually ranges from four to eight. At zero, a person is incapacitated and a machine is
disabled. Incapacitated people remain on the map and may create rescue or detention objectives.

## Conditions

- **Marked:** the next strike against the unit gains one power, then clears Marked.
- **Restrained:** movement range becomes one; Assist or breaking the source clears it.
- **Braced:** cannot be displaced; clears at the next activation.
- **Jammed:** cannot use command, sensor, or lock skills for one activation.
- **Exposed:** armor becomes zero against the next strike, then clears.

No condition stacks with itself. Durations use activations, not ambiguous global time.

## Enemy intent

Every enemy declares its next action, target or area, path, and predicted result before it resolves.
Declarations occur at round start and update only when the player visibly invalidates them. An
invalid intent falls back to Guard or a printed secondary action; enemies never select an unseen
replacement attack.

This is a contract, not merely interface polish. Enemy logic must remain simple enough to explain
on the board.

## Long Turn shifts

Some maps have one or two authored shift events at fixed round boundaries. The affected thresholds
and resulting connections are previewed for a full round. A shift may open or close paths, rotate
cover, or connect distant edge gates. It never changes a unit's identity, rewrites arbitrary
terrain, or requires simulated topology.

If a threshold closes on a unit, the preview identifies the safe adjacent tile where that unit will
be displaced. Objectives never become impossible because of a shift.

## Mission outcomes

Primary objectives include evacuation, repair, access, delay, escort, evidence recovery, and
device shutdown. Only one mission asks the player to defeat a command group, and even there
surrender is valid. Optional objectives express the four story positions and grant later tactical
assistance, not currency.

The player loses if all deployed heroes are incapacitated, a named protected objective fails, or a
mission-specific round deadline expires. Restarting a mission has no campaign penalty.

## Deliberate exclusions

No hit percentages, initiative stat, inventory grid, consumable economy, loot rarity, elemental
matrix, destructible-everything simulation, reaction-fire web, height levels, fog of war, friendly
fire, or permanent death. Each would add tuning surfaces without strengthening this story.
