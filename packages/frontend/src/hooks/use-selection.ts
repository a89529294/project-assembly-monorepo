import { RowSelectionState } from "@tanstack/react-table";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

/**
 * Selection state for managing row selection across paginated data.
 * - When selectAll is false: Use selectedIds for explicitly selected rows
 * - When selectAll is true: Use deselectedIds for explicitly deselected rows, also include the searchTerm for backend filtering
 */
export interface SelectionState {
  selectAll: boolean;
  selectedIds: Set<string>; // Explicitly selected rows (when selectAll is false)
  deselectedIds: Set<string>; // Explicitly deselected rows (when selectAll is true)
}

// Define the two possible shapes of the data object
type SelectAllData = {
  searchTerm: string;
  deSelectedIds: string[];
  selectAll: true;
};

type SelectedIdsData = {
  selectedIds: string[];
  selectAll: false;
};

/**
 * Hook for managing complex selection state across paginated data.
 * Handles both individual selection and "select all" functionality.
 */
export function useSelection({
  totalFilteredCount,
  pageIds,
  searchTerm = "",
}: {
  totalFilteredCount: number;
  pageIds: string[];
  searchTerm?: string;
}) {
  // Main selection state
  const [selection, setSelection] = useState<SelectionState>({
    selectAll: false,
    selectedIds: new Set<string>(),
    deselectedIds: new Set<string>(),
  });

  const isRowSelected = useCallback(
    (rowId: string): boolean => {
      return selection.selectAll
        ? !selection.deselectedIds.has(rowId) // In select-all mode, row is selected unless explicitly deselected
        : selection.selectedIds.has(rowId); // In normal mode, row is selected only if explicitly selected
    },
    [selection]
  );

  const rowSelection = (() => {
    const rowSelection: RowSelectionState = {};
    pageIds.forEach((id) => {
      rowSelection[id] = isRowSelected(id);
    });
    return rowSelection;
  })();

  // Calculate the total number of selected items
  const selectedCount = useMemo(() => {
    if (selection.selectAll) {
      return totalFilteredCount - selection.deselectedIds.size;
    }
    return selection.selectedIds.size;
  }, [selection, totalFilteredCount]);

  // Handle row selection changes from the data table
  const onSelectionChange: Dispatch<SetStateAction<RowSelectionState>> =
    useCallback(
      (action) => {
        setSelection((prevSelectionState) => {
          const prevRowSelectionState = (() => {
            if (prevSelectionState.selectAll) {
              return Object.fromEntries(
                pageIds.map((id) => {
                  if (prevSelectionState.deselectedIds.has(id))
                    return [id, false];

                  return [id, true];
                })
              );
            } else {
              return Object.fromEntries(
                Array.from(prevSelectionState.selectedIds).map((id) => [
                  id,
                  true,
                ])
              );
            }
          })();

          const nextRowSelectionState =
            typeof action === "function"
              ? action(prevRowSelectionState)
              : action;

          const prevSelectedIdSet = new Set(Object.keys(prevRowSelectionState));
          const nextSelectedIdSet = new Set(Object.keys(nextRowSelectionState));

          const selectAll = prevSelectionState.selectAll;
          const newDeselectedIds = new Set(prevSelectionState.deselectedIds);
          const newSelectedIds = new Set(prevSelectionState.selectedIds);

          if (nextSelectedIdSet.size > prevSelectedIdSet.size) {
            // add row

            const [rowId] = nextSelectedIdSet.difference(prevSelectedIdSet);
            if (selectAll) {
              newDeselectedIds.delete(rowId);
              // newSelectedIds.add(rowId);
              return {
                ...prevSelectionState,
                // selectedIds: newSelectedIds,
                deselectedIds: newDeselectedIds,
              };
            } else {
              newSelectedIds.add(rowId);
              newDeselectedIds.clear();
              let newSelectAll = prevSelectionState.selectAll;
              if (newSelectedIds.size === totalFilteredCount) {
                newSelectAll = true;
                newSelectedIds.clear();
                newDeselectedIds.clear();
              }

              return {
                selectAll: newSelectAll,
                selectedIds: newSelectedIds,
                deselectedIds: newDeselectedIds,
              };
            }
          } else {
            // remove row

            const [rowId] = prevSelectedIdSet.difference(nextSelectedIdSet);

            if (selectAll) {
              let newSelectAll = prevSelectionState.selectAll;
              newDeselectedIds.add(rowId);
              if (newDeselectedIds.size === totalFilteredCount) {
                newSelectAll = false;
                newDeselectedIds.clear();
              }
              // newSelectedIds.delete(rowId);
              return {
                selectAll: newSelectAll,
                selectedIds: newSelectedIds,
                deselectedIds: newDeselectedIds,
              };
            } else {
              newSelectedIds.delete(rowId);
              newDeselectedIds.clear();
              return {
                ...prevSelectionState,
                selectedIds: newSelectedIds,
                deselectedIds: newDeselectedIds,
              };
            }
          }
        });
      },
      [totalFilteredCount, pageIds]
    );

  // Toggle "select all" mode
  const onSelectAllChange = useCallback((checked: boolean) => {
    setSelection({
      selectAll: checked,
      // selectedIds: checked ? new Set(pageIds) : new Set(),
      selectedIds: new Set(),
      deselectedIds: new Set(),
    });
  }, []);

  // Reset selection state
  const resetSelection = useCallback(() => {
    setSelection({
      selectAll: false,
      selectedIds: new Set(),
      deselectedIds: new Set(),
    });
  }, []);

  const data = (() => {
    if (selection.selectAll) {
      const obj: SelectAllData = {
        searchTerm,
        deSelectedIds: Array.from(selection.deselectedIds),
        selectAll: true,
      };
      return obj;
    }

    const obj: SelectedIdsData = {
      selectedIds: Array.from(selection.selectedIds),
      selectAll: false,
    };
    return obj;
  })();

  return {
    // Selection state
    selection,
    selectedCount,
    rowSelection, // tanstack query rowSelection state

    // Selection operations
    onSelectionChange,
    onSelectAllChange,
    resetSelection,

    // final data for be consumption
    data,
  };
}
