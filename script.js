class ClickGame {
  constructor(difficulty) {
    this.difficulty = difficulty;
    this.gameArea = document.getElementById('game');
    this.timeDisplay = document.getElementById('time');
    this.scoreDisplay = document.getElementById('score');
    this.recordDisplay = document.getElementById('record');
    this.score = 0;
    this.timeLeft = difficulty === 'hard' ? 20 : 30;
    this.targetSize = difficulty === 'hard' ? 30 : 50;
    this.targetMoveInterval = difficulty === 'hard' ? 800 : null;
    this.targetMoveTimer = null;
    this.gameInterval = null;

    this.record = Number(localStorage.getItem(`record-${difficulty}`)) || 0;
    this.updateRecordDisplay();
    this.createResultModal();
    this.setupRestartButton();
  }

  setupRestartButton() {
    document.getElementById('restart-btn').onclick = () => {
      location.reload(); // Перезапуск з поверненням до головного меню
    };
  }

  updateRecordDisplay() {
    this.recordDisplay.textContent = this.record;
  }

  set updateScore(val) {
    this.score = val;
    this.scoreDisplay.textContent = this.score;
  }

  get currentScore() {
    return this.score;
  }

  startGame() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    this.hideResultModal();
    this.updateScore = 0;
    this.timeDisplay.textContent = this.timeLeft;
    this.spawnTarget();

    clearInterval(this.gameInterval);
    this.gameInterval = setInterval(() => {
      this.timeLeft--;
      this.timeDisplay.textContent = this.timeLeft;

      if (this.timeLeft === 0) {
        clearInterval(this.gameInterval);
        clearInterval(this.targetMoveTimer);
        this.gameArea.innerHTML = '';
        this.endGame();
      }
    }, 1000);

    // Рух цілі (тільки для складного рівня)
    if (this.targetMoveInterval) {
      this.targetMoveTimer = setInterval(() => {
        const existing = document.querySelector('.target');
        if (existing) {
          const [x, y] = [
            Math.random() * (450 - this.targetSize),
            Math.random() * (350 - this.targetSize),
          ];
          existing.style.left = `${x}px`;
          existing.style.top = `${y}px`;
        }
      }, this.targetMoveInterval);
    }
  }

  endGame() {
    this.showResultModal();
    if (this.score > this.record) {
      this.record = this.score;
      localStorage.setItem(`record-${this.difficulty}`, this.record);
      this.updateRecordDisplay();
    }
  }

  spawnTarget() {
    const target = document.createElement('div');
    target.classList.add('target');
    target.style.width = this.targetSize + 'px';
    target.style.height = this.targetSize + 'px';

    const [x, y] = [
      Math.random() * (450 - this.targetSize),
      Math.random() * (350 - this.targetSize),
    ];

    Object.assign(target.style, {
      top: `${y}px`,
      left: `${x}px`,
    });

    target.onclick = () => {
      this.updateScore = this.currentScore + 1;
      target.remove();
      if (this.timeLeft > 0) this.spawnTarget();
    };

    this.gameArea.innerHTML = '';
    this.gameArea.appendChild(target);
  }

  createResultModal() {
    const modal = document.createElement('div');
    modal.id = 'result-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <p id="result-text"></p>
        <button id="close-modal-btn">OK</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('close-modal-btn').onclick = () => {
      this.hideResultModal();
    };
  }

  showResultModal() {
    document.getElementById('result-text').textContent = `Гру завершено! Ваш результат: ${this.score} очок`;
    document.getElementById('result-modal').classList.add('visible');
  }

  hideResultModal() {
    document.getElementById('result-modal').classList.remove('visible');
  }
}

let game = null;

function startGame(difficulty) {
  game = new ClickGame(difficulty);
  game.startGame();
}
