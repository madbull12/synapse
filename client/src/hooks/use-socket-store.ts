import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketStore } from "@/store/use-socket-store";

export function useChannelSocket(channelId: string, token: string) {
  const queryClient = useQueryClient();
  const { socket, isConnected, setSocket } = useSocketStore();

  useEffect(() => {
    if (!channelId || !token) return;

    const wsUrl = `ws://localhost:8080/api/v1/channels/${channelId}/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setSocket(ws, true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.event === "new_message") {
          const newMessage = payload.data;

          queryClient.setQueryData(
            ["messages", channelId],
            (oldMessages: any[] | undefined) => {
              if (!oldMessages) return [newMessage];
              if (oldMessages.some((m) => m.id === newMessage.id))
                return oldMessages;
              return [...oldMessages, newMessage];
            },
          );
        }
      } catch (err) {
        console.error("Failed to parse WS payload:", err);
      }
    };

    ws.onclose = () => {
      setSocket(null, false);
    };

    ws.onerror = () => {
      ws.close();
    };

    return () => {
      ws.close();
      setSocket(null, false);
    };
  }, [channelId, token, queryClient, setSocket]);

  return { isConnected };
}
