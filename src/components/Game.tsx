import React, { useEffect, useState, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameState } from '../game/types';
import GameRenderer from './GameRenderer';
import GameControls from './GameControls';
import './Game.css';

const Game: React.FC = () => {
  // ゲームエンジンの参照
  const [gameEngine] = useState<GameEngine>(new GameEngine());
  // ゲーム状態
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // ゲーム状態更新コールバック
  const handleGameStateUpdate = useCallback((newState: GameState) => {
    setGameState(newState);
  }, []);
  
  // ゲーム初期化
  useEffect(() => {
    // キャンバス要素の取得（初回レンダリング後）
    const canvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvasElement) return;
    
    // ゲームエンジンの初期化
    gameEngine.init(canvasElement, handleGameStateUpdate);
    
    // クリーンアップ
    return () => {
      gameEngine.endGame();
    };
  }, [gameEngine, handleGameStateUpdate]);
  
  // ゲームリスタート
  const handleRestart = () => {
    gameEngine.resetGame();
  };
  
  // ポーズ処理
  const handlePause = () => {
    if (gameState?.isPaused) {
      gameEngine.resumeGame();
    } else {
      gameEngine.pauseGame();
    }
  };
  
  return (
    <div className="game-container">
      <h1 className="game-title">宇宙戦闘機ゲーム</h1>
      
      <div className="canvas-wrapper">
        {gameState && <GameRenderer gameState={gameState} />}
      </div>
      
      <div className="game-info">
        <div className="score-display">
          スコア: {gameState?.player.score || 0}
        </div>
        
        <GameControls
          onRestart={handleRestart}
          onPause={handlePause}
          isPaused={gameState?.isPaused || false}
          isGameOver={gameState?.gameOver || false}
        />
      </div>
      
      <div className="game-instructions">
        <h3>操作方法</h3>
        <p>矢印キー: 飛行機操作 | スペースキー: ミサイル発射</p>
        
        <h3>敵の種類</h3>
        <ul>
          <li><span className="enemy-basic"></span> 基本敵: 普通の敵</li>
          <li><span className="enemy-fast"></span> 高速敵: 素早く移動</li>
          <li><span className="enemy-zigzag"></span> ジグザグ敵: 左右に動きながら進む</li>
          <li><span className="enemy-boss"></span> ボス敵: 体力が多く、倒すと高得点</li>
        </ul>
        
        <h3>パワーアップ</h3>
        <ul>
          <li><span className="powerup-weapon"></span> 武器強化: 3発同時発射</li>
          <li><span className="powerup-life"></span> 残機追加: 残機+1</li>
        </ul>
      </div>
    </div>
  );
};

export default Game;