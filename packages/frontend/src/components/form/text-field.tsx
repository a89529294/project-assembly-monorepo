import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { HTMLInputTypeAttribute, useState } from "react";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

type VisibleFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  required?: boolean;
  label?: string;
  hidden?: false | undefined;
  type?: HTMLInputTypeAttribute;
};

type HiddenFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  hidden: true;
  type?: HTMLInputTypeAttribute;
  // label and required are omitted when hidden is true
};

type TextFieldProps<T extends FieldValues> =
  | VisibleFieldProps<T>
  | HiddenFieldProps<T>;

export function TextField<T extends FieldValues>(props: TextFieldProps<T>) {
  const { form, name, hidden, type } = props;
  const [eyeState, setEyeState] = useState<"open" | "closed">("closed");

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
            <div className="relative">
              <Input
                {...field}
                hidden={hidden}
                type={
                  type === "password"
                    ? eyeState === "closed"
                      ? "password"
                      : "text"
                    : type
                }
              />

              <img
                className="size-4 absolute right-2.5 top-1/2 -translate-y-1/2"
                src={eyeState === "closed" ? "/eye-close.png" : "/eye-open.png"}
                onClick={() =>
                  setEyeState((v) => (v === "closed" ? "open" : "closed"))
                }
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
