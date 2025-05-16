import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDecouncedValue } from "@/hooks/use-debounced-value";
import { LucideSearch } from "lucide-react";
import {
  Ref,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearchChange: (s: string, ref: RefObject<HTMLInputElement | null>) => void;
  className?: string;
  hideIcon?: boolean;
  initSearchTerm?: string;
  disabled?: boolean;
  ref?: Ref<SearchBarImperativeHandle>;
  isUpdating: boolean;
}

export type SearchBarImperativeHandle = {
  resetInput: () => void;
};

export function SearchBar({
  placeholder = "搜尋...",
  onSearchChange,
  className = "",
  hideIcon,
  initSearchTerm,
  disabled,
  ref,
  isUpdating,
}: SearchBarProps) {
  const [input, setInput] = useState(initSearchTerm ?? "");
  const debouncedInput = useDecouncedValue(input);
  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;
  const searchBarRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => {
    return {
      resetInput() {
        setInput("");
      },
    };
  }, []);

  useEffect(() => {
    if (debouncedInput !== initSearchTerm) {
      onSearchChangeRef.current(debouncedInput, searchBarRef);
    }
  }, [debouncedInput, initSearchTerm]);

  useEffect(() => {
    if (!isUpdating && searchBarRef.current) {
      searchBarRef.current.focus();
    }
  }, [isUpdating]);

  return (
    <form className={`flex items-center gap-2 ${className}`} role="search">
      <Input
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
        aria-label={placeholder}
        disabled={disabled}
        ref={searchBarRef}
      />
      {!hideIcon && (
        <Button type="submit" variant="outline" size="icon" aria-label="搜尋">
          <LucideSearch className="h-5 w-5" />
        </Button>
      )}
    </form>
  );
}
