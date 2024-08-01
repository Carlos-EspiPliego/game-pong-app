let ball;
let playerPaddle;
let computerPaddle;
let playerScore = 0;
let computerScore = 0;
let isPlaying = false;
let isPaused = false;
let speedIncreaseInterval = 5; // Intervalo de tiempo en segundos para aumentar la velocidad
let lastSpeedIncreaseTime = 0;
let startButton, pauseButton, resetButton;
let playerScoreElement, computerScoreElement;
let playerMoveUp = false;
let playerMoveDown = false;

function setup() {
    createCanvas(800, 400);
    ball = new Ball();
    playerPaddle = new Paddle(true);
    computerPaddle = new Paddle(false);
    lastSpeedIncreaseTime = millis();

    // Obtener elementos del DOM
    startButton = select('#start-button');
    pauseButton = select('#pause-button');
    resetButton = select('#reset-button');
    playerScoreElement = select('#player-score');
    computerScoreElement = select('#computer-score');

    // Asignar eventos a los botones
    startButton.mousePressed(startGame);
    pauseButton.mousePressed(pauseGame);
    resetButton.mousePressed(resetGame);

    // Asignar eventos de teclado
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
}

function draw() {
    background(0);

    if (isPlaying && !isPaused) {
        ball.update();
        ball.show();
        playerPaddle.update();
        computerPaddle.update();
        computerPaddle.move(ball);

        increaseBallSpeedOverTime();
    }

    playerPaddle.show();
    computerPaddle.show();
    ball.show();

    checkGameEnd();
}

function increaseBallSpeedOverTime() {
    let currentTime = millis();
    if (currentTime - lastSpeedIncreaseTime > speedIncreaseInterval * 1000) {
        ball.increaseSpeed();
        lastSpeedIncreaseTime = currentTime;
    }
}

function startGame() {
    if (!isPlaying) {
        isPlaying = true;
        ball.reset();
        playerScore = 0;
        computerScore = 0;
        updateScoreboard();
    }
    isPaused = false;
}

function pauseGame() {
    isPaused = !isPaused;
}

function resetGame() {
    isPlaying = false;
    isPaused = false;
    ball.reset();
    playerScore = 0;
    computerScore = 0;
    updateScoreboard();
}

function updateScoreboard() {
    playerScoreElement.html(`Jugador: ${playerScore}`);
    computerScoreElement.html(`Computadora: ${computerScore}`);
}

function checkGameEnd() {
    if (playerScore >= 5 || computerScore >= 5) {
        isPlaying = false;
        ball.reset();
    }
}

function keyDownHandler(event) {
    if (event.code === 'ArrowUp') {
        playerMoveUp = true;
    } else if (event.code === 'ArrowDown') {
        playerMoveDown = true;
    } else if (event.code === 'Space') {
        pauseGame();
    }
}

function keyUpHandler(event) {
    if (event.code === 'ArrowUp') {
        playerMoveUp = false;
    } else if (event.code === 'ArrowDown') {
        playerMoveDown = false;
    }
}

// Ball class
class Ball {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = width / 2;
        this.y = height / 2;
        this.baseSpeed = 3;
        this.speedMultiplier = 1;
        this.xSpeed = random([-this.baseSpeed, this.baseSpeed]);
        this.ySpeed = random(-this.baseSpeed / 2, this.baseSpeed / 2);
    }

    increaseSpeed() {
        this.speedMultiplier += 0.1;
        this.xSpeed *= this.speedMultiplier;
        this.ySpeed *= this.speedMultiplier;
    }

    update() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;

        if (this.y < 0 || this.y > height) {
            this.ySpeed *= -1;
        }

        if (this.x < 0) {
            computerScore++;
            updateScoreboard();
            this.reset();
        }

        if (this.x > width) {
            playerScore++;
            updateScoreboard();
            this.reset();
        }

        this.checkPaddleCollision(playerPaddle);
        this.checkPaddleCollision(computerPaddle);
    }

    checkPaddleCollision(paddle) {
        if (
            this.x > paddle.x &&
            this.x < paddle.x + paddle.w &&
            this.y > paddle.y &&
            this.y < paddle.y + paddle.h
        ) {
            this.xSpeed *= -1;
            this.ySpeed = random(-2, 2);
        }
    }

    show() {
        fill(255);
        ellipse(this.x, this.y, 20, 20);
    }
}

// Paddle class
class Paddle {
    constructor(isPlayer) {
        this.w = 20;
        this.h = 100;
        this.y = height / 2 - this.h / 2;
        this.isPlayer = isPlayer;

        if (this.isPlayer) {
            this.x = 20;
        } else {
            this.x = width - this.w - 20;
        }
    }

    update() {
        if (this.isPlayer) {
            if (playerMoveUp) {
                this.y -= 5;
            } else if (playerMoveDown) {
                this.y += 5;
            }
            this.y = constrain(this.y, 0, height - this.h);
        }
    }

    move(ball) {
        if (!this.isPlayer) {
            if (ball.y < this.y + this.h / 2) {
                this.y -= 3;
            } else {
                this.y += 3;
            }
            this.y = constrain(this.y, 0, height - this.h);
        }
    }

    show() {
        fill(255);
        rect(this.x, this.y, this.w, this.h);
    }
}
