// GaneshaModel.js - Full 3D Articulated Bal Ganesha Model in Three.js
import * as THREE from 'three';

export class GaneshaModel {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.characterGroup = new THREE.Group();
    this.root.add(this.characterGroup);
    this.scene.add(this.root);

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

    this.lastFootstepFrame = -1;
    this.onFootstep = null;

    this.initMaterials();
    this.build3DGanesha();
    this.buildMushika();
    this.buildContactShadow();
  }

  createTilakTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    // Sacred Yellow Sandalwood U-shape
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(64, 70, 36, 0, Math.PI);
    ctx.lineTo(28, 20);
    ctx.moveTo(100, 70);
    ctx.lineTo(100, 20);
    ctx.stroke();

    // Red Kumkum Vermillion Center Stripe
    ctx.fillStyle = '#d90429';
    ctx.fillRect(58, 20, 12, 85);

    // Red Kumkum Bindi Dot
    ctx.beginPath();
    ctx.arc(64, 120, 10, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  initMaterials() {
    // 1. Soft Warm Terracotta Peach Skin with Emissive Subsurface Glow
    this.materials.skin = new THREE.MeshStandardMaterial({
      color: 0xfca57c,
      emissive: 0x4a1c0b,
      roughness: 0.45,
      metalness: 0.05
    });

    // 2. Inner Ear Warm Pink
    this.materials.innerEar = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      emissive: 0x3d0c15,
      roughness: 0.5
    });

    // 3. Polished Ivory Tusks
    this.materials.ivory = new THREE.MeshStandardMaterial({
      color: 0xfffff0,
      roughness: 0.25,
      metalness: 0.1
    });

    // 4. Sacred Saffron / Vermillion Dhoti (Pitambara)
    this.materials.dhoti = new THREE.MeshStandardMaterial({
      color: 0xe63946,
      emissive: 0x3a080d,
      roughness: 0.4,
      metalness: 0.1
    });

    // 5. Billowing Red Silk Angavastram (Scarf)
    this.materials.scarf = new THREE.MeshStandardMaterial({
      color: 0xd90429,
      emissive: 0x44000e,
      roughness: 0.35,
      metalness: 0.12,
      side: THREE.DoubleSide
    });

    // 6. Radiant Temple Gold (Crown, Kamarbandh belt, Ghungroo anklets, bangles)
    this.materials.gold = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0x664400,
      roughness: 0.22,
      metalness: 0.85
    });

    // 7. Ruby Gemstones
    this.materials.ruby = new THREE.MeshStandardMaterial({
      color: 0xd90429,
      emissive: 0x440010,
      roughness: 0.15,
      metalness: 0.4
    });

    // 8. Delicious Motichoor Modak Sweet
    this.materials.modak = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0x553500,
      roughness: 0.3,
      metalness: 0.2
    });

    // 9. Lotus Pink Flower
    this.materials.lotusPink = new THREE.MeshStandardMaterial({
      color: 0xff70a6,
      emissive: 0x330018,
      roughness: 0.4
    });

    // 10. Divine Aura Halo Ring
    this.materials.halo = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });

    // 11. Dynamic Contact Ground Shadow
    this.shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0a0504,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide
    });
  }

  build3DGanesha() {
    const group = this.characterGroup;

    // --- 1. Hips / Pelvis / Torso & Chubby Potbelly ---
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.set(0, 1.05, 0);
    group.add(this.torsoGroup);

    // Chubby Belly (Potbelly)
    const bellyGeo = new THREE.SphereGeometry(0.52, 20, 20);
    bellyGeo.scale(1.02, 0.95, 1.08);
    const belly = new THREE.Mesh(bellyGeo, this.materials.skin);
    belly.position.set(0, 0.08, 0.04);
    belly.castShadow = true;
    this.torsoGroup.add(belly);

    // Pleated Dhoti wrap around lower abdomen
    const dhotiGeo = new THREE.CylinderGeometry(0.48, 0.54, 0.45, 20);
    const dhoti = new THREE.Mesh(dhotiGeo, this.materials.dhoti);
    dhoti.position.set(0, -0.15, 0);
    dhoti.castShadow = true;
    this.torsoGroup.add(dhoti);

    // Golden Belt (Kamarbandh)
    const beltGeo = new THREE.TorusGeometry(0.50, 0.04, 10, 24);
    beltGeo.rotateX(Math.PI / 2);
    const belt = new THREE.Mesh(beltGeo, this.materials.gold);
    belt.position.set(0, 0.04, 0);
    this.torsoGroup.add(belt);

    // Ruby Center Gem on Belt
    const gemGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const gem = new THREE.Mesh(gemGeo, this.materials.ruby);
    gem.position.set(0, 0.04, 0.51);
    this.torsoGroup.add(gem);

    // Sacred Janeu Thread (Golden holy cord across chest)
    const janeuCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.28, 0.42, 0.25),
      new THREE.Vector3(-0.15, 0.25, 0.46),
      new THREE.Vector3(0.18, 0.0, 0.48),
      new THREE.Vector3(0.38, -0.18, 0.25),
      new THREE.Vector3(0.20, -0.10, -0.42),
      new THREE.Vector3(-0.25, 0.25, -0.32)
    ], true);
    const janeuGeo = new THREE.TubeGeometry(janeuCurve, 24, 0.015, 8, true);
    const janeu = new THREE.Mesh(janeuGeo, this.materials.gold);
    this.torsoGroup.add(janeu);

    // Golden Pearl Necklace (Haar)
    const necklaceGeo = new THREE.TorusGeometry(0.32, 0.035, 10, 20, Math.PI);
    necklaceGeo.rotateX(-0.4);
    const necklace = new THREE.Mesh(necklaceGeo, this.materials.gold);
    necklace.position.set(0, 0.45, 0.22);
    this.torsoGroup.add(necklace);

    // --- 2. Elephant Head & Face ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.62, 0.06);
    this.torsoGroup.add(this.headGroup);

    // Round baby elephant head
    const headGeo = new THREE.SphereGeometry(0.46, 22, 22);
    headGeo.scale(1.05, 0.98, 1.05);
    const head = new THREE.Mesh(headGeo, this.materials.skin);
    head.castShadow = true;
    this.headGroup.add(head);

    // Auspicious Sandalwood Tilak on Forehead
    const tilakGeo = new THREE.PlaneGeometry(0.22, 0.28);
    const tilakMat = new THREE.MeshBasicMaterial({
      map: this.createTilakTexture(),
      transparent: true,
      side: THREE.DoubleSide
    });
    const tilak = new THREE.Mesh(tilakGeo, tilakMat);
    tilak.position.set(0, 0.16, 0.46);
    this.headGroup.add(tilak);

    // Adorable Expressive Eyes
    for (let side of [-1, 1]) {
      // Eye White (Sclera)
      const eyeWhiteGeo = new THREE.SphereGeometry(0.09, 14, 14);
      eyeWhiteGeo.scale(0.8, 1.1, 0.6);
      const eyeWhite = new THREE.Mesh(eyeWhiteGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      eyeWhite.position.set(side * 0.24, 0.08, 0.38);
      eyeWhite.rotation.y = side * 0.25;
      this.headGroup.add(eyeWhite);

      // Pupil / Iris
      const pupilGeo = new THREE.SphereGeometry(0.06, 12, 12);
      pupilGeo.scale(0.8, 1.0, 0.5);
      const pupil = new THREE.Mesh(pupilGeo, new THREE.MeshBasicMaterial({ color: 0x221105 }));
      pupil.position.set(side * 0.25, 0.08, 0.42);
      this.headGroup.add(pupil);

      // Catchlight Sparkle
      const catchGeo = new THREE.SphereGeometry(0.02, 8, 8);
      const catchlight = new THREE.Mesh(catchGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      catchlight.position.set(side * 0.24, 0.11, 0.44);
      this.headGroup.add(catchlight);
    }

    // Small Cute Ivory Tusks (Right full, Left broken - Ekadanta!)
    const tuskRightGeo = new THREE.ConeGeometry(0.04, 0.22, 10);
    tuskRightGeo.rotateX(0.5);
    const tuskRight = new THREE.Mesh(tuskRightGeo, this.materials.ivory);
    tuskRight.position.set(0.18, -0.18, 0.38);
    tuskRight.rotation.z = -0.35;
    this.headGroup.add(tuskRight);

    const tuskLeftGeo = new THREE.CylinderGeometry(0.04, 0.038, 0.11, 10);
    tuskLeftGeo.rotateX(0.5);
    const tuskLeft = new THREE.Mesh(tuskLeftGeo, this.materials.ivory);
    tuskLeft.position.set(-0.18, -0.15, 0.38);
    tuskLeft.rotation.z = 0.35;
    this.headGroup.add(tuskLeft);

    // Curved Trunk (Sondh) - 5 articulated segments
    this.trunkGroup = new THREE.Group();
    this.trunkGroup.position.set(0, -0.05, 0.44);
    this.headGroup.add(this.trunkGroup);

    const trunkSegments = [];
    let currentTrunkParent = this.trunkGroup;
    const trunkRadii = [0.14, 0.12, 0.10, 0.08, 0.065];
    const trunkLengths = [0.16, 0.15, 0.14, 0.13, 0.12];

    for (let i = 0; i < 5; i++) {
      const segGroup = new THREE.Group();
      if (i > 0) segGroup.position.set(0, -trunkLengths[i - 1], (i === 1 ? 0.04 : 0.06));
      currentTrunkParent.add(segGroup);

      const rTop = trunkRadii[i];
      const rBot = (i < 4) ? trunkRadii[i + 1] : 0.05;
      const segGeo = new THREE.CylinderGeometry(rTop, rBot, trunkLengths[i], 12);
      segGeo.rotateX(0.18 * (i + 1));
      const segMesh = new THREE.Mesh(segGeo, this.materials.skin);
      segMesh.position.y = -trunkLengths[i] * 0.5;
      segMesh.castShadow = true;
      segGroup.add(segMesh);

      trunkSegments.push(segGroup);
      currentTrunkParent = segGroup;
    }
    this.trunkSegments = trunkSegments;

    // Auspicious Golden Modak on Trunk Tip
    const modakGeo = new THREE.ConeGeometry(0.08, 0.14, 12);
    const modak = new THREE.Mesh(modakGeo, this.materials.modak);
    modak.position.set(0, 0.06, 0.08);
    modak.rotation.x = -0.4;
    currentTrunkParent.add(modak);

    // Big Flapping Elephant Ears (Left & Right)
    this.ears = {};
    for (let side of [-1, 1]) {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * 0.44, 0.08, 0.0);
      this.headGroup.add(earGroup);

      const earGeo = new THREE.CylinderGeometry(0.34, 0.32, 0.03, 16);
      earGeo.scale(1.0, 1.25, 0.8);
      earGeo.rotateZ(Math.PI / 2);
      earGeo.rotateY(side * 0.35);
      const earMesh = new THREE.Mesh(earGeo, this.materials.skin);
      earMesh.position.set(side * 0.18, 0, 0);
      earMesh.castShadow = true;
      earGroup.add(earMesh);

      const innerEarGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.032, 14);
      innerEarGeo.scale(1.0, 1.2, 0.8);
      innerEarGeo.rotateZ(Math.PI / 2);
      innerEarGeo.rotateY(side * 0.35);
      const innerEarMesh = new THREE.Mesh(innerEarGeo, this.materials.innerEar);
      innerEarMesh.position.set(side * 0.185, 0, 0.015);
      earGroup.add(innerEarMesh);

      if (side === -1) this.ears.left = earGroup;
      else this.ears.right = earGroup;
    }

    // Majestic Golden Mukut (Crown) with Gemstones
    this.crownGroup = new THREE.Group();
    this.crownGroup.position.set(0, 0.46, 0.02);
    this.headGroup.add(this.crownGroup);

    const crownBaseGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.22, 20);
    const crownBase = new THREE.Mesh(crownBaseGeo, this.materials.gold);
    this.crownGroup.add(crownBase);

    const crownMidGeo = new THREE.CylinderGeometry(0.28, 0.36, 0.25, 18);
    const crownMid = new THREE.Mesh(crownMidGeo, this.materials.gold);
    crownMid.position.y = 0.22;
    this.crownGroup.add(crownMid);

    const crownTipGeo = new THREE.ConeGeometry(0.18, 0.40, 16);
    const crownTip = new THREE.Mesh(crownTipGeo, this.materials.gold);
    crownTip.position.y = 0.52;
    this.crownGroup.add(crownTip);

    const crownRubyGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const crownRuby = new THREE.Mesh(crownRubyGeo, this.materials.ruby);
    crownRuby.position.set(0, 0.18, 0.36);
    this.crownGroup.add(crownRuby);

    // --- 3. Four Articulated 3D Arms ---
    this.arms = {};
    const buildArm = (isLeft, isFront, shoulderX, shoulderY, shoulderZ) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(shoulderX, shoulderY, shoulderZ);
      this.torsoGroup.add(shoulder);

      const upperGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.36, 12);
      const upper = new THREE.Mesh(upperGeo, this.materials.skin);
      upper.position.y = -0.18;
      upper.castShadow = true;
      shoulder.add(upper);

      const armletGeo = new THREE.TorusGeometry(0.11, 0.022, 8, 16);
      armletGeo.rotateX(Math.PI / 2);
      const armlet = new THREE.Mesh(armletGeo, this.materials.gold);
      armlet.position.y = -0.12;
      shoulder.add(armlet);

      const elbow = new THREE.Group();
      elbow.position.set(0, -0.34, 0);
      shoulder.add(elbow);

      const foreGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.32, 12);
      const fore = new THREE.Mesh(foreGeo, this.materials.skin);
      fore.position.y = -0.16;
      fore.castShadow = true;
      elbow.add(fore);

      const bangleGeo = new THREE.TorusGeometry(0.09, 0.02, 8, 16);
      bangleGeo.rotateX(Math.PI / 2);
      const bangle = new THREE.Mesh(bangleGeo, this.materials.gold);
      bangle.position.y = -0.28;
      elbow.add(bangle);

      const handGeo = new THREE.SphereGeometry(0.09, 12, 12);
      handGeo.scale(0.9, 1.1, 0.8);
      const hand = new THREE.Mesh(handGeo, this.materials.skin);
      hand.position.y = -0.35;
      elbow.add(hand);

      return { shoulder, elbow, hand };
    };

    this.arms.leftFront = buildArm(true, true, -0.42, 0.32, 0.12);
    const modakBowl = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 12), this.materials.modak);
    modakBowl.position.set(0, -0.10, 0.08);
    modakBowl.rotation.x = Math.PI;
    this.arms.leftFront.hand.add(modakBowl);

    this.arms.rightFront = buildArm(false, true, 0.42, 0.32, 0.12);

    this.arms.leftRear = buildArm(true, false, -0.44, 0.36, -0.14);
    const lotus = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), this.materials.lotusPink);
    lotus.position.set(0, -0.10, 0.05);
    this.arms.leftRear.hand.add(lotus);

    this.arms.rightRear = buildArm(false, false, 0.44, 0.36, -0.14);
    const ankusha = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), this.materials.gold);
    ankusha.position.set(0, -0.15, 0.05);
    this.arms.rightRear.hand.add(ankusha);

    // --- 4. Two Articulated 3D Running Legs ---
    this.legs = {};
    const buildLeg = (isLeft) => {
      const hip = new THREE.Group();
      const xOffset = isLeft ? -0.25 : 0.25;
      hip.position.set(xOffset, -0.28, 0);
      this.torsoGroup.add(hip);

      const thighGeo = new THREE.CylinderGeometry(0.17, 0.14, 0.44, 14);
      const thigh = new THREE.Mesh(thighGeo, this.materials.dhoti);
      thigh.position.y = -0.22;
      thigh.castShadow = true;
      hip.add(thigh);

      const knee = new THREE.Group();
      knee.position.set(0, -0.42, 0);
      hip.add(knee);

      const calfGeo = new THREE.CylinderGeometry(0.13, 0.10, 0.42, 12);
      const calf = new THREE.Mesh(calfGeo, this.materials.skin);
      calf.position.y = -0.21;
      calf.castShadow = true;
      knee.add(calf);

      const payalGeo = new THREE.TorusGeometry(0.11, 0.02, 8, 16);
      payalGeo.rotateX(Math.PI / 2);
      const payal = new THREE.Mesh(payalGeo, this.materials.gold);
      payal.position.y = -0.36;
      knee.add(payal);

      const footGeo = new THREE.BoxGeometry(0.18, 0.10, 0.28);
      const foot = new THREE.Mesh(footGeo, this.materials.skin);
      foot.position.set(0, -0.44, 0.06);
      foot.castShadow = true;
      knee.add(foot);

      return { hip, knee, foot };
    };

    this.legs.left = buildLeg(true);
    this.legs.right = buildLeg(false);

    // --- 5. Flowing 3D Angavastram (Silk Scarf Sash) ---
    this.scarfGroup = new THREE.Group();
    this.scarfGroup.position.set(0, 0.35, -0.15);
    this.torsoGroup.add(this.scarfGroup);

    for (let side of [-1, 1]) {
      const scarfCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.35, 0, 0),
        new THREE.Vector3(side * 0.55, -0.2, -0.4),
        new THREE.Vector3(side * 0.75, -0.4, -0.85),
        new THREE.Vector3(side * 0.85, -0.6, -1.35)
      ]);
      const scarfGeo = new THREE.TubeGeometry(scarfCurve, 16, 0.08, 8, false);
      const scarfMesh = new THREE.Mesh(scarfGeo, this.materials.scarf);
      this.scarfGroup.add(scarfMesh);
    }

    // Aura Halo
    const haloGeo = new THREE.RingGeometry(0.65, 0.95, 32);
    this.haloMesh = new THREE.Mesh(haloGeo, this.materials.halo);
    this.haloMesh.position.set(0, 1.75, -0.2);
    this.haloMesh.visible = false;
    group.add(this.haloMesh);

    // Divine point light
    this.divinePointLight = new THREE.PointLight(0xffea00, 1.2, 5.0);
    this.divinePointLight.position.set(0, 1.5, 0.6);
    group.add(this.divinePointLight);
  }

  buildContactShadow() {
    const shadowGeo = new THREE.PlaneGeometry(1.4, 0.95, 8, 8);
    this.shadowMesh = new THREE.Mesh(shadowGeo, this.shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.set(0, 0.025, 0);
    this.root.add(this.shadowMesh);
  }

  buildMushika() {
    this.mushikaGroup = new THREE.Group();
    this.mushikaGroup.position.set(0, 0.32, 0);
    this.mushikaGroup.visible = false;
    this.root.add(this.mushikaGroup);

    const mouseBodyMat = new THREE.MeshStandardMaterial({ color: 0x8d99ae, roughness: 0.6 });
    const mouseGoldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.2 });

    const bodyGeo = new THREE.SphereGeometry(0.45, 14, 14);
    bodyGeo.scale(0.8, 0.6, 1.4);
    const body = new THREE.Mesh(bodyGeo, mouseBodyMat);
    body.position.set(0, 0, 0);
    body.castShadow = true;
    this.mushikaGroup.add(body);

    const saddleGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.15, 14);
    const saddle = new THREE.Mesh(saddleGeo, mouseGoldMat);
    saddle.position.set(0, 0.22, 0);
    this.mushikaGroup.add(saddle);

    const earGeo = new THREE.CircleGeometry(0.14, 12);
    const leftEar = new THREE.Mesh(earGeo, mouseBodyMat);
    leftEar.position.set(-0.24, 0.28, -0.42);
    this.mushikaGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, mouseBodyMat);
    rightEar.position.set(0.24, 0.28, -0.42);
    this.mushikaGroup.add(rightEar);
  }

  setFrontFacing(facing) {
    this.isFrontFacing = facing;
    this.characterGroup.rotation.y = facing ? Math.PI : 0;
  }

  setOutfit(outfitId) {
    this.currentOutfit = outfitId;
    if (outfitId === 'rudraksha') {
      this.materials.dhoti.color.setHex(0x9d0208);
      this.materials.scarf.color.setHex(0xb5179e);
      this.materials.gold.color.setHex(0xe0a96d);
    } else if (outfitId === 'kailash') {
      this.materials.dhoti.color.setHex(0x0077b6);
      this.materials.scarf.color.setHex(0x48cae4);
      this.materials.gold.color.setHex(0xe2e8f0);
    } else {
      this.materials.dhoti.color.setHex(0xe63946);
      this.materials.scarf.color.setHex(0xd90429);
      this.materials.gold.color.setHex(0xffd700);
    }
  }

  setDivineGlow(active) {
    this.isDivine = active;
    this.haloMesh.visible = active;
    this.divinePointLight.intensity = active ? 2.8 : 1.2;
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
      this.torsoGroup.rotation.x = 0;
    }
    this.isJumping = true;
    this.jumpTime = 0;
  }

  slide() {
    if (this.isJumping) {
      this.isJumping = false;
      this.root.position.y = 0;
      this.torsoGroup.rotation.x = 0;
      this.shadowMesh.scale.set(1.0, 1.0, 1.0);
      this.shadowMat.opacity = 0.55;
    }
    this.isSliding = true;
    this.slideTime = 0;
  }

  setBankAngle(targetBank, delta) {
    this.bankAngle = THREE.MathUtils.lerp(this.bankAngle, targetBank, delta * 12);
  }

  update(delta, runSpeed) {
    const tempo = 4.8 + Math.min(3.2, (runSpeed - 1.0) * 0.8);
    this.runCycle += delta * tempo;

    // 0. Idle Stance (Menu, Starting Screen: calm breathing)
    if (this.isFrontFacing) {
      const breath = Math.sin(this.runCycle * 1.5) * 0.02;
      this.root.position.set(0, breath, 0);
      this.characterGroup.rotation.y = Math.PI;
      this.torsoGroup.rotation.set(0, 0, 0);
      this.legs.left.hip.rotation.x = 0;
      this.legs.right.hip.rotation.x = 0;
      this.legs.left.knee.rotation.x = 0;
      this.legs.right.knee.rotation.x = 0;
      this.arms.leftFront.shoulder.rotation.x = 0.2;
      this.arms.rightFront.shoulder.rotation.x = 0.2;
      this.arms.leftRear.shoulder.rotation.x = 0.4;
      this.arms.rightRear.shoulder.rotation.x = 0.4;
      this.shadowMesh.scale.set(1.0, 1.0, 1.0);
      this.shadowMat.opacity = 0.55;
      return;
    }

    // 1. Jumping Animation
    if (this.isJumping) {
      this.jumpTime += delta * 1.75;
      const progress = Math.min(1.0, this.jumpTime);
      const jumpY = 4 * 2.45 * progress * (1 - progress);
      this.root.position.y = jumpY;

      // Tuck legs in aerodynamic leap
      this.legs.left.hip.rotation.x = -0.55;
      this.legs.left.knee.rotation.x = 0.95;
      this.legs.right.hip.rotation.x = -0.45;
      this.legs.right.knee.rotation.x = 0.85;

      // Arms raise joyfully
      this.arms.leftFront.shoulder.rotation.x = 1.1;
      this.arms.rightFront.shoulder.rotation.x = 1.1;
      this.arms.leftRear.shoulder.rotation.x = 1.3;
      this.arms.rightRear.shoulder.rotation.x = 1.3;

      // Trunk curls high
      this.trunkGroup.rotation.x = -0.45;
      this.scarfGroup.rotation.x = 0.8;

      const jumpShadow = Math.max(0.15, 1.0 - (jumpY / 2.8));
      this.shadowMesh.scale.set(jumpShadow, jumpShadow, 1.0);
      this.shadowMat.opacity = 0.55 * jumpShadow;

      if (this.jumpTime >= 1.0) {
        this.isJumping = false;
        this.root.position.y = 0;
        this.shadowMesh.scale.set(1.0, 1.0, 1.0);
        this.shadowMat.opacity = 0.55;
      }
      return;
    }

    // 2. Sliding Animation
    if (this.isSliding) {
      this.slideTime += delta * 1.6;
      const progress = Math.min(1.0, this.slideTime);
      const slideH = Math.sin(progress * Math.PI);

      this.characterGroup.position.y = -0.35 * slideH;
      this.torsoGroup.rotation.x = -0.65 * slideH;

      // Slide legs forward
      this.legs.left.hip.rotation.x = 1.1 * slideH;
      this.legs.right.hip.rotation.x = 1.0 * slideH;
      this.legs.left.knee.rotation.x = 0.2;
      this.legs.right.knee.rotation.x = 0.2;

      // Arms back
      this.arms.leftFront.shoulder.rotation.x = -1.0 * slideH;
      this.arms.rightFront.shoulder.rotation.x = -1.0 * slideH;
      this.scarfGroup.rotation.x = 1.1 * slideH;

      if (this.slideTime >= 1.0) {
        this.isSliding = false;
        this.characterGroup.position.y = 0;
        this.torsoGroup.rotation.x = 0;
      }
      return;
    }

    // 3. Normal Athletic 3D Running Cycle
    const phaseL = this.runCycle;
    const phaseR = this.runCycle + Math.PI;

    // Legs stride & knee articulation
    this.legs.left.hip.rotation.x = Math.sin(phaseL) * 0.72;
    this.legs.left.knee.rotation.x = Math.max(0, -Math.sin(phaseL)) * 0.85;

    this.legs.right.hip.rotation.x = Math.sin(phaseR) * 0.72;
    this.legs.right.knee.rotation.x = Math.max(0, -Math.sin(phaseR)) * 0.85;

    // Arm Counter-Swings
    this.arms.rightFront.shoulder.rotation.x = -Math.sin(phaseL) * 0.65;
    this.arms.rightFront.elbow.rotation.x = -0.4 + Math.abs(Math.sin(phaseL)) * 0.4;

    this.arms.leftFront.shoulder.rotation.x = 0.2 + Math.sin(phaseL) * 0.25;
    this.arms.leftFront.elbow.rotation.x = -0.7 + Math.cos(phaseL) * 0.2;

    this.arms.leftRear.shoulder.rotation.x = -0.3 + Math.sin(phaseR) * 0.35;
    this.arms.rightRear.shoulder.rotation.x = -0.3 + Math.sin(phaseL) * 0.35;

    // Trunk & Ear Playful Bobbing
    const trunkBob = Math.sin(this.runCycle * 1.8) * 0.12;
    this.trunkGroup.rotation.x = 0.25 + trunkBob;
    for (let i = 0; i < this.trunkSegments.length; i++) {
      this.trunkSegments[i].rotation.x = 0.08 + Math.sin(this.runCycle * 1.8 + i * 0.4) * 0.06;
    }

    const earFlap = Math.sin(this.runCycle * 2.0) * 0.18;
    this.ears.left.rotation.y = -0.25 + earFlap;
    this.ears.right.rotation.y = 0.25 - earFlap;

    // Scarf Flutter in slipstream
    this.scarfGroup.rotation.x = Math.sin(this.runCycle * 2.2) * 0.15;
    this.scarfGroup.rotation.y = Math.cos(this.runCycle) * 0.08;

    // Torso Bounce & Banking
    const bounce = Math.abs(Math.sin(this.runCycle)) * 0.10;
    this.characterGroup.position.y = bounce;
    this.torsoGroup.rotation.y = Math.sin(this.runCycle) * 0.08;
    this.torsoGroup.rotation.z = Math.sin(this.runCycle) * 0.04 + this.bankAngle;

    // Footstep particles callback
    const footFrame = Math.sin(this.runCycle) > 0 ? 0 : 1;
    if (footFrame !== this.lastFootstepFrame) {
      this.lastFootstepFrame = footFrame;
      if (this.onFootstep) {
        this.onFootstep(footFrame === 0 ? 'left' : 'right');
      }
    }
  }

  reset() {
    this.runCycle = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.jumpTime = 0;
    this.slideTime = 0;
    this.bankAngle = 0;
    this.setFrontFacing(false);
    this.characterGroup.position.set(0, 0, 0);
    this.characterGroup.rotation.set(0, 0, 0);
    this.torsoGroup.rotation.set(0, 0, 0);
    this.root.position.set(0, 0, 0);
  }
}
