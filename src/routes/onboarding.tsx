import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Carrot, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePantry } from "@/lib/pantry-store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Configura tu perfil — Despensa Inteligente" },
      {
        name: "description",
        content: "Cuéntanos tu nombre y para cuántas personas cocinas normalmente.",
      },
      { property: "og:title", content: "Configura tu perfil" },
      { property: "og:description", content: "Personaliza tus recetas en 20 segundos." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { profile, setProfile } = usePantry();
  const navigate = useNavigate();
  const [name, setName] = useState(profile.name);
  const [servings, setServings] = useState(profile.servings || 2);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-warm text-primary-foreground">
            <Carrot className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold">Despensa Inteligente</h1>
            <p className="text-sm text-muted-foreground">Cocina con lo que ya tienes en casa</p>
          </div>
        </div>

        <div className="surface-card space-y-5 p-6">
          <div>
            <Label htmlFor="nombre">¿Cómo te llamas?</Label>
            <Input
              id="nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> ¿Para cuántas personas cocinas normalmente?
            </Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setServings(n)}
                  className={`h-12 w-12 rounded-full border text-base font-semibold transition-colors ${
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
              Lo usaremos como valor por defecto; siempre podrás cambiarlo al grabar.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              setProfile({ name: name.trim() || "Chef", servings, onboarded: true });
              navigate({ to: "/" });
            }}
          >
            Empezar
          </Button>
        </div>
      </div>
    </div>
  );
}
