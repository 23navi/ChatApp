import { useSocket } from "@/hooks/useSocket";
import { useEffect } from "react";

// Socket channels
// const NEW_MESSAGE_CHANNEL = "chat:new-message";
// const CONNECTION_COUNT_UPDATED_CHANNEL = "chat:connection-count-updated";

export default function Home() {
  const socket = useSocket();
  const socket2 = useSocket();

  useEffect(() => {
    if (!socket) return;
    if (!socket2) return;
    const handleConnect = () => {
      console.log("connected to websocket", socket.id);
    };
    const handleConnect2 = () => {
      console.log("connected to websocket 2", socket2.id);
    };

    socket.on("connect", handleConnect);

    socket2.on("connect", handleConnect2);

    socket.on("disconnect", () => {
      console.log("disconnected from websocket");
    });

    console.log("Current connect listeners:", socket.listeners("connect"));

    console.log("Current connect listeners 2:", socket2.listeners("connect"));

    // Clean up the listener on unmount or socket change
    return () => {
      socket.off("connect", handleConnect); // Which ever listeners we add, we should remove them on component unmount
      socket.off("disconnect");
    };
  }, [socket, socket2]);
  return <h1>Hello</h1>;
}
