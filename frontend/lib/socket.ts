import { io } from "socket.io-client";
import { env } from "@/config/env";

let socket: ReturnType<typeof io>;

export const getSocket = (token?: string) => {
  if (!socket) {
    socket = io(env.SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = undefined as any;
  }
};