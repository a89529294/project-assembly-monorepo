"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { EmployeeOrAppUserWithDepartments } from "@myapp/shared";

const columnHelper = createColumnHelper<EmployeeOrAppUserWithDepartments>();

export const genAppUsersOrEmployeesColumns = () =>
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
    columnHelper.accessor("employee.idNumber", {
      header: "員工編號",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("employee.chName", {
      header: "姓名",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("departments", {
      header: "部門",
      cell: (info) => (
        <div className="flex gap-1">
          {info.getValue().map((department) => (
            <div key={department.id}>
              {department.jobTitle} {department.name}
            </div>
          ))}
        </div>
      ),
    }),
    columnHelper.accessor("employee.gender", {
      header: "性別",
      cell: (info) => (info.getValue() === "male" ? "男" : "女"),
    }),
    columnHelper.accessor("employee.birthday", {
      header: "生日",
      cell: (info) =>
        info.getValue() ? info.getValue()?.toLocaleDateString() : "",
    }),
    columnHelper.accessor("employee.email", {
      header: "電子信箱",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("employee.phone", {
      header: "電話",
      cell: (info) => info.getValue(),
    }),
  ] as ColumnDef<EmployeeOrAppUserWithDepartments>[];
