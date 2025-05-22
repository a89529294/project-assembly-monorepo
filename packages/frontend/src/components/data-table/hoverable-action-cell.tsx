import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

type RevealOnHoverProps = ComponentProps<"button">;

export function RevealOnHover({
  className,
  children,
  ...props
}: RevealOnHoverProps) {
  return (
    <button
      className={cn(
        "place-items-center cursor-pointer hidden group-hover:grid [tr:has(button[data-state=open])_&]:grid",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
