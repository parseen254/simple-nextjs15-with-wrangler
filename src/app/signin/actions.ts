'use server'

import { getDB } from '@/db'
import { getCloudflareContext } from "@opennextjs/cloudflare"
import * as schema from '@/db/schema/schema'
import { eq, desc } from 'drizzle-orm'
import { generateOtp } from '@/lib/utils'
import { sendEmail } from '@/lib/aws-ses'
import bcrypt from 'bcryptjs'

export async function requestOtp(email: string) {
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

    // Insert or update OTP
    await database
        .insert(schema.otps)
        .values({
            email: email,
            otp: hashedOtp,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            createdAt: new Date(),
        })
        .onConflictDoUpdate({
            target: schema.otps.id,
            set: {
                otp: hashedOtp,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
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
}

export async function verifyOtp(email: string, otp: string) {
    const database = getDB(getCloudflareContext().env.DB)

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


    // Get the latest OTP ordered by creation time (descending)
    const otpRecord = await database.select()
        .from(schema.otps)
        .where(eq(schema.otps.email, user.email))
        .orderBy(desc(schema.otps.createdAt))
        .limit(1)
        .then(otps => otps[0])

    if (!otpRecord) {
        throw new Error('OTP not found')
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
        throw new Error('OTP expired')
    }

    // Verify OTP
    const valid = await bcrypt.compare(otp, otpRecord.otp)
    if (!valid) {
        throw new Error('Invalid OTP')
    }

    // Delete ALL OTPs for this user after successful verification
    database.delete(schema.otps)
        .where(eq(schema.otps.email, user.email))

    return { success: true, userId: user.id, email: user.email }
}

export async function getUserByEmail(email: string) {
    const database = getDB(getCloudflareContext().env.DB)

    const user = await database.select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1)
        .then(users => users[0])

    return user
}