// ChaserManager.js - Lord Shiva Chase Distance Mechanic & Danger System
import * as THREE from 'three';
import { ShivaModel } from '../graphics/ShivaModel.js';

export class ChaserManager {
  constructor(scene, sound) {
    this.scene = scene;
    this.sound = sound;

    this.shiva = new ShivaModel(this.scene);

    // Quantitative Shiva Chase Distance (0 = Caught/Game Over, 100 = Max Safe/Invisible)
    this.shivaDistance = 85.0; // Starts at safe 85%
    this.dangerThreshold = 35.0; // Below 35% is danger state

    // World distances
    this.closeDistance = 3.4;     // Critical distance (right on Ganesha's heels)
    this.midDistance = 7.5;       // Visible trailing distance
    this.farDistance = 22.0;      // Off-screen / invisible distance

    this.currentWorldDist = 5.0;
    this.targetWorldDist = 18.0;

    // Opening sprint: Shiva is visible for 3.5s at run start, then drops back
    this.introTimer = 3.5;
    this.isDanger = false;
    this.damruTimer = 0;

    this.shiva.root.visible = true;
  }

  // Called when Ganesha trips or hits a barrier
  triggerStumble() {
    // Distance drops drastically by 35%
    this.shivaDistance = Math.max(15.0, this.shivaDistance - 35.0);
    this.isDanger = true;
    this.sound.playDamruPulse();
  }

  triggerCaught() {
    this.shivaDistance = 0;
    this.shiva.root.visible = true;
    this.currentWorldDist = 1.3;
    this.targetWorldDist = 1.3;
    this.shiva.playCatchAnimation();
  }

  // Returns 0 (fully safe) to 100 (extreme danger / Shiva is catching up!)
  getDangerPercent() {
    return Math.max(0, Math.min(100, Math.round(100 - this.shivaDistance)));
  }

  update(delta, playerPos, playerLaneX, runSpeed, isPowerMode = false) {
    if (isPowerMode) {
      // Power-up (Mushika Dash or Divine Mode): Shiva falls far back to 100% safe
      this.shivaDistance = Math.min(100.0, this.shivaDistance + delta * 25.0);
      this.isDanger = false;
    } else if (this.introTimer > 0) {
      this.introTimer -= delta;
      // Start with playful close chase
      this.targetWorldDist = this.closeDistance + 1.2;
      this.shiva.root.visible = true;
      if (this.introTimer <= 0) {
        this.shivaDistance = 85.0;
      }
    } else {
      // Continuous clean running gradually restores distance!
      this.shivaDistance = Math.min(100.0, this.shivaDistance + delta * 3.8);

      if (this.shivaDistance < this.dangerThreshold) {
        this.isDanger = true;
        // Pulse suspenseful Damru drum
        this.damruTimer -= delta;
        if (this.damruTimer <= 0) {
          this.sound.playDamruPulse();
          this.damruTimer = 0.55;
        }
      } else {
        this.isDanger = false;
      }

      // Map shivaDistance (0-100) to actual world Z distance
      // 0 -> 2.0m, 35 -> 4.2m, 70 -> 10.0m, 100 -> 20.0m
      const norm = this.shivaDistance / 100;
      this.targetWorldDist = this.closeDistance + norm * (this.farDistance - this.closeDistance);
    }

    // Smoothly interpolate world distance
    this.currentWorldDist = THREE.MathUtils.lerp(this.currentWorldDist, this.targetWorldDist, delta * 3.2);

    // Show Shiva when within camera view (< 16m)
    this.shiva.root.visible = (this.currentWorldDist < 16.0) || this.isDanger || (this.introTimer > 0);

    // Position Shiva behind Ganesha with smooth lateral lane following
    const targetZ = playerPos.z + this.currentWorldDist;
    const targetX = THREE.MathUtils.lerp(this.shiva.root.position.x, playerLaneX, delta * 6.5);
    this.shiva.root.position.set(targetX, 0, targetZ);

    if (this.shiva.root.visible) {
      this.shiva.update(delta, runSpeed, this.currentWorldDist, this.shivaDistance < 35.0);
    }
  }

  reset() {
    this.introTimer = 3.5;
    this.shivaDistance = 85.0;
    this.currentWorldDist = 4.5;
    this.targetWorldDist = 4.5;
    this.isDanger = false;
    this.damruTimer = 0;
    this.shiva.root.position.set(0, 0, 4.5);
    this.shiva.root.visible = true;
    this.shiva.reset();
  }
}
