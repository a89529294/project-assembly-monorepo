import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { FileUploadField } from "@/components/project-form/file-upload-field";
import { Form } from "@/components/ui/form";
import { useCounties } from "@/hooks/use-counties";
import { useDistricts } from "@/hooks/use-districts";
import { trpc } from "@/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PROJECT_STATUSES,
  projectFormSchema,
  ProjectFormValue,
} from "@myapp/shared";
import { useQuery } from "@tanstack/react-query";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";

type ProjectFormProps = {
  customerId: string;
  projectId?: string;
  initialData?: ProjectFormValue;
  onSubmit: (data: ProjectFormValue) => void;
  disabled: boolean;
};

// type ProjectFormProps =
//   | ({
//       type: "create";
//       onSubmit: (values: ProjectCreate) => void;
//     } & BaseProjectFormProps)
//   | ({
//       type: "update";
//       onSubmit: (values: ProjectUpdate) => void;
//       initialData: ProjectUpdate;
//     } & BaseProjectFormProps);

export function ProjectForm(props: ProjectFormProps) {
  const { counties } = useCounties();

  const form = useForm<ProjectFormValue>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: props.initialData
      ? props.initialData
      : {
          name: "",
          projectNumber: "",
          status: "pending",
          county: null,
          district: null,
          address: null,
          customerId: props.customerId,
          contacts: [],
          bom: undefined,
        },
    disabled: props.disabled,
  });

  const { data: districts } = useDistricts(form.watch("county"));

  const handleSubmit = form.handleSubmit(
    (values) => {
      props.onSubmit(values);
    },
    (errors) => {
      console.log(errors);
    }
  );

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
              <ContactFields form={form} customerId={props.customerId} />
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 gap-4 p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold">檔案上傳</h2>
            <div className="space-y-4">
              <FileUploadField
                form={form}
                name="bom"
                label="BOM 檔案"
                accept=".csv,.xlsx,.xls"
                projectId={props.projectId}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

// interface FileUploadFieldProps {
//   form: UseFormReturn<ProjectFormValue>;
//   name: "bom";
//   label: string;
//   accept: string;
//   description?: string;
// }

// function FileUploadField({
//   form,
//   name,
//   label,
//   accept,
//   description,
// }: FileUploadFieldProps) {
//   const fileValue = useWatch({
//     control: form.control,
//     name: name,
//   });

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       form.setValue(name, file);
//     }
//   };

//   return (
//     <div className="space-y-2">
//       <label className="block text-sm font-medium text-gray-700">{label}</label>
//       <div className="mt-1 flex items-center">
//         <label className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
//           <span className="flex items-center gap-2">
//             <FileUp className="h-4 w-4" />
//             選擇檔案
//           </span>
//           <input
//             type="file"
//             accept={accept}
//             className="sr-only"
//             onChange={handleFileChange}
//           />
//         </label>
//         {fileValue?.name && (
//           <span className="ml-4 text-sm text-gray-500 truncate max-w-xs">
//             已選擇: {fileValue.name}
//           </span>
//         )}
//       </div>
//       {description && (
//         <p className="mt-1 text-sm text-gray-500">{description}</p>
//       )}
//     </div>
//   );
// }

interface ContactFieldsProps {
  customerId: string;
  form: UseFormReturn<ProjectFormValue>;
}

function ContactFields({ customerId, form }: ContactFieldsProps) {
  const { data: availableContacts, isLoading } = useQuery(
    trpc.basicInfo.readProjectContacts.queryOptions(customerId)
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <div className="flex-1">
            <SelectField
              form={form}
              name={`contacts.${index}.id`}
              label={index === 0 ? "聯絡人" : ""}
              options={availableContacts?.map((v) => ({
                value: v.id,
                label: v.name,
              }))}
              loading={isLoading}
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
        onClick={() => append(availableContacts![0])}
        className="text-blue-500 hover:text-blue-700 text-sm font-medium self-start"
        disabled={!availableContacts || availableContacts.length === 0}
      >
        + 新增聯絡人
      </button>
    </div>
  );
}
