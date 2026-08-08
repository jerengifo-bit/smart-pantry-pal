import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Package, Clock3, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { RecipeCard } from "@/components/RecipeCard";
import { usePantry } from "@/lib/pantry-store";
import { daysUntil } from "@/lib/pantry-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Despensa Inteligente — Cocina con lo que ya tienes" },
      {
        name: "description",
        content:
          "Registra tu despensa por voz y descubre qué puedes cocinar hoy con los ingredientes que ya tienes en casa.",
      },
      { property: "og:title", content: "Despensa Inteligente" },
      {
        property: "og:description",
        content: "Graba lo que tienes en casa y recibe recetas que puedes cocinar ya.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { pantry, recipes, missingFor, profile } = usePantry();
  const expiring = pantry.filter((p) => {
    const d = daysUntil(p.expiresAt);
    return d !== null && d <= 3;
  });
  const cookNow = recipes.filter((r) => missingFor(r).length === 0).slice(0, 3);
  const almost = recipes.filter((r) => {
    const m = missingFor(r).length;
    return m > 0 && m <= 2;
  });

  return (
    <AppLayout
      title={profile.name ? `Hola, ${profile.name} 👋` : "Hola 👋"}
      subtitle={`Cocinas para ${profile.servings} ${profile.servings === 1 ? "persona" : "personas"}`}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="surface-card p-4">
          <Package className="h-5 w-5 text-primary" />
          <p className="mt-3 font-display text-3xl font-semibold">{pantry.length}</p>
          <p className="text-sm text-muted-foreground">productos en tu despensa</p>
        </div>
        <div className="surface-card p-4">
          <Clock3 className="h-5 w-5 text-accent" />
          <p className="mt-3 font-display text-3xl font-semibold">{expiring.length}</p>
          <p className="text-sm text-muted-foreground">por vencer pronto</p>
        </div>
      </div>

      <Link
        to="/grabar"
        className="mt-4 flex items-center gap-4 rounded-3xl gradient-mic px-5 py-6 text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-[1.01]"
      >
        <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white/20">
          <span className="absolute inset-0 rounded-full bg-white/25 mic-pulse" />
          <Mic className="relative h-8 w-8" />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-xl font-semibold">Grabar lo que tengo</span>
          <span className="block text-sm text-primary-foreground/85">
            Dictá tus ingredientes y armamos tu despensa
          </span>
        </span>
        <ChevronRight className="ml-auto hidden h-6 w-6 shrink-0 sm:block" />
      </Link>

      {expiring.length > 0 && (
        <div className="mt-4 rounded-2xl border border-warning/50 bg-warning/15 px-4 py-3 text-sm">
          <span className="font-semibold">Usa pronto:</span>{" "}
          {expiring.map((e) => e.name).join(", ")}
        </div>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">Recetas sugeridas para hoy</h2>
          <Link to="/recetas" className="shrink-0 text-sm font-medium text-primary">
            Ver todas
          </Link>
        </div>
        {pantry.length === 0 ? (
          <EmptyPantry />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...cookNow, ...almost.slice(0, 1)].map((r) => (
              <RecipeCard key={r.id} recipe={r} missing={missingFor(r)} />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function EmptyPantry() {
  return (
    <div className="surface-card flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="text-4xl">🧺</span>
      <p className="font-medium">Tu despensa está vacía</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Grábate diciendo qué tienes en casa y te sugerimos recetas al instante.
      </p>
      <Link
        to="/grabar"
        className="mt-2 inline-flex items-center gap-2 rounded-full gradient-mic px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        <Mic className="h-4 w-4" /> Grabar ahora
      </Link>
    </div>
  );
}
