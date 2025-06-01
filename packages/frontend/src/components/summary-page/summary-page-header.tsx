import { SearchActionHeader } from "@/components/search-action-header";

import { useSummaryPageContext } from "@/contexts/summary-page-context";
import { SelectionStateData } from "@/hooks/use-selection";
import { ReactNode } from "react";

export function SummaryPageHeader({
  title,
  createAction,
  deleteAction,
}: {
  title: string;
  createAction?: ReactNode;
  deleteAction?: ({
    selectionData,
    resetSelection,
  }: {
    selectionData: SelectionStateData;
    resetSelection: () => void;
  }) => ReactNode;
}) {
  const {
    handleSearch,
    search,
    isUpdatingTableData,
    disableInputs,
    selectedCount,
    selectionData,
    resetSelection,
  } = useSummaryPageContext();

  return (
    <SearchActionHeader
      disableInputs={disableInputs}
      isSearching={isUpdatingTableData}
      initSearchTerm={search.searchTerm}
      title={title}
      onSearchChange={handleSearch}
    >
      <div className="flex items-center gap-3">
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal">已選中 {selectedCount}</span>
            {deleteAction
              ? deleteAction({ selectionData, resetSelection })
              : null}
          </div>
        )}

        {createAction}
      </div>
    </SearchActionHeader>
  );
}

{
  /* <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
      <div className="flex gap-3 items-center">
        {title}
        <SearchBar
          onSearchChange={handleSearch}
          initSearchTerm={search.searchTerm}
          disabled={disableInputs}
          isUpdating={isUpdatingTableData}
        />
      </div>
      <div className="flex items-center gap-3">
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal">已選中 {selectedCount}</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {}}
              disabled={disableInputs}
            >
              移除
            </Button>
          </div>
        )}

        <Button asChild disabled={disableInputs}>
          <Link to={createHref}>新增</Link>
        </Button>
      </div>
    </h2> */
}
