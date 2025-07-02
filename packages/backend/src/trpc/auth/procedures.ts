import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { getUserFromAccount } from "../../db/user.js";
import { verifyPasswordHash, hashPassword } from "../../db/password.js";
import {
  createSession,
  generateSessionToken,
  invalidateAllSessions,
  invalidateSession,
} from "../../db/session-api.js";
import { getUserRoles, isAdmin } from "../../helpers/auth.js";
import { db } from "../../db/index.js";
import { usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { protectedProcedure, publicProcedure } from "../../trpc/core.js";

export const loginProcedure = publicProcedure
  .input(
    z.object({
      account: z.string().min(1, { message: "Account is required" }),
      password: z.string().min(1, { message: "Password is required" }),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getUserFromAccount(input.account);

    if (!user || !user.passwordHash) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    const passwordMatch = await verifyPasswordHash(
      user.passwordHash,
      input.password
    );

    if (!passwordMatch) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    await invalidateAllSessions(user.id);
    const sessionToken = generateSessionToken();
    await createSession(sessionToken, user.id);

    const roles = await getUserRoles(user.id);
    const isAdminUser = await isAdmin(user.id);

    return {
      success: true,
      message: "Login successful",
      sessionToken: sessionToken,
      user: {
        account: user.account,
        id: user.id,
        employeeId: user.employeeId,
        departmentIds: user.departmentIds,
        name: user.name,
        isAdmin: isAdminUser,
        roles: roles,
      },
    };
  });

export const updatePasswordProcedure = protectedProcedure()
  .input(
    z.object({
      oldPassword: z.string().min(1, { message: "Old password is required" }),
      newPassword: z
        .string()
        .min(8, { message: "New password must be at least 8 characters" }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // 1. Get current user from DB
    const userId = ctx.user.id;
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (users.length === 0) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
    }

    const user = users[0];
    // 2. Verify old password
    const valid = await verifyPasswordHash(
      user.passwordHash,
      input.oldPassword
    );
    if (!valid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "舊密碼不正確",
      });
    }

    // 3. Hash new password
    const newHash = await hashPassword(input.newPassword);
    // 4. Update user in DB
    const [updatedUser] = await db
      .update(usersTable)
      .set({ passwordHash: newHash })
      .where(eq(usersTable.id, userId))
      .returning();
    if (!updatedUser) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update password",
      });
    }
    // Optionally: Invalidate all other sessions here if desired
    // await invalidateAllSessions(userId);
    // 5. Return updated user info (without passwordHash)
    const roles = await getUserRoles(userId);
    const isAdminUser = await isAdmin(userId);
    return {
      success: true,
      message: "Password updated successfully",
      user: {
        account: updatedUser.account,
        id: updatedUser.id,
        name: updatedUser.name,
        isAdmin: isAdminUser,
        roles,
      },
    };
  });

export const logoutProcedure = protectedProcedure().mutation(
  async ({ ctx }) => {
    const session = ctx.session;
    await invalidateSession(session.id);
    return {
      success: "from trpc logout",
    };
  }
);

// TODO not used anymore, maybe remove
// export const meProcedure = protectedProcedure("").mutation(async ({ ctx }) => {
//   const user = ctx.user;
//   const roles = await getUserRoles(user.id);
//   const isAdminUser = await isAdmin(user.id);

//   return {
//     account: user.account,
//     id: user.id,
//     name: user.name,
//     isAdmin: isAdminUser,
//     roles: roles,
//   };
// });
