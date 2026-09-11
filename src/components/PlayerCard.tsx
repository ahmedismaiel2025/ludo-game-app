import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, WifiOff, Crown, CheckCircle2 } from 'lucide-react';
import { Player, PlayerColor, Piece } from '../types';
import { COLOR_CONFIG } from '../utils/ludoBoard';
import { AvatarDisplay } from './AvatarDisplay';

interface PlayerCardProps {
  player: Player;
  isActiveTurn: boolean;
  pieces: Piece[];
  lastEmoji?: string;
  isCurrentUser?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActiveTurn,
  pieces,
  lastEmoji,
  isCurrentUser
}) => {
  const cfg = COLOR_CONFIG[player.color];

  // Count piece breakdown
  const inYard = pieces.filter((p) => p.step === -1).length;
  const onTrack = pieces.filter((p) => p.step >= 0 && p.step < 56).length;
  const inHome = pieces.filter((p) => p.step === 56).length;

  return (
    <div
      id={`player-card-${player.color}`}
      className={`relative rounded-xl p-2 sm:p-3 transition-all duration-300 border ${
        isActiveTurn
          ? `${cfg.border} bg-slate-900/95 ring-2 ${cfg.ring} shadow-lg shadow-${player.color}-950/40`
          : 'border-slate-800/80 bg-slate-900/60 opacity-90'
      }`}
    >
      {/* Floating emoji reaction bubble */}
      <AnimatePresence>
        {lastEmoji && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1.3, y: -25 }}
            exit={{ opacity: 0, scale: 0.6, y: -40 }}
            transition={{ duration: 0.4 }}
            className="absolute -top-4 right-2 z-40 bg-slate-800/95 border border-slate-700 px-2 py-1 rounded-full text-xl shadow-xl"
          >
            {lastEmoji}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2.5">
        {/* Avatar with turn pulse ring */}
        <div className="relative">
          <AvatarDisplay
            avatarId={player.avatar}
            size="md"
            withGlow={isActiveTurn}
            className={`transition-all duration-300 ${
              isActiveTurn ? `ring-2 ${cfg.ring} scale-105` : 'opacity-90'
            }`}
          />

          {/* Player Color Pip */}
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${cfg.bg} border-2 border-slate-950 flex items-center justify-center shadow`}
          >
            {player.rank ? (
              <span className="text-[9px] font-black text-white">{player.rank}</span>
            ) : null}
          </div>
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-xs sm:text-sm text-slate-100 truncate">
              {player.name}
            </span>
            {isCurrentUser && (
              <span className="text-[10px] bg-slate-800 text-amber-300 font-semibold px-1.5 py-0.2 rounded border border-amber-400/30 shrink-0">
                (أنت)
              </span>
            )}
            {player.isAI && (
              <span className="text-[10px] bg-indigo-950 text-indigo-300 font-semibold px-1.5 py-0.2 rounded border border-indigo-700/50 flex items-center gap-0.5 shrink-0">
                <Bot className="w-2.5 h-2.5" />
                بوت
              </span>
            )}
            {!player.isConnected && (
              <span
                className="text-[10px] bg-rose-950/80 text-rose-300 font-semibold px-1.5 py-0.5 rounded border border-rose-700/50 flex items-center gap-0.5 shrink-0 animate-pulse"
                title="جاري محاولة استعادة الاتصال تلقائياً"
              >
                <WifiOff className="w-2.5 h-2.5" />
                إعادة اتصال...
              </span>
            )}
          </div>

          {/* Piece Status Badges */}
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
            <span className="flex items-center gap-1" title="في البداية">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              {inYard} في القاعدة
            </span>
            <span className="flex items-center gap-1 text-emerald-400" title="وصل للهدف">
              <CheckCircle2 className="w-2.5 h-2.5" />
              {inHome}/4 فاز
            </span>
          </div>
        </div>

        {/* Rank Crown if finished */}
        {player.rank && (
          <div className="shrink-0 flex flex-col items-center">
            <Crown
              className={`w-5 h-5 ${
                player.rank === 1
                  ? 'text-amber-400 fill-amber-400 animate-bounce'
                  : player.rank === 2
                  ? 'text-slate-300 fill-slate-300'
                  : 'text-amber-700 fill-amber-700'
              }`}
            />
            <span className="text-[10px] font-black text-amber-300">#{player.rank}</span>
          </div>
        )}
      </div>

      {/* Active turn progress bar / highlight */}
      {isActiveTurn && (
        <motion.div
          layoutId="active-turn-indicator"
          className={`h-0.5 w-full ${cfg.bg} rounded-full mt-2 animate-pulse`}
        />
      )}
    </div>
  );
};
