import {
  customersSummaryQueryInputSchema,
  customersTable,
  paginatedCustomerSummarySchema,
} from "@myapp/shared";
import { and, count, ilike, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { protectedProcedure } from "../core.js";
import { orderDirectionFn } from "../helpers.js";

export const readCustomersProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(customersSummaryQueryInputSchema)
  .output(paginatedCustomerSummarySchema)
  .query(async ({ input }) => {
    const { page, pageSize, orderBy, orderDirection, searchTerm } = input;
    const offset = (page - 1) * pageSize;

    const countQuery = db
      .select({ count: count() })
      .from(customersTable)
      .$dynamic();

    const customersBaseQuery = db.select().from(customersTable).$dynamic();

    // Collect all conditions to combine with AND
    const conditions = [];

    if (searchTerm) {
      const term = `%${searchTerm}%`;
      const whereCondition = or(
        ilike(customersTable.name, term),
        ilike(customersTable.customerNumber, term),
        ilike(customersTable.nickname, term),
        ilike(customersTable.phone, term),
        ilike(customersTable.taxId, term)
      );
      conditions.push(whereCondition);
    }

    if (conditions.length > 0) {
      customersBaseQuery.where(and(...conditions));
      countQuery.where(and(...conditions));
    }

    const [{ count: total }] = await countQuery;

    const data = await customersBaseQuery
      .orderBy(orderDirectionFn(orderDirection)(customersTable[orderBy]))
      .limit(pageSize)
      .offset(offset);

    const totalPages = Math.ceil(total / pageSize);

    return {
      page,
      pageSize,
      total,
      totalPages,
      data,
    };
  });
