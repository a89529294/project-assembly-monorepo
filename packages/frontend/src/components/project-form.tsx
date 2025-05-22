import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { Form } from "@/components/ui/form";
import { useCounties } from "@/hooks/use-counties";
import { useDistricts } from "@/hooks/use-districts";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PROJECT_STATUSES,
  projectFormSchema,
  ProjectFormValue,
  ProjectUpdate,
} from "@myapp/shared";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";

interface ProjectFormProps {
  initialData?: ProjectUpdate;
  onSubmit: (values: ProjectFormValue) => void;
  disabled: boolean;
  customerId: string;
}

export function ProjectForm({
  initialData,
  onSubmit,
  disabled,
  customerId,
}: ProjectFormProps) {
  console.log(customerId);
  const { counties } = useCounties();
  const availableContacts = [
    { id: "1", value: "1", label: "聯絡人一" },
    { id: "2", value: "2", label: "聯絡人二" },
  ];

  const form = useForm<ProjectFormValue>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: initialData
      ? initialData
      : {
          customerId,
          projectNumber: "",
          name: "",
          status: "pending",
          county: "",
          district: "",
          address: "",
          contactIdObjects: [],
        },
    disabled,
  });

  const { data: districts } = useDistricts(form.watch("county"));

  const handleSubmit = form.handleSubmit(onSubmit, (e) => {
    console.log(form.getValues("customerId"));
    console.log(e);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6" id="project-form">
        <div className="space-y-6">
          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white rounded-lg shadow">
            <h2 className="md:col-span-2 text-lg font-semibold">專案資訊</h2>

            <TextField
              form={form}
              name="projectNumber"
              label="專案編號"
              required
            />

            <TextField form={form} name="name" label="專案名稱" required />

            <SelectField
              form={form}
              name="status"
              label="狀態"
              options={PROJECT_STATUSES.map((status) => ({
                value: status,
                label: status,
              }))}
              required
            />
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 gap-4 p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold">專案地址</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                form={form}
                name="county"
                label="縣市"
                options={counties}
                onSelect={() => form.setValue("district", "")}
                required={false}
              />

              <SelectField
                form={form}
                name="district"
                label="區"
                options={districts || []}
                required={false}
              />

              <TextField form={form} name="address" label="詳細地址" />
            </div>
          </div>

          {/* Contacts */}
          <div className="grid grid-cols-1 gap-4 p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold">聯絡人</h2>
            <div className="space-y-4">
              <ContactFields
                form={form}
                availableContacts={availableContacts}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

interface ContactFieldsProps {
  availableContacts: Array<{ value: string; label: string; id: string }>;
  form: UseFormReturn<ProjectFormValue>;
}

function ContactFields({ availableContacts, form }: ContactFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contactIdObjects",
  });

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <div className="flex-1">
            <SelectField
              form={form}
              name={`contactIdObjects.${index}.id`}
              label={index === 0 ? "聯絡人" : ""}
              options={availableContacts}
              required={false}
            />
          </div>
          {index > 0 && (
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500 hover:text-red-700 mt-6"
            >
              移除
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => append(availableContacts[0])}
        className="text-blue-500 hover:text-blue-700 text-sm font-medium self-start"
      >
        + 新增聯絡人
      </button>
    </div>
  );
}
