import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createPurchaseInputSchema, Material } from "@myapp/shared";
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function MaterialCreateDialog({ material }: { material?: Material }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate({ from: "/warehouse/purchases" });
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof createPurchaseInputSchema>>({
    resolver: zodResolver(createPurchaseInputSchema),
  });

  const { mutateAsync: createPurchase, isPending: isCreating } = useMutation(
    trpc.warehouse.createPurchase.mutationOptions()
  );

  const { mutateAsync: updatePurchase, isPending: isUpdating } = useMutation(
    trpc.warehouse.updatePurchase.mutationOptions()
  );

  const isPending = isCreating || isUpdating;

        useEffect(() => {
    if (material) {
      form.reset({
        ...material,
        supplier: material.supplier ?? undefined,
        labelId: material.labelId ?? undefined,
        typeName: material.typeName ?? undefined,
        procurementNumber: material.procurementNumber ?? undefined,
        loadingNumber: material.loadingNumber ?? undefined,
        furnaceNumber: material.furnaceNumber ?? undefined,
        millSheetNo: material.millSheetNo ?? undefined,
        millSheetNoNR: material.millSheetNoNR ?? undefined,
        loadingDate: material.loadingDate
          ? format(material.loadingDate, "yyyy-MM-dd")
          : undefined,
        length: Number(material.length),
        weight: Number(material.weight),
      });
    }
  }, [material, form]);

  const onSubmit = async (
    values: z.infer<typeof createPurchaseInputSchema>
  ) => {
    try {
            if (material) {
        await updatePurchase({ ...values, id: material.id });
      } else {
        await createPurchase(values);
      }

      // Reset query and navigate first to let the background update
      await queryClient.resetQueries({
        queryKey: trpc.warehouse.readPurchases.infiniteQueryKey(),
      });
      navigate({
        search: (prev) => ({
          ...prev,
          filters: [],
        }),
      });

      // Reset form and close dialog last, once the UI is stable
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to create purchase:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {material ? (
          <Button variant="secondary">編輯</Button>
        ) : (
          <Button>新增素材</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{material ? "編輯素材" : "新增素材"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>供應商</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="labelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>素材ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="typeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>素材型號</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      材質<span className="text-red-400"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      斷面規格<span className="text-red-400"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      長度<span className="text-red-400"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      重量<span className="text-red-400"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="procurementNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>採購案號</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="loadingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>裝車單號</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="loadingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>供應商出廠日期</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="furnaceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>爐號</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="millSheetNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>材質證明</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="millSheetNoNR"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>無輻射證明</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              提交
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
