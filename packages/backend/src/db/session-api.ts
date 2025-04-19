import {
  type UserFromDb,
  type SessionFromDb,
  sessionsTable,
  usersTable,
} from "./schema.js";
import crypto from "node:crypto";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { db } from "./index.js";
import { eq } from "drizzle-orm";

export function generateSessionToken(): string {
  return crypto.randomUUID();
}

export async function createSession(
  token: string,
  userId: string
): Promise<SessionFromDb> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: SessionFromDb = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(sessionsTable).values(session);
  return session;
}

export async function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const result = await db
    .select({ user: usersTable, session: sessionsTable })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(eq(sessionsTable.id, sessionId));

  if (result.length < 1) {
    return { session: null, user: null };
  }

  const { user, session } = result[0];

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));
    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionsTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionsTable.id, session.id));
  }

  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}

export async function invalidateAllSessions(userId: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
}

export async function getCurrentSession(sessionToken: string) {
  const result = validateSessionToken(sessionToken);
  return result;
}

export type SessionValidationResult =
  | { session: SessionFromDb; user: UserFromDb }
  | { session: null; user: null };

// https://lucia-auth.com/sessions/basic-api/drizzle-orm
