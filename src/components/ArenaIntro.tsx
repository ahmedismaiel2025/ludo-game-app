import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Sparkles, FastForward, Swords, Users } from 'lucide-react';
import { Player, BoardTheme, GameViewStyle } from '../types';
import { COLOR_CONFIG } from '../utils/ludoBoard';
import { soundManager } from '../utils/audio';
import { AvatarDisplay } from './AvatarDisplay';
import { Board } from './Board';
import { createInitialPieces } from '../utils/ludoEngine';
import { TableSeatedPlayers } from './TableSeatedPlayers';
import stadiumCrowdImg from '../assets/images/stadium_crowd_arena_1789123732909.jpg';

interface ArenaIntroProps {
  players: Player[];
  theme?: BoardTheme;
  viewStyle?: GameViewStyle;
  onComplete: () => void;
}

export const ArenaIntro: React.FC<ArenaIntroProps> = ({
  players,
  theme = 'classic',
  viewStyle = 'modern3d',
  onComplete
}) => {
  const [phase, setPhase] = useState<'wide' | 'zooming' | 'ready'>('wide');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Play stadium crowd ambience and cheering
    soundManager.playArenaIntro();

    // Timeline:
    // 0s -> Wide shot: Game appears in the middle of the room filled with crowds
    // 1.5s -> Gradual smooth professional zoom-in into the game table
    // 3.8s -> Ready to start match
    // 4.3s -> Complete and handover to game board
    const zoomTimer = setTimeout(() => {
      setPhase('zooming');
    }, 1500);

    const readyTimer = setTimeout(() => {
      setPhase('ready');
      soundManager.playPieceStep();
    }, 3800);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, 4500);

    // Progress tick
    const start = Date.now();
    const totalDuration = 4500;
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.floor((elapsed / totalDuration) * 100));
      setProgress(pct);
    }, 50);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(readyTimer);
      clearTimeout(finishTimer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  const handleSkip = () => {
    soundManager.playPieceStep();
    onComplete();
  };

  const initialPieces = React.useMemo(() => createInitialPieces(), []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-['Cairo',sans-serif] select-none">
      {/* 1. Cinematic Stadium Room Background with Crowd Spectators Image */}
      <motion.div
        initial={{ scale: 1.0, filter: 'blur(0px) brightness(0.95)' }}
        animate={
          phase === 'wide'
            ? { scale: [1.0, 1.05, 1.0], filter: 'blur(0px) brightness(1.0)' }
            : phase === 'zooming'
            ? { scale: 1.45, filter: 'blur(3px) brightness(0.75)' }
            : { scale: 1.6, filter: 'blur(5px) brightness(0.6)' }
        }
        transition={{
          duration: phase === 'wide' ? 2.5 : 2.3,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <img
          src={stadiumCrowdImg}
          alt="صالة الجماهير الممتلئة"
          className="w-full h-full object-cover object-center transform"
          referrerPolicy="no-referrer"
        />

        {/* Ambient Stadium Lighting Gradients & Spotlights Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2)_0%,transparent_65%)]" />
      </motion.div>

      {/* Dynamic Animated Stadium Beams & Spotlights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute -top-10 left-1/4 w-80 h-[700px] bg-gradient-to-b from-amber-400/35 via-amber-300/15 to-transparent rotate-[28deg] blur-2xl animate-pulse" />
        <div className="absolute -top-10 right-1/4 w-80 h-[700px] bg-gradient-to-b from-cyan-400/35 via-blue-300/15 to-transparent -rotate-[28deg] blur-2xl animate-pulse" />
      </div>

      {/* Top Stadium LED Jumbotron Screen */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute top-3 sm:top-5 z-40 flex flex-col items-center gap-1.5 px-4 max-w-xl w-full"
      >
        <div className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-600/95 via-yellow-500/95 to-amber-600/95 border border-amber-300/90 shadow-[0_0_35px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 text-slate-950 font-black text-xs sm:text-base">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950 animate-bounce" />
          <span>🏆 صالة الأبطال الكبرى - دخول اللاعبين وسط الجماهير</span>
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
        </div>

        {/* Competitor Matchup Lineup on Jumbotron */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 bg-slate-950/85 border border-amber-500/40 rounded-2xl px-3 py-1.5 shadow-2xl backdrop-blur-md">
          {players.map((p, idx) => {
            const cfg = COLOR_CONFIG[p.color];
            return (
              <React.Fragment key={p.id}>
                {idx > 0 && <span className="text-amber-400 font-black text-xs">VS</span>}
                <div className="flex items-center gap-1.5">
                  <AvatarDisplay avatarId={p.avatar} size="xs" withGlow={true} />
                  <span className={`text-xs font-extrabold ${cfg.text} max-w-[85px] sm:max-w-[120px] truncate`}>
                    {p.name}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </motion.div>

      {/* Cheering Audience Badge Tag */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute top-24 sm:top-28 z-30 px-3.5 py-1 rounded-full bg-slate-900/80 border border-amber-400/50 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-lg"
      >
        <Users className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>الجماهير تشجع بحماس في المدرجات 👏🙌</span>
      </motion.div>

      {/* Main 3D Stage: Game Table Centered in the Crowd Room with Gradual Zoom-in */}
      <div className="relative z-30 flex items-center justify-center w-full max-w-2xl px-4 py-6">
        {/* Animated Camera Rig Container with Perspective & Gradual Cinematic Zoom-in */}
        <motion.div
          initial={{
            scale: 0.38,
            rotateX: 42,
            rotateZ: -4,
            y: 80,
            opacity: 0.95
          }}
          animate={
            phase === 'wide'
              ? {
                  scale: [0.38, 0.42, 0.38],
                  rotateX: 42,
                  rotateZ: -4,
                  y: 80,
                  opacity: 1
                }
              : phase === 'zooming'
              ? {
                  scale: 0.95,
                  rotateX: 14,
                  rotateZ: 0,
                  y: 10,
                  opacity: 1
                }
              : {
                  scale: 1.0,
                  rotateX: 0,
                  rotateZ: 0,
                  y: 0,
                  opacity: 1
                }
          }
          transition={{
            duration: phase === 'wide' ? 2.5 : phase === 'zooming' ? 2.3 : 0.6,
            ease: [0.22, 1, 0.36, 1]
          }}
          style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
          className="relative flex flex-col items-center justify-center"
        >
          {/* Central Championship Pedestal Ring & Stadium Spotlight Ring */}
          <div className="absolute -inset-10 sm:-inset-16 rounded-full bg-gradient-to-tr from-amber-500/30 via-yellow-400/25 to-purple-500/25 blur-2xl pointer-events-none animate-pulse" />
          <div className="absolute -inset-6 sm:-inset-10 rounded-[3rem] border-2 border-amber-400/60 bg-slate-950/70 shadow-[0_0_60px_rgba(245,158,11,0.5)] pointer-events-none" />

          {/* Centered Ludo Board on the Arena Stage with Seated Competitors around it */}
          <div className="relative p-8 sm:p-12">
            {/* The 2 or 4 players seated around the table */}
            <TableSeatedPlayers
              players={players}
              activeTurnColor="red"
              isWideView={phase === 'wide'}
            />

            <div className="relative shadow-[0_30px_100px_rgba(0,0,0,0.95)] rounded-3xl overflow-hidden border-2 border-amber-400/70">
              <Board
                pieces={initialPieces}
                validPiecesToMove={[]}
                turnColor="red"
                isMyTurn={false}
                canRoll={false}
                diceValue={null}
                onSelectPiece={() => {}}
                theme={theme}
                viewStyle={viewStyle}
              />
            </div>
          </div>

          {/* Arena Stage Floor Neon Glow Ring */}
          <div className="absolute -bottom-6 w-3/4 h-8 bg-amber-400/40 blur-lg rounded-full pointer-events-none" />
        </motion.div>
      </div>

      {/* Match Ready Overlay Banner (triggers just before game starts) */}
      <AnimatePresence>
        {phase === 'ready' && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: 'spring', damping: 14 }}
            className="absolute z-50 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-slate-950 font-black text-lg sm:text-2xl shadow-[0_0_50px_rgba(16,185,129,0.8)] border-2 border-white flex items-center gap-2"
          >
            <Swords className="w-6 h-6 animate-spin" />
            <span>تبدأ المباراة الآن! بالتوفيق للجميع</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Bar: Skip Intro Button & Entrance Progress */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 w-full max-w-xs px-4">
        {/* Progress Bar */}
        <div className="w-full bg-slate-900/90 rounded-full h-1.5 overflow-hidden border border-amber-500/40">
          <div
            className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full transition-all duration-75 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Skip button */}
        <button
          id="btn-skip-intro"
          onClick={handleSkip}
          className="w-full py-2 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-white border border-amber-500/50 text-xs sm:text-sm font-bold shadow-xl flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <FastForward className="w-4 h-4" />
          <span>تخطي الإنترو والدخول للعب</span>
        </button>
      </div>
    </div>
  );
};
