import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initStartupRecovery } from "./lib/startup-recovery";

// Initialize crash recovery before mounting
initStartupRecovery();

createRoot(document.getElementById("root")!).render(<App />);
