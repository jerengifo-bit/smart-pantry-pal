import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock3, ShoppingBasket, Users, X } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { usePantry } from "@/lib/pantry-store";
import { norm } from "@/lib/pantry-types";
import { toast } from "sonner";

export const Route = createFileRoute("/recetas/$id")({
  head: () => ({
    meta: [
      { title: "Detalle de receta — Despensa Inteligente" },
      {
        name: "description",
        content: "Ingredientes, ingredientes básicos y pasos de preparación de tu receta sugerida.",
      },
      { property: "og:title", content: "Detalle de receta" },
      { property: "og:description", content: "Ingredientes y pasos paso a paso." },
    ],
  }),
  component: RecipeDetail,
});

function RecipeDetail() {
  const { id } = Route.useParams();
  const { recipes, pantry, missingFor, addShopping } = usePantry();
  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <AppLayout title="Receta no encontrada">
        <Link to="/recetas" className="text-primary">
          Volver a recetas
        </Link>
      </AppLayout>
    );
  }

  const have = new Set(pantry.map((p) => norm(p.name)));
  const missing = missingFor(recipe);

  return (
    <AppLayout title={recipe.name} subtitle={`${recipe.meal} · ${recipe.minutes} min`}>
      <Link
        to="/recetas"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <img
        src={recipe.image}
        alt={recipe.name}
        width={768}
        height={576}
        className="aspect-[16/9] w-full rounded-2xl object-cover shadow-[var(--shadow-soft)]"
      />

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
          <Clock3 className="h-4 w-4" /> {recipe.minutes} min
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
          <Users className="h-4 w-4" /> {recipe.servings} porciones
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
            missing.length === 0 ? "bg-success/20 text-foreground" : "bg-accent/20 text-foreground"
          }`}
        >
          {missing.length === 0 ? "Tienes todo" : `Te faltan ${missing.length}`}
        </span>
      </div>

      <section className="mt-7">
        <h2 className="text-lg font-semibold">Ingredientes principales</h2>
        <ul className="mt-3 space-y-2">
          {recipe.main.map((ing) => {
            const ok = have.has(norm(ing));
            return (
              <li key={ing} className="surface-card flex items-center gap-3 px-4 py-3">
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                    ok ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                </span>
                <span className={ok ? "font-medium" : "font-medium text-muted-foreground"}>
                  {ing}
                </span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {ok ? "en tu despensa" : "te falta"}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
          Básicos (asumimos que los tienes)
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {recipe.basics.map((b) => (
            <span
              key={b}
              className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground"
            >
              {b}
            </span>
          ))}
        </div>

        {missing.length > 0 && (
          <Button
            className="mt-5 w-full"
            onClick={() => {
              addShopping(missing, recipe.name);
              toast.success("Agregado a tu lista de compras", { description: missing.join(", ") });
            }}
          >
            <ShoppingBasket className="h-4 w-4" /> Agregar faltantes a mi lista de compras
          </Button>
        )}
      </section>

      <section className="mt-9">
        <h2 className="text-lg font-semibold">Preparación</h2>
        <ol className="mt-3 space-y-3">
          {recipe.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full gradient-warm text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <p className="pt-0.5 text-sm leading-relaxed">{s}</p>
            </li>
          ))}
        </ol>
      </section>
    </AppLayout>
  );
}
