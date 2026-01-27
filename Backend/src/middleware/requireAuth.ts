import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { authCookieName } from "../config/cookie.js";
import { verifyJWT } from "../modules/auth/auth.utils.js";

// Extend Express Request to include authUser
declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email: string;
        name: string | null;
        avatarUrl: string | null;
      };
    }
  }
}

interface JWTPayload extends JwtPayload {
  userId: string;
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.[authCookieName];
    if (!token) {
      return res.status(401).json({ message: "Unauthentication" });
    }

    const decoded = verifyJWT(token) as JWTPayload;
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.authUser = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
