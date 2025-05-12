import { RenderQueryResult } from "@/components/render-query-result";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { LucideRotateCcwKey } from "lucide-react";
import { useEffect, useState } from "react";

export function DialogNewPassword({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const { mutate, isSuccess, isError, isPending } = useMutation(
    trpc.personnelPermission.generatePasswordForUser.mutationOptions()
  );

  useEffect(() => {
    if (!open || password) return;

    mutate(
      {
        userId,
      },
      {
        onSuccess({ plainPassword }) {
          setPassword(plainPassword);
        },
      }
    );
  }, [userId, mutate, open, password]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="cursor-pointer">
        <LucideRotateCcwKey className="text-green-500 size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>密碼</DialogTitle>
          <DialogDescription className="flex justify-center relative min-h-10 items-center">
            <RenderQueryResult
              data={password}
              isSuccess={isSuccess}
              isError={isError}
              isFetching={isPending}
              isLoading={isPending}
              errorComponent={"無法產生密碼"}
            >
              {(data) => data}
            </RenderQueryResult>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
