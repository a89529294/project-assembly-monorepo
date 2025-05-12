"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { AppUserOrEmployeeWithSpecificDepartment } from "@myapp/shared";

const columnHelper =
  createColumnHelper<AppUserOrEmployeeWithSpecificDepartment>();

export const genAppUsersOrEmployeesWithSpecificDepartmentColumns = () =>
  [
    columnHelper.display({
      id: "select",
      size: 66,
      header: ({ table }) => {
        const checked = table.getIsAllPageRowsSelected();

        return (
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
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
      cell: (info) => (
        <div className="flex gap-1">
          {info.getValue().name}
          {info.getValue().jobTitle}
        </div>
      ),
    }),
  ] as ColumnDef<AppUserOrEmployeeWithSpecificDepartment>[];
