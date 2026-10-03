"use client";

import React, { useState } from "react";
import type { ActivitySnapshot } from "@/lib/types/activities";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { dataActions, useDataState } from "@/lib/data/store";
import { getActivity } from "@/lib/activities/catalog";
import { useApp } from "./AppContext";

export const SUBJECTS = ["Lengua", "Matemática", "Ciencias naturales", "Ciencias sociales", "Inglés", "Plástica", "Música", "Educación física", "Otra"];
export const GRADES = ["Nivel inicial", "1.º y 2.º primaria", "3.º y 4.º primaria", "5.º y 6.º primaria", "Secundaria"];

export function PublishDialog({ snapshot, onClose }: { snapshot: ActivitySnapshot | null; onClose: () => void }) {
  const { mode, profile } = useDataState();
  const app = useApp();
  const toast = useToast();
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[2]);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = snapshot !== null;
  const meta = snapshot ? getActivity(snapshot.type) : null;

  if (open && (mode === "local" || !profile)) {
    const isLocal = mode === "local";
    return (
      <Modal
        open
        onClose={onClose}
        size="sm"
        title="Publicar en la comunidad"
        description={
          isLocal
            ? "La comunidad necesita una cuenta en la nube, y esta instalación funciona sin cuentas. Puedes compartir el PDF directamente."
            : "Inicia sesión para compartir tus fichas con otros docentes."
        }
        footer={
          isLocal ? (
            <Button variant="primary" onClick={onClose}>
              Entendido
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                app.openAuth("Inicia sesión para publicar en la comunidad.");
              }}
            >
              Iniciar sesión
            </Button>
          )
        }
      >
        <span />
      </Modal>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshot) return;
    setBusy(true);
    setError(null);
    try {
      await dataActions.publish(snapshot, {
        subject,
        grade,
        description: description.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 6),
      });
      onClose();
      toast.show("¡Publicada! Otros docentes ya pueden usarla.", {
        action: { label: "Ver", onClick: () => app.navigate("community") },
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Publicar en la comunidad"
      description={snapshot ? `«${snapshot.title}» · ${meta?.title}. Se publica con tu nombre${profile?.school ? ` y ${profile.school}` : ""}.` : undefined}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Área">
            {(p) => (
              <Select {...p} value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Nivel">
            {(p) => (
              <Select {...p} value={grade} onChange={(e) => setGrade(e.target.value)}>
                {GRADES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <Field label="Descripción" hint="¿Para qué sirve? ¿Cómo la usaste en clase?">
          {(p) => <Textarea {...p} rows={3} required maxLength={400} value={description} onChange={(e) => setDescription(e.target.value)} />}
        </Field>
        <Field label="Etiquetas" optional hint="Separadas por comas, por ejemplo: animales, vertebrados.">
          {(p) => <Input {...p} value={tags} onChange={(e) => setTags(e.target.value)} />}
        </Field>
        {error && (
          <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={busy}>
            Publicar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
