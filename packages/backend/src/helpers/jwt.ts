import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_SECRET!;
const refreshSecret = process.env.JWT_REFRESH_SECRET!;
// 15 minutes for access, 7 days for refresh
const accessExpiresInSeconds = 60 * 15;
export const refreshExpiresInSeconds = 60 * 60 * 24 * 7;

/**
 * Sign a short-lived access token for authenticating API requests.
 * @param payload - User data to encode in the token
 * @returns JWT string
 */
export function signAccessToken(payload: object): string {
  return jwt.sign(payload, accessSecret, { expiresIn: accessExpiresInSeconds });
}

/**
 * Sign a long-lived refresh token for session renewal.
 * Only encodes the refresh token DB row id (jti).
 * @param jti - The DB id for this refresh token
 * @returns JWT string
 */
export function signRefreshToken(jti: string): string {
  return jwt.sign({ jti }, refreshSecret, { expiresIn: refreshExpiresInSeconds });
}

/**
 * Verify an access token.
 * @param token - JWT string
 * @returns Decoded payload if valid, rejects if invalid/expired
 */
export function verifyAccessToken(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, accessSecret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

/**
 * Verify a refresh token.
 * @param token - JWT string
 * @returns Decoded payload (should contain jti)
 */
export function verifyRefreshToken(token: string): Promise<{ jti: string }> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, refreshSecret, (err: any, decoded: any) => {
      if (err) return reject(err);
      resolve(decoded as { jti: string });
    });
  });
}

// Backwards compatibility: export signJwt/verifyJwt as aliases for access token helpers
export const signJwt = signAccessToken;
export const verifyJwt = verifyAccessToken;
