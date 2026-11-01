import { Button } from "@/components/ui/button";
import {
  AtSign,
  Paperclip,
  SendHorizontal,
  Smile,
  Sparkles,
} from "lucide-react";
import React from "react";

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
