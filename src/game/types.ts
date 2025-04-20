// ゲーム設定の型定義
export interface GameSettings {
  playerSpeed: number;
  missileSpeed: number;
  missileReloadTime: number;
  enemySpeed: {
    basic: number;
    fast: number;
    zigzag: number;
    boss: number;
  };
  enemySpawnRate: number;
  backgroundColor: string;
  specialEnemyChance: number;
  bossEnemyChance: number;
  powerUpChance: number;
}

// プレイヤーの型定義
export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  missiles: Missile[];
  lastFireTime: number;
  score: number;
  lives: number;
  invincible: boolean;
  invincibleTimer: number;
  powerUp: boolean;
  powerUpTimer: number;
}

// ミサイルの型定義
export interface Missile {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speed: number;
}

// 敵の型定義
export interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  health: number;
  points: number;
  type: EnemyType;
  alpha: number;
}

// 敵タイプの型定義
export interface EnemyType {
  width: number;
  height: number;
  color: string;
  health: number;
  points: number;
  move: (enemy: Enemy) => void;
}

// パワーアップアイテムの型定義
export interface PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: PowerUpType;
  speed: number;
}

// パワーアップタイプの型定義
export interface PowerUpType {
  width: number;
  height: number;
  color: string;
  effect: () => void;
}

// 星の型定義
export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

// ゲーム状態の型定義
export interface GameState {
  player: Player;
  enemies: Enemy[];
  powerUps: PowerUp[];
  stars: Star[];
  keys: { [key: string]: boolean };
  gameOver: boolean;
  isPaused: boolean;
}