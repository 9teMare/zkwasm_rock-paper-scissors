import { createAppKit } from "@reown/appkit/react";

import { WagmiProvider } from "wagmi";
import { arbitrum, mainnet, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://cloud.reown.com
const projectId = "681fa31c6f87ac826b5bb9a98d1a202b";

// 2. Create a metadata object - optional
const metadata = {
    name: "zkRPS",
    description: "AppKit Example",
    url: "https://reown.com/appkit", // origin must match your domain & subdomain
    icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

// 3. Set the networks
const networks = [mainnet, sepolia];

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    ssr: true,
});

// 5. Create modal
createAppKit({
    adapters: [wagmiAdapter],
    networks: [networks[1]], // Convert networks array to tuple with first element
    projectId,
    metadata,
    features: {
        analytics: true, // Optional - defaults to your Cloud configuration
    },
});

export function AppKitProvider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    );
}
