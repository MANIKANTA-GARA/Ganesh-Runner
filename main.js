// main.js - Application Entry Point
import './style.css';
import { Game } from './src/core/Game.js';
import { UIManager } from './src/ui/UIManager.js';

function bootstrapGame() {
  try {
    const canvasContainer = document.getElementById('game-canvas-container');
    if (!canvasContainer) {
      setTimeout(bootstrapGame, 30);
      return;
    }

    const ui = new UIManager();
    const game = new Game(canvasContainer, ui);

    ui.setGame(game);
    ui.checkInitialScreen();
  } catch (err) {
    console.error('Fatal initialization error in Ganesh Runner:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapGame);
} else {
  bootstrapGame();
}
