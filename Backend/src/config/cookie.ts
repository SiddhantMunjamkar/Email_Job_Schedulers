export const authCookieName = "auth_token";

export const authCookieOptions = {
  httpOnly: true,
  secure: false, // Set to true if using HTTPS
  sameSite: "lax", // Set to "lax" to send the cookie only on first request and avoid sending it on subsequent requests
  maxAge: 7 * 24 * 60 * 60 * 1000, // Set the cookie expiration time in milliseconds
} as const;
