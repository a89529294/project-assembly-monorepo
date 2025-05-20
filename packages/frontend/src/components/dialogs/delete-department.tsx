import { DialogDeleteBase } from "@/components/dialogs/delete-base";
import { useDeleteDepartment } from "@/hooks/departments/use-delete-department";
import { DepartmentSummary } from "@myapp/shared";
import { useState } from "react";

export function DialogDeleteDepartment({
  department,
}: {
  department: DepartmentSummary;
}) {
  const [open, setOpen] = useState(false);
  const { deleteDepartment, isPending } = useDeleteDepartment();

  const onDeleteDepartment = () => {
    deleteDepartment(
      { departmentId: department.id },
      {
        onSuccess() {
          setOpen(false);
        },
      }
    );
  };

  return (
    <DialogDeleteBase
      entityType="部門"
      entityName={department.name}
      isPending={isPending}
      onDelete={onDeleteDepartment}
      open={open}
      setOpen={setOpen}
    />
  );
}
