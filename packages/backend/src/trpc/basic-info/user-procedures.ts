import {
  paginatedUserSummarySchema,
  UsersSummaryQueryInputSchema,
  usersTable,
} from "@myapp/shared";
import { PERMISSION_NAMES } from "../../db/permissions";
import { protectedProcedure } from "../core";
import { db } from "../../db";
import { count, eq, or, ilike } from "drizzle-orm";
import { orderDirectionFn } from "../helpers";

export const readUsersProcedure = protectedProcedure(PERMISSION_NAMES.USER_READ)
  .input(UsersSummaryQueryInputSchema)
  .output(paginatedUserSummarySchema)
  .query(async ({ input }) => {
    const {
      users: { page, pageSize, orderBy, orderDirection, searchTerm },
    } = input;
    const offset = (page - 1) * pageSize;
    console.log(page, pageSize);

    const countQuery = db
      .select({ count: count() })
      .from(usersTable)
      .$dynamic();

    const usersBaseQuery = db.select().from(usersTable).$dynamic();

    // TODO allow searchTerm to search for associated departments, which comes from the associated employee
    if (searchTerm) {
      const term = `%${searchTerm}%`;
      const whereCondition = or(
        ilike(usersTable.account, term),
        ilike(usersTable.name, term)
      );

      countQuery.where(whereCondition);
      usersBaseQuery.where(whereCondition);
    }

    // Get total count (now properly filtered)
    const [{ count: total }] = await countQuery;

    // Get paginated data
    const users = await usersBaseQuery
      .orderBy(orderDirectionFn(orderDirection)(usersTable[orderBy]))
      .limit(pageSize)
      .offset(offset);

    const data = users.map((u) => {
      const { updated_at, created_at, ...rest } = u;
      return rest;
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      page,
      pageSize,
      total,
      totalPages,
      data,
    };
  });
