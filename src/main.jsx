import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

import { StateContextProvider } from "./context";
import App from "./App";
import "./index.css";

// -----------------------------------------------------------------------------
// Clerk configuration
// -----------------------------------------------------------------------------
// Prefer VITE_ prefixed env; fall back to the NEXT_PUBLIC_ name from the memo.
const CLERK_PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_c2F2ZWQtdW5pY29ybi04MC5jbGVyay5hY2NvdW50cy5kZXYk";

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Clerk publishable key. Set VITE_CLERK_PUBLISHABLE_KEY in your env.",
  );
}

// Note: Response.headers protection is now in index.html as an inline script
// that runs before any modules load, to catch initialization errors

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/login">
    <Router>
      <StateContextProvider>
        <App />
      </StateContextProvider>
    </Router>
  </ClerkProvider>,
);
