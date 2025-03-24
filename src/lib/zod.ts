import { object, string } from "zod"

export const OtpZodSchema = object({
    email: string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    otp: string({ required_error: "OTP is required" })
        .min(1, "OTP is required")
        .min(6, "OTP must be exactly 6 characters")
        .max(6, "OTP must be exactly 6 characters"),
})