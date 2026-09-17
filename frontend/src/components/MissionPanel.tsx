import { campaign } from "../content/campaign";
import { encounters } from "../content/encounters";
import { forecastIntents } from "../game/intents";
import { displacement, shiftPoint } from "../game/turns";
import type { Battle, Difficulty } from "../game/types";

export function MissionPanel({
  battle,
  difficulty,
}: Readonly<{ battle: Battle; difficulty: Difficulty }>) {
  const encounter = encounters[battle.mission];
  return (
    <aside className="mission-sidebar">
      <section className="panel">
        <p className="eyebrow">{campaign[battle.mission].location}</p>
        <h2>Objectives</h2>
        <ul className="objectives">
          {battle.objectives.map((objective) => (
            <li key={objective.id} className={objective.progress >= objective.needed ? "done" : ""}>
              <span>
                {objective.progress >= objective.needed ? "✓" : "◇"} {objective.name}
              </span>
              <strong>
                {objective.progress}/{objective.needed}
              </strong>
              {objective.optional && (
                <small>Optional · through round {7 + difficulty.optionalRounds}</small>
              )}
            </li>
          ))}
        </ul>
        {encounter.holdRounds > 0 && (
          <p>Keep the crew standing through round {encounter.holdRounds}.</p>
        )}
        {battle.mission >= 6 && battle.mission <= 8 && (
          <p className="pressure">
            Lock pressure: {battle.pressure}/8. Interactions reduce pressure by 1.
          </p>
        )}
        <details>
          <summary>Mission briefing</summary>
          <p>{encounter.briefing}</p>
        </details>
      </section>
      <Forecast battle={battle} difficulty={difficulty} />
      <IntentQueue battle={battle} difficulty={difficulty} />
    </aside>
  );
}

function Forecast({ battle, difficulty }: Readonly<{ battle: Battle; difficulty: Difficulty }>) {
  const encounter = encounters[battle.mission];
  const shift = shiftPoint(battle);
  const displaced = displacement(battle);
  return (
    <section className="panel shift-notice">
      <h2>Habitat forecast</h2>
      {encounter.shiftRound ? (
        <p>
          {battle.shifted
            ? "The first shift has resolved."
            : `At the start of round ${encounter.shiftRound}: threshold ${shift.x},${shift.y} closes; the passage at 5,1 opens.`}
        </p>
      ) : (
        <p>No scheduled shift.</p>
      )}
      {!battle.shifted && encounter.shiftRound > 0 && (
        <p>
          {displaced
            ? `Current occupant moves safely to ${displaced.x},${displaced.y}.`
            : "An occupied threshold stays open if no safe displacement is possible or the unit is Braced."}
        </p>
      )}
      {battle.mission === 8 && <p>At round 6, the central threshold reopens.</p>}
      {encounter.reinforcement && (
        <p>
          {battle.reinforcementsArrived
            ? "Reinforcements have arrived."
            : `Reinforcement at round ${5 + difficulty.reinforcementDelay}: ${encounter.reinforcement.split("-").join(" ")}. Entry priority: 10,1 → 10,7 → 9,1. Occupied entries delay arrival.`}
        </p>
      )}
    </section>
  );
}

function IntentQueue({ battle, difficulty }: Readonly<{ battle: Battle; difficulty: Difficulty }>) {
  const pending = forecastIntents(battle);
  return (
    <section className="panel intent-panel">
      <h2>Declared enemy order</h2>
      <p>Blocked plans become Guard. No replacement attacks.</p>
      {pending.length === 0 && <p>No pending enemy activations.</p>}
      <ol>
        {pending.map(({ intent, name, description }, index) => (
          <li key={intent.unitId} className={index < difficulty.preview ? "next-intent" : ""}>
            <strong>{name}</strong>
            <p>{description}</p>
            <small>
              Path:{" "}
              {intent.path.map((point) => `${point.x},${point.y}`).join(" → ") || "Stay in place"}
            </small>
          </li>
        ))}
      </ol>
    </section>
  );
}
