import { 
  GameSettings, 
  Player, 
  Enemy, 
  PowerUp, 
  GameState, 
  Star,
  EnemyType,
  PowerUpType,
  Missile
} from './types';

export class GameEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number = 0;
  private settings: GameSettings;
  private state: GameState;
  private enemyTypes: { [key: string]: EnemyType };
  private powerUpTypes: { [key: string]: PowerUpType };
  private updateCallback: ((state: GameState) => void) | null = null;

  constructor() {
    // ゲーム設定の初期化
    this.settings = {
      playerSpeed: 5,
      missileSpeed: 8,
      missileReloadTime: 200,
      enemySpeed: {
        basic: 3,
        fast: 5,
        zigzag: 2.5,
        boss: 1.5
      },
      enemySpawnRate: 0.02,
      backgroundColor: '#111',
      specialEnemyChance: 0.3,
      bossEnemyChance: 0.05,
      powerUpChance: 0.005
    };

    // ゲーム状態の初期化
    this.state = {
      player: {
        x: 0,
        y: 0,
        width: 50,
        height: 30,
        color: '#0095DD',
        missiles: [],
        lastFireTime: 0,
        score: 0,
        lives: 3,
        invincible: false,
        invincibleTimer: 0,
        powerUp: false,
        powerUpTimer: 0
      },
      enemies: [],
      powerUps: [],
      stars: [],
      keys: {},
      gameOver: false,
      isPaused: false
    };

    // 敵タイプの定義
    this.enemyTypes = {
      basic: {
        width: 30,
        height: 30,
        color: '#FF5555',
        health: 1,
        points: 10,
        move: (enemy: Enemy) => {
          enemy.y += this.settings.enemySpeed.basic;
        }
      },
      fast: {
        width: 20,
        height: 20,
        color: '#FFaa00',
        health: 1,
        points: 15,
        move: (enemy: Enemy) => {
          enemy.y += this.settings.enemySpeed.fast;
        }
      },
      zigzag: {
        width: 35,
        height: 35,
        color: '#FF00FF',
        health: 2,
        points: 20,
        move: (enemy: Enemy) => {
          enemy.y += this.settings.enemySpeed.zigzag;
          enemy.x += Math.sin(enemy.y * 0.05) * 2;
        }
      },
      boss: {
        width: 80,
        height: 60,
        color: '#FF0000',
        health: 10,
        points: 100,
        move: (enemy: Enemy) => {
          enemy.y += this.settings.enemySpeed.boss;
          enemy.x += Math.sin(enemy.y * 0.02) * 1.5;
        }
      }
    };

    // パワーアップタイプの定義
    this.powerUpTypes = {
      weapon: {
        width: 20,
        height: 20,
        color: '#00FFFF',
        effect: () => {
          this.state.player.powerUp = true;
          this.state.player.powerUpTimer = 500;
        }
      },
      life: {
        width: 20,
        height: 20,
        color: '#00FF00',
        effect: () => {
          if (this.state.player.lives < 5) {
            this.state.player.lives++;
          }
        }
      }
    };
  }

  // キャンバスの初期化
  public init(canvas: HTMLCanvasElement, updateCallback: (state: GameState) => void): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    if (!this.ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // プレイヤーの初期位置を設定
    this.state.player.x = canvas.width / 2 - this.state.player.width / 2;
    this.state.player.y = canvas.height - 100;
    
    // 更新コールバックを設定
    this.updateCallback = updateCallback;
    
    // キーボードイベントリスナーの設定
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    // 星を初期化
    this.initStars(canvas);
    
    // ゲームループを開始
    this.startGameLoop();
  }

  // キーの押下イベント
  private handleKeyDown = (e: KeyboardEvent): void => {
    this.state.keys[e.key] = true;
    
    // スペースキーでミサイル発射
    if ((e.key === ' ' || e.key === 'Spacebar') && this.canFireMissile()) {
      this.fireMissile();
    }
  };

  // キーの解放イベント
  private handleKeyUp = (e: KeyboardEvent): void => {
    this.state.keys[e.key] = false;
  };

  // ミサイル発射の間隔制御
  private canFireMissile(): boolean {
    const currentTime = Date.now();
    
    if (currentTime - this.state.player.lastFireTime >= this.settings.missileReloadTime) {
      this.state.player.lastFireTime = currentTime;
      return true;
    }
    
    return false;
  }

  // ミサイル発射
  private fireMissile(): void {
    if (this.state.player.powerUp) {
      // パワーアップ時は3発同時発射
      this.state.player.missiles.push({
        x: this.state.player.x + this.state.player.width / 2 - 2,
        y: this.state.player.y,
        width: 4,
        height: 15,
        color: '#00FFFF',
        speed: this.settings.missileSpeed + 2
      });
      
      this.state.player.missiles.push({
        x: this.state.player.x + 10,
        y: this.state.player.y + 5,
        width: 4,
        height: 15,
        color: '#00FFFF',
        speed: this.settings.missileSpeed + 2
      });
      
      this.state.player.missiles.push({
        x: this.state.player.x + this.state.player.width - 15,
        y: this.state.player.y + 5,
        width: 4,
        height: 15,
        color: '#00FFFF',
        speed: this.settings.missileSpeed + 2
      });
    } else {
      // 通常ミサイル
      this.state.player.missiles.push({
        x: this.state.player.x + this.state.player.width / 2 - 2,
        y: this.state.player.y,
        width: 4,
        height: 10,
        color: '#FF0000',
        speed: this.settings.missileSpeed
      });
    }
  }

  // プレイヤーの移動処理
  private movePlayer(): void {
    const { player, keys } = this.state;
    const canvas = this.canvas;
    
    if (!canvas) return;
    
    // 修正: x座標の移動範囲を調整（0から画面幅-飛行機の幅まで）
    if (keys['ArrowLeft'] && player.x > 0) {
      player.x -= this.settings.playerSpeed;
      if (player.x < 0) player.x = 0; // 確実に左端に到達できるように
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
      player.x += this.settings.playerSpeed;
      if (player.x > canvas.width - player.width) player.x = canvas.width - player.width; // 確実に右端に到達できるように
    }
    if (keys['ArrowUp'] && player.y > 0) {
      player.y -= this.settings.playerSpeed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
      player.y += this.settings.playerSpeed;
    }
    
    // 無敵状態の処理
    if (player.invincible) {
      player.invincibleTimer--;
      if (player.invincibleTimer <= 0) {
        player.invincible = false;
      }
    }
    
    // パワーアップ状態の処理
    if (player.powerUp) {
      player.powerUpTimer--;
      if (player.powerUpTimer <= 0) {
        player.powerUp = false;
      }
    }
  }

  // ミサイルの移動処理
  private moveMissiles(): void {
    const { player } = this.state;
    
    for (let i = 0; i < player.missiles.length; i++) {
      const missile = player.missiles[i];
      missile.y -= missile.speed;
      
      // 画面外に出たミサイルを削除
      if (missile.y < 0) {
        player.missiles.splice(i, 1);
        i--;
      }
    }
  }

  // 敵の生成
  private spawnEnemies(): void {
    const canvas = this.canvas;
    if (!canvas) return;
    
    if (Math.random() < this.settings.enemySpawnRate) {
      let enemyType;
      const chance = Math.random();
      
      if (chance < this.settings.bossEnemyChance) {
        enemyType = this.enemyTypes.boss;
      } else if (chance < this.settings.specialEnemyChance) {
        enemyType = Math.random() > 0.5 ? this.enemyTypes.fast : this.enemyTypes.zigzag;
      } else {
        enemyType = this.enemyTypes.basic;
      }
      
      // 敵の位置調整（画面外に出ないように）
      const enemyX = Math.max(
        0, 
        Math.min(
          Math.random() * (canvas.width - enemyType.width),
          canvas.width - enemyType.width
        )
      );
      
      this.state.enemies.push({
        x: enemyX,
        y: -enemyType.height,
        width: enemyType.width,
        height: enemyType.height,
        color: enemyType.color,
        health: enemyType.health,
        points: enemyType.points,
        type: enemyType,
        alpha: 1.0
      });
    }
    
    // パワーアップアイテムの生成
    if (Math.random() < this.settings.powerUpChance) {
      const powerUpType = Math.random() > 0.7 ? this.powerUpTypes.life : this.powerUpTypes.weapon;
      
      this.state.powerUps.push({
        x: Math.random() * (canvas.width - powerUpType.width),
        y: -powerUpType.height,
        width: powerUpType.width,
        height: powerUpType.height,
        color: powerUpType.color,
        type: powerUpType,
        speed: 2
      });
    }
  }

  // 敵の移動処理
  private moveEnemies(): void {
    const canvas = this.canvas;
    if (!canvas) return;
    
    for (let i = 0; i < this.state.enemies.length; i++) {
      const enemy = this.state.enemies[i];
      
      // 敵タイプに基づいた移動パターン
      enemy.type.move(enemy);
      
      // ダメージエフェクト（点滅）の復帰
      if (enemy.alpha < 1.0) {
        enemy.alpha += 0.05;
      }
      
      // 画面外に出た敵を削除
      if (enemy.y > canvas.height) {
        this.state.enemies.splice(i, 1);
        i--;
      }
    }
    
    // パワーアップアイテムの移動
    for (let i = 0; i < this.state.powerUps.length; i++) {
      const powerUp = this.state.powerUps[i];
      powerUp.y += powerUp.speed;
      
      // 画面外に出たアイテムを削除
      if (powerUp.y > canvas.height) {
        this.state.powerUps.splice(i, 1);
        i--;
      }
    }
  }

  // 衝突判定
  private checkCollisions(): void {
    const { player, enemies, powerUps } = this.state;
    
    // ミサイルと敵の衝突
    for (let i = 0; i < player.missiles.length; i++) {
      const missile = player.missiles[i];
      
      for (let j = 0; j < enemies.length; j++) {
        const enemy = enemies[j];
        
        if (this.isColliding(missile, enemy)) {
          // 敵へのダメージ
          enemy.health--;
          enemy.alpha = 0.5; // ダメージを受けると一瞬薄くなる
          
          // ミサイルを削除
          player.missiles.splice(i, 1);
          i--;
          
          // 敵の体力が0になったら削除してスコア加算
          if (enemy.health <= 0) {
            player.score += enemy.points;
            enemies.splice(j, 1);
          }
          
          break;
        }
      }
    }
    
    // プレイヤーと敵の衝突（ゲームオーバー）
    if (!player.invincible) {
      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        
        if (this.isColliding(player, enemy)) {
          // 残機を減らす
          player.lives--;
          
          // 敵を削除
          enemies.splice(i, 1);
          i--;
          
          if (player.lives <= 0) {
            // ゲームオーバー処理
            this.state.gameOver = true;
            return;
          } else {
            // 残機が残っている場合は無敵時間を設定
            player.invincible = true;
            player.invincibleTimer = 120; // 約2秒間無敵
          }
        }
      }
    }
    
    // プレイヤーとパワーアップアイテムの衝突
    for (let i = 0; i < powerUps.length; i++) {
      const powerUp = powerUps[i];
      
      if (this.isColliding(player, powerUp)) {
        // パワーアップ効果を適用
        powerUp.type.effect();
        
        // アイテムを削除
        powerUps.splice(i, 1);
        i--;
      }
    }
  }

  // 衝突判定のヘルパー関数
  private isColliding(obj1: { x: number, y: number, width: number, height: number }, 
                    obj2: { x: number, y: number, width: number, height: number }): boolean {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  // 星空の初期化
  private initStars(canvas: HTMLCanvasElement): void {
    this.state.stars = [];
    for (let i = 0; i < 100; i++) {
      this.state.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1
      });
    }
  }

  // 星の移動処理
  private moveStars(): void {
    const canvas = this.canvas;
    if (!canvas) return;
    
    for (let i = 0; i < this.state.stars.length; i++) {
      const star = this.state.stars[i];
      
      // 星を移動（下方向に）
      star.y += star.speed;
      
      // 画面外に出た星を上部に戻す
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }
    }
  }

  // ゲームリセット
  public resetGame(): void {
    if (!this.canvas) return;
    
    this.state.player.x = this.canvas.width / 2 - this.state.player.width / 2;
    this.state.player.y = this.canvas.height - 100;
    this.state.player.missiles = [];
    this.state.player.score = 0;
    this.state.player.lives = 3;
    this.state.player.powerUp = false;
    this.state.player.invincible = false;
    this.state.enemies = [];
    this.state.powerUps = [];
    this.state.gameOver = false;
    
    this.startGameLoop();
  }

  // ゲームを一時停止
  public pauseGame(): void {
    this.state.isPaused = true;
    cancelAnimationFrame(this.animationFrameId);
  }

  // ゲームを再開
  public resumeGame(): void {
    this.state.isPaused = false;
    this.startGameLoop();
  }

  // ゲームを終了（クリーンアップ）
  public endGame(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    cancelAnimationFrame(this.animationFrameId);
  }

  // ゲームループの開始
  private startGameLoop(): void {
    if (this.state.gameOver || this.state.isPaused) return;
    
    const gameLoop = () => {
      // ゲームロジックの更新
      this.movePlayer();
      this.moveMissiles();
      this.spawnEnemies();
      this.moveEnemies();
      this.moveStars();
      this.checkCollisions();
      
      // 状態更新のコールバック
      if (this.updateCallback) {
        this.updateCallback({ ...this.state });
      }
      
      // ゲームオーバーでなければループを継続
      if (!this.state.gameOver && !this.state.isPaused) {
        this.animationFrameId = requestAnimationFrame(gameLoop);
      }
    };
    
    // ゲームループを開始
    this.animationFrameId = requestAnimationFrame(gameLoop);
  }

  // ゲーム状態を取得
  public getState(): GameState {
    return { ...this.state };
  }
}