import { getDB } from '@/db'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import * as schema from '@/db/schema/schema'
import { eq, desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { broadcastDevMessages } from './stream/route'
import type { DevMessage } from '@/components/dev/hooks/use-dev-messages'

type CreateMessageBody = {
    to: string
    subject: string
    content: string
    type: 'email' | 'sms' | 'whatsapp'
}

type UpdateMessageBody = {
    id: number
}

// Create a new message (used by internal services)
export async function POST(req: Request) {
    if (process.env.NODE_ENV !== 'development') {
        return new Response('Not available in production', { status: 403 })
    }

    const data = await req.json() as CreateMessageBody
    const db = getDB(getCloudflareContext().env.DB)
    
    const [message] = await db.insert(schema.devMessages).values({
        to: data.to,
        subject: data.subject,
        content: data.content,
        type: data.type,
        read: false,
        createdAt: new Date()
    }).returning()

    // Broadcast updates to all connected clients
    await broadcastDevMessages()
    
    return NextResponse.json(message)
}

// Update a message's read status
export async function PATCH(req: Request) {
    if (process.env.NODE_ENV !== 'development') {
        return new Response('Not available in production', { status: 403 })
    }

    const data = await req.json() as UpdateMessageBody
    const db = getDB(getCloudflareContext().env.DB)
    
    const [message] = await db.update(schema.devMessages)
        .set({ read: true })
        .where(eq(schema.devMessages.id, data.id))
        .returning()

    // Broadcast updates to all connected clients
    await broadcastDevMessages()
    
    return NextResponse.json(message)
}

// Get all messages
export async function GET() {
    if (process.env.NODE_ENV !== 'development') {
        return new Response('Not available in production', { status: 403 })
    }

    const db = getDB(getCloudflareContext().env.DB)
    const messages = await db.select()
        .from(schema.devMessages)
        .orderBy(desc(schema.devMessages.createdAt)) as DevMessage[]

    return NextResponse.json(messages)
}