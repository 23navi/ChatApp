## Using socketio with React


It is very important to understand how to implement socketio with react and react is state based and socket io is event based (event listeners)

We have two part to sockets

1) Connection of socket itself 
2) Adding listeners to socket

We should have one socket connection for the app (each socket namespace, if we are using multiple namespaces.)

We should make sure that on component mounting and unmounting is handled to make sure that listeners are not duplicated.

When using useEffect to mount the listener on socket, we should use the cleanup function to remove the listener



### Use of namespaces
Say we are different usecase of sockets on client, eg: chat system, notification system, realtime dashboard.

For each system, we will create a new namespace.


```ts
// ChatSocketContext.tsx
const ChatSocketContext = createContext<Socket | null>(null);

export const ChatSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const chatSocket = io("ws://localhost:3001/chat");

    chatSocket.on("connect", () => {
      console.log("Chat socket connected:", chatSocket.id);
    });

    setSocket(chatSocket);

    return () => {
      chatSocket.disconnect();
    };
  }, []);

  return (
    <ChatSocketContext.Provider value={socket}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export const useChatSocket = () => useContext(ChatSocketContext);
```

---

```ts
// App.tsx
import React from "react";
import { ChatSocketProvider } from "./contexts/ChatSocketContext";
import { NotificationSocketProvider } from "./contexts/NotificationSocketContext";
import MainLayout from "./MainLayout";

function App() {
  return (
    <ChatSocketProvider>
      <NotificationSocketProvider>
        <MainLayout />
      </NotificationSocketProvider>
    </ChatSocketProvider>
  );
}

export default App;
```

```ts
//ChatRoom.tsx
import { useChatSocket } from "../contexts/ChatSocketContext";

export function ChatRoom() {
  const socket = useChatSocket();

  useEffect(() => {
    if (!socket) return;
    socket.emit("join-room", "general");
  }, [socket]);

  return <div>Chat UI</div>;
}
```





Note: We can abstract the socket context creation logic 


```ts
//CreateSocketContext.tsx
export const createSocketContext = (namespace: string) => {
  const Context = createContext<Socket | null>(null);

  const Provider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
      const nsSocket = io(`ws://localhost:3001/${namespace}`);
      setSocket(nsSocket);

      return () => nsSocket.disconnect();
    }, []);

    return <Context.Provider value={socket}>{children}</Context.Provider>;
  };

  const useSocket = () => useContext(Context);

  return { Provider, useSocket };
};
```



### Use of rooms

Say we are in a chat system, so using different rooms for different group is better, we can use different room for 2 person chat too.

We can have single unnamed room and use the filtereing on client for all incoming messages but using the rooms is a better model.



Client room setup

```ts
socket.emit("join-room", "room123");

socket.on("room123:message", (msg) => {
  // handle message for room123
});
```
Note: room123:message on client says (room name and on message event, but on client we have different syntax for sending message to a room)

```ts
// Send message to a prarticular room
io.to("room123").emit("message", ...)
```




Server room setup

```ts
socket.on("join-room", (room) => {
  socket.join(room);
});

socket.on("chat:message", ({ room, message }) => {
  io.to(room).emit(`${room}:message`, message);
});
```


---

### How to manage multiple rooms on backend.

So there can be multiple of chats for each client, and on server, we can't have soo many

```ts
socket.on("roomId:message",(payload)=>{})
```

So we will follow this other pattern


```ts
// Client
socket.emit("private-message", { roomId: "alice:bob", message: "Hi Bob!" });

socket.on("alice:bob:message", (message) => {
  console.log("Message received for this chat:", message);
});
```

```ts
// Server
socket.on("private-message", ({ roomId, message }) => {
  io.to(roomId).emit(`${roomId}:message`, message);
});
```

So if we see carefully, on the server, for all private message we only have one listener, "private-message", and it's the duty of client to send the message with the roomId

But the server will send the message to particular room 

Now client won't have to filter the message, and this is great for new message pop up on client.

How will client manage soo many rooms?

I don't think there is any good way, but we have have initial api call to get top chats, is chats where last message timestamp is new.

Then join room for each chat in that list.

Now what about getting new message in chat which was not joined by the client?

We can have a notifier event that will give message preview and also tell the client to join the group.