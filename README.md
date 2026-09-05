# Smart Pantry Pal

# Prompt para Lovable — Asistente de Comidas y Lista de Compras

---

Crea una web app llamada **"Despensa Inteligente"**, un asistente que ayuda a las personas a saber qué cocinar con lo que tienen en casa, usando registro por voz. Quiero el prototipo visual completo e interactivo, con datos de prueba (mocks), para poder mostrarlo como demo. El diseño debe ser limpio, cálido y apetitoso (colores tipo verde/naranja suave, tipografía legible, estilo moderno tipo app de productividad de comida), mobile-first pero que también se vea bien en desktop.

## Páginas y funcionalidades:

### 1. Onboarding / Perfil

- Pantalla simple de configuración inicial: nombre del usuario y "¿para cuántas personas cocinas normalmente?" (selector numérico, valor por defecto 2).

- Este valor debe quedar guardado como el "default" del perfil.

### 2. Home / Dashboard

- Resumen visual de:

  - Cantidad de productos registrados en la despensa

  - Productos por vencer (si tienen fecha)

  - Botón principal, grande y visible: **"Grabar lo que tengo"** (ícono de micrófono)

- Debajo, una sección "Recetas sugeridas para hoy" con cards de recetas (ver punto 5)

### 3. Registro por voz (pantalla de grabación)

- Interfaz de grabación de audio: botón grande de micrófono, animación simple mientras "grava" (simulado), y botón de detener.

- Antes de grabar, mostrar un selector opcional: "¿Para cuántas personas es esta vez?" con el valor por defecto ya seleccionado, pero que se pueda cambiar puntualmente (para casos como visitas).

- Después de "grabar" (simulado), mostrar una pantalla de "Procesando..." y luego un resultado de ejemplo: lista de productos detectados con su cantidad (ej: "Tomate — suficiente", "Cebolla — 2 unidades", "Arroz — suficiente", "Huevo — 4 unidades"), cada uno editable manualmente antes de confirmar (por si la detección se equivoca).

- Botón "Confirmar y agregar a mi despensa".

### 4. Despensa

- Vista de lista/grid de todos los productos registrados, mostrando: nombre, cantidad (número o "suficiente"), y fecha de vencimiento si aplica.

- Posibilidad de editar o eliminar un producto manualmente.

- Botón flotante para agregar producto manualmente (como alternativa al audio).

- Indicador visual (ej. badge de color) para productos próximos a vencer.

### 5. Recetas sugeridas

- Dos secciones claramente diferenciadas:

  - **"Puedes cocinar ya"**: cards de recetas con foto (usa placeholders), nombre, tiempo de preparación, y un check verde indicando que tiene todos los ingredientes.

  - **"Te falta poco"**: cards similares, pero mostrando qué ingredientes le faltan (ej. "Te falta: aceite, cebolla") y un botón "Agregar faltantes a mi lista de compras".

- Al hacer click en una receta, abrir vista de detalle con: ingredientes completos (marcando cuáles ya tiene y cuáles le faltan), y pasos de preparación.

- Filtro simple por tipo de comida: desayuno / almuerzo / cena / postre.

### 6. Lista de compras

- Lista de productos pendientes de comprar (los que se agregaron desde las recetas, o agregados manualmente).

- Checkbox para marcar cada producto como "comprado".

- Al marcar como comprado, simular visualmente que ese producto se integra a la despensa (mostrar un mensaje tipo "✅ Tomate agregado a tu despensa").

- Botón para agregar un producto manualmente a la lista.

## Navegación

- Barra de navegación inferior (mobile) o lateral (desktop) con 4 secciones: Home, Despensa, Recetas, Lista de compras.

- El usuario debe poder moverse libremente entre todas las secciones desde cualquier pantalla.

## Datos de prueba (mocks) que debes incluir:

- Al menos 8 productos de ejemplo en la despensa (algunos con cantidad exacta, otros marcados como "suficiente", uno o dos próximos a vencer).

- Al menos 6 recetas de ejemplo variadas (desayuno, almuerzo, cena), con ingredientes principales, ingredientes básicos, tiempo de preparación y pasos, distribuidas entre "puedes cocinar ya" y "te falta poco" según los productos de ejemplo de la despensa.

- Al menos 3 productos de ejemplo en la lista de compras.

- Todo el procesamiento de audio y el matching de recetas puede estar simulado con estos datos de ejemplo — no necesito que funcione con lógica real todavía, solo que la experiencia se vea y se sienta completa.

## Notas importantes:

- Diseño mobile-first, pero responsive para desktop también.

- El registro por voz es el diferenciador principal de la app — dale protagonismo visual en el Home.

- Los ingredientes "básicos" (sal, aceite, agua, ajo) deben mostrarse de forma más discreta que los ingredientes "principales" en el detalle de receta, ya que se asumen presentes por defecto.

- Usa estados vacíos amigables (ej. si la despensa está vacía: "Tu despensa está vacía, grábate diciendo qué tienes en casa").

- Diseño profesional y pulido, no de wireframe básico.

---

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e5186d57-be13-4a69-a6cc-e4554aabd9f9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
