import { initTRPC, TRPCError } from "@trpc/server";

import { RoleName } from "@myapp/shared";
import type { MiddlewareHandler } from "hono";
import { Context } from "hono";
import superjson from "superjson";
import { getCurrentSession } from "../db/session-api.js";
import { getUserRoles, isAdmin } from "../helpers/auth.js";

export const t = initTRPC.context<{ c: Context }>().create({
  transformer: superjson,
});

export const router = t.router;

const ARTIFICIAL_DELAY_MS = process.env.NODE_ENV === "dev" ? 1000 : 0;

export const delayMiddleware = t.middleware(async ({ ctx, next }) => {
  await new Promise((res) => setTimeout(res, ARTIFICIAL_DELAY_MS));
  return next({ ctx });
});

// Shared logic for both TRPC and non-TRPC auth
async function checkAuthCore(c: Context, oneOfRoleNames?: RoleName[]) {
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
  const userWithRoles: UserWithRoles = { ...user, isAdmin: isUserAdmin, roles };

  // Admins always allowed
  if (isUserAdmin || !oneOfRoleNames) {
    return { user: userWithRoles, session };
  }

  // Standard permission check
  // const allowed = await hasPermission(user.id, roles, permission);
  if (!roles.map((v) => v.name).find((v) => oneOfRoleNames.includes(v))) {
    throw new TRPCError({
      code: "FORBIDDEN",
    });
  }

  return { user: userWithRoles, session };
}

export const authMiddleware = (oneOfRoleNames?: RoleName[]) =>
  t.middleware(async ({ ctx, next }) => {
    const { c } = ctx;
    const result = await checkAuthCore(c, oneOfRoleNames);

    return next({
      ctx: { ...ctx, user: result.user, session: result.session },
    });
  });

// Hono middleware factory for auth
export function honoAuthMiddleware(
  oneOfRoleNames?: RoleName[]
): MiddlewareHandler<{
  Variables: {
    user: Awaited<ReturnType<typeof checkAuthCore>>["user"];
    session: Awaited<ReturnType<typeof checkAuthCore>>["session"];
  };
}> {
  return async (c, next) => {
    const { user, session } = await checkAuthCore(c, oneOfRoleNames);
    c.set("user", user);
    c.set("session", session);
    await next();
  };
}

// --- Types ---
export type UserWithRoles = Awaited<
  ReturnType<typeof getCurrentSession>
>["user"] & {
  isAdmin: boolean;
  roles: Awaited<ReturnType<typeof getUserRoles>>;
};

export const publicProcedure = t.procedure.use(delayMiddleware);
export const protectedProcedure = (oneOfRoleNames?: RoleName[]) =>
  t.procedure.use(delayMiddleware).use(authMiddleware(oneOfRoleNames));
