import { createFileRoute } from "@tanstack/react-router";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployee } from "@/hooks/use-employee";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";

import { EmployeeForm } from "@/components/employee-form";
import { EmployeeSelect, employeeSelectSchema } from "@myapp/shared";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_dashboard/basic-info/employees/$employeeId/"
)({
  validateSearch: z.object({
    mode: z
      .enum(["read", "edit"])
      .optional()
      .transform((v) => v ?? "read"),
  }),
  async loader({ params }) {
    await queryClient.ensureQueryData(
      trpc.basicInfo.readEmployeeById.queryOptions(params.employeeId)
    );
  },
  component: RouteComponent,
  pendingComponent: () => <Skeleton className="absolute inset-6" />,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { employeeId } = Route.useParams();
  const search = Route.useSearch();
  const mode = search.mode;
  const { data: employee, updateEmployee } = useEmployee(employeeId);

  async function onSubmit(data: z.infer<typeof employeeSelectSchema>) {
    await updateEmployee.mutateAsync({
      id: employeeId,
      payload: data,
    });

    toast.success("Employee updated successfully");
    queryClient.invalidateQueries({
      queryKey:
        trpc.basicInfo.readEmployeeById.queryOptions(employeeId).queryKey,
    });
    navigate({ search: { mode: "read" } });
  }

  return (
    <div className="absolute inset-6 flex flex-col">
      <EmployeeForm
        initialData={employee}
        disabled={mode === "read"}
        onSubmit={onSubmit}
        ActionButtons={({ form }: { form: UseFormReturn<EmployeeSelect> }) => (
          <ActionButtons
            form={form}
            mode={mode}
            isPending={updateEmployee.isPending}
          />
        )}
      />
    </div>
  );
}

function ActionButtons({
  form,
  mode,
  isPending,
}: {
  form: UseFormReturn<EmployeeSelect>;
  mode: string;
  isPending: boolean;
}) {
  const navigate = Route.useNavigate();
  const handleEditClick = () => {
    navigate({ search: { mode: "edit" } });
  };

  const handleCancelClick = () => {
    form.clearErrors();
    form.reset();
    navigate({ search: { mode: "read" } });
  };

  return mode === "read" ? (
    <button
      onClick={handleEditClick}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Edit
    </button>
  ) : (
    <div className="flex gap-2">
      <button
        onClick={handleCancelClick}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="employee-form"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={isPending}
      >
        {isPending ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
