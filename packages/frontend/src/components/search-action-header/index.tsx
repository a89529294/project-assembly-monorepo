import { SearchBar, SearchBarImperativeHandle } from "@/components/search-bar";
import { ReactNode, Ref, RefObject } from "react";

export function SearchActionHeader({
  title,
  SearchBarRef,
  onSearchChange,
  initSearchTerm,
  isSearching,
  disableInputs,
  children,
}: {
  title: string;
  SearchBarRef?: Ref<SearchBarImperativeHandle>;
  onSearchChange: (s: string, ref: RefObject<HTMLInputElement | null>) => void;
  initSearchTerm: string;
  isSearching: boolean;
  disableInputs: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-between">
      <div className="text-xl font-bold flex gap-2 items-center">
        {title}
        <SearchBar
          ref={SearchBarRef}
          onSearchChange={onSearchChange}
          initSearchTerm={initSearchTerm}
          isUpdating={isSearching}
          disabled={disableInputs}
        />
      </div>

      {children}
    </div>
  );
}
