import { TextField } from "@/components/form/text-field";
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
import { Form } from "@/components/ui/form";
import { useCreateDepartment } from "@/hooks/departments/use-create-department";
import { useUpdateDepartment } from "@/hooks/departments/use-update-department";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateDepartment,
  createDepartmentSchema,
  DepartmentSummary,
  UpdateDepartment,
  updateDepartmentSchema,
} from "@myapp/shared";
import { LucidePen, LucidePlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function DialogDepartment({
  department,
}: {
  department?: DepartmentSummary;
}) {
  const [open, setOpen] = useState(false);

  const { updateDepartment, isPending: isUpdatePending } = useUpdateDepartment(
    department?.id ?? ""
  );
  const { createDepartment, isPending: isCreatePending } =
    useCreateDepartment();

  const isEditing = !!department;

  const isPending = isEditing ? isUpdatePending : isCreatePending;

  const defaultValues = isEditing
    ? {
        id: department.id,
        name: department.name,
        enPrefix: department.enPrefix,
        zhPrefix: department.zhPrefix,
      }
    : {
        name: "",
        enPrefix: "",
        zhPrefix: "",
      };

  const form = useForm<UpdateDepartment | CreateDepartment>({
    resolver: zodResolver(
      isEditing ? updateDepartmentSchema : createDepartmentSchema
    ),
    defaultValues,
  });

  const onSubmit = async (values: UpdateDepartment | CreateDepartment) => {
    if ("id" in values) {
      updateDepartment(values, {
        onSuccess() {
          setOpen(false);
          form.reset(values);
        },
      });
    } else {
      createDepartment(values, {
        onSuccess() {
          setOpen(false);
          form.reset();
        },
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) form.reset();
      }}
    >
      <DialogTrigger asChild>
        {isEditing ? (
          <button
            className={cn(
              "place-items-center cursor-pointer hidden group-hover:grid data-[state=open]:grid"
            )}
          >
            <LucidePen className={"size-4"} />
          </button>
        ) : (
          <Button variant="outline">
            <LucidePlus className="h-4 w-4" />
            新增部門
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "修改部門" : "新增部門"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "更新部門資訊" : "填寫部門資訊"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (e) => console.log(e))}>
            <div className="grid gap-4 py-4">
              {isEditing && <TextField form={form} name="id" hidden />}
              <TextField form={form} name="name" label="名稱" required={true} />
              <TextField
                form={form}
                name="enPrefix"
                label="英文前綴"
                required={true}
              />
              <TextField
                form={form}
                name="zhPrefix"
                label="中文前綴"
                required={true}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEditing
                    ? "更新中..."
                    : "新增中..."
                  : isEditing
                    ? "更新部門"
                    : "新增部門"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
