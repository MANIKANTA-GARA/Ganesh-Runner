// main.js - Application Entry Point
import './style.css';
import { Game } from './src/core/Game.js';
import { UIManager } from './src/ui/UIManager.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvasContainer = document.getElementById('game-canvas-container');
  const ui = new UIManager();
  const game = new Game(canvasContainer, ui);

  ui.setGame(game);
  ui.checkInitialScreen();
});
