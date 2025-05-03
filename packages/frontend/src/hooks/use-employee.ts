import { trpc } from "@/trpc";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

export function useEmployee(id: string) {
  const employeeQuery = useSuspenseQuery({
    ...trpc.basicInfo.readEmployeeById.queryOptions(id),
  });
  const updateEmployee = useMutation(
    trpc.basicInfo.updateEmployeeById.mutationOptions()
  );

  // const createCompanyInfo = useMutation(
  //   trpc.basicInfo.createCompanyInfo.mutationOptions()
  // );
  // const updateEmployee = useMutation(
  //   trpc.basicInfo.updateCompanyInfo.mutationOptions()
  // );

  return {
    ...employeeQuery,
    updateEmployee,
  };
}
