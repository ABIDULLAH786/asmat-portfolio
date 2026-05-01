"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display text-xs uppercase tracking-[0.15em] font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]",
  {
    variants: {
      variant: {
        primary:
          "bg-[#00ff88] text-black border border-[#00ff88] hover:bg-transparent hover:text-[#00ff88] hover:shadow-[0_0_22px_rgba(0,255,136,0.55)]",
        outline:
          "bg-transparent text-[#00ff88] border border-[#00ff88] hover:bg-[#00ff88] hover:text-black hover:shadow-[0_0_22px_rgba(0,255,136,0.55)]",
        ghost:
          "bg-transparent text-white/80 hover:text-[#00ff88]",
        danger:
          "bg-transparent text-red-400 border border-red-500/40 hover:bg-red-500/15",
        muted:
          "bg-[#111] text-white/80 border border-[#1a1a1a] hover:border-[#00ff88]/50 hover:text-white",
      },
      size: {
        sm: "h-8 px-3 text-[10px]",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
