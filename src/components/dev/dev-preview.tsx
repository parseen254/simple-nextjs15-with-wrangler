'use client'
import { useState, useCallback } from 'react'
import { InboxIcon, MailIcon, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { SearchBar } from './components/search-bar'
import { MessageTabs, type MessageCategory } from './components/message-tabs'
import { MessageList } from './components/message-list'
import { MessageDetail } from './components/message-detail'
import { DevMessage, useDevMessages } from './hooks/use-dev-messages'

export function DevPreview() {
    const [open, setOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState<MessageCategory>('all')
    const [selectedMessage, setSelectedMessage] = useState<DevMessage | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const { 
        messages, 
        unreadCount, 
        isLoading, 
        isRefreshing,
        refresh,
        markAsRead
    } = useDevMessages()

    const handleOpenChange = useCallback((isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            setSelectedMessage(null)
            setActiveCategory('all')
            setSearchQuery('')
        }
    }, [])

    const handleSelectMessage = useCallback((message: DevMessage) => {
        setSelectedMessage(message)
        if (!message.read) {
            markAsRead(message.id)
        }
    }, [markAsRead])

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value)
    }, [])

    const filteredMessages = messages.filter(message => {
        // Filter by category
        if (activeCategory !== 'all' && message.type !== activeCategory) {
            return false
        }
        
        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return message.subject.toLowerCase().includes(query) || 
                  message.to.toLowerCase().includes(query) || 
                  message.content.toLowerCase().includes(query)
        }
        
        return true
    })

    const getTypeCounts = useCallback(() => {
        const counts = {
            all: messages.length,
            email: messages.filter(m => m.type === 'email').length,
            sms: messages.filter(m => m.type === 'sms').length,
            whatsapp: messages.filter(m => m.type === 'whatsapp').length
        }
        
        const unreadCounts = {
            all: messages.filter(m => !m.read).length,
            email: messages.filter(m => m.type === 'email' && !m.read).length,
            sms: messages.filter(m => m.type === 'sms' && !m.read).length,
            whatsapp: messages.filter(m => m.type === 'whatsapp' && !m.read).length
        }
        
        return { counts, unreadCounts }
    }, [messages])

    const { counts, unreadCounts } = getTypeCounts()

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null
    }

    return (
        <>
            <Button
                onClick={() => handleOpenChange(true)}
                className="fixed top-4 h-12 w-12 right-4 rounded-full p-3 shadow-lg"
                size="lg"
                variant="outline"
            >
                <InboxIcon className="size-5" />
                {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {unreadCount}
                    </Badge>
                )}
            </Button>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-5xl max-h-[85vh] h-[85vh] p-0 overflow-hidden flex flex-col">
                    <DialogHeader className="px-6 pt-4 pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle>Development Messages</DialogTitle>
                                <DialogDescription>
                                    View and manage your development notifications, including emails, SMS, and WhatsApp messages.
                                </DialogDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={refresh}
                                    disabled={isLoading || isRefreshing}
                                >
                                    <RefreshCw className={cn("h-4 w-4", (isLoading || isRefreshing) && "animate-spin")} />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    {!selectedMessage && (
                        <>
                            <div className="flex items-center px-6 pb-2">
                                <SearchBar value={searchQuery} onChange={handleSearchChange} />
                            </div>
                            
                            <MessageTabs 
                                activeCategory={activeCategory} 
                                setActiveCategory={setActiveCategory} 
                                unreadCounts={unreadCounts}
                            />
                        </>
                    )}
                    
                    <div className="flex-1 overflow-hidden">
                        {isLoading && messages.length === 0 ? (
                            <div className="p-4 space-y-4">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="flex items-center space-x-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : selectedMessage ? (
                            <MessageDetail 
                                message={selectedMessage} 
                                onBack={() => setSelectedMessage(null)} 
                            />
                        ) : (
                            <div className="h-full overflow-auto">
                                <MessageList 
                                    messages={filteredMessages} 
                                    onSelect={handleSelectMessage} 
                                />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}