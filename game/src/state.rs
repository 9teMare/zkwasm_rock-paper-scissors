use wasm_bindgen::prelude::*;
use zkwasm_rust_sdk::require;
use zkwasm_rust_sdk::wasm_input;

enum RockPaperScissors {
    None = -1,
    Rock = 0,
    Paper = 1,
    Scissors = 2,
}

enum Player {
    Player1 = 0,
    Player2 = 1,
}

static mut STATE: (i8, i8) = (RockPaperScissors::None as i8, RockPaperScissors::None as i8);

#[wasm_bindgen]
pub fn get_state() -> String {
    unsafe { format!("({}, {})", STATE.0, STATE.1) }
}

#[wasm_bindgen]
pub fn perform_command(player: i8, play: i8) {
    unsafe {
        if player == Player::Player1 as i8 {
            STATE.0 = play;
        } else if player == Player::Player2 as i8 {
            STATE.1 = play;
        }
    }
}

#[wasm_bindgen]
pub fn who_wins() -> i8 {
    unsafe {
        if STATE.0 == RockPaperScissors::None as i8 || STATE.1 == RockPaperScissors::None as i8 {
            return -1;
        }

        if STATE.0 == STATE.1 {
            return 0;
        }

        if STATE.0 == RockPaperScissors::Rock as i8 && STATE.1 == RockPaperScissors::Scissors as i8
        {
            return Player::Player1 as i8;
        }

        if STATE.0 == RockPaperScissors::Scissors as i8 && STATE.1 == RockPaperScissors::Paper as i8
        {
            return Player::Player1 as i8;
        }

        if STATE.0 == RockPaperScissors::Paper as i8 && STATE.1 == RockPaperScissors::Rock as i8 {
            return Player::Player1 as i8;
        }

        return Player::Player2 as i8;
    }
}

#[wasm_bindgen]
pub fn zkmain() {
    zkwasm_rust_sdk::dbg!("generating zkwasm");

    unsafe {
        let result: u64 = wasm_input(1);
        let input_len: u64 = wasm_input(1);
        let mut cursor: u64 = 0;

        require(input_len == 2);

        while cursor < input_len {
            let encoded = wasm_input(0);

            perform_command(cursor as i8, encoded as i8);
            cursor += 1;
        }

        let winner = who_wins();
        zkwasm_rust_sdk::wasm_dbg(winner as u64);

        let c: bool = result == winner as u64;

        let winner_str = match winner {
            -1 => "None",
            0 => "Tie",
            1 => "Player1",
            2 => "Player2",
            _ => "Unknown",
        };

        zkwasm_rust_sdk::wasm_dbg_str(&winner_str);
        require(c);
    }
}
