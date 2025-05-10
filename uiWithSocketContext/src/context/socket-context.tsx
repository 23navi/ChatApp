// socket-context.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = Socket | null;

const SocketContext = createContext<SocketContextType>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketIO = io("ws://127.0.0.1:3001", {
      withCredentials: true,
      reconnection: true,
      upgrade: true,
    });

    socketIO.on("connect", () => {
      console.log("🔌 Connected with socket id:", socketIO.id);
    });

    setSocket(socketIO);

    return () => {
      socketIO.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

// Custom hook
export const useSocket = () => {
  return useContext(SocketContext);
};
