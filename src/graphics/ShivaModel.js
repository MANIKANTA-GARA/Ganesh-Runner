// ShivaModel.js - Full 3D Articulated Lord Shiva Chaser Model in Three.js
import * as THREE from 'three';

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

    this.materials = {};

    this.initMaterials();
    this.build3DShiva();
    this.buildContactShadow();
  }

  createTigerSkinTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Warm tawny orange base
    ctx.fillStyle = '#e76f51';
    ctx.fillRect(0, 0, 256, 256);

    // Dark brown/black tiger stripes
    ctx.fillStyle = '#261105';
    for (let y = 15; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(70, y + 10, 110, y - 12, 160, y + 8);
      ctx.bezierCurveTo(200, y + 20, 230, y - 5, 256, y + 6);
      ctx.lineTo(256, y + 18);
      ctx.bezierCurveTo(220, y + 12, 170, y + 24, 120, y + 5);
      ctx.bezierCurveTo(70, y - 5, 30, y + 22, 0, y + 15);
      ctx.closePath();
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  initMaterials() {
    // 1. Celestial Ash-Blue Skin Tone (Nilakantha aesthetic)
    this.materials.skin = new THREE.MeshStandardMaterial({
      color: 0x90caf9,
      emissive: 0x193b68,
      roughness: 0.45,
      metalness: 0.08
    });

    // 2. Dark Ascetic Jata Locks
    this.materials.hair = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.75
    });

    // 3. Sacred Tiger Skin Pelt (Vyaghracharma)
    this.materials.tigerSkin = new THREE.MeshStandardMaterial({
      map: this.createTigerSkinTexture(),
      roughness: 0.55,
      metalness: 0.05
    });

    // 4. Sacred Bhasma Ash Stripes
    this.materials.ashWhite = new THREE.MeshBasicMaterial({
      color: 0xf1f5f9
    });

    // 5. Sacred Third Eye Flame (Trinetra)
    this.materials.flameRed = new THREE.MeshBasicMaterial({
      color: 0xff1744
    });

    // 6. Sacred Rudraksha Beads
    this.materials.rudraksha = new THREE.MeshStandardMaterial({
      color: 0x603813,
      roughness: 0.65
    });

    // 7. Sacred Serpent (Vasuki)
    this.materials.snake = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      emissive: 0x082518,
      roughness: 0.35,
      metalness: 0.25
    });

    // 8. Polished Golden Trishula Trident
    this.materials.gold = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0x5a3d00,
      roughness: 0.2,
      metalness: 0.88
    });

    // 9. Damru Drum Wood & Sacred Ribbons
    this.materials.damruWood = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.5
    });
    this.materials.ribbonRed = new THREE.MeshStandardMaterial({
      color: 0xd90429,
      side: THREE.DoubleSide
    });

    // 10. Luminous Silver Crescent Moon (Chandra)
    this.materials.moonSilver = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x64748b,
      roughness: 0.15,
      metalness: 0.9
    });

    // 11. Celestial Blue Holy Ganga Stream
    this.materials.celestialBlue = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85
    });

    // 12. Contact Ground Shadow
    this.shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0c0706,
      transparent: true,
      opacity: 0.58,
      side: THREE.DoubleSide
    });
  }

  build3DShiva() {
    const group = this.characterGroup;

    // --- 1. Athletic Yogic Torso ---
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.set(0, 1.45, 0);
    group.add(this.torsoGroup);

    // Muscular Chest (V-taper)
    const chestGeo = new THREE.CylinderGeometry(0.48, 0.36, 0.65, 16);
    chestGeo.scale(1.15, 1.0, 0.75);
    const chest = new THREE.Mesh(chestGeo, this.materials.skin);
    chest.position.y = 0.35;
    chest.castShadow = true;
    this.torsoGroup.add(chest);

    // Abdomen & Waist
    const absGeo = new THREE.CylinderGeometry(0.36, 0.34, 0.45, 16);
    absGeo.scale(1.1, 1.0, 0.7);
    const abs = new THREE.Mesh(absGeo, this.materials.skin);
    abs.position.y = -0.15;
    abs.castShadow = true;
    this.torsoGroup.add(abs);

    // Sacred Triple Bhasma Ash stripes on chest (Tripundra)
    for (let i = 0; i < 3; i++) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.02), this.materials.ashWhite);
      stripe.position.set(0, 0.42 + i * 0.04, 0.28);
      this.torsoGroup.add(stripe);
    }

    // Sacred Rudraksha Bead Mala across chest
    const malaGeo = new THREE.TorusGeometry(0.38, 0.03, 10, 24);
    malaGeo.rotateX(-0.5);
    const mala = new THREE.Mesh(malaGeo, this.materials.rudraksha);
    mala.position.set(0, 0.35, 0.15);
    this.torsoGroup.add(mala);

    // Sacred Serpent (Vasuki) coiled around Shiva's neck
    const snakeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.28, 0.62, 0),
      new THREE.Vector3(-0.15, 0.64, 0.24),
      new THREE.Vector3(0.20, 0.60, 0.22),
      new THREE.Vector3(0.28, 0.58, -0.05),
      new THREE.Vector3(0.12, 0.62, -0.22),
      new THREE.Vector3(-0.18, 0.66, -0.15),
      new THREE.Vector3(-0.28, 0.72, 0.15),
      new THREE.Vector3(-0.35, 0.85, 0.25)
    ]);
    const snakeGeo = new THREE.TubeGeometry(snakeCurve, 24, 0.04, 8, false);
    const snake = new THREE.Mesh(snakeGeo, this.materials.snake);
    this.torsoGroup.add(snake);

    // Snake Hood
    const hoodGeo = new THREE.ConeGeometry(0.08, 0.16, 8);
    hoodGeo.rotateZ(0.5);
    const hood = new THREE.Mesh(hoodGeo, this.materials.snake);
    hood.position.set(-0.35, 0.86, 0.25);
    this.torsoGroup.add(hood);

    // --- 2. Majestic Yogic Head & Jata Locks ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.78, 0.02);
    this.torsoGroup.add(this.headGroup);

    // Head sculpt
    const headGeo = new THREE.SphereGeometry(0.32, 18, 18);
    headGeo.scale(0.95, 1.1, 0.95);
    const head = new THREE.Mesh(headGeo, this.materials.skin);
    head.castShadow = true;
    this.headGroup.add(head);

    // Calm Yogic Eyes
    for (let side of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), new THREE.MeshBasicMaterial({ color: 0x1a242f }));
      eye.scale.set(1.2, 0.6, 0.5);
      eye.position.set(side * 0.13, 0.06, 0.28);
      this.headGroup.add(eye);
    }

    // Sacred Third Eye (Trinetra) on Forehead
    const thirdEye = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.09, 8), this.materials.flameRed);
    thirdEye.position.set(0, 0.18, 0.30);
    thirdEye.rotation.z = Math.PI / 2;
    this.headGroup.add(thirdEye);

    // Coiled Jata-Mukuta Hair Bun
    const jataGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.40, 14);
    const jata = new THREE.Mesh(jataGeo, this.materials.hair);
    jata.position.set(0, 0.38, -0.05);
    this.headGroup.add(jata);

    // Flowing Hair Strands Trailing Backward
    this.hairStrands = [];
    for (let hx of [-0.22, -0.1, 0.1, 0.22]) {
      const strandCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(hx, 0.32, -0.15),
        new THREE.Vector3(hx * 1.3, 0.15, -0.55),
        new THREE.Vector3(hx * 1.6, -0.15, -1.05)
      ]);
      const strandGeo = new THREE.TubeGeometry(strandCurve, 12, 0.035, 6, false);
      const strand = new THREE.Mesh(strandGeo, this.materials.hair);
      this.headGroup.add(strand);
      this.hairStrands.push(strand);
    }

    // Luminous Silver Crescent Moon (Chandra)
    const moonGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 16, Math.PI * 0.85);
    const moon = new THREE.Mesh(moonGeo, this.materials.moonSilver);
    moon.position.set(-0.24, 0.38, 0.12);
    moon.rotation.set(0.4, 0.3, -0.6);
    this.headGroup.add(moon);

    // Holy Ganga Water Stream
    const gangaGeo = new THREE.ConeGeometry(0.06, 0.25, 8);
    gangaGeo.rotateX(Math.PI);
    const ganga = new THREE.Mesh(gangaGeo, this.materials.celestialBlue);
    ganga.position.set(0, 0.65, -0.05);
    this.headGroup.add(ganga);

    // --- 3. Tiger Skin Pelt Dhoti (Vyaghracharma) ---
    const peltGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.55, 16);
    peltGeo.scale(1.1, 1.0, 0.85);
    const pelt = new THREE.Mesh(peltGeo, this.materials.tigerSkin);
    pelt.position.y = -0.42;
    pelt.castShadow = true;
    this.torsoGroup.add(pelt);

    const peltTrim = new THREE.Mesh(new THREE.TorusGeometry(0.40, 0.04, 8, 20), this.materials.gold);
    peltTrim.rotateX(Math.PI / 2);
    peltTrim.position.y = -0.18;
    this.torsoGroup.add(peltTrim);

    // --- 4. Athletic Running Legs ---
    this.legs = {};
    const buildShivaLeg = (isLeft) => {
      const hip = new THREE.Group();
      hip.position.set(isLeft ? -0.22 : 0.22, -0.45, 0);
      this.torsoGroup.add(hip);

      const thighGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.62, 12);
      const thigh = new THREE.Mesh(thighGeo, this.materials.skin);
      thigh.position.y = -0.31;
      thigh.castShadow = true;
      hip.add(thigh);

      const knee = new THREE.Group();
      knee.position.set(0, -0.62, 0);
      hip.add(knee);

      const calfGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.58, 12);
      const calf = new THREE.Mesh(calfGeo, this.materials.skin);
      calf.position.y = -0.29;
      calf.castShadow = true;
      knee.add(calf);

      const footGeo = new THREE.BoxGeometry(0.16, 0.10, 0.32);
      const foot = new THREE.Mesh(footGeo, this.materials.skin);
      foot.position.set(0, -0.62, 0.08);
      foot.castShadow = true;
      knee.add(foot);

      return { hip, knee, foot };
    };

    this.legs.left = buildShivaLeg(true);
    this.legs.right = buildShivaLeg(false);

    // --- 5. Athletic Sprinter Arms & Golden Trishula ---
    this.arms = {};

    // Left Arm (Athletic pumping runner arm)
    const armLShoulder = new THREE.Group();
    armLShoulder.position.set(-0.52, 0.55, 0);
    this.torsoGroup.add(armLShoulder);

    const upperL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.095, 0.48, 12), this.materials.skin);
    upperL.position.y = -0.24;
    upperL.castShadow = true;
    armLShoulder.add(upperL);

    const armLElbow = new THREE.Group();
    armLElbow.position.set(0, -0.46, 0);
    armLShoulder.add(armLElbow);

    const foreL = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.08, 0.44, 12), this.materials.skin);
    foreL.position.y = -0.22;
    foreL.castShadow = true;
    armLElbow.add(foreL);

    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), this.materials.skin);
    handL.position.y = -0.46;
    armLElbow.add(handL);

    this.arms.left = { shoulder: armLShoulder, elbow: armLElbow, hand: handL };

    // Right Arm (Wielding Trishula)
    const armRShoulder = new THREE.Group();
    armRShoulder.position.set(0.52, 0.55, 0);
    this.torsoGroup.add(armRShoulder);

    const upperR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.095, 0.48, 12), this.materials.skin);
    upperR.position.y = -0.24;
    upperR.castShadow = true;
    armRShoulder.add(upperR);

    const armRElbow = new THREE.Group();
    armRElbow.position.set(0, -0.46, 0);
    armRShoulder.add(armRElbow);

    const foreR = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.08, 0.44, 12), this.materials.skin);
    foreR.position.y = -0.22;
    foreR.castShadow = true;
    armRElbow.add(foreR);

    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), this.materials.skin);
    handR.position.y = -0.46;
    armRElbow.add(handR);

    this.arms.right = { shoulder: armRShoulder, elbow: armRElbow, hand: handR };

    // --- Divine Trishula (Trident) ---
    this.tridentGroup = new THREE.Group();
    this.tridentGroup.position.set(0, -0.46, 0.15);
    this.tridentGroup.rotation.set(-0.2, 0, 0.1);
    armRElbow.add(this.tridentGroup);

    const staffGeo = new THREE.CylinderGeometry(0.035, 0.035, 3.2, 10);
    const staff = new THREE.Mesh(staffGeo, this.materials.gold);
    staff.position.y = 0.7;
    staff.castShadow = true;
    this.tridentGroup.add(staff);

    const bladeCenterGeo = new THREE.ConeGeometry(0.07, 0.55, 8);
    const bladeCenter = new THREE.Mesh(bladeCenterGeo, this.materials.gold);
    bladeCenter.position.y = 2.45;
    this.tridentGroup.add(bladeCenter);

    for (let side of [-1, 1]) {
      const prongCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 2.15, 0),
        new THREE.Vector3(side * 0.26, 2.22, 0),
        new THREE.Vector3(side * 0.28, 2.48, 0)
      ]);
      const prongGeo = new THREE.TubeGeometry(prongCurve, 10, 0.03, 6, false);
      const prong = new THREE.Mesh(prongGeo, this.materials.gold);
      this.tridentGroup.add(prong);

      const prongTipGeo = new THREE.ConeGeometry(0.05, 0.24, 6);
      const prongTip = new THREE.Mesh(prongTipGeo, this.materials.gold);
      prongTip.position.set(side * 0.28, 2.58, 0);
      this.tridentGroup.add(prongTip);
    }

    // Sacred Damru Drum
    const damruTopGeo = new THREE.ConeGeometry(0.12, 0.15, 10);
    const damruBotGeo = new THREE.ConeGeometry(0.12, 0.15, 10);
    damruBotGeo.rotateX(Math.PI);

    const damruTop = new THREE.Mesh(damruTopGeo, this.materials.damruWood);
    damruTop.position.set(0.10, 1.85, 0);
    this.tridentGroup.add(damruTop);

    const damruBot = new THREE.Mesh(damruBotGeo, this.materials.damruWood);
    damruBot.position.set(0.10, 1.70, 0);
    this.tridentGroup.add(damruBot);

    for (let rz of [-0.08, 0.08]) {
      const ribbon = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.45), this.materials.ribbonRed);
      ribbon.position.set(0.12, 1.55, rz);
      this.tridentGroup.add(ribbon);
    }

    this.tridentPointLight = new THREE.PointLight(0xffd700, 1.4, 5.5);
    this.tridentPointLight.position.set(0, 2.6, 0);
    this.tridentGroup.add(this.tridentPointLight);

    this.auraLight = new THREE.PointLight(0x70d6ff, 1.2, 6.0);
    this.auraLight.position.set(0, 1.8, 0.6);
    group.add(this.auraLight);
  }

  buildContactShadow() {
    const shadowGeo = new THREE.PlaneGeometry(2.1, 1.3, 8, 8);
    this.shadowMesh = new THREE.Mesh(shadowGeo, this.shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.set(0, 0.025, 0);
    this.root.add(this.shadowMesh);
  }

  setFrontFacing(facing) {
    this.isFrontFacing = facing;
    this.characterGroup.rotation.y = facing ? Math.PI : 0;
  }

  update(delta, runSpeed, distanceBehind, isClosingIn = false) {
    const cadence = 4.8 + Math.min(3.2, (runSpeed - 1.0) * 0.8);
    this.runCycle += delta * cadence;

    // 0. Idle Stance when caught or front-facing
    if (this.isFrontFacing || this.isCatching) {
      const breath = Math.sin(this.runCycle * 1.5) * 0.02;
      this.characterGroup.position.set(0, breath, 0);
      this.characterGroup.rotation.y = Math.PI;
      this.torsoGroup.rotation.set(0, 0, 0);
      this.legs.left.hip.rotation.x = 0;
      this.legs.right.hip.rotation.x = 0;
      this.legs.left.knee.rotation.x = 0;
      this.legs.right.knee.rotation.x = 0;
      this.arms.left.shoulder.rotation.x = 0.3;
      this.arms.right.shoulder.rotation.x = 0.3;
      return;
    }

    // 1. Athletic Running Strides
    const phaseL = this.runCycle;
    const phaseR = this.runCycle + Math.PI;

    this.legs.left.hip.rotation.x = Math.sin(phaseL) * 0.82;
    this.legs.left.knee.rotation.x = Math.max(0, -Math.sin(phaseL)) * 0.95;

    this.legs.right.hip.rotation.x = Math.sin(phaseR) * 0.82;
    this.legs.right.knee.rotation.x = Math.max(0, -Math.sin(phaseR)) * 0.95;

    // 2. Arm Counter-Swings & Closing In
    if (isClosingIn) {
      this.arms.left.shoulder.rotation.x = 1.35;
      this.arms.left.elbow.rotation.x = -0.3;
      this.arms.right.shoulder.rotation.x = 0.55;
      this.torsoGroup.rotation.x = -0.28;
      this.auraLight.color.setHex(0xffaa00);
      this.auraLight.intensity = 2.0;
    } else {
      this.arms.left.shoulder.rotation.x = -Math.sin(phaseL) * 0.75;
      this.arms.left.elbow.rotation.x = -0.5 + Math.abs(Math.sin(phaseL)) * 0.5;

      this.arms.right.shoulder.rotation.x = Math.sin(phaseL) * 0.45;
      this.arms.right.elbow.rotation.x = -0.4;
      this.torsoGroup.rotation.x = -0.16;
      this.auraLight.color.setHex(0x70d6ff);
      this.auraLight.intensity = 1.2;
    }

    // 3. Hair Strands Flutter in Wind
    for (let i = 0; i < this.hairStrands.length; i++) {
      this.hairStrands[i].rotation.x = Math.sin(this.runCycle * 2.0 + i) * 0.14;
    }

    // 4. Vertical Bounce & Lateral Roll
    const bounce = Math.abs(Math.sin(this.runCycle)) * 0.12;
    this.characterGroup.position.y = bounce;
    this.torsoGroup.rotation.y = Math.sin(this.runCycle) * 0.08;

    // 5. Contact Shadow
    const shadowScale = 1.0 - (bounce * 0.25);
    this.shadowMesh.scale.set(shadowScale, shadowScale, 1.0);
  }

  playCatchAnimation() {
    this.isCatching = true;
    this.setFrontFacing(true);
    this.characterGroup.position.set(0, 0, 0);
    this.arms.left.shoulder.rotation.x = 0.8;
    this.arms.right.shoulder.rotation.x = 0.8;
    this.auraLight.color.setHex(0xffea00);
    this.auraLight.intensity = 2.5;
  }

  reset() {
    this.runCycle = 0;
    this.isCatching = false;
    this.setFrontFacing(false);
    this.characterGroup.rotation.set(0, 0, 0);
    this.characterGroup.position.set(0, 0, 0);
    this.torsoGroup.rotation.set(0, 0, 0);
    this.auraLight.color.setHex(0x70d6ff);
    this.auraLight.intensity = 1.2;
  }
}
