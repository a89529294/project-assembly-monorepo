import { DateField } from "@/components/form/date-field";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmployeeSelect, employeeSelectSchema } from "@myapp/shared";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type EmployeeFormProps = {
  disabled: boolean;
  initialData?: EmployeeSelect;
  onSubmit: (data: EmployeeSelect) => Promise<void>;
  ActionButtons: React.FC<{ form: UseFormReturn<EmployeeSelect> }>;
};

export function EmployeeForm({
  initialData,
  disabled,
  onSubmit,
  ActionButtons,
}: EmployeeFormProps) {
  const { data: departments } = useQuery(
    trpc.basicInfo.readDepartments.queryOptions()
  );
  const defaultValues: EmployeeSelect = {
    idNumber: "",
    chName: "",
    enName: "",
    birthday: null,
    gender: "male",
    marital_status: "",
    education: "",
    phone: "",
    email: "",
    departments: [],
    residenceCounty: "",
    residenceDistrict: "",
    residenceAddress: "",
    mailingCounty: "",
    mailingDistrict: "",
    mailingAddress: "",
  };
  const form = useForm<z.infer<typeof employeeSelectSchema>>({
    resolver: zodResolver(employeeSelectSchema),
    defaultValues: initialData ?? defaultValues,
    disabled: disabled,
  });
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "departments",
  });

  const handleFormSubmit = async (
    data: z.infer<typeof employeeSelectSchema>
  ) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error(error);
      toast.error(initialData ? "無法更新員工" : "無法創造員工");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Button asChild>
          <Link to="/basic-info/employees">返回</Link>
        </Button>

        <ActionButtons form={form} />
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <ScrollArea className="h-full">
            {" "}
            <Form {...form}>
              <form
                id="employee-form"
                onSubmit={form.handleSubmit(handleFormSubmit)}
              >
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white rounded-lg shadow">
                    <h2 className="md:col-span-3 text-lg font-semibold">
                      個人資訊
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
                      options={[
                        { value: "male", label: "男" },
                        { value: "female", label: "女" },
                      ]}
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
                      <Button
                        onClick={() => {
                          if (departments && departments.length > 0) {
                            append({
                              departmentId: departments[0].id,
                              departmentName: departments[0].name,
                              jobTitle: "",
                            });
                          }
                        }}
                        disabled={form.formState.disabled}
                      >
                        + 新增部門職位
                      </Button>
                    </div>

                    {fields.map((dept, index) => (
                      <div
                        key={dept.id || dept.departmentId || index}
                        className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-center"
                      >
                        <SelectField
                          form={form}
                          name={`departments.${index}.departmentId`}
                          label="部門"
                          // TODO deal with async deprtments
                          options={
                            departments?.map((d) => ({
                              value: d.id,
                              label: d.name,
                            })) ?? []
                          }
                          required={
                            !employeeSelectSchema.shape.departments.element.shape.departmentId.isNullable()
                          }
                        />
                        <TextField
                          form={form}
                          name={`departments.${index}.jobTitle`}
                          label="職位"
                          required={
                            !employeeSelectSchema.shape.departments.element.shape.jobTitle.isNullable()
                          }
                        />
                        <Button
                          variant={"destructive"}
                          disabled={form.formState.disabled}
                          onClick={() => remove(index)}
                        >
                          刪除
                        </Button>
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
    </>
  );
}
