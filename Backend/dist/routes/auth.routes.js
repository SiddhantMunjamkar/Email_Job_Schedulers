"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_js_1 = require("../modules/auth/auth.controller.js");
const requireAuth_js_1 = require("../middleware/requireAuth.js");
const validateRequest_js_1 = require("../middleware/validateRequest.js");
const auth_schemas_js_1 = require("../modules/auth/auth.schemas.js");
const router = (0, express_1.Router)();
// local auth routes
router.post("/signup", (0, validateRequest_js_1.validateRequest)(auth_schemas_js_1.SignupSchema), auth_controller_js_1.authController.signup);
router.post("/login", (0, validateRequest_js_1.validateRequest)(auth_schemas_js_1.LoginSchema), auth_controller_js_1.authController.login);
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));
router.get("/google/callback", passport_1.default.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.frontend_url}/login`,
}), auth_controller_js_1.authController.googleCallback);
router.get("/me", requireAuth_js_1.requireAuth, auth_controller_js_1.authController.me);
router.post("/logout", requireAuth_js_1.requireAuth, auth_controller_js_1.authController.logout);
exports.authRouter = router;
