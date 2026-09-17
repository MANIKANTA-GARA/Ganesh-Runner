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
    this.woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.85 });
    this.brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.3 });
    this.fabricMat = new THREE.MeshStandardMaterial({ color: 0xbc3908, roughness: 0.6 });
    this.marigoldMat = new THREE.MeshStandardMaterial({ color: 0xff8500, roughness: 0.5 });
    this.stoneMat = new THREE.MeshStandardMaterial({ color: 0x5c504d, roughness: 0.8 });

    // Blue Train Materials (Indian Railways Blue & Yellow)
    this.trainBlueMat = new THREE.MeshStandardMaterial({ color: 0x184e8e, roughness: 0.35, metalness: 0.35 });
    this.trainYellowMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.3 });
    this.trainRoofMat = new THREE.MeshStandardMaterial({ color: 0x242836, roughness: 0.6 });
    this.trainLightMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
    this.trainWheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 });

    // Red/White Barricade Materials
    this.barricadeRedMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.5 });
    this.barricadeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.5 });
    this.concreteMat = new THREE.MeshStandardMaterial({ color: 0x6c757d, roughness: 0.9 });

    // Auto Rickshaw & Vehicle Materials
    this.autoGreenMat = new THREE.MeshStandardMaterial({ color: 0x007f5f, roughness: 0.4 });
    this.autoYellowMat = new THREE.MeshStandardMaterial({ color: 0xffd000, roughness: 0.4 });
    this.autoBlackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });
    this.windshieldMat = new THREE.MeshStandardMaterial({ color: 0x8ecae6, roughness: 0.1, transparent: true, opacity: 0.7 });
    this.headlightMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
  }

  createAutoRickshawMesh() {
    const group = new THREE.Group();

    // Lower Green Body
    const lowerGeo = new THREE.BoxGeometry(1.6, 0.7, 2.4);
    const lowerBody = new THREE.Mesh(lowerGeo, this.autoGreenMat);
    lowerBody.position.y = 0.55;
    lowerBody.castShadow = true;
    group.add(lowerBody);

    // Yellow Canopy Roof
    const roofGeo = new THREE.BoxGeometry(1.5, 0.75, 2.2);
    const roof = new THREE.Mesh(roofGeo, this.autoYellowMat);
    roof.position.set(0, 1.25, -0.1);
    group.add(roof);

    // Windshield
    const glassGeo = new THREE.PlaneGeometry(1.3, 0.65);
    const glass = new THREE.Mesh(glassGeo, this.windshieldMat);
    glass.position.set(0, 1.25, 1.01);
    group.add(glass);

    // Headlight
    const lightGeo = new THREE.CircleGeometry(0.16, 12);
    const headlight = new THREE.Mesh(lightGeo, this.headlightMat);
    headlight.position.set(0, 0.6, 1.21);
    group.add(headlight);

    // Wheels (3 wheels)
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

    // Cab
    const cabGeo = new THREE.BoxGeometry(1.7, 1.1, 1.2);
    const cab = new THREE.Mesh(cabGeo, this.autoYellowMat);
    cab.position.set(0, 0.8, 0.9);
    cab.castShadow = true;
    group.add(cab);

    // Cargo Box
    const boxGeo = new THREE.BoxGeometry(1.8, 1.4, 2.2);
    const box = new THREE.Mesh(boxGeo, this.autoGreenMat);
    box.position.set(0, 1.0, -0.7);
    box.castShadow = true;
    group.add(box);

    // Windshield
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.5), this.windshieldMat);
    glass.position.set(0, 0.95, 1.51);
    group.add(glass);

    // Wheels (4 wheels)
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

    // 2. Locomotive Body (Vibrant Indian Railways Blue)
    const bodyGeo = new THREE.BoxGeometry(1.8, 1.7, 6.0);
    const body = new THREE.Mesh(bodyGeo, this.trainBlueMat);
    body.position.y = 1.35;
    body.castShadow = true;
    group.add(body);

    // 3. Golden Yellow Trim Stripe (Running along middle of locomotive)
    const stripeGeo = new THREE.BoxGeometry(1.82, 0.22, 6.02);
    const stripe = new THREE.Mesh(stripeGeo, this.trainYellowMat);
    stripe.position.y = 1.25;
    group.add(stripe);

    // 4. Sloped Locomotive Cab Roof
    const roofGeo = new THREE.CylinderGeometry(0.92, 0.92, 6.0, 16, 1, false, 0, Math.PI);
    roofGeo.rotateZ(Math.PI / 2);
    const roof = new THREE.Mesh(roofGeo, this.trainRoofMat);
    roof.position.y = 2.2;
    group.add(roof);

    // 5. Front Windshield Windows
    for (let wx of [-0.45, 0.45]) {
      const winGeo = new THREE.PlaneGeometry(0.65, 0.55);
      const win = new THREE.Mesh(winGeo, this.windshieldMat);
      win.position.set(wx, 1.7, 3.01);
      group.add(win);
    }

    // 6. Glowing Circular Headlight (Concept art beam)
    const lightGeo = new THREE.CircleGeometry(0.25, 16);
    const light = new THREE.Mesh(lightGeo, this.trainLightMat);
    light.position.set(0, 0.95, 3.02);
    group.add(light);

    // 7. Steel Train Wheels (6 wheels along track)
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

    // Heavy concrete feet on left and right
    for (let x of [-0.85, 0.85]) {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.35, 0.5), this.concreteMat);
      foot.position.set(x, 0.18, 0);
      group.add(foot);

      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.75, 0.12), this.barricadeWhiteMat);
      post.position.set(x, 0.55, 0);
      group.add(post);
    }

    // Authentic "POLICE" Warning Barrier with Red/White Diagonal Hazard Stripes
    const barrierMat = new THREE.MeshStandardMaterial({
      map: characterTextures.textures.policeBarricade,
      roughness: 0.45,
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
        // Combo B: Moving Auto-Rickshaw on 1 lane + Slide Toran Arch or Jump Chest on 2nd lane!
        const isMoving = Math.random() > 0.3;
        this.spawnSingleObstacle(OBSTACLE_TYPES.AUTO_RICKSHAW, blockedLanes[0], z, isMoving);
        const secondType = Math.random() > 0.5 ? OBSTACLE_TYPES.TORAN_ARCH : OBSTACLE_TYPES.CHEST_JUMP;
        this.spawnSingleObstacle(secondType, blockedLanes[1], z, false);
      } else if (combo < 0.85) {
        // Combo C: Double Moving Vehicles (1 locomotive train + 1 auto-rickshaw staggered)
        this.spawnSingleObstacle(OBSTACLE_TYPES.BLUE_TRAIN, blockedLanes[0], z, true);
        this.spawnSingleObstacle(OBSTACLE_TYPES.AUTO_RICKSHAW, blockedLanes[1], z + 6, true);
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
      if (patternType < 0.50) {
        this.spawnSingleObstacle(OBSTACLE_TYPES.BLUE_TRAIN, blockedLanes[0], z, true);
      } else if (patternType < 0.80) {
        this.spawnSingleObstacle(OBSTACLE_TYPES.AUTO_RICKSHAW, blockedLanes[0], z, true);
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
    } else if (type === OBSTACLE_TYPES.TORAN_ARCH) {
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 8), this.woodMat);
      p1.position.set(-1.3, 1.6, 0);
      group.add(p1);
      const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 8), this.woodMat);
      p2.position.set(1.3, 1.6, 0);
      group.add(p2);

      const beam = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.4, 0.3), this.fabricMat);
      beam.position.set(0, 1.9, 0);
      group.add(beam);

      for (let fx = -1.1; fx <= 1.1; fx += 0.55) {
        const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 6), this.marigoldMat);
        tassel.rotation.x = Math.PI;
        tassel.position.set(fx, 1.45, 0);
        group.add(tassel);
      }

      bounds = {
        minX: x - 1.2, maxX: x + 1.2,
        minY: 1.2, maxY: 2.3,
        minZ: z - 0.6, maxZ: z + 0.6,
        action: 'slide'
      };
    } else if (type === OBSTACLE_TYPES.CHEST_JUMP) {
      const chest = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 1.2), this.brassMat);
      chest.position.y = 0.32;
      chest.castShadow = true;
      group.add(chest);

      bounds = {
        minX: x - 0.85, maxX: x + 0.85,
        minY: 0, maxY: 0.7,
        minZ: z - 0.7, maxZ: z + 0.7,
        action: 'jump'
      };
    } else {
      const cartBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1.6), this.woodMat);
      cartBase.position.y = 0.55;
      cartBase.castShadow = true;
      group.add(cartBase);

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
        obs.bounds.minZ = obs.z - 1.3;
        obs.bounds.maxZ = obs.z + 1.3;

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
