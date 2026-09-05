import { create } from "zustand";
import { useEffect } from "react";
import { mockRecipes } from "./mock-data";
import {
  norm,
  type PantryItem,
  type Profile,
  type Recipe,
  type ShoppingItem,
} from "./pantry-types";
import { supabase } from "./supabase";

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

  // Para inicializar desde la base de datos
  _init: (profile: Profile, pantry: PantryItem[], shopping: ShoppingItem[]) => void;
};

const defaultProfile: Profile = { name: "", servings: 2, onboarded: false };

export const usePantry = create<Store>()((set, get) => ({
  ready: false,
  profile: defaultProfile,

  _init: (profile, pantry, shopping) => set({ profile, pantry, shopping, ready: true }),

  setProfile: async (profile) => {
    set({ profile });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      await supabase.from("profiles").upsert({
        id: session.user.id,
        name: profile.name,
        default_servings: profile.servings,
      });
    }
  },

  pantry: [],
  addPantryItems: async (items) => {
    set((state) => {
      const next = [...state.pantry];
      for (const it of items) {
        const i = next.findIndex((p) => norm(p.name) === norm(it.name));
        if (next[i]) next[i] = { ...next[i], ...it, id: next[i].id };
        else next.push(it);
      }
      return { pantry: next };
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const toInsert = items.map((it) => ({
      id: it.id,
      user_id: session.user.id,
      name: it.name,
      qty_kind: it.qty.kind,
      qty_value: it.qty.kind === "count" ? it.qty.value : null,
      emoji: it.emoji,
      expires_at: it.expiresAt,
    }));
    await supabase.from("pantry_items").upsert(toInsert);
  },

  updatePantryItem: async (id, patch) => {
    set((state) => ({
      pantry: state.pantry.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const item = get().pantry.find((p) => p.id === id);
    if (item) {
      await supabase
        .from("pantry_items")
        .update({
          name: item.name,
          qty_kind: item.qty.kind,
          qty_value: item.qty.kind === "count" ? item.qty.value : null,
          expires_at: item.expiresAt,
        })
        .eq("id", id);
    }
  },

  removePantryItem: async (id) => {
    set((state) => ({
      pantry: state.pantry.filter((p) => p.id !== id),
    }));
    await supabase.from("pantry_items").delete().eq("id", id);
  },

  shopping: [],
  addShopping: async (names, from) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const newItems: ShoppingItem[] = [];

    set((state) => {
      const next = [...state.shopping];
      for (const n of names) {
        if (next.some((s) => norm(s.name) === norm(n))) continue;
        const it = {
          id: `s-${Date.now()}-${n}`,
          name: n,
          bought: false,
          ...(from ? { from } : {}),
        };
        next.push(it);
        newItems.push(it);
      }
      return { shopping: next };
    });

    if (session && newItems.length > 0) {
      const toInsert = newItems.map((it) => ({
        id: it.id,
        user_id: session.user.id,
        name: it.name,
        bought: it.bought,
        from_recipe: it.from,
      }));
      await supabase.from("shopping_items").insert(toInsert);
    }
  },

  toggleShopping: async (id) => {
    let movedToPantry: PantryItem | null = null;

    set((state) => {
      let updatedPantry = [...state.pantry];
      const updatedShopping = state.shopping.map((s) => {
        if (s.id !== id) return s;
        const bought = !s.bought;
        if (bought && !updatedPantry.some((p) => norm(p.name) === norm(s.name))) {
          movedToPantry = {
            id: `p-${Date.now()}-${s.name}`,
            name: s.name,
            qty: { kind: "enough" },
            emoji: "🛒",
          };
          updatedPantry.push(movedToPantry);
        }
        return { ...s, bought };
      });
      return { shopping: updatedShopping, pantry: updatedPantry };
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const item = get().shopping.find((s) => s.id === id);
    if (item) {
      await supabase.from("shopping_items").update({ bought: item.bought }).eq("id", id);
    }

    if (movedToPantry) {
      const item = movedToPantry as PantryItem;
      await supabase.from("pantry_items").insert({
        id: item.id,
        user_id: session.user.id,
        name: item.name,
        qty_kind: item.qty.kind,
        qty_value: null,
        emoji: item.emoji,
      });
    }
  },

  removeShopping: async (id) => {
    set((state) => ({
      shopping: state.shopping.filter((s) => s.id !== id),
    }));
    await supabase.from("shopping_items").delete().eq("id", id);
  },

  recipes: mockRecipes,
  missingFor: (r) => {
    const state = get();
    const have = new Set(state.pantry.map((p) => norm(p.name)));
    return r.main.filter((m) => !have.has(norm(m)));
  },
}));

export function PantryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const loadData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        usePantry.getState()._init(defaultProfile, [], []);
        return;
      }

      // Cargar datos de Supabase
      const [prof, pant, shop] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("pantry_items").select("*").eq("user_id", session.user.id),
        supabase.from("shopping_items").select("*").eq("user_id", session.user.id),
      ]);

      const profileData: Profile = prof.data
        ? { name: prof.data.name || "", servings: prof.data.default_servings || 2, onboarded: true }
        : defaultProfile;

      const pantryData: PantryItem[] = ((pant.data as any[]) || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        qty:
          p.qty_kind === "count"
            ? { kind: "count", value: Number(p.qty_value) }
            : { kind: "enough" },
        emoji: p.emoji || "🥫",
        expiresAt: p.expires_at || undefined,
      }));

      const shoppingData: ShoppingItem[] = ((shop.data as any[]) || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        bought: s.bought,
        from: s.from_recipe || undefined,
      }));

      usePantry.getState()._init(profileData, pantryData, shoppingData);
    };

    loadData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadData();
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
