import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { FileUploadField } from "@/components/project-form/file-upload-field";
import { Form } from "@/components/ui/form";
import { useCounties } from "@/hooks/use-counties";

import { useDistricts } from "@/hooks/use-districts";
import { FileUploadStatus } from "@/hooks/use-multi-file-upload-progress";
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
  fileStatuses: FileUploadStatus[];
};

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
          nc: undefined,
          constructorPDF: undefined,
          installedPlanePDF: undefined,
          designedPlanePDF: undefined,
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
                label="BOM 檔案 (csv)"
                accept=".csv,.xlsx,.xls"
                projectId={props.projectId}
                status={props.fileStatuses.find((v) => v.fileId === "bom")}
              />
            </div>
            <div className="space-y-4">
              <FileUploadField
                form={form}
                name="nc"
                label="NC 檔案 (zip)"
                accept=".zip"
                projectId={props.projectId}
                status={props.fileStatuses.find((v) => v.fileId === "nc")}
              />

              <FileUploadField
                form={form}
                name="constructorPDF"
                label="構建PDF (zip)"
                accept=".zip"
                projectId={props.projectId}
                status={props.fileStatuses.find(
                  (v) => v.fileId === "constructorPDF"
                )}
              />

              <FileUploadField
                form={form}
                name="installedPlanePDF"
                label="安裝平面 (zip)"
                accept=".zip"
                projectId={props.projectId}
                status={props.fileStatuses.find(
                  (v) => v.fileId === "installedPlanePDF"
                )}
              />

              <FileUploadField
                form={form}
                name="designedPlanePDF"
                label="設計平面 (zip)"
                accept=".zip"
                projectId={props.projectId}
                status={props.fileStatuses.find(
                  (v) => v.fileId === "designedPlanePDF"
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

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
