import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { YearMonthDatePicker } from "@/components/comp-497";
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
import { cn } from "@/lib/utils";
import { useReducer } from "react";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

export function DateField<T extends FieldValues>({
  form,
  name,
  required,
  label,
}: {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  required: boolean;
  label?: string;
}) {
  const [_, rerender] = useReducer(() => ({}), {});

  console.log(form.getValues(name));

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        console.log(field.value);
        return (
          <FormItem className="flex flex-col">
            <FormLabel>{label ?? name}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>選一個日期</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <YearMonthDatePicker
                  mode="single"
                  value={field.value}
                  onChange={field.onChange}
                  // disabled={(date) =>
                  //   date > new Date() || date < new Date("1900-01-01")
                  // }
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
