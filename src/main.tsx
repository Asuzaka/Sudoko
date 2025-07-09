import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  // remove strict mode in production
  <StrictMode>
    <App />
  </StrictMode>
);
