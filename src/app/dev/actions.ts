'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

// Abstract interface for all types of messages
export type MessageContent = {
    to: string
    subject: string
    content: string
    type: 'email' | 'sms' | 'whatsapp'
    metadata?: Record<string, any>
}

// Helper to get the base URL
async function getBaseUrl() {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    return `${protocol}://${host}`
}

// Save a development message
export async function saveDevMessage(message: MessageContent) {
    if (process.env.NODE_ENV !== 'development') {
        return null
    }

    // Use the API route to create the message to ensure SSE broadcast
    const response = await fetch(`${await getBaseUrl()}/api/dev-messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    })

    if (!response.ok) {
        throw new Error('Failed to save message')
    }

    const result = await response.json()
    revalidatePath('/')
    return result
}

/**
 * Get all developer messages for the current user
 */
export async function getDevMessages() {
    if (process.env.NODE_ENV !== 'development') {
        return []
    }

    // Use the API route to fetch messages
    const response = await fetch(`${await getBaseUrl()}/api/dev-messages`)
    if (!response.ok) {
        throw new Error('Failed to fetch messages')
    }

    return response.json()
}

/**
 * Mark a developer message as read
 */
export async function markDevMessageRead(id: number) {   
    if (process.env.NODE_ENV !== 'development') {
        return
    }

    // Use the API route to update message status to ensure SSE broadcast
    const response = await fetch(`${await getBaseUrl()}/api/dev-messages`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
    })

    if (!response.ok) {
        throw new Error('Failed to mark message as read')
    }

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
    // Use saveDevMessage to ensure consistent behavior
    await saveDevMessage({
        to: message.email,
        subject: message.title,
        content: message.content,
        type: message.type
    })

    revalidatePath('/')
}