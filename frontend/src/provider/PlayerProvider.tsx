import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { Player } from "../../api";
import { useAccount } from "wagmi";
import { RpcContext } from "./RpcProvider";

interface PlayerState {
    play: number;
}

export const PlayerContext = createContext<{
    players: { players: Player[]; state: PlayerState[] } | undefined;
    setPlayers: Dispatch<SetStateAction<{ players: Player[]; state: PlayerState[] }>>;
}>({
    players: { players: [], state: [] },
    setPlayers: () => {},
});

export function timeout(delay: number) {
    return new Promise((res) => setTimeout(res, delay));
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const { isConnected, address } = useAccount();
    const [players, setPlayers] = useState<{ players: Player[]; state: PlayerState[] }>({ players: [], state: [] });

    useEffect(() => {
        async function register() {
            if (isConnected && address) {
                const player = new Player(address.replace("0x", ""), "http://localhost:3000");

                console.log(player);

                try {
                    const playerRegisterState = await player.register();
                    console.log("registering player: ", playerRegisterState);

                    const state = await player.getState();
                    setPlayers({ players: [player], state: [state as PlayerState] });
                } catch (e) {
                    console.error("Failed to register player", e);
                }
            }
        }

        register();
    }, [isConnected, address]);

    return <PlayerContext.Provider value={{ players: players, setPlayers: setPlayers }}>{children}</PlayerContext.Provider>;
}
