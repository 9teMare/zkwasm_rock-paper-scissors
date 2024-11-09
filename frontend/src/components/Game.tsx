import { LandmarkList, Results } from "@mediapipe/hands";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { detectGesture, Gesture } from "../detection/core/gesture-detector";
import { HandsEstimator } from "../detection/core/hands-estimator";
import { Game } from "../detection/game/game";
import { HandFigureScene } from "../detection/hand-figure/hand-figure-scene";
import { VideoScene } from "../detection/video/VideoScene";
import { cn } from "../lib/utils";
import { ShineBorder } from "./ui/ShineBorders";
import { PlayerContext } from "../provider/PlayerProvider";
import { Player } from "../../api";
import { RpcContext } from "../provider/RpcProvider";
import { useAccount, useSignMessage } from "wagmi";
import { add } from "three/webgpu";

function getElbowAngle(startMs: number) {
    const currentMs = new Date().getTime() - startMs;
    const cycles = currentMs / 1000;

    if (cycles > 3) {
        return 0;
    }

    const period = cycles % 1;
    const maxAngle = Math.PI / 6;

    return Math.abs(Math.sin(period * Math.PI)) * maxAngle;
}

export default function MainGame() {
    const { players, setPlayers } = useContext(PlayerContext);
    const { address } = useAccount();
    const rpc = useContext(RpcContext);

    const { signMessageAsync } = useSignMessage();

    const handCanvasRef = useRef<HTMLCanvasElement>(null);
    const [handsEstimator] = useState(new HandsEstimator());

    const [results, setResults] = useState<Results | null>(null);
    const [hand, setHand] = useState<LandmarkList | null>(null);
    const [pickedGesture, setPickedGesture] = useState<Gesture | null>(Gesture.Rock);
    const [gameStartTime, setGameStartTime] = useState<number | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [scene, setScene] = useState<HandFigureScene | null>(null);
    const [gameOutput, setGameOutput] = useState<string>("");
    const [score, setScore] = useState({ player: 0, game: 0 });

    const [moves, setMoves] = useState<number[]>([]);

    const [finalGameState, setFinalGameState] = useState<any>();

    const [isSettling, setIsSettling] = useState(false);

    const startGame = async () => {
        if (!game) return;
        const npc = new Player("233", "http://localhost:3000");
        await npc.register();

        const npcState = await npc.getState();
        setPlayers({ players: [...players!.players, npc], state: [...players!.state, npcState] });

        game.setGesture(Gesture.Unknown);
        game.start();
        setGameStartTime(new Date().getTime());
    };

    const signAndSettle = useCallback(async () => {
        const msg = await signMessageAsync({
            account: address,
            message: "zkRPS",
        });

        console.log(msg);

        if (rpc) {
            try {
                const gameState = await rpc!.queryState(msg.replace("0x", ""));
                console.log(gameState);
                setFinalGameState(gameState);
            } catch (e) {
                console.error("Failed to query state", e);
            }
        }
    }, [address, rpc]);

    const animate = useCallback(() => {
        requestAnimationFrame(animate);

        if (!scene || !gameStartTime) return;
        if (gameStartTime) {
            scene.setElbowAngle(getElbowAngle(gameStartTime));
        }
        scene.setGesture(pickedGesture);
        scene.update();
    }, [pickedGesture, gameStartTime, scene]);

    useEffect(() => {
        handsEstimator.addListener((r) => {
            setResults(r);
            const landmarks = r?.multiHandLandmarks[0];
            if (landmarks && game) {
                setHand(landmarks);
                const gesture = detectGesture(landmarks);
                game.setGesture(gesture);
            }
        });

        handsEstimator.start();

        return () => {
            handsEstimator.stop();
        };
    }, [game]);

    useEffect(() => {
        setGame(
            new Game(
                async (message) => {
                    {
                        setGameOutput(message);
                    }
                },
                async (result: number[]) => {
                    setMoves(result);
                },
                async (gesture) => {
                    setPickedGesture(gesture);
                },
                (playerWins, gameWins) => {
                    setScore({ player: playerWins, game: gameWins });
                }
            )
        );

        if (handCanvasRef.current) setScene(new HandFigureScene(handCanvasRef.current));
    }, []);

    useEffect(() => {
        animate();
    }, [animate]);

    useEffect(() => {
        async function settle() {
            if (isSettling || !players) return;
            setIsSettling(true);

            console.log(players);

            console.log(moves);

            console.log(players.players[0]);

            await players.players[0].makeMove(moves[0]);
            const playerState = await players?.players[0].getState();

            console.log(playerState);

            await players?.players[1].makeMove(moves[1]);
            const npcState = await players?.players[1].getState();

            console.log(npcState);

            setPlayers({ players: players!.players, state: [playerState, npcState] });

            signAndSettle();
        }

        if (moves.length === 2) {
            settle();
        }
    }, [moves, isSettling, signAndSettle]);

    return (
        <div className="flex flex-col w-full h-full justify-start items-center space-y-8">
            <h1 className="text-center space-y-2 font-bold text-5xl" id="game-output">
                {gameOutput ? <p>{gameOutput === "Unknown" ? "Failed to detect" : gameOutput}</p> : <p>Game waiting to be started</p>}
            </h1>

            {/* {moves.length !== 2 ? (
                <button className="btn btn-primary" onClick={startGame}>
                    Start Game
                </button>
            ) : (
                <button className="btn btn-primary" onClick={signAndSettle}>
                    Sign and Settle
                </button>
            )} */}
            <button className="btn btn-primary" onClick={startGame}>
                Start Game
            </button>

            <div className="flex w-full justify-center items-center space-x-4 relative">
                <div className="flex flex-col justify-center items-center">
                    {players?.state[0] && <div>You are in!</div>}

                    <VideoScene results={results} width={640} height={380} />
                </div>

                <ShineBorder
                    color="#2663ec"
                    borderWidth={5}
                    borderRadius={200}
                    className={cn("absolute bottom-0 bg-[#3c8ac4] left-[35%] rounded-full min-w-0 w-32", !gameStartTime && "hidden")}
                >
                    <h2 className="text-8xl">{score.player}</h2>
                </ShineBorder>
                <h1>VS</h1>

                <ShineBorder
                    color="#2663ec"
                    borderWidth={5}
                    borderRadius={200}
                    className={cn("absolute bottom-0 bg-[#3c8ac4] right-[35%] rounded-full min-w-0 w-32", !gameStartTime && "hidden")}
                >
                    <h2 className="text-8xl">{score.game}</h2>
                </ShineBorder>

                <canvas
                    className="rounded-full"
                    ref={handCanvasRef}
                    id="hand-figure-canvas"
                    width={640}
                    height={380}
                    style={{
                        width: "640px",
                        height: "380px",
                        backgroundColor: "#2663ec",
                        backgroundImage: "url('delphinus-lab.webp')",
                        backgroundSize: "cover",
                    }}
                />
            </div>
        </div>
    );
}
