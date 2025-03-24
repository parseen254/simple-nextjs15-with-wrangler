import { memo } from 'react'
import { MailIcon, MessageSquare, PhoneCall } from 'lucide-react'

export const MessageTypeIcon = memo(({ type }: { type: string }) => {
    switch (type) {
        case 'email':
            return <MailIcon className="size-4" />
        case 'sms':
            return <MessageSquare className="size-4" />
        case 'whatsapp':
            return <PhoneCall className="size-4" />
        default:
            return <MailIcon className="size-4" />
    }
});