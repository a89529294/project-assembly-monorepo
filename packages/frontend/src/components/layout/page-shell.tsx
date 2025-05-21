// src/components/page-shell.tsx

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  header: ReactNode;
  className?: string;
}

export function PageShell({ className, header, children }: PageShellProps) {
  return (
    <div
      className={cn(
        "p-6 pb-0 bg-white flex flex-col rounded-lg shadow-lg h-full gap-4",
        className
      )}
    >
      {header}
      {children}
    </div>
  );
}
