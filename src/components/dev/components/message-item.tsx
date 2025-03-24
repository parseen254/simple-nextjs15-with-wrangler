import { memo } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { MessageTypeIcon } from './message-type-icon'
import type { DevMessage } from '../hooks/use-dev-messages'

type MessageItemProps = {
    message: DevMessage
    onClick: () => void
}

export const MessageItem = memo(({ message, onClick }: MessageItemProps) => {
    const formatMessageDate = (date: Date) => {
        const messageDate = new Date(date)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (messageDate.toDateString() === today.toDateString()) {
            return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday'
        } else {
            return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
        }
    }

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'email':
                return 'bg-blue-500'
            case 'sms':
                return 'bg-green-500'
            case 'whatsapp':
                return 'bg-emerald-500'
            default:
                return 'bg-primary'
        }
    }

    return (
        <div 
            className={cn(
                "py-2 px-4 cursor-pointer hover:bg-muted/50 flex items-center",
                !message.read && "bg-primary/5"
            )}
            onClick={onClick}
        >
            <div className="mr-4 relative">
                <Avatar className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center",
                    message.type === 'email' && "bg-blue-100",
                    message.type === 'sms' && "bg-green-100",
                    message.type === 'whatsapp' && "bg-emerald-100"
                )}>
                    <div className={cn(
                        message.type === 'email' && "text-blue-700",
                        message.type === 'sms' && "text-green-700",
                        message.type === 'whatsapp' && "text-emerald-700"
                    )}>
                        <MessageTypeIcon type={message.type} />
                    </div>
                </Avatar>
                {!message.read && (
                    <div className={cn(
                        "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                        getBadgeColor(message.type)
                    )}></div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <h3 className={cn(
                        "text-sm truncate font-medium pr-2",
                        !message.read && "font-semibold"
                    )}>
                        {message.subject}
                    </h3>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatMessageDate(message.createdAt)}
                    </time>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                    <span className="truncate">
                        {message.to}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">
                    {message.content.replace(/<[^>]*>?/gm, '')}
                </p>
            </div>
        </div>
    )
})