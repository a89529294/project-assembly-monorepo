import { ReactNode } from "@tanstack/react-router";

export function HoverableActionButton({ children }: { children: ReactNode }) {
  return (
    <div className="place-items-center cursor-pointer hidden group-hover:grid pr-4">
      {children}
    </div>
  );
}
