import { memo } from 'react'
import { ChevronLeft, MailIcon, MessageSquare, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DevMessage } from '../hooks/use-dev-messages'

type MessageDetailProps = {
    message: DevMessage
    onBack: () => void
}

export const MessageDetail = memo(({ message, onBack }: MessageDetailProps) => {
    return (
        <div className="h-full flex flex-col">
            <div className="border-b py-2 px-4 flex items-center">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onBack}
                    className="flex items-center gap-1"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>
            <div className="overflow-auto flex-1 p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-semibold">{message.subject}</h2>
                        <Badge
                            variant="outline"
                            className={cn(
                                "flex items-center gap-1",
                                message.type === 'email' && "text-blue-700 border-blue-200",
                                message.type === 'sms' && "text-green-700 border-green-200",
                                message.type === 'whatsapp' && "text-emerald-700 border-emerald-200"
                            )}
                        >
                            {message.type === 'email' && <MailIcon className="h-3 w-3" />}
                            {message.type === 'sms' && <MessageSquare className="h-3 w-3" />}
                            {message.type === 'whatsapp' && <PhoneCall className="h-3 w-3" />}
                            <span>{message.type}</span>
                        </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-2">To: {message.to}</span>
                        <span>•</span>
                        <span className="ml-2">{new Date(message.createdAt).toLocaleString()}</span>
                    </div>
                </div>
                <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: message.content }} />
                </div>
            </div>
        </div>
    )
})