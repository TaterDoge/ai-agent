import type * as React from "react";
import { cn } from "./lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-border-default bg-surface-canvas px-4 text-content-primary text-sm outline-hidden transition-colors placeholder:text-content-tertiary focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-500/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-border-error aria-invalid:ring-2 aria-invalid:ring-state-error/20",
        className
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}

export { Input };
