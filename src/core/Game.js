// Game.js - Core 3D Game Engine with Subway Surfers-style Chaser (Lord Shiva)
import * as THREE from 'three';
import { GaneshaModel } from '../graphics/GaneshaModel.js';
import { EnvironmentManager } from '../graphics/EnvironmentManager.js';
import { ParticleSystem } from '../graphics/ParticleSystem.js';
import { ObstacleManager } from '../entities/ObstacleManager.js';
import { CollectibleManager, ITEM_TYPES } from '../entities/CollectibleManager.js';
import { PowerUpManager } from '../entities/PowerUpManager.js';
import { ChaserManager } from '../entities/ChaserManager.js';
import { InputManager } from './InputManager.js';
import { ScoreManager } from './ScoreManager.js';
import { SoundManager } from '../audio/SoundManager.js';

export const GAME_STATE = {
  NAME_ENTRY: 'NAME_ENTRY',
  CINEMATIC: 'CINEMATIC',
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

export class Game {
  constructor(canvasContainer, uiManager) {
    this.container = canvasContainer;
    this.ui = uiManager;

    this.state = GAME_STATE.NAME_ENTRY;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Game Managers
    this.sound = new SoundManager();
    this.particles = null;
    this.ganesha = null;
    this.chaser = null; // Lord Shiva chasing behind Ganesha!
    this.environment = null;
    this.obstacles = null;
    this.collectibles = null;
    this.powerUps = null;
    this.input = null;
    this.score = new ScoreManager();

    // Lanes & Movement
    this.lanes = [-3.0, 0, 3.0];
    this.currentLane = 1; // 0: Left, 1: Center, 2: Right
    this.targetX = 0;
    this.currentX = 0;

    // Speeds - Starts gentle and accelerates progressively over run duration
    this.baseSpeed = 12.0; // m/s (comfortable starting speed)
    this.maxSpeed = 34.0;  // High-adrenaline maximum sprint
    this.currentSpeed = this.baseSpeed;
    this.runTime = 0;

    // Camera follow settings (tuned for Subway Surfers perspective)
    this.cameraTargetPos = new THREE.Vector3(0, 3.8, 6.8);
    this.cameraCurrentPos = new THREE.Vector3(0, 3.8, 6.8);
    this.cameraBaseFov = 66;
    this.cameraShakeTime = 0;
    this.cameraShakeIntensity = 0;

    this.clock = new THREE.Clock();

    this.tutorialSteps = {
      movedLeft: false,
      movedRight: false,
      jumped: false,
      slid: false
    };

    this.initEngine();
    this.setupInputs();
  }

  initEngine() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x24142e);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(this.cameraBaseFov, aspect, 0.1, 400);
    this.camera.position.copy(this.cameraCurrentPos);

    this.renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio < 2,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // Subsystems
    this.particles = new ParticleSystem(this.scene);
    this.ganesha = new GaneshaModel(this.scene);
    this.ganesha.onFootstep = (foot) => {
      if (this.state === GAME_STATE.PLAYING && !this.ganesha.isJumping && !this.ganesha.isSliding) {
        this.particles.spawnFootstepDust(this.ganesha.root.position, foot === 'left');
      }
    };
    this.chaser = new ChaserManager(this.scene, this.sound);
    this.environment = new EnvironmentManager(this.scene);
    this.environment.onThemeChange = (theme, weather) => {
      this.ui?.showLocationBanner(theme, weather);
    };

    // Restore saved theme & weather preferences from Main Menu selection
    const savedTheme = localStorage.getItem('ganesh_selected_theme');
    const savedWeather = localStorage.getItem('ganesh_selected_weather');
    if (savedTheme && savedTheme !== 'AUTO') {
      this.environment.setThemeMode('MANUAL', savedTheme);
    }
    if (savedWeather && savedWeather !== 'AUTO') {
      this.environment.setWeatherMode('MANUAL', savedWeather);
    }

    // Restore saved avatar preference
    const savedAvatar = localStorage.getItem('ganesh_selected_avatar') || 'bal_ganesha';
    this.ganesha.setAvatar(savedAvatar);

    this.environment.initWorld();
    this.collectibles = new CollectibleManager(this.scene, this.particles, this.sound);
    this.obstacles = new ObstacleManager(this.scene, this.particles, this.sound, this.collectibles);
    this.powerUps = new PowerUpManager(this.scene, this.particles, this.sound, this.ganesha);
    this.input = new InputManager();

    window.addEventListener('resize', () => this.onWindowResize());
    this.animate();
  }

  setupInputs() {
    this.input.onMoveLeft = () => this.handleMoveLeft();
    this.input.onMoveRight = () => this.handleMoveRight();
    this.input.onJump = () => this.handleJump();
    this.input.onSlide = () => this.handleSlide();
    this.input.onPause = () => this.togglePause();
    this.input.onActivateDivine = () => this.handleDivineActivation();
    this.input.onActivateTrunk = () => this.handleTrunkPower();
    this.input.onTap = () => this.handleTap();
    this.input.onAnyInput = () => this.handleAnyInput();
  }

  handleTap() {
    if (this.state === GAME_STATE.MENU || this.state === GAME_STATE.NAME_ENTRY || this.state === GAME_STATE.CINEMATIC) {
      this.startRun();
    }
  }

  handleAnyInput() {
    if (this.state === GAME_STATE.MENU || this.state === GAME_STATE.NAME_ENTRY || this.state === GAME_STATE.CINEMATIC) {
      this.startRun();
    }
  }

  handleMoveLeft() {
    if (this.state !== GAME_STATE.PLAYING) {
      this.handleAnyInput();
      return;
    }
    const now = performance.now();
    if (now - this.lastLaneChangeTime < 180) return; // Exactly 1 track per swipe!

    if (this.currentLane > 0) {
      this.currentLane--;
      this.targetX = this.lanes[this.currentLane];
      this.sound.playLaneChange();
      this.lastLaneChangeTime = now;
    }
  }

  handleMoveRight() {
    if (this.state !== GAME_STATE.PLAYING) {
      this.handleAnyInput();
      return;
    }
    const now = performance.now();
    if (now - this.lastLaneChangeTime < 180) return; // Exactly 1 track per swipe!

    if (this.currentLane < 2) {
      this.currentLane++;
      this.targetX = this.lanes[this.currentLane];
      this.sound.playLaneChange();
      this.lastLaneChangeTime = now;
    }
  }

  handleJump() {
    if (this.state !== GAME_STATE.PLAYING) {
      this.handleAnyInput();
      return;
    }
    this.ganesha.jump();
    this.sound.playJump();
  }

  handleSlide() {
    if (this.state !== GAME_STATE.PLAYING) {
      this.handleAnyInput();
      return;
    }
    this.ganesha.slide();
    this.sound.playSlide();
  }

  handleDivineActivation() {
    if (this.state !== GAME_STATE.PLAYING) return;
    if (this.powerUps.activateDivineMode()) {
      this.ui.showDivineModeBanner();
      this.triggerCameraShake(0.6, 0.4);
    }
  }

  handleTrunkPower() {
    if (this.state !== GAME_STATE.PLAYING) return;
    if (this.powerUps.trunkPowerReady) {
      this.powerUps.activateTrunkPower(this.obstacles, this.ganesha.root.position.z, this.currentLane);
      this.triggerCameraShake(0.4, 0.35);
    }
  }

  triggerCameraShake(duration, intensity) {
    this.cameraShakeTime = duration;
    this.cameraShakeIntensity = intensity;
  }

  startCinematicIntro() {
    this.state = GAME_STATE.CINEMATIC;
    this.sound.init();
    this.sound.playTempleBell(320, 4.0);

    this.ganesha.setFrontFacing(true);
    this.camera.position.set(0, 1.8, 4.2);
    this.camera.lookAt(0, 1.4, 0);

    for (let i = 0; i < 25; i++) {
      this.particles.burstGoldenSparkles(new THREE.Vector3((Math.random() - 0.5) * 3, 2.5, (Math.random() - 0.5) * 3), 4);
      this.particles.burstFlowerPetals(new THREE.Vector3((Math.random() - 0.5) * 4, 3.0, (Math.random() - 0.5) * 4), 3);
    }
  }

  enterMainMenu() {
    this.state = GAME_STATE.MENU;
    this.ganesha.setFrontFacing(true);
    this.camera.position.set(0, 1.8, 4.8);
    this.camera.lookAt(0, 1.3, 0);
  }

  setManualTheme(themeId) {
    if (!this.environment) return;
    if (themeId === 'AUTO') {
      this.environment.setThemeMode('AUTO');
    } else {
      this.environment.setThemeMode('MANUAL', themeId);
    }
  }

  setManualWeather(weatherId) {
    if (!this.environment) return;
    if (weatherId === 'AUTO') {
      this.environment.setWeatherMode('AUTO');
    } else {
      this.environment.setWeatherMode('MANUAL', weatherId);
    }
  }

  setAvatar(avatarId) {
    if (this.ganesha) {
      this.ganesha.setAvatar(avatarId);
    }
  }

  startRun() {
    this.resetRun();
    this.ganesha.setFrontFacing(false);
    this.state = GAME_STATE.PLAYING;
    this.sound.startRunningMusic();
    this.ui.showHUD();
    this.ui.updateHUD({
      score: this.score.score,
      distance: Math.floor(this.score.distance),
      coins: this.score.laddus,
      laddus: this.score.laddus,
      multiplier: this.powerUps.getScoreMultiplier(),
      divineMeter: this.powerUps.divineMeter,
      isDivineMode: this.powerUps.isDivineMode,
      hasShield: this.powerUps.hasShield,
      isMushika: this.powerUps.isMushikaActive,
      mushikaTime: 0,
      isMagnet: this.powerUps.isMagnetActive,
      magnetTime: 0,
      isMultiplier: this.powerUps.isMultiplierActive,
      multiplierTime: 0,
      zoneName: `${this.environment.getCurrentTheme().name} • ${this.environment.getCurrentWeather().icon}`,
      isShivaClose: false,
      shivaDangerPercent: 15
    });
    this.ui.updateTutorialPrompt(this.tutorialSteps);
    this.ui.showLocationBanner(this.environment.getCurrentTheme(), this.environment.getCurrentWeather());
  }

  resetRun() {
    this.currentLane = 1;
    this.targetX = 0;
    this.currentX = 0;
    this.currentSpeed = this.baseSpeed;
    this.runTime = 0;
    this.gracePeriodTimer = 3.5; // 3.5s safe start grace period
    this.lastLaneChangeTime = 0;

    this.ganesha.reset();
    this.chaser.reset();
    this.environment.reset();
    this.obstacles.reset();
    this.collectibles.reset();
    this.powerUps.reset();
    this.particles.reset();
    this.score.reset();

    this.tutorialSteps = {
      movedLeft: false,
      movedRight: false,
      jumped: false,
      slid: false
    };

    this.cameraCurrentPos.set(0, 3.8, 6.8);
    this.camera.position.copy(this.cameraCurrentPos);
  }

  togglePause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.PAUSED;
      this.sound.stopMusic();
      this.ui.showPauseMenu(true);
    } else if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
      this.sound.startRunningMusic();
      this.ui.showPauseMenu(false);
    }
  }

  gameOver() {
    this.state = GAME_STATE.GAME_OVER;
    this.sound.stopMusic();
    this.sound.playCollision();

    // Lord Shiva catches Ganesha warmly!
    this.ganesha.setFrontFacing(true);
    this.chaser.triggerCaught();
    this.triggerCameraShake(0.8, 0.6);

    this.score.finalizeRun();

    if (this.score.isNewHighScore) {
      this.sound.playHighScore();
    }

    setTimeout(() => {
      this.ui.showGameOverScreen(this.score);
    }, 1100);
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (this.state === GAME_STATE.PLAYING) {
      this.updatePlaying(delta);
    } else if (this.state === GAME_STATE.MENU || this.state === GAME_STATE.CINEMATIC) {
      this.updateMenuCinematic(delta);
    } else if (this.state === GAME_STATE.GAME_OVER) {
      // Gentle slow-motion camera drift around Shiva & Ganesha
      this.camera.position.x += delta * 0.4;
      this.camera.lookAt(0, 1.2, this.ganesha.root.position.z);
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateMenuCinematic(delta) {
    const time = Date.now() * 0.0006;
    if (this.state === GAME_STATE.MENU) {
      this.camera.position.x = Math.sin(time) * 0.8;
      this.camera.position.y = 2.8 + Math.cos(time * 0.8) * 0.2;
      this.camera.lookAt(0, 1.3, 0);
    }

    this.ganesha.update(delta, 0.4);
    this.particles.update(delta);

    // Keep ambient crowds and clouds alive during menu preview
    if (this.environment) {
      if (this.environment.cloudGroup) {
        this.environment.cloudGroup.children.forEach(c => {
          c.position.x += delta * 1.8;
          if (c.position.x > 140) c.position.x = -140;
        });
      }
      const crowdTime = Date.now() * 0.001;
      for (let i = 0; i < this.environment.activeCrowdFigures.length; i++) {
        const fig = this.environment.activeCrowdFigures[i];
        if (fig.userData && fig.userData.waveArm) {
          const arm = fig.userData.waveArm;
          const baseRot = fig.userData.initialRotZ;
          const phase = fig.userData.animPhase;
          const speed = fig.userData.animSpeed;
          arm.rotation.z = baseRot + Math.sin(crowdTime * speed + phase) * 0.22;
        }
      }
    }
  }

  updatePlaying(delta) {
    // 1. Gradual Timing-Based Speed Acceleration & Distance
    this.runTime += delta;

    // Speed increases continuously and steadily over run time (+0.16 m/s every second) + distance bonus
    const timeSpeedBonus = this.runTime * 0.16;
    const distSpeedBonus = this.score.distance * 0.0028;
    const calculatedBaseSpeed = this.baseSpeed + timeSpeedBonus + distSpeedBonus;

    this.currentSpeed = Math.min(this.maxSpeed, calculatedBaseSpeed) * this.powerUps.getSpeedMultiplier();

    // Scale audio rhythm and animation tempo dynamically with runner speed
    const speedRatio = this.currentSpeed / this.baseSpeed;
    this.sound.setRunSpeed(speedRatio);

    const distanceDelta = this.currentSpeed * delta;
    this.score.addDistance(distanceDelta, this.powerUps.getScoreMultiplier());

    // 2. Lateral lane interpolation
    const diffX = this.targetX - this.currentX;
    this.currentX += diffX * Math.min(1.0, delta * 12.0);
    const bankTarget = -diffX * 0.15;
    this.ganesha.setBankAngle(bankTarget, delta);

    // Update Ganesha Position
    this.ganesha.root.position.x = this.currentX;
    this.ganesha.root.position.z -= distanceDelta;
    const playerPos = this.ganesha.root.position;

    if (this.ganesha.isSliding) {
      this.particles.spawnSlideSparks(playerPos);
    }

    // 3. Update Lord Shiva Chaser with high sprinting tempo!
    const isPowerMode = this.powerUps.isDivineMode || this.powerUps.isMushikaActive;
    this.chaser.update(delta, playerPos, this.currentX, this.currentSpeed / 8.0, isPowerMode);

    // 4. Update Subsystems
    this.ganesha.update(delta, this.currentSpeed / 8.0);
    this.environment.update(playerPos.z, this.score.distance, delta);
    this.obstacles.update(delta, playerPos.z, this.currentSpeed, this.runTime);
    this.collectibles.update(delta, playerPos.z, playerPos, this.powerUps.isMagnetActive);
    this.powerUps.update(delta, playerPos);
    this.particles.update(delta, playerPos, this.powerUps.isDivineMode, this.powerUps.isMushikaActive);

    // 5. Check Collectible Pickups (Laddus, Diyas, Flowers)
    const collected = this.collectibles.checkCollection(playerPos);
    if (collected.length > 0) {
      collected.forEach(type => {
        const mult = this.powerUps.getScoreMultiplier();
        if (type === ITEM_TYPES.COIN || type === ITEM_TYPES.LADDU) {
          this.score.addLaddu(mult);
          this.score.coins += mult; // sync coins with laddus for backwards compatibility
          this.powerUps.addDivineEnergy(10);
        } else if (type === ITEM_TYPES.DIYA) {
          this.score.addDiya(mult);
          this.powerUps.addDivineEnergy(22);
        } else if (type === ITEM_TYPES.FLOWER) {
          this.score.addFlower(mult);
          this.powerUps.addDivineEnergy(12);
        }
      });
    }

    // Dynamic Shield / Multiplier (Coin Magnet auto-activation removed so laddus never self-collect!)
    if (Math.random() < 0.0004 && !this.powerUps.hasShield) {
      this.powerUps.activateShield();
    }
    if (Math.random() < 0.0003 && !this.powerUps.isMultiplierActive) {
      this.powerUps.activateCoinMultiplier(10);
    }

    if (this.gracePeriodTimer > 0) {
      this.gracePeriodTimer -= delta;
    }

    // 6. Check Obstacle Collisions — Instant Out on Touch (Active after safe grace period)
    if (this.gracePeriodTimer <= 0) {
      const colResult = this.obstacles.checkCollision({
        position: playerPos,
        isJumping: this.ganesha.isJumping,
        isSliding: this.ganesha.isSliding
      });

      if (colResult.hit) {
        if (this.powerUps.isDivineMode || this.powerUps.isMushikaActive) {
          // Divine invincible rush smashes through obstacles
          this.obstacles.destroyObstacle(colResult.obstacle);
          this.triggerCameraShake(0.35, 0.3);
          this.score.score += 500;
        } else if (this.powerUps.hasShield) {
          // Divine shield absorbs exactly one hit
          this.powerUps.breakShield();
          this.obstacles.destroyObstacle(colResult.obstacle);
          this.triggerCameraShake(0.45, 0.35);
        } else {
          // Instant Out! Ganesha touched an obstacle -> Game Over immediately!
          this.obstacles.destroyObstacle(colResult.obstacle);
          this.triggerCameraShake(0.75, 0.6);
          this.sound.playCollision();
          this.gameOver();
          return;
        }
      }
    }

    // 7. Update Third-Person Camera (Framed with ideal perspective)
    const targetCamZ = playerPos.z + 6.8;
    const targetCamY = 3.8 + (this.ganesha.root.position.y * 0.4);
    const targetCamX = this.currentX * 0.65;

    this.cameraCurrentPos.x = THREE.MathUtils.lerp(this.cameraCurrentPos.x, targetCamX, delta * 8.0);
    this.cameraCurrentPos.y = THREE.MathUtils.lerp(this.cameraCurrentPos.y, targetCamY, delta * 6.0);
    this.cameraCurrentPos.z = targetCamZ;

    this.camera.position.copy(this.cameraCurrentPos);

    let targetFov = this.cameraBaseFov;
    if (this.powerUps.isDivineMode || this.powerUps.isMushikaActive) {
      targetFov = 82;
    } else {
      const speedProgress = Math.max(0, Math.min(1, (this.currentSpeed - this.baseSpeed) / (this.maxSpeed - this.baseSpeed)));
      targetFov = this.cameraBaseFov + speedProgress * 12.0;
    }
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, delta * 4.0);
    this.camera.updateProjectionMatrix();

    if (this.cameraShakeTime > 0) {
      this.cameraShakeTime -= delta;
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeIntensity;
    }

    this.camera.lookAt(this.currentX * 0.4, 1.4, playerPos.z - 7.0);

    // 8. Update HUD with Coins & Shiva Distance Meter
    this.ui.updateHUD({
      score: this.score.score,
      distance: Math.floor(this.score.distance),
      coins: this.score.laddus,
      laddus: this.score.laddus,
      multiplier: this.powerUps.getScoreMultiplier(),
      divineMeter: this.powerUps.divineMeter,
      isDivineMode: this.powerUps.isDivineMode,
      hasShield: this.powerUps.hasShield,
      isMushika: this.powerUps.isMushikaActive,
      mushikaTime: Math.ceil(this.powerUps.mushikaTimer),
      isMagnet: this.powerUps.isMagnetActive,
      magnetTime: Math.ceil(this.powerUps.magnetTimer),
      isMultiplier: this.powerUps.isMultiplierActive,
      multiplierTime: Math.ceil(this.powerUps.multiplierTimer),
      zoneName: `${this.environment.getCurrentTheme().name} • ${this.environment.getCurrentWeather().icon}`,
      isShivaClose: this.chaser.isDanger,
      shivaDangerPercent: this.chaser.getDangerPercent()
    });
  }
}
