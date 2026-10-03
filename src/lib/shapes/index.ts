/**
 * Figuras para sudokus infantiles. Se dibujan igual en la vista previa (SVG) y en
 * el PDF (react-pdf <Svg>), en una caja de 24×24.
 */

function starPath(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  const parts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    parts.push(`${i === 0 ? "M" : "L"}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return parts.join(" ") + " Z";
}

export interface ShapeDef {
  name: string;
  path: string;
  color: string;
}

export const SHAPES: ShapeDef[] = [
  { name: "círculo", path: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z", color: "#ef4444" },
  { name: "cuadrado", path: "M4 4h16v16H4Z", color: "#3b82f6" },
  { name: "triángulo", path: "M12 3L21.5 20.5H2.5Z", color: "#22c55e" },
  { name: "estrella", path: starPath(12, 12.8, 10.5, 4.4), color: "#eab308" },
  {
    name: "corazón",
    path: "M12 21C12 21 3 14.6 3 8.6C3 5.6 5.3 3.5 8 3.5C9.8 3.5 11.2 4.5 12 6C12.8 4.5 14.2 3.5 16 3.5C18.7 3.5 21 5.6 21 8.6C21 14.6 12 21 12 21Z",
    color: "#ec4899",
  },
  { name: "rombo", path: "M12 2L21.5 12L12 22L2.5 12Z", color: "#a855f7" },
];

export function shapeFor(value: number): ShapeDef {
  return SHAPES[(value - 1) % SHAPES.length];
}
