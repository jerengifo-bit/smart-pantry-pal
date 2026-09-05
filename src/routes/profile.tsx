import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Carrot, Users } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePantry } from "@/lib/pantry-store";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Mi Perfil — Despensa Inteligente" },
      { name: "description", content: "Configura tu cuenta y preferencias." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, setProfile } = usePantry();
  const [name, setName] = useState(profile.name);
  const [servings, setServings] = useState(profile.servings || 2);

  const handleSave = () => {
    setProfile({ name: name.trim() || "Chef", servings, onboarded: true });
    toast.success("Perfil actualizado");
  };

  return (
    <AppLayout title="Mi Perfil" subtitle="Configura tus preferencias">
      <div className="max-w-md">
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
              Lo usamos para calcular las cantidades sugeridas en tus compras.
            </p>
          </div>

          <Button size="lg" className="w-full" onClick={handleSave}>
            Guardar cambios
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
