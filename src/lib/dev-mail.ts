import { getDB } from '@/db';
import { devMessages } from '@/db/schema/schema';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { eq } from 'drizzle-orm';

export interface DevMail {
    id: number;
    to: string;
    subject: string;
    content: string;
    type: 'email' | 'sms' | 'whatsapp';
    read: boolean;
    createdAt: Date;
}

export async function saveDevMessage(message: Omit<DevMail, 'id' | 'read' | 'createdAt'>) {
    if (process.env.NODE_ENV === 'development') {
        const db = getDB(getCloudflareContext().env.DB)
        await db.insert(devMessages).values(message);
    }
}

export async function getDevMessages() {
    const db = getDB(getCloudflareContext().env.DB)
    const messages = await db
        .select()
        .from(devMessages)
        .orderBy(devMessages.createdAt);

    const unreadCount = messages.filter(m => !m.read).length;

    return {
        messages,
        unreadCount,
    };
}

export async function markAllAsRead() {
    if (process.env.NODE_ENV === 'development') {
        const db = getDB(getCloudflareContext().env.DB)
        await db
            .update(devMessages)
            .set({ read: true })
            .where(eq(devMessages.read, false));
    }
}