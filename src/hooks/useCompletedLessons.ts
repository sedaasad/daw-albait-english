import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "daw-albait-completed-lessons";

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useCompletedLessons() {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(read()));

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCompleted(new Set(read()));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = (next: Set<string>) => {
    setCompleted(new Set(next));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
  };

  const toggle = useCallback((id: string) => {
    const next = new Set(read());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persist(next);
  }, []);

  const markComplete = useCallback((id: string) => {
    const next = new Set(read());
    next.add(id);
    persist(next);
  }, []);

  const reset = useCallback(() => persist(new Set()), []);

  return { completed, toggle, markComplete, reset };
}
