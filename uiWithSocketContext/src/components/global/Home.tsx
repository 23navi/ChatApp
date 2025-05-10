// Home.tsx
import React, { useEffect } from "react";
import { useSocket } from "../../context/socket-context";

export default function Home() {
  const socket = useSocket();
  const socket2 = useSocket();

  useEffect(() => {
    if (!socket) return;
    if (!socket2) return;

    const handleConnect = () => {
      console.log("🏠 Home connected to socket 1:", socket.id);
    };

    const handleConnect2 = () => {
      console.log("🏠 Home connected to socket 2:", socket2.id);
    };

    const handleDisconnect = () => {
      console.log("🏠 Home disconnected from socket");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket2.on("connect", handleConnect2);
    socket2.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket2.off("connect", handleConnect2);
      socket2.off("disconnect", handleDisconnect);
    };
  }, [socket, socket2]);

  return <h1>Hello from Home</h1>;
}
