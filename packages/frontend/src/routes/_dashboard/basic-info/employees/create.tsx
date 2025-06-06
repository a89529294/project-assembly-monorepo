import { EmployeeForm } from "@/components/employee-form";
import { PendingComponent } from "@/components/pending-component";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { employeeDetailedSchema } from "@myapp/shared";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_dashboard/basic-info/employees/create")(
  {
    component: RouteComponent,
    pendingComponent: PendingComponent,
  }
);

function RouteComponent() {
  const navigate = Route.useNavigate();
  const createEmployee = useMutation(
    trpc.basicInfo.createEmployee.mutationOptions()
  );

  async function onSubmit(data: z.infer<typeof employeeDetailedSchema>) {
    await createEmployee.mutateAsync({
      payload: data,
    });

    toast.success("Employee updated successfully");
    queryClient.invalidateQueries({
      queryKey: trpc.basicInfo.readEmployees.queryKey(),
    });
    navigate({ to: "/basic-info/employees" });
  }

  return (
    <div className="absolute inset-6 flex flex-col">
      <EmployeeForm
        disabled={createEmployee.isPending}
        onSubmit={onSubmit}
        ActionButtons={() => (
          <ActionButtons isPending={createEmployee.isPending} />
        )}
      />
    </div>
  );
}

function ActionButtons({ isPending }: { isPending: boolean }) {
  return (
    <button
      type="submit"
      form="employee-form"
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      disabled={isPending}
    >
      {isPending ? "Saving..." : "Save"}
    </button>
  );
}
