import NextAuth from "next-auth"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { Adapter } from "next-auth/adapters"
import Credentials from "next-auth/providers/credentials"
import { getUserByEmail, verifyOtp } from "@/app/signin/actions"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { getDB } from "@/db"
import { OtpZodSchema } from "@/lib/zod"

// Enhanced NextAuth configuration with optimized OTP authentication
export const { handlers, signIn, signOut, auth } = NextAuth(() => {
    // This is a workaround to get the DB from the context
    // because NextAuth doesn't support async configuration
    // and we need to use the DB in the adapter
    const db = getDB(getCloudflareContext().env.DB)
    
    return {
        adapter: DrizzleAdapter(db) as Adapter,
        providers: [
            Credentials({
                id: "otp-auth",
                name: "OTP Authentication",
                credentials: {
                    email: { label: "Email", type: "email" },
                    otp: { label: "One-Time Password", type: "text" }
                },
                authorize: async (credentials) => {
                    try {
                        if (!credentials) {
                            throw new Error("Please provide your email and verification code")
                        }
                        
                        // Parse and validate credentials
                        const { email, otp } = await OtpZodSchema.parseAsync(credentials).catch(err => {
                            throw new Error("Invalid verification code format")
                        })
                        
                        // Verify OTP
                        const result = await verifyOtp(email, otp)
                        
                        if (!result.success) {
                            throw new Error("Invalid verification code")
                        }

                        // Get or create user
                        const user = await getUserByEmail(email)
                        if (!user) {
                            throw new Error("Failed to create user account")
                        }
                        
                        return {
                            ...user,
                            id: user.id.toString(),
                        }
                    } catch (error) {
                        console.error("Authentication error:", error)
                        const message = error instanceof Error 
                            ? error.message 
                            : "Authentication failed. Please try again."
                        throw new Error(message)
                    }
                }
            }),
        ],
        session: {
            strategy: "jwt",
            maxAge: 12 * 60 * 60, // 12 hours
        },
        pages: {
            signIn: "/signin",
        },
        callbacks: {
            async jwt({ token, user }) {
                if (user) {
                    token.sub = user.id
                    token.email = user.email
                    token.name = user.name
                }
                return token
            },
            async session({ session, token }) {
                if (session.user) {
                    session.user.id = token.sub as string
                    session.user.email = token.email as string
                    session.user.name = token.name as string
                }
                return session
            }
        }
    }
})