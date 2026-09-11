import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Crown, RotateCcw, Home, Sparkles } from 'lucide-react';
import { Player, PlayerColor, GameMode } from '../types';
import { COLOR_CONFIG } from '../utils/ludoBoard';
import { soundManager } from '../utils/audio';
import { AvatarDisplay } from './AvatarDisplay';
import { PlayerStatsCard } from './PlayerStatsCard';
import { PlayerStatsModal } from './PlayerStatsModal';
import stadiumCrowdImg from '../assets/images/stadium_crowd_arena_1789123732909.jpg';
import {
  getPlayerStats,
  recordMatchResult,
  PlayerStats
} from '../utils/playerStats';

interface VictoryModalProps {
  winnerColor: PlayerColor | null;
  rankings: PlayerColor[];
  players: Player[];
  mode?: GameMode;
  roomId?: string;
  myColor?: PlayerColor;
  onRematch: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winnerColor,
  rankings,
  players,
  mode = 'ai',
  roomId,
  myColor,
  onRematch,
  onHome
}) => {
  const [stats, setStats] = useState<PlayerStats>(() => getPlayerStats());
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const recordedRef = useRef(false);

  // Identify local user
  const localPlayer =
    players.find((p) => myColor && p.color === myColor) ||
    players.find((p) => !p.isAI) ||
    players[0];

  const localColor = localPlayer?.color;
  const localRank =
    localColor && rankings.indexOf(localColor) !== -1
      ? rankings.indexOf(localColor) + 1
      : localPlayer?.rank || (localColor === winnerColor ? 1 : 2);

  const didLocalPlayerWin = localRank === 1 || localColor === winnerColor;

  useEffect(() => {
    soundManager.playVictory();
    soundManager.vibrate([100, 50, 200, 50, 300]);

    // Rich Confetti & Fireworks celebration
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;

    // Initial big burst from center
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#ffffff']
    });

    // Fireworks interval over 4 seconds
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fireworks from left
      confetti({
        particleCount: Math.floor(particleCount),
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random() * 0.3 + 0.1, y: Math.random() * 0.4 + 0.2 },
        colors: ['#f59e0b', '#e11d48', '#10b981', '#6366f1', '#facc15']
      });

      // Fireworks from right
      confetti({
        particleCount: Math.floor(particleCount),
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random() * 0.3 + 0.6, y: Math.random() * 0.4 + 0.2 },
        colors: ['#38bdf8', '#a855f7', '#fbbf24', '#34d399', '#f43f5e']
      });
    }, 350);

    // Record stats in localStorage ONCE when this match concludes
    if (!recordedRef.current && localPlayer) {
      recordedRef.current = true;
      const updated = recordMatchResult({
        won: didLocalPlayerWin,
        rank: localRank,
        mode: (mode as GameMode) || 'ai',
        playerColor: localPlayer.color,
        totalPlayers: players.length,
        playerName: localPlayer.name
      });
      setStats(updated);
    }

    return () => {
      clearInterval(interval);
    };
  }, [didLocalPlayerWin, localPlayer, localRank, mode, players.length]);

  const winnerPlayer = players.find((p) => p.color === winnerColor);
  const winnerCfg = winnerColor ? COLOR_CONFIG[winnerColor] : null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Stadium Audience Cheering Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={stadiumCrowdImg}
            alt="جمهور الساحة يحتفل"
            className="w-full h-full object-cover object-center opacity-30 filter blur-sm scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/80" />
        </div>

        <div className="w-full max-w-md bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.3)] text-center relative overflow-hidden my-auto z-10">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

          {/* Crown & Trophy icon */}
          <div className="relative inline-block mb-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-2xl flex items-center justify-center mx-auto animate-bounce">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
              </div>
            </div>
            <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-300 fill-yellow-300 absolute -top-2.5 left-1/2 -translate-x-1/2 drop-shadow-md" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 mb-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span>مبروك انتهاء المباراة!</span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </h2>

          {winnerPlayer && winnerCfg && (
            <div className="my-3 p-2.5 sm:p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center gap-3">
              <AvatarDisplay avatarId={winnerPlayer.avatar} size="lg" withGlow={true} />
              <div className="text-right">
                <div className="font-extrabold text-base sm:text-lg text-white">{winnerPlayer.name}</div>
                <div className={`text-xs font-bold ${winnerCfg.text}`}>
                  الفائز بالمركز الأول 🥇 ({winnerCfg.nameAr})
                </div>
              </div>
            </div>
          )}

          {/* Podiums Table */}
          <div className="my-3 space-y-1.5 text-right">
            <span className="text-xs font-bold text-slate-400">ترتيب المتنافسين:</span>
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden text-xs">
              {players.map((pl) => {
                const rank =
                  rankings.indexOf(pl.color) !== -1
                    ? rankings.indexOf(pl.color) + 1
                    : pl.rank || '-';
                const cfg = COLOR_CONFIG[pl.color];
                const isFirst = rank === 1;

                return (
                  <div
                    key={pl.id}
                    className={`p-2 flex items-center justify-between ${
                      isFirst ? 'bg-amber-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400 w-5">
                        {isFirst ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </span>
                      <AvatarDisplay avatarId={pl.avatar} size="xs" />
                      <span className="font-bold text-slate-100">{pl.name}</span>
                    </div>
                    <span className={`font-bold ${cfg.text}`}>{cfg.nameAr}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dedicated Player Statistics Card (Stored in localStorage) */}
          <div className="my-3">
            <PlayerStatsCard
              stats={stats}
              lastMatchResult={{
                won: didLocalPlayerWin,
                rank: localRank
              }}
              onOpenDetailedModal={() => setShowDetailedStats(true)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 mt-4">
            <button
              id="btn-rematch"
              onClick={onRematch}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>مباراة أخرى</span>
            </button>
            <button
              id="btn-home"
              onClick={onHome}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>القائمة الرئيسية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Full Player Statistics Modal */}
      <PlayerStatsModal
        isOpen={showDetailedStats}
        onClose={() => setShowDetailedStats(false)}
        stats={stats}
        onStatsUpdated={(updated) => setStats(updated)}
      />
    </>
  );
};
