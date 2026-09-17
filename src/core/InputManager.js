// InputManager.js - Ultra-Responsive Mobile Swipe (Subway Surfers Style), Mouse Drag & Keyboard
export class InputManager {
  constructor() {
    this.controlMode = 'SWIPE'; // Pure swipe mode is default and rock-solid
    this.swipeThreshold = 24;   // Ultra-snappy 24px threshold for immediate reaction

    // Callbacks
    this.onMoveLeft = null;
    this.onMoveRight = null;
    this.onJump = null;
    this.onSlide = null;
    this.onPause = null;
    this.onActivateDivine = null;
    this.onTap = null;
    this.onAnyInput = null;

    // Touch tracking state
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.lastTapTime = 0;
    this.isSwiping = false;

    // Mouse drag tracking (for laptop trackpad/mouse swipe)
    this.isMouseDown = false;
    this.mouseStartX = 0;
    this.mouseStartY = 0;

    // Tilt (optional, disabled by default)
    this.hasTiltSensor = false;
    this.neutralGamma = 0;
    this.currentGamma = 0;
    this.lastTiltTriggerTime = 0;

    this.initTouch();
    this.initMouse();
    this.initKeyboard();
  }

  // --- Mobile Touch Swipes (Subway Surfers Style: Exactly 1 Track Per Swipe) ---
  initTouch() {
    const handleTouchStart = (e) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      this.touchStartX = t.clientX;
      this.touchStartY = t.clientY;
      this.touchStartTime = performance.now();
      this.hasTriggeredSwipe = false;
      this.isSwiping = true;

      this.onAnyInput?.();
    };

    const handleTouchMove = (e) => {
      if (!this.isSwiping || e.touches.length === 0) return;
      if (e.cancelable) e.preventDefault();

      // Lock: Exactly 1 action per swipe stroke (never jump 2 tracks!)
      if (this.hasTriggeredSwipe) return;

      const t = e.touches[0];
      const dx = t.clientX - this.touchStartX;
      const dy = t.clientY - this.touchStartY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) >= this.swipeThreshold) {
        this.hasTriggeredSwipe = true; // Locked until next stroke!

        if (absX > absY) {
          // Horizontal swipe: move to adjacent single sidetrack only
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
      }
    };

    const handleTouchEnd = (e) => {
      const now = performance.now();
      const dt = now - this.touchStartTime;

      if (!this.hasTriggeredSwipe && e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        const dist = Math.hypot(t.clientX - this.touchStartX, t.clientY - this.touchStartY);

        // Quick clean tap detection
        if (dt < 280 && dist < 18) {
          if (now - this.lastTapTime < 320) {
            this.onActivateDivine?.();
            this.lastTapTime = 0;
          } else {
            this.lastTapTime = now;
            this.onTap?.();
          }
        }
      }

      this.isSwiping = false;
      this.hasTriggeredSwipe = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', () => { 
      this.isSwiping = false; 
      this.hasTriggeredSwipe = false; 
    }, { passive: true });
  }

  // --- Mouse Drag / Swipe (for Laptop users) ---
  initMouse() {
    window.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.tagName === 'INPUT') {
        return;
      }

      this.isMouseDown = true;
      this.mouseStartX = e.clientX;
      this.mouseStartY = e.clientY;
      this.hasTriggeredMouseSwipe = false;
      this.onAnyInput?.();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isMouseDown || this.hasTriggeredMouseSwipe) return;

      const dx = e.clientX - this.mouseStartX;
      const dy = e.clientY - this.mouseStartY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) >= this.swipeThreshold + 4) {
        this.hasTriggeredMouseSwipe = true;
        if (absX > absY) {
          if (dx > 0) this.onMoveRight?.();
          else this.onMoveLeft?.();
        } else {
          if (dy < 0) this.onJump?.();
          else this.onSlide?.();
        }
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
      this.hasTriggeredMouseSwipe = false;
    });
  }

  // --- Keyboard (Desktop / Laptop) ---
  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;

      this.onAnyInput?.();

      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          e.preventDefault();
          this.onMoveLeft?.();
          break;
        case 'KeyD':
        case 'ArrowRight':
          e.preventDefault();
          this.onMoveRight?.();
          break;
        case 'KeyW':
        case 'ArrowUp':
          e.preventDefault();
          this.onJump?.();
          break;
        case 'Space':
          e.preventDefault();
          this.onJump?.();
          this.onActivateDivine?.();
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
      }
    });
  }

  setControlMode(mode) {
    this.controlMode = mode;
  }

  setSensitivity(level) {
    if (level === 'HIGH') this.swipeThreshold = 18;
    else if (level === 'LOW') this.swipeThreshold = 32;
    else this.swipeThreshold = 24;
  }
}
