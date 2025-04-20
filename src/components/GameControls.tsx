import { memo } from 'react';
import './GameControls.css';

interface GameControlsProps {
  onRestart: () => void;
  onPause: () => void;
  isPaused: boolean;
  isGameOver: boolean;
}

const GameControls = ({
  onRestart,
  onPause,
  isPaused,
  isGameOver
}: GameControlsProps) => {
  return (
    <div className="game-controls">
      <button
        className="control-button restart-button"
        onClick={onRestart}
        type="button"
        aria-label={isGameOver ? 'リスタート' : '新規ゲーム'}
      >
        {isGameOver ? 'リスタート' : '新規ゲーム'}
      </button>
      
      {!isGameOver && (
        <button
          className="control-button pause-button"
          onClick={onPause}
          type="button"
          aria-label={isPaused ? 'ゲーム再開' : 'ポーズ'}
        >
          {isPaused ? 'ゲーム再開' : 'ポーズ'}
        </button>
      )}
    </div>
  );
};

export default memo(GameControls);
