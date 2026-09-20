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
      calibrate: document.getElementById('calibrate-modal'),
      themes: document.getElementById('themes-modal')
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
    this.initThemePreferences();
    this.initAvatarPreferences();
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

  initAvatarPreferences() {
    const savedAvatar = localStorage.getItem('ganesh_selected_avatar') || 'bal_ganesha';
    document.querySelectorAll('#avatar-selection-grid .avatar-card').forEach(card => {
      const name = card.querySelector('.avatar-card-name');
      if (card.dataset.avatar === savedAvatar) {
        card.classList.add('active');
        card.style.borderColor = '#ffd700';
        card.style.background = 'linear-gradient(90deg, rgba(255, 215, 0, 0.22), rgba(255, 136, 0, 0.12))';
        if (name) name.style.color = '#ffd700';
      } else {
        card.classList.remove('active');
        card.style.borderColor = 'rgba(255, 215, 0, 0.28)';
        card.style.background = 'rgba(255, 255, 255, 0.05)';
        if (name) name.style.color = '#fff';
      }
    });
  }

  initThemePreferences() {
    const savedTheme = localStorage.getItem('ganesh_selected_theme') || 'AUTO';
    const savedWeather = localStorage.getItem('ganesh_selected_weather') || 'AUTO';

    document.querySelectorAll('#location-theme-grid .theme-card').forEach(card => {
      if (card.dataset.theme === savedTheme) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    document.querySelectorAll('#weather-theme-grid .theme-card').forEach(card => {
      if (card.dataset.weather === savedWeather) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
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
      this.initAvatarPreferences();
      this.screens.characters?.classList.remove('hidden');
    });

    // 3D Playable Avatar Card Selection
    document.querySelectorAll('#avatar-selection-grid .avatar-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const el = e.currentTarget;
        const avatarId = el.dataset.avatar;
        localStorage.setItem('ganesh_selected_avatar', avatarId);
        this.initAvatarPreferences();
        this.game?.setAvatar(avatarId);
      });
    });

    document.getElementById('menu-settings-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.screens.settings?.classList.remove('hidden');
    });

    document.getElementById('menu-themes-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.initThemePreferences();
      this.screens.themes?.classList.remove('hidden');
    });

    // Theme & Weather Card Selection
    document.querySelectorAll('#location-theme-grid .theme-card').forEach(card => {
      card.addEventListener('click', (e) => {
        document.querySelectorAll('#location-theme-grid .theme-card').forEach(c => c.classList.remove('active'));
        const el = e.currentTarget;
        el.classList.add('active');
        const themeId = el.dataset.theme;
        localStorage.setItem('ganesh_selected_theme', themeId);
        this.game?.setManualTheme(themeId);
      });
    });

    document.querySelectorAll('#weather-theme-grid .theme-card').forEach(card => {
      card.addEventListener('click', (e) => {
        document.querySelectorAll('#weather-theme-grid .theme-card').forEach(c => c.classList.remove('active'));
        const el = e.currentTarget;
        el.classList.add('active');
        const weatherId = el.dataset.weather;
        localStorage.setItem('ganesh_selected_weather', weatherId);
        this.game?.setManualWeather(weatherId);
      });
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
    if (this.screens.hud) this.screens.hud.classList.add('hidden');
    if (this.screens.gameOver) this.screens.gameOver.classList.remove('hidden');

    const nameEl = document.getElementById('gameover-player-name');
    if (nameEl && typeof scoreObj?.getPlayerName === 'function') {
      nameEl.textContent = scoreObj.getPlayerName().toUpperCase();
    }

    const scoreVal = Math.max(0, Math.round(scoreObj?.score || 0));
    const distVal = Math.max(0, Math.floor(scoreObj?.distance || 0));
    const laddusVal = Math.max(0, scoreObj?.laddus || scoreObj?.coins || 0);
    const bestVal = Math.max(scoreVal, scoreObj?.highScore || 0);

    const scoreEl = document.getElementById('gameover-score');
    if (scoreEl) scoreEl.textContent = scoreVal.toLocaleString();

    const distEl = document.getElementById('gameover-distance');
    if (distEl) distEl.textContent = `${distVal}m`;

    const coinsEl = document.getElementById('gameover-coins');
    if (coinsEl) coinsEl.textContent = laddusVal.toString();

    const bestEl = document.getElementById('gameover-modaks');
    if (bestEl) bestEl.textContent = bestVal.toLocaleString();

    const highBanner = document.getElementById('gameover-highscore-banner');
    if (scoreObj?.isNewHighScore) {
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

  showLocationBanner(theme, weather) {
    const banner = document.getElementById('hud-location-banner');
    const iconEl = document.getElementById('hud-loc-icon');
    const titleEl = document.getElementById('hud-loc-title');
    const subEl = document.getElementById('hud-loc-sub');

    if (!banner || !titleEl || !theme || !weather) return;

    if (iconEl) iconEl.textContent = theme.icon || '📍';
    titleEl.textContent = (theme.name || 'TEMPLE REGION').toUpperCase();
    if (subEl) subEl.textContent = `${theme.subtitle || ''} • ${weather.icon || ''} ${weather.name || ''}`;

    banner.classList.remove('hidden');

    // Reset animation by removing and re-adding
    banner.style.animation = 'none';
    void banner.offsetWidth; // trigger DOM reflow
    banner.style.animation = '';

    if (this._bannerTimeout) clearTimeout(this._bannerTimeout);
    this._bannerTimeout = setTimeout(() => {
      banner.classList.add('hidden');
    }, 3200);
  }
}
