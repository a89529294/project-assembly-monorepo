import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

export function CenteredGraySpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center", className)}>
      <Spinner className="text-gray-300" />
    </div>
  );
}
