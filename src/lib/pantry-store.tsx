import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { mockPantry, mockRecipes, mockShopping } from "./mock-data";
import { norm, type PantryItem, type Profile, type Recipe, type ShoppingItem } from "./pantry-types";

type Store = {
  ready: boolean;
  profile: Profile;
  setProfile: (p: Profile) => void;
  pantry: PantryItem[];
  addPantryItems: (items: PantryItem[]) => void;
  updatePantryItem: (id: string, patch: Partial<PantryItem>) => void;
  removePantryItem: (id: string) => void;
  shopping: ShoppingItem[];
  addShopping: (names: string[], from?: string) => void;
  toggleShopping: (id: string) => void;
  removeShopping: (id: string) => void;
  recipes: Recipe[];
  missingFor: (r: Recipe) => string[];
};

const KEY = "despensa-inteligente-v1";
const Ctx = createContext<Store | null>(null);

const defaultProfile: Profile = { name: "", servings: 2, onboarded: false };

export function PantryProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfileState] = useState<Profile>(defaultProfile);
  const [pantry, setPantry] = useState<PantryItem[]>(mockPantry);
  const [shopping, setShopping] = useState<ShoppingItem[]>(mockShopping);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.profile) setProfileState(data.profile);
        if (data.pantry) setPantry(data.pantry);
        if (data.shopping) setShopping(data.shopping);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify({ profile, pantry, shopping }));
  }, [ready, profile, pantry, shopping]);

  const missingFor = useCallback(
    (r: Recipe) => {
      const have = new Set(pantry.map((p) => norm(p.name)));
      return r.main.filter((m) => !have.has(norm(m)));
    },
    [pantry],
  );

  const value = useMemo<Store>(
    () => ({
      ready,
      profile,
      setProfile: setProfileState,
      pantry,
      addPantryItems: (items) =>
        setPantry((prev) => {
          const next = [...prev];
          for (const it of items) {
            const i = next.findIndex((p) => norm(p.name) === norm(it.name));
            if (i >= 0) next[i] = { ...next[i], ...it, id: next[i].id };
            else next.push(it);
          }
          return next;
        }),
      updatePantryItem: (id, patch) =>
        setPantry((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      removePantryItem: (id) => setPantry((prev) => prev.filter((p) => p.id !== id)),
      shopping,
      addShopping: (names, from) =>
        setShopping((prev) => {
          const next = [...prev];
          for (const n of names) {
            if (next.some((s) => norm(s.name) === norm(n))) continue;
            next.push({ id: `s-${Date.now()}-${n}`, name: n, bought: false, from });
          }
          return next;
        }),
      toggleShopping: (id) =>
        setShopping((prev) =>
          prev.map((s) => {
            if (s.id !== id) return s;
            const bought = !s.bought;
            if (bought) {
              setPantry((pp) =>
                pp.some((p) => norm(p.name) === norm(s.name))
                  ? pp
                  : [...pp, { id: `p-${Date.now()}-${s.name}`, name: s.name, qty: { kind: "enough" }, emoji: "🛒" }],
              );
            }
            return { ...s, bought };
          }),
        ),
      removeShopping: (id) => setShopping((prev) => prev.filter((s) => s.id !== id)),
      recipes: mockRecipes,
      missingFor,
    }),
    [ready, profile, pantry, shopping, missingFor],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePantry() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePantry must be used inside PantryProvider");
  return ctx;
}
