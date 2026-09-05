# Despensa Inteligente — Documento Maestro del Proyecto

> Documento de referencia único (single source of truth) para continuar el desarrollo del proyecto en **Google Antigravity**. Combina la visión de producto original y el stack técnico real ya instalado en el repositorio.

---

## 1. Resumen del producto

**Despensa Inteligente** es una web app que ayuda a las personas a saber qué cocinar con lo que tienen en casa, usando **registro por voz** como diferenciador principal. El usuario dice en voz alta qué productos tiene, la app los detecta (simulado por ahora), los guarda en su despensa digital, y sugiere recetas según lo que ya posee.

- **Estado actual:** prototipo visual/interactivo con datos mock, sin lógica real de voz ni backend.
- **Objetivo de esta etapa:** continuar el desarrollo (probablemente conectar lógica real, backend, y/o refinar UX) en Google Antigravity.
- **Diseño:** cálido, apetitoso, limpio. Paleta verde/naranja suave. Tipografía legible, estilo moderno de app de productividad de comida. Mobile-first, responsive a desktop.

---

## 2. Stack técnico actual (según `package.json`)

| Capa                 | Tecnología                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework            | React 19 + **TanStack Start** (`@tanstack/react-start`) sobre **Vite 8**                                                                                    |
| Routing              | **TanStack Router** (`@tanstack/react-router` + `router-plugin`)                                                                                            |
| Server/runtime       | **Nitro** (adaptador de servidor)                                                                                                                           |
| Estado / datos async | **TanStack Query** (`@tanstack/react-query`)                                                                                                                |
| Estilos              | **Tailwind CSS v4** (`@tailwindcss/vite`) + `tailwind-merge`, `tw-animate-css`                                                                              |
| Componentes UI       | **Radix UI** (accordion, dialog, dropdown, select, tabs, tooltip, etc.) — patrón shadcn/ui                                                                  |
| Formularios          | `react-hook-form` + `@hookform/resolvers` + `zod` (validación de esquemas)                                                                                  |
| Utilidades UI        | `lucide-react` (íconos), `cmdk`, `sonner` (toasts), `vaul` (drawers), `embla-carousel-react`, `date-fns`, `recharts`, `input-otp`, `react-resizable-panels` |
| Calidad de código    | ESLint 9 + `typescript-eslint`, Prettier 3                                                                                                                  |
| Lenguaje             | TypeScript 5.8                                                                                                                                              |
| Origen               | Generado con **Lovable** (lovable.dev), sincronizado vía Git                                                                                                |

**Notas de arquitectura importantes para Antigravity:**

- El proyecto usa **file-based routing** de TanStack Router — las páginas/pantallas descritas abajo deben mapearse a rutas (`Home`, `Despensa`, `Recetas`, `Lista de compras`, `Onboarding`, `Registro por voz`).
- La librería de componentes sigue el patrón **shadcn/ui sobre Radix**, así que los componentes nuevos deben respetar esa convención (composición con `Slot`, variantes con `class-variance-authority`).
- No hay backend ni base de datos conectados todavía — todo el "matching" de recetas y el procesamiento de audio están simulados con datos mock.
- No hay librería de manejo de estado global explícita (Redux/Zustand) — el estado probablemente vive en TanStack Query + estado local de componentes. Si se requiere estado global persistente (perfil, despensa, lista de compras), definir dónde vivirá (contexto de React, store ligero, o backend real).

---

## 3. Especificación funcional (páginas y funcionalidades)

### 3.1 Onboarding / Perfil

- Configuración inicial: nombre del usuario y "¿para cuántas personas cocinas normalmente?" (selector numérico, default = 2).
- Ese valor queda guardado como default del perfil.

### 3.2 Home / Dashboard

- Resumen visual: cantidad de productos en despensa, productos por vencer.
- Botón principal grande: **"Grabar lo que tengo"** (ícono de micrófono) — máximo protagonismo visual, es el diferenciador de la app.
- Sección "Recetas sugeridas para hoy" con cards de recetas.

### 3.3 Registro por voz

- Botón grande de micrófono, animación de grabación (simulada), botón de detener.
- Selector opcional previo: "¿Para cuántas personas es esta vez?" (default precargado, editable puntualmente).
- Pantalla de "Procesando..." → resultado simulado: lista de productos detectados con cantidad (ej. "Tomate — suficiente", "Cebolla — 2 unidades", "Arroz — suficiente", "Huevo — 4 unidades"), cada uno editable antes de confirmar.
- Botón "Confirmar y agregar a mi despensa".

### 3.4 Despensa

- Lista/grid de productos: nombre, cantidad (número o "suficiente"), fecha de vencimiento si aplica.
- Editar o eliminar producto manualmente.
- Botón flotante para agregar producto manualmente.
- Badge visual para productos próximos a vencer.

### 3.5 Recetas sugeridas

- **"Puedes cocinar ya"**: cards con foto (placeholder), nombre, tiempo de preparación, check verde (tiene todos los ingredientes).
- **"Te falta poco"**: cards mostrando ingredientes faltantes (ej. "Te falta: aceite, cebolla") + botón "Agregar faltantes a mi lista de compras".
- Vista de detalle de receta: ingredientes completos (marcando cuáles tiene / faltan) + pasos de preparación.
- Filtro por tipo de comida: desayuno / almuerzo / cena / postre.
- Regla de diseño: ingredientes **básicos** (sal, aceite, agua, ajo) se muestran de forma más discreta que los **principales**, ya que se asumen presentes por defecto.

### 3.6 Lista de compras

- Lista de pendientes de compra (agregados desde recetas o manualmente).
- Checkbox "comprado".
- Al marcar comprado: simular integración a la despensa con mensaje tipo "✅ Tomate agregado a tu despensa".
- Botón para agregar producto manualmente.

### 3.7 Navegación

- Barra inferior (mobile) / lateral (desktop) con 4 secciones: Home, Despensa, Recetas, Lista de compras.
- Navegación libre entre todas las secciones desde cualquier pantalla.

---

## 4. Modelos de datos sugeridos (TypeScript)

```ts
interface UserProfile {
  id: string;
  name: string;
  defaultServings: number; // default 2
}

interface PantryItem {
  id: string;
  name: string;
  quantity: number | "suficiente";
  unit?: string;
  expirationDate?: string; // ISO date, opcional
  isExpiringSoon?: boolean; // derivado, no necesariamente persistido
}

type IngredientType = "principal" | "basico";

interface RecipeIngredient {
  name: string;
  type: IngredientType;
  quantity?: string;
}

interface Recipe {
  id: string;
  name: string;
  imageUrl: string; // placeholder por ahora
  prepTimeMinutes: number;
  mealType: "desayuno" | "almuerzo" | "cena" | "postre";
  ingredients: RecipeIngredient[];
  steps: string[];
  // derivado en runtime comparando con PantryItem[]:
  // status: "puede_cocinar" | "le_falta_poco"
  // missingIngredients: string[]
}

interface ShoppingListItem {
  id: string;
  name: string;
  quantity?: string;
  isPurchased: boolean;
  sourceRecipeId?: string; // si vino de una receta
}
```

---

## 5. Datos de prueba (mocks) requeridos

- **Despensa:** mínimo 8 productos (algunos con cantidad exacta, otros "suficiente", 1–2 próximos a vencer).
- **Recetas:** mínimo 6, variadas (desayuno/almuerzo/cena), con ingredientes principales, básicos, tiempo de preparación y pasos; distribuidas entre "puedes cocinar ya" y "te falta poco" según la despensa mock.
- **Lista de compras:** mínimo 3 productos de ejemplo.
- Procesamiento de audio y matching de recetas: **simulados**, sin lógica real todavía.

---

## 6. Reglas de diseño / UX

- Mobile-first, responsive en desktop.
- El registro por voz es el diferenciador — máximo protagonismo visual en el Home.
- Ingredientes básicos más discretos que los principales en el detalle de receta.
- Estados vacíos amigables (ej. despensa vacía → "Tu despensa está vacía, grábate diciendo qué tienes en casa").
- Terminado profesional y pulido, no wireframe.
- Paleta verde/naranja suave, tipografía legible.

---

## 7. Pendientes / próximos pasos sugeridos para Antigravity

- [ ] Definir si se conecta backend real (auth, base de datos) o se mantiene todo client-side con mocks por ahora.
- [ ] Definir dónde vive el estado persistente (perfil, despensa, lista de compras): contexto React, store ligero, o backend.
- [ ] Implementar (o mantener simulada) la transcripción de voz → extracción de productos.
- [ ] Implementar lógica real de matching despensa ↔ recetas (reemplazando el mock).
- [ ] Mapear las 4+ pantallas a rutas de TanStack Router.
- [ ] Confirmar biblioteca de componentes final (shadcn/ui sobre Radix ya está instalada).
- [ ] Revisar accesibilidad y responsive en desktop (barra lateral vs. inferior).

---

_Generado a partir de `README.md` (prompt original de producto) y `package.json` (stack técnico real del repositorio)._
