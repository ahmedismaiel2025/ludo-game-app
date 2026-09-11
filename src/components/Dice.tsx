import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLOR_CONFIG } from '../utils/ludoBoard';
import { PlayerColor, DiceTheme } from '../types';
import { soundManager } from '../utils/audio';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  turnColor: PlayerColor;
  isMyTurn: boolean;
  onRoll: () => void;
  disabled?: boolean;
  passTurnMessage?: string | null;
  validPiecesCount?: number;
  diceTheme?: DiceTheme;
  theme?: DiceTheme;
  compact?: boolean;
  activePlayerName?: string;
  isTurnPlayerAI?: boolean;
}

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  canRoll,
  turnColor,
  isMyTurn,
  onRoll,
  disabled,
  passTurnMessage,
  validPiecesCount = 0,
  diceTheme,
  theme,
  compact = false,
  activePlayerName,
  isTurnPlayerAI = false
}) => {
  const activeTheme: DiceTheme = diceTheme || theme || 'classic';
  const [localRolling, setLocalRolling] = useState(false);
  const [cyberFlicker, setCyberFlicker] = useState('06');
  const colorCfg = COLOR_CONFIG[turnColor];

  // For digital theme rolling scramble effect
  useEffect(() => {
    if (isRolling || localRolling) {
      const interval = setInterval(() => {
        const randomNum = Math.floor(Math.random() * 6) + 1;
        setCyberFlicker(`0${randomNum}`);
      }, 70);
      return () => clearInterval(interval);
    }
  }, [isRolling, localRolling]);

  const handleRollClick = () => {
    if (!canRoll || disabled || !isMyTurn || isRolling || localRolling) return;
    setLocalRolling(true);
    soundManager.playDiceRoll();
    soundManager.vibrate(30);
    onRoll();
    setTimeout(() => {
      setLocalRolling(false);
    }, 600);
  };

  const rolling = isRolling || localRolling;

  // Render Theme-Specific Dice Face
  const renderDiceFace = (val: number | null) => {
    // ----------------------------------------------------
    // 1. ROBLOX THEME (Lego Blox / Robux $ / Obby style)
    // ----------------------------------------------------
    if (activeTheme === 'roblox') {
      const robloxDot = 'w-3.5 h-3.5 bg-gradient-to-br from-amber-300 to-amber-500 rounded-sm border border-amber-200 shadow-[0_2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center text-[8px] font-black text-amber-950';

      if (val === null) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center select-none">
            <span className="text-xl font-black text-white bg-red-600 px-1.5 py-0.5 rounded border-2 border-white shadow-md">
              R$
            </span>
            <span className="text-[9px] font-black text-amber-300 tracking-wider mt-1 drop-shadow">
              {canRoll && isMyTurn ? 'رمية روبلوكس' : 'Blox'}
            </span>
          </div>
        );
      }

      switch (val) {
        case 1:
          return (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-6 h-6 bg-amber-400 text-slate-950 rounded-md font-black flex items-center justify-center text-xs shadow-md border-2 border-amber-200">
                R$
              </div>
            </div>
          );
        case 2:
          return (
            <div className="w-full h-full flex flex-col justify-between p-2">
              <div className={`${robloxDot} self-start`}>R</div>
              <div className={`${robloxDot} self-end`}>R</div>
            </div>
          );
        case 3:
          return (
            <div className="w-full h-full flex flex-col justify-between p-2">
              <div className={`${robloxDot} self-start`}>R</div>
              <div className={`${robloxDot} self-center`}>R</div>
              <div className={`${robloxDot} self-end`}>R</div>
            </div>
          );
        case 4:
          return (
            <div className="w-full h-full grid grid-cols-2 p-2 place-items-center gap-1">
              <div className={robloxDot}>R</div>
              <div className={robloxDot}>R</div>
              <div className={robloxDot}>R</div>
              <div className={robloxDot}>R</div>
            </div>
          );
        case 5:
          return (
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1.5 place-items-center">
              <div className={`${robloxDot} col-start-1 row-start-1`}>R</div>
              <div className={`${robloxDot} col-start-3 row-start-1`}>R</div>
              <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-red-500 to-red-700 border border-white col-start-2 row-start-2 flex items-center justify-center text-[8px] text-white font-black">
                R$
              </div>
              <div className={`${robloxDot} col-start-1 row-start-3`}>R</div>
              <div className={`${robloxDot} col-start-3 row-start-3`}>R</div>
            </div>
          );
        case 6:
        default:
          return (
            <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-1.5 place-items-center gap-0.5">
              <div className={robloxDot}>R</div>
              <div className={robloxDot}>R</div>
              <div className={robloxDot}>R</div>
              <div className={robloxDot}>R</div>
              <div className={robloxDot}>R</div>
              <div className={robloxDot}>R</div>
            </div>
          );
      }
    }

    // ----------------------------------------------------
    // 2. DIGITAL THEME (Cyberpunk / LED 7-Segment style)
    // ----------------------------------------------------
    if (activeTheme === 'digital') {
      if (val === null) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center select-none font-mono">
            <span className="text-2xl text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse">
              [--]
            </span>
            <span className="text-[9px] font-bold text-cyan-500/80 tracking-widest uppercase mt-0.5">
              {canRoll && isMyTurn ? 'READY' : 'STANDBY'}
            </span>
          </div>
        );
      }

      return (
        <div className="w-full h-full flex flex-col items-center justify-center relative select-none font-mono overflow-hidden">
          {/* Subtle Cyber Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0891b215_1px,transparent_1px),linear-gradient(to_bottom,#0891b215_1px,transparent_1px)] bg-[size:6px_6px] pointer-events-none" />

          {/* Corner LED Indicator dots */}
          <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />

          {/* Main Big Digital Number */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-black text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,1)] tracking-tighter">
              {val}
            </span>
            <span className="text-[8px] font-bold text-cyan-400/70 tracking-widest -mt-1 uppercase">
              NODE: {val}/6
            </span>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // 2. CARTOON THEME (Pop-Art / Comic Book style)
    // ----------------------------------------------------
    if (activeTheme === 'cartoon') {
      const cartoonDot =
        'w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-slate-950 shadow-[1px_1px_0px_#000] relative before:absolute before:top-0.5 before:left-0.5 before:w-1 before:h-1 before:bg-white before:rounded-full';

      if (val === null) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 select-none font-bold">
            <span className="text-2xl drop-shadow-[2px_2px_0px_#000]">🎲</span>
            <span className="text-[10px] font-black text-slate-950 bg-amber-200 px-2 py-0.2 rounded-full border border-black shadow-[1px_1px_0px_#000]">
              {canRoll && isMyTurn ? 'ارمي يا بطل!' : 'انتظر'}
            </span>
          </div>
        );
      }

      switch (val) {
        case 1:
          return (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-slate-950 shadow-[2px_2px_0px_#000] flex items-center justify-center text-xs font-black text-white relative before:absolute before:top-0.5 before:left-0.5 before:w-1.5 before:h-1.5 before:bg-white before:rounded-full">
                ★
              </div>
            </div>
          );
        case 2:
          return (
            <div className="w-full h-full flex flex-col justify-between p-2">
              <div className={`${cartoonDot} self-start`} />
              <div className={`${cartoonDot} self-end`} />
            </div>
          );
        case 3:
          return (
            <div className="w-full h-full flex flex-col justify-between p-2">
              <div className={`${cartoonDot} self-start`} />
              <div className={`${cartoonDot} self-center`} />
              <div className={`${cartoonDot} self-end`} />
            </div>
          );
        case 4:
          return (
            <div className="w-full h-full grid grid-cols-2 p-2 place-items-center gap-1">
              <div className={cartoonDot} />
              <div className={cartoonDot} />
              <div className={cartoonDot} />
              <div className={cartoonDot} />
            </div>
          );
        case 5:
          return (
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1.5 place-items-center">
              <div className={`${cartoonDot} col-start-1 row-start-1`} />
              <div className={`${cartoonDot} col-start-3 row-start-1`} />
              <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-black shadow-[1px_1px_0px_#000] col-start-2 row-start-2 flex items-center justify-center text-[10px] font-black text-slate-900">
                ★
              </div>
              <div className={`${cartoonDot} col-start-1 row-start-3`} />
              <div className={`${cartoonDot} col-start-3 row-start-3`} />
            </div>
          );
        case 6:
        default:
          return (
            <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-1.5 place-items-center gap-0.5">
              <div className={cartoonDot} />
              <div className={cartoonDot} />
              <div className={cartoonDot} />
              <div className={cartoonDot} />
              <div className={cartoonDot} />
              <div className={cartoonDot} />
            </div>
          );
      }
    }

    // ----------------------------------------------------
    // 3. ROYAL THEME (Polished Gold & Gemstones style)
    // ----------------------------------------------------
    if (activeTheme === 'royal') {
      const royalGem =
        'w-3.5 h-3.5 rounded-full bg-gradient-to-br from-rose-400 via-rose-600 to-rose-950 ring-1 ring-amber-200 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.5)]';

      if (val === null) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 select-none">
            <span className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">👑</span>
            <span className="text-[10px] font-black text-amber-950 tracking-wider">
              {canRoll && isMyTurn ? 'رمية ملكية' : ''}
            </span>
          </div>
        );
      }

      switch (val) {
        case 1:
          return (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-800 ring-2 ring-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.8)] flex items-center justify-center text-[11px]">
                👑
              </div>
            </div>
          );
        case 2:
          return (
            <div className="w-full h-full flex flex-col justify-between p-2">
              <div className={`${royalGem} self-start`} />
              <div className={`${royalGem} self-end`} />
            </div>
          );
        case 3:
          return (
            <div className="w-full h-full flex flex-col justify-between p-2">
              <div className={`${royalGem} self-start`} />
              <div className={`${royalGem} self-center`} />
              <div className={`${royalGem} self-end`} />
            </div>
          );
        case 4:
          return (
            <div className="w-full h-full grid grid-cols-2 p-2 place-items-center gap-1">
              <div className={royalGem} />
              <div className={royalGem} />
              <div className={royalGem} />
              <div className={royalGem} />
            </div>
          );
        case 5:
          return (
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1.5 place-items-center">
              <div className={`${royalGem} col-start-1 row-start-1`} />
              <div className={`${royalGem} col-start-3 row-start-1`} />
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-800 ring-1 ring-amber-200 shadow-md col-start-2 row-start-2 flex items-center justify-center text-[9px] text-white font-bold">
                💎
              </div>
              <div className={`${royalGem} col-start-1 row-start-3`} />
              <div className={`${royalGem} col-start-3 row-start-3`} />
            </div>
          );
        case 6:
        default:
          return (
            <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-1.5 place-items-center gap-0.5">
              <div className={royalGem} />
              <div className={royalGem} />
              <div className={royalGem} />
              <div className={royalGem} />
              <div className={royalGem} />
              <div className={royalGem} />
            </div>
          );
      }
    }

    // ----------------------------------------------------
    // 4. CLASSIC THEME (Default Ivory Porcelain style)
    // ----------------------------------------------------
    const dotColor = 'bg-slate-900 shadow-inner';

    if (val === null) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 select-none">
          <span className="text-2xl drop-shadow">🎲</span>
          <span className="text-[10px] font-black text-slate-700 tracking-wider">
            {canRoll && isMyTurn ? 'ارمِ' : ''}
          </span>
        </div>
      );
    }

    switch (val) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`w-4 h-4 rounded-full ${colorCfg.bg} shadow-md ring-2 ring-white/60 animate-pulse`} />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex flex-col justify-between p-2">
            <div className={`w-3.5 h-3.5 rounded-full ${dotColor} self-start`} />
            <div className={`w-3.5 h-3.5 rounded-full ${dotColor} self-end`} />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex flex-col justify-between p-2">
            <div className={`w-3 h-3 rounded-full ${dotColor} self-start`} />
            <div className={`w-3 h-3 rounded-full ${dotColor} self-center`} />
            <div className={`w-3 h-3 rounded-full ${dotColor} self-end`} />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 p-2 place-items-center gap-1">
            <div className={`w-3.5 h-3.5 rounded-full ${dotColor}`} />
            <div className={`w-3.5 h-3.5 rounded-full ${dotColor}`} />
            <div className={`w-3.5 h-3.5 rounded-full ${dotColor}`} />
            <div className={`w-3.5 h-3.5 rounded-full ${dotColor}`} />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1.5 place-items-center">
            <div className={`w-3 h-3 rounded-full ${dotColor} col-start-1 row-start-1`} />
            <div className={`w-3 h-3 rounded-full ${dotColor} col-start-3 row-start-1`} />
            <div className={`w-3.5 h-3.5 rounded-full ${colorCfg.bg} ring-1 ring-white col-start-2 row-start-2`} />
            <div className={`w-3 h-3 rounded-full ${dotColor} col-start-1 row-start-3`} />
            <div className={`w-3 h-3 rounded-full ${dotColor} col-start-3 row-start-3`} />
          </div>
        );
      case 6:
      default:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-1.5 place-items-center gap-0.5">
            <div className={`w-3 h-3 rounded-full ${dotColor}`} />
            <div className={`w-3 h-3 rounded-full ${dotColor}`} />
            <div className={`w-3 h-3 rounded-full ${dotColor}`} />
            <div className={`w-3 h-3 rounded-full ${dotColor}`} />
            <div className={`w-3 h-3 rounded-full ${dotColor}`} />
            <div className={`w-3 h-3 rounded-full ${dotColor}`} />
          </div>
        );
    }
  };

  // Outer Button Container Theme Styles
  const getContainerThemeStyle = () => {
    const sizeClasses = compact
      ? 'w-16 h-16 rounded-xl'
      : 'w-20 h-20 sm:w-22 sm:h-22 rounded-2xl';

    switch (activeTheme) {
      case 'roblox':
        return {
          wrapperClass: `relative ${compact ? 'w-16 h-16 rounded-xl' : 'w-20 h-20 sm:w-22 sm:h-22 rounded-2xl'} p-1 transition-all duration-300 ${
            canRoll && isMyTurn
              ? 'cursor-pointer ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.9)] animate-bounce'
              : 'opacity-85 cursor-default'
          }`,
          style: {
            background: 'linear-gradient(135deg, #e11d48, #0284c7, #059669)',
            border: '3px solid #fef08a'
          },
          innerFaceClass:
            'w-full h-full rounded-xl bg-slate-900/90 border-2 border-amber-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]'
        };
      case 'digital':
        return {
          wrapperClass: `relative ${sizeClasses} p-1 shadow-2xl transition-all duration-300 ${
            canRoll && isMyTurn
              ? 'cursor-pointer ring-4 ring-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.8)] animate-pulse'
              : 'opacity-85 cursor-default'
          }`,
          style: {
            background: 'linear-gradient(145deg, #020617, #083344)',
            border: '2px solid rgba(6, 182, 212, 0.7)'
          },
          innerFaceClass:
            'w-full h-full rounded-xl bg-slate-950 border border-cyan-500/40 shadow-[inset_0_0_15px_rgba(6,182,212,0.3)]'
        };

      case 'cartoon':
        return {
          wrapperClass: `relative ${compact ? 'w-16 h-16 rounded-2xl' : 'w-20 h-20 sm:w-22 sm:h-22 rounded-3xl'} p-1 transition-all duration-300 ${
            canRoll && isMyTurn
              ? 'cursor-pointer border-4 border-slate-950 shadow-[5px_5px_0px_#020617] animate-bounce'
              : 'border-4 border-slate-950 shadow-[3px_3px_0px_#020617] opacity-90 cursor-default'
          }`,
          style: {
            background: 'linear-gradient(135deg, #fde047, #fbbf24)'
          },
          innerFaceClass:
            'w-full h-full rounded-2xl bg-amber-300 border-2 border-slate-950'
        };

      case 'royal':
        return {
          wrapperClass: `relative ${sizeClasses} p-1 shadow-2xl transition-all duration-300 ${
            canRoll && isMyTurn
              ? `cursor-pointer ring-4 ring-amber-300 ring-offset-2 ring-offset-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.8)] animate-bounce`
              : 'opacity-85 cursor-default'
          }`,
          style: {
            background: 'linear-gradient(145deg, #fef08a, #d97706)',
            boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.9), 0 8px 20px rgba(0,0,0,0.5)'
          },
          innerFaceClass:
            'w-full h-full rounded-xl bg-gradient-to-br from-amber-100 via-amber-300 to-amber-500 border border-amber-200'
        };

      case 'classic':
      default:
        return {
          wrapperClass: `relative ${sizeClasses} p-1 shadow-2xl transition-all duration-300 ${
            canRoll && isMyTurn
              ? `cursor-pointer ring-4 ${colorCfg.ring} ring-offset-2 ring-offset-slate-950 animate-bounce`
              : 'opacity-85 cursor-default'
          }`,
          style: {
            background: 'linear-gradient(145deg, #ffffff, #e2e8f0)',
            boxShadow:
              canRoll && isMyTurn
                ? `0 0 25px ${colorCfg.accent}88, inset 0 2px 4px rgba(255,255,255,0.8), 0 8px 16px rgba(0,0,0,0.4)`
                : 'inset 0 2px 4px rgba(255,255,255,0.6), 0 6px 12px rgba(0,0,0,0.3)'
          },
          innerFaceClass:
            'w-full h-full rounded-xl bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300/80'
        };
    }
  };

  const themeStyle = getContainerThemeStyle();

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        id="btn-roll-dice"
        onClick={handleRollClick}
        disabled={!canRoll || disabled || !isMyTurn || rolling}
        whileHover={canRoll && isMyTurn && !rolling ? { scale: 1.08 } : {}}
        whileTap={canRoll && isMyTurn && !rolling ? { scale: 0.92 } : {}}
        className={themeStyle.wrapperClass}
        style={themeStyle.style}
      >
        <AnimatePresence mode="wait">
          {rolling ? (
            <motion.div
              key={`rolling-${activeTheme}`}
              initial={{ rotate: 0, scale: 0.85 }}
              animate={{
                rotate: activeTheme === 'cartoon' ? [-10, 15, -20, 25, 0] : [0, 90, 180, 270, 360, 450],
                scale: [0.9, 1.15, 0.95, 1.1, 1],
                x: [0, -4, 4, -3, 2, 0],
                y: [0, -6, 2, -4, 1, 0]
              }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
              className="w-full h-full flex items-center justify-center font-black text-2xl"
            >
              {activeTheme === 'digital' && (
                <div className="flex flex-col items-center font-mono">
                  <span className="text-3xl text-cyan-300 drop-shadow-[0_0_10px_#22d3ee] animate-pulse">
                    {cyberFlicker}
                  </span>
                  <span className="text-[8px] text-cyan-500 uppercase tracking-widest">
                    SYNCING...
                  </span>
                </div>
              )}
              {activeTheme === 'cartoon' && (
                <div className="flex flex-col items-center">
                  <span className="text-3xl drop-shadow-[2px_2px_0px_#000]">💥</span>
                  <span className="text-[10px] font-black text-slate-950 bg-white px-1.5 rounded border border-black">
                    BOOM!
                  </span>
                </div>
              )}
              {activeTheme === 'royal' && (
                <div className="flex flex-col items-center">
                  <span className="text-3xl drop-shadow">✨</span>
                  <span className="text-[9px] font-black text-amber-900">الملكي</span>
                </div>
              )}
              {activeTheme === 'classic' && <span>🎲</span>}
            </motion.div>
          ) : (
            <motion.div
              key={`dice-${activeTheme}-${value === null ? 'idle' : value}`}
              initial={{ scale: 0.7, rotate: activeTheme === 'cartoon' ? 10 : -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={themeStyle.innerFaceClass}
            >
              {renderDiceFace(value)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 6 Celebration Badge */}
        {value === 6 && !rolling && (
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className={`absolute -top-3 -right-2 font-black text-xs px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 z-20 ${
              activeTheme === 'digital'
                ? 'bg-cyan-500 text-slate-950 border border-cyan-300 shadow-[0_0_10px_#06b6d4]'
                : activeTheme === 'cartoon'
                ? 'bg-yellow-300 text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_#000]'
                : activeTheme === 'royal'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 border border-amber-100 shadow-[0_0_12px_#f59e0b]'
                : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border border-amber-200'
            }`}
          >
            <span>{activeTheme === 'digital' ? '+1 ROLL' : '+1 دور'}</span>
            <span>{activeTheme === 'digital' ? '⚡' : activeTheme === 'royal' ? '👑' : '⭐'}</span>
          </motion.div>
        )}
      </motion.button>

      {/* Helper text under dice */}
      <div className="text-center min-h-[24px]">
        {passTurnMessage ? (
          <span className="inline-block text-xs font-bold text-amber-300 bg-amber-950/90 px-3 py-1.5 rounded-full border border-amber-500/50 shadow-lg animate-pulse">
            {passTurnMessage}
          </span>
        ) : isRolling ? (
          <span className="inline-block text-xs font-bold text-cyan-300 bg-slate-900/90 px-3 py-1 rounded-full border border-cyan-500/40 animate-pulse">
            {isMyTurn ? 'جاري رمي النرد...' : `${activePlayerName || 'الكمبيوتر'} يرمي النرد... 🎲`}
          </span>
        ) : canRoll && isMyTurn ? (
          <span className="inline-block text-xs sm:text-sm font-bold text-amber-400 animate-pulse bg-slate-900/80 px-3 py-1 rounded-full border border-amber-500/30">
            {activeTheme === 'digital' ? '⚡ اضغط للرمي الرقمي' : 'دورك! اضغط لرمي النرد 🎲'}
          </span>
        ) : canRoll && !isMyTurn ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
            {isTurnPlayerAI ? (
              <span>🤖 دور {activePlayerName || 'الروبوت'}...</span>
            ) : (
              <span>دور {activePlayerName || colorCfg.nameAr}...</span>
            )}
          </span>
        ) : !canRoll && value && validPiecesCount > 0 ? (
          <span className="inline-block text-xs font-bold text-emerald-400 bg-slate-900/90 px-3 py-1 rounded-full border border-emerald-500/30">
            {isMyTurn
              ? `اختر قطعة لتحريكها (الرقم ${value}) 👆`
              : `${activePlayerName || 'الكمبيوتر'} يختار قطعة لتحريكها...`}
          </span>
        ) : !canRoll && value && validPiecesCount === 0 ? (
          <span className="inline-block text-xs font-bold text-amber-400 bg-slate-900/80 px-2.5 py-0.5 rounded-full">
            {isTurnPlayerAI
              ? `الرقم ${value} لـ ${activePlayerName || 'الكمبيوتر'} - لا توجد حركة`
              : `الرقم ${value} - لا توجد حركة متاحة`}
          </span>
        ) : null}
      </div>
    </div>
  );
};
