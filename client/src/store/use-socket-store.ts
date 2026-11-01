import { create } from "zustand";

interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  setSocket: (socket: WebSocket | null, isConnected: boolean) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  isConnected: false,
  setSocket: (socket, isConnected) => set({ socket, isConnected }),
}));
