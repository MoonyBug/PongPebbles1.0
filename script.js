const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Ajustar o canvas para o tamanho da tela
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    resetBall();

    // Reposiciona as raquetes e bola para a nova escala
    leftPaddle.y = canvas.height / 2 - leftPaddle.height / 2;
    rightPaddle.x = canvas.width - paddleWidth;
    rightPaddle.y = canvas.height / 2 - rightPaddle.height / 2;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);

const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;

let leftPaddle = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 10,
    score: 0
};

let rightPaddle = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 5,
    speed: 5,
    score: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    dx: 5,
    dy: 5
};

let devToolsActive = false;
let aiPaused = false;
let difficulty = 'normal';

// Carregar a imagem de fundo
const backgroundImage = new Image();
backgroundImage.src = "pblsch.png"; // Caminho para a sua imagem

function setDifficulty(level) {
    difficulty = level;
    if (level === 'easy') {
        rightPaddle.speed = 3;
    } else if (level === 'normal') {
        rightPaddle.speed = 5;
    } else if (level === 'hard') {
        rightPaddle.speed = 8;
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'o') {
        devToolsActive = !devToolsActive;
    }

    if (devToolsActive) {
        if (event.key === 'q') {
            aiPaused = !aiPaused;
        } else if (event.key === 'v') {
            ball.dx *= 0.5;
            ball.dy *= 0.5;
        }
    }

    if (event.key === '1') {
        setDifficulty('easy');
    } else if (event.key === '2') {
        setDifficulty('normal');
    } else if (event.key === '3') {
        setDifficulty('hard');
    }
});

// Movimentos com toque para dispositivos móveis
canvas.addEventListener('touchmove', function(event) {
    const touch = event.touches[0];
    leftPaddle.y = touch.clientY - leftPaddle.height / 2;
    if (leftPaddle.y < 0) leftPaddle.y = 0;
    if (leftPaddle.y + leftPaddle.height > canvas.height) {
        leftPaddle.y = canvas.height - leftPaddle.height;
    }
});

function movePaddle(paddle) {
    paddle.y += paddle.dy;
    if (paddle.y < 0) {
        paddle.y = 0;
    } else if (paddle.y + paddle.height > canvas.height) {
        paddle.y = canvas.height - paddle.height;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    if (
        (ball.x - ball.radius < leftPaddle.x + leftPaddle.width && ball.y > leftPaddle.y && ball.y < leftPaddle.y + leftPaddle.height) ||
        (ball.x + ball.radius > rightPaddle.x && ball.y > rightPaddle.y && ball.y < rightPaddle.y + rightPaddle.height)
    ) {
        ball.dx *= -1;
    }

    if (ball.x + ball.radius > canvas.width) {
        leftPaddle.score++;
        resetBall();
    } else if (ball.x - ball.radius < 0) {
        rightPaddle.score++;
        resetBall();
    }
}

function moveAIPaddle() {
    if (!aiPaused) {
        if (rightPaddle.y + rightPaddle.height / 2 < ball.y) {
            rightPaddle.dy = rightPaddle.speed;
        } else {
            rightPaddle.dy = -rightPaddle.speed;
        }
    } else {
        rightPaddle.dy = 0;
    }

    movePaddle(rightPaddle);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = -ball.dx;
}

function update() {
    movePaddle(leftPaddle);
    moveBall();
    moveAIPaddle();
}

// Função para desenhar os elementos do jogo, incluindo a imagem de fundo
function draw() {
    // Desenha o fundo cobrindo todo o canvas
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Desenhar as raquetes e a bola
    drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, '#fff');
    drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, '#fff');
    drawCircle(ball.x, ball.y, ball.radius, '#fff');
    drawScore();
}

// Desenha um retângulo
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Desenha um círculo
function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

// Função para desenhar a pontuação
function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(leftPaddle.score, canvas.width / 4, 30);
    ctx.fillText(rightPaddle.score, (3 * canvas.width) / 4, 30);
}

// Inicia o loop do jogo quando a imagem de fundo é carregada
backgroundImage.onload = function() {
    setDifficulty('normal');
    gameLoop();
};

// Função de loop do jogo
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Variável para controle do estado do devtools e do cheat button
let showDevTools = false;

// Elementos do cheat button e devtools
const cheatButton = document.createElement('button');
cheatButton.textContent = "Cheat";
cheatButton.style.position = 'absolute';
cheatButton.style.bottom = '10px';
cheatButton.style.left = '10px';
cheatButton.style.padding = '5px';
document.body.appendChild(cheatButton);

const devToolsDiv = document.createElement('div');
devToolsDiv.style.display = 'none';
devToolsDiv.style.position = 'absolute';
devToolsDiv.style.bottom = '50px';
devToolsDiv.style.left = '10px';
devToolsDiv.style.padding = '10px';
devToolsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
devToolsDiv.style.color = '#fff';
devToolsDiv.style.borderRadius = '5px';
devToolsDiv.textContent = "Devtools on";
document.body.appendChild(devToolsDiv);

const stopOpponentButton = document.createElement('button');
stopOpponentButton.textContent = "Stop Opponent";
devToolsDiv.appendChild(stopOpponentButton);

const stopBallButton = document.createElement('button');
stopBallButton.textContent = "Stop Ball";
devToolsDiv.appendChild(stopBallButton);

const accelerateBallButton = document.createElement('button');
accelerateBallButton.textContent = "Accelerate Ball";
devToolsDiv.appendChild(accelerateBallButton);

// Exibe ou oculta o devtools ao tocar no cheat button
cheatButton.addEventListener('click', function() {
    showDevTools = !showDevTools;
    devToolsDiv.style.display = showDevTools ? 'block' : 'none';
});

// Funções dos botões do devtools
stopOpponentButton.addEventListener('click', function() {
    aiPaused = !aiPaused; // Ativa/desativa o movimento do oponente
});

stopBallButton.addEventListener('click', function() {
    if (ball.dx !== 0 || ball.dy !== 0) {
        ball.dx = 0;
        ball.dy = 0;
    } else {
        ball.dx = 5; // Restaura a velocidade original
        ball.dy = 5;
    }
});

accelerateBallButton.addEventListener('click', function() {
    ball.dx *= 1.5; // Aumenta a velocidade da bola
    ball.dy *= 1.5;
});
