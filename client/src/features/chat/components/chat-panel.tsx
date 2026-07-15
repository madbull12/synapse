"use client";

import * as React from "react";
import {
  MessageSquare,
  Paperclip,
  AtSign,
  Smile,
  Sparkles,
  SendHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

const MOCK_MESSAGES = [
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
  const [messages, setMessages] = React.useState(MOCK_MESSAGES);
  const [inputValue, setInputValue] = React.useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      id: `m-${Date.now()}`,
      sender: "You",
      avatar: "ME",
      time: "Just now",
      isAI: false,
      content: inputValue,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
  };

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <MessageScrollerProvider autoScroll>
        <MessageScroller className="flex-1 min-h-0">
          <MessageScrollerViewport className="p-6">
            <div className=" flex  flex-col ">
              {/* Optional Day Separator Line */}
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <span className="relative bg-background px-3 text-xs text-muted-foreground font-medium">
                  Today
                </span>
              </div>

              <MessageScrollerContent className="space-y-6">
                {messages.map((msg) => (
                  <MessageScrollerItem
                    key={msg.id}
                    messageId={msg.id}
                    scrollAnchor={!msg.isAI}
                    className="flex items-start gap-4 group"
                  >
                    <div className="size-9 rounded-lg bg-muted border flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-sm">
                      {msg.avatar}
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {msg.sender}
                        </span>
                        {msg.isAI && (
                          <span className="bg-primary/10 text-primary border border-primary/20 rounded text-[10px] px-1 font-bold tracking-wide flex items-center gap-0.5">
                            <Sparkles className="size-2.5 fill-primary" /> AI
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {msg.time}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground/90 leading-relaxed break-words whitespace-pre-wrap">
                        {msg.content}
                      </p>

                      {msg.codeBlock && (
                        <div className="mt-3 rounded-xl border bg-zinc-950 text-zinc-50 overflow-hidden font-mono text-sm max-w-2xl shadow-md">
                          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400">
                            <div className="flex items-center gap-1.5">
                              <div className="flex gap-1">
                                <span className="size-2.5 rounded-full bg-zinc-700" />
                                <span className="size-2.5 rounded-full bg-zinc-700" />
                                <span className="size-2.5 rounded-full bg-zinc-700" />
                              </div>
                              <span className="ml-2 font-medium">
                                {msg.codeBlock.filename}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-xs gap-1"
                            >
                              Copy
                            </Button>
                          </div>
                          <pre className="p-4 overflow-x-auto leading-relaxed text-zinc-300">
                            <code>{msg.codeBlock.code}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </div>
          </MessageScrollerViewport>

          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="px-6 pb-6 shrink-0">
        <form
          onSubmit={handleSendMessage}
          className="border rounded-xl bg-muted/20 focus-within:ring-1 focus-within:ring-ring transition-all p-2 flex flex-col gap-2"
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Message #product-design"
            className="w-full bg-transparent resize-none outline-none px-3 py-2 text-sm max-h-32"
            rows={1}
          />
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <Paperclip className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <AtSign className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <Smile className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="size-4" />
              </Button>
            </div>
            <Button
              type="submit"
              size="icon"
              className="size-8 rounded-lg shrink-0"
              disabled={!inputValue.trim()}
            >
              <SendHorizontal className="size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
