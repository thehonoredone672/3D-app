import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

// GitHub Pages serves this as static files with no server-side rewrites,
// so a deep link would 404 on refresh under BrowserRouter. HashRouter keeps
// routing entirely client-side.
const Router = import.meta.env.VITE_USE_HASH_ROUTER === "true" ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
