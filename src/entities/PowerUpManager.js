// PowerUpManager.js - Divine Shield, Mushika Dash, Trunk Power, and Divine Mode
import * as THREE from 'three';

export class PowerUpManager {
  constructor(scene, particles, sound, ganesha) {
    this.scene = scene;
    this.particles = particles;
    this.sound = sound;
    this.ganesha = ganesha;

    // Power-up States
    this.hasShield = false;
    this.shieldMesh = null;

    this.isMushikaActive = false;
    this.mushikaTimer = 0;
    this.mushikaDuration = 7.0;

    // Coin Magnet Power-up
    this.isMagnetActive = false;
    this.magnetTimer = 0;
    this.magnetDuration = 10.0;

    // 2x Coin Multiplier Power-up
    this.isMultiplierActive = false;
    this.multiplierTimer = 0;
    this.multiplierDuration = 10.0;

    this.trunkPowerReady = true;
    this.trunkCooldown = 0;

    // Divine Meter
    this.divineMeter = 0; // 0 to 100
    this.isDivineMode = false;
    this.divineTimer = 0;
    this.divineDuration = 8.0;

    this.invulnerableTimer = 0; // Grace period after shield break

    this.createShieldMesh();
  }

  createShieldMesh() {
    const geo = new THREE.SphereGeometry(1.6, 24, 24);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      transparent: true,
      opacity: 0.38,
      wireframe: true
    });
    this.shieldMesh = new THREE.Mesh(geo, mat);
    this.shieldMesh.visible = false;
    this.scene.add(this.shieldMesh);
  }

  addDivineEnergy(amount) {
    if (this.isDivineMode) return;
    this.divineMeter = Math.min(100, this.divineMeter + amount);
  }

  activateShield() {
    this.hasShield = true;
    this.shieldMesh.visible = true;
    this.sound.playShieldActivate();
  }

  breakShield() {
    this.hasShield = false;
    this.shieldMesh.visible = false;
    this.sound.playShieldBreak();
    this.invulnerableTimer = 1.5; // 1.5s grace invincibility
  }

  activateMushikaDash() {
    this.isMushikaActive = true;
    this.mushikaTimer = this.mushikaDuration;
    this.ganesha.setMushikaMount(true);
    this.sound.playMushikaDash();
  }

  activateCoinMagnet(duration = 10.0) {
    this.isMagnetActive = true;
    this.magnetTimer = duration;
    this.sound.playShieldActivate();
  }

  activateCoinMultiplier(duration = 10.0) {
    this.isMultiplierActive = true;
    this.multiplierTimer = duration;
    this.sound.playTempleBell(440, 2.0);
  }

  activateTrunkPower(obstacleManager, playerZ, currentLane) {
    this.trunkPowerReady = false;
    this.trunkCooldown = 12.0; // 12s cooldown
    this.sound.playTrunkPower();
    obstacleManager.destroyObstaclesInFront(playerZ, currentLane, 45);
  }

  activateDivineMode() {
    if (this.divineMeter < 100 || this.isDivineMode) return false;
    this.isDivineMode = true;
    this.divineTimer = this.divineDuration;
    this.divineMeter = 0;

    this.ganesha.setDivineGlow(true);
    this.sound.setDivineMode(true);
    return true;
  }

  isInvincible() {
    return this.isDivineMode || this.isMushikaActive || this.invulnerableTimer > 0;
  }

  getSpeedMultiplier() {
    if (this.isDivineMode) return 1.45;
    if (this.isMushikaActive) return 1.6;
    return 1.0;
  }

  getScoreMultiplier() {
    let mult = 1;
    if (this.isDivineMode) mult *= 3;
    else if (this.isMushikaActive) mult *= 2;
    if (this.isMultiplierActive) mult *= 2;
    return mult;
  }

  update(delta, playerPos) {
    // Shield animation
    if (this.hasShield && this.shieldMesh && playerPos) {
      this.shieldMesh.position.set(playerPos.x, playerPos.y + 0.8, playerPos.z);
      this.shieldMesh.rotation.y += delta * 1.5;
      this.shieldMesh.rotation.x += delta * 0.8;
    }

    // Grace invulnerability
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
    }

    // Coin Magnet timer
    if (this.isMagnetActive) {
      this.magnetTimer -= delta;
      if (this.magnetTimer <= 0) {
        this.isMagnetActive = false;
      }
    }

    // Coin Multiplier timer
    if (this.isMultiplierActive) {
      this.multiplierTimer -= delta;
      if (this.multiplierTimer <= 0) {
        this.isMultiplierActive = false;
      }
    }

    // Mushika Dash timer
    if (this.isMushikaActive) {
      this.mushikaTimer -= delta;
      this.particles.setMushikaVFX(true, playerPos);
      if (this.mushikaTimer <= 0) {
        this.isMushikaActive = false;
        this.ganesha.setMushikaMount(false);
        this.particles.setMushikaVFX(false);
      }
    }

    // Divine Mode timer
    if (this.isDivineMode) {
      this.divineTimer -= delta;
      this.particles.setDivineVFX(true, playerPos);
      if (this.divineTimer <= 0) {
        this.isDivineMode = false;
        this.ganesha.setDivineGlow(false);
        this.particles.setDivineVFX(false);
        this.sound.setDivineMode(false);
      }
    }

    // Trunk Power cooldown
    if (this.trunkCooldown > 0) {
      this.trunkCooldown -= delta;
      if (this.trunkCooldown <= 0) {
        this.trunkPowerReady = true;
      }
    }
  }

  reset() {
    this.hasShield = false;
    if (this.shieldMesh) this.shieldMesh.visible = false;
    this.isMushikaActive = false;
    this.mushikaTimer = 0;
    this.isMagnetActive = false;
    this.magnetTimer = 0;
    this.isMultiplierActive = false;
    this.multiplierTimer = 0;
    this.trunkPowerReady = true;
    this.trunkCooldown = 0;
    this.divineMeter = 0;
    this.isDivineMode = false;
    this.divineTimer = 0;
    this.invulnerableTimer = 0;
    this.ganesha.setMushikaMount(false);
    this.ganesha.setDivineGlow(false);
    this.particles.setDivineVFX(false);
    this.particles.setMushikaVFX(false);
  }
}
