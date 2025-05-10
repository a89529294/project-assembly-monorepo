import { Checkbox } from "@/components/ui/checkbox";
import { DepartmentSummary } from "@myapp/shared";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<DepartmentSummary>();

export const genDepartmentColumns = ({
  toggleAll,
  isAllSelected,
  isPartialSelected,
}: {
  toggleAll: () => void;
  isAllSelected: boolean;
  isPartialSelected: boolean;
}) =>
  [
    columnHelper.display({
      id: "select",
      header: () => {
        const checked = (() => {
          if (isAllSelected) return true;
          if (isPartialSelected) return "indeterminate";
          return false;
        })();

        return (
          <Checkbox
            checked={checked}
            onCheckedChange={toggleAll}
            aria-label="Select all"
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
          }}
          aria-label="Select row"
        />
      ),
    }),
    columnHelper.accessor("id", {
      header: "id",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
      header: "名稱",
      cell: (info) => info.getValue(),
    }),
  ] as ColumnDef<DepartmentSummary>[];
