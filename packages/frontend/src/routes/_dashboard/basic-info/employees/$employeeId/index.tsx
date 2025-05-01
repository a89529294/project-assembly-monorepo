import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { isEmployeeFieldRequired } from "@/lib/schema-required-field-factory";
import { useSuspenseQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export const Route = createFileRoute(
  "/_dashboard/basic-info/employees/$employeeId/"
)({
  validateSearch: z.object({
    mode: z.enum(["read", "edit"]).optional().catch("read"),
  }),
  async loader({ params }) {
    await Promise.allSettled([
      await queryClient.ensureQueryData(
        trpc.basicInfo.getEmployeeById.queryOptions(params.employeeId)
      ),
      await queryClient.ensureQueryData(
        trpc.basicInfo.getDepartments.queryOptions()
      ),
    ]);
  },
  component: RouteComponent,
  pendingComponent: () => <Skeleton className="absolute inset-6" />,
});

function RouteComponent() {
  const { employeeId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const mode = search.mode ?? "read";
  const { data: employee, updateEmployee } = useEmployee(employeeId);
  const { data: departments } = useSuspenseQuery(
    trpc.basicInfo.getDepartments.queryOptions()
  );

  const { register, handleSubmit, formState, reset, control } = useForm({
    resolver: zodResolver(employeeSelectSchema),
    defaultValues: employee,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "departments",
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

      toast.success("Employee updated successfully");
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

  console.log(formState.errors);

  return (
    <div className="absolute inset-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Button asChild>
          <Link to="/basic-info/employees">返回</Link>
        </Button>

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
                      ID Number{isEmployeeFieldRequired("idNumber") && " *"}
                    </label>
                    <input
                      {...register("idNumber")}
                      className={cn(
                        `mt-1 block w-full border rounded-md shadow-sm p-2  text-gray-900 focus-visible:outline-0`,
                        disableInputs
                          ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80"
                          : "bg-white",
                        formState.errors["idNumber"]
                          ? "border-red-300"
                          : "border-gray-300"
                      )}
                      disabled={disableInputs}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Chinese Name{isEmployeeFieldRequired("chName") && " *"}
                    </label>
                    <input
                      {...register("chName")}
                      required={isEmployeeFieldRequired("chName")}
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
                      required={isEmployeeFieldRequired("enName")}
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
                      required={isEmployeeFieldRequired("birthday")}
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                      disabled={disableInputs}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender{isEmployeeFieldRequired("gender") && " *"}
                    </label>
                    <select
                      {...register("gender")}
                      required={isEmployeeFieldRequired("gender")}
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
                      {isEmployeeFieldRequired("marital_status") && " *"}
                    </label>
                    <input
                      {...register("marital_status")}
                      required={isEmployeeFieldRequired("marital_status")}
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                      disabled={disableInputs}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Education{isEmployeeFieldRequired("education") && " *"}
                    </label>
                    <input
                      {...register("education")}
                      required={isEmployeeFieldRequired("education")}
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
                      Phone{isEmployeeFieldRequired("phone1") && " *"}
                    </label>
                    <input
                      {...register("phone1")}
                      required={isEmployeeFieldRequired("phone1")}
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                      disabled={disableInputs}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email{isEmployeeFieldRequired("email") && " *"}
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      required={isEmployeeFieldRequired("email")}
                      className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                      disabled={disableInputs}
                    />
                  </div>
                </div>

                {/* Departments */}
                <div className="grid grid-cols-1 gap-4 p-6 bg-white rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">Departments</h2>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => {
                        if (departments && departments.length > 0) {
                          append({
                            departmentId: departments[0].id,
                            departmentName: departments[0].name,
                            jobTitle: "",
                          });
                        }
                      }}
                      disabled={!departments || departments.length === 0}
                    >
                      + Add Department
                    </button>
                  </div>

                  {fields.map((dept, index) => (
                    <div
                      key={dept.id || dept.departmentId || index}
                      className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-center"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <select
                          {...register(`departments.${index}.departmentId`)}
                          className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                        >
                          <option value="">Select a department</option>
                          {departments?.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
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
                      <button
                        type="button"
                        className="ml-2 mt-6 px-3 py-1.5 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 rounded-md text-sm"
                        onClick={() => remove(index)}
                      >
                        Delete
                      </button>
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
                        {isEmployeeFieldRequired("residenceCounty") && " *"}
                      </label>
                      <input
                        {...register("residenceCounty")}
                        required={isEmployeeFieldRequired("residenceCounty")}
                        className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                        disabled={disableInputs}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        District
                        {isEmployeeFieldRequired("residenceDistrict") && " *"}
                      </label>
                      <input
                        {...register("residenceDistrict")}
                        required={isEmployeeFieldRequired("residenceDistrict")}
                        className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                        disabled={disableInputs}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Address
                        {isEmployeeFieldRequired("residenceAddress") && " *"}
                      </label>
                      <input
                        {...register("residenceAddress")}
                        required={isEmployeeFieldRequired("residenceAddress")}
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
                        County{isEmployeeFieldRequired("mailingCounty") && " *"}
                      </label>
                      <input
                        {...register("mailingCounty")}
                        required={isEmployeeFieldRequired("mailingCounty")}
                        className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                        disabled={disableInputs}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        District
                        {isEmployeeFieldRequired("mailingDistrict") && " *"}
                      </label>
                      <input
                        {...register("mailingDistrict")}
                        required={isEmployeeFieldRequired("mailingDistrict")}
                        className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                        disabled={disableInputs}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Address
                        {isEmployeeFieldRequired("mailingAddress") && " *"}
                      </label>
                      <input
                        {...register("mailingAddress")}
                        required={isEmployeeFieldRequired("mailingAddress")}
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
