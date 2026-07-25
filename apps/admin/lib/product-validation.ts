import { z } from "zod";

export const productMutationSchema = z
  .object({
    name: z.string().trim().min(2).max(180),
    slug: z.string().trim().max(140).optional(),
    sku: z.string().trim().min(2).max(80),
    description: z.string().trim().max(5000).default(""),
    priceCents: z.number().int().min(0).max(100_000_000),
    compareAtCents: z.number().int().min(0).max(100_000_000).nullable().optional(),
    currency: z.string().trim().length(3).transform((value) => value.toUpperCase()).default("USD"),
    inventoryQuantity: z.number().int().min(0).max(10_000_000),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    imageUrl: z.string().trim().url().max(2048).nullable().optional().or(z.literal("")),
    expectedVersion: z.number().int().positive().optional(),
  })
  .superRefine((value, context) => {
    if (value.compareAtCents !== null && value.compareAtCents !== undefined && value.compareAtCents < value.priceCents) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["compareAtCents"],
        message: "Compare-at price must be greater than or equal to the selling price.",
      });
    }
  });

export type ProductMutation = z.infer<typeof productMutationSchema>;
