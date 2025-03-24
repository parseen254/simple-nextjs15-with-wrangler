import { NextResponse } from 'next/server'
import { getDB } from '@/db'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { desc } from 'drizzle-orm'
import { devMessages } from '@/db/schema/schema'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ messages: [], unreadCount: 0 })
  }

  const db = getDB(getCloudflareContext().env.DB)

  const messages = await db
    .select()
    .from(devMessages)
    .orderBy(desc(devMessages.createdAt))

  const unreadCount = messages.filter(m => !m.read).length

  return NextResponse.json({
    messages,
    unreadCount,
  })
}