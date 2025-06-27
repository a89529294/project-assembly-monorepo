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
import { useQuery } from "@tanstack/react-query";

interface MaterialArrivedDialogProps {
  selectedMaterials: Material[];
}

export function MaterialArrivedDialog({
  selectedMaterials,
}: MaterialArrivedDialogProps) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>();

  const { data: departments, isLoading: isDepartmentsLoading } = useQuery(
    trpc.basicInfo.readEmployeeDepartments.queryOptions()
  );

  const { data: employees, isLoading: isEmployeesLoading } = useQuery(
    trpc.basicInfo.readEmployeesByDepartment.queryOptions(
      selectedDepartmentId!,
      {
        enabled: !!selectedDepartmentId,
      }
    )
  );

  useEffect(() => {
    if (departments && departments.length > 0 && !selectedDepartmentId) {
      setSelectedDepartmentId(departments[0].id);
    }
  }, [departments, selectedDepartmentId]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={selectedMaterials.length === 0}>物料到貨</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>物料到貨</DialogTitle>
          <DialogDescription>請選擇經手人</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ul>
            {selectedMaterials.map((material) => (
              <li key={material.id}>{material.material}</li>
            ))}
          </ul>
          <Select
            onValueChange={setSelectedDepartmentId}
            value={selectedDepartmentId}
            disabled={isDepartmentsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="選擇部門" />
            </SelectTrigger>
            <SelectContent>
              {departments?.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={setSelectedEmployeeId}
            value={selectedEmployeeId}
            disabled={isEmployeesLoading || !selectedDepartmentId}
          >
            <SelectTrigger>
              <SelectValue placeholder="選擇經手人" />
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
          <Button type="submit">確認</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
