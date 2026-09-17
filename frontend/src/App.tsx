import { useState } from "react";
import { Briefing, Debrief, Ending, Welcome } from "./components/CampaignFlow";
import { TacticalGame } from "./components/TacticalGame";
import { useCampaign } from "./components/useCampaign";
import { newSession } from "./game/campaign";
import type { Difficulty, Session } from "./game/types";
import { exportSession } from "./storage/saves";
import { parseSession } from "./storage/validate";
import "./App.css";

function Screen({
  session,
  onChange,
}: Readonly<{ session: Session; onChange: (session: Session) => void }>) {
  if (session.stage === "briefing") return <Briefing session={session} onChange={onChange} />;
  if (session.stage === "debrief") return <Debrief session={session} onChange={onChange} />;
  if (session.stage === "ending") return <Ending session={session} />;
  if (session.battle)
    return (
      <TacticalGame
        key={session.mission}
        session={session}
        battle={session.battle}
        onChange={onChange}
      />
    );
  return (
    <p role="alert">
      This mission snapshot is unavailable. Import a backup or start a new campaign.
    </p>
  );
}

interface ToolProps {
  session: Session | null;
  loading: boolean;
  onImport: (file: File | undefined) => Promise<void>;
  onNew: () => void;
}

function CampaignTools({ session, loading, onImport, onNew }: ToolProps) {
  return (
    <header className="app-bar">
      <span className="wordmark">HOMEOMORPH</span>
      <nav aria-label="Campaign tools">
        {session && (
          <button type="button" onClick={() => exportSession(session)}>
            Export save
          </button>
        )}
        <label className="import-save">
          Import save
          <input
            type="file"
            accept="application/json,.json"
            aria-label="Import save"
            disabled={loading}
            onChange={(event) => {
              void onImport(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        {session && (
          <button type="button" onClick={onNew}>
            New campaign
          </button>
        )}
        <label className="text-size">
          Text size
          <select
            defaultValue="normal"
            aria-label="Text size"
            onChange={(event) => {
              document.documentElement.dataset.textSize = event.target.value;
            }}
          >
            <option value="normal">Normal</option>
            <option value="large">Large</option>
          </select>
        </label>
      </nav>
    </header>
  );
}

function Confirmation({
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: Readonly<{
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}>) {
  return (
    <section className="confirmation app-confirm" role="alertdialog" aria-label={title}>
      <h2>{title}</h2>
      <p>{description}</p>
      <button type="button" onClick={onConfirm}>
        {confirmLabel}
      </button>
      <button type="button" onClick={onCancel}>
        {cancelLabel}
      </button>
    </section>
  );
}

function EntryScreen({
  loading,
  session,
  onChange,
}: Readonly<{ loading: boolean; session: Session | null; onChange: (session: Session) => void }>) {
  function start(difficulty: Difficulty) {
    onChange(newSession(difficulty));
  }
  if (loading)
    return (
      <main className="loading" role="status">
        Reading local progress…
      </main>
    );
  if (session) return <Screen session={session} onChange={onChange} />;
  return <Welcome onStart={start} />;
}

function App() {
  const { session, setSession, loading, storageMessage, setStorageMessage } = useCampaign();
  const [confirmNew, setConfirmNew] = useState(false);
  const [pendingImport, setPendingImport] = useState<Session | null>(null);
  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error("This file is too large to be a Homeomorph save.");
      setPendingImport(parseSession(await file.text()));
    } catch (error) {
      setStorageMessage(error instanceof Error ? error.message : "Could not import the save.");
    }
  }
  function confirmImport() {
    if (pendingImport) setSession(pendingImport);
    setPendingImport(null);
  }
  function startNew() {
    setSession(newSession());
    setConfirmNew(false);
  }
  function openNew() {
    setConfirmNew(true);
  }
  function cancelNew() {
    setConfirmNew(false);
  }
  function cancelImport() {
    setPendingImport(null);
  }
  return (
    <>
      <CampaignTools session={session} loading={loading} onImport={importFile} onNew={openNew} />
      <p className="save-status" role="status">
        {storageMessage}
      </p>
      {confirmNew && (
        <Confirmation
          title="Replace this campaign?"
          description="Export a save first if you want to keep it. The new campaign replaces local progress."
          confirmLabel="Start new campaign"
          cancelLabel="Keep current campaign"
          onConfirm={startNew}
          onCancel={cancelNew}
        />
      )}
      {pendingImport && (
        <Confirmation
          title="Import this campaign?"
          description={
            "Sequence " +
            (pendingImport.mission + 1) +
            " · " +
            pendingImport.completed.length +
            " complete. This replaces current local progress."
          }
          confirmLabel="Use imported save"
          cancelLabel="Cancel import"
          onConfirm={confirmImport}
          onCancel={cancelImport}
        />
      )}
      <EntryScreen loading={loading} session={session} onChange={setSession} />
      <footer className="app-footer">
        Local campaign · Deterministic tactics · Gray-box build
      </footer>
    </>
  );
}

export { App };
