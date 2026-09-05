import { Link } from "@tanstack/react-router";
import { Check, Clock3, ShoppingBasket } from "lucide-react";
import type { Recipe } from "@/lib/pantry-types";
import { Button } from "@/components/ui/button";

export function RecipeCard({
  recipe,
  missing,
  onAddMissing,
}: {
  recipe: Recipe;
  missing: string[];
  onAddMissing?: (names: string[]) => void;
}) {
  const ready = missing.length === 0;
  return (
    <article className="surface-card group overflow-hidden transition-shadow hover:shadow-[var(--shadow-lift)]">
      <Link to="/recetas/$id" params={{ id: recipe.id }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.name}
            loading="lazy"
            width={768}
            height={576}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold capitalize">
            {recipe.meal}
          </span>
          {ready && (
            <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-success text-success-foreground shadow-[var(--shadow-soft)]">
              <Check className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold leading-snug">{recipe.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock3 className="h-4 w-4" /> {recipe.minutes} min · {recipe.servings} porciones
          </p>
          {!ready && (
            <p className="mt-3 rounded-xl bg-accent/15 px-3 py-2 text-sm text-foreground">
              <span className="font-semibold">Te falta:</span> {missing.join(", ")}
            </p>
          )}
        </div>
      </Link>
      {!ready && onAddMissing && (
        <div className="px-4 pb-4">
          <Button variant="secondary" className="w-full" onClick={() => onAddMissing(missing)}>
            <ShoppingBasket className="h-4 w-4" /> Agregar faltantes a mi lista
          </Button>
        </div>
      )}
    </article>
  );
}
