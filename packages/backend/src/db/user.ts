import { eq } from "drizzle-orm";
import { db } from "./index.js";
import {
  employeeDepartmentsTable,
  type UserFromDb,
  usersTable,
} from "./schema.js";

export async function getUserFromAccount(
  account: string
): Promise<(UserFromDb & { departmentIds: string[] }) | null> {
  try {
    // The result of the join will be an array of objects, with each object containing the user and the joined employee department.
    // If a user belongs to multiple departments, there will be multiple rows for that user.
    const rows = await db
      .select()
      .from(usersTable)
      .leftJoin(
        employeeDepartmentsTable,
        eq(usersTable.employeeId, employeeDepartmentsTable.employeeId)
      )
      .where(eq(usersTable.account, account));

    if (rows.length === 0) {
      return null;
    }

    // All rows will have the same user data
    const user = rows[0].users;

    if (rows[0].employee_departments === null)
      return {
        ...user,
        departmentIds: [],
      };

    // Extract department IDs from all rows, filtering out any nulls from the left join
    const departmentIds = rows.map(
      (row) => row.employee_departments!.departmentId
    );

    // Return the user with a unique list of department IDs
    return { ...user, departmentIds };
  } catch (error) {
    console.error("Error fetching user by account:", error);
    return null;
  }
}
