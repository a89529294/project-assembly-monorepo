import { ProjectFormValue } from "@myapp/shared";
import { LucideFileUp } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";

interface FileUploadFieldProps {
  form: UseFormReturn<ProjectFormValue>;
  name: "bom";
  label: string;
  accept: string;
  description?: string;
}

export function FileUploadField({
  form,
  name,
  label,
  accept,
  description,
}: FileUploadFieldProps) {
  const fileValue = useWatch({
    control: form.control,
    name: name,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue(name, file);
    }
  };

  const handleRemoveFile = () => {
    form.setValue(name, undefined);
  };

  const hasExistingFile =
    typeof fileValue === "string" && fileValue.trim() !== "";
  const hasNewFile = fileValue instanceof File;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Show existing file if present and no new file selected */}
      {hasExistingFile && !hasNewFile && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-2">
            <LucideFileUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">目前檔案</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={fileValue as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              下載檔案
            </a>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-sm text-red-600 hover:text-red-800"
            >
              移除
            </button>
          </div>
        </div>
      )}

      {/* File upload section */}
      <div className="mt-1 flex items-center">
        <label className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
          <span className="flex items-center gap-2">
            <LucideFileUp className="h-4 w-4" />
            {hasExistingFile && !hasNewFile ? "選擇新檔案" : "選擇檔案"}
          </span>
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={handleFileChange}
            name={name}
          />
        </label>

        {/* Show new file selection */}
        {hasNewFile && (
          <div className="ml-4 flex items-center gap-2">
            <span className="text-sm text-gray-500 truncate max-w-xs">
              新選擇: {fileValue.name}
            </span>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-sm text-red-600 hover:text-red-800"
            >
              移除
            </button>
          </div>
        )}
      </div>

      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}
