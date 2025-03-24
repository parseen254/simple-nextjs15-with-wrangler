import { object, string } from "zod"
import { z } from "zod"

// Enhanced OTP Schema with more specific validation error messages
export const OtpZodSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  otp: string({ required_error: "Verification code is required" })
    .min(6, "Verification code must be exactly 6 digits")
    .max(6, "Verification code must be exactly 6 digits")
    .regex(/^\d+$/, "Verification code must contain only digits"),
})

export const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

export const todoUpdateSchema = todoSchema.partial()

export const todoToggleSchema = z.object({
  completed: z.boolean(),
})

export type TodoInput = z.infer<typeof todoSchema>
export type TodoUpdateInput = z.infer<typeof todoUpdateSchema>
export type TodoToggleInput = z.infer<typeof todoToggleSchema>