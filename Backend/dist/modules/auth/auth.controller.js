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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_utils_1 = require("./auth.utils");
const cookie_1 = require("../../config/cookie");
const prisma_1 = require("../../config/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.authController = {
    googleCallback: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const user = req.user;
        const token = (0, auth_utils_1.signJWT)({ userId: user.id });
        res.cookie(cookie_1.authCookieName, token, cookie_1.authCookieOptions);
        return res.redirect(`${process.env.frontend_url}/dashboard`);
    }),
    signup: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password, name, avatarUrl } = req.body;
            const existingUser = yield prisma_1.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const user = yield prisma_1.prisma.user.create({
                data: {
                    email,
                    passwordHash: hashedPassword,
                    name,
                    avatarUrl,
                },
            });
            const token = (0, auth_utils_1.signJWT)({ userId: user.id });
            res.cookie(cookie_1.authCookieName, token, cookie_1.authCookieOptions);
            return res.status(201).json({ user });
        }
        catch (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const user = yield prisma_1.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                return res.status(400).json({ message: "Invalid email or password" });
            }
            const passwordMatch = yield bcrypt_1.default.compare(password, user.passwordHash);
            if (!passwordMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }
            const token = (0, auth_utils_1.signJWT)({ userId: user.id });
            res.cookie(cookie_1.authCookieName, token, cookie_1.authCookieOptions);
            return res.status(200).json({
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
            });
        }
        catch (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }),
    me: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        return res.json({ user: req.authUser });
    }),
    logout: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.clearCookie(cookie_1.authCookieName);
        return res.status(200).json({ message: "Logged out successfully" });
    }),
};
