import { RowSelectionState } from "@tanstack/react-table";
import {
  useState,
  useCallback,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";

/**
 * Selection state for managing row selection across paginated data
 */
export interface SelectionState {
  selectAll: boolean; // Whether "select all" is active
  selectedIds: Set<string>; // Explicitly selected rows (when selectAll is false)
  deselectedIds: Set<string>; // Explicitly deselected rows (when selectAll is true)
}

/**
 * A custom hook for managing selection state across paginated data
 * Handles "select all" across all pages and with filters
 */
export function useGlobalSelection({
  totalFilteredCount,
}: {
  totalFilteredCount: number;
}) {
  const [deSelectedId, setDeselectedId] = useState<string | undefined>(
    undefined
  );
  const [reselectedId, setReselectedId] = useState<string | undefined>(
    undefined
  );
  // Use a more explicit selection state model
  const [selection, setSelection] = useState<SelectionState>({
    selectAll: false,
    selectedIds: new Set<string>(),
    deselectedIds: new Set<string>(),
  });

  // Helper function to check if a row is selected
  const isRowSelected = useCallback(
    (rowId: string): boolean => {
      return selection.selectAll
        ? !selection.deselectedIds.has(rowId)
        : selection.selectedIds.has(rowId);
    },
    [selection]
  );

  // Calculate the total number of selected items
  const selectedCount = useMemo(() => {
    if (selection.selectAll) {
      // All items minus explicitly deselected ones
      return totalFilteredCount - selection.deselectedIds.size;
    }
    // Just the explicitly selected items
    return selection.selectedIds.size;
  }, [selection, totalFilteredCount]);

  // Convert to TanStack Table's RowSelectionState for the current page
  const getPageSelectedIds = useCallback(
    (pageIds: string[]): RowSelectionState => {
      // Create selection state for the current page
      const rowSelection: RowSelectionState = {};

      pageIds.forEach((id) => {
        rowSelection[id] = isRowSelected(id);
      });

      return rowSelection;
    },
    [isRowSelected]
  );

  // Handle row selection changes from the data table
  const handleSelectionChange: Dispatch<SetStateAction<RowSelectionState>> =
    useCallback(
      (action) => {
        setSelection((prevSelection) => {
          console.log(prevSelection.selectedIds);
          // Determine the next selection state from the table
          const nextTableSelection =
            typeof action === "function"
              ? action(
                  Object.fromEntries(
                    Array.from(prevSelection.selectedIds).map((k) => [k, true])
                  )
                ) // We don't rely on previous table state
              : action;

          // Create new selection state (using new Set objects for immutability)
          const newSelection: SelectionState = {
            selectAll: prevSelection.selectAll,
            selectedIds: prevSelection.selectAll
              ? new Set(prevSelection.selectedIds)
              : new Set(),
            deselectedIds: prevSelection.selectAll
              ? new Set(prevSelection.deselectedIds)
              : new Set(),
          };

          if (newSelection.selectAll && deSelectedId) {
            newSelection.deselectedIds.add(deSelectedId);
            setDeselectedId(undefined);
          } else if (newSelection.selectAll && reselectedId) {
            newSelection.deselectedIds.delete(reselectedId);
            setReselectedId(undefined);
          } else {
            // Process the changes from the table
            Object.entries(nextTableSelection).forEach(([id, isSelected]) => {
              if (newSelection.selectAll) {
                // In "select all" mode:
                if (isSelected) {
                  // Re-selected a previously deselected row
                  newSelection.deselectedIds.delete(id);
                } else {
                  // Explicitly deselect a row
                  newSelection.deselectedIds.add(id);
                }
              } else {
                // In normal selection mode:
                if (isSelected) {
                  // Explicitly select a row
                  newSelection.selectedIds.add(id);
                } else {
                  // Deselect a row

                  newSelection.selectedIds.delete(id);
                }
              }
            });
          }

          console.log(newSelection);
          return newSelection;
        });
      },
      [deSelectedId, reselectedId]
    );

  // Toggle "select all" across all pages
  const toggleSelectAll = useCallback((checked: boolean) => {
    setSelection({
      selectAll: checked,
      selectedIds: new Set(), // Clear selected IDs when toggling
      deselectedIds: new Set(), // Clear deselected IDs when toggling
    });
  }, []);

  // Reset selection when filter criteria change
  const resetSelection = useCallback(() => {
    setSelection({
      selectAll: false,
      selectedIds: new Set(),
      deselectedIds: new Set(),
    });
  }, []);

  // Check if "select all" is active for the current page
  const isAllSelected = useCallback(
    (pageIds: string[]): boolean => {
      if (selection.selectAll) {
        console.log(selection);
        // In "select all" mode, check that no rows on the page are explicitly deselected
        return !pageIds.some((id) => selection.deselectedIds.has(id));
      }

      // In normal mode, check if all rows are explicitly selected
      return (
        pageIds.length > 0 &&
        pageIds.every((id) => selection.selectedIds.has(id))
      );
    },
    [selection]
  );

  return {
    selectedIds: selection.selectedIds,
    deselectedIds: selection.deselectedIds,
    selectAll: selection.selectAll,
    selectedCount,
    getPageSelectedIds,
    handleSelectionChange,
    toggleSelectAll,
    resetSelection,
    isAllSelected,
    isRowSelected,
    setDeselectedId,
    setReselectedId,
    selection,
  };
}
