import { createContext, useEffect, useState } from "react";
import { ZKWasmAppRpc } from "zkwasm-ts-server";

export const RpcContext = createContext<ZKWasmAppRpc | undefined>(undefined);

export function RpcProvider({ children }: { children: React.ReactNode }) {
    const [rpc, setRpc] = useState<ZKWasmAppRpc | undefined>(undefined);

    useEffect(() => {
        const rpc = new ZKWasmAppRpc("http://localhost:3000");
        setRpc(rpc);
    }, []);

    return <RpcContext.Provider value={rpc}>{children}</RpcContext.Provider>;
}
