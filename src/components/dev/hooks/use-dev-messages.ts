import { useState, useEffect, useRef, useCallback } from 'react'
import { getDevMessages, markDevMessageRead } from '@/app/dev/actions'

export type DevMessage = {
    id: number
    to: string
    subject: string
    content: string
    type: 'email' | 'sms' | 'whatsapp'
    read: boolean
    createdAt: Date
}

type SSEResponse = {
    messages: DevMessage[]
    unreadCount: number
}

export const useDevMessages = () => {
    const [messages, setMessages] = useState<DevMessage[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const eventSourceRef = useRef<EventSource | null>(null)

    const connectSSE = useCallback(() => {
        if (process.env.NODE_ENV !== 'development') return

        // Close existing connection if any
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }

        // Only show loading indicator on first load
        setIsLoading(messages.length === 0)

        const eventSource = new EventSource('/api/dev-messages/stream')
        eventSourceRef.current = eventSource

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as SSEResponse
                setMessages(data.messages)
                setUnreadCount(data.unreadCount)
                setIsLoading(false)
                setIsRefreshing(false)
            } catch (error) {
                console.error('Error parsing SSE message:', error)
            }
        }

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error)
            eventSource.close()
            eventSourceRef.current = null

            // Try to reconnect after a delay
            setTimeout(connectSSE, 5000)
        }
    }, [messages.length])

    // Connect to SSE when component mounts
    useEffect(() => {
        connectSSE()
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
                eventSourceRef.current = null
            }
        }
    }, [connectSSE])

    const refresh = useCallback(async () => {
        setIsRefreshing(true)
        try {
            const data = await getDevMessages() as DevMessage[]
            setMessages(data)
            setUnreadCount(data.filter((message: DevMessage) => !message.read).length)
        } catch (error) {
            console.error('Failed to fetch messages:', error)
        } finally {
            setIsRefreshing(false)
        }
    }, [])

    const markAsRead = useCallback(async (id: number) => {
        await markDevMessageRead(id)
        // The SSE connection will automatically update the messages
    }, [])

    return {
        messages,
        unreadCount,
        isLoading,
        isRefreshing,
        refresh,
        markAsRead
    }
}