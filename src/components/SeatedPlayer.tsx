import React from 'react';
import { motion } from 'motion/react';
import { Bot, Crown } from 'lucide-react';
import { Player } from '../types';
import { COLOR_CONFIG } from '../utils/ludoBoard';
import { AvatarDisplay } from './AvatarDisplay';

interface SeatedPlayerProps {
  player: Player;
  position: 'top' | 'bottom' | 'left' | 'right';
  isActiveTurn?: boolean;
  scale?: number;
  isWideView?: boolean;
}

export const SeatedPlayer: React.FC<SeatedPlayerProps> = ({
  player,
  position,
  isActiveTurn = false,
  scale = 1,
  isWideView = false
}) => {
  const cfg = COLOR_CONFIG[player.color];

  // Positioning around the board:
  // Top: behind top edge, facing forward/down
  // Bottom: in front of bottom edge, facing up/forward
  // Left: at the left edge of table
  // Right: at the right edge of table
  const positionClasses = {
    top: '-top-14 sm:-top-16 left-1/2 -translate-x-1/2',
    bottom: '-bottom-14 sm:-bottom-16 left-1/2 -translate-x-1/2',
    left: 'top-1/2 -left-14 sm:-left-16 -translate-y-1/2',
    right: 'top-1/2 -right-14 sm:-right-16 -translate-y-1/2'
  }[position];

  return (
    <motion.div
      animate={{
        y: isActiveTurn ? [0, -4, 0] : [0, -1, 0],
        scale: isActiveTurn ? 1.05 : 1.0
      }}
      transition={{
        repeat: Infinity,
        duration: isActiveTurn ? 1.4 : 2.8,
        ease: 'easeInOut'
      }}
      className={`absolute ${positionClasses} z-30 flex flex-col items-center pointer-events-none transition-all duration-500`}
      style={{
        transformOrigin: 'center center'
      }}
    >
      {/* 3D Player Chair Silhouette */}
      <div
        className={`relative flex flex-col items-center p-1.5 sm:p-2 rounded-2xl bg-slate-900/90 border-2 ${
          isActiveTurn ? `${cfg.border} ring-4 ${cfg.ring} shadow-lg shadow-${player.color}-900/50` : 'border-slate-700/80 shadow-md'
        } backdrop-blur-md`}
      >
        {/* Active turn indicator crown / arrow */}
        {isActiveTurn && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-40 bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-0.5 shadow-md animate-bounce">
            <Crown className="w-2.5 h-2.5 fill-slate-950" />
            <span>دوره</span>
          </div>
        )}

        {/* Player Avatar */}
        <div className="relative">
          <AvatarDisplay
            avatarId={player.avatar}
            size={isWideView ? 'sm' : 'md'}
            withGlow={isActiveTurn}
          />
          {/* Color marker tag */}
          <div
            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${cfg.bg} border-2 border-slate-950 flex items-center justify-center shadow`}
          >
            {player.isAI && <Bot className="w-2 h-2 text-white" />}
          </div>
        </div>

        {/* Player Name and status label */}
        <div className="mt-1 flex flex-col items-center">
          <span className={`text-[10px] sm:text-xs font-black ${cfg.text} max-w-[70px] sm:max-w-[95px] truncate text-center leading-tight`}>
            {player.name}
          </span>
          <span className="text-[8px] text-slate-400 font-bold">
            {player.isAI ? 'روبوت' : 'لاعب'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
