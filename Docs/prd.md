# PRD — Despensa Inteligente

*Documento técnico. Última actualización: agosto 2026. Pensado para que cualquier agente de IA (Antigravity, Claude Code, etc.) o desarrollador humano pueda retomar el proyecto sin perder contexto, aunque haya pasado tiempo sin tocarlo.*

---

## 0. Contexto rápido para retomar el proyecto

- **Qué es:** app web (React + TanStack Start) que sugiere recetas según lo que el usuario tiene en su despensa, con registro por voz como diferenciador.
- **Origen:** generado inicialmente con Lovable a partir de un prompt de producto (ver `README.md` del repo).
- **Estado real hoy:** prototipo visual/interactivo, **100% con datos mock**, sin backend, sin base de datos, sin transcripción de voz real, sin lógica de matching real. Todo lo que "funciona" en la demo es simulado.
- **Nada de esto está conectado todavía:** auth, base de datos, procesamiento de audio, IA de matching de recetas.
- **Este PRD es la fuente de verdad** de qué existe, qué falta y en qué orden conviene construirlo.

---

## 1. Problema y Usuario Objetivo

- **Problema:** las personas que cocinan en casa en Perú no saben qué preparar día a día. Es una decisión repetitiva que genera estrés, y pedir sugerencias a otros no da alternativas concretas.
- **Usuario objetivo:** personas que cocinan en el hogar en Perú (principalmente amas de casa), con baja tolerancia a la fricción de tipeo manual — de ahí que el registro por voz sea central y no un extra.
- **Por qué ahora:** el dolor es claro y validado por experiencia directa del equipo/fundador (se pregunta a diario "qué cocinar" y no hay buena respuesta disponible); todavía no hay validación cuantitativa con usuarios reales — **pendiente de hacer**.

---

## 2. Funcionalidades

### Core (v1) — lo mínimo para que el producto tenga sentido de punta a punta

- Onboarding simple: nombre + cantidad de personas para las que cocina normalmente (default).
- Registro por voz de productos (aunque sea con transcripción real básica, no necesariamente con IA avanzada de cantidades).
- Despensa editable: ver, editar, eliminar productos; alertas de vencimiento.
- Recetas sugeridas divididas en "puedes cocinar ya" / "te falta poco", con detalle de ingredientes y pasos.
- Lista de compras conectada a las recetas (agregar faltantes con un click).
- Navegación entre las 4 secciones principales (Home, Despensa, Recetas, Lista de compras).

### Futuras (v2+) — puede esperar

- Matching de recetas con IA real (no reglas simples) considerando cantidades, no solo presencia/ausencia del ingrediente.
- Personalización de recetas por restricciones (vegetariano, sin gluten, etc.).
- Notificaciones proactivas ("tu palta vence mañana, ¿la usamos hoy?").
- Multi-usuario por hogar (compartir una despensa entre varias personas).
- Monetización (freemium, suscripción, alianzas con supermercados) — **incógnita total por ahora, no diseñar todavía.**
- Expansión fuera de Perú.

---

## 3. Flujos de usuario principales

### Flujo: Registrar productos por voz
1. Usuario entra al Home y toca "Grabar lo que tengo".
2. Sistema muestra selector opcional "¿Para cuántas personas es esta vez?" (default precargado).
3. Usuario graba diciendo qué productos tiene.
4. Sistema muestra "Procesando..." y luego una lista editable de productos detectados con cantidad.
5. Usuario corrige manualmente si algo está mal detectado.
6. Usuario confirma → productos se agregan a la despensa.

### Flujo: Descubrir qué cocinar hoy
1. Usuario entra a Home o a la sección Recetas.
2. Sistema muestra recetas divididas en "Puedes cocinar ya" y "Te falta poco".
3. Usuario filtra por tipo de comida (desayuno/almuerzo/cena/postre) si quiere.
4. Usuario abre el detalle de una receta → ve ingredientes (tiene/falta) y pasos.
5. Si le falta algo, toca "Agregar faltantes a mi lista de compras".

### Flujo: Comprar y actualizar despensa
1. Usuario entra a Lista de compras.
2. Marca un producto como comprado (checkbox).
3. Sistema simula/integra ese producto directo a la despensa, mostrando confirmación visual.

---

## 4. Modelo de datos

Basado en las entidades ya usadas en el prototipo (mock) y pensado para migrar a una base de datos real sin fricción.

- **Tabla `users`**
  - `id`, `name`, `default_servings` (número de personas para las que cocina normalmente por default)

- **Tabla `pantry_items`** (despensa)
  - `id`, `user_id` (FK a `users`), `name`, `quantity` (número o valor especial "suficiente"), `unit` (opcional), `expiration_date` (opcional)

- **Tabla `recipes`**
  - `id`, `name`, `image_url`, `prep_time_minutes`, `meal_type` (desayuno/almuerzo/cena/postre), `steps` (texto o lista ordenada)

- **Tabla `recipe_ingredients`**
  - `id`, `recipe_id` (FK a `recipes`), `name`, `type` (`principal` | `basico`), `quantity` (opcional)

- **Tabla `shopping_list_items`**
  - `id`, `user_id` (FK a `users`), `name`, `quantity` (opcional), `is_purchased` (booleano), `source_recipe_id` (FK opcional a `recipes`, si vino de una receta)

**Relaciones:**
- Un `user` tiene muchos `pantry_items` y muchos `shopping_list_items`.
- Una `recipe` tiene muchos `recipe_ingredients`.
- El estado "puede cocinar ya" / "le falta poco" de una receta **es derivado en runtime**, comparando `recipe_ingredients` contra `pantry_items` del usuario — no se almacena.

*Nota: hoy estas "tablas" existen solo como datos mock en el frontend (arrays hardcodeados). No hay base de datos real conectada.*

---

## 5. Stack técnico

> Nota: la plantilla estándar de Academia Labora sugiere Supabase + n8n + Vercel. **Este proyecto no usa ese stack** — fue generado con Lovable sobre un stack distinto. Documento el stack real para no perder contexto.

| Capa | Tecnología real usada |
|---|---|
| Framework | React 19 + **TanStack Start** sobre **Vite 8** |
| Routing | **TanStack Router** (file-based routing) |
| Server runtime | **Nitro** |
| Estado / datos async | **TanStack Query** |
| Estilos | **Tailwind CSS v4** |
| Componentes UI | **Radix UI** con patrón **shadcn/ui**, `class-variance-authority` para variantes |
| Formularios | `react-hook-form` + `zod` para validación |
| Utilidades UI | `lucide-react` (íconos), `sonner` (toasts), `vaul` (drawers), `cmdk`, `embla-carousel-react`, `date-fns`, `recharts` |
| Calidad de código | ESLint 9 + `typescript-eslint`, Prettier 3 |
| Lenguaje | TypeScript 5.8 |
| Base de datos / auth | **No conectado todavía.** Pendiente decidir (Supabase es una opción razonable a evaluar, dado que es el default de la academia, pero no hay decisión tomada). |
| Automatizaciones | **No aplica todavía.** No hay flujos de n8n ni necesidad identificada aún. |
| Deploy | **No definido todavía.** Vercel es compatible con este stack (Vite/TanStack Start) si se decide usarlo. |
| Control de versiones | GitHub (el repo ya sincroniza con Lovable) |
| Voz → texto | **No implementado.** Pendiente elegir proveedor (ej. Whisper API, servicio nativo del navegador, u otro). |

---

## 6. Funcionalidades por módulo: hecho vs. faltante

### Onboarding / Perfil
- ✅ Pantalla visual con nombre + selector de personas (mock/UI).
- ❌ Persistencia real del perfil (hoy no hay guardado real, es solo demo visual).

### Home / Dashboard
- ✅ Resumen visual de productos y por vencer (con datos mock).
- ✅ Botón "Grabar lo que tengo" con protagonismo visual.
- ✅ Sección de recetas sugeridas (mock).
- ❌ Datos reales conectados a despensa real del usuario.

### Registro por voz
- ✅ UI de grabación (botón, animación simulada, botón de detener).
- ✅ Selector de personas puntual.
- ✅ Pantalla de "Procesando..." simulada.
- ✅ Resultado editable de productos detectados (con datos mock fijos, no reales).
- ❌ Transcripción de voz real.
- ❌ Extracción real de productos/cantidades desde el audio (NLP/IA).

### Despensa
- ✅ Vista de lista/grid con datos mock.
- ✅ Edición y eliminación manual (sobre datos mock, en memoria).
- ✅ Botón flotante para agregar manualmente.
- ✅ Badge visual de próximos a vencer.
- ❌ Persistencia real (hoy se pierde todo al recargar, si no hay estado global/backend).

### Recetas sugeridas
- ✅ Cards "puedes cocinar ya" / "te falta poco" con datos mock.
- ✅ Detalle de receta con ingredientes (tiene/falta) y pasos.
- ✅ Filtro por tipo de comida.
- ❌ Matching real despensa ↔ recetas (hoy el match está prearmado en los mocks, no calculado).

### Lista de compras
- ✅ Lista de pendientes con datos mock.
- ✅ Checkbox de comprado con simulación visual de integración a despensa.
- ✅ Botón para agregar manualmente.
- ❌ Conexión real y persistente entre lista de compras y despensa.

### Transversal
- ❌ Backend / API.
- ❌ Base de datos real.
- ❌ Autenticación de usuarios.
- ❌ Persistencia de cualquier tipo entre sesiones.

---

## 7. Roadmap de desarrollo sugerido

**Fase 1 — Fundación de datos (siguiente paso lógico)**
1. Decidir y conectar base de datos real (evaluar Supabase u otra opción).
2. Migrar las entidades de la sección 4 de mock a tablas reales.
3. Implementar autenticación básica (aunque sea simple, para tener `user_id` real).

**Fase 2 — Persistencia de los módulos ya construidos visualmente**
4. Conectar Onboarding → guardar perfil real.
5. Conectar Despensa → CRUD real contra la base de datos.
6. Conectar Lista de compras → CRUD real, incluyendo la integración compra → despensa.

**Fase 3 — Inteligencia real**
7. Implementar transcripción de voz real (elegir proveedor).
8. Implementar extracción de productos/cantidades desde el texto transcrito.
9. Implementar matching real despensa ↔ recetas (reemplazar el mock prearmado).

**Fase 4 — Validación y pulido**
10. Probar el flujo completo con usuarios reales en Perú (validar el problema/solución de forma cuantitativa, no solo intuitiva).
11. Ajustar UX según feedback.
12. Definir stack de deploy (Vercel u otro) y publicar una versión accesible para testers.

**Fase 5 — Segunda etapa (fuera de alcance de v1)**
13. Explorar monetización (sin definición previa, a evaluar según validación).
14. Evaluar features de v2+ (sección 2).

---

## 8. Checklist de estado del PRD

- [x] ¿Está claro quién es el usuario y qué problema resuelve? Sí.
- [x] ¿Separé v1 de v2+ sin mezclar todo? Sí (sección 2).
- [x] ¿Los flujos de usuario cubren el core completo? Sí (sección 3).
- [x] ¿El modelo de datos tiene las tablas y relaciones mínimas? Sí (sección 4), aunque todavía no implementado.
- [x] ¿Definí el stack? Sí, con el stack real (no el default de la plantilla) y los huecos marcados explícitamente.
- [ ] ¿Un compañero podría leer esto y entender el proyecto sin que se lo explique? Debería, pero falta validación real con usuarios — pendiente.

---

*Complementa a `DESPENSA_INTELIGENTE_DOCUMENTO_MAESTRO.md` (versión comercial). Este archivo es la referencia técnica para retomar el desarrollo en Antigravity, Claude Code, o con cualquier desarrollador nuevo en el proyecto.*
