"use client";

import * as React from "react";
import {
  Paperclip,
  AtSign,
  Smile,
  Sparkles,
  SendHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageScrollerItem } from "@/components/ui/message-scroller";

// Types
export interface CodeBlock {
  filename: string;
  code: string;
}

export interface Message {
  id: string;
  sender: string;
  avatar: string;
  time: string;
  isAI: boolean;
  content: string;
  codeBlock?: CodeBlock;
}

// 1. Day Separator
export function DaySeparator({ label }: { label: string }) {
  return (
    <div className="relative flex items-center justify-center my-2">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <span className="relative bg-background px-3 text-xs text-muted-foreground font-medium">
        {label}
      </span>
    </div>
  );
}

// 2. Individual Message Item
export function ChatMessageItem({ message }: { message: Message }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MessageScrollerItem
      messageId={message.id}
      scrollAnchor={!message.isAI}
      className="flex items-start gap-4 group"
    >
      <div className="size-9 rounded-lg bg-muted border flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-sm">
        {message.avatar}
      </div>

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm text-foreground">
            {message.sender}
          </span>
          {message.isAI && (
            <span className="bg-primary/10 text-primary border border-primary/20 rounded text-[10px] px-1 font-bold tracking-wide flex items-center gap-0.5">
              <Sparkles className="size-2.5 fill-primary" /> AI
            </span>
          )}
          <span className="text-[11px] text-muted-foreground font-medium">
            {message.time}
          </span>
        </div>

        <p className="text-sm text-muted-foreground/90 leading-relaxed break-words whitespace-pre-wrap">
          {message.content}
        </p>

        {message.codeBlock && (
          <div className="mt-3 rounded-xl border bg-zinc-950 text-zinc-50 overflow-hidden font-mono text-sm max-w-2xl shadow-md">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  <span className="size-2.5 rounded-full bg-zinc-700" />
                  <span className="size-2.5 rounded-full bg-zinc-700" />
                  <span className="size-2.5 rounded-full bg-zinc-700" />
                </div>
                <span className="ml-2 font-medium">
                  {message.codeBlock.filename}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyCode(message.codeBlock!.code)}
                className="h-6 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-xs gap-1"
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <pre className="p-4 overflow-x-auto leading-relaxed text-zinc-300">
              <code>{message.codeBlock.code}</code>
            </pre>
          </div>
        )}
      </div>
    </MessageScrollerItem>
  );
}

// 3. Chat Input Bar
export function ChatInputForm({
  onSendMessage,
  placeholder = "Message #product-design",
}: {
  onSendMessage: (content: string) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-6 py-6 shrink-0 sticky bg-background bottom-0 border-t border-border">
      <form
        onSubmit={handleSubmit}
        className="border rounded-xl bg-muted/20 focus-within:ring-1 focus-within:ring-ring transition-all p-2 flex flex-col gap-2"
      >
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
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
  );
}
