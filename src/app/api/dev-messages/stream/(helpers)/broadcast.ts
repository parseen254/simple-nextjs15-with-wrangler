import { getDB } from "@/db";
import * as schema from "@/db/schema/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { desc } from "drizzle-orm";
import type { DevMessage } from "@/components/dev/hooks/use-dev-messages";

// Set a client ID to track connected clients
export const clients = new Map<string, ReadableStreamController<Uint8Array>>();

// Helper function to broadcast updates to all connected clients
export async function broadcastDevMessages() {
  if (process.env.NODE_ENV !== "development" || clients.size === 0) {
    return;
  }

  try {
    const database = getDB(getCloudflareContext().env.DB);
    const messages = (await database
      .select()
      .from(schema.devMessages)
      .orderBy(desc(schema.devMessages.createdAt))) as DevMessage[];

    const unreadCount = messages.filter((m: DevMessage) => !m.read).length;

    const data = {
      messages,
      unreadCount,
    };

    const event = `data: ${JSON.stringify(data)}\n\n`;
    const encodedEvent = new TextEncoder().encode(event);

    // Send to all connected clients
    for (const controller of clients.values()) {
      controller.enqueue(encodedEvent);
    }
  } catch (error) {
    console.error("Error broadcasting SSE update:", error);
  }
}
