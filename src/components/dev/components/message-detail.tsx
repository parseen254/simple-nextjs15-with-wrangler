import { memo } from "react";
import { ChevronLeft, MailIcon, MessageSquare, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DevMessage } from "../hooks/use-dev-messages";

type MessageDetailProps = {
  message: DevMessage;
  onBack: () => void;
};

export const MessageDetail = memo(({ message, onBack }: MessageDetailProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b py-3 px-8 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="overflow-auto flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              {message.subject}
            </h2>
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full",
                message.type === "email" &&
                  "text-blue-700 border-blue-200 bg-blue-50",
                message.type === "sms" &&
                  "text-green-700 border-green-200 bg-green-50",
                message.type === "whatsapp" &&
                  "text-emerald-700 border-emerald-200 bg-emerald-50",
              )}
            >
              {message.type === "email" && <MailIcon className="h-3.5 w-3.5" />}
              {message.type === "sms" && (
                <MessageSquare className="h-3.5 w-3.5" />
              )}
              {message.type === "whatsapp" && (
                <PhoneCall className="h-3.5 w-3.5" />
              )}
              <span className="font-medium">{message.type}</span>
            </Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground space-x-4">
            <span>
              To:{" "}
              <span className="font-medium text-foreground">{message.to}</span>
            </span>
            <span>•</span>
            <span>{new Date(message.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: message.content }} />
        </div>
      </div>
    </div>
  );
});

// Add display name for ESLint rule
MessageDetail.displayName = "MessageDetail";
