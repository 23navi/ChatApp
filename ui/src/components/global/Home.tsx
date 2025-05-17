import { useSocket } from "@/hooks/useSocket";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Message } from "@/type";

// Socket channels
const NEW_MESSAGE_CHANNEL = "chat:new-message";
// const CONNECTION_COUNT_UPDATED_CHANNEL = "chat:connection-count-updated";

export default function Home() {
  const socket = useSocket();

  const messageListRef = useRef<HTMLOListElement | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [connectionCount] = useState(0);
  const [messages, setMessages] = useState<Array<Message>>([]);

  function scrollToBottom() {
    if (messageListRef.current) {
      messageListRef.current.scrollTop =
        messageListRef.current.scrollHeight + 1000;
    }
  }

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("connected to websocket", socket.id);
    };

    socket.on("connect", handleConnect);

    socket?.on(NEW_MESSAGE_CHANNEL, (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);

      //Wrapping scrollToBottom() in a setTimeout(() => { ... }, 0) is a common workaround to make sure the DOM is updated before you try to scroll.
      // React has a hook called useLayoutEffect, which runs after DOM mutations but before painting. You could track messages and scroll
      // useLayoutEffect(() => {
      //   scrollToBottom();
      // }, [messages]);
      setTimeout(() => {
        scrollToBottom();
      }, 0);
    });

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

    // When we are here, we are not sure if the socket is connected or not, we need to handle this in a better way, we can have a state which keeps a track of socket connection and disable the input button and also show a connecting ui loader.
    socket?.emit(NEW_MESSAGE_CHANNEL, {
      message: newMessage,
    });
    // We are emitting object {message: "message"}, it will go as json and our backend can parse it nicely.

    setNewMessage("");
  }

  console.log({ messagesOutsideUseEffect: messages });
  return (
    <main className="flex flex-col p-4 w-full max-w-3xl m-auto">
      <h1 className="text-4xl font-bold text-center mb-4">
        Chat ({connectionCount})
      </h1>
      <ol
        className="flex-1 overflow-y-scroll overflow-x-hidden"
        ref={messageListRef}
      >
        {messages.map((m) => {
          return (
            <li
              className="bg-gray-100 rounded-lg p-4 my-2 break-all"
              key={m.id}
            >
              <p className="text-small text-gray-500">{m.createdAt}</p>
              <p className="text-small text-gray-500">{m.port}</p>
              <p>{m.message}</p>
            </li>
          );
        })}
      </ol>
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
    </main>
  );
}

// In the above useEffect, we have 3 different dependency management

// 1) useEffect(() => { ... }, [socket])   - Best: run the effect when the component mounts, and any time the socket value changes.
// 2) useEffect(() => { ... }, [])    - Won't work if the socket was null on first render (run the effect only once when the component mounts — and never again, regardless of changes to socket)
// 3) useEffect(() => { ... }) -  Run the effect after every render, including initial render and every subsequent re-render.

// Note: we have two disconnect with socket socket.disconnect() and socket.on("disconnect")
// socket.disconnect() is a method to disconnect from the react side
// socket.on("disconnect") is an event listener which react which there is disconnect on the client side.
