import zod from "zod";

// Signup Schema - aligned with User model
export const SignupSchema = zod.object({
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
  name: zod.string().optional(),
  avatarUrl: zod.string().url("Invalid avatar URL").optional(),
});

// Login Schema
export const LoginSchema = zod.object({
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
});

// User Update Schema
export const UpdateUserSchema = zod.object({
  name: zod.string().optional(),
  email: zod.string().email("Invalid email address").optional(),
  avatarUrl: zod.string().url("Invalid avatar URL").optional(),
});

