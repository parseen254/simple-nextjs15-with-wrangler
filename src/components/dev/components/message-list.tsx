import { memo } from 'react'
import { MailIcon } from 'lucide-react'
import { MessageItem } from './message-item'
import type { DevMessage } from '../hooks/use-dev-messages'

const EmptyState = memo(() => (
    <div className="flex flex-col items-center justify-center h-full">
        <MailIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No messages in this category</p>
    </div>
))

type MessageListProps = {
    messages: DevMessage[]
    onSelect: (message: DevMessage) => void
}

export const MessageList = memo(({ messages, onSelect }: MessageListProps) => {
    if (messages.length === 0) {
        return <EmptyState />
    }

    return (
        <div className="divide-y">
            {messages.map((message) => (
                <MessageItem 
                    key={message.id} 
                    message={message} 
                    onClick={() => onSelect(message)} 
                />
            ))}
        </div>
    )
})