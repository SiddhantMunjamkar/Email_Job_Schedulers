"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const prisma_1 = require("../config/prisma");
const cookie_js_1 = require("../config/cookie.js");
const auth_utils_js_1 = require("../modules/auth/auth.utils.js");
const requireAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a[cookie_js_1.authCookieName];
        if (!token) {
            return res.status(401).json({ message: "Unauthentication" });
        }
        const decoded = (0, auth_utils_js_1.verifyJWT)(token);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid authentication token" });
        }
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, avatarUrl: true },
        });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.authUser = user;
        return next();
    }
    catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
});
exports.requireAuth = requireAuth;
