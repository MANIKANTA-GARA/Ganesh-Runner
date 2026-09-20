// GaneshaModel.js - Photorealistic Cinematic Bal Ganesha & Mushika Vahana Dual-Avatar Model Engine
import * as THREE from 'three';
import { characterTextures } from './RealisticCharacterTextures.js';

export class GaneshaModel {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.characterGroup = new THREE.Group();
    this.root.add(this.characterGroup);
    this.scene.add(this.root);

    // Two dedicated, completely independent 3D avatar scene groups
    this.balGaneshaGroup = new THREE.Group();
    this.mushikaMountGroup = new THREE.Group();
    this.characterGroup.add(this.balGaneshaGroup);
    this.characterGroup.add(this.mushikaMountGroup);

    this.selectedAvatar = 'bal_ganesha'; // 'bal_ganesha' | 'mushika_vahana'
    this.currentOutfit = 'pitambara';   // 'pitambara' | 'rudraksha' | 'kailash'
    this.materials = {};

    // Animation state
    this.runCycle = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.jumpTime = 0;
    this.slideTime = 0;
    this.bankAngle = 0;
    this.isDivine = false;
    this.isMushikaMounted = false;
    this.isFrontFacing = false;

    // Body parts dictionary for external subsystems
    this.parts = {
      leftLeg: { root: new THREE.Group() },
      rightLeg: { root: new THREE.Group() },
      armLL: { root: new THREE.Group() },
      armLR: { root: new THREE.Group() },
      leftEar: new THREE.Group(),
      rightEar: new THREE.Group(),
      trunk: new THREE.Group()
    };

    this.lastFrameIndex = -1;
    this.onFootstep = null;

    this.initMaterials();
    this.buildBalGaneshaCharacter();
    this.buildMushikaMountCharacter();
    this.buildContactShadow();

    // Set initial visibility
    this.applyAvatarVisibility();

    // Listen for texture updates from the photo extractor
    characterTextures.onReady(() => {
      this.updateAvatarTextures();
    });
  }

  initMaterials() {
    // 1. Dedicated Bal Ganesha Material
    this.balGaneshaMat = new THREE.MeshStandardMaterial({
      map: characterTextures.textures.ganeshaBack,
      transparent: true,
      alphaTest: 0.02,
      roughness: 0.38,
      metalness: 0.12,
      side: THREE.DoubleSide
    });

    // 2. Dedicated Mushika Vahana Material
    this.mushikaMat = new THREE.MeshStandardMaterial({
      map: characterTextures.textures.mushikaBack || characterTextures.textures.ganeshaBack,
      transparent: true,
      alphaTest: 0.02,
      roughness: 0.38,
      metalness: 0.12,
      side: THREE.DoubleSide
    });

    // Backwards compatibility pointer
    this.mainMat = this.balGaneshaMat;

    // Fluttering Red Silk Angavastram (Scarf)
    this.scarfMat = new THREE.MeshStandardMaterial({
      color: 0xd90429,
      roughness: 0.28,
      metalness: 0.12,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide
    });

    // Gold Crown / Mukut Highlights
    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.88,
      roughness: 0.18,
      emissive: 0xaa7700,
      emissiveIntensity: 0.2
    });

    // Divine Aura Halo
    this.haloMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });

    // Contact Ground Shadow
    this.shadowMat = new THREE.MeshBasicMaterial({
      color: 0x100a08,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide
    });

    // Compatibility materials
    this.materials.skin = new THREE.MeshStandardMaterial({ color: 0xf5b084 });
    this.materials.gold = this.goldMat;
    this.materials.ruby = new THREE.MeshStandardMaterial({ color: 0xd90429 });
    this.materials.dhoti = new THREE.MeshStandardMaterial({ color: 0xc62828 });
  }

  buildBalGaneshaCharacter() {
    const group = this.balGaneshaGroup;

    // 1. Primary High-Resolution Human-Running Bal Ganesha Plane (16x24 segmented grid for 3D running leg articulation)
    this.balGaneshaGeo = new THREE.PlaneGeometry(1.68, 2.58, 16, 24);
    this.basePositions = Float32Array.from(this.balGaneshaGeo.attributes.position.array);
    this.balGaneshaMesh = new THREE.Mesh(this.balGaneshaGeo, this.balGaneshaMat);
    // Center at y = 1.29m places running feet directly on the railway rails (y = 0.00m)
    this.balGaneshaMesh.position.set(0, 1.29, 0);
    this.balGaneshaMesh.castShadow = true;
    group.add(this.balGaneshaMesh);

    // Maintain alias
    this.bodyMesh = this.balGaneshaMesh;
    this.bodyGeo = this.balGaneshaGeo;

    // 2. Fluttering 3D Angavastram Ribbon Wings (Billowing red silk sash)
    this.scarfGroup = new THREE.Group();
    group.add(this.scarfGroup);

    const scarfGeo = new THREE.PlaneGeometry(0.55, 1.35, 6, 12);
    this.leftScarf = new THREE.Mesh(scarfGeo, this.scarfMat);
    this.leftScarf.position.set(-0.55, 1.45, 0.14);
    this.leftScarf.rotation.set(0.18, 0.35, 0.22);
    this.scarfGroup.add(this.leftScarf);

    this.rightScarf = new THREE.Mesh(scarfGeo, this.scarfMat);
    this.rightScarf.position.set(0.68, 1.25, 0.16);
    this.rightScarf.rotation.set(0.24, -0.38, -0.28);
    this.scarfGroup.add(this.rightScarf);

    // 3. Golden Mukut 3D Kalasha Pinnacle on Crown
    const kalashaGeo = new THREE.ConeGeometry(0.13, 0.38, 16);
    this.kalashaMesh = new THREE.Mesh(kalashaGeo, this.goldMat);
    this.kalashaMesh.position.set(0, 2.56, 0.04);
    group.add(this.kalashaMesh);

    // Auspicious Crown Halo Ring
    const haloGeo = new THREE.RingGeometry(0.5, 0.72, 32);
    this.haloMesh = new THREE.Mesh(haloGeo, this.haloMat);
    this.haloMesh.position.set(0, 2.22, -0.05);
    this.haloMesh.visible = false;
    group.add(this.haloMesh);

    // Subtle breathing divine light
    this.divinePointLight = new THREE.PointLight(0xffe066, 0.8, 4.0);
    this.divinePointLight.position.set(0, 1.55, 0.45);
    group.add(this.divinePointLight);

    // 4. Temporary Power-Up Mushika Mount for Bal Ganesha Super Dash
    this.powerUpMushikaGroup = new THREE.Group();
    this.powerUpMushikaGroup.position.set(0, 0.32, 0);
    this.powerUpMushikaGroup.visible = false;
    group.add(this.powerUpMushikaGroup);

    const mouseBodyMat = new THREE.MeshStandardMaterial({ color: 0x8d99ae, roughness: 0.6 });
    const mouseGoldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.2 });

    const pBodyGeo = new THREE.SphereGeometry(0.45, 14, 14);
    pBodyGeo.scale(0.8, 0.6, 1.4);
    const pBody = new THREE.Mesh(pBodyGeo, mouseBodyMat);
    pBody.castShadow = true;
    this.powerUpMushikaGroup.add(pBody);

    const pSaddleGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.15, 14);
    const pSaddle = new THREE.Mesh(pSaddleGeo, mouseGoldMat);
    pSaddle.position.set(0, 0.22, 0);
    this.powerUpMushikaGroup.add(pSaddle);

    const pEarGeo = new THREE.CircleGeometry(0.14, 12);
    const pLeftEar = new THREE.Mesh(pEarGeo, mouseBodyMat);
    pLeftEar.position.set(-0.24, 0.28, -0.42);
    this.powerUpMushikaGroup.add(pLeftEar);

    const pRightEar = new THREE.Mesh(pEarGeo, mouseBodyMat);
    pRightEar.position.set(0.24, 0.28, -0.42);
    this.powerUpMushikaGroup.add(pRightEar);

    this.mushikaGroup = this.powerUpMushikaGroup;
  }

  buildMushikaMountCharacter() {
    const group = this.mushikaMountGroup;

    // 1. Wide Mushika Mount Geometry (2.18m x 2.68m)
    this.mushikaGeo = new THREE.PlaneGeometry(2.18, 2.68, 16, 24);
    this.mushikaBasePositions = Float32Array.from(this.mushikaGeo.attributes.position.array);
    this.mushikaMesh = new THREE.Mesh(this.mushikaGeo, this.mushikaMat);
    this.mushikaMesh.position.set(0, 1.34, 0);
    this.mushikaMesh.castShadow = true;
    group.add(this.mushikaMesh);

    // 2. Divine Golden Radiance Halo for Mushika Vahana
    const haloGeo = new THREE.RingGeometry(0.58, 0.84, 32);
    this.mushikaHaloMesh = new THREE.Mesh(haloGeo, this.haloMat);
    this.mushikaHaloMesh.position.set(0, 2.25, -0.05);
    this.mushikaHaloMesh.visible = false;
    group.add(this.mushikaHaloMesh);

    // 3. Golden Bell Collar / Sacred Embellishment for Mushika
    const bellGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const bellMesh = new THREE.Mesh(bellGeo, this.goldMat);
    bellMesh.position.set(0, 0.52, 0.15);
    group.add(bellMesh);

    // 4. Warm Divine Aura Point Light
    this.mushikaPointLight = new THREE.PointLight(0xffaa00, 1.0, 5.0);
    this.mushikaPointLight.position.set(0, 1.6, 0.5);
    group.add(this.mushikaPointLight);
  }

  buildContactShadow() {
    const shadowGeo = new THREE.PlaneGeometry(1.4, 0.95, 8, 8);
    this.shadowMesh = new THREE.Mesh(shadowGeo, this.shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.set(0, 0.025, 0);
    this.root.add(this.shadowMesh);
  }

  applyAvatarVisibility() {
    const isMushika = (this.selectedAvatar === 'mushika_vahana');
    this.balGaneshaGroup.visible = !isMushika;
    this.mushikaMountGroup.visible = isMushika;

    // Update bodyMesh alias to the active mesh
    this.bodyMesh = isMushika ? this.mushikaMesh : this.balGaneshaMesh;
    this.bodyGeo = isMushika ? this.mushikaGeo : this.balGaneshaGeo;
    this.mainMat = isMushika ? this.mushikaMat : this.balGaneshaMat;

    this.updateAvatarTextures();
  }

  setAvatar(avatarId) {
    this.selectedAvatar = avatarId || 'bal_ganesha';
    this.applyAvatarVisibility();
  }

  setFrontFacing(facing) {
    this.isFrontFacing = facing;
    this.updateAvatarTextures();
  }

  updateAvatarTextures() {
    // 1. Update Bal Ganesha texture
    if (this.balGaneshaMat) {
      const ganeshaTex = this.isFrontFacing
        ? characterTextures.textures.ganeshaFront
        : characterTextures.textures.ganeshaBack;
      if (ganeshaTex && this.balGaneshaMat.map !== ganeshaTex) {
        this.balGaneshaMat.map = ganeshaTex;
        this.balGaneshaMat.needsUpdate = true;
      }
    }

    // 2. Update Mushika Vahana texture
    if (this.mushikaMat) {
      const mushikaTex = this.isFrontFacing
        ? (characterTextures.textures.mushikaFront || characterTextures.textures.ganeshaFront)
        : (characterTextures.textures.mushikaBack || characterTextures.textures.ganeshaBack);
      if (mushikaTex && this.mushikaMat.map !== mushikaTex) {
        this.mushikaMat.map = mushikaTex;
        this.mushikaMat.needsUpdate = true;
      }
    }
  }

  setOutfit(outfitId) {
    this.currentOutfit = outfitId;
    if (outfitId === 'rudraksha') {
      this.scarfMat.color.setHex(0x9d0208); // Royal crimson
      this.goldMat.color.setHex(0xe0a96d);
    } else if (outfitId === 'kailash') {
      this.scarfMat.color.setHex(0x48cae4); // Celestial cyan silk
      this.goldMat.color.setHex(0xffffff); // Silver mukut
    } else {
      this.scarfMat.color.setHex(0xd90429); // Classic vermillion
      this.goldMat.color.setHex(0xffd700); // Pure gold
    }
  }

  setDivineGlow(active) {
    this.isDivine = active;
    if (this.haloMesh) this.haloMesh.visible = active && (this.selectedAvatar === 'bal_ganesha');
    if (this.mushikaHaloMesh) this.mushikaHaloMesh.visible = active && (this.selectedAvatar === 'mushika_vahana');
    if (this.divinePointLight) this.divinePointLight.intensity = active ? 2.8 : 0.8;
    if (this.mushikaPointLight) this.mushikaPointLight.intensity = active ? 2.8 : 1.0;
  }

  setMushikaMount(active) {
    this.isMushikaMounted = active;
    if (this.selectedAvatar === 'bal_ganesha') {
      if (this.powerUpMushikaGroup) {
        this.powerUpMushikaGroup.visible = active;
      }
      this.balGaneshaMesh.position.y = active ? 1.65 : 1.29;
    }
  }

  jump() {
    if (this.isSliding) {
      this.isSliding = false;
      this.characterGroup.position.y = 0;
      this.characterGroup.rotation.x = 0;
      this.characterGroup.scale.set(1.0, 1.0, 1.0);
    }
    this.isJumping = true;
    this.jumpTime = 0;
  }

  slide() {
    if (this.isJumping) {
      this.isJumping = false;
      this.root.position.y = 0;
      this.characterGroup.rotation.x = 0;
      this.characterGroup.scale.set(1.0, 1.0, 1.0);
      this.shadowMesh.scale.set(1.0, 1.0, 1.0);
      this.shadowMat.opacity = 0.55;
    }
    this.isSliding = true;
    this.slideTime = 0;
  }

  setBankAngle(targetBank, delta) {
    this.bankAngle = THREE.MathUtils.lerp(this.bankAngle, targetBank, delta * 12);
  }

  resetDeformation() {
    if (this.balGaneshaGeo && this.basePositions) {
      const pos = this.balGaneshaGeo.attributes.position;
      pos.array.set(this.basePositions);
      pos.needsUpdate = true;
    }
  }

  animateRunningDeformation(runCycle, runSpeed) {
    if (!this.balGaneshaGeo || !this.basePositions) return;
    const pos = this.balGaneshaGeo.attributes.position;
    const arr = pos.array;
    const base = this.basePositions;
    const count = pos.count;

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

      // Lower Body (Legs, Dhoti, Feet): by < 0.05
      if (by < 0.05) {
        const legProgress = Math.max(0, Math.min(1.0, (0.05 - by) / 1.34));
        const curve = legProgress * legProgress;

        if (bx < -0.02) {
          dz = Math.sin(phaseL) * 0.28 * curve;
          dy = Math.max(0, -Math.cos(phaseL)) * 0.16 * curve;
        } else {
          dz = Math.sin(phaseR) * 0.28 * curve;
          dy = Math.max(0, -Math.cos(phaseR)) * 0.16 * curve;
        }
      } else {
        // Upper Body (Arms, Shoulders, Scarf): by >= 0.05
        const torsoProgress = Math.max(0, Math.min(1.0, (by - 0.05) / 1.24));

        if (bx < -0.28 && by < 0.65) {
          dz = Math.sin(phaseR) * 0.15 * torsoProgress;
          dy = Math.cos(phaseR) * 0.06 * torsoProgress;
        } else if (bx > 0.28 && by < 0.65) {
          dz = Math.sin(phaseL) * 0.15 * torsoProgress;
          dy = Math.cos(phaseL) * 0.06 * torsoProgress;
        }
      }

      arr[i3] = bx + dx;
      arr[i3 + 1] = by + dy;
      arr[i3 + 2] = bz + dz;
    }

    pos.needsUpdate = true;
  }

  update(delta, runSpeed) {
    const tempo = 4.8 + Math.min(3.2, (runSpeed - 1.0) * 0.8);
    this.runCycle += delta * tempo;

    // Refresh active textures
    this.updateAvatarTextures();

    // 0. Idle Stance (Menu / Intro)
    if (this.isFrontFacing) {
      this.resetDeformation();
      const breath = Math.sin(this.runCycle * 1.5) * 0.015;
      this.root.position.set(0, breath, 0);
      this.characterGroup.position.set(0, 0, 0);
      this.characterGroup.rotation.set(0, 0, 0);
      this.characterGroup.scale.set(1.0, 1.0, 1.0);
      this.shadowMesh.scale.set(1.0, 1.0, 1.0);
      this.shadowMat.opacity = 0.55;
      return;
    }

    // 1. Jumping Animation
    if (this.isJumping) {
      this.resetDeformation();
      this.jumpTime += delta * 1.75;
      const progress = Math.min(1.0, this.jumpTime);
      const jumpY = 4 * 2.45 * progress * (1 - progress);
      this.root.position.y = jumpY;

      this.characterGroup.rotation.x = -0.16;
      this.characterGroup.rotation.y = 0;
      this.characterGroup.rotation.z = this.bankAngle;
      this.characterGroup.scale.set(1.0, 1.0, 1.0);

      if (this.selectedAvatar === 'bal_ganesha') {
        this.rightScarf.rotation.x = 0.65;
        this.rightScarf.rotation.z = -0.42;
      }

      const jumpShadow = Math.max(0.15, 1.0 - (jumpY / 2.8));
      this.shadowMesh.scale.set(jumpShadow, jumpShadow, 1.0);
      this.shadowMat.opacity = 0.55 * jumpShadow;

      if (this.jumpTime >= 1.0) {
        this.isJumping = false;
        this.root.position.y = 0;
        this.characterGroup.rotation.x = 0;
        this.characterGroup.scale.set(1.0, 1.0, 1.0);
        this.shadowMesh.scale.set(1.0, 1.0, 1.0);
        this.shadowMat.opacity = 0.55;
      }
    }
    // 2. Sliding Animation
    else if (this.isSliding) {
      this.resetDeformation();
      this.slideTime += delta * 2.1;

      this.characterGroup.position.y = (this.selectedAvatar === 'mushika_vahana') ? -0.22 : -0.42;
      this.characterGroup.rotation.x = 0.78;
      this.characterGroup.rotation.y = 0;
      this.characterGroup.rotation.z = this.bankAngle;
      this.characterGroup.scale.set(1.10, 0.75, 1.0);

      if (this.selectedAvatar === 'bal_ganesha') {
        this.rightScarf.rotation.x = 0.85;
        this.rightScarf.position.y = 0.85;
      }

      this.shadowMesh.scale.set(1.45, 1.25, 1.0);
      this.shadowMat.opacity = 0.62;

      if (this.slideTime >= 1.0) {
        this.isSliding = false;
        this.characterGroup.position.y = (this.isMushikaMounted && this.selectedAvatar === 'bal_ganesha') ? 0.45 : 0;
        this.characterGroup.rotation.x = 0;
        this.characterGroup.scale.set(1.0, 1.0, 1.0);
        this.shadowMesh.scale.set(1.0, 1.0, 1.0);
        this.shadowMat.opacity = 0.55;
      }
    }
    // 3. Track Running Dynamics
    else {
      if (this.selectedAvatar === 'mushika_vahana') {
        this.resetDeformation();
        // Mushika 4-legged sacred mount rhythmic gallop
        const gallopSpeed = this.runCycle * 1.6;
        const gallopBounce = Math.abs(Math.sin(gallopSpeed)) * 0.11;
        const gallopPitch = Math.sin(gallopSpeed) * 0.05;
        this.root.position.y = gallopBounce;

        const speedLean = Math.min(0.22, 0.12 + (runSpeed * 0.02));
        this.characterGroup.rotation.x = speedLean + gallopPitch;
        this.characterGroup.rotation.y = Math.sin(gallopSpeed * 0.5) * 0.035;
        this.characterGroup.rotation.z = this.bankAngle;
        this.characterGroup.scale.set(1.0, 1.0, 1.0);
        this.mushikaMesh.position.x = 0;

        const shadowScale = Math.max(0.75, 1.2 - (gallopBounce * 0.4));
        this.shadowMesh.scale.set(shadowScale * 1.4, shadowScale * 1.15, 1.0);
        this.shadowMat.opacity = 0.58 * shadowScale;

        // Gallop footstep / sound callback
        const currentStepPhase = Math.floor((gallopSpeed / Math.PI) % 2);
        if (currentStepPhase !== this.lastFrameIndex) {
          this.lastFrameIndex = currentStepPhase;
          if (this.onFootstep) {
            this.onFootstep(currentStepPhase === 0 ? 'left' : 'right');
          }
        }
      } else {
        // Articulate 3D legs and arm counter-swings in mesh grid!
        this.animateRunningDeformation(this.runCycle, runSpeed);

        const bounce = Math.abs(Math.sin(this.runCycle)) * 0.08;
        this.root.position.y = bounce;

        const speedLean = Math.min(0.20, 0.12 + (runSpeed * 0.02));
        this.characterGroup.rotation.x = speedLean;
        this.characterGroup.rotation.y = Math.sin(this.runCycle) * 0.04;
        this.balGaneshaMesh.position.x = 0;
        this.characterGroup.rotation.z = this.bankAngle;
        this.characterGroup.scale.set(1.0, 1.0, 1.0);

        const shadowScale = Math.max(0.75, 1.0 - (bounce * 0.35));
        this.shadowMesh.scale.set(shadowScale, shadowScale, 1.0);
        this.shadowMat.opacity = 0.55 * shadowScale;

        // Fluttering silk angavastram ribbons
        const windWave = Math.sin(this.runCycle * 0.8) * 0.025;
        this.rightScarf.rotation.z = -0.28 - windWave;
        this.rightScarf.rotation.x = 0.30 + Math.cos(this.runCycle * 0.8) * 0.02;
        this.rightScarf.position.y = 1.25;

        this.leftScarf.rotation.z = 0.22 + windWave;
        this.leftScarf.rotation.x = 0.24;

        const currentStepPhase = Math.floor((this.runCycle / Math.PI) % 2);
        if (currentStepPhase !== this.lastFrameIndex) {
          this.lastFrameIndex = currentStepPhase;
          if (this.onFootstep) {
            this.onFootstep(currentStepPhase === 0 ? 'left' : 'right');
          }
        }
      }
    }

    // 4. Temporary Mushika Mount animation on Bal Ganesha
    if (this.isMushikaMounted && this.selectedAvatar === 'bal_ganesha' && this.powerUpMushikaGroup) {
      this.powerUpMushikaGroup.position.y = 0.32 + Math.abs(Math.sin(this.runCycle * 3)) * 0.08;
    }

    // 5. Divine Aura Pulse
    if (this.isDivine) {
      if (this.haloMesh) this.haloMesh.rotation.z += delta * 2.5;
      if (this.mushikaHaloMesh) this.mushikaHaloMesh.rotation.z += delta * 2.5;
    }
  }

  reset() {
    this.isJumping = false;
    this.isSliding = false;
    this.jumpTime = 0;
    this.slideTime = 0;
    this.bankAngle = 0;
    this.root.position.set(0, 0, 0);
    this.characterGroup.position.set(0, 0, 0);
    this.characterGroup.rotation.set(0, 0, 0);
    this.characterGroup.scale.set(1.0, 1.0, 1.0);
    this.resetDeformation();
    this.setMushikaMount(false);
    this.setDivineGlow(false);
    this.applyAvatarVisibility();
  }
}
