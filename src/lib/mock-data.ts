import type { PantryItem, Recipe, ShoppingItem } from "./pantry-types";

import huevosImg from "@/assets/receta-huevos.jpg";
import avenaImg from "@/assets/receta-avena.jpg";
import arrozImg from "@/assets/receta-arroz.jpg";
import pastaImg from "@/assets/receta-pasta.jpg";
import sopaImg from "@/assets/receta-sopa.jpg";
import platanoImg from "@/assets/receta-platano.jpg";
import { peruvianRecipes } from "./peruvian-recipes";

const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const mockPantry: PantryItem[] = [
  { id: "p1", name: "Tomate", qty: { kind: "enough" }, emoji: "🍅", expiresAt: iso(2) },
  { id: "p2", name: "Cebolla", qty: { kind: "count", value: 3 }, emoji: "🧅" },
  { id: "p3", name: "Arroz", qty: { kind: "enough" }, emoji: "🍚" },
  { id: "p4", name: "Huevo", qty: { kind: "count", value: 6 }, emoji: "🥚", expiresAt: iso(9) },
  {
    id: "p5",
    name: "Leche",
    qty: { kind: "count", value: 1, unit: "litro" },
    emoji: "🥛",
    expiresAt: iso(1),
  },
  {
    id: "p6",
    name: "Pollo",
    qty: { kind: "count", value: 500, unit: "g" },
    emoji: "🍗",
    expiresAt: iso(4),
  },
  { id: "p7", name: "Avena", qty: { kind: "enough" }, emoji: "🥣" },
  { id: "p8", name: "Plátano", qty: { kind: "count", value: 4 }, emoji: "🍌" },
  { id: "p9", name: "Zanahoria", qty: { kind: "count", value: 2 }, emoji: "🥕" },
];

export const mockRecipes: Recipe[] = [
  {
    id: "r1",
    name: "Huevos revueltos con tomate",
    meal: "desayuno",
    minutes: 12,
    image: huevosImg,
    servings: 2,
    main: ["Huevo", "Tomate", "Cebolla"],
    basics: ["Sal", "Aceite", "Pimienta"],
    steps: [
      "Pica la cebolla y el tomate en cubos pequeños.",
      "Sofríe la cebolla en un poco de aceite hasta que esté transparente.",
      "Agrega el tomate y cocina 3 minutos.",
      "Bate los huevos con sal y viértelos en la sartén.",
      "Revuelve a fuego bajo hasta que cuajen. Sirve caliente.",
    ],
  },
  {
    id: "r2",
    name: "Avena cremosa con plátano",
    meal: "desayuno",
    minutes: 8,
    image: avenaImg,
    servings: 2,
    main: ["Avena", "Leche", "Plátano"],
    basics: ["Agua", "Canela"],
    steps: [
      "Calienta la leche con un poco de agua.",
      "Agrega la avena y cocina 5 minutos removiendo.",
      "Sirve y corona con plátano en rodajas y canela.",
    ],
  },
  {
    id: "r3",
    name: "Arroz con pollo casero",
    meal: "almuerzo",
    minutes: 45,
    image: arrozImg,
    servings: 4,
    main: ["Arroz", "Pollo", "Cebolla", "Zanahoria"],
    basics: ["Sal", "Aceite", "Ajo", "Agua"],
    steps: [
      "Dora el pollo con sal y ajo.",
      "Añade cebolla y zanahoria picadas.",
      "Incorpora el arroz y agua caliente (2 tazas por taza de arroz).",
      "Cocina tapado 20 minutos a fuego bajo.",
      "Deja reposar 5 minutos y sirve.",
    ],
  },
  {
    id: "r4",
    name: "Pasta al pomodoro",
    meal: "cena",
    minutes: 25,
    image: pastaImg,
    servings: 2,
    main: ["Pasta", "Tomate", "Albahaca"],
    basics: ["Sal", "Aceite", "Ajo"],
    steps: [
      "Hierve la pasta en agua con sal.",
      "Sofríe ajo y tomate hasta formar una salsa.",
      "Mezcla la pasta con la salsa y termina con albahaca.",
    ],
  },
  {
    id: "r5",
    name: "Sopa de verduras",
    meal: "cena",
    minutes: 30,
    image: sopaImg,
    servings: 4,
    main: ["Zanahoria", "Cebolla", "Papa", "Apio"],
    basics: ["Sal", "Agua", "Ajo"],
    steps: [
      "Pica todas las verduras en cubos.",
      "Sofríe la cebolla y el ajo.",
      "Agrega el resto de verduras y agua. Cocina 20 minutos.",
      "Ajusta la sal y sirve bien caliente.",
    ],
  },
  {
    id: "r6",
    name: "Plátanos caramelizados",
    meal: "postre",
    minutes: 15,
    image: platanoImg,
    servings: 2,
    main: ["Plátano", "Azúcar", "Mantequilla"],
    basics: ["Canela"],
    steps: [
      "Corta los plátanos por la mitad a lo largo.",
      "Derrite mantequilla con azúcar en una sartén.",
      "Carameliza los plátanos 3 minutos por lado y espolvorea canela.",
    ],
  },
  ...peruvianRecipes,
];

export const mockShopping: ShoppingItem[] = [
  { id: "s1", name: "Aceite de oliva", bought: false },
  { id: "s2", name: "Pasta", bought: false, from: "Pasta al pomodoro" },
  { id: "s3", name: "Papa", bought: false, from: "Sopa de verduras" },
];

export const mockVoiceResult = [
  { name: "Tomate", qty: "suficiente", emoji: "🍅" },
  { name: "Cebolla", qty: "2", emoji: "🧅" },
  { name: "Arroz", qty: "suficiente", emoji: "🍚" },
  { name: "Huevo", qty: "4", emoji: "🥚" },
  { name: "Palta", qty: "3", emoji: "🥑" },
];
