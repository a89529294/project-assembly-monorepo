import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HTMLInputTypeAttribute, useState } from "react";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

type BaseProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  type?: HTMLInputTypeAttribute;
  containerClassName?: string;
  placeholder?: string;
  inputClassName?: string;
};

type VisibleFieldProps<T extends FieldValues> =
  | ({
      hideLabel: true;
      hidden?: false;
    } & BaseProps<T>)
  | ({
      hideLabel?: false;
      required?: boolean;
      hideAsterisk?: boolean;
      label?: string;
      hidden?: false;
      labelClassName?: string;
    } & BaseProps<T>);

type HiddenFieldProps<T extends FieldValues> = {
  hidden: true;
  hideLabel?: boolean;
} & BaseProps<T>;

type TextFieldProps<T extends FieldValues> =
  | VisibleFieldProps<T>
  | HiddenFieldProps<T>;

export function TextField<T extends FieldValues>(props: TextFieldProps<T>) {
  const { form, name, hidden, type, hideLabel } = props;
  const [eyeState, setEyeState] = useState<"open" | "closed">("closed");

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn("", props.containerClassName, hidden && "sr-only")}
        >
          {!hidden && !hideLabel && (
            <FormLabel
              className={cn("gap-0 text-title-mn", props.labelClassName)}
            >
              {props.label ?? name}
              {props.required && !props.hideAsterisk && (
                <span className="text-red-400">*</span>
              )}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative flex-1 ">
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
                className={cn(
                  "md:text-body-lg text-secondary-900",
                  props.inputClassName
                )}
                placeholder={props.placeholder}
              />

              {type === "password" && (
                <img
                  className="size-4 absolute right-2.5 top-1/2 -translate-y-1/2"
                  src={
                    eyeState === "closed" ? "/eye-close.png" : "/eye-open.png"
                  }
                  onClick={() =>
                    setEyeState((v) => (v === "closed" ? "open" : "closed"))
                  }
                />
              )}
              <FormMessage className="absolute translate-y-1" />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
