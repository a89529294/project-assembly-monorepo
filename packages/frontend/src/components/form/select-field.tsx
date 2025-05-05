import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Spinner } from "@/components/spinner";

export function SelectField<T extends FieldValues>({
  form,
  name,
  required,
  label,
  options,
  loading,
  onSelect,
}: {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  required: boolean;
  label?: string;
  loading?: boolean;
  options: { value: string; label: string }[] | undefined;
  onSelect?: () => void;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label ?? name}{" "}
            {required && <span className="text-red-400"> *</span>}
          </FormLabel>
          <Select
            disabled={field.disabled}
            onValueChange={(...args) => {
              field.onChange(...args);
              if (onSelect) onSelect();
            }}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {loading ? (
                <SelectItem
                  className="flex justify-center"
                  key="loading"
                  value="loading"
                  disabled
                >
                  <Spinner className="mx-0 text-black relative left-3" />
                </SelectItem>
              ) : options ? (
                options.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem key="no-options" value="no-options" disabled>
                  無選項
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
