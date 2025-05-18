import {
  useSuspenseQuery,
  useMutation,
  UseMutateFunction,
} from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useRef, ReactNode } from "react";
import { toast } from "sonner";
import { SearchBarImperativeHandle } from "@/components/search-bar";
import { useDeferredTableControls } from "@/hooks/use-deferred-paginated-table-controls";
import { useSelection } from "@/hooks/use-selection";
import { queryClient } from "@/query-client";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { SummaryPageUI } from "@/components/summary-page-ui";

export type OrderDirection = "ASC" | "DESC";

export interface TableData<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
}

export interface TableSearchParams<TKey extends string> {
  orderBy: TKey;
  orderDirection: OrderDirection;
  page: number;
  pageSize: number;
  searchTerm?: string;
}

export interface ColumnGeneratorOptions<TKey extends string> {
  orderBy: TKey;
  orderDirection: OrderDirection;
  clickOnCurrentHeader: (columnId: TKey) => void;
  clickOnOtherHeader: (columnId: TKey) => void;
  onSelectAllChange: (checked: boolean) => void;
  selection: ReturnType<typeof useSelection>["selection"];
}

export interface TablePageOptions<
  TData extends Record<"id", string>,
  TKey extends keyof TData & string,
> {
  title: string;
  routePath:
    | string
    | {
        to: string;
        params?: Record<string, unknown>;
        search?: Record<string, unknown>;
        hash?: string;
      };
  queryFn: <TParams extends TableSearchParams<TKey>>(
    search: TParams
  ) => Promise<TableData<TData>>;
  queryKey: string | readonly unknown[];
  deleteMutation?: (ids: string[]) => Promise<unknown>;
  deleteSuccessMessage?: string;
  deleteErrorMessage?: string;
  addButtonPath?: string;
  addButtonText?: string;
  selectionCountText?: string;
  generateColumns: (
    options: ColumnGeneratorOptions<TKey>
  ) => ColumnDef<TData>[];
  mapDataToIds: (data: TData[]) => string[];
  deleteButtonText?: string;
  renderRightSideActions?: (props: {
    selectedCount: number;
    disableInputs: boolean;
  }) => ReactNode;
}

export function createTablePage<
  TData extends Record<"id", string>,
  TKey extends keyof TData & string,
>({
  title,
  routePath,
  queryFn,
  queryKey,
  deleteMutation,
  deleteSuccessMessage = "Successfully deleted",
  deleteErrorMessage = "Failed to delete",
  addButtonPath,
  addButtonText = "Add New",
  selectionCountText = "selected",
  generateColumns,
  mapDataToIds,
  deleteButtonText = "Delete",
  renderRightSideActions,
}: TablePageOptions<TData, TKey>) {
  return function TablePageComponent() {
    const navigate = useNavigate();
    const search = useSearch({ from: routePath }) as TableSearchParams<TKey>;
    const searchBarRef = useRef<SearchBarImperativeHandle>(null);

    const { deferredValues, isUpdatingTableData, handleSortChange } =
      useDeferredTableControls(search);

    const { data } = useSuspenseQuery({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey, deferredValues],
      queryFn: () => queryFn(deferredValues),
    });

    const {
      onSelectionChange,
      onSelectAllChange,
      selection,
      selectedCount,
      rowSelection,
      resetSelection,
      data: selectedItems,
    } = useSelection({
      totalFilteredCount: data.total,
      pageIds: mapDataToIds(data.data),
    });

    const { mutate, isPending } = deleteMutation
      ? useMutation({
          mutationFn: deleteMutation,
          onSuccess: () => {
            toast.success(deleteSuccessMessage);
            queryClient.invalidateQueries({
              queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
            });
            resetSelection();
          },
          onError: () => {
            toast.error(deleteErrorMessage);
          },
        })
      : {
          mutate: null as unknown as UseMutateFunction<
            unknown,
            Error,
            string[],
            unknown
          >,
          isPending: false,
        };

    const disableInputs = isPending || isUpdatingTableData;

    const handleDelete = () => {
      if (mutate && selectedItems.length > 0) {
        mutate(selectedItems);
      }
    };

    const handleSort = (columnId: TKey) => {
      const newSearch = handleSortChange(
        columnId,
        deferredValues.orderBy,
        deferredValues.orderDirection
      );
      navigate({
        search: newSearch,
        replace: true,
      });
    };

    const columns = generateColumns({
      orderBy: search.orderBy,
      orderDirection: search.orderDirection,
      clickOnCurrentHeader: (columnId: TKey) => handleSort(columnId),
      clickOnOtherHeader: (columnId: TKey) => handleSort(columnId),
      onSelectAllChange,
      selection,
    });

    const rightSideActions = renderRightSideActions ? (
      renderRightSideActions({
        selectedCount,
        disableInputs,
      })
    ) : addButtonPath ? (
      <Button asChild disabled={disableInputs}>
        <Link to={addButtonPath}>{addButtonText}</Link>
      </Button>
    ) : null;

    return (
      <SummaryPageUI
        title={title}
        data={data.data}
        columns={columns}
        rowSelection={rowSelection}
        onRowSelectionChange={onSelectionChange}
        totalPages={data.totalPages}
        currentPage={data.page}
        onPageChange={(page) =>
          navigate({
            search: { ...deferredValues, page },
            replace: true,
          })
        }
        onSearchChange={(searchTerm) => {
          navigate({
            search: { searchTerm },
            replace: true,
          });
          resetSelection();
        }}
        initialSearchTerm={search.searchTerm}
        isUpdating={isUpdatingTableData}
        selectedCount={selectedCount}
        disableInputs={disableInputs}
        onDelete={deleteMutation ? handleDelete : undefined}
        deleteButtonText={deleteButtonText}
        searchBarRef={searchBarRef}
        selectionCountText={selectionCountText}
        rightSideActions={rightSideActions}
      />
    );
  };
}
