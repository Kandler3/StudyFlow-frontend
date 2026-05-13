
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Tell Telegram the Mini App is ready — this ensures WebApp is fully initialised
// before we try to read initData in the auth flow.
if (window.Telegram?.WebApp?.ready) {
  window.Telegram.WebApp.ready();
}

createRoot(document.getElementById("root")!).render(<App />);
  