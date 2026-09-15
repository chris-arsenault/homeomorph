# Art and Audio Direction

## Visual premise

Nacre looks maintained. Its strangeness comes from relationships between ordinary, repaired places:
a tiled clinic threshold opening onto a wet orchard wall, or transit markings continuing across what
was a ceiling yesterday. Avoid generic ruin, endless neon, and visual noise that makes poverty or
decay stand in for worldbuilding.

## Camera and assets

Use a fixed oblique top-down square grid rather than true isometric geometry. Characters occupy one
tile and read at small sizes. Maps use modular floor, wall, threshold, cover, and prop pieces with
authored decoration passes. A map shift swaps connections and a limited set of tiles; it does not
require deforming an entire scene.

The initial asset budget is:

- five protagonist silhouettes with four directional poses and a small shared animation set;
- seven human enemy silhouettes, with the linebreaker as the only large unit;
- two drones;
- four environment kits with day, emergency, and Turn lighting states;
- approximately twenty effect icons and thirty skill/interface icons;
- dialogue portraits use limited color and expression overlays rather than full animation.

## Color language

- Nacre: warm ceramic, repair-metal gray, plant green, and nacreous transition highlights
- Safekeeping: clean bone panels, rescue orange, dark blue restraints, and rigid straight indicators
- Player intent: cyan; enemy intent: amber; immediate danger: vermilion; assist/surrender: spring green
- Long Turn preview: a moving violet edge pattern, always paired with shape and text for accessibility

The Safekeeping must look like a rescue organization that became an occupying force, not an evil
empire. Nacre must show neglect and unequal maintenance without becoming a slum aesthetic.

## Interface

The board is primary. Selecting a unit shows reachable tiles, exact outcomes, the activation queue,
and any scheduled shift. A single information panel explains the hovered action in ordinary
language. Never require icon memorization; icons always have text labels or accessible names.

Support keyboard navigation, reduced motion, scalable text, color-independent intent patterns, and
subtitles from the first playable build. Touch targets are at least 44 CSS pixels.

## Audio

Nacre's sound is civic and material: ventilation rhythms, ceramic resonance, tools, distant public
announcements, and voices passing through unexpected thresholds. Safekeeping sound uses calm rescue
protocols and exact tones whose repetition becomes controlling, not horror stingers.

Music uses a small motif set rearranged as adjacencies change. The finale combines themes associated
with staying, passage, and Safekeeping rather than assigning heroism to one culture's instrumentation.
