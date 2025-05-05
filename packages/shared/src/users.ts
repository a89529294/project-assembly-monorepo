import { createSelectSchema } from "drizzle-zod";
import { usersTable } from "./schema";
import { z } from "zod";
import {
  paginatedSchemaGenerator,
  summaryQueryInputSchemaGenrator,
} from "./utils";
import { employeeSummarySchema } from "./employee";

export const userSummarySchema = createSelectSchema(usersTable).omit({
  updated_at: true,
  created_at: true,
});

export type UserSummary = z.infer<typeof userSummarySchema>;

export const paginatedUserSummarySchema =
  paginatedSchemaGenerator(userSummarySchema);

export type UserSummaryKey = keyof UserSummary;

function makeSummaryDefault<TOrderBy extends string>(orderBy: TOrderBy) {
  return {
    page: 1,
    pageSize: 20,
    orderBy,
    orderDirection: "DESC" as const,
  };
}

export const UsersSummaryQueryInputSchema = z.object({
  users: summaryQueryInputSchemaGenrator(userSummarySchema, "account").default(
    makeSummaryDefault("account")
  ),
  employees: summaryQueryInputSchemaGenrator(
    employeeSummarySchema,
    "idNumber"
  ).default(makeSummaryDefault("idNumber")),
});
