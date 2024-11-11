# zkRPS

## Introduction
zkRockPaperScissors (zkRPS) is your not traditional family friendly Rock Paper Scissors game, we made it a trillion times more fun!

We support both PVP and PVE mode, with computer vision baked into the game, which takes real time recognition with mediapipe from the video camera, play the game with actual human touch! Game logic is executed with zkWASM, with input playback to securely verify the game result.

Team introduction: Yasmin is a professional product manager, she is able to pinpoint industry opportunities and convert it into actionable plans. 0x9te is a professional full-stack software engineer, cloud engineer and blockchain engineer, he is proficient with his toolsets and has built many interesting stuff. Together they have won quite a number of hackathon titles.


## Project structure
1. `frontend` - core frontend logic of the game, including hand gesture detection with on device ML
2. `rock-paper-scissors-rollup` - core game logic, including the node RPC server
3. `zkwasm-mini-rollup` - a [submodule](https://github.com/DelphinusLab/zkwasm-mini-rollup) added for convenience, used for setting up the zkWASM rollup
