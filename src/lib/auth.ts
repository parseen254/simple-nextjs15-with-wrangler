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
                        // Better error handling with specific error messages
                        if (!credentials) {
                            throw new Error("No credentials provided")
                        }
                        
                        // Parse and validate credentials
                        const { email, otp } = await OtpZodSchema.parseAsync(credentials)
                        
                        // Verify OTP with improved error handling
                        const result = await verifyOtp(email, otp)
                        
                        if (result.success) {
                            const user = await getUserByEmail(email)
                            if (!user) {
                                throw new Error("User not found")
                            }
                            
                            // Format user for NextAuth
                            return {
                                ...user,
                                id: user.id.toString(),
                            }
                        }
                        
                        throw new Error("Invalid verification code")
                    } catch (error) {
                        // Enhance error messages for better client-side handling
                        const message = error instanceof Error 
                            ? error.message 
                            : "Authentication failed";
                            
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