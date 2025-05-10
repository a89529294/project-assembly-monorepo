import { z } from "zod";

export type PaginatedResponse<T> = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: T[];
};

export const paginatedSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const paginatedSchemaGenerator = <T extends z.ZodRawShape>(
  t: z.ZodObject<T>
) =>
  z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
    data: z.array(t),
  });

export type OrderDirection = "ASC" | "DESC";

type NoUndefined<T> = T extends undefined ? never : T;

export const summaryQueryInputSchemaGenrator = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  defaultOrderBy: NoUndefined<Extract<keyof T, string>>
) =>
  z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(20),
    orderBy: z
      .enum(
        Object.keys(schema.shape) as [
          Extract<keyof T, string>,
          ...Extract<keyof T, string>[],
        ]
      )
      .default(defaultOrderBy),
    orderDirection: z
      .enum(["DESC", "ASC"] as [OrderDirection, ...OrderDirection[]])
      .default("DESC"),
    searchTerm: z.string().default(""),
  });

export const selectionInputSchema = z.union([
  z.object({ selectedIds: z.array(z.string().min(1)).min(1) }),
  z.object({
    searchTerm: z.string(),
    deSelectedIds: z.array(z.string()),
  }),
]);
