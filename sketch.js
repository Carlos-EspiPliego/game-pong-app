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
let playerMoveUp = false;
let playerMoveDown = false;
let fondo, barraJugador, barraComputadora, bola, sonidoRebote, sonidoGol;
let gameEnded = false; // Flag to check if the game has ended

function preload() {
    fondo = loadImage('./assets/fondo1.png');
    barraJugador = loadImage('./assets/barra1.png');
    barraComputadora = loadImage('./assets/barra2.png');
    bola = loadImage('./assets/bola.png');
    sonidoRebote = loadSound('./assets/bounce.wav');
    sonidoGol = loadSound('./assets/jingle_win_synth_02.wav');
}

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

    // Asignar eventos a los botones
    startButton.mousePressed(() => {
        if (getAudioContext().state !== 'running') {
            getAudioContext().resume().then(() => {
                startGame();
            });
        } else {
            startGame();
        }
    });
    pauseButton.mousePressed(pauseGame);
    resetButton.mousePressed(resetGame);

    // Asignar eventos de teclado
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
}

function draw() {
    background(fondo);

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

    mostrarPuntaje();
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
        gameEnded = false;
        ball.reset();
        playerScore = 0;
        computerScore = 0;
    }
    isPaused = false;
}

function pauseGame() {
    isPaused = !isPaused;
}

function resetGame() {
    isPlaying = false;
    isPaused = false;
    gameEnded = false;
    ball.reset();
    playerScore = 0;
    computerScore = 0;
}

function mostrarPuntaje() {
    textSize(32);
    textAlign(CENTER, CENTER);
    fill(color("#2B3FD6"));
    text(playerScore, width / 4, 30);
    text(computerScore, 3 * width / 4, 30);
}

function checkGameEnd() {
    if ((playerScore >= 5 || computerScore >= 5) && !gameEnded) {
        isPlaying = false;
        ball.reset();
        narrarMarcador(true); // Pass true to indicate the game has ended
        gameEnded = true; // Prevent further narration after the game ends
    }
}

function narrarMarcador(gameEnded = false) {
    let message = `El marcador es ${playerScore} a ${computerScore}`;
    if (gameEnded) {
        message += `. El juego ha terminado.`;
    }
    let narrador = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(narrador);
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
        this.angle = 0;
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
            sonidoGol.play();
            narrarMarcador(); // Narrate the score each time a point is scored
            this.reset();
        }

        if (this.x > width) {
            playerScore++;
            sonidoGol.play();
            narrarMarcador(); // Narrate the score each time a point is scored
            this.reset();
        }

        this.checkPaddleCollision(playerPaddle);
        this.checkPaddleCollision(computerPaddle);

        // Ajustar el ángulo de la pelota en función de su velocidad
        let velocidadTotal = sqrt(this.xSpeed * this.xSpeed + this.ySpeed * this.ySpeed);
        this.angle += velocidadTotal * 0.05;
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
            sonidoRebote.play();
        }
    }

    show() {
        push();
        translate(this.x, this.y);
        rotate(this.angle);
        imageMode(CENTER);
        image(bola, 0, 0, 20, 20);
        pop();
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
        image(this.isPlayer ? barraJugador : barraComputadora, this.x, this.y, this.w, this.h);
    }
}
