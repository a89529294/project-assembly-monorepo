import { createSelectSchema } from "drizzle-zod";
import { BOM_PROCESS_STATUS, contactsTable, projectsTable } from "./schema";
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

const projectMetaFields = {
  bomProcess: z.object({
    jobStatus: z.union([z.enum(BOM_PROCESS_STATUS), z.null()]),
    jobProgress: z.union([z.number(), z.null()]),
    projectId: z.string(),
  }),
};

export type BomProcessInfo = z.infer<(typeof projectMetaFields)["bomProcess"]>;

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
    nc: z
      .union([
        z.custom<File>((file) => file instanceof File, {
          message: "Invalid file object",
        }),
        z.string(),
      ])
      .optional(),
    constructorPDF: z.union([z.instanceof(File), z.string()]).optional(),
    installedPlanePDF: z.union([z.instanceof(File), z.string()]).optional(),
    designedPlanePDF: z.union([z.instanceof(File), z.string()]).optional(),
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

export const readProjectOutputSchema =
  projectFormSchema.extend(projectMetaFields);

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
