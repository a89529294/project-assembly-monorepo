// src/components/page-shell.tsx
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={cn(
        "p-6 pb-0 bg-white flex flex-col rounded-lg shadow-lg h-full",
        className
      )}
    >
      {children}
    </div>
  );
}
