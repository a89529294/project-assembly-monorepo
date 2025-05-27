import { useEmployee } from "@/hooks/use-employee";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { createFileRoute } from "@tanstack/react-router";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { EmployeeForm } from "@/components/employee-form";
import { PendingComponent } from "@/components/pending-component";
import { EmployeeDetail, employeeDetailedSchema } from "@myapp/shared";
import { toast } from "sonner";
import { useAuth } from "@/auth/use-auth";

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
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const { user } = useAuth();
  const navigate = Route.useNavigate();
  const { employeeId } = Route.useParams();
  const search = Route.useSearch();
  const mode = search.mode;
  const { data: employee, updateEmployee } = useEmployee(employeeId);

  async function onSubmit(data: z.infer<typeof employeeDetailedSchema>) {
    await updateEmployee.mutateAsync({
      id: employeeId,
      payload: {
        ...data,
        updatedBy: user!.id,
      },
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
        disabled={mode === "read" || updateEmployee.isPending}
        onSubmit={onSubmit}
        ActionButtons={({ form }: { form: UseFormReturn<EmployeeDetail> }) => (
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
  form: UseFormReturn<EmployeeDetail>;
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
