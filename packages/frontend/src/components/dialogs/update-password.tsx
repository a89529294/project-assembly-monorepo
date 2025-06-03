import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/form/text-field";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";

const passwordSchema = z
  .object({
    oldPassword: z.string().min(8, "舊密碼至少8個字元"),
    newPassword: z.string().min(8, "新密碼至少8個字元"),
    confirmationPassword: z.string().min(8, "請再次輸入新密碼"),
  })
  .refine((data) => data.newPassword === data.confirmationPassword, {
    message: "新密碼與確認密碼不一致",
    path: ["confirmationPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function DialogUpdatePassword() {
  const [open, setOpen] = useState(false);
  const { mutate: updatePassword, isPending } = useMutation(
    trpc.auth.updatePassword.mutationOptions()
  );

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmationPassword: "",
    },
    disabled: isPending,
  });

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const handleSubmit = async (values: PasswordFormValues) => {
    updatePassword(
      {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess() {
          handleClose();
          // Move this into query-client.ts, just like toast.error
          toast.success("成功更新密碼");
        },
        onError() {},
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) handleClose();
      }}
    >
      <DialogTrigger asChild>
        <button className="bg-primary-300 flex items-center gap-2 py-3 px-4 rounded-sm text-button-md text-secondary-900 cursor-pointer">
          <img src="/reset-pw.png" />
          變更密碼
        </button>
      </DialogTrigger>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>變更密碼</DialogTitle>
          <DialogDescription>請輸入舊密碼與新密碼</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4 mt-2"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <TextField
              form={form}
              name="oldPassword"
              label="舊密碼"
              required
              type="password"
            />
            <TextField
              form={form}
              name="newPassword"
              label="新密碼"
              required
              type="password"
            />
            <TextField
              form={form}
              name="confirmationPassword"
              label="確認新密碼"
              required
              type="password"
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                取消
              </Button>
              <Button
                type="submit"
                className="bg-primary-300 text-secondary-900 hover:bg-primary-400"
                disabled={isPending}
              >
                確認
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
