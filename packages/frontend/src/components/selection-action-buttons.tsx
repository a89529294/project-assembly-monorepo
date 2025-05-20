import React from "react";
import { Button } from "@/components/ui/button";

interface DepartmentActionButtonsProps {
  selectedCount: number;
  onClear: () => void;
  onRemove: () => void;
  isPending: boolean;
  removeLabel?: string;
  children: React.ReactNode; // Dialog component
}

/**
 * A reusable action button row for department/role management.
 * Renders clear, remove, and a dialog trigger button.
 *
 * - hasSelection: whether any items are selected
 * - onClear: handler for the clear/deselect button
 * - onRemove: handler for the remove button
 * - isPending: disables all actions when true
 * - children: the dialog component to render at the end
 */
export const SelectionActionButtons: React.FC<DepartmentActionButtonsProps> = ({
  selectedCount,
  onClear,
  onRemove,
  isPending,
  children,
}) => {
  return (
    <div className="flex gap-1 items-center">
      {selectedCount > 0 && (
        <>
          <span className="text-sm font-normal">已選中 {selectedCount}</span>
          <Button variant="secondary" onClick={onClear} disabled={isPending}>
            反選
          </Button>
          <Button variant="destructive" onClick={onRemove} disabled={isPending}>
            移除
          </Button>
        </>
      )}
      {children}
    </div>
  );
};

export default SelectionActionButtons;
