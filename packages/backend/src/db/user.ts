import { eq } from "drizzle-orm";
import { db } from "./index.js";
import { type UserFromDb, usersTable } from "./schema.js";

export async function getUserFromAccount(
  account: string
): Promise<UserFromDb | null> {
  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.account, account))
      .limit(1);

    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error("Error fetching user by account:", error);
    return null;
  }
}
