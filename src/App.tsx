import MainGame from "./components/Game";
import { ShineBorder } from "./components/ui/ShineBorders";

function App() {
    return (
        <ShineBorder className="flex flex-col w-screen h-screen px-6 pt-14" color={["#fee99a", "#2663ec"]} borderWidth={15} borderRadius={0}>
            <div className="flex w-full justify-between items-center">
                <div className="w-fit">
                    <img src="dolphin.png" alt="Dolphin" className="w-20 h-20 absolute top-4 left-6" />
                    <h1 className="text-center">=Delphinuslab=</h1>
                    <h2 className="w-full text-justify text-2xl after:content-[''] after:inline-block after:w-full after:h-0 text-accent">
                        {`zkWASM::{Rock, Paper, Scissors}`}
                    </h2>
                </div>
            </div>

            <MainGame />

            <img src="wave.png" alt="Wave" className="w-full h-auto absolute left-0 bottom-0 right-0" />
        </ShineBorder>
    );
}

export default App;
