import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { RecipeCard } from "@/components/RecipeCard";
import { usePantry } from "@/lib/pantry-store";
import type { MealType } from "@/lib/pantry-types";
import { toast } from "sonner";

export const Route = createFileRoute("/recetas/")({
  head: () => ({
    meta: [
      { title: "Recetas sugeridas — Despensa Inteligente" },
      {
        name: "description",
        content:
          "Descubre qué puedes cocinar ya con tu despensa y qué recetas necesitan solo un par de ingredientes más.",
      },
      { property: "og:title", content: "Recetas sugeridas" },
      { property: "og:description", content: "Cocina con lo que ya tienes en casa." },
    ],
  }),
  component: RecipesPage,
});

const filters: Array<{ value: MealType | "todas"; label: string }> = [
  { value: "todas", label: "Todas" },
  { value: "desayuno", label: "Desayuno" },
  { value: "almuerzo", label: "Almuerzo" },
  { value: "cena", label: "Cena" },
  { value: "postre", label: "Postre" },
];

function RecipesPage() {
  const { recipes, missingFor, addShopping } = usePantry();
  const [filter, setFilter] = useState<MealType | "todas">("todas");

  const visible = recipes.filter((r) => filter === "todas" || r.meal === filter);
  const ready = visible.filter((r) => missingFor(r).length === 0);
  const almost = visible.filter((r) => missingFor(r).length > 0);

  const addMissing = (names: string[], from: string) => {
    addShopping(names, from);
    toast.success("Agregado a tu lista de compras", { description: names.join(", ") });
  };

  return (
    <AppLayout title="Recetas" subtitle="Según lo que hay en tu despensa">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.value
                ? "gradient-warm text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Puedes cocinar ya</h2>
        <p className="text-sm text-muted-foreground">Tienes todos los ingredientes</p>
        {ready.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
            Aún no hay recetas completas con esta selección.
          </p>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {ready.map((r) => (
              <RecipeCard key={r.id} recipe={r} missing={[]} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-9">
        <h2 className="text-lg font-semibold">Te falta poco</h2>
        <p className="text-sm text-muted-foreground">Con un par de compras más las puedes hacer</p>
        {almost.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
            Nada pendiente por aquí.
          </p>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {almost.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                missing={missingFor(r)}
                onAddMissing={(names) => addMissing(names, r.name)}
              />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
