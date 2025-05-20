import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { customersTable } from "./schema";
import {
  paginatedSchemaGenerator,
  summaryQueryInputSchemaGenerator,
} from "./utils";

export const customerSummarySchema = createSelectSchema(customersTable);

export type CustomerSummary = z.infer<typeof customerSummarySchema>;

export type CustomerSummaryKey = keyof CustomerSummary;

export const customersSummaryQueryInputSchema =
  summaryQueryInputSchemaGenerator(customerSummarySchema, "customerNumber");

export const paginatedCustomerSummarySchema = paginatedSchemaGenerator(
  customerSummarySchema
);

export const customerDetailedSchema = customerSummarySchema
  .omit({ id: true, deletedAt: true, createdAt: true, updatedAt: true })
  .extend({
    // validations
    customerNumber: z.string().min(1, {
      message: "客戶編號 不能為空",
    }),
    name: z.string().min(1, {
      message: "客戶名稱 不能為空",
    }),
    nickname: z.string().min(1, {
      message: "客戶簡稱 不能為空",
    }),
    taxId: z.string().min(1, {
      message: "統一編號 不能為空",
    }),
    phone: z.string().min(1, {
      message: "電話 不能為空",
    }),
    // extra field
    contacts: z.array(
      z.object({
        name: z.string().min(1, {
          message: "聯絡人姓名 不能為空",
        }),
        phone: z.string().min(1, {
          message: "聯絡人電話 不能為空",
        }),
        enName: z.string().optional(),
        lineId: z.string().optional(),
        weChatId: z.string().optional(),
        memo: z.string().optional(),
      })
    ),
  });

export type CustomerDetail = z.infer<typeof customerDetailedSchema>;
