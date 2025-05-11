import { sql } from "drizzle-orm";
import { db } from "../index.js";
import { createEmployeesAppUsersView } from "./employees-app-users-view.js";
import { EmployeeOrAppUserWithDepartments } from "@myapp/shared";
import { alias } from "drizzle-orm/pg-core";

/**
 * Query the combined employees and app users view with pagination, filtering, and sorting
 */
export const queryEmployeesAppUsersView = async ({
  permission,
  page = 1,
  pageSize = 10,
  searchTerm = "",
  orderBy = "idNumber",
  orderDirection = "asc",
}: {
  permission: string;
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}) => {
  const view = createEmployeesAppUsersView(permission);

  // Instead of using a subquery with the view, we'll execute the queries directly
  // and combine the results in JavaScript

  // Build the where clause for search
  let searchCondition;
  if (searchTerm && searchTerm.trim() !== "") {
    searchCondition = sql`
      "id_number" ILIKE ${"%" + searchTerm + "%"} OR 
      "ch_name" ILIKE ${"%" + searchTerm + "%"} OR
      "email" ILIKE ${"%" + searchTerm + "%"} OR
      "phone" ILIKE ${"%" + searchTerm + "%"}
    `;
  }

  // Build the order by clause
  const orderByField =
    orderBy === "employee.chName" ? sql`ch_name` : sql`id_number`;
  const orderByDirection = orderDirection === "desc" ? sql`DESC` : sql`ASC`;

  // Execute the combined query directly
  const combinedQuery = sql`
    WITH combined_results AS (
      ${view}
    )
    SELECT * FROM combined_results
    ${searchCondition ? sql`WHERE ${searchCondition}` : sql``}
    ORDER BY ${orderByField} ${orderByDirection}
    LIMIT ${pageSize}
    OFFSET ${(page - 1) * pageSize}
  `;

  // Execute count query
  const countQuery = sql`
    WITH combined_results AS (
      ${view}
    )
    SELECT COUNT(*) as total FROM combined_results
    ${searchCondition ? sql`WHERE ${searchCondition}` : sql``}
  `;

  // Execute both queries
  const results = (await db.execute(combinedQuery)) as unknown as Record<
    string,
    any
  >[];
  const countResult = (await db.execute(countQuery)) as unknown as {
    total: number;
  }[];

  const totalCount = Number(countResult[0]?.total || 0);

  // Group the results by employee/app user
  console.log(results.rows);
  const groupedResults = groupResultsByEntity(results.rows!);

  return {
    data: groupedResults,
    pagination: {
      total: totalCount,
      page,
      pageSize,
      pageCount: Math.ceil(totalCount / pageSize),
    },
  };
};

/**
 * Group the results by entity (employee or app user)
 */
function groupResultsByEntity(results: any[]) {
  const entityMap = new Map();

  for (const row of results) {
    const key = row.id;

    if (!entityMap.has(key)) {
      // Initialize the entity with its basic properties
      entityMap.set(key, {
        id: key,
        employee: {
          id: row.employee_id,
          idNumber: row.id_number,
          chName: row.ch_name,
          phone: row.phone,
          email: row.email,
          // Add other employee properties as needed
        },
        departments: [
          {
            id: row.department_id,
            name: row.department_name,
            jobTitle: row.job_title || "",
          },
        ],
      });
    } else {
      // Add additional departments if this is a duplicate row for the same entity
      const entity = entityMap.get(key);

      // Check if this department is already included
      const departmentExists = entity.departments.some(
        (dept: any) => dept.id === row.department_id
      );

      if (!departmentExists) {
        entity.departments.push({
          id: row.department_id,
          name: row.department_name,
          jobTitle: row.job_title || "",
        });
      }
    }
  }

  return Array.from(entityMap.values());
}
