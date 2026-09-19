// GaneshaModel.js - Photorealistic Cinematic Bal Ganesha Model Matching Reference Art
import * as THREE from 'three';
import { characterTextures } from './RealisticCharacterTextures.js';

export class GaneshaModel {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.characterGroup = new THREE.Group();
    this.root.add(this.characterGroup);
    this.scene.add(this.root);

    this.selectedAvatar = 'bal_ganesha'; // 'bal_ganesha' | 'mushika_vahana'
    this.currentOutfit = 'pitambara'; // 'pitambara' | 'rudraksha' | 'kailash'
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

    // Body parts dictionary for compatibility
    this.parts = {
      leftLeg: { root: new THREE.Group() },
      rightLeg: { root: new THREE.Group() },
      armLL: { root: new THREE.Group() },
      armLR: { root: new THREE.Group() },
      leftEar: new THREE.Group(),
      rightEar: new THREE.Group(),
      trunk: new THREE.Group()
    };

    // Animated running stride frames & footstep callback
    this.backFrames = characterTextures.textures.ganeshaBackFrames || [characterTextures.textures.ganeshaBack];
    this.frontFrames = characterTextures.textures.ganeshaFrontFrames || [characterTextures.textures.ganeshaFront];
    this.mushikaBackFrames = characterTextures.textures.mushikaBackFrames || [characterTextures.textures.mushikaBack];
    this.mushikaFrontFrames = characterTextures.textures.mushikaFrontFrames || [characterTextures.textures.mushikaFront];
    this.lastFrameIndex = -1;
    this.onFootstep = null;

    this.initMaterials();
    this.buildPhotorealisticGanesha();
    this.buildMushika();
    this.buildContactShadow();

    // Listen for texture updates from the photo extractor
    characterTextures.onReady((textures) => {
      this.backFrames = textures.ganeshaBackFrames || [textures.ganeshaBack];
      this.frontFrames = textures.ganeshaFrontFrames || [textures.ganeshaFront];
      this.mushikaBackFrames = textures.mushikaBackFrames || [textures.mushikaBack];
      this.mushikaFrontFrames = textures.mushikaFrontFrames || [textures.mushikaFront];
      if (this.mainMat) {
        let activeTex;
        if (this.selectedAvatar === 'mushika_vahana') {
          activeTex = this.isFrontFacing ? (textures.mushikaFront || textures.ganeshaFront) : (textures.mushikaBack || textures.ganeshaBack);
        } else {
          activeTex = this.isFrontFacing ? textures.ganeshaFront : textures.ganeshaBack;
        }
        if (activeTex) {
          this.mainMat.map = activeTex;
          this.mainMat.needsUpdate = true;
        }
      }
    });
  }

  initMaterials() {
    // Dynamic Main Character Texture Material
    this.mainMat = new THREE.MeshStandardMaterial({
      map: characterTextures.textures.ganeshaBack,
      transparent: true,
      alphaTest: 0.02,
      roughness: 0.38,
      metalness: 0.12,
      side: THREE.DoubleSide
    });

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

  buildPhotorealisticGanesha() {
    const group = this.characterGroup;

    // 1. Primary High-Resolution Human-Running Bal Ganesha Plane (16x24 segmented grid for 3D running leg articulation)
    this.bodyGeo = new THREE.PlaneGeometry(1.68, 2.58, 16, 24);
    this.basePositions = Float32Array.from(this.bodyGeo.attributes.position.array);
    this.bodyMesh = new THREE.Mesh(this.bodyGeo, this.mainMat);
    // Center at y = 1.29m places the running feet directly on the railway rails (y = 0.00m)
    this.bodyMesh.position.set(0, 1.29, 0);
    this.bodyMesh.castShadow = true;
    group.add(this.bodyMesh);

    // 2. Fluttering 3D Angavastram Ribbon Wings (Billowing red silk sash)
    this.scarfGroup = new THREE.Group();
    group.add(this.scarfGroup);

    const scarfGeo = new THREE.PlaneGeometry(0.55, 1.35, 6, 12);
    // Left shoulder trailing scarf
    this.leftScarf = new THREE.Mesh(scarfGeo, this.scarfMat);
    this.leftScarf.position.set(-0.55, 1.45, 0.14);
    this.leftScarf.rotation.set(0.18, 0.35, 0.22);
    this.scarfGroup.add(this.leftScarf);

    // Right billowing silk sash (matching the dynamic trailing scarf in media_1789562425462.png)
    this.rightScarf = new THREE.Mesh(scarfGeo, this.scarfMat);
    this.rightScarf.position.set(0.68, 1.25, 0.16);
    this.rightScarf.rotation.set(0.24, -0.38, -0.28);
    this.scarfGroup.add(this.rightScarf);

    // 3. Golden Mukut 3D Kalasha Pinnacle on Crown (matching crown pinnacle at y = 2.56m)
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
  }

  buildContactShadow() {
    // Dynamic soft contact shadow projected onto railway ties and ballast directly under feet
    const shadowGeo = new THREE.PlaneGeometry(1.4, 0.95, 8, 8);
    this.shadowMesh = new THREE.Mesh(shadowGeo, this.shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.set(0, 0.025, 0);
    this.root.add(this.shadowMesh);
  }

  buildMushika() {
    // Divine Mouse (Mushika) Mount for Super Dash Power-Up
    this.mushikaGroup = new THREE.Group();
    this.mushikaGroup.position.set(0, 0.32, 0);
    this.mushikaGroup.visible = false;
    this.root.add(this.mushikaGroup);

    const mouseBodyMat = new THREE.MeshStandardMaterial({ color: 0x8d99ae, roughness: 0.6 });
    const mouseGoldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.2 });

    // Mouse Body
    const bodyGeo = new THREE.SphereGeometry(0.45, 14, 14);
    bodyGeo.scale(0.8, 0.6, 1.4);
    const body = new THREE.Mesh(bodyGeo, mouseBodyMat);
    body.position.set(0, 0, 0);
    body.castShadow = true;
    this.mushikaGroup.add(body);

    // Golden saddle
    const saddleGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.15, 14);
    const saddle = new THREE.Mesh(saddleGeo, mouseGoldMat);
    saddle.position.set(0, 0.22, 0);
    this.mushikaGroup.add(saddle);

    // Mouse ears
    const earGeo = new THREE.CircleGeometry(0.14, 12);
    const leftEar = new THREE.Mesh(earGeo, mouseBodyMat);
    leftEar.position.set(-0.24, 0.28, -0.42);
    this.mushikaGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, mouseBodyMat);
    rightEar.position.set(0.24, 0.28, -0.42);
    this.mushikaGroup.add(rightEar);
  }

  setAvatar(avatarId) {
    this.selectedAvatar = avatarId || 'bal_ganesha';
    if (this.selectedAvatar === 'mushika_vahana') {
      // 1. Rebuild geometry to fit wide Mushika mount (2.15m x 2.65m)
      if (this.bodyGeo) this.bodyGeo.dispose();
      this.bodyGeo = new THREE.PlaneGeometry(2.15, 2.65, 16, 24);
      this.basePositions = Float32Array.from(this.bodyGeo.attributes.position.array);
      this.bodyMesh.geometry = this.bodyGeo;
      this.bodyMesh.position.set(0, 1.32, 0);

      // Hide fluttering scarf and crown pinnacle (already rendered in photorealistic mount sheet)
      this.scarfGroup.visible = false;
      this.kalashaMesh.visible = false;
      this.mushikaGroup.visible = false;

      // Update texture
      const tex = this.isFrontFacing
        ? (characterTextures.textures.mushikaFront || characterTextures.textures.ganeshaFront)
        : (characterTextures.textures.mushikaBack || characterTextures.textures.ganeshaBack);
      if (this.mainMat && tex) {
        this.mainMat.map = tex;
        this.mainMat.needsUpdate = true;
      }
    } else {
      // 2. Restore Bal Ganesha runner geometry (1.68m x 2.58m)
      if (this.bodyGeo) this.bodyGeo.dispose();
      this.bodyGeo = new THREE.PlaneGeometry(1.68, 2.58, 16, 24);
      this.basePositions = Float32Array.from(this.bodyGeo.attributes.position.array);
      this.bodyMesh.geometry = this.bodyGeo;
      this.bodyMesh.position.set(0, 1.29, 0);

      this.scarfGroup.visible = true;
      this.kalashaMesh.visible = true;
      this.mushikaGroup.visible = this.isMushikaMounted;

      const tex = this.isFrontFacing
        ? characterTextures.textures.ganeshaFront
        : characterTextures.textures.ganeshaBack;
      if (this.mainMat && tex) {
        this.mainMat.map = tex;
        this.mainMat.needsUpdate = true;
      }
    }
  }

  setFrontFacing(facing) {
    this.isFrontFacing = facing;
    let activeTex;
    if (this.selectedAvatar === 'mushika_vahana') {
      activeTex = this.isFrontFacing
        ? (characterTextures.textures.mushikaFront || characterTextures.textures.ganeshaFront)
        : (characterTextures.textures.mushikaBack || characterTextures.textures.ganeshaBack);
    } else {
      activeTex = this.isFrontFacing
        ? characterTextures.textures.ganeshaFront
        : characterTextures.textures.ganeshaBack;
    }
    if (this.mainMat && activeTex) {
      this.mainMat.map = activeTex;
      this.mainMat.needsUpdate = true;
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
    this.haloMesh.visible = active;
    this.divinePointLight.intensity = active ? 2.8 : 0.8;
    this.divinePointLight.color.setHex(active ? 0xffea00 : 0xffe066);
  }

  setMushikaMount(active) {
    this.isMushikaMounted = active;
    this.mushikaGroup.visible = active;
    this.characterGroup.position.y = active ? 0.45 : 0;
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
      // Fast-drop dive: immediately plunge to the ground and slide (Subway Surfers mechanic)
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

    // Stride phases: left leg and right leg alternate continuously in exact antiphase
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
        // legProgress: 0.0 at waistline (0.05m), smoothly ramping to 1.0 at feet (-1.29m)
        const legProgress = Math.max(0, Math.min(1.0, (0.05 - by) / 1.34));
        const curve = legProgress * legProgress;

        if (bx < -0.02) {
          // LEFT LEG: swings forward and back in 3D depth (Z), lifts up and down (Y)
          dz = Math.sin(phaseL) * 0.28 * curve;
          dy = Math.max(0, -Math.cos(phaseL)) * 0.16 * curve;
        } else {
          // RIGHT LEG: swings in opposite stride phase
          dz = Math.sin(phaseR) * 0.28 * curve;
          dy = Math.max(0, -Math.cos(phaseR)) * 0.16 * curve;
        }
      } else {
        // Upper Body (Arms, Shoulders, Scarf): by >= 0.05
        const torsoProgress = Math.max(0, Math.min(1.0, (by - 0.05) / 1.24));

        // Left Arm (bx < -0.28): counter-swings with right leg
        if (bx < -0.28 && by < 0.65) {
          dz = Math.sin(phaseR) * 0.15 * torsoProgress;
          dy = Math.cos(phaseR) * 0.06 * torsoProgress;
        }
        // Right Arm (bx > 0.28): counter-swings with left leg
        else if (bx > 0.28 && by < 0.65) {
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
    // Energetic athletic running cadence (smooth, natural, zero shaking)
    const tempo = 4.8 + Math.min(3.2, (runSpeed - 1.0) * 0.8);
    this.runCycle += delta * tempo;

    // Ensure pristine high-resolution texture is active (no frame-flipping jitter)
    if (this.mainMat) {
      let activeTex;
      if (this.selectedAvatar === 'mushika_vahana') {
        activeTex = this.isFrontFacing
          ? (characterTextures.textures.mushikaFront || characterTextures.textures.ganeshaFront)
          : (characterTextures.textures.mushikaBack || characterTextures.textures.ganeshaBack);
      } else {
        activeTex = this.isFrontFacing ? characterTextures.textures.ganeshaFront : characterTextures.textures.ganeshaBack;
      }
      if (activeTex && this.mainMat.map !== activeTex) {
        this.mainMat.map = activeTex;
        this.mainMat.needsUpdate = true;
      }
    }

    // 0. Idle Stance (Menu, Starting Screen & Cinematic Intro: 100% calm, zero shaking)
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

    // 1. Jumping Animation (Aerodynamic human leap arc)
    if (this.isJumping) {
      this.resetDeformation();
      this.jumpTime += delta * 1.75;
      const progress = Math.min(1.0, this.jumpTime);
      const jumpY = 4 * 2.45 * progress * (1 - progress);
      this.root.position.y = jumpY;

      // Aerodynamic human tuck forward
      this.characterGroup.rotation.x = -0.16;
      this.characterGroup.rotation.y = 0;
      this.characterGroup.rotation.z = this.bankAngle;
      this.characterGroup.scale.set(1.0, 1.0, 1.0);
      this.bodyMesh.position.x = 0;

      // Silk scarf sweeps back in aerial slipstream
      if (this.selectedAvatar !== 'mushika_vahana') {
        this.rightScarf.rotation.x = 0.65;
        this.rightScarf.rotation.z = -0.42;
      }

      // Ground shadow contracts and diffuses with altitude
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
    // 2. Sliding Animation (Athletic low slide under obstacles)
    else if (this.isSliding) {
      this.resetDeformation();
      this.slideTime += delta * 2.1;

      // Low-profile center of gravity
      this.characterGroup.position.y = (this.selectedAvatar === 'mushika_vahana') ? -0.22 : -0.42;
      this.characterGroup.rotation.x = 0.78; // Lean back slide pose
      this.characterGroup.rotation.y = 0;
      this.characterGroup.rotation.z = this.bankAngle;
      this.characterGroup.scale.set(1.10, 0.75, 1.0);

      if (this.selectedAvatar !== 'mushika_vahana') {
        // Scarf sweeps low along the railway ballast
        this.rightScarf.rotation.x = 0.85;
        this.rightScarf.position.y = 0.85;
      }

      // Contact shadow broadens during slide
      this.shadowMesh.scale.set(1.45, 1.25, 1.0);
      this.shadowMat.opacity = 0.62;

      if (this.slideTime >= 1.0) {
        this.isSliding = false;
        this.characterGroup.position.y = this.isMushikaMounted ? 0.45 : 0;
        this.characterGroup.rotation.x = 0;
        this.characterGroup.scale.set(1.0, 1.0, 1.0);
        this.shadowMesh.scale.set(1.0, 1.0, 1.0);
        this.shadowMat.opacity = 0.55;
      }
    }
    // 3. Smooth, Visibly Pumping Running Legs Dynamics
    else {
      if (this.selectedAvatar === 'mushika_vahana') {
        this.resetDeformation();
        // Mushika 4-legged sacred mount rhythmic gallop
        const gallopSpeed = this.runCycle * 1.6;
        const gallopBounce = Math.abs(Math.sin(gallopSpeed)) * 0.10;
        const gallopPitch = Math.sin(gallopSpeed) * 0.05;
        this.root.position.y = gallopBounce;

        const speedLean = Math.min(0.20, 0.10 + (runSpeed * 0.02));
        this.characterGroup.rotation.x = speedLean + gallopPitch;
        this.characterGroup.rotation.y = Math.sin(gallopSpeed * 0.5) * 0.03;
        this.characterGroup.rotation.z = this.bankAngle;
        this.characterGroup.scale.set(1.0, 1.0, 1.0);
        this.bodyMesh.position.x = 0;

        const shadowScale = Math.max(0.75, 1.15 - (gallopBounce * 0.35));
        this.shadowMesh.scale.set(shadowScale * 1.35, shadowScale * 1.1, 1.0);
        this.shadowMat.opacity = 0.58 * shadowScale;
      } else {
        // Articulate 3D legs and arm counter-swings in mesh grid!
        this.animateRunningDeformation(this.runCycle, runSpeed);

        // A. Natural vertical running bounce (one rise per stride)
        const bounce = Math.abs(Math.sin(this.runCycle)) * 0.08;
        this.root.position.y = bounce;

        // B. Athletic Sprinter Forward Pitch
        const speedLean = Math.min(0.20, 0.12 + (runSpeed * 0.02));
        this.characterGroup.rotation.x = speedLean;

        // C. Subtle, smooth shoulder sway
        this.characterGroup.rotation.y = Math.sin(this.runCycle) * 0.04;

        // D. Rock-solid lateral stability (ZERO horizontal shaking)
        this.bodyMesh.position.x = 0;
        this.characterGroup.rotation.z = this.bankAngle;

        // E. Rock-solid scale (ZERO squash/stretch jitter)
        this.characterGroup.scale.set(1.0, 1.0, 1.0);

        // F. Smooth contact shadow
        const shadowScale = Math.max(0.75, 1.0 - (bounce * 0.35));
        this.shadowMesh.scale.set(shadowScale, shadowScale, 1.0);
        this.shadowMat.opacity = 0.55 * shadowScale;

        // G. Rock-solid, calm, smooth wind flow (ZERO high-frequency shaking)
        const windWave = Math.sin(this.runCycle * 0.8) * 0.025;
        this.rightScarf.rotation.z = -0.28 - windWave;
        this.rightScarf.rotation.x = 0.30 + Math.cos(this.runCycle * 0.8) * 0.02;
        this.rightScarf.position.y = 1.25;

        this.leftScarf.rotation.z = 0.22 + windWave;
        this.leftScarf.rotation.x = 0.24;
      }
    }

    // 4. Mushika Mount Animation (for super dash powerup on bal_ganesha)
    if (this.isMushikaMounted && this.selectedAvatar !== 'mushika_vahana') {
      this.mushikaGroup.position.y = 0.32 + Math.abs(Math.sin(this.runCycle * 3)) * 0.08;
    }

    // 5. Divine Aura Pulse
    if (this.isDivine) {
      this.haloMesh.rotation.z += delta * 2.5;
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
  }
}
