import { createSelectSchema } from "drizzle-zod";
import { projectsTable } from "./schema";
import {
  paginatedSchemaGenerator,
  summaryQueryInputSchemaGenerator,
  trimThenValidate,
} from "./utils";
import { z } from "zod";

const baseProjectSchema = createSelectSchema(projectsTable);

// const genProjectSchema = (type: "create" | "update") =>
//   baseProjectSchema
//     .omit({
//       ...(type === "create" ? { id: true } : {}),
//       updatedAt: true,
//       createdAt: true,
//       deletedAt: true,
//     })
//     .extend({
//       ...(type === "create"
//         ? {
//             bom: z
//               .custom<File>((file) => file instanceof File, {
//                 message: "Invalid file object",
//               })
//               .optional(),
//           }
//         : {}),
//       projectNumber: trimThenValidate("專案編號不能為空"),
//       name: trimThenValidate("請輸入專案名稱"),
//       customerId: z.string().uuid("無效的客戶ID"),
//       contactIdObjects: z.array(
//         z.object({
//           id: z.string().uuid("無效的聯絡人ID"),
//         })
//       ),
//     });

const sharedProjectFields = {
  projectNumber: trimThenValidate("專案編號不能為空"),
  name: trimThenValidate("請輸入專案名稱"),
  customerId: z.string().uuid("無效的客戶ID"),
  contactIdObjects: z.array(
    z.object({
      id: z.string().uuid("無效的聯絡人ID"),
    })
  ),
};

export const projectCreateSchema = baseProjectSchema
  .omit({
    id: true,
    updatedAt: true,
    createdAt: true,
    deletedAt: true,
  })
  .extend({
    bom: z
      .custom<File>((file) => file instanceof File, {
        message: "Invalid file object",
      })
      .optional(),
    ...sharedProjectFields,
  });

export const projectUpdateSchema = baseProjectSchema
  .omit({
    updatedAt: true,
    createdAt: true,
    deletedAt: true,
  })
  .extend(sharedProjectFields);

export const projectSchema = baseProjectSchema;
export type ProjectCreate = z.infer<typeof projectCreateSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;

// Extended type for form values that includes the bomFile field
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
