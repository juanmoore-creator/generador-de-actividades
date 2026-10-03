"use client";

import React, { useState } from "react";
import { Cloud, HardDrive, LogOut } from "lucide-react";
import type { PageSize, SheetHeaderOptions } from "@/lib/types/activities";
import { dataActions, useDataState } from "@/lib/data/store";
import { DEFAULT_HEADER } from "@/lib/activities/snapshot";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { Switch } from "@/components/ui/Switch";
import { ThemeSelector } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import { useApp } from "@/components/app/AppContext";
import { useStudio } from "@/components/studio/StudioContext";

export function ProfileView() {
  const { profile, mode, saved } = useDataState();
  const app = useApp();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-ink">Perfil y preferencias</h1>

      <Card className="flex items-center gap-4 p-5">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-ink-2">
          {mode === "cloud" ? <Cloud className="size-6" aria-hidden /> : <HardDrive className="size-6" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          {mode === "local" ? (
            <>
              <p className="font-semibold text-ink">Modo sin cuenta</p>
              <p className="text-sm text-ink-3">
                Tus {saved.length} fichas y preferencias se guardan en este dispositivo. Si borras los datos del navegador, se pierden.
              </p>
            </>
          ) : profile ? (
            <>
              <p className="font-semibold text-ink">{profile.email}</p>
              <p className="text-sm text-ink-3">Tus fichas se sincronizan con tu cuenta.</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-ink">No iniciaste sesión</p>
              <p className="text-sm text-ink-3">Ingresa para guardar fichas en tu cuenta y publicar en la comunidad.</p>
            </>
          )}
        </div>
        {mode === "cloud" &&
          (profile ? (
            <Button variant="secondary" onClick={() => dataActions.signOut()} icon={<LogOut className="size-4" aria-hidden />}>
              Salir
            </Button>
          ) : (
            <Button variant="primary" onClick={() => app.openAuth()}>
              Ingresar
            </Button>
          ))}
      </Card>

      {profile && <ProfileForm key={profile.id} />}

      <Card className="p-5">
        <SectionTitle title="Apariencia" />
        <ThemeSelector />
      </Card>
    </div>
  );
}

function ProfileForm() {
  const { profile } = useDataState();
  const { dispatch } = useStudio();
  const toast = useToast();
  const [name, setName] = useState(profile!.name);
  const [school, setSchool] = useState(profile!.school);
  const [role, setRole] = useState(profile!.role);
  const [header, setHeader] = useState<SheetHeaderOptions>({ ...DEFAULT_HEADER, ...profile!.defaultHeader });
  const [pageSize, setPageSize] = useState<PageSize>(profile!.defaultPageSize);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const defaultHeader = { ...header, schoolName: header.schoolName || school };
      await dataActions.updateProfile({ name, school, role, defaultHeader, defaultPageSize: pageSize });
      toast.show("Preferencias guardadas", {
        action: {
          label: "Aplicar a la ficha actual",
          onClick: () => {
            dispatch({ type: "patchHeader", patch: defaultHeader });
            dispatch({ type: "patchSheet", patch: { pageSize } });
          },
        },
      });
    } catch (err) {
      toast.show((err as Error).message, { tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <Card className="space-y-4 p-5">
        <SectionTitle title="Tus datos" />
        <Field label="Nombre">{(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}</Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Escuela" optional>
            {(p) => <Input {...p} value={school} onChange={(e) => setSchool(e.target.value)} autoComplete="organization" />}
          </Field>
          <Field label="Cargo" optional>
            {(p) => <Input {...p} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Docente de 4.º grado" />}
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <SectionTitle title="Valores por defecto de las fichas nuevas" />
        <fieldset className="space-y-1">
          <legend className="mb-1 text-sm font-semibold text-ink">Encabezado</legend>
          <Switch label="Nombre" checked={header.showName} onChange={(v) => setHeader((h) => ({ ...h, showName: v }))} />
          <Switch label="Fecha" checked={header.showDate} onChange={(v) => setHeader((h) => ({ ...h, showDate: v }))} />
          <Switch label="Curso / grado" checked={header.showGrade} onChange={(v) => setHeader((h) => ({ ...h, showGrade: v }))} />
          <Switch label="Nota" checked={header.showScore} onChange={(v) => setHeader((h) => ({ ...h, showScore: v }))} />
        </fieldset>
        <Field label="Nombre de la escuela en la hoja" optional hint="Si lo dejas vacío, se usa el de tus datos.">
          {(p) => <Input {...p} value={header.schoolName ?? ""} onChange={(e) => setHeader((h) => ({ ...h, schoolName: e.target.value }))} />}
        </Field>
        <Segmented<PageSize>
          label="Tamaño de papel"
          value={pageSize}
          onChange={setPageSize}
          options={[
            { value: "A4", label: "A4" },
            { value: "LETTER", label: "Carta" },
          ]}
        />
      </Card>

      <Button type="submit" variant="primary" loading={busy} className="w-full sm:w-auto">
        Guardar preferencias
      </Button>
    </form>
  );
}
