import { z } from "zod";

const COMMON = new Set([
  "password", "password1", "password123", "12345678", "123456789", "1234567890", "qwerty123", "11111111",
  "iloveyou", "pakistan", "pakistan123", "lahore123", "abcd1234", "admin123", "welcome1", "letmein1", "00000000",
]);

export const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(254);

export const newPassword = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(128, "Use 128 characters or fewer")
  .refine((p) => /[a-zA-Z]/.test(p) && /[^a-zA-Z]/.test(p), "Mix letters with at least one number or symbol")
  .refine((p) => !COMMON.has(p.toLowerCase()), "That password is too common. Pick something less guessable");

export const signUpSchema = z
  .object({ name: z.string().trim().min(2, "Enter your name").max(80), email, password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] })
  .refine((v) => !v.password.toLowerCase().includes(v.email.split("@")[0]), { message: "Don't use your email in your password", path: ["password"] });

export const signInSchema = z.object({ email, password: z.string().min(1, "Enter your password").max(128) });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,19}$/, "Enter a valid phone number"),
  seatingPref: z.enum(["any", "indoor", "outdoor"]),
  dietaryNotes: z.string().trim().max(300).default(""),
  marketingOptIn: z.boolean(),
});

export const changePasswordSchema = z
  .object({ current: z.string().min(1, "Enter your current password"), password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] })
  .refine((v) => v.password !== v.current, { message: "Choose a password you haven't used here", path: ["password"] });

export const resetSchema = z
  .object({ token: z.string().min(20), password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });
