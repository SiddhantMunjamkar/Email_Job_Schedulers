export const authCookieName = "auth_token";

export const authCookieOptions = {
  httpOnly: true,
  secure: true, // Required for HTTPS and cross-origin cookies
  sameSite: "none", // Required for cross-origin requests with credentials
  maxAge: 7 * 24 * 60 * 60 * 1000, // Set the cookie expiration time in milliseconds
} as const;
