import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

type VisibleFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  required: boolean;
  label?: string;
  hidden?: false | undefined;
};

type HiddenFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  hidden: true;
  // label and required are omitted when hidden is true
};

type TextFieldProps<T extends FieldValues> =
  | VisibleFieldProps<T>
  | HiddenFieldProps<T>;

export function TextField<T extends FieldValues>(props: TextFieldProps<T>) {
  const { form, name, hidden } = props;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={hidden ? "sr-only" : ""}>
          {!hidden && (
            <FormLabel>
              {props.label ?? name}
              {props.required && <span className="text-red-400"> *</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input {...field} hidden={hidden} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
