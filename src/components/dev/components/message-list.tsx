import { memo } from "react";
import { MailIcon } from "lucide-react";
import { MessageItem } from "./message-item";
import type { DevMessage } from "../hooks/use-dev-messages";

const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center h-full py-16">
    <div className="bg-muted/20 rounded-full p-6 mb-6">
      <MailIcon className="h-12 w-12 text-muted-foreground/50" />
    </div>
    <h3 className="font-medium text-lg mb-2">No messages found</h3>
    <p className="text-muted-foreground text-center max-w-sm">
      There are no messages in this category. Messages will appear here when
      they are sent.
    </p>
  </div>
));

// Add display name for the EmptyState component
EmptyState.displayName = "EmptyState";

type MessageListProps = {
  messages: DevMessage[];
  onSelect: (message: DevMessage) => void;
};

export const MessageList = memo(({ messages, onSelect }: MessageListProps) => {
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

// Add display name for the MessageList component
MessageList.displayName = "MessageList";
