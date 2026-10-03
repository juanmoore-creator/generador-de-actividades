import type { WordItem } from "../types/activities";

export interface ThemePreset {
  id: string;
  title: string;
  emoji: string;
  items: WordItem[];
}

/** Temas listos para usar en las actividades de palabras. */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "animales",
    title: "Animales del mundo",
    emoji: "🦁",
    items: [
      { word: "ELEFANTE", clue: "Mamífero terrestre más grande, con trompa" },
      { word: "JIRAFA", clue: "Animal de cuello muy largo que come hojas altas" },
      { word: "DELFIN", clue: "Mamífero marino muy inteligente" },
      { word: "LEON", clue: "Conocido como el rey de la selva" },
      { word: "AGUILA", clue: "Ave rapaz con una vista muy aguda" },
      { word: "PINGUINO", clue: "Ave que no vuela y nada en aguas frías" },
      { word: "CANGURO", clue: "Lleva a su cría en una bolsa" },
      { word: "TORTUGA", clue: "Reptil con caparazón" },
      { word: "BALLENA", clue: "El animal más grande del planeta" },
    ],
  },
  {
    id: "solar",
    title: "El sistema solar",
    emoji: "🪐",
    items: [
      { word: "SOL", clue: "Estrella en el centro de nuestro sistema" },
      { word: "TIERRA", clue: "Nuestro planeta" },
      { word: "JUPITER", clue: "El planeta más grande" },
      { word: "SATURNO", clue: "Planeta famoso por sus anillos" },
      { word: "MARTE", clue: "Conocido como el planeta rojo" },
      { word: "COMETA", clue: "Cuerpo de hielo y roca con una cola brillante" },
      { word: "LUNA", clue: "Satélite natural de la Tierra" },
      { word: "MERCURIO", clue: "El planeta más cercano al Sol" },
      { word: "ORBITA", clue: "Camino que recorre un planeta alrededor del Sol" },
    ],
  },
  {
    id: "cuerpo",
    title: "El cuerpo humano",
    emoji: "🫀",
    items: [
      { word: "CORAZON", clue: "Órgano que bombea la sangre" },
      { word: "CEREBRO", clue: "Centro de control del sistema nervioso" },
      { word: "PULMON", clue: "Órgano principal de la respiración" },
      { word: "HUESO", clue: "Parte dura que forma el esqueleto" },
      { word: "MUSCULO", clue: "Tejido que permite el movimiento" },
      { word: "ESTOMAGO", clue: "Órgano donde se digieren los alimentos" },
      { word: "PIEL", clue: "Órgano que cubre todo el cuerpo" },
      { word: "SANGRE", clue: "Líquido rojo que circula por las venas" },
      { word: "RIÑON", clue: "Órgano que filtra la sangre" },
    ],
  },
  {
    id: "plantas",
    title: "Las plantas",
    emoji: "🌿",
    items: [
      { word: "CLOROFILA", clue: "Pigmento verde de las plantas" },
      { word: "RAIZ", clue: "Absorbe el agua del suelo" },
      { word: "SEMILLA", clue: "Da origen a una nueva planta" },
      { word: "POLEN", clue: "Polvo fino que producen las flores" },
      { word: "TALLO", clue: "Sostiene las hojas, flores y frutos" },
      { word: "HOJA", clue: "Parte verde donde se hace la fotosíntesis" },
      { word: "FLOR", clue: "Órgano reproductor de muchas plantas" },
      { word: "FRUTO", clue: "Protege a las semillas" },
      { word: "SAVIA", clue: "Líquido que circula por la planta" },
    ],
  },
  {
    id: "ingles",
    title: "Inglés: colores",
    emoji: "🎨",
    items: [
      { word: "RED", clue: "Rojo" },
      { word: "BLUE", clue: "Azul" },
      { word: "GREEN", clue: "Verde" },
      { word: "YELLOW", clue: "Amarillo" },
      { word: "BLACK", clue: "Negro" },
      { word: "WHITE", clue: "Blanco" },
      { word: "ORANGE", clue: "Naranja" },
      { word: "PURPLE", clue: "Violeta" },
      { word: "BROWN", clue: "Marrón" },
    ],
  },
  {
    id: "agua",
    title: "El ciclo del agua",
    emoji: "💧",
    items: [
      { word: "EVAPORACION", clue: "El agua pasa de líquido a vapor por el calor" },
      { word: "CONDENSACION", clue: "El vapor se enfría y forma las nubes" },
      { word: "PRECIPITACION", clue: "El agua cae como lluvia, nieve o granizo" },
      { word: "NUBE", clue: "Conjunto de gotitas de agua suspendidas en el aire" },
      { word: "RIO", clue: "Corriente de agua que desemboca en el mar" },
      { word: "OCEANO", clue: "Gran masa de agua salada" },
      { word: "GLACIAR", clue: "Gran masa de hielo" },
      { word: "VAPOR", clue: "Agua en estado gaseoso" },
      { word: "ACUIFERO", clue: "Agua guardada bajo la tierra" },
    ],
  },
];
