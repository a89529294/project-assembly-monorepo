import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { YearMonthDateCalendar } from "@/components/year-month-date-calendar";
import { cn } from "@/lib/utils";
import {
  FieldPathByValue,
  FieldValues,
  PathValue,
  UseFormReturn,
} from "react-hook-form";

export function DateField<T extends FieldValues>({
  form,
  name,
  required,
  label,
}: {
  form: UseFormReturn<T>;
  name: FieldPathByValue<T, Date | null | undefined>;
  required: boolean;
  label?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className="flex flex-col">
            <FormLabel>
              {label ?? name}{" "}
              {required && <span className="text-red-400"> *</span>}
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal disabled:opacity-50",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={field.disabled}
                  >
                    {field.value ? (
                      format(field.value, "yyyy年MM月dd日")
                    ) : (
                      <span>選一個日期</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <YearMonthDateCalendar
                  value={form.getValues(name)}
                  onChange={(s) =>
                    form.setValue(name, s as PathValue<T, typeof name>)
                  }
                />
              </PopoverContent>
            </Popover>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
