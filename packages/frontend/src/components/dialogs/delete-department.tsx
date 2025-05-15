import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDeleteDepartment } from "@/hooks/departments/use-delete-department";
import { useDepartment } from "@/hooks/departments/use-department";
import { LucideTrash2 } from "lucide-react";
import { useState } from "react";

export function DialogDeleteDepartment({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const { department } = useDepartment(id);
  const { deleteDepartment, isPending } = useDeleteDepartment();

  const onDeleteDepartment = () => {
    deleteDepartment(
      { departmentId: id },
      {
        onSuccess() {
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <LucideTrash2 className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            刪除部門 <span className="font-normal">{department?.name}</span>
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
          <Button
            disabled={isPending}
            variant="destructive"
            onClick={onDeleteDepartment}
          >
            {isPending ? "刪除中" : "刪除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
