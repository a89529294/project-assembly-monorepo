import { ProjectFormValue } from "@myapp/shared";
import { LucideFileUp } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";
import csvIcon from "@/assets/csv.png";
import zipIcon from "@/assets/zip.png";

import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { FileUploadStatus } from "@/hooks/use-multi-file-upload-progress";

interface FileUploadFieldProps {
  form: UseFormReturn<ProjectFormValue>;
  name: "bom" | "nc" | "constructorPDF" | "installedPlanePDF" | "designedPlanePDF";
  label: string;
  accept: string;
  projectId?: string;
  status: FileUploadStatus | undefined;
}

export function FileUploadField({
  form,
  name,
  label,
  accept,
  projectId,
  status,
}: FileUploadFieldProps) {
  console.log(status);

  const fileValue = useWatch({
    control: form.control,
    name: name,
  });

  const { data: processProgress, isError: cehckBomProcessError } = useQuery(
    trpc.basicInfo.checkBomProcessStatus.queryOptions(projectId!, {
      enabled:
        typeof fileValue === "string" &&
        !!projectId &&
        status === undefined &&
        name === "bom",
      refetchInterval: (query) => {
        if (
          query.state.data?.status === "failed" ||
          query.state.data?.progress === 100 ||
          query.state.error
        )
          return false;

        return 5000;
      },
    })
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue(name, file);
    }
  };

  const handleDownload = () => {
    if (!(fileValue instanceof File)) return;

    // Create a temporary URL for the File object
    const fileUrl = URL.createObjectURL(fileValue);

    // Create a hidden anchor element to trigger download
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileValue.name; // Use the original filename
    document.body.appendChild(a);
    a.click();

    // Clean up by revoking the object URL
    setTimeout(() => {
      URL.revokeObjectURL(fileUrl);
      document.body.removeChild(a);
    }, 100);
  };

  // 3 states, no file, existing file, new file
  const hasExistingFile = typeof fileValue === "string";
  const hasNewFile = fileValue instanceof File;

  const fileName = (() => {
    if (hasNewFile) return fileValue.name;

    if (name === "bom") return "TeklamBom.csv";

    if (name === "nc") return "nc.zip";
    if (name === "constructorPDF") return "構建pdf.zip";
    if (name === "installedPlanePDF") return "安裝平面.zip";
    if (name === "designedPlanePDF") return "設計平面.zip";
  })();

  return (
    <div className="space-y-2">
      {/* Top row: label, description, upload button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-2">
            {label}
            {/* Display BOM process progress when status is undefined */}
            {name === "bom" &&
              status === undefined &&
              processProgress &&
              (() => {
                // Compute display values
                let statusText = "";
                let progress: number | undefined = 0;

                if (cehckBomProcessError) {
                  statusText = "匯入失敗";
                }

                if (processProgress.status === "failed") {
                  statusText = "匯入失敗";
                }

                if (processProgress.status === "done") {
                  statusText = "匯入完成";
                  progress = 100;
                }

                if (
                  processProgress.status === "waiting" ||
                  processProgress.status === "processing"
                ) {
                  statusText = "匯入中...";
                  progress = processProgress.progress;
                }

                return (
                  <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-normal border border-blue-200 flex items-center gap-2">
                    {`狀態: ${statusText}`}
                    {typeof progress === "number" && <span>({progress}%)</span>}
                  </span>
                );
              })()}

            {/* Display file upload status when status is defined */}
            {status &&
              (() => {
                let statusText = "";
                let statusClasses = "bg-blue-100 text-blue-800 border-blue-200";

                if (status.stage === "upload") {
                  statusText = "上傳中";
                } else if (status.stage === "process") {
                  statusText = "處理中";
                } else if (status.stage === "complete") {
                  statusText = "完成";
                  statusClasses =
                    "bg-green-100 text-green-800 border-green-200";
                } else if (status.stage === "error") {
                  statusText = "錯誤";
                  statusClasses = "bg-red-100 text-red-800 border-red-200";
                }

                return (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded ${statusClasses} text-xs font-normal border flex items-center gap-2`}
                  >
                    {`狀態: ${statusText}`}
                    {status.progress < 100 && <span>({status.progress}%)</span>}
                  </span>
                );
              })()}
          </label>
        </div>
        {/* Upload button at top right */}
        <label className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500 ml-4">
          <span className="flex items-center gap-2">
            <LucideFileUp className="h-4 w-4" />
            選擇檔案
          </span>
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={handleFileChange}
            name={name}
          />
        </label>
      </div>

      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
        {hasExistingFile || hasNewFile ? (
          <>
            <div className="flex items-center gap-2">
              <img
                src={fileName?.endsWith("zip") ? zipIcon : csvIcon}
                alt="CSV Icon"
                className="h-10 w-10 object-contain"
              />
              <span className="text-sm text-gray-700 truncate max-w-xs">
                {fileName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasExistingFile && (
                <a
                  href={fileValue}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  下載檔案
                </a>
              )}
              {hasNewFile && (
                <button
                  onClick={handleDownload}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                  disabled={!fileValue}
                  type="button"
                >
                  下載檔案
                </button>
              )}
            </div>
          </>
        ) : (
          <span className="text-sm text-gray-400">尚未上傳檔案</span>
        )}
      </div>
    </div>
  );
}
