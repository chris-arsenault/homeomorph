import { useMemo, useState } from "react";
import { campaign } from "../content/campaign";
import { encounters } from "../content/encounters";
import { objectiveSummary, transition } from "../game/actions";
import { key, WIDTH, HEIGHT } from "../game/board";
import { debrief, dispatch, restart, rewind } from "../game/campaign";
import type { Action, Battle, Command, Point, Session } from "../game/types";
import { ActionPanel } from "./ActionPanel";
import { Board } from "./Board";
import { MissionPanel } from "./MissionPanel";
import "./TacticalGame.css";

interface Props {
  session: Session;
  battle: Battle;
  onChange: (session: Session) => void;
}

export function TacticalGame({ session, battle, onChange }: Props) {
  const [action, setAction] = useState<Action>("move");
  const [target, setTarget] = useState<Point>({ x: 1, y: 2 });
  const [message, setMessage] = useState("Select a crew member to begin.");
  const reachable = useMemo(() => {
    const points = Array.from({ length: WIDTH * HEIGHT }, (_, index) => ({
      x: index % WIDTH,
      y: Math.floor(index / WIDTH),
    }));
    return new Set(
      points
        .filter(
          (point) =>
            transition(battle, { type: "act", action, target: point }, session.difficulty).legal
        )
        .map(key)
    );
  }, [battle, action, session.difficulty]);
  function command(value: Command) {
    const result = transition(battle, value, session.difficulty);
    setMessage(result.message);
    if (result.legal) onChange(dispatch(session, value));
    if (value.type === "select") {
      setAction("move");
      const actor = battle.units.find((unit) => unit.id === value.unitId);
      if (actor) setTarget(actor.position);
    }
  }
  return (
    <main className="tactical-game">
      <MissionToolbar session={session} battle={battle} onChange={onChange} />
      <div className="tactical-layout">
        <section className="board-column" aria-label="Board and actions">
          <Board battle={battle} target={target} reachable={reachable} onTarget={setTarget} />
          <p className="board-help">
            Choose an action, inspect a tile, then confirm. Keyboard: Tab into the board, arrow keys
            to move, Tab to the action controls.
          </p>
          <p className="status-message" role="status">
            {message}
          </p>
          <ActionPanel
            session={session}
            battle={battle}
            action={action}
            target={target}
            onAction={setAction}
            onCommand={command}
          />
          <details className="panel">
            <summary>Action record</summary>
            <ol className="action-log">
              {battle.log.map((line, index) => (
                <li key={`${index}-${line}`}>{line}</li>
              ))}
            </ol>
          </details>
        </section>
        <MissionPanel battle={battle} difficulty={session.difficulty} />
      </div>
    </main>
  );
}

function MissionToolbar({ session, battle, onChange }: Props) {
  const [confirmRestart, setConfirmRestart] = useState(false);
  const remaining =
    session.difficulty.rewinds < 0
      ? "Unlimited"
      : String(session.difficulty.rewinds - session.rewindsUsed);
  return (
    <>
      {" "}
      <header className="mission-header">
        <div>
          <p className="eyebrow">
            Sequence {battle.mission + 1} of 10 · {session.difficulty.name}
          </p>
          <h1>{campaign[battle.mission].title}</h1>
        </div>
        <div className="round-badge">
          Round {battle.round}
          {encounters[battle.mission].deadline > 0 && ` / ${encounters[battle.mission].deadline}`}
        </div>
      </header>
      <div className="battle-toolbar">
        <button
          type="button"
          disabled={!session.checkpoint || remaining === "0"}
          onClick={() => {
            onChange(rewind(session));
          }}
        >
          Rewind activation · {remaining}
        </button>
        <button type="button" onClick={() => setConfirmRestart(true)}>
          Restart mission
        </button>
        <span>Circle = crew · Square = enemy · ◇ = objective · Bar = cover</span>
      </div>
      {confirmRestart && (
        <section className="confirmation" role="alertdialog" aria-label="Restart mission">
          <p>Restart this mission? Earlier campaign choices and skills stay saved.</p>
          <button type="button" onClick={() => onChange(restart(session))}>
            Restart
          </button>
          <button type="button" onClick={() => setConfirmRestart(false)}>
            Keep playing
          </button>
        </section>
      )}
      <Outcome session={session} battle={battle} onChange={onChange} />
    </>
  );
}

function Outcome({ session, battle, onChange }: Props) {
  return (
    <>
      {" "}
      {battle.outcome !== "playing" && (
        <section className="outcome" role="status">
          <h2>{battle.outcome === "won" ? "Route secured" : "Mission interrupted"}</h2>
          <p>{objectiveSummary(battle)}</p>
          {battle.outcome === "won" ? (
            <button className="primary" type="button" onClick={() => onChange(debrief(session))}>
              Continue to the crew&apos;s report
            </button>
          ) : (
            <button className="primary" type="button" onClick={() => onChange(restart(session))}>
              Retry without campaign penalty
            </button>
          )}
        </section>
      )}
    </>
  );
}
