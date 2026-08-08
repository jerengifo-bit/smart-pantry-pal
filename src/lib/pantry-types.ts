export type Qty = { kind: "enough" } | { kind: "count"; value: number; unit?: string };

export type PantryItem = {
  id: string;
  name: string;
  qty: Qty;
  expiresAt?: string | undefined; // ISO date
  emoji?: string | undefined;
};

export type MealType = "desayuno" | "almuerzo" | "cena" | "postre";

export type Recipe = {
  id: string;
  name: string;
  meal: MealType;
  minutes: number;
  image: string;
  main: string[];
  basics: string[];
  steps: string[];
  servings: number;
};

export type ShoppingItem = {
  id: string;
  name: string;
  bought: boolean;
  from?: string;
};

export type Profile = {
  name: string;
  servings: number;
  onboarded: boolean;
};

export function qtyLabel(q: Qty) {
  return q.kind === "enough" ? "suficiente" : `${q.value} ${q.unit ?? "unidades"}`;
}

export function daysUntil(iso?: string) {
  if (!iso) return null;
  const ms = new Date(iso + "T00:00:00").getTime() - new Date(new Date().toDateString()).getTime();
  return Math.round(ms / 86400000);
}

export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/s$/, "")
    .trim();
