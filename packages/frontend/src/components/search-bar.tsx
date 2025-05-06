import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDecouncedValue } from "@/hooks/use-debounced-value";
import { NavigateOptions, useSearch } from "@tanstack/react-router";
import { LucideSearch } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  navigate: (opts: NavigateOptions) => void;
  className?: string;
}

export function SearchBar({
  placeholder = "搜尋...",
  navigate,
  className = "",
}: SearchBarProps) {
  const search = useSearch({
    strict: false,
  });
  const [input, setInput] = useState(search.searchTerm);
  const debouncedInput = useDecouncedValue(input ?? "");

  useEffect(() => {
    navigate({
      search: { searchTerm: debouncedInput ? debouncedInput : undefined },
      replace: true,
    });
  }, [debouncedInput, navigate]);

  return (
    <form className={`flex items-center gap-2 ${className}`} role="search">
      <Input
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
        aria-label={placeholder}
      />
      <Button type="submit" variant="outline" size="icon" aria-label="搜尋">
        <LucideSearch className="h-5 w-5" />
      </Button>
    </form>
  );
}
