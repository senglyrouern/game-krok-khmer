

const boardElement = document.getElementById('krok-board');
const messageDisplay = document.getElementById('message');
const resetButton = document.getElementById('reset-button');
const gameOverOverlay = document.querySelector('.game-over-overlay');
const winnerDisplay = document.getElementById('winner');
const playAgainButton = document.getElementById('play-again-button');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = '1';
let gameOver = false;
let gameId;

function createBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.classList.add('empty');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
    }
    gameOver = false;
    gameOverOverlay.style.display = 'none';
}

function handleCellClick(event) {
    if (gameOver) return;

    const cell = event.target;
    const index = parseInt(cell.dataset.index);

    if (board[index] === '') {
        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.remove('empty');
        cell.classList.add(`player${currentPlayer}`);

        if (checkWin()) {
            declareWinner(currentPlayer);
            return;
        }

        currentPlayer = (currentPlayer === '1') ? '2' : '1';
        messageDisplay.textContent = `Player ${currentPlayer}'s turn`;
        // Use try-catch for better error handling
        try {
            google.script.run.withFailureHandler(handleServerError)
                .updateGameState(gameId, board, currentPlayer, gameOver);
        } catch (error) {
            handleServerError(error); // Handle the error
        }
    }
}

function checkWin() {
    for (let i = 0; i < 3; i++) {
        if (board[i * 3] !== '' &&
            board[i * 3] === board[i * 3 + 1] &&
            board[i * 3 + 1] === board[i * 3 + 2]) {
            return true;
        }
    }

    for (let i = 0; i < 3; i++) {
        if (board[i] !== '' &&
            board[i] === board[i + 3] &&
            board[i + 3] === board[i + 6]) {
            return true;
        }
    }

    if (board[0] !== '' &&
        board[0] === board[4] &&
        board[4] === board[8]) {
        return true;
    }

    if (board[2] !== '' &&
        board[2] === board[4] &&
        board[4] === board[6]) {
        return true;
    }

    return false;
}

function declareWinner(player) {
    gameOver = true;
    messageDisplay.textContent = `Player ${player} wins!`;
    winnerDisplay.textContent = player;
    gameOverOverlay.style.display = 'flex';
    // Use try-catch for better error handling
    try {
        google.script.run.withFailureHandler(handleServerError)
            .updateGameState(gameId, board, currentPlayer, gameOver);
    } catch (error) {
        handleServerError(error); // Handle the error
    }
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = '1';
    gameOver = false;
    messageDisplay.textContent = 'Place your piece';
    createBoard();
     // Use try-catch for better error handling
    try {
        google.script.run.withFailureHandler(handleServerError)
            .resetGameState(gameId);
    } catch (error) {
        handleServerError(error); // Handle the error
    }
}

resetButton.addEventListener('click', resetGame);
playAgainButton.addEventListener('click', resetGame);

function createBoardFromState() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        if (board[i] === '') {
            cell.classList.add('empty');
        } else if (board[i] === '1') {
            cell.classList.add('player1');
        } else if (board[i] === '2') {
            cell.classList.add('player2');
        }
        cell.dataset.index = i;
        cell.textContent = board[i];
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
    }
    if (gameOver) {
        if (currentPlayer === '1') {
            winnerDisplay.textContent = '2';
        } else {
            winnerDisplay.textContent = '1';
        }
        gameOverOverlay.style.display = 'flex';
    }
}

function fetchGameState() {
     // Use try-catch for better error handling
    try {
        google.script.run.withFailureHandler(handleServerError)
            .withSuccessHandler(updateBoard)
            .getGameState(gameId);
    } catch (error) {
        handleServerError(error); // Handle the error
    }
}

function handleServerError(error) {
    console.error('Error from server:', error);
    messageDisplay.textContent = "Error communicating with the server. Please check your connection and try again.";
}

// Use try-catch for the initial call
try {
    google.script.run.withFailureHandler(handleServerError)
        .withSuccessHandler(function (id) {
            gameId = id;
            fetchGameState();
            setInterval(fetchGameState, 3000);
        }).createGame();
} catch (error) {
    handleServerError(error); // Handle the error
}
