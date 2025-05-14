import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDecouncedValue } from "@/hooks/use-debounced-value";
import { SearchBarImperativeHandle } from "@/types";
import { LucideSearch } from "lucide-react";
import { Ref, useEffect, useImperativeHandle, useRef, useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearchChange: (s: string) => void;
  className?: string;
  hideIcon?: boolean;
  initSearchTerm?: string;
  disabled?: boolean;
  ref?: Ref<SearchBarImperativeHandle>;
}

export function SearchBar({
  placeholder = "搜尋...",
  onSearchChange,
  className = "",
  hideIcon,
  initSearchTerm,
  disabled,
  ref,
}: SearchBarProps) {
  const [input, setInput] = useState(initSearchTerm ?? "");
  const debouncedInput = useDecouncedValue(input);
  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;
  const isComponentMounted = useRef(true);

  useImperativeHandle(ref, () => {
    return {
      resetInput() {
        setInput("");
      },
    };
  }, []);

  useEffect(() => {
    // TODO both (isComponentMounted.current && typeof debouncedInput === "string") and the next useEffect are needed to prevent navigation revert when quickly navigating between pages
    // Need to investigate why
    // TEST: remove the following if check and the next useEffect then navigate between basic-info/employees and /basic-info/company-info to see the issue
    if (isComponentMounted.current && typeof debouncedInput === "string") {
      onSearchChangeRef.current(debouncedInput);
    }
  }, [debouncedInput]);

  useEffect(() => {
    isComponentMounted.current = true;

    return () => {
      isComponentMounted.current = false;
    };
  }, []);

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
      />
      {!hideIcon && (
        <Button type="submit" variant="outline" size="icon" aria-label="搜尋">
          <LucideSearch className="h-5 w-5" />
        </Button>
      )}
    </form>
  );
}
