import { createSelectSchema } from "drizzle-zod";
import { customersTable } from "./schema";
import {
  paginatedSchemaGenerator,
  summaryQueryInputSchemaGenerator,
} from "./utils";

export const customerSummarySchema = createSelectSchema(customersTable);

export const customersSummaryQueryInputSchema =
  summaryQueryInputSchemaGenerator(customerSummarySchema, "customerNumber");

export const paginatedCustomerSummarySchema = paginatedSchemaGenerator(
  customerSummarySchema
);
