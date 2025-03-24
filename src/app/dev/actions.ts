'use server'

import { getDB } from '@/db'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import * as schema from '@/db/schema/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

// Abstract interface for all types of messages
export type MessageContent = {
    to: string
    subject: string
    content: string
    type: 'email' | 'sms' | 'whatsapp'
    metadata?: Record<string, any>
}

// Save a development message
export async function saveDevMessage(message: MessageContent) {
    if (process.env.NODE_ENV !== 'development') {
        return null
    }

    const db = getDB(getCloudflareContext().env.DB)
    const [result] = await db.insert(schema.devMessages).values({
        to: message.to,
        subject: message.subject,
        content: message.content,
        type: message.type,
        read: false,
        createdAt: new Date()
    }).returning()

    revalidatePath('/') // Revalidate to refresh the notification count
    return result
}

/**
 * Get all developer messages for the current user
 */
export async function getDevMessages() {

    const database = getDB(getCloudflareContext().env.DB)
    const messages = await database.select()
        .from(schema.devMessages)
        .orderBy(desc(schema.devMessages.createdAt))

    return messages
}

/**
 * Mark a developer message as read
 */
export async function markDevMessageRead(id: number) {   

    const database = getDB(getCloudflareContext().env.DB)

    // Check if the message belongs to the user
    const message = await database.select()
        .from(schema.devMessages)
        .where(eq(schema.devMessages.id, id))
        .limit(1)
        .then(messages => messages[0])

    if (!message) {
        throw new Error('Message not found or does not belong to you')
    }

    await database.update(schema.devMessages)
        .set({ read: true })
        .where(eq(schema.devMessages.id, id))

    revalidatePath('/')
}

/**
 * Create a new developer message
 */
export async function createDevMessage(message: {
    title: string
    content: string
    type: 'email' | 'sms' | 'whatsapp'
    email: string
}) {
    const database = getDB(getCloudflareContext().env.DB)
    await database.insert(schema.devMessages).values({
        to: message.email,
        subject: message.title,
        content: message.content,
        type: message.type,
        read: false,
        createdAt: new Date()
    })

    revalidatePath('/')
}