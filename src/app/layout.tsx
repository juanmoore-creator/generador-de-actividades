import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GenAct · Generador de Actividades Educativas",
  description: "Crea crucigramas y sopas de letras imprimibles en PDF para tus alumnos de forma rápida y sencilla.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${outfit.variable} ${plusJakarta.variable} ${spaceMono.variable} antialiased selection:bg-orange-200 selection:text-orange-900`}
      >
        {children}
      </body>
    </html>
  );
}
