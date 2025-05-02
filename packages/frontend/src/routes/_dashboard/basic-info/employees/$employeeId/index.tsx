import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
// import { useEmployee } from "@/hooks/use-employee";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployee } from "@/hooks/use-employee";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import { queryClient } from "@/query-client";
// import { trpc } from "@/trpc";
import { useEffect } from "react";

import { DateField } from "@/components/form/date-field";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { employeeSelectSchema } from "@myapp/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
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
  const mode = search.mode;
  const { data: employee, updateEmployee } = useEmployee(employeeId);
  const { data: departments } = useSuspenseQuery(
    trpc.basicInfo.getDepartments.queryOptions()
  );

  const form = useForm<z.infer<typeof employeeSelectSchema>>({
    resolver: zodResolver(employeeSelectSchema),
    defaultValues: employee,
    disabled: mode === "read",
  });
  const { control, reset, formState, watch } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "departments",
  });

  const a = form.getValues("birthday");
  console.log(watch("birthday"));

  useEffect(() => {
    reset(employee);
  }, [employee, reset]);

  const handleEditClick = () => {
    navigate({ search: { mode: "edit" } });
  };

  const handleCancelClick = () => {
    navigate({ search: { mode: "read" } });
  };

  async function onSubmit(data: z.infer<typeof employeeSelectSchema>) {
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
  }

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
            <Form {...form}>
              <form id="employee-form" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white rounded-lg shadow">
                    <h2 className="md:col-span-3 text-lg font-semibold">
                      Personal Information
                    </h2>

                    <TextField
                      form={form}
                      name="idNumber"
                      required={
                        !employeeSelectSchema.shape.idNumber.isNullable()
                      }
                    />

                    <TextField
                      form={form}
                      name="chName"
                      required={!employeeSelectSchema.shape.chName.isNullable()}
                    />

                    <TextField
                      form={form}
                      name="enName"
                      required={!employeeSelectSchema.shape.enName.isNullable()}
                    />

                    <DateField
                      form={form}
                      name="birthday"
                      required={
                        !employeeSelectSchema.shape.birthday.isNullable()
                      }
                    />

                    <SelectField
                      form={form}
                      name="gender"
                      required={!employeeSelectSchema.shape.gender.isNullable()}
                    />

                    <TextField
                      form={form}
                      name="marital_status"
                      required={
                        !employeeSelectSchema.shape.marital_status.isNullable()
                      }
                    />

                    <TextField
                      form={form}
                      name="education"
                      required={
                        !employeeSelectSchema.shape.education.isNullable()
                      }
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white rounded-lg shadow">
                    <h2 className="md:col-span-2 text-lg font-semibold">
                      Contact Information
                    </h2>

                    <TextField
                      form={form}
                      name="phone"
                      required={!employeeSelectSchema.shape.phone.isNullable()}
                    />

                    <TextField
                      form={form}
                      name="email"
                      required={!employeeSelectSchema.shape.email.isNullable()}
                    />
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
                        <FormField
                          control={form.control}
                          name={`departments.${index}.departmentId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"}`}
                                >
                                  <option value="">Select a department</option>
                                  {departments?.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                      {dept.name}
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <TextField
                          form={form}
                          name={`departments.${index}.jobTitle`}
                          label="職位"
                          required={
                            !employeeSelectSchema.shape.departments.element.shape.jobTitle.isNullable()
                          }
                        />
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

                      <TextField
                        form={form}
                        name="residenceCounty"
                        required={
                          !employeeSelectSchema.shape.residenceCounty.isNullable()
                        }
                      />

                      <TextField
                        form={form}
                        name="residenceDistrict"
                        required={
                          !employeeSelectSchema.shape.residenceDistrict.isNullable()
                        }
                      />

                      <TextField
                        form={form}
                        name="residenceAddress"
                        required={
                          !employeeSelectSchema.shape.residenceAddress.isNullable()
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <h3 className="md:col-span-3 text-md font-medium">
                        Mailing Address
                      </h3>

                      <TextField
                        form={form}
                        name="mailingCounty"
                        required={
                          !employeeSelectSchema.shape.mailingCounty.isNullable()
                        }
                      />

                      <TextField
                        form={form}
                        name="mailingDistrict"
                        required={
                          !employeeSelectSchema.shape.mailingDistrict.isNullable()
                        }
                      />

                      <TextField
                        form={form}
                        name="mailingAddress"
                        required={
                          !employeeSelectSchema.shape.mailingAddress.isNullable()
                        }
                      />
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
