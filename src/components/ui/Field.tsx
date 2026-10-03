import React, { useId } from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 text-base text-ink placeholder:text-ink-3 sm:text-sm " +
  "transition-colors focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/20 disabled:opacity-60";

interface FieldProps {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  hideLabel?: boolean;
  className?: string;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => React.ReactNode;
}

/** Etiqueta + control + ayuda/error, con los atributos de accesibilidad conectados. */
export function Field({ label, hint, error, optional, hideLabel, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const describedBy = error || hint ? hintId : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className={cn("mb-1.5 block text-sm font-semibold text-ink", hideLabel && "sr-only")}>
        {label}
        {optional && <span className="ml-1 font-normal text-ink-3">(opcional)</span>}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {(error || hint) && (
        <p id={hintId} className={cn("mt-1.5 text-sm", error ? "text-danger-ink" : "text-ink-3")}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> }) {
  return <input className={cn(controlBase, "h-11", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: React.Ref<HTMLTextAreaElement> }) {
  return <textarea className={cn(controlBase, "py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlBase, "h-11 cursor-pointer pr-8", className)} {...props}>
      {children}
    </select>
  );
}
