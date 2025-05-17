import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { useSummaryPageContext } from "@/contexts/summary-page-context";

export function SummaryPageHeader({
  title,
  createHref,
}: {
  title: string;
  createHref: string;
}) {
  const { handleSearch, search, disableInputs, selectedCount } =
    useSummaryPageContext();

  return (
    <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
      <div className="flex gap-3 items-center">
        {title}
        <SearchBar
          onSearchChange={handleSearch}
          initSearchTerm={search.searchTerm}
          disabled={disableInputs}
          isUpdating={disableInputs}
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
          <a href={createHref}>新增</a>
        </Button>
      </div>
    </h2>
  );
}
