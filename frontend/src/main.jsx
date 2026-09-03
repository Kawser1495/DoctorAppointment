import { createRoot } from "react-dom/client";

import App from "./App";
import AuthProvider from "./context/AuthProvider";

import "./styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";

// ======================================================
// Pre-initialize ethereum to prevent extension conflicts
// ======================================================
if (typeof window !== "undefined") {
    if (!window.ethereum) {
        Object.defineProperty(window, "ethereum", {
            value: undefined,
            writable: true,
            configurable: true,
        });
    }

    // Suppress browser extension errors (MetaMask, etc)
    window.addEventListener("error", (event) => {
        if (event.message?.includes("Cannot redefine property: ethereum")) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    });
}

createRoot(
    document.getElementById("root")
).render(

    <AuthProvider>

        <App />

    </AuthProvider>

);