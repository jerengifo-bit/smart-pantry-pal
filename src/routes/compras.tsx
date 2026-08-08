import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { usePantry } from "@/lib/pantry-store";
import { toast } from "sonner";

export const Route = createFileRoute("/compras")({
  head: () => ({
    meta: [
      { title: "Lista de compras — Despensa Inteligente" },
      {
        name: "description",
        content: "Lo que te falta comprar, listo para el mercado. Al marcarlo pasa a tu despensa.",
      },
      { property: "og:title", content: "Lista de compras" },
      { property: "og:description", content: "Marca lo comprado y se agrega solo a tu despensa." },
    ],
  }),
  component: ShoppingPage,
});

function ShoppingPage() {
  const { shopping, toggleShopping, removeShopping, addShopping } = usePantry();
  const [name, setName] = useState("");

  const pending = shopping.filter((s) => !s.bought);
  const done = shopping.filter((s) => s.bought);

  const add = () => {
    if (!name.trim()) return;
    addShopping([name.trim()]);
    setName("");
  };

  return (
    <AppLayout title="Lista de compras" subtitle={`${pending.length} pendientes`}>
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Agregar producto…"
          className="min-w-0 flex-1"
        />
        <Button onClick={add} className="shrink-0">
          <Plus className="h-4 w-4" /> Agregar
        </Button>
      </div>

      {shopping.length === 0 ? (
        <div className="surface-card mt-6 flex flex-col items-center gap-2 px-6 py-12 text-center">
          <span className="text-4xl">🛒</span>
          <p className="font-medium">Tu lista está vacía</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Agrega los faltantes desde una receta y aparecerán aquí.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {[...pending, ...done].map((s) => (
            <li key={s.id} className="surface-card flex items-center gap-3 p-3">
              <Checkbox
                id={s.id}
                checked={s.bought}
                onCheckedChange={() => {
                  toggleShopping(s.id);
                  if (!s.bought) toast.success(`✅ ${s.name} agregado a tu despensa`);
                }}
              />
              <label htmlFor={s.id} className="min-w-0 flex-1 cursor-pointer">
                <span
                  className={`block truncate font-medium ${s.bought ? "text-muted-foreground line-through" : ""}`}
                >
                  {s.name}
                </span>
                {s.from ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    para “{s.from}”
                  </span>
                ) : null}
              </label>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Quitar ${s.name}`}
                className="shrink-0"
                onClick={() => removeShopping(s.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
}
