// ParticleSystem.js - Optimized VFX particle engine for Divine Run
import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.maxParticles = 500;

    // Shared geometries and materials for extreme performance
    this.petalGeo = new THREE.PlaneGeometry(0.18, 0.28);
    this.sparkGeo = new THREE.SphereGeometry(0.08, 5, 5);

    // Color palettes
    this.goldMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.85
    });

    this.orangePetalMat = new THREE.MeshStandardMaterial({
      color: 0xff6200,
      side: THREE.DoubleSide,
      roughness: 0.6
    });

    this.yellowPetalMat = new THREE.MeshStandardMaterial({
      color: 0xffb700,
      side: THREE.DoubleSide,
      roughness: 0.6
    });

    this.diyaFlameMat = new THREE.MeshBasicMaterial({
      color: 0xff3b00,
      transparent: true,
      opacity: 0.9
    });

    // Speedlines group
    this.createSpeedLines();

    // Divine Aura Ring
    this.createDivineAuraRing();
  }

  createDivineAuraRing() {
    const ringGeo = new THREE.TorusGeometry(1.6, 0.08, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      transparent: true,
      opacity: 0
    });
    this.auraRing = new THREE.Mesh(ringGeo, ringMat);
    this.auraRing.rotation.x = Math.PI / 2;
    this.auraRing.visible = false;
    this.scene.add(this.auraRing);

    // Inner glow disk
    const diskGeo = new THREE.CircleGeometry(1.5, 32);
    const diskMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    this.auraDisk = new THREE.Mesh(diskGeo, diskMat);
    this.auraDisk.rotation.x = -Math.PI / 2;
    this.auraDisk.position.y = 0.05;
    this.auraDisk.visible = false;
    this.scene.add(this.auraDisk);
  }

  createSpeedLines() {
    this.speedLinesGroup = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffe680,
      transparent: true,
      opacity: 0.55
    });

    this.speedLines = [];
    for (let i = 0; i < 30; i++) {
      const pts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -(2.5 + Math.random() * 3.5))
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geom, lineMat);
      line.position.set(
        (Math.random() - 0.5) * 8,
        0.5 + Math.random() * 3.5,
        (Math.random() - 0.5) * 15
      );
      this.speedLinesGroup.add(line);
      this.speedLines.push(line);
    }
    this.speedLinesGroup.visible = false;
    this.scene.add(this.speedLinesGroup);
  }

  setDivineVFX(active, playerPos) {
    this.auraRing.visible = active;
    this.auraDisk.visible = active;
    this.speedLinesGroup.visible = active;

    if (active) {
      this.auraRing.material.opacity = 0.8;
      this.auraDisk.material.opacity = 0.35;
      if (playerPos) {
        this.auraRing.position.set(playerPos.x, playerPos.y + 0.3, playerPos.z);
        this.auraDisk.position.set(playerPos.x, playerPos.y + 0.05, playerPos.z);
        this.speedLinesGroup.position.set(playerPos.x, 0, playerPos.z - 4);
      }
    }
  }

  setMushikaVFX(active, playerPos) {
    this.speedLinesGroup.visible = active;
    if (active && playerPos) {
      this.speedLinesGroup.position.set(playerPos.x, 0, playerPos.z - 4);
    }
  }

  // Burst on Modak collection
  burstGoldenSparkles(pos, count = 16) {
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.sparkGeo, this.goldMaterial.clone());
      mesh.position.copy(pos);
      this.scene.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 4
      );

      this.particles.push({
        mesh,
        vel,
        rotSpeed: (Math.random() - 0.5) * 5,
        life: 1.0,
        maxLife: 0.65 + Math.random() * 0.4
      });
    }
  }

  // Flower petals floating burst
  burstFlowerPetals(pos, count = 14) {
    for (let i = 0; i < count; i++) {
      const mat = Math.random() > 0.5 ? this.orangePetalMat : this.yellowPetalMat;
      const mesh = new THREE.Mesh(this.petalGeo, mat);
      mesh.position.copy(pos);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.scene.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3.5,
        Math.random() * 2.5 + 1.2,
        (Math.random() - 0.5) * 3.5
      );

      this.particles.push({
        mesh,
        vel,
        rotSpeed: (Math.random() - 0.5) * 6,
        life: 1.0,
        maxLife: 0.9 + Math.random() * 0.5
      });
    }
  }

  // Obstacle smash burst
  burstObstacleDemolish(pos) {
    const boxGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xb57c3d,
      roughness: 0.8
    });

    for (let i = 0; i < 18; i++) {
      const mesh = new THREE.Mesh(boxGeo, boxMat);
      mesh.position.copy(pos);
      this.scene.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        Math.random() * 5 + 2,
        (Math.random() - 0.5) * 6 - 2
      );

      this.particles.push({
        mesh,
        vel,
        rotSpeed: (Math.random() - 0.5) * 8,
        life: 1.0,
        maxLife: 0.8
      });
    }
  }

  // Slide sparks
  spawnSlideSparks(playerPos) {
    if (Math.random() > 0.4) return;
    const mesh = new THREE.Mesh(this.sparkGeo, this.goldMaterial.clone());
    mesh.position.set(
      playerPos.x + (Math.random() - 0.5) * 0.5,
      playerPos.y + 0.1,
      playerPos.z + 0.4
    );
    this.scene.add(mesh);

    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 1.5,
      Math.random() * 3 + 2
    );

    this.particles.push({
      mesh,
      vel,
      rotSpeed: 0,
      life: 1.0,
      maxLife: 0.35
    });
  }

  // Running footstep dust & golden sparkle puffs
  spawnFootstepDust(playerPos, isLeftFoot) {
    if (!playerPos) return;
    const offsetX = isLeftFoot ? -0.26 : 0.26;
    for (let i = 0; i < 3; i++) {
      const mesh = new THREE.Mesh(this.sparkGeo, this.goldMaterial.clone());
      mesh.position.set(
        playerPos.x + offsetX + (Math.random() - 0.5) * 0.12,
        0.03,
        playerPos.z + 0.05 + Math.random() * 0.15
      );
      const scale = 0.45 + Math.random() * 0.3;
      mesh.scale.set(scale, scale, scale);
      this.scene.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1.6,
        Math.random() * 1.0 + 0.3,
        Math.random() * 2.0 + 1.0
      );

      this.particles.push({
        mesh,
        vel,
        rotSpeed: (Math.random() - 0.5) * 5,
        life: 1.0,
        maxLife: 0.28
      });
    }
  }

  update(delta, playerPos, isDivine, isMushika) {
    // Update aura & speedlines tracking player
    if (playerPos) {
      if (this.auraRing.visible) {
        this.auraRing.position.set(playerPos.x, playerPos.y + 0.4, playerPos.z);
        this.auraRing.rotation.z += delta * 3;
        this.auraDisk.position.set(playerPos.x, playerPos.y + 0.05, playerPos.z);
      }
      if (this.speedLinesGroup.visible) {
        this.speedLinesGroup.position.set(playerPos.x, playerPos.y, playerPos.z - 3);
        this.speedLines.forEach(l => {
          l.position.z += delta * 25;
          if (l.position.z > 8) {
            l.position.z = -12;
            l.position.x = (Math.random() - 0.5) * 8;
            l.position.y = 0.5 + Math.random() * 3;
          }
        });
      }
    }

    // Update individual particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta / p.maxLife;

      p.mesh.position.x += p.vel.x * delta;
      p.mesh.position.y += p.vel.y * delta;
      p.mesh.position.z += p.vel.z * delta;

      // Gravity & drag
      p.vel.y -= 7.8 * delta;
      p.vel.x *= 0.98;
      p.vel.z *= 0.98;

      p.mesh.rotation.x += p.rotSpeed * delta;
      p.mesh.rotation.y += p.rotSpeed * delta;

      const scale = Math.max(0.001, p.life);
      p.mesh.scale.set(scale, scale, scale);

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose?.();
        this.particles.splice(i, 1);
      }
    }
  }

  reset() {
    this.particles.forEach(p => {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose?.();
    });
    this.particles = [];
    this.setDivineVFX(false);
    this.setMushikaVFX(false);
  }
}
