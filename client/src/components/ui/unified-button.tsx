import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const unifiedButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-dusty-blue text-white shadow-md hover:opacity-90 hover:shadow-lg",
        secondary: "border-2 border-blush-pink text-blush-pink bg-white hover:bg-blush-pink hover:text-slate-800 shadow-sm hover:shadow-md",
        outline: "border-2 border-slate-300 text-slate-600 bg-white hover:border-slate-400 hover:text-slate-700 shadow-sm hover:shadow-md",
        ghost: "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        xl: "h-16 px-10 py-5 text-xl"
      },
      shape: {
        default: "rounded-full",
        rounded: "rounded-xl",
        square: "rounded-lg"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      shape: "default"
    }
  }
);

export interface UnifiedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof unifiedButtonVariants> {
  asChild?: boolean;
}

const UnifiedButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(unifiedButtonVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
UnifiedButton.displayName = "UnifiedButton";

export { UnifiedButton, unifiedButtonVariants };