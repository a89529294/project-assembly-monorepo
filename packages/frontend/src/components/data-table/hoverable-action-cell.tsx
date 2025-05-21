import { cn } from "@/lib/utils";
import { ReactNode } from "@tanstack/react-router";

export function RevealOnHover({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "place-items-center cursor-pointer hidden group-hover:grid data-[state=open]:grid",
        className
      )}
    >
      {children}
    </div>
  );
}
