import { useDeferredTableControls } from "@/hooks/use-deferred-table-controls";
import { SelectionState, useSelection } from "@/hooks/use-selection";
import { OrderDirection } from "@myapp/shared";
import { useNavigate } from "@tanstack/react-router";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
} from "react";

type SearchParams = {
  page: number;
  pageSize: number;
  orderBy: string;
  orderDirection: "ASC" | "DESC";
  searchTerm: string;
};

type SearchState = Partial<SearchParams>;

type SummaryResponse<T> = {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
};

type SummaryPageContextType<T> = {
  search: SearchParams;
  isUpdatingTableData: boolean;
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
  handleSort: (columnId: string) => void;
  handleSearch: (searchTerm: string) => void;
  handlePageChange: (page: number) => void;
  handleSelectionChange: Dispatch<SetStateAction<RowSelectionState>>;
  handleSelectAllChange: (selectAll: boolean) => void;
  resetSelection: () => void;
};

// Create a type-safe context without using 'any'
const SummaryPageContext = createContext<SummaryPageContextType<unknown>>(
  {} as SummaryPageContextType<unknown>
);

type SummaryPageProviderProps<T, U extends keyof T> = {
  children: React.ReactNode;
  data: SummaryResponse<T>;
  initialSearch: SearchParams;
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
  U extends keyof T,
>({
  children,
  data,
  initialSearch,
  columnsGeneratorFunction,
}: SummaryPageProviderProps<T, U>) {
  const navigate = useNavigate();
  const { deferredValues, isUpdatingTableData, handleSortChange } =
    useDeferredTableControls(initialSearch);

  const {
    onSelectionChange,
    onSelectAllChange,
    selection,
    selectedCount,
    rowSelection,
    resetSelection,
  } = useSelection({
    totalFilteredCount: data.total,
    pageIds: data.data.map((item) => item.id),
  });

  const updateSearch = useCallback(
    (updates: SearchState) => {
      navigate({
        search: (prev: SearchParams) => ({
          ...prev,
          ...updates,
        }),
      });
    },
    [navigate]
  );

  const handleSort = useCallback(
    (columnId: string) => {
      const { orderBy, orderDirection } = handleSortChange(
        columnId,
        deferredValues.orderBy,
        deferredValues.orderDirection
      );
      updateSearch({
        page: 1,
        orderBy,
        orderDirection,
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
      updateSearch({ page });
    },
    [updateSearch]
  );

  const columns = columnsGeneratorFunction({
    selection,
    onSelectAllChange,
    orderBy: deferredValues.orderBy as U,
    orderDirection: deferredValues.orderDirection,
    clickOnCurrentHeader: (columnId) => handleSort(columnId as string),
    clickOnOtherHeader: (columnId) => handleSort(columnId as string),
  });

  const value: SummaryPageContextType<T> = {
    search: deferredValues,
    isUpdatingTableData,
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

  return (
    <SummaryPageContext.Provider value={value}>
      {children}
    </SummaryPageContext.Provider>
  );
}

export function useSummaryPageContext<T>() {
  const context = useContext(SummaryPageContext) as SummaryPageContextType<T>;
  if (!context) {
    throw new Error(
      "useSummaryPageContext must be used within a SummaryPageProvider"
    );
  }
  return context;
}
