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

export const selectionInputSchema = z.union([
  z.object({ selectedIds: z.array(z.string().min(1)).min(1) }),
  z.object({
    searchTerm: z.string(),
    deSelectedIds: z.array(z.string()),
  }),
]);

export const summaryQueryInputSchemaGenerator = <
  T extends z.ZodRawShape,
  K extends NoUndefined<Extract<keyof T, string>>,
  Y extends NoUndefined<Extract<keyof T, string>> = never,
>(
  params: Y extends never
    ? {
        schema: z.ZodObject<T>;
        defaultOrderBy: K;
        excludeKey?: never;
      }
    : {
        schema: z.ZodObject<T>;
        defaultOrderBy: Exclude<K, Y>;
        excludeKey: Y;
      }
) =>
  z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(20),
    orderBy: z
      .enum(
        Object.keys(params.schema.shape).filter((key) =>
          params.excludeKey ? key !== params.excludeKey : true
        ) as [
          Extract<Exclude<keyof T, Y>, string>,
          ...Extract<Exclude<keyof T, Y>, string>[],
        ]
      )
      .default(params.defaultOrderBy),
    orderDirection: z
      .enum(["DESC", "ASC"] as [OrderDirection, ...OrderDirection[]])
      .default("DESC"),
    searchTerm: z.string().default(""),
  });

type FirstLevelKeys<T extends z.ZodRawShape> = NoUndefined<
  Extract<keyof T, string>
>;

export const summaryQueryNestedInputSchemaGenerator = <
  T extends z.ZodRawShape,
  K1 extends FirstLevelKeys<T>,
  K2 extends T[K1] extends z.ZodObject<infer U extends z.ZodRawShape>
    ? FirstLevelKeys<U>
    : never,
>(
  schema: z.ZodObject<T>,
  firstLevelKey: K1,
  secondLevelKey: K2
) => {
  const nestedSchema = schema.shape[firstLevelKey];

  if (!(nestedSchema instanceof z.ZodObject)) {
    throw new Error(`Expected ${firstLevelKey} to be a ZodObject`);
  }

  type NestedKeys =
    T[K1] extends z.ZodObject<infer U> ? FirstLevelKeys<U> : never;
  const allNestedKeys = Object.keys(nestedSchema.shape) as NestedKeys[];

  // Create the enum with all possible keys
  const orderByEnum = z.enum([
    secondLevelKey,
    ...allNestedKeys.filter((k) => k !== secondLevelKey),
  ] as const);

  return z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(20),
    orderBy: orderByEnum.default(secondLevelKey),
    orderDirection: z.enum(["DESC", "ASC"] as const).default("DESC"),
    searchTerm: z.string().default(""),
  });
};

export function trimThenValidate(msg: string) {
  return z
    .string()
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, msg);
}
