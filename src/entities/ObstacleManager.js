// ObstacleManager.js - Moving Indian Auto-Rickshaws, Tempos, Carts & Barriers
import * as THREE from 'three';
import { characterTextures } from '../graphics/RealisticCharacterTextures.js';

export const OBSTACLE_TYPES = {
  BLUE_TRAIN: 'BLUE_TRAIN',       // Indian Railway locomotive train (concept art!)
  BARRICADE: 'BARRICADE',         // Red/white hazard striped barricade
  AUTO_RICKSHAW: 'AUTO_RICKSHAW', // Moving Tuk-Tuk vehicle
  TEMPO_VAN: 'TEMPO_VAN',         // Street delivery van
  CART: 'CART',                   // Flower vendor cart
  TORAN_ARCH: 'TORAN_ARCH',       // Slide under
  CHEST_JUMP: 'CHEST_JUMP',       // Jump over
  PILLAR: 'PILLAR'                // Stone barrier
};

export class ObstacleManager {
  constructor(scene, particles, sound) {
    this.scene = scene;
    this.particles = particles;
    this.sound = sound;
    this.obstacles = [];
    this.laneX = [-3.0, 0, 3.0];
    this.runTime = 0;
    this.startSafeZone = 65; // First 65m completely open track intro
    this.spawnAheadDistance = 140; // Spawn waves ~140m ahead
    this.minWaveInterval = 32; // Fair spacing between obstacle waves
    this.nextWaveZ = -this.startSafeZone;

    this.initMaterials();
  }

  initMaterials() {
    // Ultra-High Visibility Materials with Self-Illumination (Emissive)
    // Ensures obstacles stand out vividly against dark track ballast, stone sleepers, and dusk fog
    this.woodMat = new THREE.MeshStandardMaterial({
      color: 0x9c3d14,
      emissive: 0x361204,
      roughness: 0.6
    });
    this.brassMat = new THREE.MeshStandardMaterial({
      color: 0xffb703, // Radiant royal temple gold
      emissive: 0x4a3200,
      metalness: 0.8,
      roughness: 0.2
    });
    this.fabricMat = new THREE.MeshStandardMaterial({
      color: 0xff0055, // Vivid festival crimson
      emissive: 0x55001c,
      roughness: 0.4
    });
    this.marigoldMat = new THREE.MeshStandardMaterial({
      color: 0xff9100, // Glowing marigold orange
      emissive: 0x5a2d00,
      roughness: 0.3
    });
    this.marigoldYellowMat = new THREE.MeshStandardMaterial({
      color: 0xffea00, // Glowing marigold yellow
      emissive: 0x443a00,
      roughness: 0.3
    });
    this.stoneMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Clean bright stone
      roughness: 0.7
    });

    // Blue Train Materials (Electric Royal Blue & High-Vis Hazard Yellow)
    this.trainBlueMat = new THREE.MeshStandardMaterial({
      color: 0x0066ff, // Punchy electric royal blue
      emissive: 0x002466,
      roughness: 0.28,
      metalness: 0.4
    });
    this.trainYellowMat = new THREE.MeshStandardMaterial({
      color: 0xffea00, // Ultra-vivid safety hazard yellow
      emissive: 0x443c00,
      roughness: 0.25
    });
    this.trainRoofMat = new THREE.MeshStandardMaterial({
      color: 0x3d4b64, // Bright steel slate grey
      roughness: 0.5,
      metalness: 0.3
    });
    this.trainLightMat = new THREE.MeshBasicMaterial({
      color: 0xffffff // Pure bright Xenon white
    });
    this.trainLightHaloMat = new THREE.MeshBasicMaterial({
      color: 0xffea00, // Radiant yellow beam halo
      transparent: true,
      opacity: 0.85
    });
    this.trainSirenRed = new THREE.MeshBasicMaterial({
      color: 0xff0044 // Flashing emergency cab beacon
    });
    this.trainWheelMat = new THREE.MeshStandardMaterial({
      color: 0x212529,
      metalness: 0.8,
      roughness: 0.3
    });

    // Barricade Materials (Neon Safety Orange, Hazard Red & Amber Strobes)
    this.barricadeRedMat = new THREE.MeshStandardMaterial({
      color: 0xff0038,
      emissive: 0x440010,
      roughness: 0.4
    });
    this.barricadeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x222222,
      roughness: 0.3
    });
    this.barricadeOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xff5500, // High-vis traffic neon orange
      emissive: 0x441400,
      roughness: 0.35
    });
    this.concreteMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.8
    });
    this.beaconAmberMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00 // Amber warning strobe
    });

    // Auto Rickshaw & Vehicle Materials (Vivid Indian Kelly Green & Sunshine Yellow)
    this.autoGreenMat = new THREE.MeshStandardMaterial({
      color: 0x00c853, // Ultra-vivid Kelly Green
      emissive: 0x003816,
      roughness: 0.35
    });
    this.autoYellowMat = new THREE.MeshStandardMaterial({
      color: 0xffd600, // Punchy bright sunshine yellow
      emissive: 0x403400,
      roughness: 0.3
    });
    this.autoBlackMat = new THREE.MeshStandardMaterial({
      color: 0x212529,
      roughness: 0.5
    });
    this.windshieldMat = new THREE.MeshStandardMaterial({
      color: 0x90e0ef,
      roughness: 0.1,
      transparent: true,
      opacity: 0.75
    });
    this.headlightMat = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
    this.taillightRedMat = new THREE.MeshBasicMaterial({
      color: 0xff073a
    });
    this.tempoOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xff6d00, // High-vis delivery orange
      emissive: 0x441b00,
      roughness: 0.35
    });
    this.gemCyanMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4 // Glowing jump target cyan gem
    });
  }

  createAutoRickshawMesh() {
    const group = new THREE.Group();

    // 1. Lower Body - Ultra-Vivid Kelly Green
    const lowerGeo = new THREE.BoxGeometry(1.6, 0.7, 2.4);
    const lowerBody = new THREE.Mesh(lowerGeo, this.autoGreenMat);
    lowerBody.position.y = 0.55;
    lowerBody.castShadow = true;
    group.add(lowerBody);

    // 2. Front High-Visibility Hazard Bumper
    const bumperGeo = new THREE.BoxGeometry(1.65, 0.16, 0.12);
    const bumper = new THREE.Mesh(bumperGeo, this.trainYellowMat);
    bumper.position.set(0, 0.26, 1.22);
    group.add(bumper);

    // 3. Yellow Canopy Roof - Sunshine Yellow with overhang
    const roofGeo = new THREE.BoxGeometry(1.5, 0.75, 2.2);
    const roof = new THREE.Mesh(roofGeo, this.autoYellowMat);
    roof.position.set(0, 1.25, -0.1);
    group.add(roof);

    // 4. Amber Roof Taxi Indicator Light
    const taxiLightGeo = new THREE.BoxGeometry(0.35, 0.14, 0.2);
    const taxiLight = new THREE.Mesh(taxiLightGeo, this.beaconAmberMat);
    taxiLight.position.set(0, 1.68, 0.2);
    group.add(taxiLight);

    // 5. Windshield
    const glassGeo = new THREE.PlaneGeometry(1.3, 0.65);
    const glass = new THREE.Mesh(glassGeo, this.windshieldMat);
    glass.position.set(0, 1.25, 1.01);
    group.add(glass);

    // 6. Dual Intense Xenon Headlights with Golden Bezels
    for (let hx of [-0.45, 0.45]) {
      const bezelGeo = new THREE.CircleGeometry(0.18, 12);
      const bezel = new THREE.Mesh(bezelGeo, this.brassMat);
      bezel.position.set(hx, 0.62, 1.21);
      group.add(bezel);

      const lightGeo = new THREE.CircleGeometry(0.14, 12);
      const headlight = new THREE.Mesh(lightGeo, this.headlightMat);
      headlight.position.set(hx, 0.62, 1.22);
      group.add(headlight);
    }

    // 7. Rear Glowing Red Brake Lights
    for (let rx of [-0.65, 0.65]) {
      const tailGeo = new THREE.BoxGeometry(0.2, 0.12, 0.05);
      const taillight = new THREE.Mesh(tailGeo, this.taillightRedMat);
      taillight.position.set(rx, 0.55, -1.21);
      group.add(taillight);
    }

    // 8. 3 Black Rubber Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.18, 12);
    wheelGeo.rotateZ(Math.PI / 2);

    // Front wheel
    const frontWheel = new THREE.Mesh(wheelGeo, this.autoBlackMat);
    frontWheel.position.set(0, 0.28, 0.9);
    group.add(frontWheel);

    // Rear wheels
    for (let side of [-0.8, 0.8]) {
      const rearWheel = new THREE.Mesh(wheelGeo, this.autoBlackMat);
      rearWheel.position.set(side, 0.28, -0.7);
      group.add(rearWheel);
    }

    return group;
  }

  createTempoVanMesh() {
    const group = new THREE.Group();

    // 1. High-Vis Safety Orange Cab
    const cabGeo = new THREE.BoxGeometry(1.7, 1.1, 1.2);
    const cab = new THREE.Mesh(cabGeo, this.tempoOrangeMat);
    cab.position.set(0, 0.8, 0.9);
    cab.castShadow = true;
    group.add(cab);

    // 2. High-Vis Sunshine Yellow Cargo Box with Hazard Trim
    const boxGeo = new THREE.BoxGeometry(1.8, 1.4, 2.2);
    const box = new THREE.Mesh(boxGeo, this.autoYellowMat);
    box.position.set(0, 1.0, -0.7);
    box.castShadow = true;
    group.add(box);

    // Red hazard chevron stripe on cargo sides
    const stripeGeo = new THREE.BoxGeometry(1.82, 0.2, 2.22);
    const stripe = new THREE.Mesh(stripeGeo, this.barricadeRedMat);
    stripe.position.set(0, 0.85, -0.7);
    group.add(stripe);

    // 3. Windshield
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.5), this.windshieldMat);
    glass.position.set(0, 0.95, 1.51);
    group.add(glass);

    // 4. Glowing Headlights & Cab Clearance Lights
    for (let x of [-0.6, 0.6]) {
      const light = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), this.headlightMat);
      light.position.set(x, 0.55, 1.51);
      group.add(light);
    }
    for (let cx of [-0.6, 0, 0.6]) {
      const clr = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.08), this.beaconAmberMat);
      clr.position.set(cx, 1.38, 1.35);
      group.add(clr);
    }

    // 5. Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    for (let x of [-0.9, 0.9]) {
      for (let z of [-0.7, 0.9]) {
        const w = new THREE.Mesh(wheelGeo, this.autoBlackMat);
        w.position.set(x, 0.3, z);
        group.add(w);
      }
    }

    return group;
  }

  createBlueTrainMesh() {
    const group = new THREE.Group();

    // 1. Lower Chassis Frame (Heavy iron undercarriage)
    const frameGeo = new THREE.BoxGeometry(1.85, 0.35, 6.2);
    const frame = new THREE.Mesh(frameGeo, this.trainRoofMat);
    frame.position.y = 0.45;
    group.add(frame);

    // 2. High-Vis Front Safety Cowcatcher / Bumper (Safety Hazard Yellow)
    const cowcatcherGeo = new THREE.BoxGeometry(1.88, 0.42, 0.45);
    const cowcatcher = new THREE.Mesh(cowcatcherGeo, this.trainYellowMat);
    cowcatcher.position.set(0, 0.32, 3.15);
    group.add(cowcatcher);

    // Cowcatcher center buffer / chevron accent
    const bufferGeo = new THREE.BoxGeometry(0.7, 0.22, 0.48);
    const buffer = new THREE.Mesh(bufferGeo, this.barricadeRedMat);
    buffer.position.set(0, 0.32, 3.18);
    group.add(buffer);

    // 3. Locomotive Main Body (Vibrant Electric Royal Blue with Self-Illumination)
    const bodyGeo = new THREE.BoxGeometry(1.8, 1.7, 6.0);
    const body = new THREE.Mesh(bodyGeo, this.trainBlueMat);
    body.position.y = 1.35;
    body.castShadow = true;
    group.add(body);

    // 4. High-Contrast Front Yellow Warning Face
    const frontFaceGeo = new THREE.BoxGeometry(1.82, 1.4, 0.15);
    const frontFace = new THREE.Mesh(frontFaceGeo, this.trainYellowMat);
    frontFace.position.set(0, 1.35, 3.01);
    group.add(frontFace);

    // 5. Golden Yellow Hazard Trim Stripes along locomotive sides
    const stripeGeo = new THREE.BoxGeometry(1.83, 0.24, 6.02);
    const stripe = new THREE.Mesh(stripeGeo, this.trainYellowMat);
    stripe.position.y = 1.25;
    group.add(stripe);

    // 6. Sloped Locomotive Cab Roof
    const roofGeo = new THREE.CylinderGeometry(0.92, 0.92, 6.0, 16, 1, false, 0, Math.PI);
    roofGeo.rotateZ(Math.PI / 2);
    const roof = new THREE.Mesh(roofGeo, this.trainRoofMat);
    roof.position.y = 2.2;
    group.add(roof);

    // 7. Front Windshield Windows
    for (let wx of [-0.45, 0.45]) {
      const winGeo = new THREE.PlaneGeometry(0.65, 0.55);
      const win = new THREE.Mesh(winGeo, this.windshieldMat);
      win.position.set(wx, 1.75, 3.09);
      group.add(win);
    }

    // 8. DUAL High-Intensity Xenon Headlights + Yellow Halo Rings
    for (let lx of [-0.55, 0.55]) {
      // Outer bright halo ring
      const haloGeo = new THREE.CircleGeometry(0.32, 16);
      const halo = new THREE.Mesh(haloGeo, this.trainLightHaloMat);
      halo.position.set(lx, 0.95, 3.09);
      group.add(halo);

      // Core pure white spotlight
      const lightGeo = new THREE.CircleGeometry(0.22, 16);
      const light = new THREE.Mesh(lightGeo, this.trainLightMat);
      light.position.set(lx, 0.95, 3.10);
      group.add(light);
    }

    // 9. Center Upper High-Beam Searchlight (Top cab center)
    const topLightHalo = new THREE.Mesh(new THREE.CircleGeometry(0.32, 16), this.trainLightHaloMat);
    topLightHalo.position.set(0, 2.18, 3.02);
    group.add(topLightHalo);

    const topLight = new THREE.Mesh(new THREE.CircleGeometry(0.24, 16), this.trainLightMat);
    topLight.position.set(0, 2.18, 3.03);
    group.add(topLight);

    // 10. Flashing Emergency Red Cab Beacon on Roof
    const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 12), this.autoBlackMat);
    beaconBase.position.set(0, 2.68, 2.2);
    group.add(beaconBase);

    const redBeacon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.22, 12), this.trainSirenRed);
    redBeacon.position.set(0, 2.80, 2.2);
    group.add(redBeacon);

    // 11. Steel Train Wheels (6 wheels along track)
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.14, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    for (let x of [-0.95, 0.95]) {
      for (let z of [-2.0, 0, 2.0]) {
        const wheel = new THREE.Mesh(wheelGeo, this.trainWheelMat);
        wheel.position.set(x, 0.32, z);
        group.add(wheel);
      }
    }

    return group;
  }

  createBarricadeMesh() {
    const group = new THREE.Group();

    // High-visibility Safety Neon Orange upright posts with reflective rings & amber warning strobes
    for (let x of [-0.85, 0.85]) {
      // Concrete foot base
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.35, 0.5), this.concreteMat);
      foot.position.set(x, 0.18, 0);
      group.add(foot);

      // Neon Orange upright post
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.78, 0.14), this.barricadeOrangeMat);
      post.position.set(x, 0.56, 0);
      group.add(post);

      // Reflective white safety collar band
      const collar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), this.barricadeWhiteMat);
      collar.position.set(x, 0.72, 0);
      group.add(collar);

      // Active Amber Warning Beacon Strobe atop post
      const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.06, 10), this.autoBlackMat);
      beaconBase.position.set(x, 0.96, 0);
      group.add(beaconBase);

      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.16, 10), this.beaconAmberMat);
      beacon.position.set(x, 1.05, 0);
      group.add(beacon);
    }

    // High-Visibility "POLICE - DANGER / JUMP" Warning Plank with Red/White Fluorescent Stripes
    const barrierMat = new THREE.MeshStandardMaterial({
      map: characterTextures.textures.policeBarricade,
      emissive: new THREE.Color(0x441018), // Self-illuminates so it shines through dusk fog
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const plankGeo = new THREE.BoxGeometry(1.85, 0.55, 0.08);
    const plank = new THREE.Mesh(plankGeo, barrierMat);
    plank.position.set(0, 0.65, 0);
    plank.castShadow = true;
    group.add(plank);

    return group;
  }

  createToranArchMesh() {
    const group = new THREE.Group();

    // 1. Ornate Temple Gold Pillars (Ultra-high contrast against dark track ballast)
    for (let x of [-1.3, 1.3]) {
      // Base Plinth
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.3, 0.38), this.brassMat);
      base.position.set(x, 0.15, 0);
      group.add(base);

      // Golden Column
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.1, 12), this.brassMat);
      col.position.set(x, 1.7, 0);
      group.add(col);

      // Ornate Capital Crown
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.34), this.trainYellowMat);
      cap.position.set(x, 3.2, 0);
      group.add(cap);
    }

    // 2. Radiant Festival Crimson / Magenta Arch Banner
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.46, 0.32), this.fabricMat);
    beam.position.set(0, 1.95, 0);
    group.add(beam);

    // 3. Golden Trim Border Band along Arch
    const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(2.92, 0.10, 0.34), this.brassMat);
    goldTrim.position.set(0, 1.74, 0);
    group.add(goldTrim);

    // 4. Glowing Downward Arrow / Slide Chevron Indicator (Signals player to slide under!)
    const slideChevron = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.32, 4), this.trainYellowMat);
    slideChevron.rotation.z = Math.PI; // Pointing downward
    slideChevron.position.set(0, 1.92, 0.18);
    group.add(slideChevron);

    // 5. Vibrant Marigold Tassels Hanging Down
    for (let fx = -1.1; fx <= 1.1; fx += 0.44) {
      const tasselMat = (Math.abs(fx) < 0.3) ? this.marigoldYellowMat : this.marigoldMat;
      const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.48, 8), tasselMat);
      tassel.rotation.x = Math.PI;
      tassel.position.set(fx, 1.5, 0);
      group.add(tassel);
    }

    return group;
  }

  createChestMesh() {
    const group = new THREE.Group();

    // 1. Royal Crimson Velvet Body with Gold Trim
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.62, 1.1), this.fabricMat);
    chest.position.y = 0.31;
    chest.castShadow = true;
    group.add(chest);

    // 2. Gleaming Temple Gold Braces & Corner Edge Bands
    const goldBands = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.64, 0.22), this.brassMat);
    goldBands.position.y = 0.31;
    group.add(goldBands);

    // 3. Curved Gold Lid
    const lidGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.62, 14, 1, false, 0, Math.PI);
    lidGeo.rotateZ(Math.PI / 2);
    const lid = new THREE.Mesh(lidGeo, this.brassMat);
    lid.position.set(0, 0.62, 0);
    group.add(lid);

    // 4. Radiant Neon Cyan Glowing Gem / Lock (Acts as Jump Target Beacon!)
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.12), this.gemCyanMat);
    lock.position.set(0, 0.38, 0.56);
    group.add(lock);

    return group;
  }

  createCartMesh() {
    const group = new THREE.Group();

    // 1. Rich Auburn Wooden Cart Base
    const cartBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.42, 1.6), this.woodMat);
    cartBase.position.y = 0.45;
    cartBase.castShadow = true;
    group.add(cartBase);

    // 2. Vivid Festive Vermillion Red Side Panels
    const sidePanels = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.32, 1.62), this.barricadeRedMat);
    sidePanels.position.y = 0.72;
    group.add(sidePanels);

    // 3. Four Golden Brass Corner Canopy Poles
    for (let px of [-0.8, 0.8]) {
      for (let pz of [-0.7, 0.7]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8), this.brassMat);
        pole.position.set(px, 1.35, pz);
        group.add(pole);
      }
    }

    // 4. Vibrant Red & Safety Yellow Striped Canopy Awning
    const awning = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.14, 1.7), this.trainYellowMat);
    awning.position.set(0, 1.9, 0);
    group.add(awning);

    const awningTrim = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.08, 1.72), this.fabricMat);
    awningTrim.position.set(0, 1.83, 0);
    group.add(awningTrim);

    // 5. Piles of Glowing Golden Marigolds & Fruits
    for (let mx of [-0.4, 0.4]) {
      for (let mz of [-0.3, 0.3]) {
        const flowerPile = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), this.marigoldMat);
        flowerPile.position.set(mx, 0.95, mz);
        group.add(flowerPile);
      }
    }

    // 6. Two Large Wooden Wheels with Brass Rims
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    for (let wx of [-0.96, 0.96]) {
      const wheel = new THREE.Mesh(wheelGeo, this.brassMat);
      wheel.position.set(wx, 0.42, 0);
      group.add(wheel);
    }

    return group;
  }

  // SPAWN DYNAMIC WAVE (First 20s gentle intro, then escalating dense obstacles!)
  spawnWave(z, runTime = 0) {
    const lanes = [0, 1, 2];
    // Guarantee center lane (1) is 100% open during first 10s for comfortable straight running
    const freeLane = (runTime < 10.0) ? 1 : Math.floor(Math.random() * 3);
    const blockedLanes = lanes.filter(l => l !== freeLane);

    // 1. FIRST 20 SECONDS: Gentle warm-up intro (only 1 obstacle at a time, 2 open lanes)
    if (runTime < 20.0) {
      const typeChoice = Math.random();
      if (typeChoice < 0.50) {
        // Low barricade to jump over
        this.spawnSingleObstacle(OBSTACLE_TYPES.BARRICADE, blockedLanes[0], z, false);
      } else if (typeChoice < 0.75) {
        // Toran arch to slide under
        this.spawnSingleObstacle(OBSTACLE_TYPES.TORAN_ARCH, blockedLanes[0], z, false);
      } else {
        // Single auto-rickshaw to dodge
        this.spawnSingleObstacle(OBSTACLE_TYPES.AUTO_RICKSHAW, blockedLanes[0], z, false);
      }
      return;
    }

    // 2. AFTER 20 SECONDS: High-intensity, dynamically scaling obstacle waves!
    // As time increases (20s -> 60s -> 120s+), density ramps up to "too much obstacles"!
    const intensity = Math.min(1.0, (runTime - 20.0) / 45.0); // 0.0 at 20s -> 1.0 at 65s
    const patternType = Math.random();

    // Chances of 2 lanes blocked scales from 65% up to 88%!
    const twoLanesChance = 0.65 + intensity * 0.23;

    if (Math.random() < twoLanesChance) {
      // 2 LANES BLOCKED! (Exciting multi-obstacle combinations)
      const combo = Math.random();

      if (combo < 0.35) {
        // Combo A: Oncoming Blue Locomotive Train on 1 lane + Police Barricade on 2nd lane!
        this.spawnSingleObstacle(OBSTACLE_TYPES.BLUE_TRAIN, blockedLanes[0], z, true);
        this.spawnSingleObstacle(OBSTACLE_TYPES.BARRICADE, blockedLanes[1], z, false);
      } else if (combo < 0.65) {
        // Combo B: Moving Auto-Rickshaw/Tempo on 1 lane + Slide Toran Arch or Jump Chest on 2nd lane!
        const vehType = Math.random() > 0.4 ? OBSTACLE_TYPES.AUTO_RICKSHAW : OBSTACLE_TYPES.TEMPO_VAN;
        const isMoving = Math.random() > 0.3;
        this.spawnSingleObstacle(vehType, blockedLanes[0], z, isMoving);
        const secondType = Math.random() > 0.5 ? OBSTACLE_TYPES.TORAN_ARCH : OBSTACLE_TYPES.CHEST_JUMP;
        this.spawnSingleObstacle(secondType, blockedLanes[1], z, false);
      } else if (combo < 0.85) {
        // Combo C: Double Moving Vehicles (1 locomotive train + 1 auto/tempo staggered)
        const vehType = Math.random() > 0.5 ? OBSTACLE_TYPES.AUTO_RICKSHAW : OBSTACLE_TYPES.TEMPO_VAN;
        this.spawnSingleObstacle(OBSTACLE_TYPES.BLUE_TRAIN, blockedLanes[0], z, true);
        this.spawnSingleObstacle(vehType, blockedLanes[1], z + 6, true);
      } else {
        // Combo D: Double Jump Barricades across 2 lanes
        this.spawnSingleObstacle(OBSTACLE_TYPES.BARRICADE, blockedLanes[0], z, false);
        this.spawnSingleObstacle(OBSTACLE_TYPES.BARRICADE, blockedLanes[1], z, false);
      }

      // HIGH INTENSITY REFLEX CHALLENGE: After 35s, add a consecutive follow-up obstacle in open lane!
      if (intensity > 0.35 && Math.random() < 0.45) {
        const followZ = z - (8.0 + Math.random() * 4.0);
        const followType = Math.random() > 0.5 ? OBSTACLE_TYPES.BARRICADE : OBSTACLE_TYPES.TORAN_ARCH;
        this.spawnSingleObstacle(followType, freeLane, followZ, false);
      }
    } else {
      // 1 LANE BLOCKED by high-speed oncoming train or moving vehicle
      if (patternType < 0.45) {
        this.spawnSingleObstacle(OBSTACLE_TYPES.BLUE_TRAIN, blockedLanes[0], z, true);
      } else if (patternType < 0.75) {
        const vehType = Math.random() > 0.5 ? OBSTACLE_TYPES.AUTO_RICKSHAW : OBSTACLE_TYPES.TEMPO_VAN;
        this.spawnSingleObstacle(vehType, blockedLanes[0], z, true);
      } else {
        this.spawnSingleObstacle(OBSTACLE_TYPES.CART, blockedLanes[0], z, false);
      }
    }
  }

  spawnSingleObstacle(type, lane, z, isMoving = false) {
    const x = this.laneX[lane];
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    let bounds = null;
    let moveSpeed = isMoving ? 5.5 : 0;

    if (type === OBSTACLE_TYPES.BLUE_TRAIN) {
      const trainMesh = this.createBlueTrainMesh();
      trainMesh.rotation.y = Math.PI; // Heading towards oncoming player
      group.add(trainMesh);

      bounds = {
        minX: x - 0.95, maxX: x + 0.95,
        minY: 0, maxY: 2.2,
        minZ: z - 3.1, maxZ: z + 3.1,
        action: 'dodge'
      };
    } else if (type === OBSTACLE_TYPES.BARRICADE) {
      const barricadeMesh = this.createBarricadeMesh();
      group.add(barricadeMesh);

      bounds = {
        minX: x - 0.95, maxX: x + 0.95,
        minY: 0, maxY: 0.85,
        minZ: z - 0.35, maxZ: z + 0.35,
        action: 'jump'
      };
    } else if (type === OBSTACLE_TYPES.AUTO_RICKSHAW) {
      const autoMesh = this.createAutoRickshawMesh();
      autoMesh.rotation.y = Math.PI; // Facing oncoming player
      group.add(autoMesh);

      bounds = {
        minX: x - 0.95, maxX: x + 0.95,
        minY: 0, maxY: 1.8,
        minZ: z - 1.3, maxZ: z + 1.3,
        action: 'dodge'
      };
    } else if (type === OBSTACLE_TYPES.TEMPO_VAN) {
      const vanMesh = this.createTempoVanMesh();
      vanMesh.rotation.y = Math.PI; // Facing oncoming player
      group.add(vanMesh);

      bounds = {
        minX: x - 0.95, maxX: x + 0.95,
        minY: 0, maxY: 2.0,
        minZ: z - 1.6, maxZ: z + 1.6,
        action: 'dodge'
      };
    } else if (type === OBSTACLE_TYPES.TORAN_ARCH) {
      const archMesh = this.createToranArchMesh();
      group.add(archMesh);

      bounds = {
        minX: x - 1.2, maxX: x + 1.2,
        minY: 1.2, maxY: 2.3,
        minZ: z - 0.6, maxZ: z + 0.6,
        action: 'slide'
      };
    } else if (type === OBSTACLE_TYPES.CHEST_JUMP) {
      const chestMesh = this.createChestMesh();
      group.add(chestMesh);

      bounds = {
        minX: x - 0.85, maxX: x + 0.85,
        minY: 0, maxY: 0.7,
        minZ: z - 0.7, maxZ: z + 0.7,
        action: 'jump'
      };
    } else {
      const cartMesh = this.createCartMesh();
      group.add(cartMesh);

      bounds = {
        minX: x - 1.0, maxX: x + 1.0,
        minY: 0, maxY: 1.4,
        minZ: z - 0.9, maxZ: z + 0.9,
        action: 'dodge'
      };
    }

    this.scene.add(group);
    this.obstacles.push({
      group, bounds, type, lane, z,
      active: true,
      isMoving, moveSpeed,
      hasHonked: false
    });
  }

  update(delta, playerZ, speed, runTime) {
    if (runTime !== undefined) {
      this.runTime = runTime;
    } else {
      this.runTime += delta;
    }

    // Flash warning beacons & emergency siren lights
    const flash = (Math.sin(this.runTime * 14) > 0);
    this.beaconAmberMat.color.setHex(flash ? 0xffea00 : 0xff7700);
    this.trainSirenRed.color.setHex(flash ? 0xff0044 : 0x770011);

    // Dynamic wave generation:
    // First 20s: 32m to 38m gentle spacing (warmup)
    // After 20s: wave interval compresses down to 11.5m for dense challenge ("too much obstacles")
    while (this.nextWaveZ > playerZ - this.spawnAheadDistance) {
      this.spawnWave(this.nextWaveZ, this.runTime);

      let waveSpacing;
      if (this.runTime < 20.0) {
        waveSpacing = 32.0 + Math.random() * 6.0;
      } else {
        const escalation = Math.min(1.0, (this.runTime - 20.0) / 45.0);
        // Spacing drops from 22m down to 11.5m as run proceeds
        const baseInterval = THREE.MathUtils.lerp(22.0, 11.5, escalation);
        waveSpacing = baseInterval + Math.random() * 3.5;
      }

      this.nextWaveZ -= waveSpacing;
    }

    const cleanupZ = playerZ + 20;
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      // Move oncoming vehicles
      if (obs.isMoving && obs.active) {
        obs.z += obs.moveSpeed * delta; // Drives towards player (+Z)
        obs.group.position.z = obs.z;
        const halfZ = (obs.type === OBSTACLE_TYPES.BLUE_TRAIN) ? 3.1 : (obs.type === OBSTACLE_TYPES.TEMPO_VAN ? 1.6 : 1.3);
        obs.bounds.minZ = obs.z - halfZ;
        obs.bounds.maxZ = obs.z + halfZ;

        // Honk horn if within 25m of player
        if (!obs.hasHonked && Math.abs(obs.z - playerZ) < 26) {
          this.sound.playAutoHorn();
          obs.hasHonked = true;
        }
      }

      if (obs.z > cleanupZ) {
        this.scene.remove(obs.group);
        obs.group.traverse(child => {
          if (child.isMesh) child.geometry?.dispose();
        });
        this.obstacles.splice(i, 1);
      }
    }
  }

  checkCollision(player) {
    const pX = player.position.x;
    const pY = player.position.y;
    const pZ = player.position.z;
    const isJumping = player.isJumping;
    const isSliding = player.isSliding;

    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      if (!obs.active) continue;

      const b = obs.bounds;
      if (Math.abs(pZ - obs.z) < 1.15) {
        if (pX > b.minX && pX < b.maxX) {
          if (b.action === 'slide') {
            if (isSliding) continue;
            return { hit: true, obstacle: obs };
          }
          if (b.action === 'jump') {
            if (isJumping && pY > 0.8) continue;
            return { hit: true, obstacle: obs };
          }
          if (b.action === 'dodge' && isJumping && pY > 1.8) continue;

          return { hit: true, obstacle: obs };
        }
      }
    }

    return { hit: false };
  }

  destroyObstacle(obstacle) {
    if (!obstacle || !obstacle.active) return;
    obstacle.active = false;
    this.particles.burstObstacleDemolish(obstacle.group.position);
    this.scene.remove(obstacle.group);
  }

  destroyObstaclesInFront(playerZ, lane, distance = 40) {
    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      if (obs.active && obs.lane === lane && obs.z < playerZ && obs.z > playerZ - distance) {
        this.destroyObstacle(obs);
      }
    }
  }

  reset() {
    this.obstacles.forEach(obs => {
      this.scene.remove(obs.group);
      obs.group.traverse(child => {
        if (child.isMesh) child.geometry?.dispose();
      });
    });
    this.obstacles = [];
    this.runTime = 0;
    this.nextWaveZ = -this.startSafeZone;
  }
}
