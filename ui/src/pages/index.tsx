import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

// Socket channels
// const NEW_MESSAGE_CHANNEL = "chat:new-message";
// const CONNECTION_COUNT_UPDATED_CHANNEL = "chat:connection-count-updated";

const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // connect to socket server
    const socketIO = io("ws://127.0.0.1:3001", {
      withCredentials: true,
      reconnection: true,
      upgrade: true,
    });
    setSocket(socketIO);

    // close socket connection
    return () => {
      socketIO.disconnect();
    };
  }, []);

  return socket;
};

export default function Home() {
  const socket = useSocket();

  useEffect(() => {
    // listen for events
    socket?.on("connect", () => {
      console.log("connected to websocket");
    });
  });
  return <h1>Hello</h1>;
}
