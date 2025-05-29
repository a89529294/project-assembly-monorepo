import { createSelectSchema } from "drizzle-zod";
import { contactsTable, projectsTable } from "./schema";
import {
  paginatedSchemaGenerator,
  summaryQueryInputSchemaGenerator,
  trimThenValidate,
} from "./utils";
import { z } from "zod";

const baseProjectSchema = createSelectSchema(projectsTable);
const contactSchema = createSelectSchema(contactsTable);

const sharedProjectFields = {
  projectNumber: trimThenValidate("專案編號不能為空"),
  name: trimThenValidate("請輸入專案名稱"),
  customerId: z.string().uuid("無效的客戶ID"),
  contacts: z.array(contactSchema),
};

export const projectFormSchema = baseProjectSchema
  .omit({
    id: true,
    updatedAt: true,
    createdAt: true,
    deletedAt: true,
  })
  .extend({
    bom: z
      .union([
        z.custom<File>((file) => file instanceof File, {
          message: "Invalid file object",
        }),
        z.string(),
      ])
      .optional(),
    ...sharedProjectFields,
  });

export const projectSummarySchema = baseProjectSchema
  .pick({
    id: true,
    projectNumber: true,
    status: true,
    name: true,
  })
  .extend({
    contacts: sharedProjectFields["contacts"],
  });

export type ProjectSummary = z.infer<typeof projectSummarySchema>;
export type ProjectFormValue = z.infer<typeof projectFormSchema>;

export const projectsSearchSchema = summaryQueryInputSchemaGenerator({
  schema: projectSummarySchema,
  defaultOrderBy: "projectNumber",
  excludeKey: "contacts",
});

export const projectsQuerySchema = z.object({
  customerId: z.string(),
  search: projectsSearchSchema,
});

export const projectsPaginationSchema =
  paginatedSchemaGenerator(projectSummarySchema);

export type ProjectsPagination = z.infer<typeof projectsPaginationSchema>;
