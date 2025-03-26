'use server'
import { getDB } from '@/db'
import { getCloudflareContext } from "@opennextjs/cloudflare"
import * as schema from '@/db/schema/schema'
import { eq, desc, and, gt } from 'drizzle-orm'
import { generateOtp } from '@/lib/utils'
import { sendEmail } from '@/lib/aws-ses'
import bcrypt from 'bcryptjs'
import { formatDistanceToNow, addSeconds } from 'date-fns'

// Explicitly set to use Node.js runtime, not Edge
export const runtime = 'nodejs'

/**
 * Request a new OTP for the given email
 * - Generates a new OTP
 * - Stores it in the database
 * - Sends it via email
 */
export async function requestOtp(email: string) {
    try {
        const database = getDB(getCloudflareContext().env.DB)

        // Check if there's a recent OTP that hasn't expired
        const recentOtp = await database
            .select()
            .from(schema.otps)
            .where(
                and(
                    eq(schema.otps.email, email),
                    gt(schema.otps.expiresAt, new Date())
                )
            )
            .orderBy(desc(schema.otps.createdAt))
            .limit(1)
            .then(otps => otps[0])

        if (recentOtp) {
            // Calculate seconds since OTP was created
            const createdAt = new Date(recentOtp.createdAt).getTime();
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - createdAt) / 1000);
            
            // Only rate limit for 60 seconds (1 minute)
            if (elapsedSeconds < 60) {
                const waitTimeSeconds = 60 - elapsedSeconds;
                const nextEligibleTime = addSeconds(new Date(), waitTimeSeconds);
                const readableTime = formatDistanceToNow(nextEligibleTime, { addSuffix: true });
                
                throw new Error(`A verification code was recently sent. You can request a new one ${readableTime}`);
            }
            // If it's been more than 60 seconds, allow a new OTP
        }

        // Generate new OTP
        const otp = generateOtp()
        const hashedOtp = await bcrypt.hash(otp, 10)

        // Store OTP
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
                recipientName: undefined,
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
        
        // Get latest OTP
        const otpRecord = await database
            .select()
            .from(schema.otps)
            .where(eq(schema.otps.email, email))
            .orderBy(desc(schema.otps.createdAt))
            .limit(1)
            .then(records => records[0])
        
        if (!otpRecord) {
            throw new Error('No verification code found. Please request a new one.')
        }
        
        // Check expiration
        if (new Date() > new Date(otpRecord.expiresAt)) {
            // Clean up expired OTP
            await database.delete(schema.otps)
                .where(eq(schema.otps.email, email))
            
            throw new Error('Verification code has expired. Please request a new one.')
        }
        
        // Verify OTP
        const valid = await bcrypt.compare(otp, otpRecord.otp)
        
        if (!valid) {
            throw new Error('Invalid verification code. Please try again.')
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