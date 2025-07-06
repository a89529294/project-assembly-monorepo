import { Loader2 } from "lucide-react";

export function FullScreenSpinner() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
