import { getDevMessages } from "@/app/dev/actions";

import type { DevMessage } from "@/components/dev/hooks/use-dev-messages";
import { clients } from "./(helpers)/broadcast";

export async function GET() {
  // Only available in development mode
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not available in production", { status: 403 });
  }

  // Create a unique client ID
  const clientId = crypto.randomUUID();

  // Create a stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      clients.set(clientId, controller);

      // Send initial data
      sendInitialData(controller);

      // Remove client when connection closes
      setTimeout(
        () => {
          clients.delete(clientId);
        },
        24 * 60 * 60 * 1000,
      ); // Cleanup after 24 hours max
    },
    cancel() {
      clients.delete(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function sendInitialData(
  controller: ReadableStreamController<Uint8Array>,
) {
  try {
    const messages = (await getDevMessages()) as DevMessage[];
    const unreadCount = messages.filter((m: DevMessage) => !m.read).length;

    const data = {
      messages,
      unreadCount,
    };

    const event = `data: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(new TextEncoder().encode(event));
  } catch (error) {
    console.error("Error sending initial SSE data:", error);
  }
}
