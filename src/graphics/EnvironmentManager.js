// EnvironmentManager.js - Dynamic 30s Weather & Sky Cycles, 4 Scenery Themes & Off-Track Crowds
import * as THREE from 'three';
import { characterTextures } from './RealisticCharacterTextures.js';

// 4 Dynamic Weather & Time-of-Day Profiles (Changes every 30 seconds)
export const WEATHER_PROFILES = [
  {
    id: 'BRIGHT_DAY',
    name: 'BRIGHT DAYLIGHT',
    icon: '☀️',
    skyColor: 0x3a86ff,       // Vivid celestial azure blue
    horizonColor: 0xd8f3dc,   // Warm crisp pale golden horizon
    fogColor: 0x8ecae6,       // Atmospheric bright sky haze
    fogDensity: 0.0065,       // Crystal clear visibility
    ambientColor: 0xfffaed,   // Bright warm white
    ambientIntensity: 1.15,
    sunColor: 0xfff3b0,       // Radiant golden sunshine
    sunIntensity: 2.2,
    sunPos: new THREE.Vector3(25, 45, 20),
    starsOpacity: 0.0,
    moonOpacity: 0.0,
    sunDiscOpacity: 1.0
  },
  {
    id: 'CLOUDY_MIST',
    name: 'MISTY OVERCAST',
    icon: '☁️',
    skyColor: 0x6c757d,       // Moody silver-slate overcast sky
    horizonColor: 0xced4da,   // Soft pearl horizon
    fogColor: 0xa0aab2,       // Rolling silver mist
    fogDensity: 0.0125,       // Dense atmospheric low-hanging mist
    ambientColor: 0xd8e2dc,   // Soft diffused light
    ambientIntensity: 1.0,
    sunColor: 0xb0c4de,       // Diffused silver-blue light
    sunIntensity: 1.2,
    sunPos: new THREE.Vector3(10, 40, 15),
    starsOpacity: 0.0,
    moonOpacity: 0.0,
    sunDiscOpacity: 0.35
  },
  {
    id: 'GOLDEN_SUNSET',
    name: 'GOLDEN SUNSET (GODHULI)',
    icon: '🌅',
    skyColor: 0x7209b7,       // Deep royal purple zenith
    horizonColor: 0xff7b00,   // Blazing vermilion orange & amber horizon
    fogColor: 0x6a040f,       // Warm twilight crimson-purple fog
    fogDensity: 0.009,
    ambientColor: 0xffa07a,   // Warm peach / golden twilight
    ambientIntensity: 0.95,
    sunColor: 0xff5400,       // Fiery setting sun
    sunIntensity: 2.4,
    sunPos: new THREE.Vector3(35, 18, 25),
    starsOpacity: 0.25,
    moonOpacity: 0.35,
    sunDiscOpacity: 1.0
  },
  {
    id: 'STARRY_NIGHT',
    name: 'STARRY MOONLIT NIGHT',
    icon: '🌙',
    skyColor: 0x050814,       // Deepest midnight navy
    horizonColor: 0x0c1b33,   // Indigo moonlit horizon
    fogColor: 0x080f24,       // Cool moonlit blue-black mist
    fogDensity: 0.0085,
    ambientColor: 0x2b3a67,   // Mystical moonlight
    ambientIntensity: 0.75,
    sunColor: 0x90e0ef,       // Silvery moonbeams
    sunIntensity: 1.4,
    sunPos: new THREE.Vector3(-30, 42, 20),
    starsOpacity: 1.0,
    moonOpacity: 1.0,
    sunDiscOpacity: 0.0
  }
];

// 4 Distinct Location Scenery Themes (Rotates every 30 seconds)
export const SCENERY_THEMES = [
  {
    id: 'RAILWAY_STATION',
    name: 'GANESH JUNCTION',
    subtitle: 'STATION PLATFORMS & PASSENGERS',
    icon: '🚉'
  },
  {
    id: 'BAZAAR_MARKET',
    name: 'CHANDNI BAZAAR',
    subtitle: 'FRUIT CARTS, AWNINGS & VENDORS',
    icon: '🛍️'
  },
  {
    id: 'HAVELI_TOWN',
    name: 'HERITAGE HAVELIS',
    subtitle: 'TRADITIONAL VILLAGE HOUSES',
    icon: '🏘️'
  },
  {
    id: 'TEMPLE_GHATS',
    name: 'SACRED TEMPLE GHATS',
    subtitle: 'GOPURAMS & FLOATING DIYAS',
    icon: '🛕'
  }
];

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;
    this.chunkLength = 40;
    this.visibleChunks = 9;
    this.chunks = [];

    // 30-Second Dynamic Cycle Engine
    this.cycleDuration = 30.0; // 30 seconds per cycle as requested
    this.cycleTimer = 0.0;
    this.weatherIndex = 0;
    this.themeIndex = 0;
    this.prevWeather = WEATHER_PROFILES[0];
    this.targetWeather = WEATHER_PROFILES[0];
    this.weatherBlend = 1.0;
    this.onThemeChange = null;

    // Crowd Spectator Animation Tracking
    this.activeCrowdFigures = [];

    // Legacy zone compatibility
    this.activeZone = {
      id: 'TEMPLE_CITY',
      name: SCENERY_THEMES[0].name,
      fog: WEATHER_PROFILES[0].fogColor,
      light: WEATHER_PROFILES[0].ambientColor
    };

    this.initSharedMaterials();
    this.initTrackTemplates();
    this.initSkyAndLighting();
    this.initCelestialObjects();
    this.initCinematicHelicopter();
    this.initKailasaSign();
  }

  getCurrentTheme() {
    return SCENERY_THEMES[this.themeIndex];
  }

  getCurrentWeather() {
    return WEATHER_PROFILES[this.weatherIndex];
  }

  // -------------------------------------------------------------
  // SHARED MATERIALS & TEXTURES
  // -------------------------------------------------------------
  initSharedMaterials() {
    this.initProceduralTextures();

    this.materials = {
      roadStreet: new THREE.MeshStandardMaterial({ color: 0x48423f, roughness: 0.95 }),
      roadTemple: new THREE.MeshStandardMaterial({ color: 0x5a4d47, roughness: 0.85 }),

      // Railway Rails & Ties
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
      rangoliYellow: new THREE.MeshBasicMaterial({ color: 0xffd000 }),
      marigoldOrange: new THREE.MeshStandardMaterial({ color: 0xff7b00, roughness: 0.5, emissive: 0x994400, emissiveIntensity: 0.2 }),
      marigoldYellow: new THREE.MeshStandardMaterial({ color: 0xffd000, roughness: 0.5, emissive: 0x775500, emissiveIntensity: 0.2 }),
      templeStone: new THREE.MeshStandardMaterial({ color: 0x6e5e54, roughness: 0.8 }),
      woodDark: new THREE.MeshStandardMaterial({ color: 0x3c2317, roughness: 0.85 }),
      woodBench: new THREE.MeshStandardMaterial({ color: 0x6b3f20, roughness: 0.7 }),
      fabricOrange: new THREE.MeshStandardMaterial({ color: 0xff5400, roughness: 0.6 }),
      fabricSaffron: new THREE.MeshStandardMaterial({ color: 0xff7b00, roughness: 0.6 }),
      fabricCrimson: new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.6 }),
      fabricEmerald: new THREE.MeshStandardMaterial({ color: 0x1b4332, roughness: 0.6 }),
      fabricTeal: new THREE.MeshStandardMaterial({ color: 0x0077b6, roughness: 0.6 }),
      fabricRoyal: new THREE.MeshStandardMaterial({ color: 0x7209b7, roughness: 0.6 }),
      fabricWhite: new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.7 }),
      diyaBrass: new THREE.MeshStandardMaterial({ color: 0xcca010, metalness: 0.85, roughness: 0.25 }),
      diyaFlame: new THREE.MeshBasicMaterial({ color: 0xffb703 }),

      // Gopuram & Temple Materials
      gopuramOchre: new THREE.MeshStandardMaterial({ color: 0xc98642, roughness: 0.8 }),
      gopuramTerracotta: new THREE.MeshStandardMaterial({ color: 0xb54d28, roughness: 0.8 }),
      gopuramCream: new THREE.MeshStandardMaterial({ color: 0xefe5d5, roughness: 0.7 }),
      goldKalasha: new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.15 }),

      // Station Infrastructure Materials
      platformConcrete: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 }),
      platformHazardYellow: new THREE.MeshBasicMaterial({ color: 0xffd000 }),
      tinCanopy: new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.65, roughness: 0.4 }),
      ironPillar: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 }),
      stationBoardMat: new THREE.MeshBasicMaterial({ map: this.stationBoardTex }),
      pf1BoardMat: new THREE.MeshBasicMaterial({ map: this.pf1BoardTex }),
      pf2BoardMat: new THREE.MeshBasicMaterial({ map: this.pf2BoardTex }),
      chaiStallMat: new THREE.MeshBasicMaterial({ map: this.chaiStallTex }),
      fruitSignMat: new THREE.MeshBasicMaterial({ map: this.fruitSignTex }),

      // Haveli Architecture Materials
      haveliTerracotta: new THREE.MeshStandardMaterial({ color: 0xa8422b, roughness: 0.8 }),
      haveliPlaster: new THREE.MeshStandardMaterial({ color: 0xd9c5b2, roughness: 0.75 }),
      haveliWood: new THREE.MeshStandardMaterial({ color: 0x4a2810, roughness: 0.8 }),
      windowGlow: new THREE.MeshBasicMaterial({ color: 0xffde59 }),

      // Produce & Props
      produceMelon: new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.6 }),
      produceMango: new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.4 }),
      produceBanana: new THREE.MeshStandardMaterial({ color: 0xffea00, roughness: 0.4 }),
      produceApple: new THREE.MeshStandardMaterial({ color: 0xc1121f, roughness: 0.4 }),
      sackJute: new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.9 }),
      trunkBrown: new THREE.MeshStandardMaterial({ color: 0x5c3d2e, metalness: 0.2, roughness: 0.7 }),

      // Crowd Silk & Attire Materials
      skinToneWarm: new THREE.MeshStandardMaterial({ color: 0xd49c6b, roughness: 0.65 }),
      skinToneDeep: new THREE.MeshStandardMaterial({ color: 0x9c6644, roughness: 0.65 }),
      hairBlack: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }),
      coolieRed: new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.7 }),
      dhotiCream: new THREE.MeshStandardMaterial({ color: 0xf4edea, roughness: 0.85 }),
      turbanSaffron: new THREE.MeshStandardMaterial({ color: 0xff7b00, roughness: 0.7 }),
      turbanRed: new THREE.MeshStandardMaterial({ color: 0xc1121f, roughness: 0.7 })
    };
  }

  // Create High-Res Procedural Canvas Textures for Realistic Indian Settings
  initProceduralTextures() {
    // 1. Station Main Signboard ("गणेश नगर JN / GANESH NAGAR")
    const sCanvas = document.createElement('canvas');
    sCanvas.width = 512;
    sCanvas.height = 128;
    const sCtx = sCanvas.getContext('2d');
    sCtx.fillStyle = '#ffcc00'; // Indian railway mustard yellow
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.lineWidth = 10;
    sCtx.strokeStyle = '#111111';
    sCtx.strokeRect(5, 5, 502, 118);
    sCtx.fillStyle = '#111111';
    sCtx.textAlign = 'center';
    sCtx.font = 'bold 36px sans-serif';
    sCtx.fillText('गणेश नगर जं.', 256, 52);
    sCtx.font = 'bold 38px sans-serif';
    sCtx.fillText('GANESH NAGAR JN', 256, 100);
    this.stationBoardTex = new THREE.CanvasTexture(sCanvas);

    // 2. Platform 1 & 2 Signs
    const p1Canvas = document.createElement('canvas');
    p1Canvas.width = 256; p1Canvas.height = 128;
    const p1Ctx = p1Canvas.getContext('2d');
    p1Ctx.fillStyle = '#005f73';
    p1Ctx.fillRect(0, 0, 256, 128);
    p1Ctx.fillStyle = '#ffffff';
    p1Ctx.textAlign = 'center';
    p1Ctx.font = 'bold 32px sans-serif';
    p1Ctx.fillText('प्लेटफ़ॉर्म 1', 128, 52);
    p1Ctx.font = 'bold 34px sans-serif';
    p1Ctx.fillText('PLATFORM 1', 128, 98);
    this.pf1BoardTex = new THREE.CanvasTexture(p1Canvas);

    const p2Canvas = document.createElement('canvas');
    p2Canvas.width = 256; p2Canvas.height = 128;
    const p2Ctx = p2Canvas.getContext('2d');
    p2Ctx.fillStyle = '#005f73';
    p2Ctx.fillRect(0, 0, 256, 128);
    p2Ctx.fillStyle = '#ffffff';
    p2Ctx.textAlign = 'center';
    p2Ctx.font = 'bold 32px sans-serif';
    p2Ctx.fillText('प्लेटफ़ॉर्म 2', 128, 52);
    p2Ctx.font = 'bold 34px sans-serif';
    p2Ctx.fillText('PLATFORM 2', 128, 98);
    this.pf2BoardTex = new THREE.CanvasTexture(p2Canvas);

    // 3. Chai Stall Banner ("GARAM CHAI & SNACKS")
    const cCanvas = document.createElement('canvas');
    cCanvas.width = 512; cCanvas.height = 128;
    const cCtx = cCanvas.getContext('2d');
    cCtx.fillStyle = '#9d0208';
    cCtx.fillRect(0, 0, 512, 128);
    cCtx.strokeStyle = '#ffd700';
    cCtx.lineWidth = 8;
    cCtx.strokeRect(4, 4, 504, 120);
    cCtx.fillStyle = '#ffd700';
    cCtx.textAlign = 'center';
    cCtx.font = 'bold 34px sans-serif';
    cCtx.fillText('☕ स्पेशल गरम चाय • SNACKS', 256, 52);
    cCtx.font = 'bold 30px sans-serif';
    cCtx.fillText('FRESH TEA & SAMOSAS', 256, 96);
    this.chaiStallTex = new THREE.CanvasTexture(cCanvas);

    // 4. Fruit Stall Sign
    const fCanvas = document.createElement('canvas');
    fCanvas.width = 384; fCanvas.height = 96;
    const fCtx = fCanvas.getContext('2d');
    fCtx.fillStyle = '#2d6a4f';
    fCtx.fillRect(0, 0, 384, 96);
    fCtx.fillStyle = '#ffffff';
    fCtx.textAlign = 'center';
    fCtx.font = 'bold 32px sans-serif';
    fCtx.fillText('ताज़ा फल • FRESH FRUITS', 192, 60);
    this.fruitSignTex = new THREE.CanvasTexture(fCanvas);
  }

  initTrackTemplates() {
    this.roadGeo = new THREE.PlaneGeometry(10.8, this.chunkLength);
    this.roadGeo.rotateX(-Math.PI / 2);

    this.curbGeo = new THREE.BoxGeometry(0.55, 0.35, this.chunkLength);
    this.sleeperGeo = new THREE.BoxGeometry(2.1, 0.12, 0.36);
    this.railGeo = new THREE.BoxGeometry(0.09, 0.15, this.chunkLength);
  }

  // -------------------------------------------------------------
  // DYNAMIC SKY DOME, LIGHTING & CELESTIAL BODIES
  // -------------------------------------------------------------
  initSkyAndLighting() {
    const initW = WEATHER_PROFILES[0];

    // Background Color
    this.scene.background = new THREE.Color(initW.skyColor);

    // Ambient light: warm divine radiance
    this.ambientLight = new THREE.AmbientLight(initW.ambientColor, initW.ambientIntensity);
    this.scene.add(this.ambientLight);

    // Directional sunlight / moonlight
    this.sunLight = new THREE.DirectionalLight(initW.sunColor, initW.sunIntensity);
    this.sunLight.position.copy(initW.sunPos);
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
    this.scene.fog = new THREE.FogExp2(initW.fogColor, initW.fogDensity);

    // Distant background mountain range
    this.createDistantMountains();
  }

  initCelestialObjects() {
    this.celestialGroup = new THREE.Group();

    // 1. Panoramic Sky Dome (Inverted Hemisphere)
    const skyGeo = new THREE.SphereGeometry(320, 24, 16);
    this.skyDomeMat = new THREE.MeshBasicMaterial({
      color: WEATHER_PROFILES[0].skyColor,
      side: THREE.BackSide,
      fog: false
    });
    this.skyDome = new THREE.Mesh(skyGeo, this.skyDomeMat);
    this.celestialGroup.add(this.skyDome);

    // 2. Starfield (450 Twinkling Stars in Night Sky)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 450;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0) * 0.45; // Upper hemisphere only
      const r = 275 + Math.random() * 20;

      starPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = Math.max(35, r * Math.cos(phi));
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

    this.starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.2,
      transparent: true,
      opacity: 0.0,
      fog: false
    });
    this.starfield = new THREE.Points(starGeo, this.starMat);
    this.celestialGroup.add(this.starfield);

    // 3. Glowing Radiant Sun Mesh
    this.sunGroup = new THREE.Group();
    const sunCore = new THREE.Mesh(
      new THREE.CircleGeometry(10.0, 24),
      new THREE.MeshBasicMaterial({ color: 0xfff3b0, fog: false })
    );
    this.sunGroup.add(sunCore);

    const sunHalo = new THREE.Mesh(
      new THREE.CircleGeometry(18.0, 24),
      new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.45, fog: false })
    );
    this.sunGroup.add(sunHalo);
    this.sunGroup.position.set(-35, 60, -240);
    this.celestialGroup.add(this.sunGroup);

    // 4. Glowing Silver Crescent Moon Mesh
    this.moonGroup = new THREE.Group();
    const moonDisc = new THREE.Mesh(
      new THREE.CircleGeometry(9.0, 24),
      new THREE.MeshBasicMaterial({ color: 0xe0fbfc, fog: false })
    );
    this.moonGroup.add(moonDisc);

    // Moon Shadow to create crescent phase
    const moonShadow = new THREE.Mesh(
      new THREE.CircleGeometry(8.2, 24),
      new THREE.MeshBasicMaterial({ color: 0x050814, fog: false })
    );
    moonShadow.position.set(3.2, 1.2, 0.05);
    this.moonGroup.add(moonShadow);

    const moonAura = new THREE.Mesh(
      new THREE.CircleGeometry(16.0, 24),
      new THREE.MeshBasicMaterial({ color: 0x90e0ef, transparent: true, opacity: 0.35, fog: false })
    );
    this.moonGroup.add(moonAura);
    this.moonGroup.position.set(40, 65, -240);
    this.celestialGroup.add(this.moonGroup);

    // 5. Drifting Clouds
    this.cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      fog: false
    });
    for (let c = 0; c < 8; c++) {
      const puff = new THREE.Mesh(new THREE.BoxGeometry(22 + Math.random() * 20, 5, 12), cloudMat);
      puff.position.set((Math.random() - 0.5) * 220, 50 + Math.random() * 25, -220 + Math.random() * 40);
      this.cloudGroup.add(puff);
    }
    this.celestialGroup.add(this.cloudGroup);

    this.scene.add(this.celestialGroup);
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

    const chopperMat = new THREE.MeshBasicMaterial({
      map: characterTextures.textures.helicopter,
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide
    });
    this.chopperBody = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.6), chopperMat);
    this.chopperGroup.add(this.chopperBody);

    const rotorGeo = new THREE.BoxGeometry(7.0, 0.06, 0.4);
    const rotorMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.6 });
    this.chopperRotor = new THREE.Mesh(rotorGeo, rotorMat);
    this.chopperRotor.position.y = 1.35;
    this.chopperGroup.add(this.chopperRotor);

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

    const signMat = new THREE.MeshStandardMaterial({
      map: characterTextures.textures.kailasaSign,
      roughness: 0.4,
      metalness: 0.1
    });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), signMat);
    signMesh.position.set(0, 2.4, 0);
    this.signGroup.add(signMesh);

    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(0, 1.25, 0);
    this.signGroup.add(post);

    this.signGroup.position.set(-6.2, 0, -18);
    this.scene.add(this.signGroup);
  }

  initWorld() {
    for (let i = 0; i < this.visibleChunks; i++) {
      const z = -i * this.chunkLength;
      const chunk = this.createChunk(z, 0);
      this.chunks.push(chunk);
      this.scene.add(chunk.group);
    }
  }

  // -------------------------------------------------------------
  // CROWD SPECTATORS (STRICTLY OUTSIDE TRACKS: |x| >= 5.0m)
  // -------------------------------------------------------------
  createPersonMesh(config = {}) {
    const {
      type = 'sari',     // 'sari', 'kurta', 'porter', 'seated'
      side = 1,          // -1 (left) or 1 (right)
      colorIndex = 0
    } = config;

    const person = new THREE.Group();
    const sariColors = [
      this.materials.fabricCrimson,
      this.materials.fabricTeal,
      this.materials.fabricSaffron,
      this.materials.fabricEmerald,
      this.materials.fabricRoyal
    ];
    const kurtaColors = [
      this.materials.fabricSaffron,
      this.materials.fabricOrange,
      this.materials.fabricCrimson,
      this.materials.fabricEmerald
    ];

    const skinMat = (colorIndex % 2 === 0) ? this.materials.skinToneWarm : this.materials.skinToneDeep;
    const isSeated = (type === 'seated');

    // 1. Lower Body / Skirt / Dhoti
    let lowerMesh;
    if (type === 'sari') {
      const sariMat = sariColors[colorIndex % sariColors.length];
      lowerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.35, 0.85, 8), sariMat);
      lowerMesh.position.y = 0.42;

      // Zari Gold Border trim along bottom hem
      const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.352, 0.352, 0.08, 8), this.materials.goldKalasha);
      hem.position.y = 0.06;
      person.add(hem);
    } else if (type === 'porter') {
      lowerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.85, 8), this.materials.dhotiCream);
      lowerMesh.position.y = 0.42;
    } else if (isSeated) {
      // Seated legs folded forward
      lowerMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.35, 0.45), this.materials.dhotiCream);
      lowerMesh.position.set(0, 0.45, 0.2);
    } else {
      // Men's Dhoti
      lowerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.85, 8), this.materials.dhotiCream);
      lowerMesh.position.y = 0.42;
    }
    person.add(lowerMesh);

    // 2. Torso / Kurta / Blouse
    let torsoMat = (type === 'sari')
      ? sariColors[(colorIndex + 1) % sariColors.length]
      : (type === 'porter')
        ? this.materials.coolieRed
        : kurtaColors[colorIndex % kurtaColors.length];

    const torsoY = isSeated ? 0.85 : 1.15;
    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.26), torsoMat);
    torsoMesh.position.set(0, torsoY, isSeated ? -0.05 : 0);
    person.add(torsoMesh);

    // Sari Pallu / Dupatta draped across shoulder
    if (type === 'sari') {
      const palluMat = sariColors[colorIndex % sariColors.length];
      const pallu = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.58, 0.12), palluMat);
      pallu.position.set(-0.12, torsoY, 0.08);
      pallu.rotation.z = -0.15;
      person.add(pallu);
    }

    // 3. Head & Hair / Turban
    const headY = isSeated ? 1.25 : 1.55;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), skinMat);
    head.position.set(0, headY, isSeated ? -0.05 : 0);
    person.add(head);

    if (type === 'porter') {
      // Red Railway Coolie Pagri / Turban
      const turban = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.14, 8), this.materials.turbanRed);
      turban.position.set(0, headY + 0.12, isSeated ? -0.05 : 0);
      person.add(turban);
    } else if (type === 'kurta') {
      // Colorful Turban
      const turbanMat = (colorIndex % 2 === 0) ? this.materials.turbanSaffron : this.materials.turbanRed;
      const turban = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.12, 8), turbanMat);
      turban.position.set(0, headY + 0.11, 0);
      person.add(turban);
    } else {
      // Traditional Hair Bun with Jasmine Garland (Gajra)
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), this.materials.hairBlack);
      hair.position.set(0, headY + 0.04, -0.09);
      person.add(hair);

      const gajra = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.03, 6, 8), this.materials.fabricWhite);
      gajra.position.set(0, headY + 0.04, -0.09);
      person.add(gajra);
    }

    // 4. Arms & Animated Cheering/Waving Hand
    const restArm = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.38, 0.10), torsoMat);
    restArm.position.set(side * 0.26, torsoY - 0.04, 0);
    person.add(restArm);

    // Cheering / Waving Arm (facing towards tracks)
    const waveArm = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.40, 0.10), skinMat);
    waveArm.position.set(-side * 0.28, torsoY + 0.10, 0);
    waveArm.rotation.z = side * (0.6 + Math.random() * 0.4);
    person.add(waveArm);

    person.userData = {
      waveArm,
      initialRotZ: waveArm.rotation.z,
      animPhase: Math.random() * Math.PI * 2,
      animSpeed: 2.5 + Math.random() * 1.5
    };
    this.activeCrowdFigures.push(person);

    person.rotation.y = (side > 0 ? -Math.PI / 2 : Math.PI / 2);

    return person;
  }

  // -------------------------------------------------------------
  // CHUNK GENERATION & 4 SCENERY THEMES
  // -------------------------------------------------------------
  createChunk(z, distance) {
    const theme = this.getCurrentTheme();
    const group = new THREE.Group();
    group.position.z = z;

    const chunkCrowd = [];

    // 1. Roadbed / Ballast Surface
    let roadMat = this.materials.roadStreet;
    if (theme.id === 'TEMPLE_GHATS') roadMat = this.materials.roadTemple;
    const road = new THREE.Mesh(this.roadGeo, roadMat);
    road.receiveShadow = true;
    group.add(road);

    // 2. Three-Lane Railway Tracks (Lanes: -3.0, 0.0, +3.0)
    const laneCenters = [-3.0, 0, 3.0];
    const railGaugeHalf = 0.72;

    laneCenters.forEach(laneX => {
      const railL = new THREE.Mesh(this.railGeo, this.materials.steelRail);
      railL.position.set(laneX - railGaugeHalf, 0.12, 0);
      railL.castShadow = true;
      group.add(railL);

      const railR = new THREE.Mesh(this.railGeo, this.materials.steelRail);
      railR.position.set(laneX + railGaugeHalf, 0.12, 0);
      railR.castShadow = true;
      group.add(railR);

      const tieCount = Math.floor(this.chunkLength / 1.5);
      for (let t = 0; t < tieCount; t++) {
        const tieZ = -this.chunkLength / 2 + t * 1.5 + 0.75;
        const tie = new THREE.Mesh(this.sleeperGeo, this.materials.railTieWood);
        tie.position.set(laneX, 0.06, tieZ);
        tie.receiveShadow = true;
        group.add(tie);
      }
    });

    // 3. Golden Edge Curbs separating tracks from sidelines
    for (let side of [-1, 1]) {
      const curb = new THREE.Mesh(this.curbGeo, this.materials.curbGold);
      curb.position.set(side * 5.4, 0.18, 0);
      group.add(curb);
    }

    // 4. Decorate based on the active 30-Second Scenery Theme
    if (theme.id === 'RAILWAY_STATION') {
      this.decorateRailwayStation(group, chunkCrowd);
    } else if (theme.id === 'BAZAAR_MARKET') {
      this.decorateBazaarMarket(group, chunkCrowd);
    } else if (theme.id === 'HAVELI_TOWN') {
      this.decorateHaveliTown(group, chunkCrowd);
    } else {
      this.decorateTempleGhats(group, chunkCrowd);
    }

    return { group, z, distance, theme, chunkCrowd };
  }

  // -------------------------------------------------------------
  // THEME 1: INDIAN RAILWAY STATION PLATFORMS (Out of Track Crowds)
  // -------------------------------------------------------------
  decorateRailwayStation(group, chunkCrowd) {
    for (let side of [-1, 1]) {
      const platX = side * 7.0; // Platform centered safely at x = ±7.0m

      // 1. Elevated Concrete Station Platform (Length 40m, Width 3.6m, Height 0.45m)
      const platGeo = new THREE.BoxGeometry(3.6, 0.45, this.chunkLength);
      const plat = new THREE.Mesh(platGeo, this.materials.platformConcrete);
      plat.position.set(platX, 0.225, 0);
      plat.receiveShadow = true;
      group.add(plat);

      // 2. High-Visibility Yellow Safety Hazard Tactile Strip (|x| = 5.25m, facing track)
      const hazardEdgeX = side * 5.28;
      const hazardGeo = new THREE.BoxGeometry(0.24, 0.04, this.chunkLength);
      const hazard = new THREE.Mesh(hazardGeo, this.materials.platformHazardYellow);
      hazard.position.set(hazardEdgeX, 0.46, 0);
      group.add(hazard);

      // 3. Corrugated Tin Platform Canopy Shed with Heavy Steel Girders
      const roofX = side * 7.2;
      const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.10, this.chunkLength * 0.94), this.materials.tinCanopy);
      roofMesh.position.set(roofX, 4.3, 0);
      roofMesh.rotation.z = -side * 0.08;
      roofMesh.castShadow = true;
      group.add(roofMesh);

      // Canopy Support Pillars along the platform
      for (let pz of [-14, 0, 14]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 4.0, 8), this.materials.ironPillar);
        pillar.position.set(side * 7.5, 2.2, pz);
        group.add(pillar);
      }

      // 4. Railway Station Bilingual Signboard ("गणेश नगर JN / GANESH NAGAR")
      const board = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.8, 0.08), this.materials.stationBoardMat);
      board.position.set(side * 6.6, 3.4, -6);
      board.rotation.y = (side > 0 ? -Math.PI / 2 : Math.PI / 2);
      group.add(board);

      // Platform Number Indicator ("PLATFORM 1" on left, "PLATFORM 2" on right)
      const pfMat = (side < 0) ? this.materials.pf1BoardMat : this.materials.pf2BoardMat;
      const pfBoard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.06), pfMat);
      pfBoard.position.set(side * 6.6, 3.4, 6);
      pfBoard.rotation.y = (side > 0 ? -Math.PI / 2 : Math.PI / 2);
      group.add(pfBoard);

      // 5. Slatted Wooden Railway Waiting Benches with Seated Passengers
      for (let bz of [-11, 11]) {
        const bench = this.createStationBench();
        bench.position.set(side * 7.2, 0.45, bz);
        bench.rotation.y = (side > 0 ? -Math.PI / 2 : Math.PI / 2);
        group.add(bench);

        // Seated passenger on bench
        const seatedPassenger = this.createPersonMesh({ type: 'seated', side, colorIndex: bz > 0 ? 1 : 2 });
        seatedPassenger.position.set(side * 7.2, 0.45, bz);
        group.add(seatedPassenger);
        chunkCrowd.push(seatedPassenger);

        // Vintage metal luggage travel trunk beside bench
        const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.38), this.materials.trunkBrown);
        trunk.position.set(side * 7.2, 0.62, bz + 0.9);
        group.add(trunk);
      }

      // 6. Standing Passengers Waiting on the Platform (STRICTLY at |x| = 5.8m to 6.8m)
      const standingPositions = [-15, -4, 4, 15];
      standingPositions.forEach((sz, idx) => {
        const pType = (idx === 0) ? 'porter' : (idx % 2 === 0) ? 'sari' : 'kurta';
        const person = this.createPersonMesh({ type: pType, side, colorIndex: idx });
        person.position.set(side * (5.8 + (idx % 3) * 0.4), 0.45, sz);
        group.add(person);
        chunkCrowd.push(person);
      });

      // 7. Special Chai Stall Kiosk (Right Platform only)
      if (side > 0) {
        const chaiKiosk = this.createChaiKiosk();
        chaiKiosk.position.set(side * 7.6, 0.45, 0);
        chaiKiosk.rotation.y = -Math.PI / 2;
        group.add(chaiKiosk);
      }
    }
  }

  createStationBench() {
    const bench = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.5), this.materials.woodBench);
    seat.position.set(0, 0.45, 0);
    bench.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.08), this.materials.woodBench);
    back.position.set(0, 0.72, -0.22);
    bench.add(back);

    for (let lx of [-0.68, 0.68]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.48), this.materials.ironPillar);
      leg.position.set(lx, 0.225, 0);
      bench.add(leg);
    }
    return bench;
  }

  createChaiKiosk() {
    const kiosk = new THREE.Group();
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.2), this.materials.woodDark);
    counter.position.y = 0.45;
    kiosk.add(counter);

    const sign = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.06), this.materials.chaiStallMat);
    sign.position.set(0, 1.8, 0.5);
    kiosk.add(sign);

    const samovar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.5, 8), this.materials.diyaBrass);
    samovar.position.set(-0.6, 1.15, 0);
    kiosk.add(samovar);

    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.4), this.materials.goldKalasha);
    tray.position.set(0.4, 0.93, 0);
    kiosk.add(tray);

    return kiosk;
  }

  // -------------------------------------------------------------
  // THEME 2: BUSTLING INDIAN BAZAAR & STREET MARKET (Off-Track Vendors)
  // -------------------------------------------------------------
  decorateBazaarMarket(group, chunkCrowd) {
    for (let side of [-1, 1]) {
      const bzX = side * 7.2;

      // 1. Market Sidewalk Pavement (Length 40m, Width 3.8m)
      const walk = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.20, this.chunkLength), this.materials.templeStone);
      walk.position.set(bzX, 0.10, 0);
      walk.receiveShadow = true;
      group.add(walk);

      // 2. 3 Market Stalls per side with Colorful Striped Canopies
      const stallZPositions = [-13, 0, 13];
      stallZPositions.forEach((sz, idx) => {
        const stall = this.createMarketStall(side, idx);
        stall.position.set(side * 8.2, 0.20, sz);
        group.add(stall);

        const personType = (idx % 2 === 0) ? 'kurta' : 'sari';
        const vendor = this.createPersonMesh({ type: personType, side, colorIndex: idx * 2 });
        vendor.position.set(side * 6.2, 0.20, sz + 0.8);
        group.add(vendor);
        chunkCrowd.push(vendor);
      });

      // 3. Traditional 4-Wheeled Fruit & Vegetable Pushcarts (Thela) at |x| = 5.4m
      for (let cz of [-6, 7]) {
        const cart = this.createFruitCart(cz > 0 ? 'mango' : 'melon');
        cart.position.set(side * 5.4, 0.20, cz);
        cart.rotation.y = (side > 0 ? -Math.PI / 2 : Math.PI / 2);
        group.add(cart);

        const shopper = this.createPersonMesh({ type: 'sari', side, colorIndex: cz > 0 ? 3 : 4 });
        shopper.position.set(side * 6.4, 0.20, cz - 0.7);
        group.add(shopper);
        chunkCrowd.push(shopper);
      }

      // 4. Jute Sacks of Grains & Spices along sidewalk
      for (let sackZ of [-17, -2, 17]) {
        const sack = new THREE.Mesh(new THREE.SphereGeometry(0.32, 6, 6), this.materials.sackJute);
        sack.scale.set(1.0, 1.3, 0.9);
        sack.position.set(side * 6.5, 0.45, sackZ);
        group.add(sack);
      }
    }

    // 5. Festive Bunting / Overhead Pennants strung across the street
    for (let fz of [-12, 12]) {
      const bunting = this.createOverheadBunting();
      bunting.position.set(0, 6.2, fz);
      group.add(bunting);
    }
  }

  createMarketStall(side, idx) {
    const stall = new THREE.Group();
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 3.2), this.materials.woodDark);
    table.position.y = 0.425;
    stall.add(table);

    const awningMats = [
      this.materials.fabricCrimson,
      this.materials.fabricSaffron,
      this.materials.fabricEmerald,
      this.materials.fabricTeal
    ];
    const awningMat = awningMats[idx % awningMats.length];
    const awning = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 3.6), awningMat);
    awning.position.set(-side * 0.4, 2.6, 0);
    awning.rotation.z = -side * 0.25;
    stall.add(awning);

    for (let pz of [-1.5, 1.5]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), this.materials.woodDark);
      pole.position.set(-side * 1.1, 1.2, pz);
      stall.add(pole);
    }

    for (let px of [-0.4, 0.4]) {
      for (let pz of [-0.7, 0.7]) {
        const flowerHeap = new THREE.Mesh(
          new THREE.ConeGeometry(0.24, 0.22, 6),
          (idx % 2 === 0) ? this.materials.marigoldOrange : this.materials.marigoldYellow
        );
        flowerHeap.position.set(px, 0.95, pz);
        stall.add(flowerHeap);
      }
    }

    return stall;
  }

  createFruitCart(fruitType = 'mango') {
    const cart = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 2.2), this.materials.woodBench);
    deck.position.y = 0.65;
    cart.add(deck);

    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    for (let wx of [-0.75, 0.75]) {
      for (let wz of [-0.7, 0.7]) {
        const wheel = new THREE.Mesh(wheelGeo, this.materials.woodDark);
        wheel.position.set(wx, 0.28, wz);
        cart.add(wheel);
      }
    }

    const pMat = (fruitType === 'mango') ? this.materials.produceMango : this.materials.produceMelon;
    const pGeo = (fruitType === 'mango') ? new THREE.SphereGeometry(0.12, 6, 6) : new THREE.SphereGeometry(0.20, 8, 8);
    for (let fx of [-0.3, 0.3]) {
      for (let fz of [-0.6, 0, 0.6]) {
        const fruit = new THREE.Mesh(pGeo, pMat);
        fruit.position.set(fx, 0.85, fz);
        cart.add(fruit);
      }
    }

    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 1.2), this.materials.fruitSignMat);
    sign.position.set(0.72, 0.85, 0);
    cart.add(sign);

    return cart;
  }

  createOverheadBunting() {
    const group = new THREE.Group();
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 14), this.materials.woodDark);
    wire.rotation.z = Math.PI / 2;
    group.add(wire);

    const colors = [
      this.materials.fabricSaffron,
      this.materials.fabricCrimson,
      this.materials.fabricTeal,
      this.materials.fabricEmerald,
      this.materials.fabricOrange
    ];
    for (let x = -5.5; x <= 5.5; x += 1.1) {
      const mat = colors[Math.floor(Math.abs(x * 3)) % colors.length];
      const flag = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 3), mat);
      flag.position.set(x, -0.3, 0);
      group.add(flag);
    }
    return group;
  }

  // -------------------------------------------------------------
  // THEME 3: TRADITIONAL HERITAGE HAVELIS & VILLAGE HOUSES
  // -------------------------------------------------------------
  decorateHaveliTown(group, chunkCrowd) {
    for (let side of [-1, 1]) {
      const hX = side * 8.5;

      for (let i = 0; i < 3; i++) {
        const bZ = -13 + i * 13;
        const haveli = this.createHaveliHouse(side, i);
        haveli.position.set(hX, 0, bZ);
        group.add(haveli);

        const person = this.createPersonMesh({ type: i % 2 === 0 ? 'sari' : 'kurta', side, colorIndex: i });
        person.position.set(side * 5.8, 0, bZ + 2.5);
        group.add(person);
        chunkCrowd.push(person);

        const tulsi = this.createTulsiShrine();
        tulsi.position.set(side * 5.8, 0, bZ - 2.5);
        group.add(tulsi);
      }
    }
  }

  createHaveliHouse(side, idx) {
    const house = new THREE.Group();
    const hHeight = 8.5;

    const bodyMat = (idx % 2 === 0) ? this.materials.haveliPlaster : this.materials.gopuramCream;
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.8, hHeight, 10.5), bodyMat);
    body.position.y = hHeight / 2;
    body.castShadow = true;
    house.add(body);

    const jharokha = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 2.6), this.materials.haveliWood);
    jharokha.position.set(-side * 2.6, 5.0, 0);
    house.add(jharokha);

    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), this.materials.windowGlow);
    win.position.set(-side * 3.22, 5.0, 0);
    win.rotation.y = (side > 0 ? -Math.PI / 2 : Math.PI / 2);
    house.add(win);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.25, 11.0), this.materials.haveliTerracotta);
    roof.position.set(-side * 0.3, hHeight + 0.12, 0);
    roof.rotation.z = -side * 0.18;
    house.add(roof);

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.6, 1.8), this.materials.woodDark);
    door.position.set(-side * 2.45, 1.3, 0);
    house.add(door);

    return house;
  }

  createTulsiShrine() {
    const shrine = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.7, 0.65), this.materials.templeStone);
    base.position.y = 0.35;
    shrine.add(base);

    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), this.materials.produceMelon);
    bush.position.y = 0.85;
    shrine.add(bush);

    return shrine;
  }

  // -------------------------------------------------------------
  // THEME 4: SACRED TEMPLE GHATS & GOPURAMS
  // -------------------------------------------------------------
  decorateTempleGhats(group, chunkCrowd) {
    const gopuram = this.createGopuramTower();
    gopuram.position.set(13.5, 0, -8);
    group.add(gopuram);

    const mandapa = this.createTempleColonnade();
    mandapa.position.set(-13.0, 0, -5);
    group.add(mandapa);

    for (let side of [-1, 1]) {
      for (let zOffset of [-14, 14]) {
        const diyaLamp = this.createDiyaPillar();
        diyaLamp.position.set(side * 6.2, 0, zOffset);
        group.add(diyaLamp);
      }

      const devotee = this.createPersonMesh({ type: 'sari', side, colorIndex: side > 0 ? 0 : 2 });
      devotee.position.set(side * 6.6, 0, 0);
      group.add(devotee);
      chunkCrowd.push(devotee);
    }

    const toran = this.createOverheadTempleToran();
    toran.position.set(0, 0, -18);
    group.add(toran);

    this.decorateVisarjanRiverbank(group);
  }

  createGopuramTower() {
    const tower = new THREE.Group();
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

      for (let n = -1; n <= 1; n += 2) {
        const niche = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.4), this.materials.goldKalasha);
        niche.position.set(-tierWidth / 2 - 0.05, tierY, n * (tierDepth * 0.25));
        tower.add(niche);
      }
    }

    const roofY = 1.8 + tiers * 3.6 + 1.2;
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 3.2, 2.5, 4), this.materials.gopuramCream);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = roofY;
    tower.add(roof);

    for (let k = -1; k <= 1; k++) {
      const kalasha = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 8), this.materials.goldKalasha);
      kalasha.position.set(0, roofY + 1.8, k * 1.0);
      tower.add(kalasha);
    }

    return tower;
  }

  createTempleColonnade() {
    const colonnade = new THREE.Group();
    const plat = new THREE.Mesh(new THREE.BoxGeometry(8, 0.8, 30), this.materials.templeStone);
    plat.position.y = 0.4;
    colonnade.add(plat);

    for (let z = -12; z <= 12; z += 6) {
      for (let x of [-2, 2]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.45, 5.5, 8), this.materials.templeStone);
        pillar.position.set(x, 3.2, z);
        pillar.castShadow = true;
        colonnade.add(pillar);
      }
    }

    const roof = new THREE.Mesh(new THREE.BoxGeometry(9, 0.6, 31), this.materials.templeStone);
    roof.position.y = 6.2;
    colonnade.add(roof);

    return colonnade;
  }

  createOverheadTempleToran() {
    const toran = new THREE.Group();
    for (let side of [-5.6, 5.6]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 6.2, 8), this.materials.templeStone);
      p.position.set(side, 3.1, 0);
      toran.add(p);
    }

    const beam = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.5, 0.6), this.materials.fabricSaffron);
    beam.position.set(0, 5.9, 0);
    toran.add(beam);

    for (let x = -4.5; x <= 4.5; x += 1.5) {
      const garland = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), this.materials.marigoldOrange);
      garland.position.set(x, 4.8, 0);
      toran.add(garland);
    }
    return toran;
  }

  createDiyaPillar() {
    const pillar = new THREE.Group();
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 2.2, 8), this.materials.diyaBrass);
    stand.position.y = 1.1;
    pillar.add(stand);

    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), this.materials.diyaBrass);
    bowl.position.y = 2.2;
    pillar.add(bowl);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 8), this.materials.diyaFlame);
    flame.position.y = 2.45;
    pillar.add(flame);

    return pillar;
  }

  decorateVisarjanRiverbank(group) {
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

    for (let i = -15; i <= 15; i += 7) {
      const floatDiya = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 6), this.materials.diyaFlame);
      floatDiya.position.set(11 + Math.random() * 4, -0.1, i);
      group.add(floatDiya);
    }
  }

  // -------------------------------------------------------------
  // 30-SECOND DYNAMIC TRANSITION & WEATHER BLENDER
  // -------------------------------------------------------------
  applyBlendedWeather(fromW, toW, t) {
    const fromSky = new THREE.Color(fromW.skyColor);
    const toSky = new THREE.Color(toW.skyColor);
    const curSky = fromSky.clone().lerp(toSky, t);

    // 1. Sky Dome & Scene Background
    this.scene.background = curSky;
    if (this.skyDomeMat) {
      this.skyDomeMat.color.copy(curSky);
    }

    // 2. Atmospheric Fog
    const fromFog = new THREE.Color(fromW.fogColor);
    const toFog = new THREE.Color(toW.fogColor);
    const curFog = fromFog.clone().lerp(toFog, t);
    const curDensity = THREE.MathUtils.lerp(fromW.fogDensity, toW.fogDensity, t);

    if (this.scene.fog) {
      this.scene.fog.color.copy(curFog);
      this.scene.fog.density = curDensity;
    }

    // 3. Ambient Light
    const fromAmb = new THREE.Color(fromW.ambientColor);
    const toAmb = new THREE.Color(toW.ambientColor);
    this.ambientLight.color.copy(fromAmb.clone().lerp(toAmb, t));
    this.ambientLight.intensity = THREE.MathUtils.lerp(fromW.ambientIntensity, toW.ambientIntensity, t);

    // 4. Directional Sunlight / Moonlight
    const fromSun = new THREE.Color(fromW.sunColor);
    const toSun = new THREE.Color(toW.sunColor);
    this.sunLight.color.copy(fromSun.clone().lerp(toSun, t));
    this.sunLight.intensity = THREE.MathUtils.lerp(fromW.sunIntensity, toW.sunIntensity, t);

    const curSunPos = fromW.sunPos.clone().lerp(toW.sunPos, t);
    this.sunLight.position.copy(curSunPos);

    // 5. Celestial Objects Visibility (Stars, Moon, Sun)
    const curStarsOp = THREE.MathUtils.lerp(fromW.starsOpacity, toW.starsOpacity, t);
    if (this.starMat) {
      this.starMat.opacity = curStarsOp;
    }

    const curMoonOp = THREE.MathUtils.lerp(fromW.moonOpacity, toW.moonOpacity, t);
    if (this.moonGroup) {
      this.moonGroup.visible = (curMoonOp > 0.02);
      this.moonGroup.children.forEach(c => {
        if (c.material && c.material.transparent) {
          c.material.opacity = curMoonOp * 0.35;
        }
      });
    }

    const curSunOp = THREE.MathUtils.lerp(fromW.sunDiscOpacity, toW.sunDiscOpacity, t);
    if (this.sunGroup) {
      this.sunGroup.visible = (curSunOp > 0.05);
      this.sunGroup.children.forEach(c => {
        if (c.material && c.material.transparent) {
          c.material.opacity = curSunOp * 0.45;
        }
      });
    }

    this.activeZone.name = this.getCurrentTheme().name;
    this.activeZone.fog = curFog.getHex();
    this.activeZone.light = this.ambientLight.color.getHex();
  }

  // -------------------------------------------------------------
  // MAIN UPDATE LOOP (Called every frame with playerZ, distance, delta)
  // -------------------------------------------------------------
  update(playerZ, distance, delta = 0.016) {
    // 1. Advance 30-Second Weather & Scenery Rotation Timer
    if (delta > 0 && delta < 0.5) {
      this.cycleTimer += delta;
      if (this.cycleTimer >= this.cycleDuration) {
        this.cycleTimer = 0.0;
        this.weatherIndex = (this.weatherIndex + 1) % WEATHER_PROFILES.length;
        this.themeIndex = (this.themeIndex + 1) % SCENERY_THEMES.length;

        this.prevWeather = this.targetWeather;
        this.targetWeather = WEATHER_PROFILES[this.weatherIndex];
        this.weatherBlend = 0.0; // Trigger smooth 3.5s transition

        const newTheme = this.getCurrentTheme();
        const newWeather = this.targetWeather;
        this.onThemeChange?.(newTheme, newWeather);
      }
    }

    // 2. Smooth Weather Lerp Transition over 3.5 seconds
    if (this.weatherBlend < 1.0) {
      this.weatherBlend = Math.min(1.0, this.weatherBlend + delta / 3.5);
      this.applyBlendedWeather(this.prevWeather, this.targetWeather, this.weatherBlend);
    }

    // 3. Keep Directional Sunlight & Celestial Group Centered on Player
    this.sunLight.position.z = playerZ + 25;
    this.sunLight.target.position.z = playerZ - 10;
    this.sunLight.target.updateMatrixWorld();

    if (this.celestialGroup) {
      this.celestialGroup.position.z = playerZ;
    }
    if (this.distantGroup) {
      this.distantGroup.position.z = playerZ;
    }

    // 4. Drifting Clouds in Sky
    if (this.cloudGroup) {
      this.cloudGroup.children.forEach(c => {
        c.position.x += delta * 1.8;
        if (c.position.x > 140) c.position.x = -140;
      });
    }

    // 5. Animate Off-Track Crowd Figures (Cheering, Waving at Ganesha!)
    const time = Date.now() * 0.001;
    for (let i = 0; i < this.activeCrowdFigures.length; i++) {
      const fig = this.activeCrowdFigures[i];
      if (fig.userData && fig.userData.waveArm) {
        const arm = fig.userData.waveArm;
        const baseRot = fig.userData.initialRotZ;
        const phase = fig.userData.animPhase;
        const speed = fig.userData.animSpeed;
        arm.rotation.z = baseRot + Math.sin(time * speed + phase) * 0.22;
      }
    }

    // 6. Police Helicopter with Sweeping Searchlight
    if (this.chopperGroup) {
      const cTime = Date.now() * 0.0015;
      const hoverX = Math.sin(cTime) * 4.2;
      const hoverY = 16.5 + Math.cos(cTime * 1.5) * 0.8;
      this.chopperGroup.position.set(hoverX, hoverY, playerZ - 36);

      if (this.chopperRotor) {
        this.chopperRotor.rotation.y += 0.85;
      }
      if (this.searchlight && this.searchlightTarget) {
        this.searchlightTarget.position.set(Math.sin(cTime * 1.2) * 2.8, 0, playerZ - 14);
        this.searchlightTarget.updateMatrixWorld();
      }
    }

    // 7. Dynamic Chunk Recycling (Spawns Ahead with Active Theme)
    const recycleZThreshold = playerZ + this.chunkLength * 1.5;
    const furthestZ = Math.min(...this.chunks.map(c => c.z));

    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      if (chunk.z > recycleZThreshold) {
        if (chunk.chunkCrowd && chunk.chunkCrowd.length > 0) {
          this.activeCrowdFigures = this.activeCrowdFigures.filter(f => !chunk.chunkCrowd.includes(f));
        }

        this.scene.remove(chunk.group);

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
    this.activeCrowdFigures = [];
    this.cycleTimer = 0.0;
    this.weatherIndex = 0;
    this.themeIndex = 0;
    this.prevWeather = WEATHER_PROFILES[0];
    this.targetWeather = WEATHER_PROFILES[0];
    this.weatherBlend = 1.0;
    this.applyBlendedWeather(WEATHER_PROFILES[0], WEATHER_PROFILES[0], 1.0);
    this.initWorld();
  }
}
