// UIManager.js - Handles All Menus, HUD, Laddus & Lord Shiva Chaser Alert
import confetti from 'canvas-confetti';
import { characterTextures } from '../graphics/RealisticCharacterTextures.js';

export class UIManager {
  constructor() {
    this.game = null;

    this.screens = {
      startScreen: document.getElementById('start-screen'),
      hud: document.getElementById('hud-screen'),
      pauseMenu: document.getElementById('pause-screen'),
      gameOver: document.getElementById('game-over-screen'),
      characters: document.getElementById('characters-modal'),
      settings: document.getElementById('settings-modal'),
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
    // 1. Direct Start Screen Tap / Click (Subway Surfers instant play)
    const startTapBtn = document.getElementById('start-tap-button');
    const startScreen = document.getElementById('start-screen');
    const triggerStart = () => {
      if (this.screens.startScreen && !this.screens.startScreen.classList.contains('hidden')) {
        this.screens.startScreen.classList.add('hidden');
        this.game?.startRun();
      }
    };

    startTapBtn?.addEventListener('click', triggerStart);
    startScreen?.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        triggerStart();
      }
    });

    document.getElementById('menu-characters-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.screens.characters?.classList.remove('hidden');
    });

    document.getElementById('menu-settings-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.screens.settings?.classList.remove('hidden');
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

  }

  checkInitialScreen() {
    this.showStartScreen();
  }

  showStartScreen() {
    Object.values(this.screens).forEach(s => s?.classList.add('hidden'));
    this.screens.startScreen?.classList.remove('hidden');

    const highScoreBadge = document.getElementById('menu-highscore-badge');
    if (highScoreBadge && this.game) {
      highScoreBadge.textContent = `BEST: ${this.game.score.highScore.toLocaleString()}`;
    }

    this.game?.enterMainMenu();
  }

  showMainMenu() {
    this.showStartScreen();
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
    // Intrusive tutorial boxes removed to keep tracks clean and unobstructed
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
