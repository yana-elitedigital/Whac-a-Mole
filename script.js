class WhacAMoleGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.moleTimer = null;
        this.gameTimer = null;
        this.currentMole = null;
        this.holes = document.querySelectorAll('.hole');
        this.moles = document.querySelectorAll('.mole');
        this.scoreElement = document.getElementById('score');
        this.timeElement = document.getElementById('time');
        this.highScoreElement = document.getElementById('highScore');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.finalScoreElement = document.getElementById('finalScore');
        
        this.minMoleTime = 800;
        this.maxMoleTime = 2000;
        this.moleUpTime = 1200;
        
        this.init();
    }

    init() {
        this.loadHighScore();
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        
        this.moles.forEach((mole, index) => {
            mole.addEventListener('click', () => this.hitMole(index));
        });

        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.score = 0;
        this.timeLeft = 60;
        this.startBtn.disabled = true;
        this.startBtn.textContent = 'Playing...';
        
        this.updateDisplay();
        this.startTimer();
        this.spawnMole();
    }

    startTimer() {
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    spawnMole() {
        if (!this.isPlaying) return;
        
        // Hide current mole if any
        if (this.currentMole !== null) {
            this.hideMole(this.currentMole);
        }
        
        // Choose random hole
        const randomHole = Math.floor(Math.random() * this.holes.length);
        this.currentMole = randomHole;
        
        // Show mole
        this.showMole(randomHole);
        
        // Schedule next mole
        const nextMoleTime = Math.random() * (this.maxMoleTime - this.minMoleTime) + this.minMoleTime;
        this.moleTimer = setTimeout(() => this.spawnMole(), nextMoleTime);
        
        // Auto-hide mole after some time
        setTimeout(() => {
            if (this.currentMole === randomHole && this.isPlaying) {
                this.hideMole(randomHole);
            }
        }, this.moleUpTime);
    }

    showMole(holeIndex) {
        const mole = this.moles[holeIndex];
        mole.classList.add('up', 'popping');
        
        // Remove popping animation class after animation completes
        setTimeout(() => {
            mole.classList.remove('popping');
        }, 400);
    }

    hideMole(holeIndex) {
        const mole = this.moles[holeIndex];
        mole.classList.remove('up');
        if (this.currentMole === holeIndex) {
            this.currentMole = null;
        }
    }

    hitMole(holeIndex) {
        if (!this.isPlaying || this.currentMole !== holeIndex) return;
        
        const mole = this.moles[holeIndex];
        if (!mole.classList.contains('up')) return;
        
        // Add hit effect
        mole.classList.add('hit');
        setTimeout(() => {
            mole.classList.remove('hit');
        }, 200);
        
        // Increase score
        this.score += 10;
        this.updateDisplay();
        
        // Hide the mole
        this.hideMole(holeIndex);
        
        // Increase difficulty over time
        if (this.score > 0 && this.score % 100 === 0) {
            this.increaseDifficulty();
        }
    }

    increaseDifficulty() {
        this.minMoleTime = Math.max(300, this.minMoleTime - 50);
        this.maxMoleTime = Math.max(800, this.maxMoleTime - 100);
        this.moleUpTime = Math.max(600, this.moleUpTime - 50);
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.gameTimer);
        clearTimeout(this.moleTimer);
        
        // Hide all moles
        this.moles.forEach((mole, index) => {
            this.hideMole(index);
        });
        
        // Check and save high score
        const currentHighScore = parseInt(this.highScoreElement.textContent);
        if (this.score > currentHighScore) {
            this.saveHighScore(this.score);
            this.highScoreElement.textContent = this.score;
        }
        
        // Show game over modal
        this.finalScoreElement.textContent = `Your Score: ${this.score}`;
        this.gameOverModal.style.display = 'flex';
        
        // Reset start button
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Start Game';
    }

    resetGame() {
        this.isPlaying = false;
        clearInterval(this.gameTimer);
        clearTimeout(this.moleTimer);
        
        this.score = 0;
        this.timeLeft = 60;
        this.currentMole = null;
        
        // Reset difficulty
        this.minMoleTime = 800;
        this.maxMoleTime = 2000;
        this.moleUpTime = 1200;
        
        // Hide all moles
        this.moles.forEach((mole, index) => {
            this.hideMole(index);
            mole.classList.remove('hit');
        });
        
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Start Game';
        this.updateDisplay();
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.timeElement.textContent = this.timeLeft;
    }

    loadHighScore() {
        const saved = localStorage.getItem('whacamole-highscore');
        const highScore = saved ? parseInt(saved) : 0;
        this.highScoreElement.textContent = highScore;
    }

    saveHighScore(score) {
        localStorage.setItem('whacamole-highscore', score.toString());
    }
}

// Initialize game
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new WhacAMoleGame();
});

function closeGameOver() {
    document.getElementById('gameOverModal').style.display = 'none';
}