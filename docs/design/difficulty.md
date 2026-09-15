# Difficulty and Tuning

## Modes

| Setting  | Intent preview              | Rewinds                       | Reinforcements  | Enemy durability           | Optional pressure          |
| -------- | --------------------------- | ----------------------------- | --------------- | -------------------------- | -------------------------- |
| Story    | Two enemy activations ahead | Unlimited to activation start | One round later | Standard                   | Generous deadlines         |
| Standard | Next enemy activation       | Three per mission             | Authored timing | Standard                   | Authored deadlines         |
| Exacting | Next enemy activation       | One per mission               | Authored timing | +1 vitality to elites only | Tighter optional deadlines |

Custom mode exposes those five dimensions independently after the player begins a campaign. It does
not hide information, add random misses, or inflate every health value.

## Standard target

Standard is tuned for a player familiar with turn-based tactics but unfamiliar with Homeomorph.
The player should understand why a mission failed and identify a different plan without searching
outside the game. Primary objectives allow at least one recoverable mistake; completing every
optional objective in one run may require strong play.

Mission 0 cannot be lost. Missions 1 and 2 use limited enemy behavior and permit immediate restart
from the last teaching beat. Later missions target twenty to thirty-five minutes and never exceed
twelve rounds.

## Tuning order

Tune in this order so numbers do not conceal structural problems:

1. Verify the objective is readable and reachable with every legal roster.
2. Verify enemy intents create at least two credible responses.
3. Verify shift previews provide time to act and never invalidate the primary objective.
4. Adjust terrain, reinforcement route, and deadlines.
5. Adjust individual power or vitality only after spatial changes fail.
6. Test optional objectives and story assistance separately from baseline completion.

## Encounter worksheet

Every mission implementation must record:

- shortest unopposed rounds to each primary objective;
- initial enemy roles and exact reinforcement rounds/tiles;
- shift rounds and affected gates;
- expected player damage received by round, using deterministic previews;
- which roster and skill combinations were tested;
- first failure cause and whether the game communicated it beforehand;
- completion time and remaining rewinds on Standard.

These are observations, not a universal balance formula. They create evidence that agents can use
instead of improvising difficulty from feel.

## Acceptance gates

- Three testers outside the implementation loop can complete missions 0–2 without instruction.
- Every mission is completed on Standard with at least three different four-person rosters.
- Every tier-three skill is useful in three missions and mandatory in none.
- No test failure depends on an intent, reinforcement, shift, or condition the player could not inspect.
- Exacting increases planning pressure without making the same correct plan merely take longer.
