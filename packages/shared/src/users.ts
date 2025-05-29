import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./schema";
import {
  paginatedSchemaGenerator,
  summaryQueryInputSchemaGenerator,
} from "./utils";

export const userSummarySchema = createSelectSchema(usersTable).omit({
  updatedAt: true,
  createdAt: true,
});

export type UserSummary = z.infer<typeof userSummarySchema>;

export const paginatedUserSummarySchema =
  paginatedSchemaGenerator(userSummarySchema);

export type UserSummaryKey = keyof UserSummary;

// function makeSummaryDefault<TOrderBy extends string>(orderBy: TOrderBy) {
//   return {
//     page: 1,
//     pageSize: 20,
//     orderBy,
//     orderDirection: "DESC" as const,
//   };
// }

export const UsersSummaryQueryInputSchema = summaryQueryInputSchemaGenerator({
  schema: userSummarySchema,
  defaultOrderBy: "account",
});
