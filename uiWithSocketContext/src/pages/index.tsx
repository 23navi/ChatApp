// App.tsx or main layout file
import React from "react";
import { SocketProvider } from "../context/socket-context";
import Home from "../components/global/Home";

export default function App() {
  return (
    <SocketProvider>
      <Home />
    </SocketProvider>
  );
}
