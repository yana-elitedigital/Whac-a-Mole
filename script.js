class EpicWhacAMoleGame {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.moleTimer = null;
        this.gameTimer = null;
        this.currentMole = null;
        this.holes = document.querySelectorAll('.hole');
        this.moles = document.querySelectorAll('.mole');
        this.scoreElement = document.getElementById('score');
        this.comboElement = document.getElementById('combo');
        this.timeElement = document.getElementById('time');
        this.highScoreElement = document.getElementById('highScore');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.finalScoreElement = document.getElementById('finalScore');
        this.highScoreDisplayElement = document.getElementById('highScoreDisplay');
        this.particlesContainer = document.getElementById('particlesContainer');
        
        this.minMoleTime = 1000;
        this.maxMoleTime = 2500;
        this.moleUpTime = 1500;
        this.comboTimer = null;
        
        this.init();
    }

    init() {
        this.loadHighScore();
        this.bindEvents();
        this.updateDisplay();
        this.startBackgroundAnimations();
    }

    startBackgroundAnimations() {
        // Animate floating particles
        anime({
            targets: '.floating-particle',
            translateY: [
                { value: '100vh', duration: 0 },
                { value: '-100px', duration: 8000 }
            ],
            scale: [
                { value: 0, duration: 0 },
                { value: 1, duration: 800 },
                { value: 1, duration: 6400 },
                { value: 0, duration: 800 }
            ],
            opacity: [
                { value: 0, duration: 0 },
                { value: 1, duration: 800 },
                { value: 1, duration: 6400 },
                { value: 0, duration: 800 }
            ],
            delay: anime.stagger(1600),
            loop: true,
            easing: 'linear'
        });
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
        this.combo = 0;
        this.timeLeft = 60;
        this.startBtn.disabled = true;
        this.startBtn.querySelector('span').textContent = 'PLAYING...';
        
        this.updateDisplay();
        this.startTimer();
        this.spawnMole();
        
        // Start game animation
        anime({
            targets: '.game-board',
            scale: [0.8, 1],
            rotateX: [10, 5],
            opacity: [0.7, 1],
            duration: 800,
            easing: 'easeOutElastic(1, .8)'
        });
    }

    startTimer() {
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            // Add urgency animation when time is low
            if (this.timeLeft <= 10) {
                anime({
                    targets: '.time-display',
                    scale: [1, 1.2, 1],
                    duration: 200,
                    easing: 'easeInOutQuad'
                });
            }
            
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
        
        // Show mole with animation
        this.showMole(randomHole);
        
        // Schedule next mole
        const nextMoleTime = Math.random() * (this.maxMoleTime - this.minMoleTime) + this.minMoleTime;
        this.moleTimer = setTimeout(() => this.spawnMole(), nextMoleTime);
        
        // Auto-hide mole after some time
        setTimeout(() => {
            if (this.currentMole === randomHole && this.isPlaying) {
                this.hideMole(randomHole);
                this.resetCombo();
            }
        }, this.moleUpTime);
    }

    showMole(holeIndex) {
        const hole = this.holes[holeIndex];
        const mole = this.moles[holeIndex];
        
        hole.classList.add('active');
        mole.classList.add('up');
        
        // Animate mole appearing with Anime.js
        anime({
            targets: mole,
            translateY: [120, -30],
            scale: [0.8, 1.1, 1],
            rotate: [-5, 5, 0],
            duration: 400,
            easing: 'easeOutElastic(1, .8)'
        });
        
        // Hole glow effect
        anime({
            targets: hole.querySelector('.hole-glow'),
            opacity: [0, 0.8, 0.5],
            scale: [0.5, 1.2, 1],
            duration: 600,
            easing: 'easeOutQuad'
        });
    }

    hideMole(holeIndex) {
        const hole = this.holes[holeIndex];
        const mole = this.moles[holeIndex];
        
        hole.classList.remove('active');
        mole.classList.remove('up');
        
        // Animate mole hiding
        anime({
            targets: mole,
            translateY: 120,
            scale: 0.8,
            duration: 300,
            easing: 'easeInQuad'
        });
        
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
        }, 500);
        
        // Create hit particles
        this.createHitParticles(holeIndex);
        
        // Increase score and combo
        this.combo++;
        const points = 10 + (this.combo * 2);
        this.score += points;
        
        // Show score popup
        this.showScorePopup(holeIndex, points);
        
        this.updateDisplay();
        
        // Hide the mole with hit animation
        anime({
            targets: mole,
            translateY: 120,
            scale: [1, 0.5],
            rotate: 360,
            duration: 400,
            easing: 'easeInBack(1.7)'
        });
        
        mole.classList.remove('up');
        this.holes[holeIndex].classList.remove('active');
        
        // Reset combo timer
        clearTimeout(this.comboTimer);
        this.comboTimer = setTimeout(() => this.resetCombo(), 2000);
        
        // Increase difficulty over time
        if (this.score > 0 && this.score % 100 === 0) {
            this.increaseDifficulty();
        }
    }

    createHitParticles(holeIndex) {
        const hole = this.holes[holeIndex];
        const rect = hole.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            
            const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#FFE66D'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            this.particlesContainer.appendChild(particle);
            
            // Animate particle
            anime({
                targets: particle,
                translateX: (Math.random() - 0.5) * 200,
                translateY: (Math.random() - 0.5) * 200,
                scale: [1, 0],
                opacity: [1, 0],
                duration: 800,
                easing: 'easeOutQuad',
                complete: () => {
                    particle.remove();
                }
            });
        }
    }

    showScorePopup(holeIndex, points) {
        const hole = this.holes[holeIndex];
        const rect = hole.getBoundingClientRect();
        
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.left = (rect.left + rect.width / 2) + 'px';
        popup.style.top = rect.top + 'px';
        popup.style.color = '#FFD700';
        popup.style.fontSize = '24px';
        popup.style.fontWeight = 'bold';
        popup.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.8)';
        popup.style.pointerEvents = 'none';
        popup.style.zIndex = '1000';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.textContent = `+${points}`;
        
        if (this.combo > 1) {
            popup.textContent += ` (${this.combo}x COMBO!)`;
            popup.style.color = '#FF6B6B';
        }
        
        document.body.appendChild(popup);
        
        anime({
            targets: popup,
            translateY: -100,
            scale: [0.5, 1.5, 1],
            opacity: [1, 1, 0],
            duration: 1500,
            easing: 'easeOutQuad',
            complete: () => {
                popup.remove();
            }
        });
    }

    resetCombo() {
        if (this.combo > 0) {
            this.combo = 0;
            this.updateDisplay();
        }
    }

    increaseDifficulty() {
        this.minMoleTime = Math.max(400, this.minMoleTime - 50);
        this.maxMoleTime = Math.max(800, this.maxMoleTime - 100);
        this.moleUpTime = Math.max(800, this.moleUpTime - 50);
        
        // Show difficulty increase effect
        anime({
            targets: '.game-title h1',
            scale: [1, 1.1, 1],
            duration: 600,
            easing: 'easeOutElastic(1, .8)'
        });
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.gameTimer);
        clearTimeout(this.moleTimer);
        clearTimeout(this.comboTimer);
        
        // Hide all moles with staggered animation
        anime({
            targets: '.mole.up',
            translateY: 120,
            scale: 0.5,
            duration: 300,
            delay: anime.stagger(100),
            easing: 'easeInQuad'
        });
        
        // Remove active states
        this.holes.forEach((hole, index) => {
            hole.classList.remove('active');
            this.moles[index].classList.remove('up', 'hit');
        });
        
        // Check and save high score
        const currentHighScore = parseInt(this.highScoreElement.textContent);
        if (this.score > currentHighScore) {
            this.saveHighScore(this.score);
            this.highScoreElement.textContent = this.score;
            this.highScoreDisplayElement.textContent = `Best Score: ${this.score} (NEW RECORD!)`;
            
            // Celebrate new high score
            this.celebrateNewRecord();
        } else {
            this.highScoreDisplayElement.textContent = `Best Score: ${currentHighScore}`;
        }
        
        // Show game over modal with animation
        this.finalScoreElement.textContent = `Your Score: ${this.score}`;
        this.gameOverModal.style.display = 'flex';
        
        anime({
            targets: '.game-over-content',
            scale: [0.5, 1],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutElastic(1, .8)'
        });
        
        // Reset start button
        this.startBtn.disabled = false;
        this.startBtn.querySelector('span').textContent = 'START GAME';
    }

    celebrateNewRecord() {
        // Create celebration particles
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.position = 'fixed';
                particle.style.left = '50%';
                particle.style.top = '50%';
                particle.style.background = '#FFD700';
                particle.style.zIndex = '3000';
                
                this.particlesContainer.appendChild(particle);
                
                anime({
                    targets: particle,
                    translateX: (Math.random() - 0.5) * 400,
                    translateY: (Math.random() - 0.5) * 400,
                    scale: [0, 2, 0],
                    opacity: [1, 1, 0],
                    duration: 2000,
                    easing: 'easeOutQuad',
                    complete: () => {
                        particle.remove();
                    }
                });
            }, i * 100);
        }
    }

    resetGame() {
        this.isPlaying = false;
        clearInterval(this.gameTimer);
        clearTimeout(this.moleTimer);
        clearTimeout(this.comboTimer);
        
        this.score = 0;
        this.combo = 0;
        this.timeLeft = 60;
        this.currentMole = null;
        
        // Reset difficulty
        this.minMoleTime = 1000;
        this.maxMoleTime = 2500;
        this.moleUpTime = 1500;
        
        // Hide all moles with animation
        anime({
            targets: '.mole',
            translateY: 120,
            scale: 0.8,
            duration: 300,
            delay: anime.stagger(50),
            easing: 'easeInQuad'
        });
        
        // Remove all states
        this.holes.forEach((hole, index) => {
            hole.classList.remove('active');
            this.moles[index].classList.remove('up', 'hit');
        });
        
        this.startBtn.disabled = false;
        this.startBtn.querySelector('span').textContent = 'START GAME';
        this.updateDisplay();
        
        // Reset animation
        anime({
            targets: '.game-board',
            scale: [1, 0.9, 1],
            rotateX: [5, 0, 5],
            duration: 600,
            easing: 'easeOutElastic(1, .8)'
        });
    }

    updateDisplay() {
        // Animate score change
        anime({
            targets: this.scoreElement,
            innerHTML: [this.scoreElement.textContent, this.score],
            duration: 300,
            round: 1,
            easing: 'easeOutQuad'
        });
        
        // Animate combo change
        anime({
            targets: this.comboElement,
            innerHTML: [this.comboElement.textContent, this.combo],
            duration: 300,
            round: 1,
            easing: 'easeOutQuad'
        });
        
        this.timeElement.textContent = this.timeLeft;
        
        // Combo glow effect
        if (this.combo > 1) {
            anime({
                targets: '.combo-display',
                scale: [1, 1.2, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });
        }
    }

    loadHighScore() {
        const saved = localStorage.getItem('epic-whacamole-highscore');
        const highScore = saved ? parseInt(saved) : 0;
        this.highScoreElement.textContent = highScore;
    }

    saveHighScore(score) {
        localStorage.setItem('epic-whacamole-highscore', score.toString());
    }
}

// Initialize game
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new EpicWhacAMoleGame();
});

function closeGameOver() {
    // Animate modal close
    anime({
        targets: '.game-over-content',
        scale: [1, 0.5],
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInQuad',
        complete: () => {
            document.getElementById('gameOverModal').style.display = 'none';
        }
    });
}