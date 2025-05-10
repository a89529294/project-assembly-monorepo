import { RowSelectionState } from "@tanstack/react-table";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

interface UseSimpleSelectionResult {
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  selected: string[];
  toggle: (id: string) => void;
  toggleAll: () => void;
  selectAll: () => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
  selectedCount: number;
  isAllSelected: boolean;
  isPartialSelected: boolean;
}

/**
 * A hook for managing selection state compatible with Tanstack Table
 */
export function useSimpleSelection<T extends { id: string }>(
  pendingItems?: T[]
): UseSimpleSelectionResult {
  // Memoize items to prevent dependency changes on every render
  const items = useMemo(
    () => pendingItems?.map((v) => v.id) ?? [],
    [pendingItems]
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Convert rowSelection to array of selected IDs
  const selected = useMemo(() => Object.keys(rowSelection), [rowSelection]);

  // Toggle selection of a specific ID
  const toggle = useCallback((id: string) => {
    setRowSelection((prev) => {
      const newSelection = { ...prev };
      if (newSelection[id]) {
        delete newSelection[id];
      } else {
        newSelection[id] = true;
      }
      return newSelection;
    });
  }, []);

  // Toggle all items
  const toggleAll = useCallback(() => {
    if (selected.length === items.length) {
      // Clear all if all are selected
      setRowSelection({});
    } else {
      // Select all if not all are selected
      const newSelection: RowSelectionState = {};
      items.forEach((id) => {
        newSelection[id] = true;
      });
      setRowSelection(newSelection);
    }
  }, [items, selected.length]);

  // Select all items
  const selectAll = useCallback(() => {
    const newSelection: RowSelectionState = {};
    items.forEach((id) => {
      newSelection[id] = true;
    });
    setRowSelection(newSelection);
  }, [items]);

  // Clear all selections
  const clearAll = useCallback(() => {
    setRowSelection({});
  }, []);

  // Check if an item is selected
  const isSelected = useCallback(
    (id: string) => !!rowSelection[id],
    [rowSelection]
  );

  const selectedCount = selected.length;

  const isAllSelected = items.length > 0 && selected.length === items.length;

  const isPartialSelected = selected.length > 0 && !isAllSelected;

  return {
    rowSelection,
    setRowSelection,
    selected,
    toggle,
    toggleAll,
    selectAll,
    clearAll,
    isSelected,
    selectedCount,
    isAllSelected,
    isPartialSelected,
  };
}
