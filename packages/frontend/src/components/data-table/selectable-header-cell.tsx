import { Checkbox } from "@/components/ui/checkbox";
import { SelectionState } from "@/hooks/use-selection";

interface SelectionHeaderCellProps {
  selection: SelectionState;
  onSelectAllChange: (checked: boolean) => void;
  tableGetIsAllPageRowsSelected?: () => boolean;
}

export function SelectionHeaderCell({
  selection,
  onSelectAllChange,
  tableGetIsAllPageRowsSelected,
}: SelectionHeaderCellProps) {
  const checked = selection
    ? selection.selectAll === false
      ? false
      : selection.deselectedIds.size === 0
        ? true
        : "indeterminate"
    : tableGetIsAllPageRowsSelected?.() || false;

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(value) => {
        onSelectAllChange(!!value);
      }}
      aria-label="Select all"
    />
  );
}
