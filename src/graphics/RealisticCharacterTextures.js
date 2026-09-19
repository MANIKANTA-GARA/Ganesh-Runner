// RealisticCharacterTextures.js - High-Fidelity Character & Environment Texture Extraction & Fallback Engine
import * as THREE from 'three';

const GANESHA_BACK_RUN_URL = './assets/ganesha_back_run.png';
const GANESHA_FRONT_RUN_URL = './assets/ganesha_front_run.png';
const SHIVA_BACK_RUN_URL = './assets/shiva_back_run.png';
const REF_BACK_URL = './assets/ref_back.jpg';
const REF_FRONT_URL = './assets/ref_front.jpg';
const MUSHIKA_FRONT_URL = './assets/mushika_front.png';
const MUSHIKA_BACK_URL = './assets/mushika_back.png';
const MUSHIKA_PREVIEW_URL = './assets/mushika_preview.png';

export class RealisticCharacterTextures {
  constructor() {
    this.textures = {
      ganeshaBack: null,
      ganeshaFront: null,
      ganeshaBackFrames: [],   // 4 animated running stride frames (Back view)
      ganeshaFrontFrames: [],  // 4 animated running stride frames (Front view)
      mushikaBack: null,
      mushikaFront: null,
      mushikaBackFrames: [],
      mushikaFrontFrames: [],
      shivaBack: null,
      shivaFront: null,
      shivaBackFrames: [],     // 4 animated running stride frames for Lord Shiva (Back view)
      helicopter: null,
      kailasaSign: null,
      policeBarricade: null,
      policeOfficers: null,
      trainLocoSide: null,
      trainCoachSide: null,
      trainFrontFace: null
    };

    this.callbacks = [];
    this.isReady = false;
    this.ganeshaDedicatedLoaded = false;
    this.shivaDedicatedLoaded = false;

    // 1. Immediately create high-detail procedural fallback textures
    this.initProceduralFallbacks();

    // 2. Load the reference images and extract photographic cutouts
    this.loadAndExtractTextures();
  }

  onReady(cb) {
    if (this.isReady) {
      cb(this.textures);
    } else {
      this.callbacks.push(cb);
    }
  }

  notifyReady() {
    this.isReady = true;
    this.callbacks.forEach(cb => cb(this.textures));
  }

  // --- Procedural High-Detail Canvas Textures (Instant & Fallback) ---
  initProceduralFallbacks() {
    this.textures.ganeshaBack = this.generateProceduralGaneshaBack();
    this.textures.ganeshaFront = this.generateProceduralGaneshaFront();
    this.textures.ganeshaBackFrames = [this.textures.ganeshaBack, this.textures.ganeshaBack, this.textures.ganeshaBack, this.textures.ganeshaBack];
    this.textures.ganeshaFrontFrames = [this.textures.ganeshaFront, this.textures.ganeshaFront, this.textures.ganeshaFront, this.textures.ganeshaFront];
    this.textures.mushikaBack = this.textures.ganeshaBack;
    this.textures.mushikaFront = this.textures.ganeshaFront;
    this.textures.mushikaBackFrames = [this.textures.ganeshaBack, this.textures.ganeshaBack, this.textures.ganeshaBack, this.textures.ganeshaBack];
    this.textures.mushikaFrontFrames = [this.textures.ganeshaFront, this.textures.ganeshaFront, this.textures.ganeshaFront, this.textures.ganeshaFront];
    this.textures.shivaBack = this.generateProceduralShivaBack();
    this.textures.shivaFront = this.generateProceduralShivaFront();
    this.textures.shivaBackFrames = [this.textures.shivaBack, this.textures.shivaBack, this.textures.shivaBack, this.textures.shivaBack];
    this.textures.helicopter = this.generateProceduralHelicopter();
    this.textures.kailasaSign = this.generateProceduralKailasaSign();
    this.textures.policeBarricade = this.generateProceduralPoliceBarricade();
    this.textures.trainLocoSide = this.generateProceduralTrainLocomotiveTexture();
    this.textures.trainCoachSide = this.generateProceduralTrainCoachTexture();
    this.textures.trainFrontFace = this.generateProceduralTrainFrontFaceTexture();
  }

  // --- Create Crystal-Clear, Rock-Solid Photorealistic Character Texture (Zero Jitter, Zero Shaking) ---
  createRunningGaitFrames(img) {
    const W = img.naturalWidth || img.width || 1024;
    const H = img.naturalHeight || img.height || 1536;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;

    // Return the pristine HD texture for all frame indices (eliminates all texture-flipping shaking)
    return [tex, tex, tex, tex];
  }

  // --- Load Reference Images and Extract Ultra-Realistic Cutouts ---
  loadAndExtractTextures() {
    let loadedCount = 0;
    const totalExpected = 7;
    const checkAll = () => {
      loadedCount++;
      if (loadedCount >= totalExpected) {
        this.notifyReady();
      }
    };

    // 1. Primary Dedicated High-Res Human Running Bal Ganesha Asset (Rear View media_1789563458964.png)
    const imgGaneshaBack = new Image();
    imgGaneshaBack.crossOrigin = 'anonymous';
    imgGaneshaBack.onload = () => {
      try {
        const frames = this.createRunningGaitFrames(imgGaneshaBack, true, 0.505);
        this.textures.ganeshaBackFrames = frames;
        this.textures.ganeshaBack = frames[0];
        this.ganeshaDedicatedLoaded = true;
        this.notifyReady();
      } catch (err) {
        console.warn('Error processing human running back ganesha texture:', err);
      }
      checkAll();
    };
    imgGaneshaBack.onerror = (e) => {
      console.warn('Could not load GANESHA_BACK_RUN_URL:', e);
      checkAll();
    };
    imgGaneshaBack.src = GANESHA_BACK_RUN_URL;

    // 2. High-Res Human Running Bal Ganesha Asset (Front View media_1789563467919.png)
    const imgGaneshaFront = new Image();
    imgGaneshaFront.crossOrigin = 'anonymous';
    imgGaneshaFront.onload = () => {
      try {
        const frontFrames = this.createRunningGaitFrames(imgGaneshaFront, false, 0.52);
        this.textures.ganeshaFrontFrames = frontFrames;
        this.textures.ganeshaFront = frontFrames[0];
        this.notifyReady();
      } catch (err) {
        console.warn('Error processing human running front ganesha texture:', err);
      }
      checkAll();
    };
    imgGaneshaFront.onerror = (e) => {
      console.warn('Could not load GANESHA_FRONT_RUN_URL:', e);
      checkAll();
    };
    imgGaneshaFront.src = GANESHA_FRONT_RUN_URL;

    // 3. Primary Dedicated High-Res Sprinting Lord Shiva Asset (media_1789652475415.png)
    const imgShivaBack = new Image();
    imgShivaBack.crossOrigin = 'anonymous';
    imgShivaBack.onload = () => {
      try {
        const shivaFrames = this.createRunningGaitFrames(imgShivaBack, true, 0.52);
        this.textures.shivaBackFrames = shivaFrames;
        this.textures.shivaBack = shivaFrames[0];
        this.shivaDedicatedLoaded = true;
        this.notifyReady();
      } catch (err) {
        console.warn('Error processing Lord Shiva running texture:', err);
      }
      checkAll();
    };
    imgShivaBack.onerror = (e) => {
      console.warn('Could not load SHIVA_BACK_RUN_URL:', e);
      checkAll();
    };
    imgShivaBack.src = SHIVA_BACK_RUN_URL;

    // 4. Load Rear-View Image (for Kailasa Sign, Helicopter, fallbacks)
    const imgBack = new Image();
    imgBack.crossOrigin = 'anonymous';
    imgBack.onload = () => {
      try {
        if (!this.ganeshaDedicatedLoaded) {
          this.extractGaneshaBack(imgBack);
        }
        if (!this.shivaDedicatedLoaded) {
          this.extractShivaBack(imgBack);
        }
        this.extractKailasaSign(imgBack);
        this.extractHelicopter(imgBack);
      } catch (err) {
        console.warn('Error extracting textures from ref_back:', err);
      }
      checkAll();
    };
    imgBack.onerror = () => {
      console.warn('Could not load ref_back.jpg, using procedural fallback.');
      checkAll();
    };
    imgBack.src = REF_BACK_URL;

    // 5. Load Front-View Image (for Lord Shiva front, Police Barricade)
    const imgFront = new Image();
    imgFront.crossOrigin = 'anonymous';
    imgFront.onload = () => {
      try {
        this.extractShivaFront(imgFront);
        this.extractPoliceBarricade(imgFront);
      } catch (err) {
        console.warn('Error extracting textures from ref_front:', err);
      }
      checkAll();
    };
    imgFront.onerror = () => {
      console.warn('Could not load ref_front.jpg, using procedural fallback.');
      checkAll();
    };
    imgFront.src = REF_FRONT_URL;

    // 6. Mushika Vahana Front Texture (media_1789844545415.png front pose)
    const imgMushikaFront = new Image();
    imgMushikaFront.crossOrigin = 'anonymous';
    imgMushikaFront.onload = () => {
      try {
        const frontFrames = this.createRunningGaitFrames(imgMushikaFront);
        this.textures.mushikaFrontFrames = frontFrames;
        this.textures.mushikaFront = frontFrames[0];
        this.notifyReady();
      } catch (err) {
        console.warn('Error processing mushika front texture:', err);
      }
      checkAll();
    };
    imgMushikaFront.onerror = (e) => {
      console.warn('Could not load MUSHIKA_FRONT_URL:', e);
      checkAll();
    };
    imgMushikaFront.src = MUSHIKA_FRONT_URL;

    // 7. Mushika Vahana Rear Running Texture (media_1789844545415.png back running pose)
    const imgMushikaBack = new Image();
    imgMushikaBack.crossOrigin = 'anonymous';
    imgMushikaBack.onload = () => {
      try {
        const backFrames = this.createRunningGaitFrames(imgMushikaBack);
        this.textures.mushikaBackFrames = backFrames;
        this.textures.mushikaBack = backFrames[0];
        this.notifyReady();
      } catch (err) {
        console.warn('Error processing mushika back texture:', err);
      }
      checkAll();
    };
    imgMushikaBack.onerror = (e) => {
      console.warn('Could not load MUSHIKA_BACK_URL:', e);
      checkAll();
    };
    imgMushikaBack.src = MUSHIKA_BACK_URL;
  }

  // --- Helper to Crop & Apply Smooth Silhouette Mask ---
  cropAndMask(img, normBox, featherRadius = 6) {
    const W = img.naturalWidth || img.width || 1024;
    const H = img.naturalHeight || img.height || 1152;

    const sx = Math.floor(normBox.x * W);
    const sy = Math.floor(normBox.y * H);
    const sw = Math.floor(normBox.w * W);
    const sh = Math.floor(normBox.h * H);

    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');

    // Draw the cropped portion
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    // Apply soft vignette / transparent border feathering to blend seamlessly
    const imgData = ctx.getImageData(0, 0, sw, sh);
    const data = imgData.data;

    const edgeDist = Math.max(8, featherRadius);
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const idx = (y * sw + x) * 4;

        // Calculate distance to canvas bounding box edges
        const dx = Math.min(x, sw - 1 - x);
        const dy = Math.min(y, sh - 1 - y);
        const d = Math.min(dx, dy);

        if (d < edgeDist) {
          const alphaFactor = Math.pow(d / edgeDist, 1.4);
          data[idx + 3] = Math.round(data[idx + 3] * alphaFactor);
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }

  // --- Extract Bal Ganesha Running (Rear View) ---
  extractGaneshaBack(img) {
    // Exact crop box from media_1789322377671.jpg
    const tex = this.cropAndMask(img, {
      x: 0.505,
      y: 0.335,
      w: 0.225,
      h: 0.285
    }, 8);
    this.textures.ganeshaBack = tex;
  }

  // --- Extract Lord Shiva Chasing (Rear View) ---
  extractShivaBack(img) {
    // Exact crop box of Lord Shiva from media_1789322377671.jpg
    const tex = this.cropAndMask(img, {
      x: 0.085,
      y: 0.265,
      w: 0.485,
      h: 0.720
    }, 10);
    this.textures.shivaBack = tex;
  }

  // --- Extract Bal Ganesha Running (Front View) ---
  extractGaneshaFront(img) {
    // Exact crop box from media_1789322962129.jpg
    const tex = this.cropAndMask(img, {
      x: 0.435,
      y: 0.410,
      w: 0.340,
      h: 0.480
    }, 10);
    this.textures.ganeshaFront = tex;
  }

  // --- Extract Lord Shiva Chasing (Front View) ---
  extractShivaFront(img) {
    // Exact crop box from media_1789322962129.jpg
    const tex = this.cropAndMask(img, {
      x: 0.290,
      y: 0.150,
      w: 0.260,
      h: 0.495
    }, 8);
    this.textures.shivaFront = tex;
  }

  // --- Extract Helicopter ---
  extractHelicopter(img) {
    const tex = this.cropAndMask(img, {
      x: 0.255,
      y: 0.015,
      w: 0.165,
      h: 0.125
    }, 6);
    this.textures.helicopter = tex;
  }

  // --- Extract Kailasa Sign ---
  extractKailasaSign(img) {
    const tex = this.cropAndMask(img, {
      x: 0.090,
      y: 0.165,
      w: 0.160,
      h: 0.095
    }, 4);
    this.textures.kailasaSign = tex;
  }

  // --- Extract Police Barricade ---
  extractPoliceBarricade(img) {
    // Keep ultra-vivid procedural high-contrast hazard barricade for maximum visibility
    if (!this.textures.policeBarricade) {
      this.textures.policeBarricade = this.generateProceduralPoliceBarricade();
    }
  }

  // =========================================================================
  // HIGH-RESOLUTION PROCEDURAL FALLBACK GENERATORS (Canvas Painted Art)
  // =========================================================================

  generateProceduralGaneshaBack() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    // 1. Golden Mukut (Crown - Back View)
    const crownGrad = ctx.createLinearGradient(160, 40, 350, 200);
    crownGrad.addColorStop(0, '#ffe57f');
    crownGrad.addColorStop(0.5, '#ffb300');
    crownGrad.addColorStop(1, '#ff6f00');
    ctx.fillStyle = crownGrad;
    ctx.beginPath();
    ctx.moveTo(256, 40); // Top Kalasha
    ctx.lineTo(340, 210);
    ctx.lineTo(172, 210);
    ctx.closePath();
    ctx.fill();

    // Crown Jewels & Filigree
    ctx.strokeStyle = '#fff8e1';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Ruby Gem in Crown
    ctx.fillStyle = '#d90429';
    ctx.beginPath();
    ctx.arc(256, 140, 18, 0, Math.PI * 2);
    ctx.fill();

    // 2. Translucent Fluttering Vermillion Silk Scarf (Angavastram)
    const scarfGrad = ctx.createLinearGradient(100, 180, 400, 360);
    scarfGrad.addColorStop(0, '#e53935');
    scarfGrad.addColorStop(0.5, '#d32f2f');
    scarfGrad.addColorStop(1, '#b71c1c');
    ctx.fillStyle = scarfGrad;
    ctx.beginPath();
    ctx.moveTo(180, 220);
    ctx.bezierCurveTo(90, 250, 70, 340, 120, 380);
    ctx.bezierCurveTo(160, 350, 180, 300, 200, 250);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(330, 220);
    ctx.bezierCurveTo(420, 250, 440, 340, 390, 380);
    ctx.bezierCurveTo(350, 350, 330, 300, 310, 250);
    ctx.closePath();
    ctx.fill();

    // 3. Chubby Baby Arms & Shoulders (Divine Terracotta Skin)
    const skinGrad = ctx.createRadialGradient(256, 260, 20, 256, 260, 160);
    skinGrad.addColorStop(0, '#ffd1a4');
    skinGrad.addColorStop(0.7, '#f4a261');
    skinGrad.addColorStop(1, '#e76f51');
    ctx.fillStyle = skinGrad;

    // Head / Neck base
    ctx.beginPath();
    ctx.arc(256, 230, 75, 0, Math.PI * 2);
    ctx.fill();

    // Flapped Ears back
    ctx.beginPath();
    ctx.ellipse(150, 220, 65, 45, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(362, 220, 65, 45, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Torso / Back
    ctx.beginPath();
    ctx.ellipse(256, 330, 95, 105, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Golden Saffron Silk Dhoti with Red Waistband and Gold Brocade
    const dhotiGrad = ctx.createLinearGradient(160, 360, 350, 520);
    dhotiGrad.addColorStop(0, '#f9a825');
    dhotiGrad.addColorStop(0.5, '#f57f17');
    dhotiGrad.addColorStop(1, '#e65100');
    ctx.fillStyle = dhotiGrad;
    ctx.beginPath();
    ctx.moveTo(170, 360);
    ctx.lineTo(342, 360);
    ctx.lineTo(360, 500);
    ctx.lineTo(152, 500);
    ctx.closePath();
    ctx.fill();

    // Red Waistband & Ruby Buckle
    ctx.fillStyle = '#d90429';
    ctx.fillRect(168, 355, 176, 22);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(256, 366, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d90429';
    ctx.beginPath();
    ctx.arc(256, 366, 6, 0, Math.PI * 2);
    ctx.fill();

    // Gold borders (Zari)
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(152, 500);
    ctx.lineTo(360, 500);
    ctx.stroke();

    // 5. Cute Baby Running Legs & Shoes
    ctx.fillStyle = skinGrad;
    // Left leg kicking back
    ctx.beginPath();
    ctx.ellipse(200, 530, 30, 45, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Right leg
    ctx.beginPath();
    ctx.ellipse(310, 545, 28, 40, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Running Shoes (White & Brown Sole)
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.ellipse(205, 575, 28, 16, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    ctx.ellipse(315, 582, 26, 15, -0.1, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  generateProceduralGaneshaFront() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    // 1. Golden Mukut with Gemstones
    const crownGrad = ctx.createLinearGradient(160, 30, 350, 180);
    crownGrad.addColorStop(0, '#fff59d');
    crownGrad.addColorStop(0.5, '#ffd54f');
    crownGrad.addColorStop(1, '#ff8f00');
    ctx.fillStyle = crownGrad;
    ctx.beginPath();
    ctx.moveTo(256, 30);
    ctx.lineTo(345, 190);
    ctx.lineTo(167, 190);
    ctx.closePath();
    ctx.fill();

    // Crown Carvings & Ruby
    ctx.fillStyle = '#d90429';
    ctx.beginPath();
    ctx.arc(256, 125, 20, 0, Math.PI * 2);
    ctx.fill();

    // 2. Cute Baby Elephant Face & Ears
    const skinGrad = ctx.createRadialGradient(256, 260, 30, 256, 260, 180);
    skinGrad.addColorStop(0, '#ffd8b5');
    skinGrad.addColorStop(0.6, '#f8ad80');
    skinGrad.addColorStop(1, '#e58055');
    ctx.fillStyle = skinGrad;

    // Ears
    ctx.beginPath();
    ctx.ellipse(135, 260, 75, 60, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(377, 260, 75, 60, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Inner Ears Pink
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.ellipse(135, 260, 50, 40, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(377, 260, 50, 40, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = skinGrad;
    ctx.beginPath();
    ctx.arc(256, 260, 95, 0, Math.PI * 2);
    ctx.fill();

    // Auspicious Big Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(205, 235, 20, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(307, 235, 20, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(210, 235, 14, 0, Math.PI * 2);
    ctx.arc(302, 235, 14, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(206, 230, 5, 0, Math.PI * 2);
    ctx.arc(298, 230, 5, 0, Math.PI * 2);
    ctx.fill();

    // Curved Trunk with Red "ॐ" (Om)
    ctx.fillStyle = skinGrad;
    ctx.beginPath();
    ctx.moveTo(230, 280);
    ctx.bezierCurveTo(225, 360, 285, 410, 320, 390);
    ctx.bezierCurveTo(345, 370, 320, 330, 280, 340);
    ctx.bezierCurveTo(270, 320, 275, 280, 282, 280);
    ctx.closePath();
    ctx.fill();

    // Sacred Om & Tilak on Forehead
    ctx.fillStyle = '#d90429';
    ctx.font = 'bold 26px "Segoe UI Symbol", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ॐ', 268, 350);

    // 3. Golden Necklaces & Red Silk Dhoti
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(256, 380, 60, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.moveTo(170, 420);
    ctx.lineTo(342, 420);
    ctx.lineTo(365, 550);
    ctx.lineTo(147, 550);
    ctx.closePath();
    ctx.fill();

    // Running Shoes Front
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.ellipse(256, 595, 36, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  generateProceduralShivaBack() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    // 1. Wild Flowing Dark Jata Locks & Crescent Moon
    ctx.fillStyle = '#211714';
    ctx.beginPath();
    ctx.moveTo(256, 60);
    ctx.bezierCurveTo(180, 70, 130, 160, 140, 270);
    ctx.bezierCurveTo(180, 320, 330, 320, 370, 270);
    ctx.bezierCurveTo(380, 160, 330, 70, 256, 60);
    ctx.closePath();
    ctx.fill();

    // Silver Crescent Moon (Chandra)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(310, 100, 24, 0.8, Math.PI * 1.8);
    ctx.closePath();
    ctx.fill();

    // 2. Coiled King Cobra (Vasuki) on right shoulder
    ctx.fillStyle = '#1b4332';
    ctx.beginPath();
    ctx.ellipse(335, 220, 35, 25, 0.4, 0, Math.PI * 2);
    ctx.fill();
    // Snake hood
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.ellipse(350, 195, 20, 30, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 3. Powerful Muscular Athletic Back (Divine Blue Skin)
    const shivaSkin = ctx.createLinearGradient(160, 180, 350, 480);
    shivaSkin.addColorStop(0, '#c7d8e8');
    shivaSkin.addColorStop(0.5, '#a2bdd4');
    shivaSkin.addColorStop(1, '#84a5c0');
    ctx.fillStyle = shivaSkin;

    // Torso / Back Musculature
    ctx.beginPath();
    ctx.moveTo(180, 210); // Left shoulder
    ctx.lineTo(330, 210); // Right shoulder
    ctx.lineTo(315, 380); // Waist right
    ctx.lineTo(195, 380); // Waist left
    ctx.closePath();
    ctx.fill();

    // Muscle shadow lines (Scapulae & Spine)
    ctx.strokeStyle = '#6889a6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(256, 215);
    ctx.lineTo(256, 375);
    ctx.stroke();

    // Left Arm Swinging Back (Muscular Deltoid & Bicep)
    ctx.fillStyle = shivaSkin;
    ctx.beginPath();
    ctx.ellipse(145, 280, 32, 70, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Rudraksha bracelet on arm
    ctx.fillStyle = '#5c2c16';
    ctx.fillRect(125, 280, 40, 12);

    // 4. Leopard / Tiger Skin Pelt (Vyaghracharma) Wrap
    const tigerGrad = ctx.createLinearGradient(170, 350, 340, 520);
    tigerGrad.addColorStop(0, '#f39c12');
    tigerGrad.addColorStop(0.6, '#e67e22');
    tigerGrad.addColorStop(1, '#d35400');
    ctx.fillStyle = tigerGrad;

    ctx.beginPath();
    ctx.moveTo(185, 370);
    ctx.lineTo(325, 370);
    ctx.lineTo(350, 520);
    ctx.lineTo(160, 520);
    ctx.closePath();
    ctx.fill();

    // Tiger Fur Rosettes / Spots
    ctx.fillStyle = '#2c1810';
    for (let r = 0; r < 24; r++) {
      const rx = 185 + Math.random() * 140;
      const ry = 385 + Math.random() * 120;
      ctx.beginPath();
      ctx.arc(rx, ry, 6 + Math.random() * 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shaggy fur trim border
    ctx.fillStyle = '#fff8e7';
    for (let b = 160; b <= 350; b += 12) {
      ctx.beginPath();
      ctx.arc(b, 520, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Bare Muscular Running Legs in Athletic Stride
    ctx.fillStyle = shivaSkin;
    // Front leg pumping forward
    ctx.beginPath();
    ctx.ellipse(285, 590, 32, 75, 0.15, 0, Math.PI * 2);
    ctx.fill();
    // Back leg trailing
    ctx.beginPath();
    ctx.ellipse(215, 630, 28, 65, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // 6. Golden Trishula (Trident) Held Upright
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(110, 40);
    ctx.lineTo(110, 420);
    ctx.stroke();

    // 3 Prongs of Trishula
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.moveTo(110, 20); // Center spearhead
    ctx.lineTo(122, 60);
    ctx.lineTo(98, 60);
    ctx.closePath();
    ctx.fill();
    // Left & right prongs
    ctx.beginPath();
    ctx.arc(80, 50, 16, 0, Math.PI);
    ctx.arc(140, 50, 16, 0, Math.PI);
    ctx.fill();

    // Red ribbons on Damru
    ctx.fillStyle = '#d90429';
    ctx.fillRect(95, 120, 30, 22);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  generateProceduralShivaFront() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    // Shiva Skin
    const shivaSkin = ctx.createLinearGradient(160, 140, 350, 420);
    shivaSkin.addColorStop(0, '#cce0f0');
    shivaSkin.addColorStop(0.5, '#a4c2dc');
    shivaSkin.addColorStop(1, '#81a3c1');

    // Head
    ctx.fillStyle = shivaSkin;
    ctx.beginPath();
    ctx.arc(256, 175, 65, 0, Math.PI * 2);
    ctx.fill();

    // Jata Hair & Crescent Moon
    ctx.fillStyle = '#211714';
    ctx.beginPath();
    ctx.arc(256, 105, 55, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(285, 80, 20, 0.8, Math.PI * 1.8);
    ctx.closePath();
    ctx.fill();

    // Third Eye & Tripundra Marks
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(230, 145, 52, 4);
    ctx.fillRect(230, 153, 52, 4);
    ctx.fillRect(230, 161, 52, 4);
    // Third Eye vertical red
    ctx.fillStyle = '#d90429';
    ctx.beginPath();
    ctx.ellipse(256, 153, 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(225, 180, 14, 8, -0.1, 0, Math.PI * 2);
    ctx.ellipse(287, 180, 14, 8, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // King Cobra on neck with raised hood
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.ellipse(190, 220, 24, 38, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Muscular Chest
    ctx.fillStyle = shivaSkin;
    ctx.beginPath();
    ctx.moveTo(175, 230);
    ctx.lineTo(337, 230);
    ctx.lineTo(315, 390);
    ctx.lineTo(195, 390);
    ctx.closePath();
    ctx.fill();

    // Tiger Skin Wrap Across Chest & Waist
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.moveTo(175, 230);
    ctx.lineTo(240, 230);
    ctx.lineTo(330, 390);
    ctx.lineTo(190, 390);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  generateProceduralHelicopter() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Fuselage (Navy Blue Police Chopper)
    ctx.fillStyle = '#0d1b2a';
    ctx.beginPath();
    ctx.ellipse(120, 65, 60, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit windshield
    ctx.fillStyle = '#48cae4';
    ctx.beginPath();
    ctx.arc(150, 60, 18, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // Tail boom & Tail rotor
    ctx.fillStyle = '#1b263b';
    ctx.fillRect(20, 58, 60, 10);
    ctx.fillRect(15, 40, 8, 40);

    // Main Rotor
    ctx.fillStyle = '#e0e1dd';
    ctx.fillRect(60, 32, 130, 6);

    // Spotlight beam below
    const grad = ctx.createLinearGradient(140, 80, 140, 128);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(135, 80);
    ctx.lineTo(100, 128);
    ctx.lineTo(180, 128);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  generateProceduralKailasaSign() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Yellow Caution Signboard with Black Border (Exact match from reference!)
    ctx.fillStyle = '#ffb703';
    ctx.fillRect(0, 0, 256, 128);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, 240, 112);

    ctx.fillStyle = '#000000';
    ctx.font = '900 32px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KAILASA', 128, 55);

    // Arrow pointing right
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(80, 88);
    ctx.lineTo(160, 88);
    ctx.lineTo(145, 75);
    ctx.moveTo(160, 88);
    ctx.lineTo(145, 101);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  generateProceduralPoliceBarricade() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // 1. High-Visibility Reflective White Base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 256);

    // 2. High-Voltage Fluorescent Safety Red Diagonal Hazard Stripes
    ctx.fillStyle = '#ff0038';
    for (let x = -200; x < 700; x += 70) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 40, 0);
      ctx.lineTo(x - 30, 256);
      ctx.lineTo(x - 70, 256);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Top and Bottom Yellow/Black Hazard Warning Borders
    const drawHazardBorder = (y) => {
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(0, y, 512, 24);
      ctx.fillStyle = '#111111';
      for (let bx = -20; bx < 540; bx += 36) {
        ctx.beginPath();
        ctx.moveTo(bx, y);
        ctx.lineTo(bx + 18, y);
        ctx.lineTo(bx + 8, y + 24);
        ctx.lineTo(bx - 10, y + 24);
        ctx.closePath();
        ctx.fill();
      }
    };
    drawHazardBorder(0);
    drawHazardBorder(232);

    // 4. Center Bold High-Contrast "POLICE - STOP" Emblem
    ctx.fillStyle = '#0a2540';
    ctx.fillRect(66, 56, 380, 144);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 8;
    ctx.strokeRect(66, 56, 380, 144);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px "Arial Black", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('POLICE', 256, 108);

    ctx.fillStyle = '#ffea00';
    ctx.font = '900 26px "Arial Black", sans-serif';
    ctx.fillText('⚠ DANGER / JUMP ⚠', 256, 160);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  generateProceduralTrainLocomotiveTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 1. Deep Electric Royal Blue Locomotive Base
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0a2e68');
    grad.addColorStop(0.5, '#0047ab');
    grad.addColorStop(1, '#002966');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // 2. High-Visibility Safety Hazard Yellow Cheat-Line & Chevron Band
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(0, 200, 1024, 110);

    // White Pinstripe Borders
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 194, 1024, 6);
    ctx.fillRect(0, 310, 1024, 6);

    // 3. Indian Railways Iconic Angled Hazard Chevron on Front Section (Left side)
    ctx.fillStyle = '#ff0038';
    for (let x = 780; x < 1030; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 200);
      ctx.lineTo(x + 18, 200);
      ctx.lineTo(x - 8, 310);
      ctx.lineTo(x - 26, 310);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Heavy Steel Dynamic Louvers & Air Intake Vents
    ctx.fillStyle = '#141e30';
    for (let vx of [120, 260, 420]) {
      ctx.fillRect(vx, 70, 110, 100);
      ctx.fillStyle = '#243b55';
      for (let s = 76; s < 165; s += 8) {
        ctx.fillRect(vx + 4, s, 102, 3);
      }
      ctx.fillStyle = '#141e30';
    }

    // 5. Official Indian Railways Typography (Devnagari & English)
    ctx.fillStyle = '#0a2540';
    ctx.font = '900 36px "Arial Black", Impact, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('भारतीय रेल', 560, 245);
    ctx.font = '900 34px "Arial Black", Impact, sans-serif';
    ctx.fillText('INDIAN RAILWAYS', 560, 290);

    // Locomotive Class & Road Number
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px "Arial Black", monospace, sans-serif';
    ctx.fillText('WAP-7', 80, 272);
    ctx.font = '900 24px "Arial Black", monospace, sans-serif';
    ctx.fillText('30201 • ELS / RPM', 80, 430);

    // 6. High-Voltage Danger Lightning Badge (25kV AC)
    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.moveTo(40, 100);
    ctx.lineTo(90, 100);
    ctx.lineTo(65, 145);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d90429';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#d90429';
    ctx.beginPath();
    ctx.moveTo(66, 106);
    ctx.lineTo(58, 122);
    ctx.lineTo(67, 122);
    ctx.lineTo(60, 138);
    ctx.lineTo(72, 120);
    ctx.lineTo(64, 120);
    ctx.closePath();
    ctx.fill();

    // 7. Structural Panel Rivets & Seams
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    for (let px = 80; px < 1000; px += 180) {
      ctx.beginPath();
      ctx.moveTo(px, 40);
      ctx.lineTo(px, 480);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  generateProceduralTrainCoachTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // 1. Classic Indian Railways Two-Tone Livery (Ultramarine Blue + Sky Blue Window Band)
    ctx.fillStyle = '#002966';
    ctx.fillRect(0, 0, 1024, 256);

    // Sky Blue Window Band
    ctx.fillStyle = '#2176ff';
    ctx.fillRect(0, 52, 1024, 132);

    // Cream / Yellow Hazard Pinstripes
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(0, 46, 1024, 6);
    ctx.fillRect(0, 184, 1024, 6);

    // 2. Rows of Realistic Passenger Windows with Aluminum Frames and Warm Interior Lighting
    const winWidth = 68;
    const winHeight = 78;
    const startX = 140;
    const gap = 18;

    for (let i = 0; i < 9; i++) {
      const wx = startX + i * (winWidth + gap);
      // Aluminum Outer Gasket
      ctx.fillStyle = '#ced4da';
      ctx.fillRect(wx - 3, 76, winWidth + 6, winHeight + 6);

      // Dark Tinted Glass with Warm Amber Glow inside
      const winGrad = ctx.createLinearGradient(wx, 80, wx, 80 + winHeight);
      winGrad.addColorStop(0, '#102a43');
      winGrad.addColorStop(0.4, '#ffbe0b');
      winGrad.addColorStop(0.7, '#f4a261');
      winGrad.addColorStop(1, '#0b192c');
      ctx.fillStyle = winGrad;
      ctx.fillRect(wx, 79, winWidth, winHeight);

      // Window Glass Reflection Diagonal Glare
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.beginPath();
      ctx.moveTo(wx + 10, 79);
      ctx.lineTo(wx + 28, 79);
      ctx.lineTo(wx + 8, 79 + winHeight);
      ctx.lineTo(wx - 10, 79 + winHeight);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Side Passenger Doors with Hazard Stripes
    for (let dx of [30, 930]) {
      ctx.fillStyle = '#001d4a';
      ctx.fillRect(dx, 36, 68, 195);
      ctx.strokeStyle = '#ffea00';
      ctx.lineWidth = 3;
      ctx.strokeRect(dx, 36, 68, 195);

      // Door window
      ctx.fillStyle = '#8ecae6';
      ctx.fillRect(dx + 16, 52, 36, 55);
    }

    // 4. Coach Destination Nameboard Banner & Road Number
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(360, 198, 310, 32);
    ctx.strokeStyle = '#ffea00';
    ctx.lineWidth = 2;
    ctx.strokeRect(360, 198, 310, 32);

    ctx.fillStyle = '#002966';
    ctx.font = '900 16px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPECIAL EXPRESS • KANYAKUMARI', 515, 220);

    ctx.fillStyle = '#ffea00';
    ctx.font = '900 20px "Arial Black", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SLEEPER CLASS • S-4', 140, 224);
    ctx.fillText('21456 / C', 800, 224);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  generateProceduralTrainFrontFaceTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 1. Royal Blue Nose Base
    ctx.fillStyle = '#003580';
    ctx.fillRect(0, 0, 512, 512);

    // 2. High-Impact Safety Hazard Yellow V-Chevron
    ctx.fillStyle = '#ffd000';
    ctx.beginPath();
    ctx.moveTo(0, 380);
    ctx.lineTo(256, 480);
    ctx.lineTo(512, 380);
    ctx.lineTo(512, 280);
    ctx.lineTo(256, 380);
    ctx.lineTo(0, 280);
    ctx.closePath();
    ctx.fill();

    // Red hazard accent stripe
    ctx.fillStyle = '#d90429';
    ctx.beginPath();
    ctx.moveTo(0, 395);
    ctx.lineTo(256, 495);
    ctx.lineTo(512, 395);
    ctx.lineTo(512, 415);
    ctx.lineTo(256, 512);
    ctx.lineTo(0, 415);
    ctx.closePath();
    ctx.fill();

    // 3. Indian Railways National Crest / Golden Emblem
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.arc(256, 230, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#002966';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#002966';
    ctx.beginPath();
    ctx.arc(256, 230, 20, 0, Math.PI * 2);
    ctx.fill();

    // 4. Locomotive Fleet Number "30201"
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(176, 305, 160, 38);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(176, 305, 160, 38);

    ctx.fillStyle = '#000000';
    ctx.font = '900 28px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('30201', 256, 334);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
}

export const characterTextures = new RealisticCharacterTextures();

