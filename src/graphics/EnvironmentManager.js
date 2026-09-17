// EnvironmentManager.js - Dynamic 5-Zone Procedural Endless World Generator
import * as THREE from 'three';
import { characterTextures } from './RealisticCharacterTextures.js';

export const ZONES = {
  TEMPLE_CITY:     { id: 'TEMPLE_CITY',     name: 'TEMPLE CITY',     dist: 0,    fog: 0x2e1a2f, light: 0xffb86c, sky: 0x4a2245 },
  FESTIVAL_STREET: { id: 'FESTIVAL_STREET', name: 'FESTIVAL STREET', dist: 600,  fog: 0x24142e, light: 0xff9944, sky: 0x3d1c47 },
  DIVINE_FOREST:   { id: 'DIVINE_FOREST',   name: 'DIVINE FOREST',   dist: 1300, fog: 0x0c1e19, light: 0x64dfdf, sky: 0x09221b },
  MOUNTAIN_PATH:   { id: 'MOUNTAIN_PATH',   name: 'KAILASA PEAKS',   dist: 2000, fog: 0x1d2238, light: 0xffd166, sky: 0x1b223d },
  DIVINE_REALM:    { id: 'DIVINE_REALM',    name: 'CELESTIAL REALM', dist: 3000, fog: 0x3d2600, light: 0xffe600, sky: 0x4a3205 }
};

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;
    this.chunkLength = 40;
    this.visibleChunks = 9;
    this.chunks = [];
    this.activeZone = ZONES.TEMPLE_CITY;

    this.initSharedMaterials();
    this.initTrackTemplates();
    this.initSkyAndLighting();
    this.initCinematicHelicopter();
    this.initKailasaSign();
  }

  initSkyAndLighting() {
    // Ambient light: warm divine radiance
    this.ambientLight = new THREE.AmbientLight(0xffecd1, 0.95);
    this.scene.add(this.ambientLight);

    // Directional sunlight (Warm evening glow with sharp runner shadows)
    this.sunLight = new THREE.DirectionalLight(0xffb86c, 2.2);
    this.sunLight.position.set(20, 35, 25);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 140;
    this.sunLight.shadow.camera.left = -22;
    this.sunLight.shadow.camera.right = 22;
    this.sunLight.shadow.camera.top = 25;
    this.sunLight.shadow.camera.bottom = -25;
    this.sunLight.shadow.bias = -0.001;
    this.scene.add(this.sunLight);

    // Atmospheric Fog
    this.scene.fog = new THREE.FogExp2(this.activeZone.fog, 0.0095);

    // Distant background Kailasa peaks
    this.createDistantMountains();
  }

  createDistantMountains() {
    this.distantGroup = new THREE.Group();
    const peakGeo = new THREE.ConeGeometry(50, 90, 5);
    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xe8eef5,
      roughness: 0.85,
      metalness: 0.05
    });

    for (let i = -3; i <= 3; i++) {
      const peak = new THREE.Mesh(peakGeo, snowMat);
      peak.position.set(i * 65 + (Math.random() - 0.5) * 20, 30 + Math.random() * 15, -280);
      peak.scale.set(1.1 + Math.random() * 0.4, 0.9 + Math.random() * 0.3, 1.0);
      this.distantGroup.add(peak);
    }
    this.scene.add(this.distantGroup);
  }

  initCinematicHelicopter() {
    this.chopperGroup = new THREE.Group();

    // Helicopter Fuselage (Plane with texture)
    const chopperMat = new THREE.MeshBasicMaterial({
      map: characterTextures.textures.helicopter,
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide
    });
    this.chopperBody = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.6), chopperMat);
    this.chopperGroup.add(this.chopperBody);

    // Spinning Main Rotor Blade
    const rotorGeo = new THREE.BoxGeometry(7.0, 0.06, 0.4);
    const rotorMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.6 });
    this.chopperRotor = new THREE.Mesh(rotorGeo, rotorMat);
    this.chopperRotor.position.y = 1.35;
    this.chopperGroup.add(this.chopperRotor);

    // Dynamic Police Searchlight pointing at the tracks!
    this.searchlight = new THREE.SpotLight(0xfffae0, 3.8, 60, Math.PI / 6, 0.4);
    this.searchlight.position.set(0, 0, 0);
    this.searchlight.castShadow = true;
    this.chopperGroup.add(this.searchlight);

    this.searchlightTarget = new THREE.Object3D();
    this.scene.add(this.searchlightTarget);
    this.searchlight.target = this.searchlightTarget;

    this.chopperGroup.position.set(0, 16.5, -40);
    this.scene.add(this.chopperGroup);
  }

  initKailasaSign() {
    this.signGroup = new THREE.Group();

    // Yellow Caution Signboard ("KAILASA ➔")
    const signMat = new THREE.MeshStandardMaterial({
      map: characterTextures.textures.kailasaSign,
      roughness: 0.4,
      metalness: 0.1
    });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), signMat);
    signMesh.position.set(0, 2.4, 0);
    this.signGroup.add(signMesh);

    // Metal Post
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(0, 1.25, 0);
    this.signGroup.add(post);

    // Position on left track barrier near start
    this.signGroup.position.set(-6.2, 0, -18);
    this.scene.add(this.signGroup);
  }

  initSharedMaterials() {
    this.materials = {
      roadStreet: new THREE.MeshStandardMaterial({ color: 0x48423f, roughness: 0.95 }),
      roadTemple: new THREE.MeshStandardMaterial({ color: 0x5a4d47, roughness: 0.85 }),
      roadForest: new THREE.MeshStandardMaterial({ color: 0x223629, roughness: 0.9 }),
      roadMountain: new THREE.MeshStandardMaterial({ color: 0x3d414e, roughness: 0.85 }),
      roadDivine: new THREE.MeshStandardMaterial({ color: 0x826622, roughness: 0.3, metalness: 0.5 }),

      // Railway Rails & Ties (Visual Reference Fidelity)
      steelRail: new THREE.MeshStandardMaterial({
        color: 0xced4da,
        metalness: 0.88,
        roughness: 0.22
      }),
      railTieWood: new THREE.MeshStandardMaterial({
        color: 0x2e1c14,
        roughness: 0.9
      }),

      curbGold: new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.75, roughness: 0.25 }),
      rangoliRed: new THREE.MeshBasicMaterial({ color: 0xd90429 }),
      rangoliYellow: new THREE.MeshBasicMaterial({ color: 0xffd000 }),
      marigoldOrange: new THREE.MeshStandardMaterial({ color: 0xff7b00, roughness: 0.5, emissive: 0x994400, emissiveIntensity: 0.2 }),
      templeStone: new THREE.MeshStandardMaterial({ color: 0x6e5e54, roughness: 0.8 }),
      woodDark: new THREE.MeshStandardMaterial({ color: 0x3c2317, roughness: 0.85 }),
      fabricOrange: new THREE.MeshStandardMaterial({ color: 0xff5400, roughness: 0.6 }),
      fabricSaffron: new THREE.MeshStandardMaterial({ color: 0xff7b00, roughness: 0.6 }),
      fabricCrimson: new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.6 }),
      diyaBrass: new THREE.MeshStandardMaterial({ color: 0xcca010, metalness: 0.85, roughness: 0.25 }),
      diyaFlame: new THREE.MeshBasicMaterial({ color: 0xffb703 }),

      // Gopuram & Temple Materials
      gopuramOchre: new THREE.MeshStandardMaterial({ color: 0xc98642, roughness: 0.8 }),
      gopuramTerracotta: new THREE.MeshStandardMaterial({ color: 0xb54d28, roughness: 0.8 }),
      gopuramCream: new THREE.MeshStandardMaterial({ color: 0xefe5d5, roughness: 0.7 }),
      goldKalasha: new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.15 }),

      // Festive Street Buildings & DJ Materials
      buildingSaffron: new THREE.MeshStandardMaterial({ color: 0xba5a31, roughness: 0.8 }),
      buildingOchre: new THREE.MeshStandardMaterial({ color: 0xc48c3a, roughness: 0.8 }),
      buildingCream: new THREE.MeshStandardMaterial({ color: 0xded2be, roughness: 0.7 }),
      windowGlow: new THREE.MeshBasicMaterial({ color: 0xffde59 }),
      speakerBlack: new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.5 }),
      djNeonCyan: new THREE.MeshBasicMaterial({ color: 0x00f5d4 }),
      djNeonMagenta: new THREE.MeshBasicMaterial({ color: 0xf72585 }),
      djNeonYellow: new THREE.MeshBasicMaterial({ color: 0xffea00 }),
      idolGold: new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.2 }),
      lanternWarm: new THREE.MeshBasicMaterial({ color: 0xffbe0b })
    };
  }

  initTrackTemplates() {
    // Roadbed geometry
    this.roadGeo = new THREE.PlaneGeometry(10.8, this.chunkLength);
    this.roadGeo.rotateX(-Math.PI / 2);

    this.curbGeo = new THREE.BoxGeometry(0.55, 0.35, this.chunkLength);

    // Single sleeper tie geometry (wooden tie across one lane track)
    this.sleeperGeo = new THREE.BoxGeometry(2.1, 0.12, 0.36);

    // Continuous steel rail geometry for chunk
    this.railGeo = new THREE.BoxGeometry(0.09, 0.15, this.chunkLength);
  }

  initWorld() {
    for (let i = 0; i < this.visibleChunks; i++) {
      const z = -i * this.chunkLength;
      const chunk = this.createChunk(z, 0);
      this.chunks.push(chunk);
      this.scene.add(chunk.group);
    }
  }

  getZoneForDistance(dist) {
    if (dist >= ZONES.DIVINE_REALM.dist) return ZONES.DIVINE_REALM;
    if (dist >= ZONES.MOUNTAIN_PATH.dist) return ZONES.MOUNTAIN_PATH;
    if (dist >= ZONES.DIVINE_FOREST.dist) return ZONES.DIVINE_FOREST;
    if (dist >= ZONES.FESTIVAL_STREET.dist) return ZONES.FESTIVAL_STREET;
    return ZONES.TEMPLE_CITY;
  }

  createChunk(z, distance) {
    const zone = this.getZoneForDistance(distance);
    const group = new THREE.Group();
    group.position.z = z;

    // 1. Road / Ballast Bed
    let roadMat = this.materials.roadStreet;
    if (zone.id === 'TEMPLE_CITY') roadMat = this.materials.roadTemple;
    else if (zone.id === 'DIVINE_FOREST') roadMat = this.materials.roadForest;
    else if (zone.id === 'MOUNTAIN_PATH') roadMat = this.materials.roadMountain;
    else if (zone.id === 'DIVINE_REALM') roadMat = this.materials.roadDivine;

    const road = new THREE.Mesh(this.roadGeo, roadMat);
    road.receiveShadow = true;
    group.add(road);

    // 2. Three-Lane Railway Tracks (Left: -3.0, Center: 0.0, Right: +3.0)
    const laneCenters = [-3.0, 0, 3.0];
    const railGaugeHalf = 0.72; // Distance from center to left/right rail of lane

    laneCenters.forEach(laneX => {
      // Left and Right Steel Rails for this lane
      const railL = new THREE.Mesh(this.railGeo, this.materials.steelRail);
      railL.position.set(laneX - railGaugeHalf, 0.12, 0);
      railL.castShadow = true;
      group.add(railL);

      const railR = new THREE.Mesh(this.railGeo, this.materials.steelRail);
      railR.position.set(laneX + railGaugeHalf, 0.12, 0);
      railR.castShadow = true;
      group.add(railR);

      // Wooden Sleeper Ties across lane spaced every 1.5m
      const tieCount = Math.floor(this.chunkLength / 1.5);
      for (let t = 0; t < tieCount; t++) {
        const tieZ = -this.chunkLength / 2 + t * 1.5 + 0.75;
        const tie = new THREE.Mesh(this.sleeperGeo, this.materials.railTieWood);
        tie.position.set(laneX, 0.06, tieZ);
        tie.receiveShadow = true;
        group.add(tie);
      }
    });

    // 3. Golden Edge Curbs
    const leftCurb = new THREE.Mesh(this.curbGeo, this.materials.curbGold);
    leftCurb.position.set(-5.4, 0.18, 0);
    group.add(leftCurb);

    const rightCurb = new THREE.Mesh(this.curbGeo, this.materials.curbGold);
    rightCurb.position.set(5.4, 0.18, 0);
    group.add(rightCurb);

    // Zone-specific thematic decorations
    if (zone.id === 'TEMPLE_CITY') {
      this.decorateTempleCity(group);
    } else if (zone.id === 'FESTIVAL_STREET') {
      this.decorateFestivalStreet(group);
    } else if (zone.id === 'DIVINE_FOREST') {
      this.decorateDivineForest(group);
    } else if (zone.id === 'MOUNTAIN_PATH') {
      this.decorateMountainPath(group);
    } else {
      this.decorateDivineRealm(group);
    }

    // Visarjan scenic checkpoint (every 600m)
    if (Math.floor(distance) % 600 < 40 && distance > 100) {
      this.decorateVisarjanRiverbank(group);
    }

    return { group, z, distance, zone };
  }

  decorateFestivalStreet(group) {
    // 1. Rangoli Patterns on Ground
    const rangoliGeo = new THREE.RingGeometry(1.2, 1.8, 16);
    rangoliGeo.rotateX(-Math.PI / 2);
    const rangoli = new THREE.Mesh(rangoliGeo, this.materials.rangoliYellow);
    rangoli.position.set(0, 0.02, 0);
    group.add(rangoli);

    // 2. Continuous Street Buildings on BOTH sides (No blank void!)
    for (let side of [-1, 1]) {
      this.addStreetBuildings(group, side);
    }

    // 3. Side A: Grand Ganesh Pandal with 3D Ganesha Idol
    const pandal = this.createGaneshPandalWithIdol();
    pandal.position.set(-8.2, 0, 0);
    group.add(pandal);

    // 4. Side B: Festival DJ Sound Stage ("DJ VIBES" - Speaker Towers & Stage Lights)
    const djStage = this.createDJStage();
    djStage.position.set(8.2, 0, 0);
    group.add(djStage);

    // 5. Overhead Akash Kandil (Festive Lanterns) strung across street
    const lanternString = this.createOverheadLanterns();
    lanternString.position.set(0, 5.5, -8);
    group.add(lanternString);

    // 6. Festival Pandal Entrance Arch
    const archGroup = this.createFestivalArch();
    archGroup.position.set(0, 0, -18);
    group.add(archGroup);
  }

  // Continuous Indian festive street buildings flanking road
  addStreetBuildings(group, side) {
    const xPos = side * 11.5;
    const buildingColors = [this.materials.buildingSaffron, this.materials.buildingOchre, this.materials.buildingCream];

    for (let i = 0; i < 3; i++) {
      const bZ = -14 + i * 14;
      const bHeight = 8 + (i % 2) * 3;
      const bGeo = new THREE.BoxGeometry(5.5, bHeight, 13);
      const mat = buildingColors[i % buildingColors.length];
      const building = new THREE.Mesh(bGeo, mat);
      building.position.set(xPos, bHeight / 2, bZ);
      building.castShadow = true;
      group.add(building);

      // Lit Windows with warm glowing light
      for (let floor = 1; floor < bHeight / 2.5; floor++) {
        for (let winZ of [-3.5, 0, 3.5]) {
          const winGeo = new THREE.PlaneGeometry(1.2, 1.6);
          const win = new THREE.Mesh(winGeo, this.materials.windowGlow);
          win.position.set(xPos - side * 2.76, floor * 2.6, bZ + winZ);
          win.rotation.y = -side * Math.PI / 2;
          group.add(win);
        }
      }

      // Colorful Fabric Awning on ground floor
      const awningGeo = new THREE.BoxGeometry(1.8, 0.2, 10);
      const awning = new THREE.Mesh(awningGeo, i % 2 === 0 ? this.materials.fabricOrange : this.materials.fabricSaffron);
      awning.position.set(xPos - side * 2.9, 3.2, bZ);
      awning.rotation.z = side * 0.2;
      group.add(awning);
    }
  }

  // Grand Roadside Ganesh Pandal with 3D Ganesha Idol
  createGaneshPandalWithIdol() {
    const pandal = new THREE.Group();

    // Ornate Platform
    const platGeo = new THREE.BoxGeometry(4.5, 0.8, 5.5);
    const platform = new THREE.Mesh(platGeo, this.materials.woodDark);
    platform.position.y = 0.4;
    pandal.add(platform);

    // Decorative Canopy Roof (Saffron & Crimson)
    const roofGeo = new THREE.ConeGeometry(3.2, 2.5, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, this.materials.fabricCrimson);
    roof.position.y = 5.2;
    pandal.add(roof);

    // 4 Corner Pillars with Marigold wraps
    for (let px of [-1.8, 1.8]) {
      for (let pz of [-2.2, 2.2]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 4.2, 8), this.materials.woodDark);
        pillar.position.set(px, 2.3, pz);
        pandal.add(pillar);
      }
    }

    // --- 3D GANESHA IDOL INSIDE PANDAL ---
    const idolGroup = new THREE.Group();
    idolGroup.position.set(0, 1.2, 0);

    // Body & Belly
    const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), this.materials.idolGold);
    bodyMesh.position.y = 0.7;
    idolGroup.add(bodyMesh);

    // Head with Ears
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), this.materials.idolGold);
    headMesh.position.y = 1.4;
    idolGroup.add(headMesh);

    // Crown (Mukut)
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.8, 12), this.materials.curbGold);
    crown.position.y = 2.0;
    idolGroup.add(crown);

    // Curved Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.06, 0.8, 8), this.materials.idolGold);
    trunk.position.set(0, 1.0, 0.45);
    trunk.rotation.set(0.4, 0, -0.3);
    idolGroup.add(trunk);

    // Glowing Halo (Prabhavali) behind Idol
    const haloGeo = new THREE.RingGeometry(0.8, 1.3, 20);
    const halo = new THREE.Mesh(haloGeo, this.materials.rangoliYellow);
    halo.position.set(0, 1.6, -0.4);
    idolGroup.add(halo);

    pandal.add(idolGroup);

    // Roadside Brass Tall Diya Lamps
    for (let sideZ of [-2.4, 2.4]) {
      const lamp = this.createDiyaPillar();
      lamp.position.set(2.0, 0, sideZ);
      pandal.add(lamp);
    }

    return pandal;
  }

  // Festival DJ Sound Stage ("DJ VIBES" - Massive Stacked Speakers & Neon Lights)
  createDJStage() {
    const stage = new THREE.Group();

    // Stage Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.8, 6.0), this.materials.speakerBlack);
    deck.position.y = 0.4;
    stage.add(deck);

    // Stacked Speaker Walls (Subwoofer Tower)
    for (let stack = -1; stack <= 1; stack += 2) {
      const speakerGroup = new THREE.Group();
      speakerGroup.position.set(stack * 1.5, 0.8, 0);

      for (let tier = 0; tier < 3; tier++) {
        // Speaker Cabinet
        const box = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.2, 1.4), this.materials.speakerBlack);
        box.position.y = 0.6 + tier * 1.25;
        speakerGroup.add(box);

        // Glowing Neon Bass Speaker Cone Rings
        const neonMat = tier === 0 ? this.materials.djNeonCyan : tier === 1 ? this.materials.djNeonMagenta : this.materials.djNeonYellow;
        const cone = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.45, 16), neonMat);
        cone.position.set(-0.66, 0.6 + tier * 1.25, 0);
        cone.rotation.y = -Math.PI / 2;
        speakerGroup.add(cone);
      }
      stage.add(speakerGroup);
    }

    // Overhead DJ Lighting Truss & Colored Spotlights
    const trussBeam = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 4.8), this.materials.curbGold);
    trussBeam.position.set(0, 4.6, 0);
    stage.add(trussBeam);

    // Stage Spotlights pointing across street
    for (let lz of [-1.5, 0, 1.5]) {
      const lightCone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.8, 8), this.materials.djNeonYellow);
      lightCone.position.set(-0.8, 4.4, lz);
      lightCone.rotation.z = Math.PI / 3;
      stage.add(lightCone);
    }

    return stage;
  }

  // Overhead Hanging Akash Kandils (Indian Festival Paper Lanterns)
  createOverheadLanterns() {
    const stringGroup = new THREE.Group();

    // Wire spanning across road
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 14), this.materials.woodDark);
    wire.rotation.z = Math.PI / 2;
    stringGroup.add(wire);

    // 3 Hanging Akash Kandils with glowing colors
    for (let lx of [-3.2, 0, 3.2]) {
      const kandil = new THREE.Group();
      kandil.position.set(lx, -0.6, 0);

      // Diamond / Octahedron lantern body
      const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.55), this.materials.lanternWarm);
      kandil.add(body);

      // Hanging streamers / tails
      for (let t = -0.2; t <= 0.2; t += 0.2) {
        const streamer = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.01, 1.1), this.materials.fabricCrimson);
        streamer.position.set(t, -0.8, 0);
        kandil.add(streamer);
      }

      stringGroup.add(kandil);
    }

    return stringGroup;
  }

  createFestivalArch() {
    const arch = new THREE.Group();
    // Two ornate side pillars
    const pillarGeo = new THREE.CylinderGeometry(0.35, 0.45, 5.5, 12);
    const p1 = new THREE.Mesh(pillarGeo, this.materials.woodDark);
    p1.position.set(-5, 2.75, 0);
    arch.add(p1);

    const p2 = new THREE.Mesh(pillarGeo, this.materials.woodDark);
    p2.position.set(5, 2.75, 0);
    arch.add(p2);

    // Overhead festive Toran / Garland beam
    const beamGeo = new THREE.BoxGeometry(11, 0.5, 0.5);
    const beam = new THREE.Mesh(beamGeo, this.materials.fabricSaffron);
    beam.position.set(0, 5.2, 0);
    arch.add(beam);

    // Hanging Marigold Garlands
    for (let i = -4; i <= 4; i += 1.3) {
      const garlandGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8);
      const garland = new THREE.Mesh(garlandGeo, this.materials.marigoldOrange);
      garland.position.set(i, 4.2, 0);
      arch.add(garland);
    }

    return arch;
  }

  createFestivalStall(side) {
    const stall = new THREE.Group();
    // Stall wooden frame
    const baseGeo = new THREE.BoxGeometry(3, 1.2, 5);
    const base = new THREE.Mesh(baseGeo, this.materials.woodDark);
    base.position.y = 0.6;
    stall.add(base);

    // Saffron/Crimson striped awning
    const awningGeo = new THREE.BoxGeometry(3.4, 0.15, 5.4);
    const mat = side > 0 ? this.materials.fabricOrange : this.materials.fabricCrimson;
    const awning = new THREE.Mesh(awningGeo, mat);
    awning.position.set(0, 3.0, 0);
    awning.rotation.z = side * 0.15;
    stall.add(awning);

    // Wooden awning poles
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5);
    const p1 = new THREE.Mesh(poleGeo, this.materials.woodDark);
    p1.position.set(-1.4, 1.8, 2.2);
    stall.add(p1);
    const p2 = new THREE.Mesh(poleGeo, this.materials.woodDark);
    p2.position.set(1.4, 1.8, 2.2);
    stall.add(p2);

    return stall;
  }

  createDiyaPillar() {
    const pillar = new THREE.Group();
    const standGeo = new THREE.CylinderGeometry(0.12, 0.25, 2.2, 8);
    const stand = new THREE.Mesh(standGeo, this.materials.diyaBrass);
    stand.position.y = 1.1;
    pillar.add(stand);

    // Diya Bowl atop
    const bowlGeo = new THREE.SphereGeometry(0.3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const bowl = new THREE.Mesh(bowlGeo, this.materials.diyaBrass);
    bowl.position.y = 2.2;
    pillar.add(bowl);

    // Glowing flame
    const flameGeo = new THREE.ConeGeometry(0.14, 0.35, 8);
    const flame = new THREE.Mesh(flameGeo, this.materials.diyaFlame);
    flame.position.y = 2.45;
    pillar.add(flame);

    return pillar;
  }

  createFestivalFlag() {
    const flagGroup = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.08, 5, 8);
    const pole = new THREE.Mesh(poleGeo, this.materials.woodDark);
    pole.position.y = 2.5;
    flagGroup.add(pole);

    // Triangular Saffron Flag
    const flagGeo = new THREE.ConeGeometry(0.8, 1.5, 3);
    flagGeo.rotateZ(Math.PI / 2);
    const flag = new THREE.Mesh(flagGeo, this.materials.fabricSaffron);
    flag.position.set(0.6, 4.2, 0);
    flagGroup.add(flag);

    return flagGroup;
  }

  decorateTempleCity(group) {
    // Majestic South Indian Gopuram (Stepped pyramidal temple tower) on one side
    const gopuram = this.createGopuramTower();
    gopuram.position.set(13.5, 0, -8);
    group.add(gopuram);

    // Ancient Temple Mandapa / Pillared colonnade on the other side
    const mandapa = this.createTempleColonnade();
    mandapa.position.set(-13.0, 0, -5);
    group.add(mandapa);

    // Roadside Brass Diya Pillars along track edges
    for (let side of [-1, 1]) {
      for (let zOffset of [-14, 14]) {
        const diyaLamp = this.createDiyaPillar();
        diyaLamp.position.set(side * 6.3, 0, zOffset);
        group.add(diyaLamp);
      }
    }

    // Overhead Marigold & Brass Bell Toran across track
    const toran = this.createOverheadTempleToran();
    toran.position.set(0, 0, -18);
    group.add(toran);

    // Festive Saffron Flags
    const flagL = this.createFestivalFlag();
    flagL.position.set(-6.2, 0, 5);
    group.add(flagL);

    const flagR = this.createFestivalFlag();
    flagR.position.set(6.2, 0, -12);
    group.add(flagR);
  }

  createGopuramTower() {
    const tower = new THREE.Group();

    // 5 Tiers of Stepped Pyramid Architecture
    const tiers = 5;
    for (let i = 0; i < tiers; i++) {
      const tierWidth = 12.0 - i * 1.8;
      const tierDepth = 9.0 - i * 1.3;
      const tierHeight = 3.6;
      const tierY = 1.8 + i * tierHeight;

      const mat = (i % 2 === 0) ? this.materials.gopuramOchre : this.materials.gopuramTerracotta;
      const tierMesh = new THREE.Mesh(new THREE.BoxGeometry(tierWidth, tierHeight, tierDepth), mat);
      tierMesh.position.y = tierY;
      tierMesh.castShadow = true;
      tower.add(tierMesh);

      // Niches with Golden Idols / Statues
      for (let n = -1; n <= 1; n += 2) {
        const niche = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.4), this.materials.goldKalasha);
        niche.position.set(-tierWidth / 2 - 0.05, tierY, n * (tierDepth * 0.25));
        tower.add(niche);
      }
    }

    // Shikhara (Roof Crown)
    const roofY = 1.8 + tiers * 3.6 + 1.2;
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 3.2, 2.5, 4), this.materials.gopuramCream);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = roofY;
    tower.add(roof);

    // 3 Golden Kalasha Pinnacles atop Gopuram
    for (let k = -1; k <= 1; k++) {
      const kalasha = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 8), this.materials.goldKalasha);
      kalasha.position.set(0, roofY + 1.8, k * 1.0);
      tower.add(kalasha);
    }

    return tower;
  }

  createTempleColonnade() {
    const colonnade = new THREE.Group();

    // Platform
    const plat = new THREE.Mesh(new THREE.BoxGeometry(8, 0.8, 30), this.materials.templeStone);
    plat.position.y = 0.4;
    colonnade.add(plat);

    // Carved Stone Pillars
    for (let z = -12; z <= 12; z += 6) {
      for (let x of [-2, 2]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.45, 5.5, 8), this.materials.templeStone);
        pillar.position.set(x, 3.2, z);
        pillar.castShadow = true;
        colonnade.add(pillar);
      }
    }

    // Temple Canopy Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(9, 0.6, 31), this.materials.templeStone);
    roof.position.y = 6.2;
    colonnade.add(roof);

    return colonnade;
  }

  createOverheadTempleToran() {
    const toran = new THREE.Group();

    // Two side stone pillars
    for (let side of [-5.6, 5.6]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 6.2, 8), this.materials.templeStone);
      p.position.set(side, 3.1, 0);
      toran.add(p);
    }

    // Ornate Crossbeam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.5, 0.6), this.materials.fabricSaffron);
    beam.position.set(0, 5.9, 0);
    toran.add(beam);

    // Hanging Marigold Garlands and Golden Bells
    for (let x = -4.5; x <= 4.5; x += 1.5) {
      const garland = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), this.materials.marigoldOrange);
      garland.position.set(x, 4.8, 0);
      toran.add(garland);

      const bell = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.4, 8), this.materials.goldKalasha);
      bell.position.set(x, 4.0, 0);
      bell.rotation.x = Math.PI;
      toran.add(bell);
    }

    return toran;
  }

  decorateDivineForest(group) {
    // Sacred Banyan Trees with roots & foliage
    for (let side of [-1, 1]) {
      const tree = new THREE.Group();
      const trunkGeo = new THREE.CylinderGeometry(1.2, 1.8, 8, 8);
      const trunk = new THREE.Mesh(trunkGeo, this.materials.woodDark);
      trunk.position.set(side * 8.5, 4, 0);
      tree.add(trunk);

      // Giant Lush Foliage
      const folGeo = new THREE.DodecahedronGeometry(3.5);
      const folMat = new THREE.MeshStandardMaterial({ color: 0x134e32, roughness: 0.8 });
      const fol = new THREE.Mesh(folGeo, folMat);
      fol.position.set(side * 8.5, 7.5, 0);
      tree.add(fol);

      // Lotus pond beside road
      const pondGeo = new THREE.CircleGeometry(2.5, 16);
      pondGeo.rotateX(-Math.PI / 2);
      const pondMat = new THREE.MeshStandardMaterial({ color: 0x005073, roughness: 0.1, metalness: 0.8 });
      const pond = new THREE.Mesh(pondGeo, pondMat);
      pond.position.set(side * 6.8, 0.05, 12);
      tree.add(pond);

      group.add(tree);
    }
  }

  decorateMountainPath(group) {
    // Himalayan Stone Cliffs and fluttering prayer flags
    for (let side of [-1, 1]) {
      const cragGeo = new THREE.DodecahedronGeometry(5.0);
      cragGeo.scale(1.2, 2.0, 1.8);
      const cragMat = new THREE.MeshStandardMaterial({ color: 0x4a4e69, roughness: 0.9 });
      const crag = new THREE.Mesh(cragGeo, cragMat);
      crag.position.set(side * 9.5, 4.5, 0);
      group.add(crag);
    }
  }

  decorateDivineRealm(group) {
    // Floating Golden Clouds and Celestial Lotus Pedestals
    for (let side of [-1, 1]) {
      const cloudGeo = new THREE.SphereGeometry(2.2, 8, 8);
      cloudGeo.scale(2.2, 0.7, 1.5);
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffa500,
        emissiveIntensity: 0.35,
        roughness: 0.4
      });
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(side * 8.0, 2.5, 0);
      group.add(cloud);
    }
  }

  decorateVisarjanRiverbank(group) {
    // Serene riverside ghat vista
    const riverGeo = new THREE.PlaneGeometry(16, this.chunkLength);
    riverGeo.rotateX(-Math.PI / 2);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x003566,
      roughness: 0.15,
      metalness: 0.85
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.position.set(13.5, -0.2, 0);
    group.add(river);

    // Floating diyas on river
    for (let i = -15; i <= 15; i += 7) {
      const floatDiya = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 6), this.materials.diyaFlame);
      floatDiya.position.set(11 + Math.random() * 4, -0.1, i);
      group.add(floatDiya);
    }
  }

  update(playerZ, distance) {
    const currentZone = this.getZoneForDistance(distance);
    if (currentZone.id !== this.activeZone.id) {
      this.activeZone = currentZone;
      // Smoothly transition atmospheric fog & lighting
      if (this.scene.fog) {
        this.scene.fog.color.setHex(currentZone.fog);
      }
      this.ambientLight.color.setHex(currentZone.light);
    }

    // Keep directional sunlight moving with player
    this.sunLight.position.z = playerZ + 25;
    this.sunLight.target.position.z = playerZ - 10;
    this.sunLight.target.updateMatrixWorld();

    if (this.distantGroup) {
      this.distantGroup.position.z = playerZ;
    }

    // Animate Police Helicopter & Sweeping Searchlight Beam
    if (this.chopperGroup) {
      const time = Date.now() * 0.0015;
      const hoverX = Math.sin(time) * 4.2;
      const hoverY = 16.5 + Math.cos(time * 1.5) * 0.8;
      this.chopperGroup.position.set(hoverX, hoverY, playerZ - 36);

      // Spin main rotor blades
      if (this.chopperRotor) {
        this.chopperRotor.rotation.y += 0.85;
      }

      // Spotlight beam sweeps the railway tracks ahead of Ganesha
      if (this.searchlight && this.searchlightTarget) {
        this.searchlightTarget.position.set(Math.sin(time * 1.2) * 2.8, 0, playerZ - 14);
        this.searchlightTarget.updateMatrixWorld();
      }
    }

    // Check if any chunks fell behind player
    const recycleZThreshold = playerZ + this.chunkLength * 1.5;
    const furthestZ = Math.min(...this.chunks.map(c => c.z));

    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      if (chunk.z > recycleZThreshold) {
        // Remove old group from scene
        this.scene.remove(chunk.group);

        // Recycle chunk to furthest forward Z
        const newZ = furthestZ - this.chunkLength;
        const newChunk = this.createChunk(newZ, distance + this.chunkLength * (this.visibleChunks - 1));

        this.scene.add(newChunk.group);
        this.chunks[i] = newChunk;
      }
    }
  }

  reset() {
    this.chunks.forEach(c => this.scene.remove(c.group));
    this.chunks = [];
    this.activeZone = ZONES.TEMPLE_CITY;
    this.initWorld();
  }
}
