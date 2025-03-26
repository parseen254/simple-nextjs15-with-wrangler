'use client'
import { useState, useCallback } from 'react'
import { InboxIcon, RefreshCw } from 'lucide-react'
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
        const unreadCounts = {
            all: messages.filter(m => !m.read).length,
            email: messages.filter(m => m.type === 'email' && !m.read).length,
            sms: messages.filter(m => m.type === 'sms' && !m.read).length,
            whatsapp: messages.filter(m => m.type === 'whatsapp' && !m.read).length
        }
        
        return { unreadCounts }
    }, [messages])

    const { unreadCounts } = getTypeCounts()

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null
    }

    return (
        <>
            <Button
                onClick={() => handleOpenChange(true)}
                className="fixed top-4 h-12 w-12 right-4 rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
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
                <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] h-[90vh] p-0 overflow-hidden flex flex-col bg-gradient-to-b from-background to-background/95 backdrop-blur-sm border-muted/20">
                    <DialogHeader className="px-8 pt-6 pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-2xl font-bold tracking-tight">Development Messages</DialogTitle>
                                <DialogDescription className="text-base max-w-3xl">
                                    View and manage your development notifications, including emails, SMS, and WhatsApp messages.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    {!selectedMessage && (
                        <>
                            <div className="flex items-center px-8 py-4 border-b">
                                <SearchBar value={searchQuery} onChange={handleSearchChange} />
                            </div>
                            
                            <MessageTabs 
                                activeCategory={activeCategory} 
                                setActiveCategory={setActiveCategory} 
                                unreadCounts={unreadCounts}
                            />
                        </>
                    )}
                    
                    <div className="flex-1 overflow-hidden relative">
                        {isLoading && messages.length === 0 ? (
                            <div className="p-8 space-y-6">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="flex items-center space-x-4">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="space-y-3 flex-1">
                                            <Skeleton className="h-5 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
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
                        
                        <Button 
                            variant="secondary" 
                            size="icon" 
                            onClick={refresh}
                            disabled={isLoading || isRefreshing}
                            className="absolute bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all bg-background/95 backdrop-blur-sm border border-border"
                        >
                            <RefreshCw className={cn("h-5 w-5", (isLoading || isRefreshing) && "animate-spin")} />
                            <span className="sr-only">Refresh messages</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}