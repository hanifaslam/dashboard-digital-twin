import { z } from "zod";

// Password validation shared schema
export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const authSchema = z.object({
  login: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (val.includes('@')) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
        } else {
          return val.length >= 1
        }
      },
      { message: 'Invalid username or email' }
    )
    .max(100, {
      message: 'Username or email is too long (max. 100 characters)'
    }),
  password: z.string().min(1, "Password is required"),
  remember_me: z.boolean().optional(),
  recaptcha_token: z.string().optional(),
});

export type AuthInput = z.infer<typeof authSchema>;


// Schema for Reset Password
export const resetPasswordSchema = z
  .object({
    new_password: PasswordSchema,
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// Legacy types (for compatibility)
export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;
