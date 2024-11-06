import { useEffect, useRef } from "react";
import { HAND_CONNECTIONS, Results } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

interface VideoSceneProps {
    results: Results | null;
    width?: number;
    height?: number;
}

export const VideoScene: React.FC<VideoSceneProps> = ({ results, width = 640, height = 480 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestIdRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const canvasCtx = canvas.getContext("2d")!;

        const render = () => {
            // Clear the canvas before drawing
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            if (results) {
                // Draw the video frame
                canvasCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

                // Draw hand landmarks if detected
                if (results.multiHandLandmarks[0]) {
                    canvasCtx.save(); // Save the current state
                    canvasCtx.globalCompositeOperation = "source-over";

                    drawConnectors(canvasCtx, results.multiHandLandmarks[0], HAND_CONNECTIONS, { color: "#0000ff", lineWidth: 0.2 });

                    drawLandmarks(canvasCtx, results.multiHandLandmarks[0], { color: "#00ff00", radius: 0.5 });

                    canvasCtx.restore(); // Restore to previous state
                }
            }

            // Schedule the next frame
            requestIdRef.current = requestAnimationFrame(render);
        };

        render();

        // Cleanup
        return () => {
            if (requestIdRef.current) {
                cancelAnimationFrame(requestIdRef.current);
            }
        };
    }, [results]); // Re-run effect when results change

    return <canvas className="rounded-full" ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
