import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .max(254)
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(128, "Password is too long.")
  .regex(/[a-z]/, "Add a lowercase letter.")
  .regex(/[A-Z]/, "Add an uppercase letter.")
  .regex(/[0-9]/, "Add a number.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(128),
  remember: z.boolean().optional().default(true),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(80),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Accept the terms to continue." }),
    }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export function flattenValidationError(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fields[key] ??= issue.message;
  }
  return fields;
}
