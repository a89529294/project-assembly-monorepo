import { RevealOnHover } from "@/components/data-table/hoverable-action-cell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LucideTrash2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export function DialogDeleteBase({
  entityType,
  entityName,
  isPending,
  onDelete,
  open,
  setOpen,
}: {
  entityType: string;
  entityName: string;
  isPending: boolean;
  onDelete: () => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <RevealOnHover>
          <LucideTrash2 className="size-4" />
        </RevealOnHover>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            刪除{entityType} <span className="font-normal">{entityName}</span>
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            disabled={isPending}
            variant="outline"
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
          <Button disabled={isPending} variant="destructive" onClick={onDelete}>
            {isPending ? "刪除中" : "刪除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
