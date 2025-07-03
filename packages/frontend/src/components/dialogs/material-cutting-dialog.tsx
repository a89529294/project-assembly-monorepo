import { Spinner } from "@/components/spinner";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Material } from "@myapp/shared";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  pieces: z.coerce
    .number({ invalid_type_error: "請輸入數字" })
    .int({ message: "請輸入整數" })
    .min(1, { message: "切割數量至少為1" })
    .max(10, { message: "切割數量不能超過10" }),
});

interface MaterialCuttingDialogProps {
  material: Material;
}

export function MaterialCuttingDialog({
  material,
}: MaterialCuttingDialogProps) {
  const cutMaterial = useMutation(trpc.warehouse.cutMaterial.mutationOptions());
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pieces: 1,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    cutMaterial.mutate(
      {
        materialId: material.id,
        count: values.pieces,
      },
      {
        onSuccess() {
          form.reset();
          setIsOpen(false);
          queryClient.invalidateQueries({
            queryKey: trpc.warehouse.readPurchases.infiniteQueryKey(),
          });
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="pieces"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>切割數量</FormLabel>
                  <FormControl>
                    <Input
                      disabled={cutMaterial.isPending}
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={cutMaterial.isPending}>
                {cutMaterial.isPending && <Spinner />}
                確認切割
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
