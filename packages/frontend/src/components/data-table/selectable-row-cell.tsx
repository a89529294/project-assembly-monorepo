import { Checkbox } from "@/components/ui/checkbox";

export function SelectionRowCell({
  isSelected,
  toggleSelected,
}: {
  isSelected: boolean;
  toggleSelected: (value: boolean) => void;
}) {
  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={(value) => {
        toggleSelected(!!value);
      }}
      aria-label="Select row"
    />
  );
}
