'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';

class EpicWhacAMoleGame {
  constructor(rootElement) {
    this.root = rootElement;
    this.score = 0;
    this.combo = 0;
    this.timeLeft = 60;
    this.isPlaying = false;
    this.moleTimer = null;
    this.gameTimer = null;
    this.currentMole = null;
    this.minMoleTime = 1000;
    this.maxMoleTime = 2500;
    this.moleUpTime = 1500;
    this.comboTimer = null;

    this.holes = Array.from(this.root.querySelectorAll('.hole'));
    this.moles = Array.from(this.root.querySelectorAll('.mole'));
    this.scoreElement = this.root.querySelector('#score');
    this.comboElement = this.root.querySelector('#combo');
    this.timeElement = this.root.querySelector('#time');
    this.highScoreElement = this.root.querySelector('#highScore');
    this.startBtn = this.root.querySelector('#startBtn');
    this.resetBtn = this.root.querySelector('#resetBtn');
    this.gameOverModal = this.root.querySelector('#gameOverModal');
    this.gameOverContent = this.root.querySelector('.game-over-content');
    this.finalScoreElement = this.root.querySelector('#finalScore');
    this.highScoreDisplayElement = this.root.querySelector('#highScoreDisplay');
    this.particlesContainer = this.root.querySelector('#particlesContainer');

    this.handleStart = () => this.startGame();
    this.handleReset = () => this.resetGame();
    this.handleContextMenu = (e) => e.preventDefault();
    this.holeHandlers = [];

    this.init();
  }

  init() {
    this.loadHighScore();
    this.bindEvents();
    this.updateDisplay();
    this.startBackgroundAnimations();
  }

  bindEvents() {
    this.startBtn?.addEventListener('click', this.handleStart);
    this.resetBtn?.addEventListener('click', this.handleReset);

    this.holes.forEach((hole, index) => {
      const handler = () => this.hitHole(index);
      hole.addEventListener('click', handler);
      this.holeHandlers.push({ hole, handler });
    });

    document.addEventListener('contextmenu', this.handleContextMenu);
  }

  startBackgroundAnimations() {
    const particles = this.root.querySelectorAll('.floating-particle');
    if (!particles.length) return;

    anime({
      targets: particles,
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

  startGame() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.score = 0;
    this.combo = 0;
    this.timeLeft = 60;
    if (this.startBtn) {
      this.startBtn.disabled = true;
      const span = this.startBtn.querySelector('span');
      if (span) span.textContent = 'PLAYING...';
    }

    this.updateDisplay();
    this.startTimer();
    this.spawnMole();

    anime({
      targets: this.root.querySelector('.game-board'),
      scale: [0.8, 1],
      rotateX: [10, 5],
      opacity: [0.7, 1],
      duration: 800,
      easing: 'easeOutElastic(1, 0.8)'
    });
  }

  startTimer() {
    this.gameTimer = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();

      if (this.timeLeft <= 10) {
        anime({
          targets: this.root.querySelector('.time-display'),
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

    if (this.currentMole !== null) {
      this.hideMole(this.currentMole);
    }

    const randomHole = Math.floor(Math.random() * this.holes.length);
    this.currentMole = randomHole;
    this.showMole(randomHole);

    const nextMoleTime = Math.random() * (this.maxMoleTime - this.minMoleTime) + this.minMoleTime;
    this.moleTimer = setTimeout(() => this.spawnMole(), nextMoleTime);

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
    if (!hole || !mole) return;

    hole.classList.add('active');
    mole.classList.add('up');

    anime({
      targets: mole,
      translateX: [0, -20],
      translateY: [120, -50],
      scale: [0.8, 1.1, 1],
      rotate: [-5, 5, 0],
      duration: 400,
      easing: 'easeOutElastic(1, 0.8)'
    });

    const glow = hole.querySelector('.hole-glow');
    if (glow) {
      anime({
        targets: glow,
        opacity: [0, 0.8, 0.5],
        scale: [0.5, 1.2, 1],
        duration: 600,
        easing: 'easeOutQuad'
      });
    }
  }

  hideMole(holeIndex) {
    const hole = this.holes[holeIndex];
    const mole = this.moles[holeIndex];
    if (!hole || !mole) return;

    hole.classList.remove('active');
    mole.classList.remove('up');

    anime({
      targets: mole,
      translateX: 0,
      translateY: 120,
      scale: 0.8,
      duration: 300,
      easing: 'easeInQuad'
    });

    if (this.currentMole === holeIndex) {
      this.currentMole = null;
    }
  }

  hitHole(holeIndex) {
    if (!this.isPlaying || this.currentMole !== holeIndex) return;

    const mole = this.moles[holeIndex];
    if (!mole?.classList.contains('up')) return;

    mole.classList.add('hit');
    setTimeout(() => {
      mole.classList.remove('hit');
    }, 500);

    this.createHitParticles(holeIndex);

    this.combo++;
    const points = 10 + this.combo * 2;
    this.score += points;

    this.showScorePopup(holeIndex, points);
    this.updateDisplay();

    anime({
      targets: mole,
      translateX: 0,
      translateY: 120,
      scale: [1, 0.5],
      rotate: 360,
      duration: 400,
      easing: 'easeInBack(1.7)'
    });

    mole.classList.remove('up');
    this.holes[holeIndex].classList.remove('active');

    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => this.resetCombo(), 2000);

    if (this.score > 0 && this.score % 100 === 0) {
      this.increaseDifficulty();
    }
  }

  createHitParticles(holeIndex) {
    const hole = this.holes[holeIndex];
    const rect = hole?.getBoundingClientRect();
    if (!rect || !this.particlesContainer) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;

      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#FFE66D'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];

      this.particlesContainer.appendChild(particle);

      anime({
        targets: particle,
        translateX: (Math.random() - 0.5) * 200,
        translateY: (Math.random() - 0.5) * 200,
        scale: [1, 0],
        opacity: [1, 0],
        duration: 800,
        easing: 'easeOutQuad',
        complete: () => particle.remove()
      });
    }
  }

  showScorePopup(holeIndex, points) {
    const hole = this.holes[holeIndex];
    const rect = hole?.getBoundingClientRect();
    if (!rect) return;

    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top}px`;
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
      complete: () => popup.remove()
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

    anime({
      targets: this.root.querySelector('.game-title h1'),
      scale: [1, 1.1, 1],
      duration: 600,
      easing: 'easeOutElastic(1, 0.8)'
    });
  }

  endGame() {
    this.isPlaying = false;
    clearInterval(this.gameTimer);
    clearTimeout(this.moleTimer);
    clearTimeout(this.comboTimer);

    anime({
      targets: this.root.querySelectorAll('.mole.up'),
      translateY: 120,
      scale: 0.5,
      duration: 300,
      delay: anime.stagger(100),
      easing: 'easeInQuad'
    });

    this.holes.forEach((hole, index) => {
      hole.classList.remove('active');
      this.moles[index]?.classList.remove('up', 'hit');
    });

    const currentHighScore = parseInt(this.highScoreElement?.textContent || '0', 10);
    if (this.score > currentHighScore) {
      this.saveHighScore(this.score);
      if (this.highScoreElement) this.highScoreElement.textContent = this.score.toString();
      if (this.highScoreDisplayElement) {
        this.highScoreDisplayElement.textContent = `Best Score: ${this.score} (NEW RECORD!)`;
      }
      this.celebrateNewRecord();
    } else if (this.highScoreDisplayElement) {
      this.highScoreDisplayElement.textContent = `Best Score: ${currentHighScore}`;
    }

    if (this.finalScoreElement) {
      this.finalScoreElement.textContent = `Your Score: ${this.score}`;
    }

    this.persistScore();

    if (this.gameOverModal) {
      this.gameOverModal.style.display = 'flex';
      anime({
        targets: this.gameOverContent,
        scale: [0.5, 1],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutElastic(1, 0.8)'
      });
    }

    if (this.startBtn) {
      this.startBtn.disabled = false;
      const span = this.startBtn.querySelector('span');
      if (span) span.textContent = 'START GAME';
    }
  }

  celebrateNewRecord() {
    if (!this.particlesContainer) return;
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
          complete: () => particle.remove()
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

    this.minMoleTime = 1000;
    this.maxMoleTime = 2500;
    this.moleUpTime = 1500;

    anime({
      targets: this.root.querySelectorAll('.mole'),
      translateY: 120,
      scale: 0.8,
      duration: 300,
      delay: anime.stagger(50),
      easing: 'easeInQuad'
    });

    this.holes.forEach((hole, index) => {
      hole.classList.remove('active');
      this.moles[index]?.classList.remove('up', 'hit');
    });

    if (this.gameOverModal) {
      this.gameOverModal.style.display = 'none';
    }

    if (this.startBtn) {
      this.startBtn.disabled = false;
      const span = this.startBtn.querySelector('span');
      if (span) span.textContent = 'START GAME';
    }

    this.updateDisplay();

    anime({
      targets: this.root.querySelector('.game-board'),
      scale: [1, 0.9, 1],
      rotateX: [5, 0, 5],
      duration: 600,
      easing: 'easeOutElastic(1, 0.8)'
    });
  }

  updateDisplay() {
    if (this.scoreElement) {
      anime({
        targets: this.scoreElement,
        innerHTML: [this.scoreElement.textContent || '0', this.score],
        duration: 300,
        round: 1,
        easing: 'easeOutQuad'
      });
    }

    if (this.comboElement) {
      anime({
        targets: this.comboElement,
        innerHTML: [this.comboElement.textContent || '0', this.combo],
        duration: 300,
        round: 1,
        easing: 'easeOutQuad'
      });
    }

    if (this.timeElement) {
      this.timeElement.textContent = this.timeLeft.toString();
    }

    if (this.combo > 1) {
      anime({
        targets: this.root.querySelector('.combo-display'),
        scale: [1, 1.2, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });
    }
  }

  loadHighScore() {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('epic-whacamole-highscore');
    const highScore = saved ? parseInt(saved, 10) : 0;
    if (this.highScoreElement) {
      this.highScoreElement.textContent = highScore.toString();
    }
  }

  saveHighScore(score) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('epic-whacamole-highscore', score.toString());
  }

  async persistScore() {
    if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;
    if (!this.score || this.score <= 0) return;

    const payload = {
      playerName: 'Arcade Legend',
      score: this.score,
      combo: this.combo,
      durationSeconds: 60,
      occurredAt: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        console.warn('Score persistence failed', detail);
      }
    } catch (error) {
      console.warn('Unable to reach score API yet', error);
    }
  }

  closeGameOver() {
    if (!this.gameOverModal || !this.gameOverContent) return;
    anime({
      targets: this.gameOverContent,
      scale: [1, 0.5],
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInQuad',
      complete: () => {
        this.gameOverModal.style.display = 'none';
      }
    });
  }

  destroy() {
    this.isPlaying = false;
    clearInterval(this.gameTimer);
    clearTimeout(this.moleTimer);
    clearTimeout(this.comboTimer);

    this.startBtn?.removeEventListener('click', this.handleStart);
    this.resetBtn?.removeEventListener('click', this.handleReset);
    this.holeHandlers.forEach(({ hole, handler }) => hole.removeEventListener('click', handler));
    this.holeHandlers = [];
    document.removeEventListener('contextmenu', this.handleContextMenu);

    if (this.particlesContainer) {
      this.particlesContainer.innerHTML = '';
    }

    if (this.gameOverModal) {
      this.gameOverModal.style.display = 'none';
    }
  }
}

export default function EpicWhacAMole() {
  const gameRootRef = useRef(null);
  const gameInstanceRef = useRef(null);

  useEffect(() => {
    if (!gameRootRef.current) return undefined;
    const instance = new EpicWhacAMoleGame(gameRootRef.current);
    gameInstanceRef.current = instance;

    return () => {
      instance.destroy();
      gameInstanceRef.current = null;
    };
  }, []);

  const handlePlayAgain = () => {
    gameInstanceRef.current?.closeGameOver();
  };

  const holes = Array.from({ length: 9 }, (_, index) => index);

  return (
    <div className="game-root" ref={gameRootRef}>
      <div className="animated-bg">
        <div className="floating-particle" />
        <div className="floating-particle" />
        <div className="floating-particle" />
        <div className="floating-particle" />
        <div className="floating-particle" />
      </div>

      <div className="hud-overlay">
        <div className="hud-left">
          <div className="score-display">
            <i className="fas fa-star" />
            <span id="score">0</span>
          </div>
          <div className="combo-display">
            <i className="fas fa-fire" />
            <span id="combo">0</span>
          </div>
        </div>
        <div className="hud-center">
          <div className="time-display">
            <i className="fas fa-clock" />
            <span id="time">60</span>
          </div>
        </div>
        <div className="hud-right">
          <div className="highscore-display">
            <i className="fas fa-trophy" />
            <span id="highScore">0</span>
          </div>
        </div>
      </div>

      <div className="game-container">
        <div className="game-title">
          <h1>EPIC WHAC-A-MOLE</h1>
          <div className="title-glow" />
        </div>

        <div className="game-arena">
          <div className="game-board" id="gameBoard">
            {holes.map((holeIndex) => (
              <div className="hole" data-hole={holeIndex} key={holeIndex}>
                <div className="hole-glow" />
                <div className="mole">
                  <div className="mole-body" />
                  <div className="mole-eyes" />
                  <div className="hit-effect" />
                </div>
              </div>
            ))}
          </div>

          <div className="controls">
            <button className="start-btn" id="startBtn" type="button">
              <i className="fas fa-play" />
              <span>START GAME</span>
              <div className="btn-glow" />
            </button>
            <button className="reset-btn" id="resetBtn" type="button">
              <i className="fas fa-redo" />
              <span>RESET</span>
              <div className="btn-glow" />
            </button>
          </div>
        </div>
      </div>

      <div className="particles-container" id="particlesContainer" />

      <div className="game-over" id="gameOverModal">
        <div className="game-over-content">
          <div className="modal-glow" />
          <h2>
            <i className="fas fa-trophy" /> GAME OVER! <i className="fas fa-trophy" />
          </h2>
          <div className="final-score" id="finalScore">
            Your Score: 0
          </div>
          <div className="high-score-display" id="highScoreDisplay">
            Best Score: 0
          </div>
          <button className="start-btn" type="button" onClick={handlePlayAgain}>
            <i className="fas fa-play" />
            <span>PLAY AGAIN</span>
            <div className="btn-glow" />
          </button>
        </div>
      </div>
    </div>
  );
}
