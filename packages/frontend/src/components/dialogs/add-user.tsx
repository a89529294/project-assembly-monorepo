import { DataTable } from "@/components/data-table";
import { SmartPagination } from "@/components/pagination";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { genEmployeeColumns } from "@/features/employees/data-table/columns";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";

import { trpc } from "@/trpc";
import { EmployeeSummaryKey, OrderDirection } from "@myapp/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export const DialogAddUser = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [checked, setChecked] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [orderBy, setOrderBy] = useState<EmployeeSummaryKey>("idNumber");
  const [orderDirection, setOrderDirection] = useState<OrderDirection>("DESC");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  const { data, isFetching, isSuccess, error } = useQuery(
    trpc.basicInfo.readEmployees.queryOptions({
      page,
      pageSize,
      orderBy,
      orderDirection,
      notAssociatedWithAUser: true,
      searchTerm,
      employeeIds: checked ? selectedEmployeeIds : undefined,
    })
  );
  const { mutate } = useMutation(trpc.basicInfo.createUsers.mutationOptions());

  const onRowSelect = (id: string) => {
    setSelectedEmployeeIds((prev) => {
      let newIds = [...prev];
      if (prev.includes(id)) newIds = prev.filter((prevId) => prevId !== id);
      else newIds.push(id);
      return newIds;
    });
  };

  const reset = () => {
    setSelectedEmployeeIds([]);
    setPage(1);
    setOrderBy("idNumber");
    setOrderDirection("DESC");
  };

  const onCreateUsers = async () => {
    mutate(
      { employeeIds: selectedEmployeeIds },
      {
        onSuccess() {
          queryClient.invalidateQueries({
            queryKey: [trpc.basicInfo.readEmployees.queryKey()[0]],
          });
          queryClient.invalidateQueries({
            queryKey: [trpc.basicInfo.readUsers.queryKey()[0]],
          });
          setOpen(false);
          toast.success("成功新增erp使用者");
        },
        onError() {
          toast.error("無法新增erp使用者");
        },
      }
    );
  };

  useEffect(() => {
    if (selectedEmployeeIds.length === 0) setChecked(false);
  }, [selectedEmployeeIds.length]);

  // TODO might want to extract the error display

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">新增ERP使用者</Button>
      </DialogTrigger>
      <DialogContent className="w-[550px]">
        <DialogHeader className="justify-between flex-row items-center">
          <DialogTitle>新增ERP使用者</DialogTitle>
          <div className="flex gap-1 mr-2">
            <SearchBar
              onSearchChange={(s) => {
                setSearchTerm(s);
                setPage(1);
              }}
              hideIcon
            />
            <Button
              variant={"destructive"}
              onClick={() => setSelectedEmployeeIds([])}
              disabled={selectedEmployeeIds.length === 0}
            >
              反選
            </Button>
            <Button
              disabled={selectedEmployeeIds.length === 0}
              onClick={onCreateUsers}
            >
              新增
            </Button>
          </div>
          {/* prevent browser accessibility warning */}
          <DialogDescription className="hidden" />
        </DialogHeader>

        {/* Checkbox for filtering unbound employees */}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={checked}
            onCheckedChange={(s) => {
              setChecked(s === true);
              setPage(1);
            }}
          />
          <label
            htmlFor="show-unbound"
            className="text-sm font-medium leading-none "
          >
            顯示已選則的員工
          </label>
        </div>

        <div className="col-span-1 h-[400px] rounded border border-gray-200 relative">
          <div className="absolute inset-0">
            <ScrollArea
              className={cn("w-full h-full", isFetching && "opacity-50")}
            >
              {isSuccess ? (
                <DataTable
                  columns={genEmployeeColumns({
                    orderBy,
                    orderDirection,
                    clickOnCurrentHeader: () => {
                      setPage(1);
                      setOrderDirection((p) => (p === "ASC" ? "DESC" : "ASC"));
                    },
                    clickOnOtherHeader: (orderBy) => {
                      setPage(1);
                      setOrderBy(orderBy);
                      setOrderDirection("DESC");
                    },
                    hiddenColumns: ["employee-detail-link"],
                  })}
                  data={data.data}
                  onRowSelect={onRowSelect}
                  selectedRows={selectedEmployeeIds}
                />
              ) : error instanceof TRPCClientError ? (
                <pre>
                  {JSON.stringify(
                    {
                      message: error.shape.message,
                      code: error.data.code,
                    },
                    null,
                    2
                  )}
                </pre>
              ) : (
                "未知問題"
              )}

              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>

        <SmartPagination
          currentPage={page}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
          totalPages={data?.totalPages ?? 0}
        />
      </DialogContent>
    </Dialog>
  );
};
