"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Libellé, aide et message d'erreur autour d'un champ. */
export function Field({
  label,
  hint,
  error,
  optional,
  htmlFor,
  className,
  children,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-[13.5px] font-bold text-ink">
          {label}
          {optional && <span className="ml-1.5 font-medium text-faint">(facultatif)</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[12.5px] font-semibold text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[12.5px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputBase =
  "w-full rounded-[14px] border border-line bg-white text-[15px] font-medium text-ink placeholder:text-faint " +
  "transition-[border-color,box-shadow] duration-150 outline-none " +
  "focus:border-brand/60 focus:ring-4 focus:ring-brand/10 disabled:bg-surface-alt disabled:text-muted";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  suffix?: ReactNode;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ icon, suffix, invalid, className, ...rest }, ref) {
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted [&_svg]:h-[18px] [&_svg]:w-[18px]">{icon}</span>}
      <input
        ref={ref}
        className={cn(
          inputBase,
          "h-12 px-4",
          icon && "pl-11",
          suffix && "pr-16",
          invalid && "border-danger/60 focus:border-danger focus:ring-danger/10",
          className,
        )}
        {...rest}
      />
      {suffix && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-muted">{suffix}</span>}
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function Textarea({ className, invalid, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(inputBase, "min-h-[104px] resize-y px-4 py-3 leading-relaxed", invalid && "border-danger/60", className)}
        {...rest}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { icon?: ReactNode }>(
  function Select({ className, icon, children, ...rest }, ref) {
    return (
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted [&_svg]:h-[18px] [&_svg]:w-[18px]">{icon}</span>}
        <select ref={ref} className={cn(inputBase, "h-12 appearance-none pl-4 pr-10", icon && "pl-11", className)} {...rest}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>
    );
  },
);

/** Champ texte avec libellé (raccourci courant). */
export function TextField({
  label,
  hint,
  error,
  optional,
  ...rest
}: InputProps & { label?: ReactNode; hint?: ReactNode; error?: string | null; optional?: boolean }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} optional={optional} htmlFor={id}>
      <Input id={id} invalid={!!error} {...rest} />
    </Field>
  );
}

/** Interrupteur on/off. */
export function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50",
        checked ? "bg-brand" : "bg-line",
      )}
    >
      <span
        className={cn(
          "inline-block h-5.5 w-5.5 rounded-full bg-white shadow-md transition-transform duration-200",
          checked ? "translate-x-[23px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}
