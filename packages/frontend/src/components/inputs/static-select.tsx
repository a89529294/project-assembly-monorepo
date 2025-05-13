import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function StaticSelect<
  T extends { key: U; label: string },
  U extends string,
>({
  value,
  onValueChange,
  options,
  placeholder = "",
  triggerClassName,
}: {
  value: U;
  onValueChange: (u: U) => void;
  options: T[];
  placeholder?: string;
  triggerClassName?: string;
}) {
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger className={cn("w-40", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent className="w-[--radix-select-trigger-width]">
        {options.map((op) => (
          <SelectItem key={op.key} value={op.key}>
            {op.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
