import { initTRPC, TRPCError } from "@trpc/server";

import { getCurrentSession } from "../db/session-api.js";
import { getUserRoles, hasPermission, isAdmin } from "../helpers/auth.js";
import { Context } from "hono";

export const t = initTRPC.context<{ c: Context }>().create();

export const router = t.router;

const ARTIFICIAL_DELAY_MS = process.env.NODE_ENV === "dev" ? 1000 : 0;

const delay = () => new Promise((res) => setTimeout(res, ARTIFICIAL_DELAY_MS));

export const delayMiddleware = t.middleware(async ({ ctx, next }) => {
  await delay();
  return next({ ctx });
});

export const authMiddleware = (permission: string) =>
  t.middleware(async ({ ctx, next }) => {
    const { c } = ctx;
    const authHeader = c.req.header().authorization;
    const sessionToken = authHeader?.split(" ")[1];

    if (!sessionToken) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const { session, user } = await getCurrentSession(sessionToken);

    if (!session || !user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const isUserAdmin = await isAdmin(user.id);

    const roles = await getUserRoles(user.id);

    const obj = {
      ctx: {
        ...ctx,
        user: {
          ...user,
          isAdmin: isUserAdmin,
          roles,
        },
        session,
      },
    };

    // Admins always allowed
    if (isUserAdmin) return next(obj);

    // Standard permission check
    const allowed = await hasPermission(user.id, roles, permission);

    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      });
    }

    return next(obj);
  });

export const publicProcedure = t.procedure.use(delayMiddleware);
export const protectedProcedure = (permission: string) =>
  t.procedure.use(delayMiddleware).use(authMiddleware(permission));
