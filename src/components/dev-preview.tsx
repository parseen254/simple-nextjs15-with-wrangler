'use client'
import { useEffect, useState, useCallback, memo } from 'react'
import { Bell, MailIcon, MessageSquare, PhoneCall, Search, Star, Inbox, Trash, RefreshCw, ChevronLeft } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { cn } from '@/lib/utils'
import { getDevMessages, markDevMessageRead } from '@/app/dev/actions'
import { Input } from './ui/input'
import { Avatar } from './ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'

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

type MessageCategory = 'all' | 'email' | 'sms' | 'whatsapp'

// Component to render the message type icon
const MessageTypeIcon = memo(({ type }: { type: string }) => {
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

// Component for the search bar
const SearchBar = memo(({ value, onChange }: { value: string, onChange: (value: string) => void }) => (
    <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
            placeholder="Search messages..."
            className="pl-8"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
));

// Component for the tabs with unread count
const MessageTabs = memo(({ 
    activeCategory, 
    setActiveCategory, 
    unreadCounts 
}: { 
    activeCategory: MessageCategory, 
    setActiveCategory: (category: MessageCategory) => void, 
    unreadCounts: Record<MessageCategory, number> 
}) => (
    <Tabs 
        defaultValue={activeCategory} 
        className="w-full" 
        onValueChange={(value) => setActiveCategory(value as MessageCategory)}
    >
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
            <TabsTrigger 
                value="all" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
                <div className="flex items-center">
                    <Inbox className="h-4 w-4 mr-2" />
                    <span>All</span>
                    {unreadCounts.all > 0 && (
                        <div className="ml-2 flex items-center justify-center rounded-full bg-primary w-5 h-5 text-[10px] text-white font-medium">
                            {unreadCounts.all}
                        </div>
                    )}
                </div>
            </TabsTrigger>
            <TabsTrigger 
                value="email" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
                <div className="flex items-center">
                    <MailIcon className="h-4 w-4 mr-2" />
                    <span>Email</span>
                    {unreadCounts.email > 0 && (
                        <div className="ml-2 flex items-center justify-center rounded-full bg-blue-500 w-5 h-5 text-[10px] text-white font-medium">
                            {unreadCounts.email}
                        </div>
                    )}
                </div>
            </TabsTrigger>
            <TabsTrigger 
                value="sms" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
                <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>SMS</span>
                    {unreadCounts.sms > 0 && (
                        <div className="ml-2 flex items-center justify-center rounded-full bg-green-500 w-5 h-5 text-[10px] text-white font-medium">
                            {unreadCounts.sms}
                        </div>
                    )}
                </div>
            </TabsTrigger>
            <TabsTrigger 
                value="whatsapp" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
                <div className="flex items-center">
                    <PhoneCall className="h-4 w-4 mr-2" />
                    <span>WhatsApp</span>
                    {unreadCounts.whatsapp > 0 && (
                        <div className="ml-2 flex items-center justify-center rounded-full bg-emerald-500 w-5 h-5 text-[10px] text-white font-medium">
                            {unreadCounts.whatsapp}
                        </div>
                    )}
                </div>
            </TabsTrigger>
        </TabsList>
    </Tabs>
));

// Component for an individual message item
const MessageItem = memo(({ 
    message, 
    onClick 
}: { 
    message: DevMessage, 
    onClick: () => void 
}) => {
    const formatMessageDate = (date: Date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'email':
                return 'bg-blue-500';
            case 'sms':
                return 'bg-green-500';
            case 'whatsapp':
                return 'bg-emerald-500';
            default:
                return 'bg-primary';
        }
    };

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
    );
});

// Component for the empty state when no messages are available
const EmptyState = memo(() => (
    <div className="flex flex-col items-center justify-center h-full">
        <MailIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No messages in this category</p>
    </div>
));

// Component for the message list view
const MessageList = memo(({ 
    messages, 
    onSelect 
}: { 
    messages: DevMessage[], 
    onSelect: (message: DevMessage) => void 
}) => {
    if (messages.length === 0) {
        return <EmptyState />;
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
    );
});

// Component for the message detail view
const MessageDetail = memo(({ 
    message, 
    onBack 
}: { 
    message: DevMessage, 
    onBack: () => void 
}) => {
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
    );
});

export function DevPreview() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<DevMessage[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notification, setNotification] = useState<HTMLAudioElement>();
    const [activeCategory, setActiveCategory] = useState<MessageCategory>('all');
    const [selectedMessage, setSelectedMessage] = useState<DevMessage | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Initialize notification for browser
    useEffect(() => {
        setNotification(new Audio('/notification.mp3'));
    }, []);

    const fetchMessages = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getDevMessages();
            setMessages(data);
            // Only play notification if there are new messages (and not on initial load)
            const _unreadCount = data.filter((message) => !message.read).length;
            if (_unreadCount > unreadCount && unreadCount !== 0) {
                notification?.play();
            }
            setUnreadCount(_unreadCount);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setIsLoading(false);
        }
    }, [unreadCount, notification]);

    useEffect(() => {
        if (open) {
            fetchMessages();
        }
        
        // Poll for new messages every 5 seconds when dialog is open
        let interval: NodeJS.Timeout | null = null;
        if (open) {
            interval = setInterval(fetchMessages, 5000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [open, fetchMessages]);

    useEffect(() => {
        // Also poll for unread count even when dialog is closed
        const backgroundInterval = setInterval(async () => {
            if (!open) {
                try {
                    const data = await getDevMessages();
                    const _unreadCount = data.filter((message) => !message.read).length;
                    setUnreadCount(_unreadCount);
                    if (_unreadCount > unreadCount && unreadCount !== 0) {
                        notification?.play();
                    }
                } catch (error) {
                    console.error('Failed to fetch unread count:', error);
                }
            }
        }, 30000); // Every 30 seconds
        
        return () => clearInterval(backgroundInterval);
    }, [open, unreadCount, notification]);

    const handleOpenChange = useCallback((isOpen: boolean) => {
        setOpen(isOpen);
        // Reset selected message when closing the dialog
        if (!isOpen) {
            setSelectedMessage(null);
            setActiveCategory('all');
            setSearchQuery('');
        }
    }, []);

    const handleMarkAsRead = useCallback(async (id: number) => {
        await markDevMessageRead(id);
        await fetchMessages();
    }, [fetchMessages]);

    const handleSelectMessage = useCallback((message: DevMessage) => {
        setSelectedMessage(message);
        if (!message.read) {
            handleMarkAsRead(message.id);
        }
    }, [handleMarkAsRead]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    const filteredMessages = messages.filter(message => {
        // Filter by category
        if (activeCategory !== 'all' && message.type !== activeCategory) {
            return false;
        }
        
        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return message.subject.toLowerCase().includes(query) || 
                  message.to.toLowerCase().includes(query) || 
                  message.content.toLowerCase().includes(query);
        }
        
        return true;
    });

    const getTypeCounts = useCallback(() => {
        const counts = {
            all: messages.length,
            email: messages.filter(m => m.type === 'email').length,
            sms: messages.filter(m => m.type === 'sms').length,
            whatsapp: messages.filter(m => m.type === 'whatsapp').length
        };
        
        const unreadCounts = {
            all: messages.filter(m => !m.read).length,
            email: messages.filter(m => m.type === 'email' && !m.read).length,
            sms: messages.filter(m => m.type === 'sms' && !m.read).length,
            whatsapp: messages.filter(m => m.type === 'whatsapp' && !m.read).length
        };
        
        return { counts, unreadCounts };
    }, [messages]);

    const { counts, unreadCounts } = getTypeCounts();

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <>
            <Button
                onClick={() => handleOpenChange(true)}
                className="fixed top-4 h-12 w-12 right-4 rounded-full p-3 shadow-lg"
                size="lg"
                variant="outline"
            >
                <MailIcon className="size-5" />
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
                            <DialogTitle>Development Messages</DialogTitle>
                            <div className="flex items-center space-x-2">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => fetchMessages()}
                                    disabled={isLoading}
                                >
                                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
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
                            <MessageDetail message={selectedMessage} onBack={() => setSelectedMessage(null)} />
                        ) : (
                            <div className="h-full overflow-auto">
                                <MessageList messages={filteredMessages} onSelect={handleSelectMessage} />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}