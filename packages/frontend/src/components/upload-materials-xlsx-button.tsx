import { buttonVariants } from "@/components/ui/button";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";
import * as XLSX from "xlsx";
import { z } from "zod";

// TODO this is needed if you want to parse more than 1 sheet
// function parseAllSheets(file: string | ArrayBuffer) {
//   const workbook = XLSX.read(file, {type:'array'});
//   const allSheetsData:Record<string, unknown[]> = {}; // Object to store data for each sheet

//   workbook.SheetNames.forEach(sheetName => {
//       const worksheet = workbook.Sheets[sheetName];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);

//       // Store the data for the current sheet using its name as the key
//       allSheetsData[sheetName] = jsonData;
//   });

//   return allSheetsData;
// }

export function UploadMaterialsXLSXButton() {
  const { mutate } = useMutation(
    trpc.warehouse.createPurchasesUsingXLSX.mutationOptions()
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;
    const file = fileInput.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;

      if (typeof data === "string" || data instanceof ArrayBuffer) {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        interface ExcelRow {
          供應商?: string;
          "修改日期/時間"?: number;
          備註1?: string;
          備註2?: string;
          備註3?: string;
          備註4?: string;
          備註5?: string;
          "建立日期/時間"?: number;
          採購案號?: string;
          斷面規格?: string;
          材質?: string;
          材質證明?: string;
          無輻射證明?: string;
          爐號?: string;
          素材ID?: string;
          素材型號?: string;
          裝車單號?: string;
          進貨人員?: string;
          "進貨日期/時間"?: number;
          "銷貨日期/時間"?: number;
          "重量/kg"?: number;
          銷貨人員?: string;
          "長度/mm"?: number;
          預設工程代碼?: string;
        }

        const json = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

        function excelSerialDateToJSDate(
          serial: number | undefined
        ): Date | null {
          if (typeof serial !== "number" || isNaN(serial)) return null;
          const utc_days = Math.floor(serial - 25569);
          const date_info = new Date(utc_days * 86400 * 1000);
          const fractional_day = serial - Math.floor(serial) + 0.0000001;
          let total_seconds = Math.floor(86400 * fractional_day);
          const seconds = total_seconds % 60;
          total_seconds -= seconds;
          const hours = Math.floor(total_seconds / (60 * 60));
          const minutes = Math.floor(total_seconds / 60) % 60;
          return new Date(
            date_info.getFullYear(),
            date_info.getMonth(),
            date_info.getDate(),
            hours,
            minutes,
            seconds
          );
        }

        const mappedJson = json.map((row) => {
          const millSheetNo = row["材質證明"] || null;
          let millSheetNoNR = row["無輻射證明"] || null;

          if (!millSheetNoNR && millSheetNo) {
            millSheetNoNR = `${millSheetNo}_nr`;
          }

          return {
            supplier: row["供應商"] || null,
            labelId: row["素材ID"] || null,
            typeName: row["素材型號"] || null,
            material: row["材質"] || null,
            specification: row["斷面規格"] || null,
            length: row["長度/mm"] ? Number(row["長度/mm"]) : null,
            weight: row["重量/kg"] ? Number(row["重量/kg"]) : null,
            procurementNumber: row["採購案號"] || null,
            loadingNumber: row["裝車單號"] || null,
            furnaceNumber: row["爐號"] || null,
            millSheetNo: millSheetNo,
            millSheetNoNR: millSheetNoNR,
            arrivalConfirmedEmployeeName: row["進貨人員"] || null,
            arrivalDate: excelSerialDateToJSDate(row["進貨日期/時間"]),
            consumedByEmployeeName: row["銷貨人員"] || null,
            consumedDate: excelSerialDateToJSDate(row["銷貨日期/時間"]) || null,
            defaultCode: row["預設工程代碼"] || null,
            memo1: row["備註1"] || null,
            memo2: row["備註2"] || null,
            memo3: row["備註3"] || null,
            memo4: row["備註4"] || null,
            memo5: row["備註5"] || null,
            createdAt:
              excelSerialDateToJSDate(row["建立日期/時間"]) ?? new Date(),
            updatedAt:
              excelSerialDateToJSDate(row["修改日期/時間"]) ?? new Date(),
          };
        });

        const materialUploadSchema = z
          .object({
            supplier: z.string().nullable(),
            labelId: z.string().nullable(),
            typeName: z.string().nullable(),
            material: z.string({
              required_error: "'材質' (material) is required",
            }),
            specification: z.string({
              required_error: "'斷面規格' (specification) is required",
            }),
            length: z.number({
              required_error: "'長度/mm' (length) is required",
            }),
            weight: z.number({
              required_error: "'重量/kg' (weight) is required",
            }),
            procurementNumber: z.string().nullable(),
            loadingNumber: z.string().nullable(),
            furnaceNumber: z.string().nullable(),
            millSheetNo: z.string().nullable(),
            millSheetNoNR: z.string().nullable(),
            arrivalConfirmedEmployeeName: z.string().nullable(),
            arrivalDate: z.date().nullable(),
            consumedByEmployeeName: z.string().nullable(),
            consumedDate: z.date().nullable(),
            defaultCode: z.string().nullable(),
            memo1: z.string().nullable(),
            memo2: z.string().nullable(),
            memo3: z.string().nullable(),
            memo4: z.string().nullable(),
            memo5: z.string().nullable(),
            createdAt: z.date(),
            updatedAt: z.date(),
          })
          .superRefine((data, ctx) => {
            if (
              (data.arrivalDate !== null &&
                data.arrivalConfirmedEmployeeName === null) ||
              (data.arrivalDate === null &&
                data.arrivalConfirmedEmployeeName !== null)
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "進貨日期和進貨人員必須同時存在或同時為空",
                path: ["arrivalDate"],
              });
            }

            if (
              (data.consumedDate !== null &&
                data.consumedByEmployeeName === null) ||
              (data.consumedDate === null &&
                data.consumedByEmployeeName !== null)
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "銷貨日期和銷貨人員必須同時存在或同時為空",
                path: ["consumedDate"],
              });
            }
          });

        const materialsUploadSchema = z.array(materialUploadSchema);

        const validationResult = materialsUploadSchema.safeParse(mappedJson);

        if (!validationResult.success) {
          const firstError = validationResult.error.issues[0];
          const errorPath = firstError.path;
          const rowIndex = (errorPath[0] as number) + 2; // Excel row number
          alert(`Row ${rowIndex}: ${firstError.message}`);
          // Clear the input value to allow re-uploading the same file
          fileInput.value = "";
          return;
        }

        mutate(validationResult.data, {
          onSuccess() {
            toast.success("上傳素材成功");
            queryClient.invalidateQueries({
              queryKey: trpc.warehouse.readPurchases.infiniteQueryKey(),
            });
          },
          onSettled() {
            // Clear the input value to allow re-uploading the same file
            fileInput.value = "";
          },
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <label className={buttonVariants()}>
      <input
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept=".xlsx, .xls"
      />
      上傳xlsx
    </label>
  );
}
