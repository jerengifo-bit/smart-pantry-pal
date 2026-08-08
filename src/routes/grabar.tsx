import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Square, Loader2, Check, Trash2, Users } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePantry } from "@/lib/pantry-store";
import { mockVoiceResult } from "@/lib/mock-data";
import type { PantryItem } from "@/lib/pantry-types";
import { toast } from "sonner";

export const Route = createFileRoute("/grabar")({
  head: () => ({
    meta: [
      { title: "Grabar despensa por voz — Despensa Inteligente" },
      {
        name: "description",
        content: "Dicta en voz alta lo que tienes en casa y agrégalo a tu despensa en segundos.",
      },
      { property: "og:title", content: "Grabar despensa por voz" },
      { property: "og:description", content: "Registra tus ingredientes hablando, sin escribir." },
    ],
  }),
  component: RecordPage,
});

type Stage = "idle" | "recording" | "processing" | "review";
type Detected = { name: string; qty: string };

function RecordPage() {
  const { profile, addPantryItems } = usePantry();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("idle");
  const [servings, setServings] = useState(profile.servings);
  const [items, setItems] = useState<Detected[]>([]);

  const stop = () => {
    setStage("processing");
    setTimeout(() => {
      setItems(mockVoiceResult.map((v) => ({ name: v.name, qty: v.qty })));
      setStage("review");
    }, 1800);
  };

  const confirm = () => {
    const parsed: PantryItem[] = items
      .filter((i) => i.name.trim())
      .map((i, idx) => {
        const num = Number(i.qty);
        return {
          id: `p-${Date.now()}-${idx}`,
          name: i.name.trim(),
          qty: Number.isFinite(num) && i.qty.trim() !== "" ? { kind: "count", value: num } : { kind: "enough" },
        } as PantryItem;
      });
    addPantryItems(parsed);
    toast.success(`${parsed.length} productos agregados a tu despensa`);
    navigate({ to: "/despensa" });
  };

  return (
    <AppLayout title="Registro por voz" subtitle="Di en voz alta lo que tienes en casa">
      {stage === "idle" && (
        <div className="flex flex-col items-center">
          <div className="surface-card w-full p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-primary" /> ¿Para cuántas personas es esta vez?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setServings(n)}
                  className={`h-11 w-11 rounded-full border text-sm font-semibold transition-colors ${
                    servings === n
                      ? "border-transparent gradient-warm text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Por defecto usamos {profile.servings} (tu perfil). Cámbialo solo por esta vez.
            </p>
          </div>

          <button
            onClick={() => setStage("recording")}
            className="relative mt-10 grid h-40 w-40 place-items-center rounded-full gradient-mic text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-105"
          >
            <Mic className="h-14 w-14" />
          </button>
          <p className="mt-6 max-w-xs text-center text-sm text-muted-foreground">
            Ejemplo: “Tengo tomates, dos cebollas, arroz y cuatro huevos”.
          </p>
        </div>
      )}

      {stage === "recording" && (
        <div className="flex flex-col items-center pt-6">
          <div className="relative grid h-44 w-44 place-items-center">
            <span className="absolute h-32 w-32 rounded-full bg-primary/30 mic-pulse" />
            <span
              className="absolute h-32 w-32 rounded-full bg-accent/30 mic-pulse"
              style={{ animationDelay: "0.6s" }}
            />
            <span className="relative grid h-32 w-32 place-items-center rounded-full gradient-mic text-primary-foreground">
              <Mic className="h-12 w-12" />
            </span>
          </div>
          <p className="mt-6 font-display text-lg">Escuchando…</p>
          <div className="mt-4 flex h-10 items-end gap-1">
            {[6, 14, 22, 30, 18, 26, 10, 20, 32, 12].map((h, i) => (
              <span
                key={i}
                className="w-1.5 animate-pulse rounded-full bg-primary/70"
                style={{ height: h + "px", animationDelay: `${i * 90}ms` }}
              />
            ))}
          </div>
          <Button size="lg" variant="destructive" className="mt-8 rounded-full" onClick={stop}>
            <Square className="h-4 w-4" /> Detener
          </Button>
        </div>
      )}

      {stage === "processing" && (
        <div className="flex flex-col items-center py-24">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-6 font-display text-lg">Procesando tu audio…</p>
          <p className="text-sm text-muted-foreground">Detectando productos y cantidades</p>
        </div>
      )}

      {stage === "review" && (
        <div>
          <p className="text-sm text-muted-foreground">
            Detectamos estos productos para {servings}{" "}
            {servings === 1 ? "persona" : "personas"}. Puedes corregirlos antes de confirmar.
          </p>
          <ul className="mt-4 space-y-2">
            {items.map((it, idx) => (
              <li key={idx} className="surface-card grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 p-3">
                <Input
                  value={it.name}
                  onChange={(e) =>
                    setItems((p) => p.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))
                  }
                  className="min-w-0"
                />
                <Input
                  value={it.qty}
                  onChange={(e) =>
                    setItems((p) => p.map((x, i) => (i === idx ? { ...x, qty: e.target.value } : x)))
                  }
                  className="w-28 shrink-0"
                  placeholder="suficiente"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Quitar ${it.name}`}
                  onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            className="mt-2"
            onClick={() => setItems((p) => [...p, { name: "", qty: "" }])}
          >
            + Agregar otro producto
          </Button>
          <Button size="lg" className="mt-6 w-full" onClick={confirm}>
            <Check className="h-4 w-4" /> Confirmar y agregar a mi despensa
          </Button>
        </div>
      )}
    </AppLayout>
  );
}
