// Define the game configuration using the turbo::cfg! macro
turbo::cfg! {r#"
    name = "Paper Scissors Stone PvP"
    version = "1.0.0"
    author = "Turbo"
    description = "PvP Paper-Scissors-Stone game!"
    [settings]
    resolution = [320, 240]
"#}

// Define the game state initialization using the turbo::init! macro
turbo::init! {
    struct GameState {
        player_one_choice: Option<u8>, // 0 for Stone, 1 for Paper, 2 for Scissors
        player_two_choice: Option<u8>,
        result: Option<i8>, // 1 = player one wins, -1 = player two wins, 0 = draw
        turn: u8, // 1 for player one's turn, 2 for player two's turn
        frame: u32,
    } = {
        Self {
            player_one_choice: None,
            player_two_choice: None,
            result: None,
            turn: 1,
            frame: 0,
        }
    }
}

// Implement the game loop using the turbo::go! macro
turbo::go! {
    // Load the game state
    let mut state = GameState::load();

    // Draw background
    clear(0x87ceebff); // light blue background

    // Draw game instructions
    text!("Press Z for Stone, X for Paper, C for Scissors", x = 20, y = 20, font = Font::M, color = 0xffffffff);

    let gp = gamepad(0);

    // Player one's turn
    if state.turn == 1 {
        text!("Player One's Turn", x = 20, y = 50, font = Font::M, color = 0xffff00ff);

        // Handle input for player one's choice
        if gp.a.just_pressed() {
            state.player_one_choice = Some(0); // Stone
            state.turn = 2; // Move to player two's turn
        }
        if gp.b.just_pressed() {
            state.player_one_choice = Some(1); // Paper
            state.turn = 2; // Move to player two's turn
        }
        if gp.x.just_pressed() {
            state.player_one_choice = Some(2); // Scissors
            state.turn = 2; // Move to player two's turn
        }
    }

    // Player two's turn
    else if state.turn == 2 {
        text!("Player Two's Turn", x = 20, y = 50, font = Font::M, color = 0x00ff00ff);

        // Handle input for player two's choice
        if gp.a.just_pressed() {
            state.player_two_choice = Some(0); // Stone
            state.turn = 3; // Move to result phase
        }
        if gp.b.just_pressed() {
            state.player_two_choice = Some(1); // Paper
            state.turn = 3; // Move to result phase
        }
        if gp.x.just_pressed() {
            state.player_two_choice = Some(2); // Scissors
            state.turn = 3; // Move to result phase
        }
    }

    // Show result after both players have chosen
    else if state.turn == 3 {
        if let (Some(p1), Some(p2)) = (state.player_one_choice, state.player_two_choice) {
            // Determine result based on choices
            state.result = Some(match (p1, p2) {
                (0, 2) | (1, 0) | (2, 1) => 1,  // Player one wins
                (2, 0) | (0, 1) | (1, 2) => -1, // Player two wins
                _ => 0,                         // Draw
            });

            // Display choices and result
            let choices = ["Stone", "Paper", "Scissors"];
            text!(&format!("Player One chose: {}", choices[p1 as usize]), x = 20, y = 90, font = Font::M, color = 0xffff00ff);
            text!(&format!("Player Two chose: {}", choices[p2 as usize]), x = 20, y = 120, font = Font::M, color = 0x00ff00ff);

            let result_text = match state.result.unwrap() {
                1 => "Player One Wins!",
                -1 => "Player Two Wins!",
                0 => "It's a Draw!",
                _ => unreachable!(),
            };
            text!(result_text, x = 20, y = 160, font = Font::L, color = 0xff0000ff);

            // Restart game after a few seconds
            if state.frame % 240 == 0 { // Delay for 4 seconds (assuming 60 FPS)
                state.player_one_choice = None;
                state.player_two_choice = None;
                state.result = None;
                state.turn = 1; // Reset to player one's turn
            }
        }
    }

    // Save game state for the next frame
    state.frame += 1;
    state.save();
}
