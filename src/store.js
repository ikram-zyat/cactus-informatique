import { useEffect, useState } from "react";

// État sauvegardé dans le navigateur (localStorage) : les données restent après un rechargement.
export function useStore(key, seed) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    return seed;
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}
