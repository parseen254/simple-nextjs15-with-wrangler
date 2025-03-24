'use server'
import { getDB } from '@/db'
import { getCloudflareContext } from "@opennextjs/cloudflare"
import * as schema from '@/db/schema/schema'
import { eq, desc, and, gt } from 'drizzle-orm'
import { generateOtp } from '@/lib/utils'
import { sendEmail } from '@/lib/aws-ses'
import bcrypt from 'bcryptjs'

/**
 * Request a new OTP for the given email
 * - Generates a new OTP
 * - Stores it in the database
 * - Sends it via email
 */
export async function requestOtp(email: string) {
    try {
        // Generate a random 6-digit OTP
        const otp = generateOtp()
        
        // Hash the OTP for storage
        const hashedOtp = await bcrypt.hash(otp, 10)
        
        const database = getDB(getCloudflareContext().env.DB)
        
        // Check if the user exists
        let user = await database.select()
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .limit(1)
            .then(users => users[0])
            
        // Clean up any expired OTPs for this email to keep the database clean
        await database.delete(schema.otps)
            .where(
                and(
                    eq(schema.otps.email, email),
                    gt(schema.otps.expiresAt, new Date())
                )
            )
            
        // Insert new OTP
        await database
            .insert(schema.otps)
            .values({
                email: email,
                otp: hashedOtp,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
                createdAt: new Date(),
            })
            
        // Send OTP via email
        await sendEmail({
            to: email,
            subject: 'Your verification code',
            props: {
                recipientName: user?.name || undefined,
                otp,
            },
        })
        
        return { success: true }
    } catch (error) {
        console.error("Error requesting OTP:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to send verification code")
    }
}

/**
 * Verify an OTP for a given email
 * - Fetches the latest OTP for the email
 * - Checks if it's valid and not expired
 * - Creates a user if one doesn't exist
 */
export async function verifyOtp(email: string, otp: string) {
    try {
        const database = getDB(getCloudflareContext().env.DB)
        
        // Get the latest OTP ordered by creation time (descending)
        const otpRecord = await database.select()
            .from(schema.otps)
            .where(eq(schema.otps.email, email))
            .orderBy(desc(schema.otps.createdAt))
            .limit(1)
            .then(otps => otps[0])
            
        if (!otpRecord) {
            throw new Error('No verification code found. Please request a new one.')
        }
        
        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            // Delete expired OTP
            await database.delete(schema.otps)
                .where(eq(schema.otps.id, otpRecord.id))
                
            throw new Error('Verification code expired. Please request a new one.')
        }
        
        // Verify OTP
        const valid = await bcrypt.compare(otp, otpRecord.otp)
        
        if (!valid) {
            throw new Error('Invalid verification code')
        }
        
        // Get user by email
        let user = await getUserByEmail(email)
        
        if (!user) {
            // Create a new user if one doesn't exist
            [user] = await database.insert(schema.users)
                .values({
                    email
                })
                .returning()
        }
        
        // Delete ALL OTPs for this user after successful verification
        await database.delete(schema.otps)
            .where(eq(schema.otps.email, email))
            
        return { success: true, userId: user.id, email: user.email }
    } catch (error) {
        console.error("Error verifying OTP:", error)
        throw error
    }
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string) {
    const database = getDB(getCloudflareContext().env.DB)
    
    const user = await database.select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1)
        .then(users => users[0])
        
    return user
}