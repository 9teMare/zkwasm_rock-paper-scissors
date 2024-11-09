//import initHostBind, * as hostbind from "./wasmbind/hostbind.js";
//import initHostBind, * as hostbind from "./wasmbind/hostbind.js";
import { Player } from "./api.js";
let account = "c09827893F5bda7feCB9BF1e0594e1453F7a61Cd";
let account2 = "233";

let player = new Player(account, "http://localhost:3000");
let player2 = new Player(account2, "http://localhost:3000");

async function main() {
    //let towerId = 10038n + y;
    let state = await player.getState();
    console.log(state);
    state = await player.register();
    console.log(state);

    state = await player2.register();
    console.log(state);

    state = await player.makeMove(0);
    console.log(state);
    state = await player2.makeMove(1);
    console.log(state);
}

main();
