import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Material } from "@myapp/shared";
import { trpc } from "@/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/spinner";
import { toast } from "sonner";
import { queryClient } from "@/query-client";

interface MaterialArrivedDialogProps {
  selectedMaterials: Material[];
}

export function MaterialArrivedDialog({
  selectedMaterials,
}: MaterialArrivedDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const { data: departments, isLoading: isDepartmentsLoading } = useQuery({
    ...trpc.basicInfo.readEmployeeDepartments.queryOptions(),
  });

  const departmentsWithUnassignedOption = [
    ...(departments ?? []),
    {
      id: "unassigned",
      name: "無部門",
    },
  ];

  const { data: employees, isLoading: isEmployeesLoading } = useQuery(
    trpc.basicInfo.readEmployeesByDepartment.queryOptions(
      selectedDepartmentId ?? "",
      {
        enabled: !!selectedDepartmentId,
      }
    )
  );

  const confirmArrivalMutation = useMutation(
    trpc.warehouse.confirmMaterialArrival.mutationOptions({
      onSuccess() {
        setOpen(false);
        toast.success("進貨成功");
        queryClient.invalidateQueries({
          queryKey: trpc.warehouse.readOrders.infiniteQueryKey(),
        });
      },
    })
  );

  useEffect(() => {
    if (departments?.length && user) {
      if (!user.employeeId) {
        // user is admin
        setSelectedDepartmentId(departments[0].id);
      } else {
        // user is regular employee
        if (user.departmentIds.length) {
          setSelectedDepartmentId(user.departmentIds[0]);
          setSelectedEmployeeId(user.employeeId);
        } else {
          setSelectedDepartmentId("unassigned");
          setSelectedEmployeeId(user.employeeId);
        }
      }
    }
  }, [departments, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployeeId) {
      confirmArrivalMutation.mutate({
        purchaseIds: selectedMaterials.map((v) => v.id),
        arrivalConfirmedEmployeeId: selectedEmployeeId,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={selectedMaterials.length === 0}>到貨確認</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>到貨確認</DialogTitle>
            <DialogDescription>
              已選擇{selectedMaterials.length}個素材
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="">請選則員工</p>
            <Select
              onValueChange={(v) => {
                setSelectedDepartmentId(v);
                setSelectedEmployeeId("");
              }}
              value={selectedDepartmentId}
              disabled={
                isDepartmentsLoading || confirmArrivalMutation.isPending
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇部門" />
              </SelectTrigger>
              <SelectContent>
                {departmentsWithUnassignedOption?.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={setSelectedEmployeeId}
              value={selectedEmployeeId}
              disabled={
                isEmployeesLoading ||
                !selectedDepartmentId ||
                confirmArrivalMutation.isPending
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇員工" />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.chName} ({employee.idNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={
                !selectedDepartmentId ||
                !selectedEmployeeId ||
                confirmArrivalMutation.isPending
              }
            >
              確認
              {confirmArrivalMutation.isPending && <Spinner className="mx-0" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
