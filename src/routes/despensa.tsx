import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Mic } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePantry } from "@/lib/pantry-store";
import { daysUntil, qtyLabel, type PantryItem } from "@/lib/pantry-types";
import { toast } from "sonner";

export const Route = createFileRoute("/despensa")({
  head: () => ({
    meta: [
      { title: "Mi despensa — Despensa Inteligente" },
      {
        name: "description",
        content: "Consulta, edita y organiza todos los productos que tienes en casa.",
      },
      { property: "og:title", content: "Mi despensa" },
      { property: "og:description", content: "Todos tus ingredientes en un solo lugar." },
    ],
  }),
  component: PantryPage,
});

type Draft = { name: string; qty: string; expiresAt: string };

function PantryPage() {
  const { pantry, addPantryItems, updatePantryItem, removePantryItem } = usePantry();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PantryItem | null>(null);
  const [draft, setDraft] = useState<Draft>({ name: "", qty: "", expiresAt: "" });

  const openNew = () => {
    setEditing(null);
    setDraft({ name: "", qty: "", expiresAt: "" });
    setOpen(true);
  };

  const openEdit = (item: PantryItem) => {
    setEditing(item);
    setDraft({
      name: item.name,
      qty: item.qty.kind === "count" ? String(item.qty.value) : "",
      expiresAt: item.expiresAt ?? "",
    });
    setOpen(true);
  };

  const save = () => {
    if (!draft.name.trim()) return;
    const num = Number(draft.qty);
    const qty: PantryItem["qty"] =
      draft.qty.trim() !== "" && Number.isFinite(num) ? { kind: "count", value: num } : { kind: "enough" };
    if (editing) {
      updatePantryItem(editing.id, {
        name: draft.name.trim(),
        qty,
        ...(draft.expiresAt ? { expiresAt: draft.expiresAt } : { expiresAt: undefined }),
      });
      toast.success("Producto actualizado");
    } else {
      addPantryItems([
        {
          id: `p-${Date.now()}`,
          name: draft.name.trim(),
          qty,
          emoji: "🥫",
          ...(draft.expiresAt ? { expiresAt: draft.expiresAt } : {}),
        },
      ]);
      toast.success(`${draft.name.trim()} agregado a tu despensa`);
    }
    setOpen(false);
  };

  return (
    <AppLayout title="Mi despensa" subtitle={`${pantry.length} productos registrados`}>
      {pantry.length === 0 ? (
        <div className="surface-card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="text-4xl">🧺</span>
          <p className="font-medium">Tu despensa está vacía</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Grábate diciendo qué tienes en casa y lo registramos por ti.
          </p>
          <Link
            to="/grabar"
            className="mt-2 inline-flex items-center gap-2 rounded-full gradient-mic px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Mic className="h-4 w-4" /> Grabar ahora
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {pantry.map((item) => {
            const d = daysUntil(item.expiresAt);
            const soon = d !== null && d <= 3;
            return (
              <li key={item.id} className="surface-card flex items-center gap-3 p-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-xl">
                  {item.emoji ?? "🥫"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{qtyLabel(item.qty)}</p>
                  {d !== null && (
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        soon
                          ? "bg-warning/25 text-warning-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {d < 0 ? "Vencido" : d === 0 ? "Vence hoy" : `Vence en ${d} días`}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => openEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Eliminar"
                    onClick={() => {
                      removePantryItem(item.id);
                      toast(`${item.name} eliminado`);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button
        onClick={openNew}
        aria-label="Agregar producto manualmente"
        className="fixed bottom-20 right-5 z-30 grid h-14 w-14 place-items-center rounded-full gradient-warm text-primary-foreground shadow-[var(--shadow-lift)] md:bottom-8 md:right-8"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar producto" : "Agregar producto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Ej. Lentejas"
              />
            </div>
            <div>
              <Label htmlFor="cantidad">Cantidad (vacío = suficiente)</Label>
              <Input
                id="cantidad"
                value={draft.qty}
                onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value }))}
                placeholder="2"
                inputMode="numeric"
              />
            </div>
            <div>
              <Label htmlFor="vence">Fecha de vencimiento (opcional)</Label>
              <Input
                id="vence"
                type="date"
                value={draft.expiresAt}
                onChange={(e) => setDraft((d) => ({ ...d, expiresAt: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
