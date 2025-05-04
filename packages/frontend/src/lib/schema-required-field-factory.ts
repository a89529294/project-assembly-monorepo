import { employeeDetailedSchema } from "@myapp/shared";
import { z } from "zod";

export function isFieldRequired<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  field: keyof T
) {
  return !schema.shape[field].isNullable();
}

export function isEmployeeFieldRequired(
  x: keyof (typeof employeeDetailedSchema)["_type"]
) {
  return isFieldRequired(employeeDetailedSchema, x);
}
