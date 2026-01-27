"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema = exports.LoginSchema = exports.SignupSchema = void 0;
const zod_1 = __importDefault(require("zod"));
// Signup Schema - aligned with User model
exports.SignupSchema = zod_1.default.object({
    email: zod_1.default.string().email("Invalid email address"),
    password: zod_1.default.string().min(6, "Password must be at least 6 characters"),
    name: zod_1.default.string().optional(),
    avatarUrl: zod_1.default.string().url("Invalid avatar URL").optional(),
});
// Login Schema
exports.LoginSchema = zod_1.default.object({
    email: zod_1.default.string().email("Invalid email address"),
    password: zod_1.default.string().min(6, "Password must be at least 6 characters"),
});
// User Update Schema
exports.UpdateUserSchema = zod_1.default.object({
    name: zod_1.default.string().optional(),
    email: zod_1.default.string().email("Invalid email address").optional(),
    avatarUrl: zod_1.default.string().url("Invalid avatar URL").optional(),
});
