import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "GenAct · Fichas educativas imprimibles",
    short_name: "GenAct",
    description: "Crea fichas imprimibles con hoja de respuestas: sopas de letras, crucigramas, sudokus y más.",
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5f6f8",
    theme_color: "#0f172a",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Nueva ficha", short_name: "Crear", url: "/", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Mis fichas", short_name: "Mis fichas", url: "/?tab=saved", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Comunidad", url: "/?tab=community", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
