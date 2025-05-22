import { createSelectSchema } from "drizzle-zod";
import { projectsTable } from "./schema";
import {
  paginatedSchemaGenerator,
  summaryQueryInputSchemaGenerator,
  trimThenValidate,
} from "./utils";
import { z } from "zod";

const baseProjectSchema = createSelectSchema(projectsTable);

const genProjectSchema = (omitId: boolean) =>
  baseProjectSchema
    .omit({
      ...(omitId ? { id: true } : {}),
      updatedAt: true,
      createdAt: true,
      deletedAt: true,
    })
    .extend({
      projectNumber: trimThenValidate("專案編號不能為空"),
      name: trimThenValidate("請輸入專案名稱"),
      customerId: z.string().uuid("無效的客戶ID"),
      contactIdObjects: z.array(
        z.object({
          id: z.string().uuid("無效的聯絡人ID"),
        })
      ),
    });

export const projectSchema = baseProjectSchema;
export const projectCreateSchema = genProjectSchema(true);
export const projectUpdateSchema = genProjectSchema(false);

export type ProjectCreate = z.infer<typeof projectCreateSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;

export type ProjectFormValue = ProjectUpdate | ProjectCreate;
export const projectFormSchema = z.union([
  projectCreateSchema,
  projectUpdateSchema,
]);

export const projectsSearchSchema = summaryQueryInputSchemaGenerator(
  projectSchema,
  "projectNumber"
);

export const projectsQuerySchema = z.object({
  customerId: z.string(),
  search: projectsSearchSchema,
});

export const projectsPaginationSchema = paginatedSchemaGenerator(projectSchema);

export type ProjectsPagination = z.infer<typeof projectsPaginationSchema>;
