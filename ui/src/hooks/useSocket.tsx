import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // connect to socket server
    const socketIO = io("ws://127.0.0.1:3001", {
      withCredentials: true,
      reconnection: true,
      upgrade: true,
    });

    socketIO.on("connect", () => {
      console.log(
        `Connected to socket server in the useSocket hook with socket id: ${socketIO.id}`
      );
    });

    setSocket(socketIO);

    // close socket connection
    return () => {
      socketIO.disconnect();
    };
  }, []);

  return socket;
};
