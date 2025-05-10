import { useState } from "react";
import Home from "./../components/global/Home"; // Assuming your Home component is in the same directory

export default function App() {
  const [showHome, setShowHome] = useState(true);

  return (
    <div>
      <button onClick={() => setShowHome((prev) => !prev)}>Toggle Home</button>
      {showHome && <Home />}
    </div>
  );
}
