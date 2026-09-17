// ScoreManager.js - Scoring, Laddus, Multipliers, Persistence & Leaderboards
export class ScoreManager {
  constructor() {
    this.playerName = localStorage.getItem('ganesh_player_name') || '';
    this.highScore = parseInt(localStorage.getItem('ganesh_high_score') || '0', 10);
    this.bestDistance = parseInt(localStorage.getItem('ganesh_best_distance') || '0', 10);
    this.isTutorialDone = localStorage.getItem('ganesh_tutorial_done') === 'true';

    this.score = 0;
    this.distance = 0;
    this.coins = 0;
    this.laddus = 0;
    this.diyas = 0;
    this.flowers = 0;
    this.streak = 0;
    this.isNewHighScore = false;
    this.totalCoins = parseInt(localStorage.getItem('ganesh_total_coins') || '0', 10);

    this.globalLeaderboard = [
      { rank: 1, name: 'Arjun_Devotee', distance: 3420, score: 98400 },
      { rank: 2, name: 'Aarav_Runner', distance: 2950, score: 79250 },
      { rank: 3, name: 'Diya_Ganesh', distance: 2480, score: 65100 },
      { rank: 4, name: 'Rohan_Swift', distance: 1820, score: 48900 },
      { rank: 5, name: 'Ananya_Bhakti', distance: 1450, score: 36200 }
    ];
  }

  // Alias for compatibility
  get modaks() {
    return this.laddus;
  }
  set modaks(val) {
    this.laddus = val;
  }

  setPlayerName(name) {
    const clean = (name || '').trim().slice(0, 15);
    if (clean.length > 0) {
      this.playerName = clean;
      localStorage.setItem('ganesh_player_name', clean);
    }
  }

  getPlayerName() {
    return this.playerName || 'Divine Runner';
  }

  hasPlayerName() {
    return this.playerName.length > 0;
  }

  addDistance(distDelta, multiplier = 1) {
    this.distance += distDelta;
    this.score += Math.round(distDelta * 10 * multiplier);
  }

  addCoin(multiplier = 1) {
    this.coins += 1 * multiplier;
    this.streak++;
    const streakBonus = Math.min(50, this.streak * 2);
    this.score += (100 + streakBonus) * multiplier;
  }

  addLaddu(multiplier = 1) {
    this.laddus++;
    this.streak++;
    const streakBonus = Math.min(50, this.streak * 2);
    this.score += (150 + streakBonus) * multiplier;
  }

  addModak(multiplier = 1) {
    this.addLaddu(multiplier);
  }

  addDiya(multiplier = 1) {
    this.diyas++;
    this.score += 250 * multiplier;
  }

  addFlower(multiplier = 1) {
    this.flowers++;
    this.score += 150 * multiplier;
  }

  finalizeRun() {
    this.isNewHighScore = this.score > this.highScore;
    if (this.isNewHighScore) {
      this.highScore = this.score;
      localStorage.setItem('ganesh_high_score', this.highScore.toString());
    }
    if (this.distance > this.bestDistance) {
      this.bestDistance = Math.floor(this.distance);
      localStorage.setItem('ganesh_best_distance', this.bestDistance.toString());
    }

    this.totalCoins += this.coins;
    localStorage.setItem('ganesh_total_coins', this.totalCoins.toString());

    this.saveToLocalHistory({
      date: new Date().toLocaleDateString(),
      score: this.score,
      distance: Math.floor(this.distance),
      coins: this.coins,
      laddus: this.laddus
    });
  }

  saveToLocalHistory(runData) {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('ganesh_local_history') || '[]');
    } catch (e) {
      history = [];
    }
    history.push(runData);
    history.sort((a, b) => b.score - a.score);
    if (history.length > 10) history = history.slice(0, 10);
    localStorage.setItem('ganesh_local_history', JSON.stringify(history));
  }

  getLocalLeaderboard() {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('ganesh_local_history') || '[]');
    } catch (e) {
      history = [];
    }
    return history.map((item, idx) => ({
      rank: idx + 1,
      name: this.getPlayerName(),
      distance: item.distance,
      score: item.score
    }));
  }

  getCombinedGlobalLeaderboard() {
    const list = [...this.globalLeaderboard];
    if (this.highScore > 0) {
      list.push({
        rank: 0,
        name: this.getPlayerName() + ' (YOU)',
        distance: this.bestDistance,
        score: this.highScore,
        isCurrentPlayer: true
      });
    }
    list.sort((a, b) => b.score - a.score);
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }

  setTutorialDone() {
    this.isTutorialDone = true;
    localStorage.setItem('ganesh_tutorial_done', 'true');
  }

  reset() {
    this.score = 0;
    this.distance = 0;
    this.coins = 0;
    this.laddus = 0;
    this.diyas = 0;
    this.flowers = 0;
    this.streak = 0;
    this.isNewHighScore = false;
  }
}
