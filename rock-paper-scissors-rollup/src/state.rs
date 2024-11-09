use crate::settlement::SettlementInfo;
use crate::StorageData;
use core::slice::IterMut;
use serde::Serialize;
use zkwasm_rest_abi::Player;

enum RockPaperScissors {
    None = -1,
    Rock = 0,
    Paper = 1,
    Scissors = 2,
}

#[derive(Debug, Serialize)]
pub struct PlayerData {
    pub play: i8,
}

impl Default for PlayerData {
    fn default() -> Self {
        Self {
            play: RockPaperScissors::None as i8,
        }
    }
}

impl StorageData for PlayerData {
    fn from_data(u64data: &mut IterMut<u64>) -> Self {
        let play = *u64data.next().unwrap() as i8;
        PlayerData { play }
    }
    fn to_data(&self, data: &mut Vec<u64>) {
        data.push(self.play as u64);
    }
}

pub type RockPaperScissorsPlayer = Player<PlayerData>;

#[derive(Serialize)]
pub struct State {
    counter: u64,
    // play: i8,
    player1_move: i8,
    player2_move: i8,
}

impl State {
    pub fn get_state(pkey: Vec<u64>) -> String {
        let player = RockPaperScissorsPlayer::get_from_pid(&RockPaperScissorsPlayer::pkey_to_pid(
            &pkey.try_into().unwrap(),
        ));
        serde_json::to_string(&player).unwrap()
    }

    pub fn rand_seed() -> u64 {
        0
    }

    pub fn store(&self) {}

    pub fn initialize() {}

    pub fn new() -> Self {
        State {
            // play: RockPaperScissors::None as i8,
            counter: 0,
            player1_move: RockPaperScissors::None as i8,
            player2_move: RockPaperScissors::None as i8,
        }
    }

    pub fn snapshot() -> String {
        let state = unsafe { &STATE };
        serde_json::to_string(&state).unwrap()
    }

    pub fn preempt() -> bool {
        let state = unsafe { &STATE };
        return state.player1_move != RockPaperScissors::None as i8
            && state.player2_move != RockPaperScissors::None as i8;
    }

    pub fn flush_settlement() -> Vec<u8> {
        let data = SettlementInfo::flush_settlement();
        unsafe { STATE.store() };
        data
    }

    pub fn tick(&mut self) {
        self.counter += 1;
    }
}

pub static mut STATE: State = State {
    counter: 0,
    player1_move: RockPaperScissors::None as i8,
    player2_move: RockPaperScissors::None as i8,
};

pub struct Transaction {
    pub command: u64,
    pub data: Vec<u64>,
}

const AUTOTICK: u64 = 0;
const INSTALL_PLAYER: u64 = 1;
const MAKE_PLAY: u64 = 2;
const UNINSTALL_PLAYER: u64 = 3;

const ERROR_PLAYER_ALREADY_EXIST: u32 = 1;
const ERROR_PLAYER_NOT_EXIST: u32 = 2;

impl Transaction {
    pub fn decode_error(e: u32) -> &'static str {
        match e {
            ERROR_PLAYER_NOT_EXIST => "PlayerNotExist",
            ERROR_PLAYER_ALREADY_EXIST => "PlayerAlreadyExist",
            _ => "Unknown",
        }
    }
    pub fn decode(params: [u64; 4]) -> Self {
        let command = params[0] & 0xff;
        let data = vec![params[1], params[2], params[3]]; // pkey[0], pkey[1], amount
        Transaction { command, data }
    }
    pub fn install_player(&self, pkey: &[u64; 4]) -> u32 {
        zkwasm_rust_sdk::dbg!("install \n");
        let pid = RockPaperScissorsPlayer::pkey_to_pid(pkey);
        let player = RockPaperScissorsPlayer::get_from_pid(&pid);
        match player {
            Some(_) => ERROR_PLAYER_ALREADY_EXIST,
            None => {
                let player = RockPaperScissorsPlayer::new_from_pid(pid);
                player.store();
                0
            }
        }
    }

    pub fn make_play(&self, _pkey: &[u64; 4]) -> u32 {
        // let player = RockPaperScissorsPlayer::get(pkey);
        let pid = RockPaperScissorsPlayer::pkey_to_pid(_pkey);
        let player = RockPaperScissorsPlayer::get_from_pid(&pid);

        match player {
            Some(mut player) => {
                let play = self.data[0] as i8;
                if play < RockPaperScissors::None as i8 || play > RockPaperScissors::Scissors as i8
                {
                    return 0;
                }
                player.data.play = play;

                unsafe {
                    if STATE.player1_move == RockPaperScissors::None as i8 {
                        STATE.player1_move = play;
                    } else if STATE.player1_move != RockPaperScissors::None as i8
                        && STATE.player2_move == RockPaperScissors::None as i8
                    {
                        STATE.player2_move = play;
                    }
                }

                player.store();

                return 0;
            }
            None => return ERROR_PLAYER_NOT_EXIST,
        }
    }

    pub fn process(&self, pkey: &[u64; 4], _rand: &[u64; 4]) -> u32 {
        match self.command {
            AUTOTICK => {
                unsafe { STATE.tick() };
                return 0;
            }
            INSTALL_PLAYER => self.install_player(pkey),
            MAKE_PLAY => self.make_play(pkey),
            _ => return 0,
        }
    }
}
