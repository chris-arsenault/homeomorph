import { useEffect, useRef, useState } from "react";
import type { Session } from "../game/types";
import { loadSession, saveSession } from "../storage/saves";

export function useCampaign() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [storageMessage, setStorageMessage] = useState("Progress stays on this device.");
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let mounted = true;
    loadSession()
      .then((saved) => {
        if (mounted) {
          setSession(saved);
          setLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          setStorageMessage(error instanceof Error ? error.message : "Could not read your save.");
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (loading || !session) return;
    let current = true;
    queue.current = queue.current
      .catch(() => {})
      .then(async () => {
        try {
          const message = await saveSession(session);
          if (current) setStorageMessage(message);
        } catch (error) {
          if (current)
            setStorageMessage(
              error instanceof Error ? error.message : "Save failed. Export a backup."
            );
        }
      });
    return () => {
      current = false;
    };
  }, [session, loading]);
  return { session, setSession, loading, storageMessage, setStorageMessage };
}
