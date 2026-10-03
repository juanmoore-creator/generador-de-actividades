"use client";

import React, { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "genact_install_dismissed_at";
const DISMISS_DAYS = 30;

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Date.now() - at < DISMISS_DAYS * 864e5;
  } catch {
    return false;
  }
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

/** Invitación discreta a instalar la app (se puede posponer por 30 días). */
export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(() => isStandalone() || recentlyDismissed());
  const [iosGuide, setIosGuide] = useState(false);
  const showIos = isIOS() && !promptEvent;

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden || (!promptEvent && !showIos)) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setHidden(true);
  };

  return (
    <>
      <aside aria-label="Instalar la aplicación" className="no-print border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <Download className="size-5 shrink-0 text-accent" aria-hidden />
          <p className="flex-1 text-sm text-ink-2">Instala GenAct para abrirlo como una app y usarlo sin conexión.</p>
          <Button
            size="sm"
            variant="primary"
            onClick={async () => {
              if (promptEvent) {
                await promptEvent.prompt();
                const { outcome } = await promptEvent.userChoice;
                if (outcome === "accepted") setHidden(true);
              } else setIosGuide(true);
            }}
          >
            Instalar
          </Button>
          <IconButton size="sm" variant="ghost" label="Ahora no" icon={<X className="size-4" aria-hidden />} onClick={dismiss} />
        </div>
      </aside>
      {iosGuide && (
        <Modal open onClose={() => setIosGuide(false)} size="sm" title="Instalar en iPhone o iPad">
          <ol className="list-decimal space-y-2 pl-5 text-ink-2">
            <li>
              Toca el botón <Share className="inline size-4" aria-label="Compartir" /> de Safari.
            </li>
            <li>Elige «Agregar a pantalla de inicio».</li>
            <li>Confirma con «Agregar».</li>
          </ol>
        </Modal>
      )}
    </>
  );
}

/** Registra el service worker y avisa cuando hay una versión nueva. */
export function useServiceWorker() {
  const toast = useToast();
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    const version = process.env.NEXT_PUBLIC_BUILD_ID || "dev";
    let refreshing = false;

    const promptUpdate = (worker: ServiceWorker) =>
      toast.show("Hay una versión nueva de GenAct.", {
        tone: "info",
        duration: 60_000,
        action: { label: "Actualizar", onClick: () => worker.postMessage({ type: "SKIP_WAITING" }) },
      });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register(`/sw.js?v=${encodeURIComponent(version)}`, { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        if (reg.waiting && navigator.serviceWorker.controller) promptUpdate(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) promptUpdate(worker);
          });
        });
      })
      .catch((err) => console.warn("No se pudo registrar el service worker", err));
  }, [toast]);
}
