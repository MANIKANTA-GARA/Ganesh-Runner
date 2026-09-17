// CollectibleManager.js - Golden Laddus, Diyas, and Marigold Flowers
import * as THREE from 'three';

export const ITEM_TYPES = {
  COIN: 'COIN',       // Divine Golden "ॐ" Coin - Primary Collectible & Currency
  LADDU: 'LADDU',     // Delicious Motichoor Laddu sweet - Bonus Points & Sparkles
  DIYA: 'DIYA',       // Clay lamp - Divine Meter
  FLOWER: 'FLOWER'    // Marigold blossom - Bonus points
};

export class CollectibleManager {
  constructor(scene, particles, soundManager) {
    this.scene = scene;
    this.particles = particles;
    this.sound = soundManager;
    this.collectibles = [];
    this.laneX = [-3.0, 0, 3.0];
    this.spawnDistanceAhead = 150;
    this.lastSpawnZ = 0;

    this.initGeometriesAndMaterials();
  }

  createOmCoinTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Golden Radial Background
    const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
    grad.addColorStop(0, '#fff6c2');
    grad.addColorStop(0.4, '#ffd700');
    grad.addColorStop(0.85, '#e09f00');
    grad.addColorStop(1, '#9e6d00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(128, 128, 122, 0, Math.PI * 2);
    ctx.fill();

    // Outer Dark Gold Border
    ctx.strokeStyle = '#6e4500';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Inner Radiant Ring
    ctx.strokeStyle = '#fff0a6';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(128, 128, 106, 0, Math.PI * 2);
    ctx.stroke();

    // Sacred "ॐ" (Om) Symbol Embossed in Center
    ctx.fillStyle = '#542d00';
    ctx.font = 'bold 124px "Segoe UI Symbol", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255, 230, 120, 0.9)';
    ctx.shadowBlur = 6;
    ctx.fillText('ॐ', 128, 136);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  createLadduTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Rich Saffron Amber base
    ctx.fillStyle = '#ff7b00';
    ctx.fillRect(0, 0, 256, 256);

    // Hundreds of tiny boondi pearls for realistic motichoor look
    for (let i = 0; i < 360; i++) {
      const bx = Math.random() * 256;
      const by = Math.random() * 256;
      const br = 4 + Math.random() * 7;

      const grad = ctx.createRadialGradient(bx - br * 0.35, by - br * 0.35, br * 0.1, bx, by, br);
      const colorR = Math.random();
      if (colorR < 0.50) {
        grad.addColorStop(0, '#fff099'); // Golden yellow syrup highlight
        grad.addColorStop(0.65, '#ff9e00');
        grad.addColorStop(1, '#c44500'); // Deep amber shadow
      } else if (colorR < 0.88) {
        grad.addColorStop(0, '#ffc048');
        grad.addColorStop(0.7, '#e85d04');
        grad.addColorStop(1, '#9d0208');
      } else {
        // Red saffron strand
        grad.addColorStop(0, '#ff3838');
        grad.addColorStop(1, '#b7094c');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sugar syrup glistening sparkles
    for (let j = 0; j < 70; j++) {
      const sx = Math.random() * 256;
      const sy = Math.random() * 256;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.needsUpdate = true;
    return texture;
  }

  initGeometriesAndMaterials() {
    // 1. Motichoor Laddu (Textured golden sphere with boondi, silver foil & pistachio/almond flecks)
    this.ladduTexture = this.createLadduTexture();
    this.ladduMat = new THREE.MeshStandardMaterial({
      map: this.ladduTexture,
      color: 0xffa500, // Rich warm saffron orange
      roughness: 0.55,
      metalness: 0.15,
      emissive: 0xff5500,
      emissiveIntensity: 0.22
    });

    // Edible Silver Leaf (Chandi Ka Vark)
    this.varkMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.12,
      side: THREE.DoubleSide
    });

    // Pistachio (Emerald Green) & Almond (Ivory) Flecks
    this.ladduPistachioMat = new THREE.MeshStandardMaterial({
      color: 0x38b000,
      roughness: 0.5
    });
    this.almondMat = new THREE.MeshStandardMaterial({
      color: 0xfff3b0,
      roughness: 0.6
    });

    this.ladduGeo = new THREE.SphereGeometry(0.36, 20, 20);

    // Golden halo ring around laddu
    this.ladduHaloMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });

    // 2. Diya
    this.diyaMat = new THREE.MeshStandardMaterial({ color: 0xb55a30, roughness: 0.8 });
    this.flameMat = new THREE.MeshBasicMaterial({ color: 0xff4800 });
    this.flameCoreMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });

    // 3. Flower
    this.flowerMat = new THREE.MeshStandardMaterial({
      color: 0xff7b00,
      roughness: 0.6,
      emissive: 0xff4800,
      emissiveIntensity: 0.2
    });
    this.flowerGeo = new THREE.DodecahedronGeometry(0.28);
  }

  createCoinMesh() {
    // Coins replaced with 3D Motichoor Laddu!
    return this.createLadduMesh();
  }

  createLadduMesh() {
    const group = new THREE.Group();

    // 1. Core Motichoor Sphere with realistic boondi texture
    const ball = new THREE.Mesh(this.ladduGeo, this.ladduMat);
    ball.position.y = 0.38;
    ball.castShadow = true;
    group.add(ball);

    // 2. Shimmering Edible Silver Leaf (Chandi Ka Vark)
    const vark1 = new THREE.Mesh(new THREE.PlaneGeometry(0.20, 0.16), this.varkMat);
    vark1.position.set(0.10, 0.62, 0.16);
    vark1.rotation.set(-0.4, 0.5, 0.2);
    group.add(vark1);

    const vark2 = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.12), this.varkMat);
    vark2.position.set(-0.14, 0.54, -0.12);
    vark2.rotation.set(0.5, -0.4, 0.1);
    group.add(vark2);

    // 3. Sliced Pistachio Slivers & Almond Shavings on surface
    for (let i = 0; i < 7; i++) {
      const isAlmond = i % 3 === 0;
      const mat = isAlmond ? this.almondMat : this.ladduPistachioMat;
      const fleck = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 0.06), mat);

      const phi = (i / 7) * Math.PI * 2;
      const theta = 0.45 + (i % 3) * 0.4;
      const r = 0.35;
      fleck.position.set(
        Math.sin(theta) * Math.cos(phi) * r,
        0.38 + Math.cos(theta) * r,
        Math.sin(theta) * Math.sin(phi) * r
      );
      fleck.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      group.add(fleck);
    }

    // 4. Glowing golden halo ring around laddu
    const ringGeo = new THREE.RingGeometry(0.42, 0.50, 20);
    ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, this.ladduHaloMat);
    ring.position.y = 0.38;
    group.add(ring);

    return group;
  }

  createDiyaMesh() {
    const group = new THREE.Group();
    const bowlGeo = new THREE.CylinderGeometry(0.3, 0.15, 0.18, 10);
    const bowl = new THREE.Mesh(bowlGeo, this.diyaMat);
    bowl.position.y = 0.1;
    group.add(bowl);

    const flameGeo = new THREE.ConeGeometry(0.12, 0.35, 8);
    const flame = new THREE.Mesh(flameGeo, this.flameMat);
    flame.position.y = 0.34;
    group.add(flame);

    const core = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 8), this.flameCoreMat);
    core.position.y = 0.32;
    group.add(core);

    return group;
  }

  createFlowerMesh() {
    const group = new THREE.Group();
    const flower = new THREE.Mesh(this.flowerGeo, this.flowerMat);
    flower.position.y = 0.28;
    group.add(flower);

    for (let i = 0; i < 6; i++) {
      const pGeo = new THREE.SphereGeometry(0.12, 6, 6);
      pGeo.scale(1.2, 0.5, 0.8);
      const pMesh = new THREE.Mesh(pGeo, this.flowerMat);
      const angle = (i / 6) * Math.PI * 2;
      pMesh.position.set(Math.cos(angle) * 0.25, 0.26, Math.sin(angle) * 0.25);
      group.add(pMesh);
    }
    return group;
  }

  spawnPattern(playerZ) {
    const patternType = Math.floor(Math.random() * 4);
    const zStart = playerZ - this.spawnDistanceAhead;

    if (patternType === 0) {
      // 1. STRAIGHT LINE: 7 Delicious 3D Motichoor Laddus along a single lane
      const lane = Math.floor(Math.random() * 3);
      const x = this.laneX[lane];
      for (let i = 0; i < 7; i++) {
        this.spawnItem(ITEM_TYPES.LADDU, x, zStart - i * 2.8, 0.6);
      }
    } else if (patternType === 1) {
      // 2. JUMP ARC: 7 Motichoor Laddus in a vertical parabolic jump arc
      const lane = Math.floor(Math.random() * 3);
      const x = this.laneX[lane];
      for (let i = 0; i < 7; i++) {
        const height = 0.6 + Math.sin((i / 6) * Math.PI) * 1.8;
        this.spawnItem(ITEM_TYPES.LADDU, x, zStart - i * 2.6, height);
      }
    } else if (patternType === 2) {
      // 3. ZIG-ZAG / LANE SWITCH: Laddus shifting smoothly across lanes
      const startLane = Math.floor(Math.random() * 2);
      for (let i = 0; i < 6; i++) {
        const lane = (i < 3) ? startLane : startLane + 1;
        this.spawnItem(ITEM_TYPES.LADDU, this.laneX[lane], zStart - i * 3.0, 0.6);
      }
      // Add a bonus Laddu sweet at end
      this.spawnItem(ITEM_TYPES.LADDU, this.laneX[startLane + 1], zStart - 21, 0.6);
    } else {
      // 4. DIVINE REWARD: Modak Laddus & Sacred Diyas for energy meter
      const lane = Math.floor(Math.random() * 3);
      const x = this.laneX[lane];
      this.spawnItem(ITEM_TYPES.LADDU, x, zStart, 0.6);
      this.spawnItem(ITEM_TYPES.LADDU, x, zStart - 3.5, 0.6);
      this.spawnItem(ITEM_TYPES.DIYA, x, zStart - 7.0, 0.5);
      this.spawnItem(ITEM_TYPES.LADDU, x, zStart - 10.5, 0.6);
      this.spawnItem(ITEM_TYPES.LADDU, x, zStart - 14.0, 0.6);
    }

    this.lastSpawnZ = zStart - 24;
  }

  spawnItem(type, x, z, y = 0.6) {
    let mesh = null;
    if (type === ITEM_TYPES.COIN) mesh = this.createCoinMesh();
    else if (type === ITEM_TYPES.LADDU) mesh = this.createLadduMesh();
    else if (type === ITEM_TYPES.DIYA) mesh = this.createDiyaMesh();
    else mesh = this.createFlowerMesh();

    mesh.position.set(x, y, z);
    this.scene.add(mesh);

    this.collectibles.push({
      mesh,
      type,
      x, y, z,
      active: true,
      rotSpeed: type === ITEM_TYPES.COIN ? 3.5 : (2.2 + Math.random())
    });
  }

  update(delta, playerZ, playerPos, isMagnetActive = false) {
    if (this.lastSpawnZ - playerZ > -this.spawnDistanceAhead) {
      this.spawnPattern(playerZ);
    }

    const cleanupZ = playerZ + 20;

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const item = this.collectibles[i];
      if (!item.active) {
        this.scene.remove(item.mesh);
        this.collectibles.splice(i, 1);
        continue;
      }

      // Smooth 3D rotation
      item.mesh.rotation.y += delta * item.rotSpeed;
      item.mesh.position.y = item.y + Math.sin(Date.now() * 0.004 + item.z) * 0.12;

      // Magnetic attraction to Ganesha
      if (isMagnetActive && playerPos) {
        const distToPlayer = item.mesh.position.distanceTo(playerPos);
        if (distToPlayer < 18.0) {
          item.mesh.position.lerp(playerPos, delta * 10.0);
          item.x = item.mesh.position.x;
          item.z = item.mesh.position.z;
        }
      }

      if (item.mesh.position.z > cleanupZ) {
        this.scene.remove(item.mesh);
        this.collectibles.splice(i, 1);
      }
    }
  }

  checkCollection(playerPos) {
    const collected = [];
    const collectRadius = 1.4;

    for (let i = 0; i < this.collectibles.length; i++) {
      const item = this.collectibles[i];
      if (!item.active) continue;

      const dx = playerPos.x - item.mesh.position.x;
      const dy = playerPos.y - item.mesh.position.y;
      const dz = playerPos.z - item.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < collectRadius) {
        item.active = false;
        collected.push(item.type);

        if (item.type === ITEM_TYPES.COIN || item.type === ITEM_TYPES.LADDU) {
          this.sound.playModakCollect();
          this.particles.burstGoldenSparkles(item.mesh.position, 20);
        } else if (item.type === ITEM_TYPES.DIYA) {
          this.sound.playDiyaCollect();
          this.particles.burstGoldenSparkles(item.mesh.position, 20);
        } else if (item.type === ITEM_TYPES.FLOWER) {
          this.sound.playFlowerCollect();
          this.particles.burstFlowerPetals(item.mesh.position, 16);
        }

        this.scene.remove(item.mesh);
      }
    }

    return collected;
  }

  reset() {
    this.collectibles.forEach(item => {
      this.scene.remove(item.mesh);
    });
    this.collectibles = [];
    this.lastSpawnZ = 0;
  }
}
