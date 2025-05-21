import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ReactNode } from "@tanstack/react-router";

export function ScrollableBody({
  children,
  disabled,
  border,
}: {
  children: ReactNode;
  disabled?: boolean;
  border?: boolean;
}) {
  return (
    <div className="flex-1 relative">
      <div className="absolute inset-0 bottom-6">
        <ScrollArea
          className={cn(
            "h-full",
            disabled && "opacity-50",
            border && "rounded-md border"
          )}
        >
          {children}
        </ScrollArea>
      </div>
    </div>
  );
}
