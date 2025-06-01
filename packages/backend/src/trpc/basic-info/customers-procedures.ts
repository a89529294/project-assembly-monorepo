import {
  contactsTable,
  customersTable,
  customerDetailedSchema,
  customersSummaryQueryInputSchema,
  paginatedCustomerSummarySchema,
  selectionInputSchema,
  contactsSchema,
} from "@myapp/shared";
import { and, count, eq, ilike, inArray, or, notInArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import { protectedProcedure } from "../core.js";
import { orderDirectionFn } from "../helpers.js";
import { z } from "zod";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";

const genCustomersWhereCondition = (term: string) =>
  or(
    ilike(customersTable.name, term),
    ilike(customersTable.nickname, term),
    ilike(customersTable.phone, term),
    ilike(customersTable.taxId, term)
  );

export const readCustomerProcedure = protectedProcedure(["BasicInfoManagement"])
  .input(z.string())
  .query(async ({ input: customerId }) => {
    const customer = await db.query.customersTable.findFirst({
      where: eq(customersTable.id, customerId),
      with: {
        contacts: true,
      },
    });

    if (!customer) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Customer not found",
      });
    }

    return customer;
  });

export const readCustomersProcedure = protectedProcedure([
  "BasicInfoManagement",
  "ProductionManagement",
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

export const updateCustomerProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(
    z.object({
      customerId: z.string(),
      data: customerDetailedSchema,
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      contacts: contactsSchema,
    })
  )
  .mutation(async ({ input }) => {
    const { customerId, data } = input;
    const { contacts = [], ...customerData } = data;

    return db.transaction(async (tx) => {
      // 1. Update the customer
      await tx
        .update(customersTable)
        .set(customerData)
        .where(eq(customersTable.id, customerId));

      // 2. Get existing contacts for this customer
      const existingContacts = await tx
        .select()
        .from(contactsTable)
        .where(eq(contactsTable.customerId, customerId));

      // 3. Process contacts
      const existingContactIds = new Set(existingContacts.map((c) => c.id));
      const inputContactIds = new Set(
        contacts.map((c) => c.id).filter(Boolean)
      );

      // 4. Delete contacts that are not in the input
      const contactsToDelete = existingContacts.filter(
        (c) => !inputContactIds.has(c.id)
      );
      if (contactsToDelete.length > 0) {
        await tx.delete(contactsTable).where(
          inArray(
            contactsTable.id,
            contactsToDelete.map((c) => c.id)
          )
        );
      }

      const updatedContacts = [];

      // 5. Update or create contacts
      for (const contact of contacts) {
        const { id, ...contactData } = contact;

        if (id && existingContactIds.has(id)) {
          // Update existing contact
          const [updated] = await tx
            .update(contactsTable)
            .set(contactData)
            .where(eq(contactsTable.id, id))
            .returning();
          updatedContacts.push(updated);
        } else {
          // Create new contact
          const [newContact] = await tx
            .insert(contactsTable)
            .values({
              customerId,
              ...contactData,
            })
            .returning();
          updatedContacts.push(newContact);
        }
      }

      return {
        success: true,
        contacts: updatedContacts,
      };
    });
  });
