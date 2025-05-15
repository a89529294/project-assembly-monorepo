import { DialogDeleteDepartment } from "@/components/dialogs/delete-department";
import { DialogDepartment } from "@/components/dialogs/department";
import { Checkbox } from "@/components/ui/checkbox";
import { DepartmentSummary } from "@myapp/shared";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<DepartmentSummary>();

export const baseDepartmentColumns = [
  columnHelper.accessor("name", {
    header: "名稱",
    cell: (info) => info.getValue(),
  }),
] as ColumnDef<DepartmentSummary>[];

const getSelectColumn = ({
  toggleAll,
  isAllSelected,
  isPartialSelected,
}: {
  toggleAll: () => void;
  isAllSelected: boolean;
  isPartialSelected: boolean;
}) =>
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
  }) as ColumnDef<DepartmentSummary>;

const extendedDepartmentColumns = [
  columnHelper.accessor("enPrefix", {
    header: "英文前綴",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("zhPrefix", {
    header: "中文前綴",
    cell: (info) => info.getValue(),
  }),
] as ColumnDef<DepartmentSummary>[];

const actionDepartmentColumns = [
  columnHelper.display({
    id: "edit-department",
    size: 50,
    header() {
      return "";
    },
    cell(info) {
      return <DialogDepartment id={info.row.original.id} />;
    },
  }),
  columnHelper.display({
    id: "delete-department",
    size: 50,
    header() {
      return "";
    },
    cell(info) {
      return <DialogDeleteDepartment id={info.row.original.id} />;
    },
  }),
];

export const genSelectableDepartmentColumns = ({
  toggleAll,
  isAllSelected,
  isPartialSelected,
}: {
  toggleAll: () => void;
  isAllSelected: boolean;
  isPartialSelected: boolean;
}) => {
  return [
    getSelectColumn({ toggleAll, isAllSelected, isPartialSelected }),
    ...baseDepartmentColumns,
  ];
};

export const genExtendedDepartmentColumns = () => {
  return [
    ...baseDepartmentColumns,
    ...extendedDepartmentColumns,
    ...actionDepartmentColumns,
  ];
};
