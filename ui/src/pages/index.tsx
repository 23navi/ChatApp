import { useState } from "react";
import Home from "./../components/global/Home";

export default function App() {
  const [showHome, setShowHome] = useState(true);

  return (
    <div>
      <button onClick={() => setShowHome((prev) => !prev)}>Toggle Home</button>
      {showHome && <Home />}
    </div>
  );
}
