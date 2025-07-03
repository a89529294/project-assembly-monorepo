import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
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
import { CalendarIcon, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { YearMonthDateCalendar } from "@/components/year-month-date-calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { TRPCQueryKey } from "@trpc/tanstack-react-query";

export function MaterialDetailDialog({
  material,
  queryKeyToInvalidate,
}: {
  material?: Material;
  queryKeyToInvalidate: TRPCQueryKey;
}) {
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

  const deleteMaterial = useMutation(
    trpc.warehouse.deleteMaterial.mutationOptions()
  );

  const isPending = isCreating || isUpdating || deleteMaterial.isPending;

  const showSubmitSpinner = isCreating || isUpdating;
  const showDeleteSpinner = deleteMaterial.isPending;

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
        millSheetNoU: material.millSheetNoU ?? undefined,
        millSheetNo: material.millSheetNo ?? undefined,
        millSheetNoNR: material.millSheetNoNR ?? undefined,
        loadingDate: material.loadingDate ?? undefined,
        arrivalDate: material.arrivalDate ?? undefined,
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

      form.reset();
      setOpen(false);

      toast.success("成功更新素材");
      await queryClient.invalidateQueries({
        queryKey: queryKeyToInvalidate,
      });
      navigate({
        search: (prev) => ({
          ...prev,
          filters: [],
        }),
      });
    } catch (error) {
      console.error("Failed to create purchase:", error);
    }
  };

  const handleDeleteMaterial = () => {
    if (!material) return;

    deleteMaterial.mutate(material.id, {
      onSuccess() {
        toast.success("成功移除素材");
        queryClient.invalidateQueries({
          queryKey: queryKeyToInvalidate,
        });
      },
    });
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
            <ScrollArea className="h-96">
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
                <FormPopoverCalendar
                  form={form}
                  label="供應商出廠日期"
                  name="loadingDate"
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
                <FormField
                  control={form.control}
                  name="millSheetNoU"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>超音波證明</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormPopoverCalendar
                  form={form}
                  label="進貨日期"
                  name="arrivalDate"
                />
              </div>
            </ScrollArea>
            <footer className="flex gap-2 justify-end">
              {material && (
                <Button
                  type="button"
                  className=""
                  disabled={isPending}
                  variant="destructive"
                  onClick={handleDeleteMaterial}
                >
                  {showDeleteSpinner && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  刪除素材
                </Button>
              )}
              <Button type="submit" className="" disabled={isPending}>
                {showSubmitSpinner && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                提交
              </Button>
            </footer>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function FormPopoverCalendar({
  form,
  name,
  label,
}: {
  form: UseFormReturn<z.infer<typeof createPurchaseInputSchema>>;
  name: "arrivalDate" | "loadingDate";
  label: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "pl-3 text-left font-normal disabled:opacity-50 flex-1",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "yyyy年MM月dd日")
                  ) : (
                    <span>選擇日期</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <YearMonthDateCalendar
                value={field.value ?? undefined}
                onChange={field.onChange}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
