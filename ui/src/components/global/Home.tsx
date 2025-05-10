import { useSocket } from "@/hooks/useSocket";
import { useEffect } from "react";

// Socket channels
// const NEW_MESSAGE_CHANNEL = "chat:new-message";
// const CONNECTION_COUNT_UPDATED_CHANNEL = "chat:connection-count-updated";

export default function Home() {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("connected to websocket", socket.id);
    };

    socket.on("connect", handleConnect);

    socket.on("disconnect", () => {
      console.log("disconnected from websocket");
    });

    console.log("Current connect listeners:", socket.listeners("connect"));

    // Clean up the listener on unmount or socket change
    return () => {
      socket.off("connect", handleConnect); // Which ever listeners we add, we should remove them on component unmount
      socket.off("disconnect");
    };
  }, [socket]);
  return <h1>Hello</h1>;
}
