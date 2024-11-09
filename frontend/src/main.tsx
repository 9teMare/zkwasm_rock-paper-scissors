import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppKitProvider } from "./provider/AppKitProvider.tsx";
import { PlayerProvider } from "./provider/PlayerProvider.tsx";
import { RpcProvider } from "./provider/RpcProvider.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AppKitProvider>
            <RpcProvider>
                <PlayerProvider>
                    <App />
                </PlayerProvider>
            </RpcProvider>
        </AppKitProvider>
    </StrictMode>
);
