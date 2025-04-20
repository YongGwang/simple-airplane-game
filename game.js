// ゲームの主要な変数
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// ゲーム設定
const settings = {
    playerSpeed: 5,
    missileSpeed: 8,
    missileReloadTime: 200, // ミサイル発射の間隔（ミリ秒）
    enemySpeed: {
        basic: 3,
        fast: 5,
        zigzag: 2.5,
        boss: 1.5
    },
    enemySpawnRate: 0.02,
    backgroundColor: '#111',
    specialEnemyChance: 0.3, // 特殊な敵が出現する確率
    bossEnemyChance: 0.05,   // ボス敵が出現する確率
    powerUpChance: 0.005     // パワーアップアイテムが出現する確率
};

// プレイヤーの飛行機
const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 30,
    color: '#0095DD',
    missiles: [],
    lastFireTime: 0,
    score: 0,
    lives: 3, // プレイヤーの残機
    invincible: false,
    invincibleTimer: 0,
    powerUp: false,
    powerUpTimer: 0
};

// 敵の配列
let enemies = [];

// パワーアップアイテムの配列
let powerUps = [];

// キー入力の状態
const keys = {};

// キー入力のイベントリスナー
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // スペースキーでミサイル発射
    if ((e.key === ' ' || e.key === 'Spacebar') && canFireMissile()) {
        fireMissile();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ミサイル発射の間隔制御
function canFireMissile() {
    const currentTime = Date.now();
    
    if (currentTime - player.lastFireTime >= settings.missileReloadTime) {
        player.lastFireTime = currentTime;
        return true;
    }
    
    return false;
}

// ミサイル発射関数
function fireMissile() {
    if (player.powerUp) {
        // パワーアップ時は3発同時発射
        player.missiles.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 15,
            color: '#00FFFF', // パワーアップミサイルは色変更
            speed: settings.missileSpeed + 2
        });
        
        player.missiles.push({
            x: player.x + 10,
            y: player.y + 5,
            width: 4,
            height: 15,
            color: '#00FFFF',
            speed: settings.missileSpeed + 2
        });
        
        player.missiles.push({
            x: player.x + player.width - 15,
            y: player.y + 5,
            width: 4,
            height: 15,
            color: '#00FFFF',
            speed: settings.missileSpeed + 2
        });
    } else {
        // 通常ミサイル
        player.missiles.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            color: '#FF0000',
            speed: settings.missileSpeed
        });
    }
}

// プレイヤーの移動処理
function movePlayer() {
    // 修正: x座標の移動範囲を調整（0から画面幅-飛行機の幅まで）
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= settings.playerSpeed;
        if (player.x < 0) player.x = 0; // 確実に左端に到達できるように
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += settings.playerSpeed;
        if (player.x > canvas.width - player.width) player.x = canvas.width - player.width; // 確実に右端に到達できるように
    }
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= settings.playerSpeed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += settings.playerSpeed;
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
function moveMissiles() {
    for (let i = 0; i < player.missiles.length; i++) {
        const missile = player.missiles[i];
        missile.y -= missile.speed; // 各ミサイルの速度を使用
        
        // 画面外に出たミサイルを削除
        if (missile.y < 0) {
            player.missiles.splice(i, 1);
            i--;
        }
    }
}

// 敵の種類
const enemyTypes = {
    basic: {
        width: 30,
        height: 30,
        color: '#FF5555',
        health: 1,
        points: 10,
        move: function(enemy) {
            enemy.y += settings.enemySpeed.basic;
        }
    },
    fast: {
        width: 20,
        height: 20,
        color: '#FFaa00',
        health: 1,
        points: 15,
        move: function(enemy) {
            enemy.y += settings.enemySpeed.fast;
        }
    },
    zigzag: {
        width: 35,
        height: 35,
        color: '#FF00FF',
        health: 2,
        points: 20,
        move: function(enemy) {
            enemy.y += settings.enemySpeed.zigzag;
            enemy.x += Math.sin(enemy.y * 0.05) * 2;
        }
    },
    boss: {
        width: 80,
        height: 60,
        color: '#FF0000',
        health: 10,
        points: 100,
        move: function(enemy) {
            enemy.y += settings.enemySpeed.boss;
            // ボスは左右に少しだけ動く
            enemy.x += Math.sin(enemy.y * 0.02) * 1.5;
        }
    }
};

// パワーアップの種類
const powerUpTypes = {
    weapon: {
        width: 20,
        height: 20,
        color: '#00FFFF',
        effect: function() {
            player.powerUp = true;
            player.powerUpTimer = 500; // 約8秒間パワーアップ
        }
    },
    life: {
        width: 20,
        height: 20,
        color: '#00FF00',
        effect: function() {
            if (player.lives < 5) { // 最大5機まで
                player.lives++;
            }
        }
    }
};

// 敵の生成
function spawnEnemies() {
    if (Math.random() < settings.enemySpawnRate) {
        let enemyType;
        const chance = Math.random();
        
        if (chance < settings.bossEnemyChance) {
            enemyType = enemyTypes.boss;
        } else if (chance < settings.specialEnemyChance) {
            enemyType = Math.random() > 0.5 ? enemyTypes.fast : enemyTypes.zigzag;
        } else {
            enemyType = enemyTypes.basic;
        }
        
        // 敵の位置調整（画面外に出ないように）
        const enemyX = Math.max(
            0, 
            Math.min(
                Math.random() * (canvas.width - enemyType.width),
                canvas.width - enemyType.width
            )
        );
        
        enemies.push({
            x: enemyX,
            y: -enemyType.height,
            width: enemyType.width,
            height: enemyType.height,
            color: enemyType.color,
            health: enemyType.health,
            points: enemyType.points,
            type: enemyType,
            alpha: 1.0 // 敵の透明度（ダメージエフェクト用）
        });
    }
    
    // パワーアップアイテムの生成
    if (Math.random() < settings.powerUpChance) {
        const powerUpType = Math.random() > 0.7 ? powerUpTypes.life : powerUpTypes.weapon;
        
        powerUps.push({
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
function moveEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        
        // 敵タイプに基づいた移動パターン
        enemy.type.move(enemy);
        
        // ダメージエフェクト（点滅）の復帰
        if (enemy.alpha < 1.0) {
            enemy.alpha += 0.05;
        }
        
        // 画面外に出た敵を削除
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
            i--;
        }
    }
    
    // パワーアップアイテムの移動
    for (let i = 0; i < powerUps.length; i++) {
        const powerUp = powerUps[i];
        powerUp.y += powerUp.speed;
        
        // 画面外に出たアイテムを削除
        if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
            i--;
        }
    }
}

// 衝突判定
function checkCollisions() {
    // ミサイルと敵の衝突
    for (let i = 0; i < player.missiles.length; i++) {
        const missile = player.missiles[i];
        
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            
            if (
                missile.x < enemy.x + enemy.width &&
                missile.x + missile.width > enemy.x &&
                missile.y < enemy.y + enemy.height &&
                missile.y + missile.height > enemy.y
            ) {
                // 敵へのダメージ
                enemy.health--;
                enemy.alpha = 0.5; // ダメージを受けると一瞬薄くなる
                
                // ミサイルを削除
                player.missiles.splice(i, 1);
                i--;
                
                // 敵の体力が0になったら削除してスコア加算
                if (enemy.health <= 0) {
                    player.score += enemy.points;
                    scoreElement.textContent = player.score;
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
            
            if (
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                // 残機を減らす
                player.lives--;
                
                // 敵を削除
                enemies.splice(i, 1);
                i--;
                
                if (player.lives <= 0) {
                    // ゲームオーバー処理
                    alert('ゲームオーバー！ スコア: ' + player.score);
                    resetGame();
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
        
        if (
            player.x < powerUp.x + powerUp.width &&
            player.x + player.width > powerUp.x &&
            player.y < powerUp.y + powerUp.height &&
            player.y + player.height > powerUp.y
        ) {
            // パワーアップ効果を適用
            powerUp.type.effect();
            
            // アイテムを削除
            powerUps.splice(i, 1);
            i--;
        }
    }
}

// ゲームリセット
function resetGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.missiles = [];
    player.score = 0;
    player.lives = 3;
    player.powerUp = false;
    player.invincible = false;
    scoreElement.textContent = player.score;
    enemies = [];
    powerUps = [];
}

// 描画関数
function draw() {
    // キャンバスをクリア
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 星空の背景（装飾）
    drawStarfield();
    
    // 残機の表示
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.fillText('残機: ' + player.lives, 10, 20);
    
    // パワーアップ状態の表示
    if (player.powerUp) {
        ctx.fillStyle = '#00FFFF';
        ctx.fillText('パワーアップ!', 10, 40);
    }
    
    // プレイヤーの描画（改良版）
    if (!player.invincible || Math.floor(Date.now() / 100) % 2 === 0) { // 無敵時は点滅
        ctx.fillStyle = player.powerUp ? '#00AAFF' : player.color;
        
        // 機体の本体
        ctx.beginPath();
        ctx.moveTo(player.x, player.y + player.height);
        ctx.lineTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.closePath();
        ctx.fill();
        
        // 翼の追加
        ctx.beginPath();
        ctx.moveTo(player.x - 10, player.y + player.height * 0.7);
        ctx.lineTo(player.x + 5, player.y + player.height * 0.5);
        ctx.lineTo(player.x + 10, player.y + player.height * 0.7);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(player.x + player.width - 10, player.y + player.height * 0.7);
        ctx.lineTo(player.x + player.width - 5, player.y + player.height * 0.5);
        ctx.lineTo(player.x + player.width + 10, player.y + player.height * 0.7);
        ctx.closePath();
        ctx.fill();
        
        // エンジン炎
        ctx.fillStyle = '#FFAA00';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2 - 5, player.y + player.height);
        ctx.lineTo(player.x + player.width / 2, player.y + player.height + 10 + Math.random() * 5);
        ctx.lineTo(player.x + player.width / 2 + 5, player.y + player.height);
        ctx.closePath();
        ctx.fill();
    }
    
    // ミサイルの描画
    for (const missile of player.missiles) {
        ctx.fillStyle = missile.color;
        // ミサイルのデザイン改良
        ctx.beginPath();
        ctx.moveTo(missile.x, missile.y + missile.height);
        ctx.lineTo(missile.x + missile.width / 2, missile.y);
        ctx.lineTo(missile.x + missile.width, missile.y + missile.height);
        ctx.closePath();
        ctx.fill();
    }
    
    // 敵の描画（タイプ別）
    for (const enemy of enemies) {
        ctx.globalAlpha = enemy.alpha;
        
        if (enemy.type === enemyTypes.basic) {
            // 基本敵
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 敵の目
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(enemy.x + 5, enemy.y + 10, 5, 5);
            ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + 10, 5, 5);
        }
        else if (enemy.type === enemyTypes.fast) {
            // 高速敵（三角形）
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.moveTo(enemy.x, enemy.y + enemy.height);
            ctx.lineTo(enemy.x + enemy.width / 2, enemy.y);
            ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
            ctx.closePath();
            ctx.fill();
        }
        else if (enemy.type === enemyTypes.zigzag) {
            // ジグザグ敵（六角形）
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.moveTo(enemy.x, enemy.y + enemy.height / 2);
            ctx.lineTo(enemy.x + enemy.width / 3, enemy.y);
            ctx.lineTo(enemy.x + enemy.width * 2 / 3, enemy.y);
            ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height / 2);
            ctx.lineTo(enemy.x + enemy.width * 2 / 3, enemy.y + enemy.height);
            ctx.lineTo(enemy.x + enemy.width / 3, enemy.y + enemy.height);
            ctx.closePath();
            ctx.fill();
        }
        else if (enemy.type === enemyTypes.boss) {
            // ボス敵（複雑な形状）
            ctx.fillStyle = enemy.color;
            
            // 本体
            ctx.beginPath();
            ctx.moveTo(enemy.x, enemy.y + enemy.height / 2);
            ctx.lineTo(enemy.x + enemy.width / 4, enemy.y);
            ctx.lineTo(enemy.x + enemy.width * 3 / 4, enemy.y);
            ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height / 2);
            ctx.lineTo(enemy.x + enemy.width * 3 / 4, enemy.y + enemy.height);
            ctx.lineTo(enemy.x + enemy.width / 4, enemy.y + enemy.height);
            ctx.closePath();
            ctx.fill();
            
            // 砲台
            ctx.fillStyle = '#880000';
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // 体力ゲージ
            const healthPercentage = enemy.health / enemyTypes.boss.health;
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * healthPercentage, 5);
        }
        
        ctx.globalAlpha = 1.0;
    }
    
    // パワーアップアイテムの描画
    for (const powerUp of powerUps) {
        ctx.fillStyle = powerUp.color;
        
        // 点滅効果
        if (Math.floor(Date.now() / 100) % 2 === 0) {
            // アイテムの形状（星型）
            ctx.beginPath();
            const spikes = 5;
            const outerRadius = powerUp.width / 2;
            const innerRadius = powerUp.width / 4;
            const cx = powerUp.x + powerUp.width / 2;
            const cy = powerUp.y + powerUp.height / 2;
            
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = Math.PI * i / spikes;
                const x = cx + radius * Math.sin(angle);
                const y = cy + radius * Math.cos(angle);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            ctx.fill();
        }
    }
}

// 星空の背景を描画
let stars = [];
function initStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.1
        });
    }
}

function drawStarfield() {
    // 星がまだ初期化されていない場合
    if (stars.length === 0) {
        initStars();
    }
    
    // 星を描画・移動
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        // 星を描画
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 星を移動（下方向に）
        star.y += star.speed;
        
        // 画面外に出た星を上部に戻す
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }
}

// ゲームループ
function gameLoop() {
    movePlayer();
    moveMissiles();
    spawnEnemies();
    moveEnemies();
    checkCollisions();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// ゲーム開始
gameLoop();