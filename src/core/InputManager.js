// InputManager.js - Mobile Gyro Tilt, Swipe Gestures, and Desktop Keyboard
export class InputManager {
  constructor() {
    this.controlMode = 'HYBRID'; // 'TILT' | 'SWIPE' | 'HYBRID'
    this.sensitivity = 'MEDIUM'; // 'LOW' | 'MEDIUM' | 'HIGH'

    // Sensitivity threshold in degrees
    this.sensitivityThresholds = {
      LOW: 12,
      MEDIUM: 8,
      HIGH: 5
    };

    // Tilt Calibration (neutral angle)
    this.neutralGamma = 0;
    this.neutralBeta = 45; // Typical 45 degree holding angle
    this.currentGamma = 0;
    this.currentBeta = 0;
    this.hasTiltSensor = false;

    // Action callbacks
    this.onMoveLeft = null;
    this.onMoveRight = null;
    this.onJump = null;
    this.onSlide = null;
    this.onPause = null;
    this.onActivateDivine = null;
    this.onActivateTrunk = null;

    // Tilt debounce state
    this.tiltLaneOffset = 0; // -1, 0, +1
    this.lastTiltTriggerTime = 0;

    // Touch swipe tracking
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.minSwipeDistance = 30; // pixels
    this.maxSwipeTime = 600; // ms

    this.initKeyboard();
    this.initTouch();
    this.initTilt();
  }

  // --- Keyboard (Desktop) ---
  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Avoid reacting if user is typing in an input field (e.g. Name entry)
      if (e.target.tagName === 'INPUT') return;

      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          this.onMoveLeft?.();
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.onMoveRight?.();
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
          e.preventDefault();
          this.onJump?.();
          break;
        case 'KeyS':
        case 'ArrowDown':
          e.preventDefault();
          this.onSlide?.();
          break;
        case 'Escape':
        case 'KeyP':
          this.onPause?.();
          break;
        case 'KeyE':
        case 'KeyF':
          this.onActivateDivine?.();
          break;
        case 'KeyQ':
        case 'Digit1':
          this.onActivateTrunk?.();
          break;
      }
    });
  }

  // --- Touch Swipe (Mobile) ---
  initTouch() {
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = performance.now();
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 0) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - this.touchStartX;
      const dy = endY - this.touchStartY;
      const dt = performance.now() - this.touchStartTime;

      if (dt > this.maxSwipeTime) return;

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) < this.minSwipeDistance) {
        // Tap -> Divine mode activation if available
        this.onActivateDivine?.();
        return;
      }

      if (absX > absY) {
        // Horizontal swipe
        if (dx > 0) {
          this.onMoveRight?.();
        } else {
          this.onMoveLeft?.();
        }
      } else {
        // Vertical swipe
        if (dy < 0) {
          this.onJump?.();
        } else {
          this.onSlide?.();
        }
      }
    }, { passive: true });
  }

  // --- Mobile Tilt / Gyroscope ---
  initTilt() {
    // Request permission for iOS 13+ devices if needed
    const handleOrientation = (e) => {
      if (e.gamma !== null && e.gamma !== undefined) {
        this.hasTiltSensor = true;
        this.currentGamma = e.gamma;
        this.currentBeta = e.beta || 0;
        this.processTilt();
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  }

  requestTiltPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      return DeviceOrientationEvent.requestPermission()
        .then(response => response === 'granted')
        .catch(() => false);
    }
    return Promise.resolve(true);
  }

  calibratePhone() {
    this.neutralGamma = this.currentGamma;
    this.neutralBeta = this.currentBeta;
    return { gamma: this.neutralGamma, beta: this.neutralBeta };
  }

  processTilt() {
    if (this.controlMode === 'SWIPE') return; // Tilt disabled in pure swipe mode

    const now = performance.now();
    if (now - this.lastTiltTriggerTime < 240) return; // Prevent rapid flipping

    const threshold = this.sensitivityThresholds[this.sensitivity] || 8;
    const diffGamma = this.currentGamma - this.neutralGamma;

    if (diffGamma < -threshold) {
      // Tilted Left
      this.onMoveLeft?.();
      this.lastTiltTriggerTime = now;
    } else if (diffGamma > threshold) {
      // Tilted Right
      this.onMoveRight?.();
      this.lastTiltTriggerTime = now;
    }
  }

  setSensitivity(level) {
    if (this.sensitivityThresholds[level]) {
      this.sensitivity = level;
    }
  }

  setControlMode(mode) {
    this.controlMode = mode;
  }
}
