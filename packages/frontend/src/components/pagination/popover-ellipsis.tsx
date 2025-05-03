import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { PaginationEllipsis } from "../ui/pagination";

export function PopoverEllipsis({
  onPageChange,
  totalPages,
}: {
  onPageChange: (page: number) => void;
  totalPages: number;
}) {
  const [ellipsisPopoverOpen, setEllipsisPopoverOpen] = useState(false);
  return (
    <Popover open={ellipsisPopoverOpen} onOpenChange={setEllipsisPopoverOpen}>
      <PopoverTrigger className="cursor-pointer">
        <PaginationEllipsis />
      </PopoverTrigger>
      <PopoverContent>
        <form
          className="flex gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            let nextPage = +formData.get("next-page")!;
            if (nextPage > totalPages) nextPage = totalPages;
            else if (nextPage < 1) nextPage = 1;

            onPageChange(nextPage);
            setEllipsisPopoverOpen(false);
          }}
        >
          <Input name="next-page" type="number" placeholder="1" />
          <Button variant="outline">前往</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
