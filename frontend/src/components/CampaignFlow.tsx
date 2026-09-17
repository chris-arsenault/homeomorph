import { useState } from "react";
import { campaign } from "../content/campaign";
import { characters } from "../content/characters";
import { encounters } from "../content/encounters";
import { skillChoices } from "../content/skills";
import { epilogueAccounts } from "../content/testimony";
import { selectable } from "../game/abilities";
import { advance, availableRoster, deploy, difficulties, unlockedTiers } from "../game/campaign";
import type { Difficulty, Session } from "../game/types";
import "./CampaignFlow.css";

interface Props {
  session: Session;
  onChange: (session: Session) => void;
}

const dimensions: readonly {
  field: Exclude<keyof Difficulty, "name">;
  label: string;
  options: readonly [number, string][];
}[] = [
  {
    field: "rewinds",
    label: "Rewinds",
    options: [
      [-1, "Unlimited"],
      [3, "Three"],
      [1, "One"],
      [0, "None"],
    ],
  },
  {
    field: "preview",
    label: "Emphasized upcoming intents",
    options: [
      [1, "Next enemy"],
      [2, "Next two enemies"],
    ],
  },
  {
    field: "reinforcementDelay",
    label: "Reinforcement delay",
    options: [
      [0, "Authored timing"],
      [1, "One round later"],
    ],
  },
  {
    field: "eliteVitality",
    label: "Elite vitality",
    options: [
      [0, "Standard"],
      [1, "+1 vitality"],
    ],
  },
  {
    field: "optionalRounds",
    label: "Optional deadlines",
    options: [
      [3, "Generous"],
      [0, "Standard"],
      [-2, "Tight"],
    ],
  },
];

export function DifficultyPicker({
  value,
  onChange,
}: Readonly<{ value: Difficulty; onChange: (value: Difficulty) => void }>) {
  return (
    <fieldset className="difficulty-picker">
      <legend>Planning pressure</legend>
      <div className="difficulty-options">
        {difficulties.map((preset) => (
          <button
            type="button"
            key={preset.name}
            aria-pressed={value.name === preset.name}
            onClick={() => onChange({ ...preset })}
          >
            {preset.name}
          </button>
        ))}
      </div>
      <p>
        Every mode shows all enemy intents and exact damage. Story gives unlimited rewinds; Standard
        gives three; Exacting gives one and strengthens elites.
      </p>
      <details>
        <summary>Customize the five dimensions</summary>
        <div className="custom-settings">
          {dimensions.map(({ field, label, options }) => (
            <label key={field}>
              {label}
              <select
                value={value[field]}
                onChange={(event) =>
                  onChange({ ...value, name: "Custom", [field]: Number(event.target.value) })
                }
              >
                {options.map(([number, label]) => (
                  <option key={number} value={number}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </details>
    </fieldset>
  );
}

function deploymentLabel(session: Session, available: string[], id: string): string {
  if (!available.includes(id)) return "Joins at mission 6";
  return session.roster.includes(id) ? "Deployed · remove" : "Add to crew";
}

function SkillSelection({ session, onChange, id }: Props & { id: string }) {
  const tiers = unlockedTiers(session);
  function choose(tier: number, selected: string) {
    const existing = Array.from(
      { length: tiers },
      (_, index) =>
        session.skills[id]?.[index] ??
        skillChoices.find((skill) => skill.characterId === id && skill.tier === index + 1)!.id
    );
    existing[tier - 1] = selected;
    onChange({ ...session, skills: { ...session.skills, [id]: existing } });
  }
  return (
    <div className="skill-selection">
      {Array.from({ length: tiers }, (_, index) => index + 1).map((tier) => {
        const options = skillChoices.filter(
          (skill) => skill.characterId === id && skill.tier === tier
        );
        const selected = session.skills[id]?.[tier - 1] ?? options[0].id;
        return (
          <label key={tier}>
            Tier {tier}
            <select value={selected} onChange={(event) => choose(tier, event.target.value)}>
              {options.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} · {skill.branch}
                </option>
              ))}
            </select>
            <small>{selectable[selected].description}</small>
          </label>
        );
      })}
    </div>
  );
}

function Deployment({ session, onChange }: Props) {
  const available = availableRoster(session);
  function toggle(id: string) {
    const roster = session.roster.includes(id)
      ? session.roster.filter((entry) => entry !== id)
      : [...session.roster, id];
    if (roster.length <= 4) onChange({ ...session, roster });
  }
  return (
    <section aria-labelledby="deployment-title">
      <h2 id="deployment-title">Crew deployment · {session.roster.length}/4</h2>
      <p>
        Select four people. Choose skills freely between missions; each unlocked tier offers two
        alternatives.
      </p>
      <div className="deployment-grid">
        {characters.map((character) => (
          <article
            className={`deployment-card ${session.roster.includes(character.id) ? "selected" : ""}`}
            key={character.id}
          >
            <h3>{character.name}</h3>
            <p className="eyebrow">{character.role}</p>
            <p>{character.combatIdentity}</p>
            <button
              type="button"
              aria-pressed={session.roster.includes(character.id)}
              disabled={
                !available.includes(character.id) ||
                (!session.roster.includes(character.id) && session.roster.length === 4)
              }
              onClick={() => toggle(character.id)}
            >
              {deploymentLabel(session, available, character.id)}
            </button>
            {available.includes(character.id) && (
              <SkillSelection session={session} onChange={onChange} id={character.id} />
            )}
          </article>
        ))}
      </div>
      {unlockedTiers(session) === 0 && (
        <p className="muted">
          Skill tiers unlock after missions 2, 5, and 7. Everyone starts with their two core
          actions.
        </p>
      )}
    </section>
  );
}

export function Briefing({ session, onChange }: Props) {
  const definition = campaign[session.mission];
  const encounter = encounters[session.mission];
  function changeDifficulty(difficulty: Difficulty) {
    onChange({ ...session, difficulty });
  }
  return (
    <main className="campaign-flow">
      <p className="eyebrow">
        Sequence {session.mission + 1} / 10 ·{" "}
        {definition.act === "Epilogue" ? "Epilogue" : `Act ${definition.act}`}
      </p>
      <h1>{definition.title}</h1>
      <p className="briefing-text">{encounter.briefing}</p>
      <section className="mission-facts">
        <div>
          <h2>Your task</h2>
          <p>{definition.objective}</p>
        </div>
        <div>
          <h2>What to expect</h2>
          <p>
            {encounter.enemies.length
              ? `${encounter.enemies.length} enemies initially. ${encounter.deadline} rounds to complete the required objectives.`
              : "No combat. Take as long as you need."}
          </p>
          <p>
            Two AP per person. Inspect a tile and confirm each action. Enemy plans remain visible.
          </p>
        </div>
      </section>
      <Deployment session={session} onChange={onChange} />
      <DifficultyPicker value={session.difficulty} onChange={changeDifficulty} />
      <button
        type="button"
        className="primary deploy-button"
        disabled={session.roster.length !== 4}
        onClick={() => onChange(deploy(session))}
      >
        Begin {definition.title}
      </button>
      <details className="campaign-roadmap">
        <summary>Campaign progress · {session.completed.length}/10 sequences complete</summary>
        <ol>
          {campaign.map((mission) => (
            <li key={mission.id}>
              {session.completed.includes(mission.sequence) ? "✓" : "○"} {mission.title}
            </li>
          ))}
        </ol>
      </details>
    </main>
  );
}

export function Debrief({ session, onChange }: Props) {
  const encounter = encounters[session.mission];
  return (
    <main className="campaign-flow debrief">
      <p className="eyebrow">Crew Seven · field report</p>
      <h1>{campaign[session.mission].title}</h1>
      <p className="briefing-text">{encounter.resolution}</p>
      <h2>{session.mission === 9 ? "Submit your recommendation" : "What the crew does next"}</h2>
      <div className="story-choices">
        {encounter.choices.map(([flag, label, consequence]) => (
          <button type="button" key={flag} onClick={() => onChange(advance(session, flag))}>
            <strong>{label}</strong>
            <span>{consequence}</span>
          </button>
        ))}
      </div>
      {[2, 5, 7].includes(session.mission) && (
        <p className="unlock-notice">A new skill tier is available at the next deployment.</p>
      )}
    </main>
  );
}

export function Ending({ session }: Readonly<{ session: Session }>) {
  const accounts = epilogueAccounts(session.flags);
  const report = encounters[9].choices.find(([flag]) => session.flags.includes(flag));
  return (
    <main className="campaign-flow ending">
      <p className="eyebrow">Aftershape · campaign complete</p>
      <h1>A home, still changing.</h1>
      <p className="briefing-text">{report?.[2]}</p>
      <div className="ending-accounts">
        {characters.map((character) => (
          <article key={character.id}>
            <h2>{character.name}</h2>
            <p>{accounts[character.id]}</p>
          </article>
        ))}
      </div>
      <p className="closing-line">
        Ten sequences complete. Your choices and final report are saved on this device.
      </p>
      <p>
        Homeomorph · A Glass Frontier story. Code licensed under MIT. React, Vite, and the remaining
        dependency notices are listed in the repository lockfile and their packages.
      </p>
    </main>
  );
}

export function Welcome({ onStart }: Readonly<{ onStart: (difficulty: Difficulty) => void }>) {
  const [difficulty, setDifficulty] = useState<Difficulty>(difficulties[1]);
  return (
    <main className="campaign-flow welcome">
      <p className="eyebrow">A Glass Frontier tactical RPG</p>
      <h1>Homeomorph</h1>
      <p className="briefing-text">
        A rescue fleet has mistaken your home&apos;s transformation for its destruction. Lead four
        habitat workers through custody, resistance, and the Long Turn. Keep people safe, expose
        what was hidden, and preserve the right to leave.
      </p>
      <div className="welcome-rules">
        <p>
          <strong>No hit rolls.</strong> Preview the exact result of every action.
        </p>
        <p>
          <strong>No extermination orders.</strong> Repair, escort, recover, and open routes.
        </p>
        <p>
          <strong>No account.</strong> Progress saves in this browser. Export a backup whenever you
          need one.
        </p>
      </div>
      <DifficultyPicker value={difficulty} onChange={setDifficulty} />
      <button className="primary" type="button" onClick={() => onStart(difficulty)}>
        Start campaign
      </button>
    </main>
  );
}
