import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { DictionaryModal } from "./DictionaryModal";

type Ctx = { lookup: (word: string) => void };
const DictionaryContext = createContext<Ctx | null>(null);

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [word, setWord] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const lookup = useCallback((w: string) => {
    setWord(w);
    setOpen(true);
  }, []);

  return (
    <DictionaryContext.Provider value={{ lookup }}>
      {children}
      <DictionaryModal word={word} open={open} onOpenChange={setOpen} />
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const ctx = useContext(DictionaryContext);
  if (!ctx) throw new Error("useDictionary must be used within DictionaryProvider");
  return ctx;
}

/** Render English text where each word is tappable to open the dictionary modal. */
export function TappableText({ text, className }: { text: string; className?: string }) {
  const { lookup } = useDictionary();
  const parts = text.split(/(\s+)/);
  return (
    <span className={className} dir="ltr">
      {parts.map((p, i) =>
        /^\s+$/.test(p) ? (
          <span key={i}>{p}</span>
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => {
              const clean = p.replace(/[^A-Za-z'-]/g, "");
              if (clean) lookup(clean);
            }}
            className="hover:text-primary hover:underline underline-offset-4 transition-colors"
          >
            {p}
          </button>
        )
      )}
    </span>
  );
}
