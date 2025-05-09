import { RowSelectionState } from "@tanstack/react-table";
import { useState, useCallback } from "react";

/**
 * A custom hook for managing selection state with toggle and clear functionality
 * @param initialSelection - Optional initial selection array
 * @returns Selection state and utility functions
 */
export function useSelection(initialSelection: RowSelectionState = {}) {
  const [selection, setSelection] =
    useState<RowSelectionState>(initialSelection);

  const toggleSelection = useCallback((itemId: string) => {
    setSelection((prev) => {
      if (prev[itemId])
        return Object.fromEntries(
          Object.entries(prev).filter(([k]) => k !== itemId)
        );
      return { ...prev, [itemId]: true };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({});
  }, []);

  const selectAll = useCallback((items: string[]) => {
    setSelection(Object.fromEntries(items.map((k) => [k, true])));
  }, []);

  const isSelected = useCallback(
    (itemId: string) => selection[itemId],
    [selection]
  );

  return {
    selection,
    setSelection,
    toggleSelection,
    clearSelection,
    selectAll,
    isSelected,
  };
}
