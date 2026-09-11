import React from 'react';
import { Player, PlayerColor } from '../types';
import { SeatedPlayer } from './SeatedPlayer';

interface TableSeatedPlayersProps {
  players: Player[];
  activeTurnColor?: PlayerColor;
  isWideView?: boolean;
}

export const TableSeatedPlayers: React.FC<TableSeatedPlayersProps> = ({
  players,
  activeTurnColor,
  isWideView = false
}) => {
  if (!players || players.length === 0) return null;

  // Layout positions:
  // If 2 players:
  //   - Player 1: Bottom
  //   - Player 2: Top (or opposing sides)
  // If 3 or 4 players:
  //   - Player 1: Bottom
  //   - Player 2: Top
  //   - Player 3: Left
  //   - Player 4: Right
  const getSeatedPosition = (index: number, total: number): 'top' | 'bottom' | 'left' | 'right' => {
    if (total === 2) {
      return index === 0 ? 'bottom' : 'top';
    }
    if (total === 3) {
      if (index === 0) return 'bottom';
      if (index === 1) return 'top';
      return 'left';
    }
    // 4 players
    const posMap: ('bottom' | 'top' | 'left' | 'right')[] = ['bottom', 'top', 'left', 'right'];
    return posMap[index % 4];
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {players.map((player, idx) => {
        const position = getSeatedPosition(idx, players.length);
        return (
          <SeatedPlayer
            key={player.id}
            player={player}
            position={position}
            isActiveTurn={player.color === activeTurnColor}
            isWideView={isWideView}
          />
        );
      })}
    </div>
  );
};
