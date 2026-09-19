// ShivaModel.js - Photorealistic Lord Shiva Chaser Model Matching Reference Art
import * as THREE from 'three';
import { characterTextures } from './RealisticCharacterTextures.js';

export class ShivaModel {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.characterGroup = new THREE.Group();
    this.root.add(this.characterGroup);
    this.scene.add(this.root);

    this.runCycle = 0;
    this.isReaching = false;
    this.isCatching = false;
    this.isFrontFacing = false;

    // Compatibility parts hierarchy so existing code doesn't break
    this.parts = {
      legL: { root: new THREE.Group() },
      legR: { root: new THREE.Group() },
      armL: { root: new THREE.Group() },
      armR: { root: new THREE.Group() }
    };

    // Animated running frames for Lord Shiva
    this.backFrames = characterTextures.textures.shivaBackFrames || [characterTextures.textures.shivaBack];

    this.initMaterials();
    this.buildPhotorealisticShiva();
    this.buildContactShadow();

    // Listen for texture updates from the photo extractor
    characterTextures.onReady((textures) => {
      this.backFrames = textures.shivaBackFrames || [textures.shivaBack];
      if (this.mainMat && textures.shivaBack) {
        this.mainMat.map = this.isFrontFacing ? textures.shivaFront : (this.backFrames[0] || textures.shivaBack);
        this.mainMat.needsUpdate = true;
      }
    });
  }

  initMaterials() {
    // Dynamic Main Character Texture Material
    this.mainMat = new THREE.MeshStandardMaterial({
      map: characterTextures.textures.shivaBack,
      transparent: true,
      alphaTest: 0.02,
      roughness: 0.42,
      metalness: 0.12,
      side: THREE.DoubleSide
    });

    // Golden 3D Trishula Highlight Material
    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.88,
      roughness: 0.2,
      emissive: 0x996600,
      emissiveIntensity: 0.25
    });

    // Sacred Damru Ribbon Material (Red silk)
    this.ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xd90429,
      roughness: 0.35,
      side: THREE.DoubleSide
    });

    // Contact Ground Shadow
    this.shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0c0706,
      transparent: true,
      opacity: 0.60,
      side: THREE.DoubleSide
    });
  }

  buildPhotorealisticShiva() {
    const group = this.characterGroup;

    // 1. Primary High-Resolution Lord Shiva Sprinting Mesh (16x24 segmented grid for 3D running leg articulation)
    this.bodyGeo = new THREE.PlaneGeometry(2.45, 3.65, 16, 24);
    this.basePositions = Float32Array.from(this.bodyGeo.attributes.position.array);
    this.bodyMesh = new THREE.Mesh(this.bodyGeo, this.mainMat);
    this.bodyMesh.position.set(0, 1.82, 0);
    this.bodyMesh.castShadow = true;
    group.add(this.bodyMesh);

    // 2. Divine Trishula Golden Gleam Light at the Spearhead
    this.tridentPointLight = new THREE.PointLight(0xffd700, 1.2, 5.5);
    this.tridentPointLight.position.set(-0.85, 3.1, 0.3);
    group.add(this.tridentPointLight);

    // 3. Ethereal Blue Divine Radiance
    this.auraLight = new THREE.PointLight(0x70d6ff, 1.1, 6.0);
    this.auraLight.position.set(0, 2.2, 0.5);
    group.add(this.auraLight);
  }

  buildContactShadow() {
    // Dynamic soft contact shadow projected onto railway ties and ballast
    const shadowGeo = new THREE.PlaneGeometry(2.1, 1.3, 8, 8);
    this.shadowMesh = new THREE.Mesh(shadowGeo, this.shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.set(0, 0.025, 0);
    this.root.add(this.shadowMesh);
  }

  setFrontFacing(facing) {
    this.isFrontFacing = facing;
    if (this.mainMat) {
      this.mainMat.map = facing ? characterTextures.textures.shivaFront : (this.backFrames[0] || characterTextures.textures.shivaBack);
      this.mainMat.needsUpdate = true;
    }
  }

  resetDeformation() {
    if (!this.bodyGeo || !this.basePositions) return;
    const pos = this.bodyGeo.attributes.position;
    pos.array.set(this.basePositions);
    pos.needsUpdate = true;
  }

  animateRunningDeformation(runCycle, runSpeed) {
    if (!this.bodyGeo || !this.basePositions) return;
    const pos = this.bodyGeo.attributes.position;
    const arr = pos.array;
    const base = this.basePositions;
    const count = pos.count;

    // Alternating running stride phases (left leg vs right leg)
    const phaseL = runCycle;
    const phaseR = runCycle + Math.PI;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const bx = base[i3];
      const by = base[i3 + 1];
      const bz = base[i3 + 2];

      let dx = 0;
      let dy = 0;
      let dz = 0;

      // Lower Body (Athletic muscular legs, tiger pelt wrap, bare feet): by < 0.05
      if (by < 0.05) {
        // legProgress: 0.0 at waistband (0.05m), ramping to 1.0 at feet (-1.825m)
        const legProgress = Math.max(0, Math.min(1.0, (0.05 - by) / 1.875));
        const curve = legProgress * legProgress;

        if (bx < 0.05) {
          // LEFT LEG: swings forward and back in 3D depth, bends and lifts
          dz = Math.sin(phaseL) * 0.38 * curve;
          dy = Math.max(0, -Math.cos(phaseL)) * 0.22 * curve;
          dx = Math.sin(phaseL) * 0.03 * curve;
        } else {
          // RIGHT LEG: high-kick athletic sprint push-off in opposite stride phase
          dz = Math.sin(phaseR) * 0.38 * curve;
          dy = Math.max(0, -Math.cos(phaseR)) * 0.22 * curve;
          dx = -Math.sin(phaseR) * 0.03 * curve;
        }
      } else {
        // Upper Body (Trident arm, pumping left arm, billowing Jata locks): by >= 0.05
        const torsoProgress = Math.max(0, Math.min(1.0, (by - 0.05) / 1.775));

        // Left Arm (bx > 0.35, by < 0.9): pumps vigorously forward and back with right leg
        if (bx > 0.35 && by < 0.9) {
          dz = Math.sin(phaseR) * 0.22 * torsoProgress;
          dy = Math.cos(phaseR) * 0.08 * torsoProgress;
        }
        // Right Arm wielding Trishula (bx < -0.30): powerful athletic counter-thrust
        else if (bx < -0.30) {
          dz = Math.sin(phaseL) * 0.24 * torsoProgress;
          dy = Math.cos(phaseL) * 0.09 * torsoProgress;
        }
        // Billowing Jata locks & silk ribbons: flutter in slipstream
        if (by > 0.8) {
          dz += Math.sin(runCycle * 2.2 + bx * 3.0) * 0.10 * torsoProgress;
        }
      }

      arr[i3] = bx + dx;
      arr[i3 + 1] = by + dy;
      arr[i3 + 2] = bz + dz;
    }

    pos.needsUpdate = true;
  }

  update(delta, runSpeed, distanceBehind, isClosingIn = false) {
    // Energetic athletic running cadence for Lord Shiva (powerful, visibly running)
    const cadence = 4.8 + Math.min(3.2, (runSpeed - 1.0) * 0.8);
    this.runCycle += delta * cadence;

    // Ensure pristine high-resolution texture is active (no frame-flipping jitter)
    if (this.mainMat && characterTextures.textures.shivaBack) {
      const targetTex = this.isFrontFacing ? characterTextures.textures.shivaFront : characterTextures.textures.shivaBack;
      if (this.mainMat.map !== targetTex) {
        this.mainMat.map = targetTex;
        this.mainMat.needsUpdate = true;
      }
    }

    // 0. Idle Stance when caught or front-facing (100% calm, zero shaking)
    if (this.isFrontFacing || this.isCatching) {
      this.resetDeformation();
      const breath = Math.sin(this.runCycle * 1.5) * 0.015;
      this.characterGroup.position.set(0, breath, 0);
      this.characterGroup.rotation.set(0, 0, 0);
      this.characterGroup.scale.set(1.0, 1.0, 1.0);
      return;
    }

    // 1. Physically Articulate Running Legs & Arms in 3D Mesh
    this.animateRunningDeformation(this.runCycle, runSpeed);

    // 2. Smooth, graceful vertical running bounce (one rise per stride)
    const bounce = Math.abs(Math.sin(this.runCycle)) * 0.09;
    this.characterGroup.position.y = bounce;

    // Rock-solid lateral stability (ZERO horizontal shaking or vibration)
    this.characterGroup.position.x = 0;
    this.characterGroup.rotation.z = 0;

    // Subtle, graceful shoulder sway
    const shoulderRoll = Math.sin(this.runCycle) * 0.04;
    this.characterGroup.rotation.y = shoulderRoll;

    // 3. Stable, athletic sprinter forward lean
    if (isClosingIn) {
      // Reaching forward to catch Ganesha warmly
      this.characterGroup.rotation.x = -0.24;
      this.auraLight.color.setHex(0xff3366); // Warning pulse
      this.auraLight.intensity = 2.0;
    } else {
      this.characterGroup.rotation.x = -0.16; // Stable aerodynamic sprint lean
      this.auraLight.color.setHex(0x70d6ff);
      this.auraLight.intensity = 1.2;
    }

    // 4. Trident Gleam Animation (gentle divine shine)
    if (this.tridentPointLight) {
      this.tridentPointLight.position.y = 3.1 + Math.sin(this.runCycle) * 0.07;
      this.tridentPointLight.position.x = -0.85;
    }

    // 5. Contact Shadow Synchronized with Stride
    const shadowScale = 1.0 - (bounce * 0.3);
    this.shadowMesh.scale.set(shadowScale, shadowScale, 1.0);
    this.shadowMat.opacity = 0.60 * shadowScale;
  }

  playCatchAnimation() {
    this.isCatching = true;
    this.resetDeformation();
    this.setFrontFacing(true);
    // Warm, joyful catch: Shiva stops and welcomes Ganesha with open arms / folded hands
    this.characterGroup.rotation.set(0, 0, 0);
    this.characterGroup.position.y = 0;
    this.auraLight.color.setHex(0xffe066);
    this.auraLight.intensity = 2.5;
  }

  reset() {
    this.runCycle = 0;
    this.isCatching = false;
    this.resetDeformation();
    this.setFrontFacing(false);
    this.characterGroup.rotation.set(0, 0, 0);
    this.characterGroup.position.set(0, 0, 0);
    this.auraLight.color.setHex(0x70d6ff);
    this.auraLight.intensity = 1.1;
  }
}
