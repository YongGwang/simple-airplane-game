import React from 'react';
import './GameControls.css';

interface GameControlsProps {
  onRestart: () => void;
  onPause: () => void;
  isPaused: boolean;
  isGameOver: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onRestart,
  onPause,
  isPaused,
  isGameOver
}) => {
  return (
    <div className="game-controls">
      <button
        className="control-button restart-button"
        onClick={onRestart}
      >
        {isGameOver ? 'リスタート' : '新規ゲーム'}
      </button>
      
      {!isGameOver && (
        <button
          className="control-button pause-button"
          onClick={onPause}
        >
          {isPaused ? 'ゲーム再開' : 'ポーズ'}
        </button>
      )}
    </div>
  );
};

export default GameControls;