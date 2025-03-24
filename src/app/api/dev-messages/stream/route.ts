import { getDevMessages } from '@/app/dev/actions'
import { getDB } from '@/db'
import * as schema from '@/db/schema/schema'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { desc } from 'drizzle-orm'
import type { DevMessage } from '@/components/dev/hooks/use-dev-messages'

// Set a client ID to track connected clients
const clients = new Map<string, ReadableStreamController<Uint8Array>>()

export async function GET() {
  // Only available in development mode
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not available in production', { status: 403 })
  }

  // Create a unique client ID
  const clientId = crypto.randomUUID()

  // Create a stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      clients.set(clientId, controller)
      
      // Send initial data
      sendInitialData(controller)

      // Remove client when connection closes
      setTimeout(() => {
        clients.delete(clientId)
      }, 24 * 60 * 60 * 1000) // Cleanup after 24 hours max
    },
    cancel() {
      clients.delete(clientId)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}

async function sendInitialData(controller: ReadableStreamController<Uint8Array>) {
  try {
    const messages = (await getDevMessages()) as DevMessage[]
    const unreadCount = messages.filter((m: DevMessage) => !m.read).length
    
    const data = {
      messages,
      unreadCount
    }

    const event = `data: ${JSON.stringify(data)}\n\n`
    controller.enqueue(new TextEncoder().encode(event))
  } catch (error) {
    console.error('Error sending initial SSE data:', error)
  }
}

// Helper function to broadcast updates to all connected clients
export async function broadcastDevMessages() {
  if (process.env.NODE_ENV !== 'development' || clients.size === 0) {
    return
  }
  
  try {
    const database = getDB(getCloudflareContext().env.DB)
    const messages = await database.select()
      .from(schema.devMessages)
      .orderBy(desc(schema.devMessages.createdAt)) as DevMessage[]
    
    const unreadCount = messages.filter((m: DevMessage) => !m.read).length
    
    const data = {
      messages,
      unreadCount
    }

    const event = `data: ${JSON.stringify(data)}\n\n`
    const encodedEvent = new TextEncoder().encode(event)
    
    // Send to all connected clients
    for (const controller of clients.values()) {
      controller.enqueue(encodedEvent)
    }
  } catch (error) {
    console.error('Error broadcasting SSE update:', error)
  }
}