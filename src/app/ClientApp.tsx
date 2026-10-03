"use client";

import dynamic from "next/dynamic";

/*
 * La app vive en el navegador (borradores, fichas locales, generación de PDF),
 * así que se renderiza sólo en el cliente. El servidor entrega un esqueleto liviano.
 */
const AppShell = dynamic(() => import("@/components/app/AppShell").then((m) => m.AppShell), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-dvh place-items-center" role="status">
      <div className="flex flex-col items-center gap-3 text-ink-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary font-mono font-bold text-on-primary">GA</span>
        <span className="text-sm">Cargando GenAct…</span>
      </div>
    </div>
  ),
});

export default function ClientApp() {
  return <AppShell />;
}
