import {
  contactsTable,
  customersTable,
  customerDetailedSchema,
  customersSummaryQueryInputSchema,
  paginatedCustomerSummarySchema,
  selectionInputSchema,
} from "@myapp/shared";
import { and, count, ilike, inArray, or, notInArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import { protectedProcedure } from "../core.js";
import { orderDirectionFn } from "../helpers.js";
import { z } from "zod";
import { randomUUID } from "crypto";

const genCustomersWhereCondition = (term: string) =>
  or(
    ilike(customersTable.name, term),
    ilike(customersTable.nickname, term),
    ilike(customersTable.phone, term),
    ilike(customersTable.taxId, term)
  );

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

    if (searchTerm.length > 0) {
      const term = `%${searchTerm}%`;
      const whereCondition = genCustomersWhereCondition(term);
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

export const deleteCustomersProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(selectionInputSchema)
  .output(z.object({ deletedCustomerIds: z.array(z.string()) }))
  .mutation(async ({ input }) => {
    if ("selectedIds" in input) {
      // Mode 1: Delete by customerIds
      const customers = await db
        .select()
        .from(customersTable)
        .where(inArray(customersTable.id, input.selectedIds));

      if (customers.length !== input.selectedIds.length) {
        throw new Error("One or more customer IDs not found");
      }

      // Delete the customers
      await db
        .delete(customersTable)
        .where(inArray(customersTable.id, input.selectedIds));

      return { deletedCustomerIds: customers.map((c) => c.id) };
    } else {
      // Mode 2: Delete by searchTerm except deSelectedIds

      const conditions = [];

      if (input.searchTerm.length > 0) {
        const term = `%${input.searchTerm}%`;
        const whereCondition = genCustomersWhereCondition(term);
        conditions.push(whereCondition);
      }

      conditions.push(notInArray(customersTable.id, input.deSelectedIds));

      const result = await db
        .delete(customersTable)
        .where(and(...conditions))
        .returning({ id: customersTable.id });

      return { deletedCustomerIds: result.map((r) => r.id) };
    }
  });

export const createCustomerProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(customerDetailedSchema)
  .output(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    const { contacts = [], ...customerData } = input;
    const customerId = randomUUID();

    await db.transaction(async (tx) => {
      // Create the customer
      await tx.insert(customersTable).values({
        ...customerData,
        id: customerId,
      });

      // If there are contacts, insert them
      if (contacts.length > 0) {
        await tx.insert(contactsTable).values(
          contacts.map((contact) => ({
            id: randomUUID(),
            customerId,
            name: contact.name,
            phone: contact.phone,
            enName: contact.enName,
            lineId: contact.lineId,
            weChatId: contact.weChatId,
            memo: contact.memo,
          }))
        );
      }
    });

    return { id: customerId };
  });
