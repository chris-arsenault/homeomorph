import { useState } from "react";
import { campaign } from "./content/campaign";
import { characters } from "./content/characters";
import { enemies } from "./content/enemies";
import { skillChoices } from "./content/skills";
import type { CampaignAct } from "./content/types";
import "./App.css";

const acts: readonly CampaignAct[] = ["I", "II", "III", "Epilogue"];

function ActPanel({ act }: Readonly<{ act: CampaignAct }>) {
  const missions = campaign.filter((mission) => mission.act === act);

  return (
    <section className="act-panel" aria-labelledby={`act-${act}`}>
      <p className="eyebrow">{act === "Epilogue" ? act : `Act ${act}`}</p>
      <h3 id={`act-${act}`}>{missions.map((mission) => mission.title).join(" · ")}</h3>
      <ol>
        {missions.map((mission) => (
          <li key={mission.id}>
            <span>{mission.sequence}</span>
            <div>
              <strong>{mission.title}</strong>
              <p>{mission.objective}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function RosterPanel() {
  return (
    <section className="reference-section" aria-labelledby="roster-title">
      <header>
        <p className="eyebrow">Five people · four deploy</p>
        <h2 id="roster-title">Turnward Crew Seven</h2>
      </header>
      <div className="card-grid">
        {characters.map((character) => (
          <article className="person-card" key={character.id}>
            <p className="role">{character.role}</p>
            <h3>{character.name}</h3>
            <p>{character.combatIdentity}</p>
            <small>{character.arc}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function OppositionPanel() {
  return (
    <section className="reference-section opposition" aria-labelledby="opposition-title">
      <header>
        <p className="eyebrow">One expedition · eight readable roles</p>
        <h2 id="opposition-title">The Safekeeping</h2>
      </header>
      <div className="enemy-list">
        {enemies.map((enemy) => (
          <article key={enemy.id}>
            <h3>{enemy.name}</h3>
            <p>{enemy.counterplay}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Hero() {
  return (
    <header className="hero">
      <nav aria-label="Design reference">
        <span>HOMEOMORPH</span>
        <a href="https://github.com/chris-arsenault/homeomorph">Repository</a>
      </nav>
      <div className="hero-copy">
        <p className="eyebrow">A Glass Frontier story · Design foundation</p>
        <h1>A home can change shape without becoming less itself.</h1>
        <p className="lede">
          During Nacre&apos;s Long Turn, a rescue society mistakes transformation for collapse and
          makes survival compulsory. Five local workers fight for the time to choose.
        </p>
        <dl>
          <div>
            <dt>Format</dt>
            <dd>Deterministic tactical RPG</dd>
          </div>
          <div>
            <dt>Campaign</dt>
            <dd>9 missions + epilogue</dd>
          </div>
          <div>
            <dt>Target</dt>
            <dd>6–8 hours</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

function CampaignPanel() {
  return (
    <section className="campaign" aria-labelledby="campaign-title">
      <header>
        <p className="eyebrow">A complete dramatic spine</p>
        <h2 id="campaign-title">Contact, custody, the Turn, and what remains</h2>
      </header>
      <div className="acts">
        {acts.map((act) => (
          <ActPanel act={act} key={act} />
        ))}
      </div>
    </section>
  );
}

function CombatContract() {
  return (
    <section className="combat-contract" aria-labelledby="combat-title">
      <div>
        <p className="eyebrow">Combat contract</p>
        <h2 id="combat-title">No hidden arithmetic.</h2>
      </div>
      <ul>
        <li>Two action points per activation</li>
        <li>Exact outcomes before commitment</li>
        <li>Enemy intent shown before resolution</li>
        <li>Habitat shifts previewed one round ahead</li>
        <li>Objectives beyond defeating everyone</li>
        <li>Incapacitation is the default defeat state</li>
      </ul>
      <p className="skill-count">
        {skillChoices.length} authored skill choices across five bounded trees.
      </p>
    </section>
  );
}

function App() {
  const [showOpposition, setShowOpposition] = useState(false);

  return (
    <main>
      <Hero />

      <section className="promise" aria-labelledby="promise-title">
        <p className="eyebrow">The production promise</p>
        <h2 id="promise-title">Familiar tactics. One strange place, understood deeply.</h2>
        <p>
          Two actions. Exact damage. Visible enemy intentions. Authored maps that change at known
          moments. The novelty lives in Nacre and its people—not in rules that need endless tuning.
        </p>
      </section>

      <CampaignPanel />

      <RosterPanel />
      <CombatContract />

      <div className="opposition-toggle">
        <button type="button" onClick={() => setShowOpposition((visible) => !visible)}>
          {showOpposition ? "Hide enemy reference" : "Show enemy reference"}
        </button>
      </div>
      {showOpposition && <OppositionPanel />}

      <footer>
        <p>Design is the source of truth. The build is its typed reference surface.</p>
        <p>MIT · 2026</p>
      </footer>
    </main>
  );
}

export { App };
