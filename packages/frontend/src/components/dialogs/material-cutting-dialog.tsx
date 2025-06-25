import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Material } from "@myapp/shared";

interface MaterialCuttingDialogProps {
  material: Material;
}

export function MaterialCuttingDialog({
  material,
}: MaterialCuttingDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">切割</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>切割素材</DialogTitle>
          <DialogDescription>
            對素材 {material.labelId} 進行切割。
          </DialogDescription>
        </DialogHeader>
        <div>
          <p>素材ID: {material.labelId}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
