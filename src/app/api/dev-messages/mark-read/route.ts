import { NextResponse } from 'next/server'
import { getDB } from '@/db'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { eq } from 'drizzle-orm'
import { devMessages } from '@/db/schema/schema'

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false })
  }

  const db = getDB(getCloudflareContext().env.DB)
  
  await db
    .update(devMessages)
    .set({ read: true })
    .where(eq(devMessages.read, false))

  return NextResponse.json({ success: true })
}