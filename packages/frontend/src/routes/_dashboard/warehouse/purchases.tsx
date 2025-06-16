import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/warehouse/purchases")({
  component: RouteComponent,
});

import { Button } from "@/components/ui/button"; // Assuming a Button component exists
import { Input } from "@/components/ui/input"; // Assuming an Input component exists
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming Table components exist

// Define the type for a material based on the schema provided
// For now, let's use a simplified version for the table display
interface Material {
  id: string; // Assuming baseSchema includes an id
  supplier?: string | null;
  labelId?: string | null;
  typeName?: string | null;
  material: string;
  specification: string;
  length: string;
  weight: string;
  procurementNumber?: string | null;
  arrivalDate?: Date | null; // Or string, depending on how it's handled
  status: string; // Assuming materialStatusEnum results in a string
  // Add other fields as necessary from the full schema
}

const materialTableColumns = [
  { accessorKey: "supplier", header: "Supplier" },
  { accessorKey: "labelId", header: "Material ID" },
  { accessorKey: "typeName", header: "Type/Model" },
  { accessorKey: "material", header: "Material" },
  { accessorKey: "specification", header: "Specification" },
  { accessorKey: "length", header: "Length" },
  { accessorKey: "weight", header: "Weight" },
  { accessorKey: "procurementNumber", header: "Procurement No." },
  { accessorKey: "arrivalDate", header: "Arrival Date" },
  { accessorKey: "status", header: "Status" },
];

import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { PageShell } from "@/components/layout/page-shell";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

function RouteComponent() {
  const { ref } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetching) {
        fetchNextPage();
      }
    },
  });
  const { data, error, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery(
      trpc.warehouse.readPurchases.infiniteQueryOptions(
        { cursor: 0 },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
      )
    );
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  

  const allMaterials = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <PageShell
      header={
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Purchased Materials</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsSearchDialogOpen(true)}
            >
              Search
            </Button>
            <Button>Add Material</Button>
            <Button variant="secondary">Edit Material</Button>{" "}
            {/* TODO: Implement Edit Material action, enable based on selection */}
          </div>
        </div>
      }
      className="pb-6"
    >
      {/* Search Dialog component */}
      {isSearchDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Search Materials</h2>
            <Input
              type="text"
              placeholder="Search by ID, name, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsSearchDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  console.log("Search:", searchTerm);
                  setIsSearchDialogOpen(false);
                }}
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-lg flex-1 relative ">
        <div className="absolute inset-0 ">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="relative z-10">
                <TableRow className="">
                  {materialTableColumns.map((column) => (
                    <TableHead
                      className="bg-white rounded-t-lg"
                      key={column.accessorKey}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="relative">
                {status === "pending" ? (
                  <TableRow>
                    <TableCell
                      colSpan={materialTableColumns.length}
                      className="text-center h-24"
                    >
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : status === "error" ? (
                  <TableRow>
                    <TableCell
                      colSpan={materialTableColumns.length}
                      className="text-center text-red-500"
                    >
                      Error: {error?.message}
                    </TableCell>
                  </TableRow>
                ) : allMaterials.length > 0 ? (
                  allMaterials.map((material: Material, index) => (
                    <TableRow
                      key={material.id}
                      ref={index === allMaterials.length - 1 ? ref : null}
                    >
                      {materialTableColumns.map((column) => (
                        <TableCell key={`${material.id}-${column.accessorKey}`}>
                          {column.accessorKey === "arrivalDate" &&
                          material.arrivalDate
                            ? new Date(
                                material.arrivalDate
                              ).toLocaleDateString()
                            : String(
                                material[
                                  column.accessorKey as keyof Material
                                ] ?? ""
                              )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={materialTableColumns.length}
                      className="text-center"
                    >
                      No materials found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
      {isFetching && (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {!hasNextPage && allMaterials.length > 0 && (
        <p className="text-center text-sm text-muted-foreground p-4">
          No more materials to load.
        </p>
      )}
      {status === "error" && (
        <p className="text-center text-red-500">Error: {error.message}</p>
      )}
    </PageShell>
  );
}
