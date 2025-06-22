import {
  Dialog,  DialogContent,  DialogHeader,  DialogTitle,  DialogTrigger,} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function MaterialCreateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>新增素材</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新增素材</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Placeholder for form fields */}
          <p>Material creation form will go here.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
