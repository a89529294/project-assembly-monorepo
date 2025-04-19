import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { getUserFromAccount } from "../../db/user.js";
import { verifyPasswordHash } from "../../db/password.js";
import {
  createSession,
  generateSessionToken,
  invalidateAllSessions,
  invalidateSession,
} from "../../db/session-api.js";
import { getUserRoles, isAdmin } from "../../helpers/auth.js";
import { protectedProcedure, publicProcedure } from "../../trpc/core.js";

export const loginProcedure = publicProcedure
  .input(
    z.object({
      account: z.string().min(1, { message: "Account is required" }),
      password: z.string().min(1, { message: "Password is required" }),
    })
  )
  .mutation(async ({ input, ctx }) => {
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
        name: user.name,
        isAdmin: isAdminUser,
        roles: roles,
      },
    };
  });

export const logoutProcedure = protectedProcedure("").mutation(
  async ({ ctx }) => {
    const session = ctx.session;
    await invalidateSession(session.id);
    return {
      success: "from trpc logout",
    };
  }
);

export const meProcedure = protectedProcedure("").mutation(async ({ ctx }) => {
  const user = ctx.user;
  const roles = await getUserRoles(user.id);
  const isAdminUser = await isAdmin(user.id);

  return {
    account: user.account,
    id: user.id,
    name: user.name,
    isAdmin: isAdminUser,
    roles: roles,
  };
});
