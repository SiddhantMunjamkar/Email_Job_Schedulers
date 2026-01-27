import jwt from "jsonwebtoken";

export function signJWT(payload: { userId: string }) {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
    });
    return token;
  } catch (err) {
    throw err;
  }
}

export function verifyJWT(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch (err) {
    throw err;
  }
}
