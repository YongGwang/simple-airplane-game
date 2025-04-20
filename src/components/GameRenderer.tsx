import React, { useRef, useEffect } from 'react';
import { GameState, Enemy, PowerUp, Star, Player, Missile } from '../game/types';

interface GameRendererProps {
  gameState: GameState;
}

const GameRenderer: React.FC<GameRendererProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // キャンバスへの描画処理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 星空の描画
    drawStarfield(ctx, gameState.stars);
    
    // 残機の表示
    drawLives(ctx, gameState.player.lives);
    
    // パワーアップ状態の表示
    if (gameState.player.powerUp) {
      drawPowerUpStatus(ctx);
    }
    
    // プレイヤーの描画
    drawPlayer(ctx, gameState.player);
    
    // ミサイルの描画
    drawMissiles(ctx, gameState.player.missiles);
    
    // 敵の描画
    drawEnemies(ctx, gameState.enemies);
    
    // パワーアップアイテムの描画
    drawPowerUps(ctx, gameState.powerUps);
    
  }, [gameState]);
  
  // 星空の描画
  const drawStarfield = (ctx: CanvasRenderingContext2D, stars: Star[]) => {
    ctx.fillStyle = '#FFFFFF';
    
    stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };
  
  // 残機の表示
  const drawLives = (ctx: CanvasRenderingContext2D, lives: number) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.fillText(`残機: ${lives}`, 10, 20);
  };
  
  // パワーアップ状態の表示
  const drawPowerUpStatus = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#00FFFF';
    ctx.fillText('パワーアップ!', 10, 40);
  };
  
  // プレイヤーの描画
  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
    // 無敵状態の場合は点滅
    if (player.invincible && Math.floor(Date.now() / 100) % 2 !== 0) {
      return; // 点滅中は描画しない
    }
    
    // 機体の色（パワーアップ時は色変更）
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
  };
  
  // ミサイルの描画
  const drawMissiles = (ctx: CanvasRenderingContext2D, missiles: Missile[]) => {
    missiles.forEach(missile => {
      ctx.fillStyle = missile.color;
      
      // ミサイルのデザイン
      ctx.beginPath();
      ctx.moveTo(missile.x, missile.y + missile.height);
      ctx.lineTo(missile.x + missile.width / 2, missile.y);
      ctx.lineTo(missile.x + missile.width, missile.y + missile.height);
      ctx.closePath();
      ctx.fill();
    });
  };
  
  // 敵の描画
  const drawEnemies = (ctx: CanvasRenderingContext2D, enemies: Enemy[]) => {
    enemies.forEach(enemy => {
      ctx.globalAlpha = enemy.alpha;
      
      // 敵の種類によって描画方法を変える
      if (enemy.type.health === 1 && enemy.type.width === 30) {
        // 基本敵
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // 敵の目
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(enemy.x + 5, enemy.y + 10, 5, 5);
        ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + 10, 5, 5);
      }
      else if (enemy.type.health === 1 && enemy.type.width === 20) {
        // 高速敵（三角形）
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y + enemy.height);
        ctx.lineTo(enemy.x + enemy.width / 2, enemy.y);
        ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
        ctx.closePath();
        ctx.fill();
      }
      else if (enemy.type.health === 2) {
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
      else if (enemy.type.health === 10) {
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
        const healthPercentage = enemy.health / 10; // ボスの最大体力
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * healthPercentage, 5);
      }
      
      ctx.globalAlpha = 1.0;
    });
  };
  
  // パワーアップアイテムの描画
  const drawPowerUps = (ctx: CanvasRenderingContext2D, powerUps: PowerUp[]) => {
    powerUps.forEach(powerUp => {
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
    });
  };
  
  // ゲームオーバー表示
  const drawGameOver = (ctx: CanvasRenderingContext2D, score: number) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ゲームオーバー', ctx.canvas.width / 2, ctx.canvas.height / 2 - 40);
    
    ctx.font = '24px Arial';
    ctx.fillText(`スコア: ${score}`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 10);
    
    ctx.font = '18px Arial';
    ctx.fillText('もう一度プレイするには「リスタート」ボタンを押してください', ctx.canvas.width / 2, ctx.canvas.height / 2 + 50);
  };
  
  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ display: 'block', margin: '0 auto' }}
    />
  );
};

export default GameRenderer;