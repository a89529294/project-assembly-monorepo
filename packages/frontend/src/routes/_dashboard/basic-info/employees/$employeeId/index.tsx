import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useEmployee } from "@/hooks/use-employee";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { useEmployee } from "@/hooks/use-employee";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import { queryClient } from "@/query-client";
// import { trpc } from "@/trpc";
import { useEffect } from "react";

import { toast } from "sonner";
import { employeeSelectSchema } from "@myapp/shared";

export const Route = createFileRoute(
  "/_dashboard/basic-info/employees/$employeeId/"
)({
  validateSearch: z.object({
    mode: z.enum(["read", "edit"]).optional().catch("read"),
  }),
  async loader({ params }) {
    await queryClient.ensureQueryData(
      trpc.basicInfo.getEmployeeById.queryOptions(params.employeeId)
    );
  },
  component: RouteComponent,
  pendingComponent: () => <Skeleton className="m-6 h-full" />,
});

function RouteComponent() {
  const { employeeId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const mode = search.mode ?? "read";
  const { data: employee, updateEmployee } = useEmployee(employeeId);

  const {
    register,
    handleSubmit,
    // formState:{error},
    reset,
    // control
  } = useForm({
    resolver: zodResolver(employeeSelectSchema),
    defaultValues: employee,
  });

  useEffect(() => {
    reset(employee);
  }, [employee, reset]);

  const handleEditClick = () => {
    navigate({ search: { mode: "edit" } });
  };

  const handleCancelClick = () => {
    navigate({ search: { mode: "read" } });
  };

  const handleSaveClick = handleSubmit(async (data) => {
    try {
      await updateEmployee.mutateAsync({
        id: employeeId,
        payload: data,
      });
      // toast.success("Employee updated successfully");
      queryClient.invalidateQueries({
        queryKey:
          trpc.basicInfo.getEmployeeById.queryOptions(employeeId).queryKey,
      });
      navigate({ search: { mode: "read" } });
    } catch (error) {
      console.log(error);
      toast.error("Failed to update employee");
    }
  });

  const disableInputs = mode === "read";

  return (
    <div className="absolute inset-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {employee?.chName || "Employee Details"}
        </h1>

        {mode === "read" ? (
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
              disabled={updateEmployee.isPending}
            >
              {updateEmployee.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <ScrollArea className="h-full">
            <form id="employee-form" onSubmit={handleSaveClick}>
              <div className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white rounded-lg shadow">
                  <h2 className="md:col-span-3 text-lg font-semibold">
                    Personal Information
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ID Number*
                    </label>
                    <input
                      {...register("idNumber")}
                      required
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                      disabled={disableInputs}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Chinese Name*
                    </label>
                    <input
                      {...register("chName")}
                      required
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                      disabled={disableInputs}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      English Name
                    </label>
                    <input
                      {...register("enName")}
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                      disabled={disableInputs}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Birthday
                    </label>
                    <input
                      type="date"
                      {...register("birthday")}
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                      disabled={disableInputs}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender*
                    </label>
                    <select
                      {...register("gender")}
                      required
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                      disabled={disableInputs}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Marital Status
                    </label>
                    <input
                      {...register("marital_status")}
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                      disabled={disableInputs}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Education
                    </label>
                    <input
                      {...register("education")}
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                      disabled={disableInputs}
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white rounded-lg shadow">
                  <h2 className="md:col-span-2 text-lg font-semibold">
                    Contact Information
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone*
                    </label>
                    <input
                      {...register("phone1")}
                      required
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                      disabled={disableInputs}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                      disabled={disableInputs}
                    />
                  </div>
                </div>

                {/* Departments */}
                <div className="grid grid-cols-1 gap-4 p-6 bg-white rounded-lg shadow">
                  <h2 className="text-lg font-semibold">Departments</h2>

                  {employee?.departments?.map((dept, index) => (
                    <div
                      key={dept.departmentId}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <input
                          {...register(`departments.${index}.departmentName`)}
                          className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Job Title
                        </label>
                        <input
                          {...register(`departments.${index}.jobTitle`)}
                          className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                          disabled={disableInputs}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 gap-6 p-6 bg-white rounded-lg shadow">
                  <h2 className="text-lg font-semibold">Addresses</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <h3 className="md:col-span-3 text-md font-medium">
                      Residence Address
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        County
                      </label>
                      <input
                        {...register("residenceCounty")}
                        className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                        disabled={disableInputs}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        District
                      </label>
                      <input
                        {...register("residenceDistrict")}
                        className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                        disabled={disableInputs}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input
                        {...register("residenceAddress")}
                        className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                        disabled={disableInputs}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <h3 className="md:col-span-3 text-md font-medium">
                      Mailing Address
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        County
                      </label>
                      <input
                        {...register("mailingCounty")}
                        className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                        disabled={disableInputs}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        District
                      </label>
                      <input
                        {...register("mailingDistrict")}
                        className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                        disabled={disableInputs}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input
                        {...register("mailingAddress")}
                        className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                        disabled={disableInputs}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
