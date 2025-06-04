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

type BaseProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  loading?: boolean;
  options: { value: string; label: string }[] | undefined;
  onSelect?: () => void;
  containerClassName?: string;
  placeholder?: string;
};

type SelectFieldProps<T extends FieldValues> = BaseProps<T> &
  (
    | {
        hideLabel: true;
      }
    | {
        hideLabel?: false;
        label: string;
        required: boolean;
      }
  );

export function SelectField<T extends FieldValues>(props: SelectFieldProps<T>) {
  const { form, name, options, loading, onSelect, hideLabel } = props;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={props.containerClassName}>
          {!hideLabel && (
            <FormLabel>
              {props.label}{" "}
              {props.required && <span className="text-red-400"> *</span>}
            </FormLabel>
          )}
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
                <SelectValue placeholder={props.placeholder} />
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
