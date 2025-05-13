import { Spinner } from "@/components/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function AsyncSelect<
  T extends { key: U; label: string },
  U extends string,
>({
  value,
  onValueChange,
  options,
  isLoading,
  placeholder = "",
  triggerClassName,
}: {
  value: U;
  onValueChange: (u: U) => void;
  isLoading: boolean;
  options: T[] | undefined;
  placeholder?: string;
  triggerClassName?: string;
}) {
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger className={cn("w-40", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent className="w-[--radix-select-trigger-width]">
        {isLoading ? (
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
            <SelectItem key={op.key} value={op.key}>
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
  );
}
