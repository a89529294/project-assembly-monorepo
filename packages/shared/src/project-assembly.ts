import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { projectAssembliesTable } from "./schema/project-assembly";
import {
  paginatedSchemaGenerator,
  summaryQueryInputSchemaGenerator,
} from "./utils";

// Create a schema for project assemblies
export const projectAssemblySchema = createSelectSchema(projectAssembliesTable);

export type ProjectAssemblySummary = z.infer<typeof projectAssemblySchema>;
export type ProjectAssemblyKey = keyof ProjectAssemblySummary;

// Create a schema for querying project assemblies with pagination, ordering, and search
export const projectAssembliesSummaryQueryInputSchema =
  summaryQueryInputSchemaGenerator({
    schema: projectAssemblySchema,
    defaultOrderBy: "tagId",
  });

// Create a schema for paginated project assemblies response
export const paginatedProjectAssemblySchema = paginatedSchemaGenerator(
  projectAssemblySchema
);

export type PaginatedProjectAssembly = z.infer<typeof paginatedProjectAssemblySchema>;
