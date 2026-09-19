// ObstacleManager.js - Moving Indian Auto-Rickshaws, Tempos, Carts & Barriers
import * as THREE from 'three';
import { characterTextures } from '../graphics/RealisticCharacterTextures.js';

export const OBSTACLE_TYPES = {
  BLUE_TRAIN: 'BLUE_TRAIN',             // Indian Railways Locomotive (classic)
  TRAIN_LOCOMOTIVE: 'TRAIN_LOCOMOTIVE', // WAP-7 Indian Railways Electric Locomotive (8.8m)
  TRAIN_COACH: 'TRAIN_COACH',           // Indian Railways Passenger Coach (9.2m)
  TRAIN_EXPRESS: 'TRAIN_EXPRESS',       // Full Multi-Car Express Train (Loco + Coach, 17.5m)
  BARRICADE: 'BARRICADE',               // Red/white hazard striped barricade
  AUTO_RICKSHAW: 'AUTO_RICKSHAW',       // Moving Tuk-Tuk vehicle
  TEMPO_VAN: 'TEMPO_VAN',               // Street delivery van
  CART: 'CART',                         // Flower vendor cart
  TORAN_ARCH: 'TORAN_ARCH',             // Slide under
  CHEST_JUMP: 'CHEST_JUMP',             // Jump over
  PILLAR: 'PILLAR'                      // Stone barrier
};

export class ObstacleManager {
  constructor(scene, particles, sound, collectibles = null) {
    this.scene = scene;
    this.particles = particles;
    this.sound = sound;
    this.collectibles = collectibles;
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

    // Realistic Indian Railways Locomotive & Coach Materials
    this.trainLocoSideMat = new THREE.MeshStandardMaterial({
      map: characterTextures.textures.trainLocoSide,
      emissive: new THREE.Color(0x001a33),
      emissiveIntensity: 0.35,
      roughness: 0.32,
      metalness: 0.25
    });
    this.trainCoachSideMat = new THREE.MeshStandardMaterial({
      map: characterTextures.textures.trainCoachSide,
      emissive: new THREE.Color(0x001533),
      emissiveIntensity: 0.35,
      roughness: 0.32,
      metalness: 0.20
    });
    this.trainFrontFaceMat = new THREE.MeshStandardMaterial({
      map: characterTextures.textures.trainFrontFace,
      emissive: new THREE.Color(0x1a1500),
      emissiveIntensity: 0.30,
      roughness: 0.32,
      metalness: 0.20
    });
    this.trainBlueMat = new THREE.MeshStandardMaterial({
      color: 0x005bbb, // Deep authentic Indian Railways electric blue
      emissive: 0x001c44,
      roughness: 0.28,
      metalness: 0.35
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
    this.trainBeamConeMat = new THREE.MeshBasicMaterial({
      color: 0xfff4c2, // Volumetric headlight glow beam
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.trainSirenRed = new THREE.MeshBasicMaterial({
      color: 0xff0044 // Flashing emergency cab beacon
    });
    this.trainWheelMat = new THREE.MeshStandardMaterial({
      color: 0x212529,
      metalness: 0.8,
      roughness: 0.3
    });
    this.steelWheelMat = new THREE.MeshStandardMaterial({
      color: 0x3d434a,
      metalness: 0.85,
      roughness: 0.25
    });
    this.flangeMat = new THREE.MeshStandardMaterial({
      color: 0x2b3036,
      metalness: 0.9,
      roughness: 0.2
    });
    this.pantographMat = new THREE.MeshStandardMaterial({
      color: 0xa61c1c, // High-voltage red pantograph arms
      metalness: 0.65,
      roughness: 0.3
    });
    this.insulatorMat = new THREE.MeshStandardMaterial({
      color: 0x6e3b1c, // Ceramic insulator brown
      roughness: 0.3
    });
    this.bellowsMat = new THREE.MeshStandardMaterial({
      color: 0x141414, // Rubber accordion gangway bellows
      roughness: 0.95
    });
    this.chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e24, // Cast steel locomotive subframe
      metalness: 0.7,
      roughness: 0.4
    });
    this.tailLightRedMat = new THREE.MeshBasicMaterial({
      color: 0xff0033 // Glowing red coach marker lights
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

  createBogieTruck(zOffset = 0) {
    const bogie = new THREE.Group();
    bogie.position.set(0, 0, zOffset);

    // 1. Heavy Cast-Steel Bogie Frame
    const frameGeo = new THREE.BoxGeometry(1.72, 0.16, 2.1);
    const frame = new THREE.Mesh(frameGeo, this.chassisMat);
    frame.position.y = 0.48;
    frame.castShadow = true;
    bogie.add(frame);

    // 2. Central Bolster & Pivot Pin
    const bolsterGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.20, 12);
    const bolster = new THREE.Mesh(bolsterGeo, this.trainWheelMat);
    bolster.position.y = 0.52;
    bogie.add(bolster);

    // 3. Two Axles & 4 Steel Wheels resting exactly on the rails
    // Exact Gauge: rails in EnvironmentManager are at x = ±0.72. Rail top is at y = 0.20. Wheel radius 0.30 -> Wheel center y = 0.50!
    const axleZOffsets = [-0.68, 0.68];
    const wheelTreadGeo = new THREE.CylinderGeometry(0.30, 0.30, 0.10, 14);
    wheelTreadGeo.rotateZ(Math.PI / 2);

    const wheelFlangeGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.025, 14);
    wheelFlangeGeo.rotateZ(Math.PI / 2);

    const hubGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.04, 10);
    hubGeo.rotateZ(Math.PI / 2);

    const springGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.22, 8);

    axleZOffsets.forEach(az => {
      // Solid steel axle rod connecting left and right wheels
      const axleRod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.48, 8), this.trainWheelMat);
      axleRod.rotation.z = Math.PI / 2;
      axleRod.position.set(0, 0.50, az);
      bogie.add(axleRod);

      // Left (-0.72) and Right (+0.72) Wheelsets
      for (const side of [-1, 1]) {
        const wx = side * 0.72;

        // Wheel Tread (Rolls directly on top of the steel rail)
        const tread = new THREE.Mesh(wheelTreadGeo, this.steelWheelMat);
        tread.position.set(wx, 0.50, az);
        tread.castShadow = true;
        bogie.add(tread);

        // Steel Guide Flange (on inside of rail: side * 0.67)
        const flange = new THREE.Mesh(wheelFlangeGeo, this.flangeMat);
        flange.position.set(wx - side * 0.05, 0.50, az);
        bogie.add(flange);

        // Axle Journal Box & Hub Cap
        const hub = new THREE.Mesh(hubGeo, this.brassMat);
        hub.position.set(wx + side * 0.06, 0.50, az);
        bogie.add(hub);

        // Heavy-duty Primary Suspension Coil Springs
        const spring = new THREE.Mesh(springGeo, this.trainRoofMat);
        spring.position.set(side * 0.88, 0.61, az);
        bogie.add(spring);
      }
    });

    return bogie;
  }

  createLocomotiveMesh(isMoving = true) {
    const group = new THREE.Group();

    // 1. Heavy Underbody Chassis Deck (8.8m length, 1.82m width)
    const chassisDeck = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.32, 8.6), this.chassisMat);
    chassisDeck.position.y = 0.56;
    chassisDeck.castShadow = true;
    group.add(chassisDeck);

    // Heavy Red Buffer Beams at Front & Rear ends
    for (const bz of [-4.32, 4.32]) {
      const bufferBeam = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.36, 0.12), this.barricadeRedMat);
      bufferBeam.position.set(0, 0.56, bz);
      group.add(bufferBeam);
    }

    // 2. Center Underbelly Equipment (Transformer Belly, Battery Cabinets & Air Tanks)
    const belly = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.44, 3.4), this.chassisMat);
    belly.position.set(0, 0.36, 0);
    group.add(belly);

    // Twin Cylindrical Main Air Brake Reservoirs
    const reservoirGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.6, 12);
    reservoirGeo.rotateX(Math.PI / 2);
    for (const rx of [-0.64, 0.64]) {
      const tank = new THREE.Mesh(reservoirGeo, this.trainRoofMat);
      tank.position.set(rx, 0.36, 0);
      group.add(tank);
    }

    // 3. Two Dual-Axle Heavy Bogie Trucks (Front at z = 2.4, Rear at z = -2.4)
    group.add(this.createBogieTruck(2.4));
    group.add(this.createBogieTruck(-2.4));

    // 4. Solid Aerodynamic Front Cowcatcher Wedge (No hazard bar sticks)
    const plowBase = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.36, 0.35), this.trainYellowMat);
    plowBase.position.set(0, 0.36, 4.45);
    group.add(plowBase);

    // Angled solid plow wedge wings
    for (const side of [-1, 1]) {
      const wedgeTip = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.34, 0.28), this.trainYellowMat);
      wedgeTip.position.set(side * 0.44, 0.36, 4.60);
      wedgeTip.rotation.y = side * 0.35;
      group.add(wedgeTip);
    }

    // Center Automatic Knuckle Coupler
    const coupler = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.38), this.trainWheelMat);
    coupler.position.set(0, 0.50, 4.68);
    group.add(coupler);

    const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.14), this.trainRoofMat);
    knuckle.position.set(0.06, 0.50, 4.88);
    group.add(knuckle);

    // Twin Side Buffer Discs (at x = ±0.60)
    for (const bx of [-0.60, 0.60]) {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 8), this.trainWheelMat);
      stem.rotation.x = Math.PI / 2;
      stem.position.set(bx, 0.56, 4.48);
      group.add(stem);

      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 14), this.trainRoofMat);
      disc.rotation.x = Math.PI / 2;
      disc.position.set(bx, 0.56, 4.60);
      group.add(disc);
    }

    // 5. Locomotive Main Superstructure Body (Length 8.0m, Width 1.80m, Height 1.80m)
    const bodyBox = new THREE.Mesh(new THREE.BoxGeometry(1.80, 1.76, 7.8), this.trainBlueMat);
    bodyBox.position.y = 1.60;
    bodyBox.castShadow = true;
    group.add(bodyBox);

    // Side Livery Panels with Procedural High-Res Texture ("भारतीय रेल / INDIAN RAILWAYS / WAP-7")
    const sidePanelGeo = new THREE.PlaneGeometry(7.7, 1.72);
    // Left Side Panel
    const sideL = new THREE.Mesh(sidePanelGeo, this.trainLocoSideMat);
    sideL.position.set(-0.905, 1.60, 0);
    sideL.rotation.y = -Math.PI / 2;
    group.add(sideL);

    // Right Side Panel
    const sideR = new THREE.Mesh(sidePanelGeo, this.trainLocoSideMat);
    sideR.position.set(0.905, 1.60, 0);
    sideR.rotation.y = Math.PI / 2;
    sideR.scale.x = -1; // Mirror for symmetry
    group.add(sideR);

    // 6. Aerodynamic Sloped Cab Front (Nose)
    const frontNose = new THREE.Mesh(new THREE.BoxGeometry(1.82, 1.45, 0.45), this.trainBlueMat);
    frontNose.position.set(0, 1.44, 4.12);
    group.add(frontNose);

    // Front Nose Texture (Safety Yellow V-Chevron, Fleet Number 30201, Emblem)
    const noseTexMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.82, 1.45), this.trainFrontFaceMat);
    noseTexMesh.position.set(0, 1.44, 4.36);
    group.add(noseTexMesh);

    // Dual Flush Windshield Panes & Clean Trim (NO wipers sticks)
    const windshieldFrame = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.65, 0.06), this.autoBlackMat);
    windshieldFrame.position.set(0, 1.88, 4.28);
    group.add(windshieldFrame);

    for (const wx of [-0.44, 0.44]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.54), this.windshieldMat);
      win.position.set(wx, 1.88, 4.33);
      group.add(win);
    }

    // Sleek flush aerodynamic side mirrors (molded directly into cab body, NO stick arms!)
    for (const mx of [-0.96, 0.96]) {
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.28, 0.16), this.trainBlueMat);
      mirror.position.set(mx, 1.92, 3.90);
      group.add(mirror);

      const mirrorFace = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.24), this.trainRoofMat);
      mirrorFace.position.set(mx * 1.01, 1.92, 3.88);
      mirrorFace.rotation.y = (mx < 0 ? -Math.PI / 2 : Math.PI / 2);
      group.add(mirrorFace);
    }

    // 7. CLEAN AERODYNAMIC STREAMLINED ROOF (ZERO STICKS, ZERO CYLINDER PROTRUSIONS)
    // Sleek flush main roof deck matching locomotive body width 1.80m and length 7.8m
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.80, 0.16, 7.8), this.trainRoofMat);
    roof.position.y = 2.48;
    group.add(roof);

    // Streamlined beveled upper deck running longitudinally along the locomotive
    const topDeck = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.08, 7.6), this.trainRoofMat);
    topDeck.position.y = 2.58;
    group.add(topDeck);

    // Sleek flush aerodynamic rooftop pods (low profile, completely flush, no sticks)
    for (const hz of [-2.4, 0.0, 2.0]) {
      const pod = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.10, 1.4), this.trainRoofMat);
      pod.position.set(0, 2.65, hz);
      group.add(pod);

      // Flush cooling grille inlay
      const grille = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.02, 1.1), this.chassisMat);
      grille.position.set(0, 2.71, hz);
      group.add(grille);
    }

    // 8. LIGHTING & MOVING VS STANDING STATE
    if (isMoving) {
      // MOVING TRAIN: High-Intensity Blazing Headlights, Forward Beam Cone & Active Siren
      for (const lx of [-0.52, 0.52]) {
        const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 14), this.trainRoofMat);
        bezel.rotation.x = Math.PI / 2;
        bezel.position.set(lx, 1.08, 4.36);
        group.add(bezel);

        const halo = new THREE.Mesh(new THREE.CircleGeometry(0.25, 16), this.trainLightHaloMat);
        halo.position.set(lx, 1.08, 4.41);
        group.add(halo);

        const core = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), this.trainLightMat);
        core.position.set(lx, 1.08, 4.42);
        group.add(core);
      }

      // Upper Searchlight
      const topBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.10, 14), this.trainRoofMat);
      topBezel.rotation.x = Math.PI / 2;
      topBezel.position.set(0, 2.38, 4.28);
      group.add(topBezel);

      const topHalo = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), this.trainLightHaloMat);
      topHalo.position.set(0, 2.38, 4.34);
      group.add(topHalo);

      const topCore = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), this.trainLightMat);
      topCore.position.set(0, 2.38, 4.35);
      group.add(topCore);

      // Forward Volumetric Searchlight Beam Cone casting down tracks!
      const beamCone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 20.0, 16, 1, true), this.trainBeamConeMat);
      beamCone.rotation.x = -Math.PI / 2;
      beamCone.position.set(0, 1.25, 14.4);
      group.add(beamCone);

      // Flashing Emergency Cab Strobe Dome (low profile flush beacon)
      const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 10), this.autoBlackMat);
      beaconBase.position.set(0, 2.64, 3.2);
      group.add(beaconBase);

      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), this.trainSirenRed);
      beacon.position.set(0, 2.70, 3.2);
      group.add(beacon);
    } else {
      // STANDING / PARKED TRAIN: Soft idle parking lights + twin red caution markers on buffer beam
      for (const lx of [-0.52, 0.52]) {
        const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 14), this.trainRoofMat);
        bezel.rotation.x = Math.PI / 2;
        bezel.position.set(lx, 1.08, 4.36);
        group.add(bezel);

        // Soft warm yellow parking glow
        const core = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), this.trainLightHaloMat);
        core.position.set(lx, 1.08, 4.41);
        group.add(core);
      }

      // Front Buffer Beam Twin Red Stabled / Parking Caution Lamps (Clear visual sign of STANDING train!)
      for (const rx of [-0.75, 0.75]) {
        const redBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 10), this.trainRoofMat);
        redBezel.rotation.x = Math.PI / 2;
        redBezel.position.set(rx, 0.56, 4.54);
        group.add(redBezel);

        const redDisc = new THREE.Mesh(new THREE.CircleGeometry(0.10, 12), this.tailLightRedMat);
        redDisc.position.set(rx, 0.56, 4.57);
        group.add(redDisc);
      }
    }

    return group;
  }

  createCoachMesh(isMoving = false) {
    const group = new THREE.Group();

    // 1. Underbody Chassis Frame (9.2m length)
    const chassisDeck = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.32, 9.0), this.chassisMat);
    chassisDeck.position.y = 0.56;
    chassisDeck.castShadow = true;
    group.add(chassisDeck);

    // Equipment Boxes & Battery Cabinets under floor
    for (const bz of [-1.2, 1.2]) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.40, 1.8), this.chassisMat);
      box.position.set(0, 0.38, bz);
      group.add(box);
    }

    // 2. Dual 4-Wheel Bogies (Front at z = 2.8, Rear at z = -2.8)
    group.add(this.createBogieTruck(2.8));
    group.add(this.createBogieTruck(-2.8));

    // 3. Passenger Coach Main Body Shell
    const bodyBox = new THREE.Mesh(new THREE.BoxGeometry(1.80, 1.76, 8.8), this.trainBlueMat);
    bodyBox.position.y = 1.60;
    bodyBox.castShadow = true;
    group.add(bodyBox);

    // Side Panels with Procedural High-Res Texture (Two-tone Indian Railways Blue, 9 windows with warm interior glow)
    const sidePanelGeo = new THREE.PlaneGeometry(8.75, 1.72);
    // Left Side
    const sideL = new THREE.Mesh(sidePanelGeo, this.trainCoachSideMat);
    sideL.position.set(-0.905, 1.60, 0);
    sideL.rotation.y = -Math.PI / 2;
    group.add(sideL);

    // Right Side
    const sideR = new THREE.Mesh(sidePanelGeo, this.trainCoachSideMat);
    sideR.position.set(0.905, 1.60, 0);
    sideR.rotation.y = Math.PI / 2;
    sideR.scale.x = -1;
    group.add(sideR);

    // 4. Sleek Aerodynamic Roof (ZERO STICKS, ZERO CYLINDER PROTRUSIONS)
    // Low-profile flush main roof deck matching coach body width 1.82m and length 8.8m
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.16, 8.8), this.trainRoofMat);
    roof.position.y = 2.48;
    group.add(roof);

    // Streamlined beveled upper deck running longitudinally along the coach
    const topDeck = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.08, 8.6), this.trainRoofMat);
    topDeck.position.y = 2.58;
    group.add(topDeck);

    // Sleek flush longitudinal roof ribs (seamless corrugated texture, no sticks)
    for (const rz of [-2.4, 0, 2.4]) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 1.6), this.trainRoofMat);
      rib.position.set(0, 2.64, rz);
      group.add(rib);
    }

    // 5. Vestibule / Gangway Rubber Accordion Bellows at both Ends
    for (const bz of [-4.48, 4.48]) {
      const bellows = new THREE.Mesh(new THREE.BoxGeometry(1.24, 1.82, 0.32), this.bellowsMat);
      bellows.position.set(0, 1.58, bz);
      group.add(bellows);

      // Buffer beam at both ends
      const bufferBeam = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.34, 0.10), this.barricadeRedMat);
      bufferBeam.position.set(0, 0.56, bz);
      group.add(bufferBeam);

      const coupler = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.36), this.trainWheelMat);
      coupler.position.set(0, 0.50, bz + (bz > 0 ? 0.22 : -0.22));
      group.add(coupler);
    }

    // Rear End Glowing Red Tail Marker Lights
    for (const rx of [-0.55, 0.55]) {
      const redLight = new THREE.Mesh(new THREE.CircleGeometry(0.14, 12), this.tailLightRedMat);
      redLight.position.set(rx, 1.65, -4.66);
      redLight.rotation.y = Math.PI;
      group.add(redLight);
    }

    return group;
  }

  createExpressTrainMesh(isMoving = true) {
    const group = new THREE.Group();

    // 1. WAP-7 Locomotive in front (center z = 4.4)
    const loco = this.createLocomotiveMesh(isMoving);
    loco.position.set(0, 0, 4.4);
    group.add(loco);

    // 2. Passenger Coach connected behind (center z = -4.7)
    const coach = this.createCoachMesh(isMoving);
    coach.position.set(0, 0, -4.7);
    group.add(coach);

    // 3. Inter-car Gangway Accordion Rubber Bellows
    const bellows = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1.84, 0.55), this.bellowsMat);
    bellows.position.set(0, 1.58, -0.15);
    group.add(bellows);

    return group;
  }

  createBlueTrainMesh(isMoving = true) {
    return this.createLocomotiveMesh(isMoving);
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

  // Hard Safety Validator: Check that adding an obstacle will NEVER block all 3 tracks at any point in Z
  isSafeToSpawn(lane, z, halfLength) {
    if (lane < 0 || lane > 2) return false;

    const zStart = z - halfLength;
    const zEnd = z + halfLength;

    // Check at sample intervals across the proposed obstacle's span
    const step = 1.5;
    for (let curZ = zStart; curZ <= zEnd; curZ += step) {
      let blockedLanesCount = 1; // Proposed obstacle blocks this lane

      for (let otherLane = 0; otherLane < 3; otherLane++) {
        if (otherLane === lane) continue;

        const isOtherBlocked = this.obstacles.some(obs => {
          if (!obs.active) return false;
          if (obs.lane !== otherLane) return false;
          return (curZ >= obs.bounds.minZ - 0.4 && curZ <= obs.bounds.maxZ + 0.4);
        });

        if (isOtherBlocked) {
          blockedLanesCount++;
        }
      }

      // If all 3 lanes would be blocked at curZ, STRICTLY REJECT!
      if (blockedLanesCount >= 3) {
        return false;
      }
    }

    return true;
  }

  // SPAWN DYNAMIC WAVE (At most 2 tracks blocked, at least 1 track guaranteed 100% open!)
  spawnWave(z, runTime = 0) {
    const lanes = [0, 1, 2];
    const spawned = [];

    // 1. FIRST 12 SECONDS: Gentle warm-up intro (only 1 obstacle, center track 1 is 100% open)
    if (runTime < 12.0) {
      const blockedLane = Math.random() > 0.5 ? 0 : 2;
      const typeChoice = Math.random();
      let type = OBSTACLE_TYPES.BARRICADE;
      if (typeChoice < 0.45) {
        type = OBSTACLE_TYPES.BARRICADE;
      } else if (typeChoice < 0.75) {
        type = OBSTACLE_TYPES.TRAIN_COACH;
      } else {
        type = OBSTACLE_TYPES.TORAN_ARCH;
      }
      const obs = this.spawnSingleObstacle(type, blockedLane, z, false);
      if (obs) spawned.push(obs);
      return obs ? obs.halfLength : 4.5;
    }

    // 2. AFTER 12 SECONDS: High-adrenaline railway runner
    // User requested: "the player will be allowed to run in single track Other two tracks are filled with the trains then they will be more on Run"
    
    const waveChoice = Math.random();

    if (waveChoice < 0.65) {
      // =========================================================================
      // SCENARIO 1: DOUBLE TRAIN CORRIDOR (2 tracks filled with trains, 1 track open!)
      // =========================================================================
      // Pick which track is the SINGLE OPEN RUNWAY:
      // 50% chance: Center track (Lane 1) flanked by trains on both sides (tracks 0 & 2)
      // 25% chance: Left track (Lane 0) open, trains on tracks 1 & 2
      // 25% chance: Right track (Lane 2) open, trains on tracks 0 & 1
      let freeLane;
      const freeRoll = Math.random();
      if (freeRoll < 0.50) {
        freeLane = 1; // Center track open
      } else if (freeRoll < 0.75) {
        freeLane = 0; // Left track open
      } else {
        freeLane = 2; // Right track open
      }

      const trainLanes = lanes.filter(l => l !== freeLane);
      // Both trainLanes will have trains!

      const comboRoll = Math.random();
      if (comboRoll < 0.35) {
        // COMBO A: 1 MOVING ONCOMING TRAIN (with headlights & horn) + 1 STANDING STABLED COACH
        const movingLane = Math.random() > 0.5 ? trainLanes[0] : trainLanes[1];
        const standingLane = (movingLane === trainLanes[0]) ? trainLanes[1] : trainLanes[0];
        
        const obs1 = this.spawnSingleObstacle(OBSTACLE_TYPES.TRAIN_EXPRESS, movingLane, z, true);
        const obs2 = this.spawnSingleObstacle(OBSTACLE_TYPES.TRAIN_COACH, standingLane, z, false);
        if (obs1) spawned.push(obs1);
        if (obs2) spawned.push(obs2);
      } else if (comboRoll < 0.65) {
        // COMBO B: DOUBLE STANDING PASSENGER COACHES (Authentic Railway Yard Corridor!)
        const obs1 = this.spawnSingleObstacle(OBSTACLE_TYPES.TRAIN_COACH, trainLanes[0], z, false);
        const obs2 = this.spawnSingleObstacle(OBSTACLE_TYPES.TRAIN_COACH, trainLanes[1], z, false);
        if (obs1) spawned.push(obs1);
        if (obs2) spawned.push(obs2);
      } else if (comboRoll < 0.85) {
        // COMBO C: 1 MOVING WAP-7 LOCOMOTIVE + 1 STANDING WAP-7 LOCOMOTIVE
        const movingLane = Math.random() > 0.5 ? trainLanes[0] : trainLanes[1];
        const standingLane = (movingLane === trainLanes[0]) ? trainLanes[1] : trainLanes[0];
        
        const obs1 = this.spawnSingleObstacle(OBSTACLE_TYPES.TRAIN_LOCOMOTIVE, movingLane, z, true);
        const obs2 = this.spawnSingleObstacle(OBSTACLE_TYPES.TRAIN_LOCOMOTIVE, standingLane, z, false);
        if (obs1) spawned.push(obs1);
        if (obs2) spawned.push(obs2);
      } else {
        // COMBO D: 1 FULL EXPRESS TRAIN (Standing) + 1 LOCOMOTIVE (Standing)
        const obs1 = this.spawnSingleObstacle(OBSTACLE_TYPES.TRAIN_EXPRESS, trainLanes[0], z, false);
        const obs2 = this.spawnSingleObstacle(OBSTACLE_TYPES.TRAIN_LOCOMOTIVE, trainLanes[1], z, false);
        if (obs1) spawned.push(obs1);
        if (obs2) spawned.push(obs2);
      }

      // SPAWN RUNWAY MOTICHOOR LADDUS DOWN THE SINGLE OPEN TRACK!
      // Guides the player safely through the corridor between the trains!
      if (this.collectibles && typeof this.collectibles.spawnItem === 'function') {
        const freeX = this.laneX[freeLane];
        const maxLen = spawned.length > 0 ? Math.max(...spawned.map(o => o.halfLength)) : 8.5;
        const ladduCount = 6;
        for (let k = 0; k < ladduCount; k++) {
          const ladduZ = z + (maxLen - 2.0) - k * ((maxLen * 2.0 - 4.0) / (ladduCount - 1));
          this.collectibles.spawnItem('LADDU', freeX, ladduZ, 0.6);
        }
      }

    } else if (waveChoice < 0.90) {
      // =========================================================================
      // SCENARIO 2: SINGLE TRAIN (1 track has train, other 2 tracks are open!)
      // =========================================================================
      const trainLane = Math.floor(Math.random() * 3);
      const isMoving = Math.random() < 0.50;
      const trainType = Math.random() > 0.5 ? OBSTACLE_TYPES.TRAIN_EXPRESS : OBSTACLE_TYPES.TRAIN_COACH;
      
      const obs = this.spawnSingleObstacle(trainType, trainLane, z, isMoving);
      if (obs) spawned.push(obs);

      // On one of the other 2 tracks, optionally place a low flower cart
      if (Math.random() < 0.40) {
        const otherLanes = lanes.filter(l => l !== trainLane);
        const cartLane = otherLanes[Math.floor(Math.random() * otherLanes.length)];
        const cartObs = this.spawnSingleObstacle(OBSTACLE_TYPES.CART, cartLane, z, false);
        if (cartObs) spawned.push(cartObs);
      }
    } else {
      // =========================================================================
      // SCENARIO 3: STREET VEHICLE & BARRICADES (1 or 2 tracks, leaving 1-2 open)
      // =========================================================================
      const freeLane = Math.floor(Math.random() * 3);
      const blockedLanes = lanes.filter(l => l !== freeLane);

      const type1 = Math.random() > 0.5 ? OBSTACLE_TYPES.AUTO_RICKSHAW : OBSTACLE_TYPES.BARRICADE;
      const obs1 = this.spawnSingleObstacle(type1, blockedLanes[0], z, type1 === OBSTACLE_TYPES.AUTO_RICKSHAW);
      if (obs1) spawned.push(obs1);

      if (Math.random() < 0.50) {
        const type2 = Math.random() > 0.5 ? OBSTACLE_TYPES.TORAN_ARCH : OBSTACLE_TYPES.TEMPO_VAN;
        const obs2 = this.spawnSingleObstacle(type2, blockedLanes[1], z, type2 === OBSTACLE_TYPES.TEMPO_VAN);
        if (obs2) spawned.push(obs2);
      }
    }

    const maxHalf = spawned.length > 0 ? Math.max(...spawned.map(o => o.halfLength)) : 5.0;
    return maxHalf;
  }

  spawnSingleObstacle(type, lane, z, isMoving = false) {
    let halfLength = 1.5;
    if (type === OBSTACLE_TYPES.TRAIN_EXPRESS) halfLength = 8.5;
    else if (type === OBSTACLE_TYPES.TRAIN_COACH) halfLength = 4.6;
    else if (type === OBSTACLE_TYPES.TRAIN_LOCOMOTIVE || type === OBSTACLE_TYPES.BLUE_TRAIN) halfLength = 4.4;
    else if (type === OBSTACLE_TYPES.BARRICADE) halfLength = 0.35;
    else if (type === OBSTACLE_TYPES.AUTO_RICKSHAW) halfLength = 1.3;
    else if (type === OBSTACLE_TYPES.TEMPO_VAN) halfLength = 1.6;
    else if (type === OBSTACLE_TYPES.TORAN_ARCH) halfLength = 0.6;
    else if (type === OBSTACLE_TYPES.CHEST_JUMP) halfLength = 0.7;
    else halfLength = 0.9;

    // Hard Safety Validator: Check that adding this obstacle will NEVER block all 3 tracks!
    if (!this.isSafeToSpawn(lane, z, halfLength)) {
      return null;
    }

    const x = this.laneX[lane];
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    let bounds = null;
    let isTrain = false;
    let moveSpeed = 0;

    if (type === OBSTACLE_TYPES.TRAIN_EXPRESS) {
      const trainMesh = this.createExpressTrainMesh(isMoving);
      trainMesh.rotation.y = Math.PI; // Heading towards oncoming player
      group.add(trainMesh);

      halfLength = 8.5;
      isTrain = true;
      moveSpeed = isMoving ? 8.0 : 0;
      bounds = {
        minX: x - 0.95, maxX: x + 0.95,
        minY: 0, maxY: 3.4,
        minZ: z - halfLength, maxZ: z + halfLength,
        action: 'dodge'
      };
    } else if (type === OBSTACLE_TYPES.TRAIN_COACH) {
      const coachMesh = this.createCoachMesh(isMoving);
      if (isMoving) coachMesh.rotation.y = Math.PI;
      group.add(coachMesh);

      halfLength = 4.6;
      isTrain = true;
      moveSpeed = isMoving ? 6.5 : 0;
      bounds = {
        minX: x - 0.95, maxX: x + 0.95,
        minY: 0, maxY: 3.0,
        minZ: z - halfLength, maxZ: z + halfLength,
        action: 'dodge'
      };
    } else if (type === OBSTACLE_TYPES.TRAIN_LOCOMOTIVE || type === OBSTACLE_TYPES.BLUE_TRAIN) {
      const locoMesh = this.createLocomotiveMesh(isMoving);
      locoMesh.rotation.y = Math.PI; // Heading towards oncoming player
      group.add(locoMesh);

      halfLength = 4.4;
      isTrain = true;
      moveSpeed = isMoving ? 7.5 : 0;
      bounds = {
        minX: x - 0.95, maxX: x + 0.95,
        minY: 0, maxY: 3.4,
        minZ: z - halfLength, maxZ: z + halfLength,
        action: 'dodge'
      };
    } else if (type === OBSTACLE_TYPES.BARRICADE) {
      const barricadeMesh = this.createBarricadeMesh();
      group.add(barricadeMesh);

      halfLength = 0.35;
      bounds = {
        minX: x - 0.95, maxX: x + 0.95,
        minY: 0, maxY: 0.85,
        minZ: z - halfLength, maxZ: z + halfLength,
        action: 'jump'
      };
    } else if (type === OBSTACLE_TYPES.AUTO_RICKSHAW) {
      const autoMesh = this.createAutoRickshawMesh();
      autoMesh.rotation.y = Math.PI; // Facing oncoming player
      group.add(autoMesh);

      halfLength = 1.3;
      moveSpeed = isMoving ? 5.5 : 0;
      bounds = {
        minX: x - 0.95, maxX: x + 0.95,
        minY: 0, maxY: 1.8,
        minZ: z - halfLength, maxZ: z + halfLength,
        action: 'dodge'
      };
    } else if (type === OBSTACLE_TYPES.TEMPO_VAN) {
      const vanMesh = this.createTempoVanMesh();
      vanMesh.rotation.y = Math.PI; // Facing oncoming player
      group.add(vanMesh);

      halfLength = 1.6;
      moveSpeed = isMoving ? 6.0 : 0;
      bounds = {
        minX: x - 0.95, maxX: x + 0.95,
        minY: 0, maxY: 2.0,
        minZ: z - halfLength, maxZ: z + halfLength,
        action: 'dodge'
      };
    } else if (type === OBSTACLE_TYPES.TORAN_ARCH) {
      const archMesh = this.createToranArchMesh();
      group.add(archMesh);

      halfLength = 0.6;
      bounds = {
        minX: x - 1.2, maxX: x + 1.2,
        minY: 1.2, maxY: 2.3,
        minZ: z - halfLength, maxZ: z + halfLength,
        action: 'slide'
      };
    } else if (type === OBSTACLE_TYPES.CHEST_JUMP) {
      const chestMesh = this.createChestMesh();
      group.add(chestMesh);

      halfLength = 0.7;
      bounds = {
        minX: x - 0.85, maxX: x + 0.85,
        minY: 0, maxY: 0.7,
        minZ: z - halfLength, maxZ: z + halfLength,
        action: 'jump'
      };
    } else {
      const cartMesh = this.createCartMesh();
      group.add(cartMesh);

      halfLength = 0.9;
      bounds = {
        minX: x - 1.0, maxX: x + 1.0,
        minY: 0, maxY: 1.4,
        minZ: z - halfLength, maxZ: z + halfLength,
        action: 'dodge'
      };
    }

    const obsObj = {
      group, bounds, type, lane, z,
      halfLength,
      isTrain,
      active: true,
      isMoving, moveSpeed,
      hasHonked: false
    };

    this.scene.add(group);
    this.obstacles.push(obsObj);
    return obsObj;
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

    // Dynamic wave generation with guaranteed clearance:
    while (this.nextWaveZ > playerZ - this.spawnAheadDistance) {
      const waveHalfLength = this.spawnWave(this.nextWaveZ, this.runTime) || 8.0;

      // Fair, reaction-friendly spacing:
      // Minimum 26.0m to 32.0m of 100% open tracks between any two wave boundaries!
      // Next wave center must account for current wave half length + clearance gap + estimated next half length
      const clearanceGap = 26.0 + Math.random() * 6.0; // 26m to 32m completely empty tracks across all 3 lanes
      const estimatedNextHalfLength = 8.5; // Account for upcoming express train half length
      const waveSpacing = waveHalfLength + clearanceGap + estimatedNextHalfLength;

      this.nextWaveZ -= waveSpacing;
    }

    const cleanupZ = playerZ + 35;
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      // Move oncoming vehicles and trains
      if (obs.isMoving && obs.active) {
        obs.z += obs.moveSpeed * delta; // Drives towards player (+Z)
        obs.group.position.z = obs.z;
        const halfZ = obs.halfLength || 1.5;
        obs.bounds.minZ = obs.z - halfZ;
        obs.bounds.maxZ = obs.z + halfZ;

        // Honk horn if within 38m of player
        if (!obs.hasHonked && Math.abs(obs.z - playerZ) < 38) {
          if (obs.isTrain) {
            this.sound.playTrainHorn();
          } else {
            this.sound.playAutoHorn();
          }
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
      // Longitudinal collision range with athletic buffer
      if (pZ >= b.minZ - 0.35 && pZ <= b.maxZ + 0.35) {
        if (pX > b.minX && pX < b.maxX) {
          if (b.action === 'slide') {
            if (isSliding) continue;
            return { hit: true, obstacle: obs };
          }
          if (b.action === 'jump') {
            if (isJumping && pY > 0.8) continue;
            return { hit: true, obstacle: obs };
          }
          if (b.action === 'dodge' && isJumping && pY > b.maxY) continue;

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
