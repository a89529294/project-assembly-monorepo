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
