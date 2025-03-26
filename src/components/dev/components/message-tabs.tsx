import { memo } from "react";
import { MailIcon, MessageSquare, PhoneCall, Inbox } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type MessageCategory = "all" | "email" | "sms" | "whatsapp";

type MessageTabsProps = {
  activeCategory: MessageCategory;
  setActiveCategory: (category: MessageCategory) => void;
  unreadCounts: Record<MessageCategory, number>;
};

export const MessageTabs = memo(
  ({ activeCategory, setActiveCategory, unreadCounts }: MessageTabsProps) => (
    <Tabs
      defaultValue={activeCategory}
      className="w-full"
      onValueChange={(value) => setActiveCategory(value as MessageCategory)}
    >
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        <TabsTrigger
          value="all"
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 h-12"
        >
          <div className="flex items-center gap-2.5">
            <Inbox className="h-4 w-4" />
            <span className="font-medium">All</span>
            {unreadCounts.all > 0 && (
              <div className="flex items-center justify-center rounded-full bg-primary/90 w-5 h-5 text-[10px] text-primary-foreground font-medium">
                {unreadCounts.all}
              </div>
            )}
          </div>
        </TabsTrigger>
        <TabsTrigger
          value="email"
          className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-6 py-3 h-12"
        >
          <div className="flex items-center gap-2.5">
            <MailIcon className="h-4 w-4" />
            <span className="font-medium">Email</span>
            {unreadCounts.email > 0 && (
              <div className="flex items-center justify-center rounded-full bg-blue-500/90 w-5 h-5 text-[10px] text-white font-medium">
                {unreadCounts.email}
              </div>
            )}
          </div>
        </TabsTrigger>
        <TabsTrigger
          value="sms"
          className="data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none px-6 py-3 h-12"
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">SMS</span>
            {unreadCounts.sms > 0 && (
              <div className="flex items-center justify-center rounded-full bg-green-500/90 w-5 h-5 text-[10px] text-white font-medium">
                {unreadCounts.sms}
              </div>
            )}
          </div>
        </TabsTrigger>
        <TabsTrigger
          value="whatsapp"
          className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none px-6 py-3 h-12"
        >
          <div className="flex items-center gap-2.5">
            <PhoneCall className="h-4 w-4" />
            <span className="font-medium">WhatsApp</span>
            {unreadCounts.whatsapp > 0 && (
              <div className="flex items-center justify-center rounded-full bg-emerald-500/90 w-5 h-5 text-[10px] text-white font-medium">
                {unreadCounts.whatsapp}
              </div>
            )}
          </div>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
);

// Add display name for ESLint rule
MessageTabs.displayName = "MessageTabs";
