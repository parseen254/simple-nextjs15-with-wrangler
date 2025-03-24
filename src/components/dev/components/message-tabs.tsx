import { memo } from 'react'
import { MailIcon, MessageSquare, PhoneCall, Inbox } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type MessageCategory = 'all' | 'email' | 'sms' | 'whatsapp'

type MessageTabsProps = {
    activeCategory: MessageCategory
    setActiveCategory: (category: MessageCategory) => void
    unreadCounts: Record<MessageCategory, number>
}

export const MessageTabs = memo(({ activeCategory, setActiveCategory, unreadCounts }: MessageTabsProps) => (
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