import * as React from "react";

import { cn } from "./utils";
import { Label } from "./label";
import { Textarea } from "./textarea";

type InputProps = React.ComponentProps<"input"> & {
  label?: string;
  containerClassName?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, label, containerClassName, error, helperText, icon, id, ...props },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;

    return (
      <div className={cn("space-y-1", containerClassName)}>
        {label && (
          <Label htmlFor={inputId} className="text-sm text-[var(--tg-theme-text-color,#000)]">
            {label}
          </Label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            data-slot="input"
            aria-invalid={!!error || undefined}
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              icon && "pl-10",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              className,
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

type TextAreaProps = React.ComponentProps<"textarea"> & {
  label?: string;
  containerClassName?: string;
  error?: string;
  helperText?: string;
};

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, containerClassName, error, helperText, id, ...props }, ref) => {
    const reactId = React.useId();
    const textareaId = id ?? reactId;

    return (
      <div className={cn("space-y-1", containerClassName)}>
        {label && (
          <Label htmlFor={textareaId} className="text-sm text-[var(--tg-theme-text-color,#000)]">
            {label}
          </Label>
        )}
        <Textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error || undefined}
          className={className}
          {...props}
        />
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  },
);
TextArea.displayName = "TextArea";

export { Input, TextArea };
