// UIManager.js - Handles All Menus, HUD, Laddus & Lord Shiva Chaser Alert
import confetti from 'canvas-confetti';
import { characterTextures } from '../graphics/RealisticCharacterTextures.js';

export class UIManager {
  constructor() {
    this.game = null;

    this.screens = {
      nameEntry: document.getElementById('name-entry-screen'),
      cinematic: document.getElementById('cinematic-screen'),
      mainMenu: document.getElementById('main-menu-screen'),
      hud: document.getElementById('hud-screen'),
      pauseMenu: document.getElementById('pause-screen'),
      gameOver: document.getElementById('game-over-screen'),
      leaderboard: document.getElementById('leaderboard-modal'),
      characters: document.getElementById('characters-modal'),
      powerups: document.getElementById('powerups-modal'),
      settings: document.getElementById('settings-modal'),
      howToPlay: document.getElementById('how-to-play-modal'),
      calibrate: document.getElementById('calibrate-modal')
    };

    this.hudElements = {
      score: document.getElementById('hud-score'),
      distance: document.getElementById('hud-distance'),
      coins: document.getElementById('hud-coins'),
      zone: document.getElementById('hud-zone'),
      multiplier: document.getElementById('hud-multiplier'),
      shivaGauge: document.getElementById('shiva-gauge-fill'),
      shivaAlert: document.getElementById('hud-shiva-alert'),
      energySegments: [
        document.getElementById('seg-1'),
        document.getElementById('seg-2'),
        document.getElementById('seg-3'),
        document.getElementById('seg-4')
      ],
      energyText: document.getElementById('divine-meter-text'),
      divineBtn: document.getElementById('divine-mode-btn'),
      shieldBadge: document.getElementById('badge-shield'),
      magnetBadge: document.getElementById('badge-magnet'),
      magnetTime: document.getElementById('badge-magnet-time'),
      multiplierBadge: document.getElementById('badge-multiplier'),
      multiplierTime: document.getElementById('badge-multiplier-time'),
      mushikaBadge: document.getElementById('badge-mushika'),
      mushikaTime: document.getElementById('badge-mushika-time'),
      tutorialBox: document.getElementById('hud-tutorial-prompt'),
      divineBanner: document.getElementById('divine-mode-banner')
    };

    this.bindEvents();
    this.initTargetBadge();
  }

  initTargetBadge() {
    const drawBadge = () => {
      const canvas = document.getElementById('target-ganesha-badge-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const tex = characterTextures.textures.ganeshaFront;
      if (tex && tex.image) {
        ctx.clearRect(0, 0, 48, 48);
        ctx.drawImage(tex.image, 0, 0, 48, 48);
      }
    };
    drawBadge();
    characterTextures.onReady(() => drawBadge());
  }

  setGame(game) {
    this.game = game;
  }

  bindEvents() {
    // 1. Name Entry
    const nameInput = document.getElementById('player-name-input');
    const continueBtn = document.getElementById('name-continue-btn');
    const errorMsg = document.getElementById('name-error-msg');

    const handleNameSubmit = () => {
      const name = (nameInput.value || '').trim();
      if (name.length === 0) {
        errorMsg.classList.remove('hidden');
        nameInput.focus();
        return;
      }
      errorMsg.classList.add('hidden');
      this.game.score.setPlayerName(name);
      this.showCinematicIntro(name);
    };

    continueBtn?.addEventListener('click', handleNameSubmit);
    nameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleNameSubmit();
    });

    // 2. Cinematic Screen Start Run
    document.getElementById('cinematic-start-btn')?.addEventListener('click', () => {
      this.screens.cinematic.classList.add('hidden');
      this.showMainMenu();
    });

    // 3. Main Menu Buttons
    document.getElementById('menu-play-btn')?.addEventListener('click', () => {
      this.screens.mainMenu.classList.add('hidden');
      this.game.startRun();
    });

    document.getElementById('menu-characters-btn')?.addEventListener('click', () => {
      this.screens.characters.classList.remove('hidden');
    });

    document.getElementById('menu-powerups-btn')?.addEventListener('click', () => {
      this.screens.powerups.classList.remove('hidden');
    });

    document.getElementById('menu-leaderboard-btn')?.addEventListener('click', () => {
      this.renderLeaderboard();
      this.screens.leaderboard.classList.remove('hidden');
    });

    document.getElementById('menu-howtoplay-btn')?.addEventListener('click', () => {
      this.screens.howToPlay.classList.remove('hidden');
    });

    document.getElementById('menu-settings-btn')?.addEventListener('click', () => {
      this.screens.settings.classList.remove('hidden');
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.add('hidden');
      });
    });

    // 4. Character Outfit Selection
    document.querySelectorAll('.outfit-card').forEach(card => {
      card.addEventListener('click', (e) => {
        document.querySelectorAll('.outfit-card').forEach(c => c.classList.remove('active'));
        const el = e.currentTarget;
        el.classList.add('active');
        const outfitId = el.dataset.outfit;
        this.game.ganesha.setOutfit(outfitId);
      });
    });

    // 5. Settings Controls
    document.querySelectorAll('.control-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.control-mode-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const mode = e.currentTarget.dataset.mode;
        this.game.input.setControlMode(mode);
      });
    });

    document.querySelectorAll('.sensitivity-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.sensitivity-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const sens = e.currentTarget.dataset.sens;
        this.game.input.setSensitivity(sens);
      });
    });

    document.getElementById('open-calibrate-btn')?.addEventListener('click', () => {
      this.screens.calibrate.classList.remove('hidden');
    });

    document.getElementById('calibrate-action-btn')?.addEventListener('click', () => {
      this.game.input.requestTiltPermission().then(() => {
        this.game.input.calibratePhone();
        const statusEl = document.getElementById('calibrate-status');
        if (statusEl) {
          statusEl.textContent = '✓ Calibrated Successfully!';
          statusEl.style.color = '#4ade80';
        }
        setTimeout(() => {
          this.screens.calibrate.classList.add('hidden');
          if (statusEl) statusEl.textContent = '';
        }, 800);
      });
    });

    document.getElementById('toggle-music')?.addEventListener('change', (e) => {
      this.game.sound.setMusicEnabled(e.target.checked);
    });

    document.getElementById('toggle-sfx')?.addEventListener('change', (e) => {
      this.game.sound.setSfxEnabled(e.target.checked);
    });

    // 6. HUD Pause Button
    document.getElementById('hud-pause-btn')?.addEventListener('click', () => {
      this.game.togglePause();
    });

    this.hudElements.divineBtn?.addEventListener('click', () => {
      this.game.handleDivineActivation();
    });

    // 7. Pause Screen Buttons
    document.getElementById('pause-resume-btn')?.addEventListener('click', () => {
      this.game.togglePause();
    });

    document.getElementById('pause-restart-btn')?.addEventListener('click', () => {
      this.screens.pauseMenu.classList.add('hidden');
      this.game.startRun();
    });

    document.getElementById('pause-settings-btn')?.addEventListener('click', () => {
      this.screens.settings.classList.remove('hidden');
    });

    document.getElementById('pause-menu-btn')?.addEventListener('click', () => {
      this.screens.pauseMenu.classList.add('hidden');
      this.screens.hud.classList.add('hidden');
      this.showMainMenu();
    });

    // 8. Game Over Screen Buttons
    document.getElementById('gameover-retry-btn')?.addEventListener('click', () => {
      this.screens.gameOver.classList.add('hidden');
      this.game.startRun();
    });

    document.getElementById('gameover-menu-btn')?.addEventListener('click', () => {
      this.screens.gameOver.classList.add('hidden');
      this.screens.hud.classList.add('hidden');
      this.showMainMenu();
    });

    // Mobile touch accessibility buttons
    document.getElementById('touch-left-btn')?.addEventListener('click', () => this.game.handleMoveLeft());
    document.getElementById('touch-right-btn')?.addEventListener('click', () => this.game.handleMoveRight());
    document.getElementById('touch-jump-btn')?.addEventListener('click', () => this.game.handleJump());
    document.getElementById('touch-slide-btn')?.addEventListener('click', () => this.game.handleSlide());
  }

  checkInitialScreen() {
    if (this.game.score.hasPlayerName()) {
      this.showMainMenu();
    } else {
      this.screens.nameEntry.classList.remove('hidden');
    }
  }

  showCinematicIntro(playerName) {
    this.screens.nameEntry.classList.add('hidden');
    this.screens.cinematic.classList.remove('hidden');

    const welcomeEl = document.getElementById('cinematic-player-welcome');
    if (welcomeEl) welcomeEl.textContent = `WELCOME, ${playerName.toUpperCase()}!`;

    this.game.startCinematicIntro();
  }

  showMainMenu() {
    Object.values(this.screens).forEach(s => s?.classList.add('hidden'));
    this.screens.mainMenu.classList.remove('hidden');

    const nameBadge = document.getElementById('menu-player-badge');
    if (nameBadge) {
      nameBadge.textContent = `RUNNER: ${this.game.score.getPlayerName().toUpperCase()}`;
    }

    const highScoreBadge = document.getElementById('menu-highscore-badge');
    if (highScoreBadge) {
      highScoreBadge.textContent = `HIGH SCORE: ${this.game.score.highScore.toLocaleString()}`;
    }

    this.game.enterMainMenu();
  }

  showHUD() {
    Object.values(this.screens).forEach(s => s?.classList.add('hidden'));
    this.screens.hud.classList.remove('hidden');
  }

  showPauseMenu(visible) {
    if (visible) {
      this.screens.pauseMenu.classList.remove('hidden');
    } else {
      this.screens.pauseMenu.classList.add('hidden');
    }
  }

  showGameOverScreen(scoreObj) {
    this.screens.hud.classList.add('hidden');
    this.screens.gameOver.classList.remove('hidden');

    document.getElementById('gameover-player-name').textContent = scoreObj.getPlayerName().toUpperCase();
    document.getElementById('gameover-score').textContent = scoreObj.score.toLocaleString();
    document.getElementById('gameover-distance').textContent = `${Math.floor(scoreObj.distance)}m`;
    const coinsEl = document.getElementById('gameover-coins');
    if (coinsEl) coinsEl.textContent = (scoreObj.laddus || scoreObj.coins || 0).toString();
    const bestEl = document.getElementById('gameover-modaks');
    if (bestEl) bestEl.textContent = (scoreObj.highScore || scoreObj.score || 0).toLocaleString();

    const highBanner = document.getElementById('gameover-highscore-banner');
    if (scoreObj.isNewHighScore) {
      highBanner?.classList.remove('hidden');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#ff6b00', '#ff0055', '#48cae4']
      });
    } else {
      highBanner?.classList.add('hidden');
    }
  }

  showDivineModeBanner() {
    const banner = this.hudElements.divineBanner;
    if (!banner) return;
    banner.classList.remove('hidden');
    banner.classList.add('animate-pulse');
    setTimeout(() => {
      banner.classList.add('hidden');
      banner.classList.remove('animate-pulse');
    }, 2400);
  }

  updateTutorialPrompt(steps) {
    const box = this.hudElements.tutorialBox;
    if (!box) return;

    if (!steps.movedLeft || !steps.movedRight) {
      box.textContent = '💡 SWIPE LEFT / RIGHT OR PRESS A / D TO CHANGE LANES';
      box.classList.remove('hidden');
    } else if (!steps.jumped) {
      box.textContent = '💡 SWIPE UP OR PRESS W / SPACE TO JUMP OVER BARRICADES';
      box.classList.remove('hidden');
    } else if (!steps.slid) {
      box.textContent = '💡 SWIPE DOWN OR PRESS S TO SLIDE UNDER TORANS';
      box.classList.remove('hidden');
    } else {
      box.classList.add('hidden');
      this.game.score.setTutorialDone();
    }
  }

  updateHUD(data) {
    if (this.hudElements.score) {
      this.hudElements.score.textContent = String(data.score).padStart(6, '0');
    }
    if (this.hudElements.distance) {
      this.hudElements.distance.textContent = `${data.distance}m`;
    }
    if (this.hudElements.coins) {
      this.hudElements.coins.textContent = (data.coins || 0).toString();
    }
    if (this.hudElements.zone) {
      this.hudElements.zone.textContent = data.zoneName;
    }

    if (this.hudElements.multiplier) {
      this.hudElements.multiplier.textContent = `x${data.multiplier || 1}`;
    }

    // Energy segments (0 - 100%)
    const pct = Math.min(100, Math.round(data.divineMeter || 0));
    if (this.hudElements.energyText) {
      this.hudElements.energyText.textContent = `${pct}%`;
    }
    if (this.hudElements.energySegments) {
      this.hudElements.energySegments.forEach((seg, idx) => {
        if (!seg) return;
        const threshold = (idx + 1) * 25;
        if (pct >= threshold - 15) {
          seg.classList.add('active');
        } else {
          seg.classList.remove('active');
        }
      });
    }

    // Divine Mode ready button
    if (this.hudElements.divineBtn) {
      if (pct >= 100 || data.isDivineMode) {
        this.hudElements.divineBtn.classList.remove('hidden');
      } else {
        this.hudElements.divineBtn.classList.add('hidden');
      }
    }

    // Active power-up badges
    if (this.hudElements.shieldBadge) {
      this.hudElements.shieldBadge.classList.toggle('hidden', !data.hasShield);
    }
    if (this.hudElements.magnetBadge) {
      this.hudElements.magnetBadge.classList.toggle('hidden', !data.isMagnet);
      if (this.hudElements.magnetTime) this.hudElements.magnetTime.textContent = `${data.magnetTime}s`;
    }
    if (this.hudElements.multiplierBadge) {
      this.hudElements.multiplierBadge.classList.toggle('hidden', !data.isMultiplier);
      if (this.hudElements.multiplierTime) this.hudElements.multiplierTime.textContent = `${data.multiplierTime}s`;
    }
    if (this.hudElements.mushikaBadge) {
      this.hudElements.mushikaBadge.classList.toggle('hidden', !data.isMushika);
      if (this.hudElements.mushikaTime) this.hudElements.mushikaTime.textContent = `${data.mushikaTime}s`;
    }

    // Shiva Chase Gauge (Bottom Left)
    if (this.hudElements.shivaGauge) {
      const dangerPct = data.shivaDangerPercent || 15;
      this.hudElements.shivaGauge.style.width = `${Math.max(12, Math.min(100, dangerPct))}%`;
      if (dangerPct > 65) {
        this.hudElements.shivaGauge.classList.add('danger');
      } else {
        this.hudElements.shivaGauge.classList.remove('danger');
      }
    }

    // Shiva Warning Banner
    if (this.hudElements.shivaAlert) {
      this.hudElements.shivaAlert.classList.toggle('hidden', !data.isShivaClose);
    }
  }

  renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const list = this.game.score.getCombinedGlobalLeaderboard();
    list.forEach(item => {
      const tr = document.createElement('tr');
      if (item.isCurrentPlayer) tr.classList.add('player-row');

      tr.innerHTML = `
        <td class="rank-col">${item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}</td>
        <td class="name-col">${item.name}</td>
        <td class="dist-col">${item.distance}m</td>
        <td class="score-col">${item.score.toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}
