"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { AppUser } from "../../../../../backend/src/trpc/router";

const columnHelper = createColumnHelper<AppUser>();

export const appUsersColumns = [
  columnHelper.accessor("account", {
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
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("employee.email", {
    header: "電子信箱",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("employee.phone1", {
    header: "電話",
    cell: (info) => info.getValue(),
  }),
] as ColumnDef<AppUser>[];
