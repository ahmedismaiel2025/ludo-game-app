import React from 'react';
import { Trophy, XCircle, Percent, Flame, BarChart3 } from 'lucide-react';
import { PlayerStats } from '../utils/playerStats';

interface PlayerStatsCardProps {
  stats: PlayerStats;
  lastMatchResult?: {
    won: boolean;
    rank: number;
  };
  onOpenDetailedModal?: () => void;
  compact?: boolean;
}

export const PlayerStatsCard: React.FC<PlayerStatsCardProps> = ({
  stats,
  lastMatchResult,
  onOpenDetailedModal,
  compact = false
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg">
      {/* Header & Match Feedback */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <span>إحصائياتك بعد المباراة</span>
        </div>

        {lastMatchResult && (
          <span
            className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
              lastMatchResult.won
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {lastMatchResult.won ? '🏆 فوز جديد مسجل' : `المركز #${lastMatchResult.rank}`}
          </span>
        )}
      </div>

      {/* Grid of 4 Core Metrics */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
        {/* Wins */}
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
            <Trophy className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-xs font-bold">فوز</span>
          </div>
          <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
            {stats.wins}
          </div>
        </div>

        {/* Losses */}
        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-center justify-center gap-1 text-rose-400 mb-0.5">
            <XCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-xs font-bold">خسارة</span>
          </div>
          <div className="text-base sm:text-lg font-black text-rose-300 font-mono">
            {stats.losses}
          </div>
        </div>

        {/* Win Rate */}
        <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <div className="flex items-center justify-center gap-1 text-sky-400 mb-0.5">
            <Percent className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-xs font-bold">النسبة</span>
          </div>
          <div className="text-base sm:text-lg font-black text-sky-300 font-mono">
            {stats.winRate}%
          </div>
        </div>

        {/* Streak */}
        <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-center justify-center gap-1 text-orange-400 mb-0.5">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-xs font-bold">سلسلة</span>
          </div>
          <div className="text-base sm:text-lg font-black text-orange-300 font-mono">
            {stats.currentStreak}
          </div>
        </div>
      </div>

      {/* Win Rate Visual Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-semibold text-slate-400">
          <span>إجمالي المباريات: {stats.totalGames}</span>
          <span className="text-amber-300">أفضل سلسلة: {stats.bestStreak} 🔥</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${stats.winRate}%` }}
          />
        </div>
      </div>

      {/* View Detailed Stats Button */}
      {onOpenDetailedModal && (
        <button
          type="button"
          onClick={onOpenDetailedModal}
          className="w-full py-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-bold border border-slate-700/60 transition-all flex items-center justify-center gap-1.5"
        >
          <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
          <span>عرض سجل المباريات الكامل والتفاصيل</span>
        </button>
      )}
    </div>
  );
};
