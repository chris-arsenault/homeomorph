import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { alive, key, same, tileAt, unitAt, WIDTH, HEIGHT } from "../game/board";
import { shiftPoint } from "../game/turns";
import type { Battle, Point } from "../game/types";
import "./Board.css";

interface Props {
  battle: Battle;
  target: Point;
  reachable: Set<string>;
  onTarget: (point: Point) => void;
}
const cells = Array.from({ length: WIDTH * HEIGHT }, (_, index) => ({
  x: index % WIDTH,
  y: Math.floor(index / WIDTH),
}));

function paint(context: CanvasRenderingContext2D, battle: Battle): void {
  context.clearRect(0, 0, WIDTH * 64, HEIGHT * 64);
  for (const point of cells) {
    const tile = tileAt(battle, point);
    context.fillStyle = tile === "#" ? "#121b22" : "#26353d";
    context.fillRect(point.x * 64, point.y * 64, 64, 64);
    context.strokeStyle = "#41515a";
    context.strokeRect(point.x * 64 + 1, point.y * 64 + 1, 62, 62);
    if (tile === "c") {
      context.fillStyle = "#73817b";
      context.fillRect(point.x * 64 + 4, point.y * 64 + 50, 56, 9);
    }
    if (tile === "+") {
      context.strokeStyle = "#c3a5ee";
      context.lineWidth = 3;
      context.strokeRect(point.x * 64 + 5, point.y * 64 + 5, 54, 54);
      context.lineWidth = 1;
    }
  }
}

function tileLabel(battle: Battle, point: Point): string {
  const unit = unitAt(battle, point);
  const objective = battle.objectives.find((entry) => same(entry.position, point));
  const terrain: Record<string, string> = {
    "#": "wall",
    ".": "floor",
    c: "cover, damage reduced by 1",
    "+": "Turn threshold",
  };
  const info = [
    unit ? `${unit.name}, ${unit.vitality} vitality` : "",
    objective ? `${objective.name}, ${objective.progress}/${objective.needed}` : "",
  ];
  return `${point.x}, ${point.y}: ${terrain[tileAt(battle, point)]}. ${info.join(" ")}`;
}

function cellContent(battle: Battle, point: Point) {
  const standing = unitAt(battle, point);
  const fallen = battle.units.find((unit) => !alive(unit) && same(unit.position, point));
  const unit = standing ?? fallen;
  const objective = battle.objectives.find((entry) => same(entry.position, point));
  return (
    <>
      <span className="cell-coordinate">
        {point.x},{point.y}
      </span>
      {unit && (
        <>
          <span className={`unit-token ${unit.side} ${alive(unit) ? "" : "fallen"}`}>
            {unit.name
              .split(" ")
              .map((word) => word[0])
              .slice(0, 2)
              .join("")}
          </span>
          <span className="unit-health">{unit.surrendered ? "SAFE" : `${unit.vitality} HP`}</span>
        </>
      )}
      {objective && (
        <span
          className={`objective-token ${objective.progress >= objective.needed ? "complete" : ""}`}
        >
          {objective.progress >= objective.needed ? "✓" : "◇"}
        </span>
      )}
    </>
  );
}

export function Board({ battle, target, reachable, onTarget }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(25);
  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (context) paint(context, battle);
  }, [battle]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>) {
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -WIDTH,
      ArrowDown: WIDTH,
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    const next = Math.min(cells.length - 1, Math.max(0, focusIndex + offset));
    setFocusIndex(next);
    grid.current?.querySelectorAll("button")[next]?.focus();
    onTarget(cells[next]);
  }
  return (
    <div className="board-scroll">
      <div className="board-surface">
        <canvas ref={canvas} width={WIDTH * 64} height={HEIGHT * 64} aria-hidden="true" />
        <div
          className="board-grid"
          ref={grid}
          role="group"
          aria-label="Tactical board. Use arrow keys to inspect tiles, then confirm the action in the action panel."
        >
          {cells.map((point, index) => (
            <button
              key={key(point)}
              type="button"
              tabIndex={index === focusIndex ? 0 : -1}
              className={[
                "board-cell",
                same(point, target) ? "target" : "",
                reachable.has(key(point)) ? "reachable" : "",
                same(point, shiftPoint(battle)) ? "shift-cell" : "",
              ].join(" ")}
              aria-label={tileLabel(battle, point)}
              onKeyDown={navigate}
              aria-pressed={same(point, target)}
              onClick={() => {
                setFocusIndex(index);
                onTarget(point);
              }}
              onFocus={() => {
                setFocusIndex(index);
                onTarget(point);
              }}
            >
              {cellContent(battle, point)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
