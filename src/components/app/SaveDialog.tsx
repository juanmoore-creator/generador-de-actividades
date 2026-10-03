"use client";

import React, { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useStudio } from "@/components/studio/StudioContext";
import { dataActions, useDataState } from "@/lib/data/store";
import { useApp } from "./AppContext";

export function SaveDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { snapshot, state, dispatch, meta } = useStudio();
  const { saved, mode, profile } = useDataState();
  const app = useApp();
  const toast = useToast();
  const existing = state.savedId ? saved.find((s) => s.id === state.savedId) : undefined;

  const [title, setTitle] = useState(snapshot.title || meta.defaultTitle);
  const [folder, setFolder] = useState(existing?.folder ?? "General");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [busy, setBusy] = useState<"update" | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const folders = useMemo(() => [...new Set(["General", ...saved.map((s) => s.folder)])].sort(), [saved]);
  const needsLogin = mode === "cloud" && !profile;

  const afterSave = (id: string, message: string) => {
    dispatch({ type: "markSaved", savedId: id });
    onClose();
    toast.show(message, {
      action:
        mode === "cloud"
          ? { label: "Publicar", onClick: () => app.openPublish({ ...snapshot, title: title.trim() || meta.defaultTitle }) }
          : { label: "Ver mis fichas", onClick: () => app.navigate("saved") },
    });
  };

  const save = async (asNew: boolean) => {
    setBusy(asNew ? "new" : "update");
    setError(null);
    const snap = { ...snapshot, title: title.trim() || meta.defaultTitle };
    if (snap.title !== snapshot.title) dispatch({ type: "patch", patch: { title: snap.title } });
    try {
      if (existing && !asNew) {
        await dataActions.updateSaved(existing.id, { snapshot: snap, folder, notes });
        afterSave(existing.id, "Cambios guardados");
      } else {
        const item = await dataActions.save({ snapshot: snap, folder, notes });
        afterSave(item.id, `"${item.title}" se guardó en Mis fichas`);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  if (needsLogin) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Inicia sesión para guardar"
        description="Tus fichas se guardan en tu cuenta y las puedes abrir desde cualquier dispositivo. Mientras tanto, tu borrador sigue guardado en este dispositivo."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Ahora no
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                app.openAuth("Inicia sesión para guardar tus fichas.");
              }}
            >
              Iniciar sesión
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-3">Crear una cuenta es gratis.</p>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? "Guardar cambios" : "Guardar en Mis fichas"}
      description={mode === "local" ? "Se guarda en este dispositivo." : "Se guarda en tu cuenta."}
      footer={
        <>
          {existing && (
            <Button variant="secondary" loading={busy === "new"} disabled={busy !== null} onClick={() => save(true)}>
              Guardar como nueva
            </Button>
          )}
          <Button variant="primary" loading={busy === "update"} disabled={busy !== null} onClick={() => save(false)}>
            {existing ? "Guardar cambios" : "Guardar"}
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save(false);
        }}
      >
        <Field label="Título">{(p) => <Input {...p} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} autoFocus />}</Field>
        <Field label="Carpeta" hint="Elige una existente o escribe una nueva.">
          {(p) => (
            <>
              <Input {...p} value={folder} onChange={(e) => setFolder(e.target.value)} list="folder-options" maxLength={40} />
              <datalist id="folder-options">
                {folders.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </>
          )}
        </Field>
        <Field label="Notas" optional>
          {(p) => <Textarea {...p} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Para qué grupo es, cuándo la usaste…" />}
        </Field>
        {error && (
          <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink">
            {error}
          </p>
        )}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
