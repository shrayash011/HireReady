import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, className = "", ...rest },
  ref
) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</span>}
      <input
        ref={ref}
        className={`rounded-input border border-border bg-surface px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:border-accent ${className}`}
        {...rest}
      />
      {hint && <span className="text-[11px] text-text-muted">{hint}</span>}
    </label>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, className = "", ...rest },
  ref
) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</span>}
      <textarea
        ref={ref}
        className={`rounded-input border border-border bg-surface px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:border-accent ${className}`}
        {...rest}
      />
      {hint && <span className="text-[11px] text-text-muted">{hint}</span>}
    </label>
  );
});
