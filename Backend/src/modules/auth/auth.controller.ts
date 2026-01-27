import { Request, Response } from "express";
import { signJWT } from "./auth.utils";
import { authCookieName, authCookieOptions } from "../../config/cookie";
import { prisma } from "../../config/prisma";
import bcrypt from "bcrypt";

export const authController = {
  googleCallback: async (req: Request, res: Response) => {
    const user = req.user as any;

    const token = signJWT({ userId: user.id });

    res.cookie(authCookieName, token, authCookieOptions);

    return res.redirect(`${process.env.frontend_url}/dashboard`);
  },

  signup: async (req: Request, res: Response) => {
    try {
      const { email, password, name, avatarUrl } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name,
          avatarUrl,
        },
      });

      const token = signJWT({ userId: user.id });
      res.cookie(authCookieName, token, authCookieOptions);

      return res.status(201).json({ 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        avatarUrl: user.avatarUrl 
      });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash!);

      if (!passwordMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = signJWT({ userId: user.id });
      res.cookie(authCookieName, token, authCookieOptions);

      return res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  me: async (req: Request, res: Response) => {
    return res.json({ user: req.authUser });
  },

  logout: async (req: Request, res: Response) => {
    res.clearCookie(authCookieName);
    return res.status(200).json({ message: "Logged out successfully" });
  },
};
