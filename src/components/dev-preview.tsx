'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Card } from './ui/card'
import { cn } from '@/lib/utils'
import { getDevMessages, markDevMessageRead } from '@/app/dev/actions'

// Define the message type directly here to avoid circular imports
type DevMessage = {
    id: number
    to: string
    subject: string
    content: string
    type: 'email' | 'sms' | 'whatsapp'
    read: boolean
    createdAt: Date
}

export function DevPreview() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<DevMessage[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [notification, setNotification] = useState<HTMLAudioElement>()

    // Initialize notification for browser
    useEffect(() => {
        setNotification(new Audio('/notification.mp3'))
    }, [])

    const fetchMessages = async () => {
        const data = await getDevMessages()
        setMessages(data)

        // Only play notification if there are new messages (and not on initial load)
        const _unreadCount = data.filter((message) => !message.read).length
        if (_unreadCount > unreadCount && unreadCount !== 0) {
            notification?.play()
        }

        setUnreadCount(_unreadCount)
    }

    useEffect(() => {
        fetchMessages()
        // Poll for new messages every 15 seconds
        const interval = setInterval(fetchMessages, 15000)
        return () => clearInterval(interval)
    }, [])

    const handleOpenChange = async (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen && unreadCount > 0) {
            await fetchMessages()
        }
    }

    const handleMarkAsRead = async (id: number) => {
        await markDevMessageRead(id)
        await fetchMessages()
    }

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null
    }

    return (
        <>
            <Button
                onClick={() => handleOpenChange(true)}
                className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg"
                size="icon"
                variant="outline"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                        {unreadCount}
                    </span>
                )}
            </Button>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Development Messages</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        {messages.length === 0 ? (
                            <p className="text-center text-muted-foreground">No messages yet</p>
                        ) : (
                            messages.map((message) => (
                                <Card
                                    key={message.id}
                                    className={cn(
                                        "p-4",
                                        !message.read && "border-primary"
                                    )}
                                    onClick={() => !message.read && handleMarkAsRead(message.id)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "text-xs px-2 py-0.5 rounded-full",
                                                    message.type === 'email' && "bg-blue-100 text-blue-700",
                                                    message.type === 'sms' && "bg-green-100 text-green-700",
                                                    message.type === 'whatsapp' && "bg-emerald-100 text-emerald-700"
                                                )}>
                                                    {message.type}
                                                </span>
                                                <p className="text-sm font-medium">{message.subject}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{message.to}</p>
                                            <div className="mt-2 text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.content }} />
                                        </div>
                                        <time className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(message.createdAt).toLocaleTimeString()}
                                        </time>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}