import { DateField } from "@/components/form/date-field";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCounties } from "@/hooks/use-counties";
import { useDepartments } from "@/hooks/departments/use-departments";
import { useDistricts } from "@/hooks/use-districts";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmployeeDetail, employeeDetailedSchema } from "@myapp/shared";
import { Link } from "@tanstack/react-router";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

type EmployeeFormProps = {
  disabled: boolean;
  initialData?: EmployeeDetail;
  onSubmit: (data: EmployeeDetail) => Promise<void>;
  ActionButtons: React.FC<{ form: UseFormReturn<EmployeeDetail> }>;
};

export function EmployeeForm({
  initialData,
  disabled,
  onSubmit,
  ActionButtons,
}: EmployeeFormProps) {
  const { departments, isLoading: isLoadingDepartments } = useDepartments();
  const {
    data: counties,
    isLoading: isLoadingCounties,
    nameToCode,
    codeToName,
  } = useCounties();
  const defaultValues: EmployeeDetail = {
    idNumber: "",
    chName: "",
    enName: "",
    birthday: null,
    gender: "male",
    maritalStatus: "",
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
  const form = useForm<EmployeeDetail>({
    resolver: zodResolver(employeeDetailedSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          residenceCounty: initialData.residenceCounty
            ? nameToCode[initialData.residenceCounty]
            : initialData.residenceCounty,
          mailingCounty: initialData.mailingCounty
            ? nameToCode[initialData.mailingCounty]
            : initialData.mailingCounty,
        }
      : defaultValues,
    disabled: disabled,
  });
  const { data: townsForResidence, isLoading: isLoadingResidenceTown } =
    useDistricts(form.watch("residenceCounty"));
  const { data: townsForMailing, isLoading: isLoadingMailingTown } =
    useDistricts(form.watch("mailingCounty"));

  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "departments",
  });

  const handleFormSubmit = async (data: EmployeeDetail) => {
    try {
      await onSubmit({
        ...data,
        residenceCounty: data.residenceCounty
          ? codeToName[data.residenceCounty]
          : data.residenceCounty,
        mailingCounty: data.mailingCounty
          ? codeToName[data.mailingCounty]
          : data.mailingCounty,
      });
    } catch (error) {
      console.error(error);
      toast.error(initialData ? "無法更新員工" : "無法創造員工");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Button asChild type="button">
          <Link to={"/basic-info/employees"}>返回</Link>
        </Button>

        <ActionButtons form={form} />
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <ScrollArea className="h-full">
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
                        !employeeDetailedSchema.shape.idNumber.isNullable()
                      }
                    />

                    <TextField
                      form={form}
                      name="chName"
                      required={
                        !employeeDetailedSchema.shape.chName.isNullable()
                      }
                    />

                    <TextField
                      form={form}
                      name="enName"
                      required={
                        !employeeDetailedSchema.shape.enName.isNullable()
                      }
                    />

                    <DateField
                      form={form}
                      name="birthday"
                      required={
                        !employeeDetailedSchema.shape.birthday.isNullable()
                      }
                    />

                    <SelectField
                      form={form}
                      name="gender"
                      required={
                        !employeeDetailedSchema.shape.gender.isNullable()
                      }
                      options={[
                        { value: "male", label: "男" },
                        { value: "female", label: "女" },
                      ]}
                    />

                    <TextField
                      form={form}
                      name="maritalStatus"
                      required={
                        !employeeDetailedSchema.shape.maritalStatus.isNullable()
                      }
                    />

                    <TextField
                      form={form}
                      name="education"
                      required={
                        !employeeDetailedSchema.shape.education.isNullable()
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
                      required={
                        !employeeDetailedSchema.shape.phone.isNullable()
                      }
                    />

                    <TextField
                      form={form}
                      name="email"
                      required={
                        !employeeDetailedSchema.shape.email.isNullable()
                      }
                    />
                  </div>

                  {/* Departments */}
                  <div className="grid grid-cols-1 gap-4 p-6 bg-white rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold">Departments</h2>
                      <Button
                        onClick={() => {
                          if (departments && departments.length > 0) {
                            append(
                              {
                                departmentId: departments[0].id,
                                departmentName: departments[0].name,
                                jobTitle: "",
                              },
                              {}
                            );
                          }
                        }}
                        disabled={
                          form.formState.disabled || isLoadingDepartments
                        }
                        type="button"
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
                          options={departments?.map((d) => ({
                            value: d.id,
                            label: d.name,
                          }))}
                          required={
                            !employeeDetailedSchema.shape.departments.element.shape.departmentId.isNullable()
                          }
                          loading={isLoadingDepartments}
                        />
                        <TextField
                          form={form}
                          name={`departments.${index}.jobTitle`}
                          label="職位"
                          required={
                            !employeeDetailedSchema.shape.departments.element.shape.jobTitle.isNullable()
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

                      <SelectField
                        form={form}
                        name="residenceCounty"
                        required={
                          !employeeDetailedSchema.shape.residenceCounty.isNullable()
                        }
                        loading={isLoadingCounties}
                        options={counties}
                        onSelect={() =>
                          form.setValue("residenceDistrict", null)
                        }
                      />

                      <SelectField
                        form={form}
                        name="residenceDistrict"
                        required={
                          !employeeDetailedSchema.shape.residenceDistrict.isNullable()
                        }
                        loading={isLoadingResidenceTown}
                        options={townsForResidence}
                      />

                      <TextField
                        form={form}
                        name="residenceAddress"
                        required={
                          !employeeDetailedSchema.shape.residenceAddress.isNullable()
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <h3 className="md:col-span-3 text-md font-medium">
                        Mailing Address
                      </h3>

                      <SelectField
                        form={form}
                        name="mailingCounty"
                        required={
                          !employeeDetailedSchema.shape.mailingCounty.isNullable()
                        }
                        loading={isLoadingCounties}
                        options={counties}
                      />

                      <SelectField
                        form={form}
                        name="mailingDistrict"
                        required={
                          !employeeDetailedSchema.shape.mailingDistrict.isNullable()
                        }
                        loading={isLoadingMailingTown}
                        options={townsForMailing}
                      />

                      <TextField
                        form={form}
                        name="mailingAddress"
                        required={
                          !employeeDetailedSchema.shape.mailingAddress.isNullable()
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
