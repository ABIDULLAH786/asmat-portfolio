"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-white/40",
      "focus:border-[#00ff88] focus:outline-none focus:ring-1 focus:ring-[#00ff88]/40",
      "disabled:opacity-60",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[88px] w-full rounded-md border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-white/40",
      "focus:border-[#00ff88] focus:outline-none focus:ring-1 focus:ring-[#00ff88]/40",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block font-display text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1.5",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";
