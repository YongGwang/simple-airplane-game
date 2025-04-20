// ゲームの主要な変数
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// ゲーム設定
const settings = {
    playerSpeed: 5,
    missileSpeed: 7,
    enemySpeed: 3,
    enemySpawnRate: 0.02,
    backgroundColor: '#111'
};

// プレイヤーの飛行機
const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 30,
    color: '#0095DD',
    missiles: [],
    score: 0
};

// 敵の配列
let enemies = [];

// キー入力の状態
const keys = {};

// キー入力のイベントリスナー
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // スペースキーでミサイル発射
    if (e.key === ' ' || e.key === 'Spacebar') {
        fireMissile();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ミサイル発射関数
function fireMissile() {
    player.missiles.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10,
        color: '#FF0000'
    });
}

// プレイヤーの移動処理
function movePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= settings.playerSpeed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += settings.playerSpeed;
    }
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= settings.playerSpeed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += settings.playerSpeed;
    }
}

// ミサイルの移動処理
function moveMissiles() {
    for (let i = 0; i < player.missiles.length; i++) {
        player.missiles[i].y -= settings.missileSpeed;
        
        // 画面外に出たミサイルを削除
        if (player.missiles[i].y < 0) {
            player.missiles.splice(i, 1);
            i--;
        }
    }
}

// 敵の生成
function spawnEnemies() {
    if (Math.random() < settings.enemySpawnRate) {
        enemies.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            color: '#FF5555'
        });
    }
}

// 敵の移動処理
function moveEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += settings.enemySpeed;
        
        // 画面外に出た敵を削除
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
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
                // 衝突した場合、ミサイルと敵を削除
                player.missiles.splice(i, 1);
                enemies.splice(j, 1);
                i--;
                
                // スコア加算
                player.score += 10;
                scoreElement.textContent = player.score;
                
                break;
            }
        }
    }
    
    // プレイヤーと敵の衝突（ゲームオーバー）
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            // ゲームオーバー処理
            alert('ゲームオーバー！ スコア: ' + player.score);
            resetGame();
            return;
        }
    }
}

// ゲームリセット
function resetGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.missiles = [];
    player.score = 0;
    scoreElement.textContent = player.score;
    enemies = [];
}

// 描画関数
function draw() {
    // キャンバスをクリア
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // プレイヤーの描画
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + player.width / 2, player.y - 10);
    ctx.lineTo(player.x + player.width, player.y);
    ctx.lineTo(player.x, player.y);
    ctx.fill();
    
    // ミサイルの描画
    for (const missile of player.missiles) {
        ctx.fillStyle = missile.color;
        ctx.fillRect(missile.x, missile.y, missile.width, missile.height);
    }
    
    // 敵の描画
    for (const enemy of enemies) {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
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