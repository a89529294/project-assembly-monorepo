import { DataTable } from "@/components/data-table";
import { SmartPagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";

// Define the customer type based on the schema
export type Customer = {
  id: string; // Assuming an ID for selection purposes
  customerNumber: string;
  name: string;
  nickname: string;
  category?: string | null;
  principal?: string | null;
  taxDeductionCategory?: string | null;
  taxId: string;
  phone: string;
  fax?: string | null;
};

// Generate columns for the customer table
export const genCustomerColumns = (): ColumnDef<Customer>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "customerNumber",
    header: "Customer Number",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "nickname",
    header: "Nickname",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "principal",
    header: "Principal",
  },
  {
    accessorKey: "taxDeductionCategory",
    header: "Tax Deduction Category",
  },
  {
    accessorKey: "taxId",
    header: "Tax ID",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "fax",
    header: "Fax",
  },
  // Add an actions column if needed in the future
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const customer = row.original;
  //     return (
  //       // Placeholder for action buttons (e.g., Edit, Delete)
  //       <Button variant="ghost" size="sm">Actions</Button>
  //     );
  //   },
  // },
];

export const Route = createFileRoute("/_dashboard/customers/summary")({
  loader() {
    queryClient.ensureQueryData(
      trpc.basicInfo.readCustomers.queryOptions({
        page: 1,
      })
    );
  },
  component: RouteComponent,
});

const columns = genCustomerColumns();

function RouteComponent() {
  const { data } = useSuspenseQuery(
    trpc.basicInfo.readCustomers.queryOptions({
      page: 1,
    })
  );

  return (
    <div className="p-6 pb-0 bg-white flex flex-col rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
        Customer List
        <Button asChild>
          {/* Placeholder Link - Update route as needed */}
          <Link to="/customers/create">Add Customer</Link>
        </Button>
      </h2>
      <div className="flex-1 relative">
        <div className="absolute inset-0 bottom-10">
          <ScrollArea className="rounded-md border p-0 h-full">
            <DataTable
              columns={columns}
              data={data.data}
              // rowSelection={{}} // Manage rowSelection state if needed
              // setRowSelection={() => {}} // Manage rowSelection state if needed
            />
          </ScrollArea>
        </div>
        <SmartPagination
          className="absolute bottom-0 h-10 flex items-center"
          totalPages={0}
          currentPage={0}
          onPageChange={() => {}}
        />
      </div>
    </div>
  );
}
