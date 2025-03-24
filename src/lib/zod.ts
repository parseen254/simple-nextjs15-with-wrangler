import { object, string } from "zod"
import { z } from "zod"

export const OtpZodSchema = object({
    email: string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    otp: string({ required_error: "OTP is required" })
        .min(1, "OTP is required")
        .min(6, "OTP must be exactly 6 characters")
        .max(6, "OTP must be exactly 6 characters"),
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