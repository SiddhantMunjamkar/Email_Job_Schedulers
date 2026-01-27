import { Router } from "express";
import passport from "passport";
import { authController } from "../modules/auth/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { SignupSchema, LoginSchema } from "../modules/auth/auth.schemas.js";

const router = Router();

// local auth routes

router.post("/signup", validateRequest(SignupSchema), authController.signup);

router.post("/login", validateRequest(LoginSchema), authController.login);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.frontend_url}/login`,
  }),
  authController.googleCallback,
);

router.get("/me", requireAuth, authController.me);

router.post("/logout", requireAuth, authController.logout);

export const authRouter = router;
