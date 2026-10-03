import { RoscoResult, RoscoLetterItem } from "../types/activities";

export const ROSCO_ALPHABET = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "L", "M", "N", "Ñ", "O", "P", "Q", "R", "S", "T",
  "U", "V", "X", "Y", "Z"
];

export const DEFAULT_ROSCO_ITEMS: RoscoLetterItem[] = [
  { letter: "A", word: "ASTRONAUTA", clue: "Persona que viaja por el espacio exterior.", prefixType: "starts" },
  { letter: "B", word: "BRUJULA", clue: "Instrumento con aguja imantada que señala el norte.", prefixType: "starts" },
  { letter: "C", word: "COMETA", clue: "Cuerpo celeste con cabellera y cola luminosa.", prefixType: "starts" },
  { letter: "D", word: "DINOSAURIO", clue: "Reptil extinto que dominó la Tierra en el Mesozoico.", prefixType: "starts" },
  { letter: "E", word: "ECLIPSE", clue: "Ocultación transitoria total o parcial de un astro.", prefixType: "starts" },
  { letter: "F", word: "FOSIL", clue: "Resto o huella petrificada de un ser vivo antiguo.", prefixType: "starts" },
  { letter: "G", word: "GALAXIA", clue: "Enorme conjunto de estrellas, nubes de gas y polvo.", prefixType: "starts" },
  { letter: "H", word: "HURACAN", clue: "Viento de fuerza extraordinaria que gira en grandes círculos.", prefixType: "starts" },
  { letter: "I", word: "ISLA", clue: "Porción de tierra rodeada de agua por todas partes.", prefixType: "starts" },
  { letter: "J", word: "JIRAFA", clue: "Mamífero rumiante de cuello y patas extraordinariamente largos.", prefixType: "starts" },
  { letter: "L", word: "LUNA", clue: "Único satélite natural de nuestro planeta Tierra.", prefixType: "starts" },
  { letter: "M", word: "METEORITO", clue: "Fragmento de materia del espacio que cae sobre la Tierra.", prefixType: "starts" },
  { letter: "N", word: "NEBULOSA", clue: "Masa gigante de gas y polvo en el espacio cósmico.", prefixType: "starts" },
  { letter: "Ñ", word: "ÑANDU", clue: "Ave corredora sudamericana semejante al avestruz.", prefixType: "starts" },
  { letter: "O", word: "OCEANO", clue: "Gran masa de agua salada que cubre la mayor parte de la Tierra.", prefixType: "starts" },
  { letter: "P", word: "PLANETA", clue: "Cuerpo celeste que gira alrededor de una estrella y no emite luz propia.", prefixType: "starts" },
  { letter: "Q", word: "QUIMICA", clue: "Ciencia que estudia la composición y estructura de la materia.", prefixType: "starts" },
  { letter: "R", word: "ROCA", clue: "Materia mineral dura y sólida de que está formada la corteza terrestre.", prefixType: "starts" },
  { letter: "S", word: "SATELITE", clue: "Cuerpo que orbita alrededor de un planeta.", prefixType: "starts" },
  { letter: "T", word: "TELESCOPIO", clue: "Instrumento óptico para observar objetos lejanos, especialmente astros.", prefixType: "starts" },
  { letter: "U", word: "UNIVERSO", clue: "Conjunto de todo lo que existe física y materialmente.", prefixType: "starts" },
  { letter: "V", word: "VOLCAN", clue: "Abertura en la corteza terrestre por donde sale magma y gases.", prefixType: "starts" },
  { letter: "X", word: "GALAXIA", clue: "Contiene la X: Gran estructura estelar como la Vía Láctea.", prefixType: "contains" },
  { letter: "Y", word: "YACIMIENTO", clue: "Lugar donde se halla naturalmente un mineral o fósil.", prefixType: "starts" },
  { letter: "Z", word: "ZODIACO", clue: "Zona celeste por cuyo centro pasa la eclíptica.", prefixType: "starts" },
];

export function generateRosco(items?: RoscoLetterItem[]): RoscoResult {
  const finalItems = items && items.length > 0 ? items : DEFAULT_ROSCO_ITEMS;
  return {
    items: finalItems,
  };
}
