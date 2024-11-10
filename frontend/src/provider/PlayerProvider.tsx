import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { Player } from "../../api";
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
    const { signMessageAsync } = useSignMessage();

    useEffect(() => {
        async function register() {
            if (isConnected && address) {
                // const msg = await signMessageAsync({
                //     account: address,
                //     message: `Sign in to zkRPS`,
                // });

                const player = new Player(address.replace("0x", ""), "http://localhost:3000");
                const npc = new Player("233", "http://localhost:3000");

                console.log("Player: ", player, "NPC: ", npc);

                try {
                    const playerRegisterState = await player.register();
                    console.log("registering player: ", playerRegisterState);

                    const npcRegisterState = await npc.register();
                    console.log("registering npc: ", npcRegisterState);

                    const playerState = await player.getState();
                    const npcState = await npc.getState();

                    setPlayers({ players: [player, npc], state: [playerState as PlayerState, npcState as PlayerState] });
                } catch (e) {
                    console.error("Failed to register player", e);
                }
            }
        }

        register();
    }, [isConnected, address]);

    return <PlayerContext.Provider value={{ players: players, setPlayers: setPlayers }}>{children}</PlayerContext.Provider>;
}
