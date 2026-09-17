import { core, getAbility, isPassive } from "../game/abilities";
import { epilogueAccounts } from "../content/testimony";
import { actionCost, transition } from "../game/actions";
import { alive, movement, same, tileAt } from "../game/board";
import type { Action, Battle, Command, Point, Session, Unit } from "../game/types";

const baseActions: readonly [Action, string, string][] = [
  ["move", "Move", "Travel through open orthogonal tiles."],
  ["strike", "Strike", "Attack a standing enemy in range and line of sight."],
  ["interact", "Interact", "Advance an adjacent objective."],
  ["guard", "Guard", "Reduce the next damaging strike by 1; does not stack."],
  ["assist", "Assist", "Restore 1 vitality and clear restraint on an adjacent ally."],
];
interface Props {
  session: Session;
  battle: Battle;
  action: Action;
  target: Point;
  onAction: (action: Action) => void;
  onCommand: (command: Command) => void;
}

function Inspection({
  battle,
  target,
  flags,
}: Readonly<{ battle: Battle; target: Point; flags: string[] }>) {
  const units = battle.units.filter((unit) => same(unit.position, target));
  const objective = battle.objectives.find((entry) => same(entry.position, target));
  return (
    <div className="inspection">
      <h3>
        Tile {target.x}, {target.y}
      </h3>
      <p>
        {tileAt(battle, target) === "c"
          ? "Cover: incoming damage −1."
          : "Select a tile to inspect its contents."}
      </p>
      {units.map((unit) => (
        <div key={unit.id}>
          <strong>{unit.name}</strong>
          <p>
            {unit.vitality}/{unit.maximumVitality} vitality · Armor {unit.armor} · Power{" "}
            {unit.power} · Range {unit.range} · Move {movement(unit)}
          </p>
          <p>
            {unit.surrendered ? "Surrendered" : unit.conditions.join(", ") || "No conditions"}
            {unit.guard ? " · Guard" : ""}
          </p>
        </div>
      ))}
      {objective && (
        <p>
          {objective.name}: {objective.progress}/{objective.needed}
        </p>
      )}
      {battle.mission === 9 && objective && objective.progress > 0 && (
        <blockquote>{epilogueAccounts(flags)[objective.id]}</blockquote>
      )}
    </div>
  );
}

const abilityActions: Action[] = ["core1", "core2", "skill1", "skill2", "skill3"];

function CrewPicker({ battle, onCommand }: Pick<Props, "battle" | "onCommand">) {
  return (
    <div className="crew-list">
      {battle.units
        .filter((unit) => unit.side === "crew")
        .map((unit) => (
          <button
            type="button"
            key={unit.id}
            disabled={
              Boolean(battle.activeId) ||
              !unit.ready ||
              !alive(unit) ||
              battle.outcome !== "playing"
            }
            onClick={() => onCommand({ type: "select", unitId: unit.id })}
          >
            <strong>{unit.name}</strong>
            <span>
              {unit.vitality}/{unit.maximumVitality} HP · {unit.ready ? "Ready" : "Acted"}
            </span>
          </button>
        ))}
    </div>
  );
}

function ActiveActions({
  session,
  battle,
  action,
  target,
  onAction,
  onCommand,
  actor,
}: Props & { actor: Unit }) {
  const command: Command = { type: "act", action, target };
  const preview = transition(battle, command, session.difficulty);
  const options = [
    ...baseActions,
    ...abilityActions.flatMap((id): [Action, string, string][] => {
      const item = getAbility(actor, id);
      return item && !isPassive(item) ? [[id, item.name, item.description]] : [];
    }),
  ];
  return (
    <>
      <div className="action-options" role="group" aria-label="Choose action">
        {options.map(([id, name, description]) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === action}
            title={description}
            onClick={() => onAction(id)}
          >
            {name} <small>{actionCost(actor, id)} AP</small>
          </button>
        ))}
      </div>
      <p className="action-description">{options.find(([id]) => id === action)?.[2]}</p>
      <div className={preview.legal ? "preview legal" : "preview blocked"} aria-live="polite">
        <strong>Before you commit</strong>
        <p>{preview.message}</p>
      </div>
      <button
        className="primary"
        type="button"
        disabled={!preview.legal}
        onClick={() => onCommand(command)}
      >
        Confirm {options.find(([id]) => id === action)?.[1] ?? "action"}
      </button>
      <button
        type="button"
        disabled={battle.outcome !== "playing"}
        onClick={() => onCommand({ type: "end" })}
      >
        End activation · resolve next enemy
      </button>
    </>
  );
}

function SkillReference({ actor }: Readonly<{ actor: Unit }>) {
  const passives = abilityActions
    .map((id) => getAbility(actor, id))
    .filter((item) => item && isPassive(item));
  return (
    <details>
      <summary>Core kit and passive skills</summary>
      {[...core[actor.template], ...passives].map((item) => (
        <p key={item!.name}>
          <strong>{item!.name}:</strong> {item!.description}
        </p>
      ))}
    </details>
  );
}

export function ActionPanel(props: Props) {
  const { battle, target, onCommand } = props;
  const actor = battle.units.find((unit) => unit.id === battle.activeId);
  return (
    <section className="panel action-panel" aria-labelledby="action-heading">
      <h2 id="action-heading">
        {actor ? actor.name + " · " + battle.ap + " AP" : "Choose your next activation"}
      </h2>
      <CrewPicker battle={battle} onCommand={onCommand} />
      {actor ? (
        <ActiveActions {...props} actor={actor} />
      ) : (
        <p>
          Select a ready crew member. Each gets 2 AP. After their activation, the next declared
          enemy intent resolves.
        </p>
      )}
      <Inspection battle={battle} target={target} flags={props.session.flags} />
      {actor && <SkillReference actor={actor} />}
    </section>
  );
}
