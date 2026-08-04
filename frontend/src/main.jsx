import { createRoot } from "react-dom/client";

import App from "./App";
import AuthProvider from "./context/AuthProvider";

import "./styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";

createRoot(document.getElementById("root")).render(

    <AuthProvider>

        <App />

    </AuthProvider>

);