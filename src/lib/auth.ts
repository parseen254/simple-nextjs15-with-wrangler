import NextAuth from "next-auth"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { Adapter } from "next-auth/adapters"
import Credentials from "next-auth/providers/credentials"
import { getUserByEmail, verifyOtp } from "@/app/actions"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { getDB } from "@/db"
import { OtpZodSchema } from "@/lib/zod"


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
                    let user = null
                    const { email, otp } = await OtpZodSchema.parseAsync(credentials)

                    try {
                        const result = await verifyOtp(email, otp)
                        if (result.success) {
                            const user = await getUserByEmail(email)
                            if (!user) {
                                throw new Error("User not found")
                            }
                        }
                    } catch (error) {
                        if (error instanceof Error) {
                            throw error
                        }
                        throw new Error("Authentication failed")
                    }
                    return user
                }
            }),
        ],
        session: {
            strategy: "jwt",
            maxAge: 12 * 60 * 60, // 12 hours
        },
        pages: {
            signIn: "/auth",
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