import { Hono } from "hono";
import { db } from "../db/index.js";
import {
  appUsersTable,
  appUserPermissionsTable,
  appUserRefreshTokensTable,
} from "../db/schema.js";
import { verifyPasswordHash } from "../db/password.js";
import {
  refreshExpiresInSeconds,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../helpers/jwt.js";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

const authRoutes = new Hono();

function isJwtError(err: unknown): err is { name: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    typeof (err as { name?: unknown }).name === "string"
  );
}

// Middleware to verify access token and attach user/permissions to context
const verifyAccessTokenMiddleware = createMiddleware<{
  Variables: {
    user: {
      id: string;
      idNumber: string;
      name: string;
      permissions: string[];
    };
  };
}>(async (c, next) => {
  const authHeader = c.req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }
  const token = authHeader.substring(7);
  try {
    const payload = await verifyAccessToken(token);
    c.set("user", {
      id: payload.sub,
      idNumber: payload.idNumber,
      name: payload.name,
      permissions: payload.permissions || [],
    });

    await next();
  } catch (err: unknown) {
    if (isJwtError(err) && err.name === "TokenExpiredError") {
      return c.json({ error: "Token expired" }, 401);
    }

    return c.json({ error: "Invalid access token" }, 401);
  }
});

// Mobile login: stateless JWT auth
authRoutes.post("/login", async (c) => {
  const { account, password } = await c.req.json();
  if (!account || !password) {
    return c.json({ error: "Account and password are required" }, 400);
  }

  const users = await db.query.appUsersTable.findMany({
    where: (au, { eq }) => eq(au.account, account),
    with: { employee: true },
  });

  if (users.length === 0) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const user = users[0];
  const valid = await verifyPasswordHash(user.passwordHash, password);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const perms = await db
    .select({ permission: appUserPermissionsTable.permission })
    .from(appUserPermissionsTable)
    .where(eq(appUserPermissionsTable.appUserId, user.id));
  const permissions = perms.map((p) => p.permission);

  // --- Refresh token DB row ---

  const expiresAt = new Date(
    new Date().getTime() + 1000 * refreshExpiresInSeconds
  ); // 7 days

  const [refreshRow] = await db
    .insert(appUserRefreshTokensTable)
    .values({ appUserId: user.id, expires_at: expiresAt })
    .returning();

  const accessToken = signAccessToken({
    sub: user.id,
    idNumber: user.account,
    name: user.employee.chName,
    permissions,
  });
  const refreshToken = signRefreshToken(refreshRow.id);

  return c.json({ accessToken, refreshToken });
});

// Refresh accessToken endpoint
authRoutes.post("/refresh", async (c) => {
  const { refreshToken } = await c.req.json();
  if (!refreshToken) {
    return c.json({ error: "Refresh token required" }, 400);
  }
  let jti;
  try {
    const payload = await verifyRefreshToken(refreshToken);
    jti = payload.jti;
  } catch {
    return c.json({ error: "Invalid refresh token" }, 401);
  }
  const tokenRow = await db.query.appUserRefreshTokensTable.findFirst({
    where: (rt, { eq }) => eq(rt.id, jti),
    with: { appUser: { with: { employee: true } } },
  });
  if (!tokenRow) {
    return c.json({ error: "Refresh token not found" }, 401);
  }
  if (tokenRow.expires_at < new Date()) {
    await db
      .delete(appUserRefreshTokensTable)
      .where(eq(appUserRefreshTokensTable.id, jti));
    return c.json({ error: "Refresh token expired" }, 401);
  }

  const user = tokenRow.appUser;
  const perms = await db
    .select({ permission: appUserPermissionsTable.permission })
    .from(appUserPermissionsTable)
    .where(eq(appUserPermissionsTable.appUserId, user.id));
  const permissions = perms.map((p) => p.permission);
  const accessToken = signAccessToken({
    sub: user.id,
    idNumber: user.account,
    name: user.employee.chName,
    permissions,
  });
  // Optionally rotate refresh token here
  return c.json({ accessToken });
});

// Logout endpoint, for now just logout one entry. i.e. the same user can still be logged in elsewhere
authRoutes.post("/logout", async (c) => {
  const { refreshToken } = await c.req.json();
  if (!refreshToken) {
    return c.json({ error: "Refresh token required" }, 400);
  }
  let jti;
  try {
    const payload = await verifyRefreshToken(refreshToken);
    jti = payload.jti;
  } catch {
    return c.json({ error: "Invalid refresh token" }, 401);
  }
  await db
    .delete(appUserRefreshTokensTable)
    .where(eq(appUserRefreshTokensTable.id, jti));
  return c.json({ success: true });
});

authRoutes.get("/me", verifyAccessTokenMiddleware, (c) => {
  const user = c.get("user");

  return c.json({ user });
});

export default authRoutes;
