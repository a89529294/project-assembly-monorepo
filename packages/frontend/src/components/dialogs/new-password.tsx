import { RenderResult } from "@/components/render-result";
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
  // this is used to saved pw in memory so if user opens the dialog again we dont need to make another mutation
  const [password, setPassword] = useState("");
  const newUserPasswordMutation = useMutation(
    trpc.personnelPermission.generatePasswordForUser.mutationOptions()
  );

  useEffect(() => {
    if (!open || password) return;

    newUserPasswordMutation.mutate(
      {
        userId,
      },
      {
        onSuccess({ plainPassword }) {
          setPassword(plainPassword);
        },
      }
    );
  }, [open, password, userId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="cursor-pointer">
        <LucideRotateCcwKey className="text-green-500 size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>密碼</DialogTitle>
          <DialogDescription className="flex justify-center relative min-h-10 items-center">
            <RenderResult
              useMutationResult={newUserPasswordMutation}
              errorComponent={<span>無法產生密碼</span>}
            >
              {(data) => <span>{data.plainPassword}</span>}
            </RenderResult>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
