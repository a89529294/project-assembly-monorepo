import { createSelectSchema } from "drizzle-zod";
import { customersTable } from "./schema";
import {
  paginatedSchemaGenerator,
  summaryQueryInputSchemaGenerator,
} from "./utils";
import { z } from "zod";

export const customerSummarySchema = createSelectSchema(customersTable);

export type CustomerSummary = z.infer<typeof customerSummarySchema>;

export type CustomerSummaryKey = keyof CustomerSummary;

export const customersSummaryQueryInputSchema =
  summaryQueryInputSchemaGenerator(customerSummarySchema, "customerNumber");

export const paginatedCustomerSummarySchema = paginatedSchemaGenerator(
  customerSummarySchema
);
