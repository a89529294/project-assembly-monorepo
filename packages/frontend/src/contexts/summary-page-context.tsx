import { DeferredPaginatedTableControlsReturn } from "@/hooks/use-deferred-paginated-table-controls";
import {
  SelectionState,
  SelectionStateData,
  useSelection,
} from "@/hooks/use-selection";
import { OrderDirection } from "@myapp/shared";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
} from "react";

type SearchParams<X extends string> = {
  page: number;
  pageSize: number;
  orderBy: X;
  orderDirection: OrderDirection;
  searchTerm: string;
};

type SearchState<X extends string> = Partial<SearchParams<X>>;

type SummaryResponse<T> = {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
};

type SummaryPageContextType<T, X extends string> = {
  search: SearchParams<X>;
  isUpdatingTableData: boolean;
  selection: SelectionState;
  selectionData: SelectionStateData;
  selectedCount: number;
  disableInputs: boolean;
  data: T[];
  totalPages: number;
  page: number;
  pageSize: number;
  orderBy: string;
  orderDirection: string;
  searchTerm: string;
  rowSelection: Record<string, boolean>;
  columns: ColumnDef<T>[];
  handleSort: (columnId: X) => void;
  handleSearch: (searchTerm: string) => void;
  handlePageChange: (page: number) => void;
  handleSelectionChange: Dispatch<SetStateAction<RowSelectionState>>;
  handleSelectAllChange: (selectAll: boolean) => void;
  resetSelection: () => void;
};

// Context factory to create typed contexts
export function createSummaryPageContext<T, X extends string>() {
  return createContext<SummaryPageContextType<T, X> | undefined>(undefined);
}

// Default context for common use cases
interface DefaultType {
  id: string;
  [key: string]: unknown; // Flexible to accommodate any properties
}
export const DefaultSummaryPageContext = createSummaryPageContext<
  DefaultType,
  string
>();

type SummaryPageProviderProps<T, U extends string & keyof T> = {
  children: React.ReactNode;
  data: SummaryResponse<T>;
  // initialSearch: SearchParams<U>;
  deferredTableControlsReturn: DeferredPaginatedTableControlsReturn<U>;
  navigate: (options: { search: Partial<SearchParams<U>> }) => void;
  columnsGeneratorFunction: ({
    orderBy,
    orderDirection,
    clickOnCurrentHeader,
    clickOnOtherHeader,
    onSelectAllChange,
    selection,
  }: {
    orderBy: U;
    orderDirection: OrderDirection;
    clickOnCurrentHeader: (s: U) => void;
    clickOnOtherHeader: (s: U) => void;
    onSelectAllChange: (checked: boolean) => void;
    selection: SelectionState;
  }) => ColumnDef<T>[];
};

export function SummaryPageProvider<
  T extends { id: string },
  U extends string & keyof T,
>({
  children,
  data,
  // initialSearch,
  deferredTableControlsReturn,
  navigate,
  columnsGeneratorFunction,
}: SummaryPageProviderProps<T, U>) {
  // const { deferredValues, isUpdatingTableData, handleSortChange } =
  //   useDeferredTableControls(initialSearch);

  const { deferredValues, handleSortChange, isUpdatingTableData } =
    deferredTableControlsReturn;

  const {
    onSelectionChange,
    onSelectAllChange,
    selection,
    selectedCount,
    rowSelection,
    resetSelection,
    data: selectionData,
  } = useSelection({
    totalFilteredCount: data.total,
    pageIds: data.data.map((item) => item.id),
  });

  const updateSearch = useCallback(
    (updates: SearchState<U>) => {
      navigate({
        search: { ...updates },
      });
    },
    [navigate]
  );

  const handleSort = useCallback(
    (columnId: U) => {
      const { orderBy, orderDirection } = handleSortChange(
        columnId, // Cast if handleSortChange expects string
        deferredValues.orderBy,
        deferredValues.orderDirection
      );

      updateSearch({
        page: 1,
        orderBy: orderBy,
        orderDirection,
        searchTerm: deferredValues.searchTerm,
      });
    },
    [deferredValues, handleSortChange, updateSearch]
  );

  const handleSearch = useCallback(
    (searchTerm: string) => {
      updateSearch({ searchTerm, page: 1 });
      resetSelection();
    },
    [resetSelection, updateSearch]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateSearch({
        page,
        searchTerm: deferredValues.searchTerm,
        orderBy: deferredValues.orderBy,
        orderDirection: deferredValues.orderDirection,
      });
    },
    [
      deferredValues.orderBy,
      deferredValues.orderDirection,
      deferredValues.searchTerm,
      updateSearch,
    ]
  );

  const columns = columnsGeneratorFunction({
    selection,
    onSelectAllChange,
    orderBy: deferredValues.orderBy as U,
    orderDirection: deferredValues.orderDirection,
    clickOnCurrentHeader: (columnId: U) => handleSort(columnId),
    clickOnOtherHeader: (columnId: U) => handleSort(columnId),
  });

  const value: SummaryPageContextType<T, U> = {
    search: deferredValues,
    isUpdatingTableData,
    selection,
    selectionData,
    selectedCount,
    disableInputs: isUpdatingTableData,
    data: data.data,
    totalPages: data.totalPages,
    page: data.page,
    pageSize: deferredValues.pageSize,
    orderBy: deferredValues.orderBy,
    orderDirection: deferredValues.orderDirection,
    searchTerm: deferredValues.searchTerm,
    rowSelection,
    columns,
    handleSort,
    handleSearch,
    handlePageChange,
    handleSelectionChange: onSelectionChange,
    handleSelectAllChange: onSelectAllChange,
    resetSelection,
  };

  const context = DefaultSummaryPageContext as React.Context<
    SummaryPageContextType<T, U> | undefined
  >;

  return <context.Provider value={value}>{children}</context.Provider>;
}

export function useSummaryPageContext<T, U extends string>() {
  const context = DefaultSummaryPageContext as React.Context<
    SummaryPageContextType<T, U> | undefined
  >;
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error(
      "useSummaryPageContext must be used within a SummaryPageProvider"
    );
  }
  return ctx;
}
