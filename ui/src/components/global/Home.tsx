import { useSocket } from "@/hooks/useSocket";
import { FormEvent, useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

// Socket channels
// const NEW_MESSAGE_CHANNEL = "chat:new-message";
// const CONNECTION_COUNT_UPDATED_CHANNEL = "chat:connection-count-updated";

export default function Home() {
  const socket = useSocket();

  const [newMessage, setNewMessage] = useState("");

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    console.log(newMessage);

    setNewMessage("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <Textarea
        className="rounded-lg mr-4"
        placeholder="Tell is what's on your mind"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        maxLength={255}
      />

      <Button className="h-full">Send message</Button>
    </form>
  );
}

// In the above useEffect, we have 3 different dependency management

// 1) useEffect(() => { ... }, [socket])   - Best: run the effect when the component mounts, and any time the socket value changes.
// 2) useEffect(() => { ... }, [])    - Won't work if the socket was null on first render (run the effect only once when the component mounts — and never again, regardless of changes to socket)
// 3) useEffect(() => { ... }) -  Run the effect after every render, including initial render and every subsequent re-render.
