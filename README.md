# 🐘 3D Lord Bal Ganesha & Lord Shiva Endless Runner

A high-performance, original 3D endless runner web game built with **Three.js / WebGL** and real-time **Web Audio API** procedural sound synthesis.

---

## 🌟 Game Highlights

- **3D Bal Ganesha (Player)**:
  - Custom 3D segmented geometry with realistic 3D leg running stride and alternating arm swing.
  - Golden crown (Mukut), pearl necklaces, yellow dhoti, and a sacred golden aura.
  - Collects sacred **3D Motichoor Laddus** (crafted with glistening boondi spheres, silver leaf *chandi ka vark*, chopped pistachios, and almonds) and brass diyas.
- **Lord Shiva (The Playful Chaser)**:
  - Majestic 3D running posture with natural gait matching Ganesha's stride.
  - Golden Trishula (trident) with Damru drum, coiled King Cobra (Vasuki), and tiger skin pelt.
- **Dynamic Obstacle Progression**:
  - **First 20 Seconds**: Relaxed, spacious intro (32–38m spacing) allowing players to get accustomed to lane switching and jumping.
  - **Dynamic Wave Compression**: Gradually scales obstacle density down to 11.5m intervals as speed increases.
  - **Indian Railway Locomotives & Rickshaws**: Approaching blue electric trains, colorful auto-rickshaws, and police barricades.
- **Procedural Soundscapes**:
  - Real-time procedural audio synthesis for meditative Tanpura drone, Dhol/Tasha rhythms, Bansuri flute (Raga Bhoopali), temple bell chimes, Damru pulses, and metallic laddu pickups.
  - Zero external MP3/WAV dependencies.

---

## 🕹️ Controls

| Action | Desktop Keyboard | Mobile / Touch |
| :--- | :--- | :--- |
| **Change Lanes** | <kbd>A</kbd> / <kbd>D</kbd> or <kbd>←</kbd> / <kbd>→</kbd> | Swipe Left / Right |
| **Jump** | <kbd>W</kbd>, <kbd>↑</kbd>, or <kbd>Space</kbd> | Swipe Up |
| **Slide** | <kbd>S</kbd> or <kbd>↓</kbd> | Swipe Down |
| **Divine Mode** | <kbd>Space</kbd> (when 100% full) | Tap Divine Mode Button |
| **Pause** | <kbd>Esc</kbd> or <kbd>P</kbd> | Top-left Pause Icon |

---

## 🚀 Push to GitHub & Deploy Live

### Method 1: Instant Push (No Git CLI required)
1. Double-click **`PUSH_TO_GITHUB.bat`** and select option `1`.
2. Generate a token at [GitHub Settings > Tokens](https://github.com/settings/tokens) with `repo` scope.
3. Paste the token when prompted. The script automatically creates `ganesh-runner` on your GitHub account and uploads all files!

### Method 2: Git CLI
```bash
git init
git branch -M main
git add .
git commit -m "feat: 3D Bal Ganesha & Shiva runner"
git remote add origin https://github.com/YOUR_USERNAME/ganesh-runner.git
git push -u origin main
```

---

## 🌐 Automatic GitHub Pages Deployment
This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`).
1. In your GitHub repository, go to **Settings > Pages**.
2. Under **Build and deployment > Source**, select **GitHub Actions**.
3. Every push to `main` will automatically build and host your game at:
   `https://<YOUR_USERNAME>.github.io/ganesh-runner/`

---

## 💻 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.
