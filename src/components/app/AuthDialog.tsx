"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";
import { dataActions } from "@/lib/data/store";

type Mode = "signin" | "signup" | "magic";

export function AuthDialog({ open, reason, onClose }: { open: boolean; reason?: string; onClose: () => void }) {
  const toast = useToast();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signin") {
        await dataActions.signIn(email.trim(), password);
        toast.show("Sesión iniciada");
        onClose();
      } else if (mode === "signup") {
        const { needsConfirmation } = await dataActions.signUp(name.trim(), email.trim(), password);
        if (needsConfirmation) setSentTo(email.trim());
        else {
          toast.show("¡Cuenta creada!");
          onClose();
        }
      } else {
        await dataActions.sendMagicLink(email.trim());
        setSentTo(email.trim());
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<Mode, string> = { signin: "Ingresar", signup: "Crear cuenta", magic: "Ingresar con un enlace" };

  return (
    <Modal open={open} onClose={onClose} size="sm" title={sentTo ? "Revisa tu correo" : titles[mode]} description={sentTo ? undefined : reason}>
      {sentTo ? (
        <div className="space-y-4 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
            <Mail className="size-7" aria-hidden />
          </span>
          <p className="text-ink-2">
            Te enviamos un enlace a <strong className="text-ink">{sentTo}</strong>. Ábrelo desde este dispositivo para entrar.
          </p>
          <Button variant="secondary" onClick={() => setSentTo(null)}>
            Volver
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Segmented<Mode>
            label="Forma de ingreso"
            hideLabel
            value={mode}
            onChange={(m) => {
              setMode(m);
              setError(null);
            }}
            options={[
              { value: "signin", label: "Ingresar" },
              { value: "signup", label: "Crear cuenta" },
              { value: "magic", label: "Sin contraseña" },
            ]}
          />
          {mode === "signup" && (
            <Field label="Nombre">
              {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />}
            </Field>
          )}
          <Field label="Correo electrónico">
            {(p) => <Input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" inputMode="email" />}
          </Field>
          {mode !== "magic" && (
            <Field label="Contraseña" hint={mode === "signup" ? "Al menos 6 caracteres." : undefined}>
              {(p) => (
                <Input
                  {...p}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              )}
            </Field>
          )}
          {error && (
            <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" className="w-full" loading={busy}>
            {mode === "signin" ? "Ingresar" : mode === "signup" ? "Crear cuenta" : "Enviarme el enlace"}
          </Button>
        </form>
      )}
    </Modal>
  );
}
