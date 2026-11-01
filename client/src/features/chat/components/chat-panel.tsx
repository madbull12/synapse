"use client";

import * as React from "react";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import {
  ChatMessageItem,
  Message,
} from "@/features/chat/components/chat-message-item";
import { ChatInputForm } from "@/features/chat/components/chat-input-form";
import { DaySeparator } from "@/features/chat/components/day-separator";

const MOCK_MESSAGES: Message[] = [
  {
    id: "m1",
    sender: "Leo Ramirez",
    avatar: "LR",
    time: "9:41 AM",
    isAI: false,
    content:
      "Morning team — dropping the updated presence spec for the workspace sidebar. The status dot should reflect the live socket state, not just an online flag.",
  },
  {
    id: "m2",
    sender: "Aria Kapoor",
    avatar: "AK",
    time: "9:43 AM",
    isAI: false,
    content:
      "Love it. Can we get a reusable hook so every channel view stays in sync? Would rather not re-implement the socket lifecycle per panel.",
  },
  {
    id: "m3",
    sender: "Maya Chen",
    avatar: "MC",
    time: "9:44 AM",
    isAI: false,
    content:
      "On it. @Synapse-Copilot can you sketch a live presence hook with cleanup?",
  },
  {
    id: "m4",
    sender: "Synapse-Copilot",
    avatar: "🤖",
    time: "just now",
    isAI: true,
    content:
      "Here's a lightweight hook that tracks live participants over a WebSocket. It cleans up the connection on unmount so you avoid dangling sockets between channel switches.",
    codeBlock: {
      filename: "use-live-presence.ts",
      code: `export function useLivePresence(channelId: string) {
  const [peers, setPeers] = useState<Peer[]>([])

  useEffect(() => {
    const socket = connect(\`/ws/\${channelId}\`)
    socket.on("presence", setPeers)
    return () => socket.close()
  }, [channelId])

  return peers
}`,
    },
  },
];

export default function ChatPanel() {
  const [messages, setMessages] = React.useState<Message[]>(MOCK_MESSAGES);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      sender: "You",
      avatar: "ME",
      time: "Just now",
      isAI: false,
      content,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <MessageScrollerProvider autoScroll>
        <MessageScroller className="flex-1 min-h-0">
          <MessageScrollerViewport className="p-6">
            <div className="flex flex-col">
              <DaySeparator label="Today" />

              <MessageScrollerContent className="space-y-6">
                {messages.map((msg) => (
                  <ChatMessageItem key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </MessageScrollerContent>
            </div>
          </MessageScrollerViewport>

          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <ChatInputForm onSendMessage={handleSendMessage} />
    </div>
  );
}
