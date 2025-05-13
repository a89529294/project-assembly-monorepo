"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { AppUserOrEmployeeWithOptionalDepartment } from "@myapp/shared";
import { SelectionState } from "@/hooks/use-selection";

const columnHelper =
  createColumnHelper<AppUserOrEmployeeWithOptionalDepartment>();

export const genAppUsersOrEmployeesWithSpecificDepartmentColumns = ({
  onSelectAllChange,
  selection,
}: {
  onSelectAllChange: (checked: boolean) => void;
  selection: SelectionState;
}) =>
  [
    columnHelper.display({
      id: "select",
      size: 66,
      header: ({ table }) => {
        const checked = selection
          ? selection.selectAll === false
            ? false
            : selection.deselectedIds.size === 0
              ? true
              : "indeterminate"
          : table.getIsAllPageRowsSelected();

        return (
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => {
              onSelectAllChange(!!value);
            }}
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
    columnHelper.accessor("idNumber", {
      header: "員工編號",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
      header: "姓名",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("department", {
      header: "部門",
      cell: (info) => {
        const department = info.getValue();
        return (
          <div className="flex gap-1">
            {department ? `${department.name} ${department.jobTitle}` : ""}
          </div>
        );
      },
    }),
  ] as ColumnDef<AppUserOrEmployeeWithOptionalDepartment>[];
