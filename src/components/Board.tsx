import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Crown, ChevronRight, ChevronDown, ChevronLeft, ChevronUp, Box, Layers, Eye } from 'lucide-react';
import {
  PlayerColor,
  Piece,
  BoardTheme,
  GameViewStyle
} from '../types';
import {
  COLOR_CONFIG,
  getPieceCoordinates,
  isSafePosition
} from '../utils/ludoBoard';
import { soundManager } from '../utils/audio';

interface BoardProps {
  pieces: Record<PlayerColor, Piece[]>;
  validPiecesToMove: number[];
  turnColor: PlayerColor;
  isMyTurn: boolean;
  canRoll: boolean;
  diceValue: number | null;
  onSelectPiece: (pieceId: number) => void;
  theme?: BoardTheme;
  viewStyle?: GameViewStyle;
  onChangeViewStyle?: (style: GameViewStyle) => void;
}

type CameraAnglePreset = 'balanced' | 'cinematic' | 'slight';

export const Board: React.FC<BoardProps> = ({
  pieces,
  validPiecesToMove,
  turnColor,
  isMyTurn,
  canRoll,
  diceValue,
  onSelectPiece,
  theme = 'classic',
  viewStyle = 'modern3d',
  onChangeViewStyle
}) => {
  // Local or controlled view style
  const [internalViewStyle, setInternalViewStyle] = useState<GameViewStyle>(viewStyle);
  const currentViewStyle = onChangeViewStyle ? viewStyle : internalViewStyle;
  const is3D = currentViewStyle === 'modern3d';

  // 3D Camera Angle presets
  const [cameraAngle, setCameraAngle] = useState<CameraAnglePreset>('balanced');

  const getTiltDegrees = () => {
    switch (cameraAngle) {
      case 'cinematic':
        return 34;
      case 'slight':
        return 14;
      case 'balanced':
      default:
        return 24;
    }
  };

  const tiltDeg = is3D ? getTiltDegrees() : 0;
  const rotateZDeg = is3D ? -0.5 : 0;

  const handleToggleViewStyle = (style: GameViewStyle) => {
    soundManager.playPieceStep();
    soundManager.vibrate(15);
    if (onChangeViewStyle) {
      onChangeViewStyle(style);
    } else {
      setInternalViewStyle(style);
    }
  };

  // Distinct Theme styling definitions
  const themeStylesMap = {
    classic: {
      boardBg: 'bg-gradient-to-br from-[#3b1d0c] via-[#2a1205] to-[#1a0802]',
      boardBorder: 'border-[#78350f] ring-4 ring-[#b45309]/60 shadow-[0_25px_60px_rgba(0,0,0,0.85)]',
      cellBg: 'bg-white',
      cellBorder: 'border-slate-400/90',
      yardBg: 'bg-[#3b1d0c]',
      yardInner: 'bg-white border-2 border-slate-400',
      starCellBg: 'bg-amber-100 border-amber-500 shadow-sm',
      starFill: 'fill-amber-500 text-amber-600',
      shadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
    },
    royal: {
      boardBg: 'bg-gradient-to-br from-[#1e0836] via-[#120324] to-[#0a0114]',
      boardBorder: 'border-amber-400 ring-4 ring-amber-500/60 shadow-[0_0_45px_rgba(245,158,11,0.45)]',
      cellBg: 'bg-[#2b0d4e]',
      cellBorder: 'border-amber-400/60',
      yardBg: 'bg-[#120324]',
      yardInner: 'bg-[#200a3b] border-2 border-amber-400/60 shadow-inner',
      starCellBg: 'bg-amber-400/40 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.6)]',
      starFill: 'fill-yellow-300 text-amber-200',
      shadow: 'shadow-[0_20px_60px_rgba(217,119,6,0.35)]'
    },
    heritage: {
      boardBg: 'bg-gradient-to-br from-[#faf5ea] via-[#f1e6d0] to-[#e4d3b6]',
      boardBorder: 'border-[#047857] ring-4 ring-[#b45309]/50 shadow-[0_20px_50px_rgba(4,120,87,0.3)]',
      cellBg: 'bg-[#ffffff]',
      cellBorder: 'border-[#047857]/60',
      yardBg: 'bg-[#e7d8c0]',
      yardInner: 'bg-[#ffffff] border-2 border-[#047857]/60 shadow-sm',
      starCellBg: 'bg-emerald-500/30 border-emerald-600 shadow-sm',
      starFill: 'fill-emerald-600 text-emerald-700',
      shadow: 'shadow-[0_20px_50px_rgba(120,53,15,0.3)]'
    },
    neon: {
      boardBg: 'bg-gradient-to-br from-[#030712] via-[#050b1a] to-[#010207]',
      boardBorder: 'border-cyan-400 ring-4 ring-cyan-500/70 shadow-[0_0_50px_rgba(6,182,212,0.8)]',
      cellBg: 'bg-[#060f24]',
      cellBorder: 'border-cyan-400/70',
      yardBg: 'bg-[#02050f]',
      yardInner: 'bg-[#091738] border-2 border-cyan-400/70 shadow-[inset_0_0_15px_rgba(6,182,212,0.3)]',
      starCellBg: 'bg-cyan-500/40 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.8)]',
      starFill: 'fill-cyan-300 text-cyan-100',
      shadow: 'shadow-[0_0_50px_rgba(6,182,212,0.4)]'
    },
    roblox: {
      boardBg: 'bg-gradient-to-br from-rose-950 via-indigo-950 to-slate-900',
      boardBorder: 'border-amber-400 ring-4 ring-red-500/80 shadow-[0_0_60px_rgba(225,29,72,0.6)]',
      cellBg: 'bg-slate-900',
      cellBorder: 'border-amber-400/50',
      yardBg: 'bg-slate-950',
      yardInner: 'bg-slate-900 border-2 border-amber-400 shadow-[inset_0_0_15px_rgba(245,158,11,0.3)]',
      starCellBg: 'bg-amber-400/40 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.8)]',
      starFill: 'fill-amber-300 text-amber-100',
      shadow: 'shadow-[0_0_60px_rgba(245,158,11,0.5)]'
    }
  };

  const themeStyles = themeStylesMap[theme] || themeStylesMap.classic;

  // Helper to test if a grid coordinate (r, c) is a specific safe star or track
  const getCellType = (r: number, c: number) => {
    // Top-Left Yard (Red)
    if (r < 6 && c < 6) return { type: 'yard', color: 'red' as PlayerColor };
    // Top-Right Yard (Green)
    if (r < 6 && c > 8) return { type: 'yard', color: 'green' as PlayerColor };
    // Bottom-Right Yard (Yellow)
    if (r > 8 && c > 8) return { type: 'yard', color: 'yellow' as PlayerColor };
    // Bottom-Left Yard (Blue)
    if (r > 8 && c < 6) return { type: 'yard', color: 'blue' as PlayerColor };

    // Center Triangle (Home Goal)
    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return { type: 'center' };

    // Home Stretches (Strictly colored to matching house color)
    if (r === 7 && c >= 1 && c <= 5) return { type: 'home-path', color: 'red' as PlayerColor };
    if (c === 7 && r >= 1 && r <= 5) return { type: 'home-path', color: 'green' as PlayerColor };
    if (r === 7 && c >= 9 && c <= 13) return { type: 'home-path', color: 'yellow' as PlayerColor };
    if (c === 7 && r >= 9 && r <= 13) return { type: 'home-path', color: 'blue' as PlayerColor };

    // Start Squares (Exit from Yard - Safe & Colored strictly)
    if (r === 6 && c === 1) return { type: 'start', color: 'red' as PlayerColor, isSafe: true };
    if (r === 1 && c === 8) return { type: 'start', color: 'green' as PlayerColor, isSafe: true };
    if (r === 8 && c === 13) return { type: 'start', color: 'yellow' as PlayerColor, isSafe: true };
    if (r === 13 && c === 6) return { type: 'start', color: 'blue' as PlayerColor, isSafe: true };

    // Yard Exit & Entrance Indicators (Colored with each House's exact Color)
    // Red Yard Exit (r: 6, c: 0) and Home Entrance (r: 7, c: 0)
    if (r === 6 && c === 0) return { type: 'yard-exit', color: 'red' as PlayerColor };
    if (r === 7 && c === 0) return { type: 'home-entry', color: 'red' as PlayerColor };

    // Green Yard Exit (r: 0, c: 8) and Home Entrance (r: 0, c: 7)
    if (r === 0 && c === 8) return { type: 'yard-exit', color: 'green' as PlayerColor };
    if (r === 0 && c === 7) return { type: 'home-entry', color: 'green' as PlayerColor };

    // Yellow Yard Exit (r: 8, c: 14) and Home Entrance (r: 7, c: 14)
    if (r === 8 && c === 14) return { type: 'yard-exit', color: 'yellow' as PlayerColor };
    if (r === 7 && c === 14) return { type: 'home-entry', color: 'yellow' as PlayerColor };

    // Blue Yard Exit (r: 14, c: 6) and Home Entrance (r: 14, c: 7)
    if (r === 14 && c === 6) return { type: 'yard-exit', color: 'blue' as PlayerColor };
    if (r === 14 && c === 7) return { type: 'home-entry', color: 'blue' as PlayerColor };

    // Safe Stars on the Common Track (Colored respectfully to their quarter)
    if (r === 2 && c === 6) return { type: 'safe-star', color: 'red' as PlayerColor, isSafe: true };
    if (r === 6 && c === 12) return { type: 'safe-star', color: 'green' as PlayerColor, isSafe: true };
    if (r === 12 && c === 8) return { type: 'safe-star', color: 'yellow' as PlayerColor, isSafe: true };
    if (r === 8 && c === 2) return { type: 'safe-star', color: 'blue' as PlayerColor, isSafe: true };

    return { type: 'track' };
  };

  // Group pieces by their coordinate for cluster rendering
  const pieceCoordMap: Record<string, { color: PlayerColor; piece: Piece }[]> = {};

  (['red', 'green', 'yellow', 'blue'] as PlayerColor[]).forEach((col) => {
    const playerPieces = pieces[col] || [];
    playerPieces.forEach((p) => {
      const coord = getPieceCoordinates(col, p.id, p.step);
      const key = `${coord.row}_${coord.col}`;
      if (!pieceCoordMap[key]) {
        pieceCoordMap[key] = [];
      }
      pieceCoordMap[key].push({ color: col, piece: p });
    });
  });

  const handlePieceClick = (piece: Piece, color: PlayerColor) => {
    if (!isMyTurn || color !== turnColor || canRoll) return;
    if (validPiecesToMove.includes(piece.id)) {
      soundManager.playPieceStep();
      soundManager.vibrate(25);
      onSelectPiece(piece.id);
    }
  };

  return (
    <div className="w-full max-w-[460px] sm:max-w-[500px] md:max-w-[540px] mx-auto flex flex-col items-center">
      {/* Quick View Switcher & 3D Camera Controls */}
      <div className="w-full flex items-center justify-between gap-2 px-1 mb-2">
        {/* Style Toggle Pill: Classic vs Modern 3D */}
        <div className="inline-flex p-0.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => handleToggleViewStyle('classic')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              !is3D
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span>🎲</span>
            <span>كلاسيكي</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleViewStyle('modern3d')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              is3D
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 font-black'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
            }`}
          >
            <span>⚡</span>
            <span>موديرن 3D</span>
          </button>
        </div>

        {/* 3D Camera Angles (Visible when in Modern 3D Mode) */}
        {is3D ? (
          <div className="inline-flex items-center gap-1 bg-slate-950/70 p-0.5 rounded-xl border border-slate-800/80 text-[11px] font-bold">
            <span className="text-[10px] text-cyan-400 px-1.5 hidden sm:inline flex items-center gap-1">
              <Eye className="w-3 h-3" />
              الزاوية:
            </span>
            <button
              type="button"
              onClick={() => {
                soundManager.playPieceStep();
                setCameraAngle('slight');
              }}
              title="زاوية علوية خفيفة"
              className={`px-1.5 py-0.5 rounded-md transition-colors ${
                cameraAngle === 'slight' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              خفيفة
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playPieceStep();
                setCameraAngle('balanced');
              }}
              title="زاوية 3D متوازنة"
              className={`px-1.5 py-0.5 rounded-md transition-colors ${
                cameraAngle === 'balanced' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              متوازنة
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playPieceStep();
                setCameraAngle('cinematic');
              }}
              title="زاوية سينمائية عميقة"
              className={`px-1.5 py-0.5 rounded-md transition-colors ${
                cameraAngle === 'cinematic' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              سينمائية
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-amber-300/80 font-medium px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            العرض الكلاسيكي 2D المسطح
          </div>
        )}
      </div>

      {/* 3D Perspective Stage Container */}
      <div
        dir="ltr"
        className="relative w-full aspect-square p-1 sm:p-2 select-none"
        style={{
          perspective: is3D ? '1100px' : 'none',
          perspectiveOrigin: 'center 60%'
        }}
      >
        {/* Soft Ground Shadow underneath in 3D */}
        {is3D && (
          <div
            className="absolute inset-x-8 -bottom-4 h-12 bg-black/70 rounded-full blur-xl pointer-events-none transition-opacity duration-500"
            style={{
              transform: `scale(${cameraAngle === 'cinematic' ? 1.15 : 1.05})`
            }}
          />
        )}

        {/* The Board Container (Transforms into 3D slab in Modern mode) */}
        <div
          id="ludo-board-container"
          dir="ltr"
          className={`w-full h-full relative rounded-2xl border-4 ${themeStyles.boardBorder} ${themeStyles.boardBg} overflow-hidden grid grid-cols-15 grid-rows-15`}
          style={{
            transform: `rotateX(${tiltDeg}deg) rotateZ(${rotateZDeg}deg) scale(${is3D ? 0.95 : 1})`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease',
            boxShadow: is3D
              ? '0 6px 0 #1e293b, 0 12px 0 #0f172a, 0 18px 0 #030712, 0 28px 45px rgba(0,0,0,0.75)'
              : '0 20px 50px rgba(0,0,0,0.5)'
          }}
        >
          {/* Subtle glossy sheen layer in 3D mode */}
          {is3D && (
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none z-10" />
          )}

          {/* Render 15x15 Grid Cells */}
          {Array.from({ length: 15 }).map((_, r) =>
            Array.from({ length: 15 }).map((_, c) => {
              const cellInfo = getCellType(r, c);

              // Hide normal cells inside the 4 major yards and center so large quadrant components can render seamlessly
              if (cellInfo.type === 'yard') {
                return <div key={`cell-${r}-${c}`} className="invisible" />;
              }
              if (cellInfo.type === 'center') {
                return <div key={`cell-${r}-${c}`} className="invisible" />;
              }

              let cellBgClass = themeStyles.cellBg;
              let cellContent: React.ReactNode = null;
              let cellTitle: string | undefined = undefined;

              if (cellInfo.type === 'start') {
                const cfg = COLOR_CONFIG[cellInfo.color!];
                cellBgClass = `${cfg.bg} text-white font-black`;
                cellTitle = `خانة بداية (${cfg.nameAr}) - خانة آمنة تماماً ⭐`;
                cellContent = (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-300 text-amber-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
                  </div>
                );
              } else if (cellInfo.type === 'yard-exit') {
                const cfg = COLOR_CONFIG[cellInfo.color!];
                cellBgClass = `${cfg.bg} text-white font-bold`;
                cellTitle = `مخرج (${cfg.nameAr}) 🚪`;
                cellContent = (
                  <div className="w-full h-full flex items-center justify-center text-white/90">
                    {cellInfo.color === 'red' && <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />}
                    {cellInfo.color === 'green' && <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />}
                    {cellInfo.color === 'yellow' && <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />}
                    {cellInfo.color === 'blue' && <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                );
              } else if (cellInfo.type === 'home-entry') {
                const cfg = COLOR_CONFIG[cellInfo.color!];
                cellBgClass = `${cfg.bg} text-white font-black`;
                cellTitle = `مدخل فوز (${cfg.nameAr}) 🏆`;
                cellContent = (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    {cellInfo.color === 'red' && <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />}
                    {cellInfo.color === 'green' && <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />}
                    {cellInfo.color === 'yellow' && <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />}
                    {cellInfo.color === 'blue' && <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                );
              } else if (cellInfo.type === 'safe-star') {
                cellBgClass = `${themeStyles.starCellBg} relative font-bold`;
                cellTitle = 'نجمة الأمان (خانة آمنة ومحمية من أكل الخصم) ⭐🛡️';
                cellContent = (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${themeStyles.starFill} drop-shadow-md`} />
                  </div>
                );
              } else if (cellInfo.type === 'home-path') {
                const cfg = COLOR_CONFIG[cellInfo.color!];
                cellBgClass = `${cfg.bg} text-white`;
                cellTitle = `ممر الفوز (${cfg.nameAr})`;
                cellContent = (
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/95 mx-auto shadow-sm ring-1 ring-black/20" />
                );
              }

              return (
                <div
                  key={`track-${r}-${c}`}
                  title={cellTitle}
                  className={`relative border ${themeStyles.cellBorder} ${cellBgClass} flex items-center justify-center overflow-visible transition-colors ${
                    is3D ? 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]' : ''
                  }`}
                >
                  {cellContent}
                </div>
              );
            })
          )}

          {/* 4 Corner Yards (6x6 each with pixel-perfect slot alignment) */}
          {/* 1. Red Yard (Top Left: rows 0..5, cols 0..5) */}
          <div className="absolute top-0 left-0 w-[40%] h-[40%] p-1 sm:p-2 pointer-events-none">
            <div
              className={`w-full h-full rounded-2xl bg-rose-600 p-1.5 sm:p-2 flex flex-col justify-between border-2 border-rose-700 shadow-md ${
                is3D ? 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_10px_rgba(225,29,72,0.3)]' : ''
              }`}
            >
              <div className="flex items-center justify-between text-white font-black text-[10px] sm:text-xs px-1.5 py-0.5 bg-slate-950/40 rounded-lg border border-white/20 shadow-sm backdrop-blur-sm">
                <span className="truncate">الأحمر (Red)</span>
                <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-rose-200 text-rose-100 shrink-0" />
              </div>
            </div>
          </div>
          {/* Red Yard Inner Base Card (rows 1..4, cols 1..4) */}
          <div
            className={`absolute rounded-xl ${themeStyles.yardInner} shadow-inner pointer-events-none ${
              is3D ? 'border border-rose-300/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)]' : ''
            }`}
            style={{
              left: `${(1 / 15) * 100}%`,
              top: `${(1 / 15) * 100}%`,
              width: `${(4 / 15) * 100}%`,
              height: `${(4 / 15) * 100}%`
            }}
          />
          {/* Red 4 Circle Slots (rows 2..3, cols 2..3) */}
          {[
            { row: 2, col: 2 },
            { row: 2, col: 3 },
            { row: 3, col: 2 },
            { row: 3, col: 3 }
          ].map((slot, idx) => (
            <div
              key={`red-slot-${idx}`}
              className="absolute pointer-events-none flex items-center justify-center p-0.5"
              style={{
                left: `${(slot.col / 15) * 100}%`,
                top: `${(slot.row / 15) * 100}%`,
                width: `${(1 / 15) * 100}%`,
                height: `${(1 / 15) * 100}%`
              }}
            >
              <div className="w-full h-full rounded-full bg-rose-100/90 border-2 border-dashed border-rose-500 shadow-inner flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-rose-500/40" />
              </div>
            </div>
          ))}

          {/* 2. Green Yard (Top Right: rows 0..5, cols 9..14) */}
          <div className="absolute top-0 right-0 w-[40%] h-[40%] p-1 sm:p-2 pointer-events-none">
            <div
              className={`w-full h-full rounded-2xl bg-emerald-600 p-1.5 sm:p-2 flex flex-col justify-between border-2 border-emerald-700 shadow-md ${
                is3D ? 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_10px_rgba(5,150,105,0.3)]' : ''
              }`}
            >
              <div className="flex items-center justify-between text-white font-black text-[10px] sm:text-xs px-1.5 py-0.5 bg-slate-950/40 rounded-lg border border-white/20 shadow-sm backdrop-blur-sm">
                <span className="truncate">الأخضر (Green)</span>
                <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-emerald-200 text-emerald-100 shrink-0" />
              </div>
            </div>
          </div>
          {/* Green Yard Inner Base Card (rows 1..4, cols 10..13) */}
          <div
            className={`absolute rounded-xl ${themeStyles.yardInner} shadow-inner pointer-events-none ${
              is3D ? 'border border-emerald-300/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)]' : ''
            }`}
            style={{
              left: `${(10 / 15) * 100}%`,
              top: `${(1 / 15) * 100}%`,
              width: `${(4 / 15) * 100}%`,
              height: `${(4 / 15) * 100}%`
            }}
          />
          {/* Green 4 Circle Slots (rows 2..3, cols 11..12) */}
          {[
            { row: 2, col: 11 },
            { row: 2, col: 12 },
            { row: 3, col: 11 },
            { row: 3, col: 12 }
          ].map((slot, idx) => (
            <div
              key={`green-slot-${idx}`}
              className="absolute pointer-events-none flex items-center justify-center p-0.5"
              style={{
                left: `${(slot.col / 15) * 100}%`,
                top: `${(slot.row / 15) * 100}%`,
                width: `${(1 / 15) * 100}%`,
                height: `${(1 / 15) * 100}%`
              }}
            >
              <div className="w-full h-full rounded-full bg-emerald-100/90 border-2 border-dashed border-emerald-500 shadow-inner flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
              </div>
            </div>
          ))}

          {/* 3. Yellow Yard (Bottom Right: rows 9..14, cols 9..14) */}
          <div className="absolute bottom-0 right-0 w-[40%] h-[40%] p-1 sm:p-2 pointer-events-none">
            <div
              className={`w-full h-full rounded-2xl bg-amber-500 p-1.5 sm:p-2 flex flex-col justify-between border-2 border-amber-600 shadow-md ${
                is3D ? 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_10px_rgba(245,158,11,0.3)]' : ''
              }`}
            >
              <div className="flex items-center justify-between text-slate-950 font-black text-[10px] sm:text-xs px-1.5 py-0.5 bg-slate-950/40 text-amber-300 rounded-lg border border-amber-400/30 shadow-sm backdrop-blur-sm">
                <span className="truncate">الأصفر (Yellow)</span>
                <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-300 text-amber-900 shrink-0" />
              </div>
            </div>
          </div>
          {/* Yellow Yard Inner Base Card (rows 10..13, cols 10..13) */}
          <div
            className={`absolute rounded-xl ${themeStyles.yardInner} shadow-inner pointer-events-none ${
              is3D ? 'border border-amber-300/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)]' : ''
            }`}
            style={{
              left: `${(10 / 15) * 100}%`,
              top: `${(10 / 15) * 100}%`,
              width: `${(4 / 15) * 100}%`,
              height: `${(4 / 15) * 100}%`
            }}
          />
          {/* Yellow 4 Circle Slots (rows 11..12, cols 11..12) */}
          {[
            { row: 11, col: 11 },
            { row: 11, col: 12 },
            { row: 12, col: 11 },
            { row: 12, col: 12 }
          ].map((slot, idx) => (
            <div
              key={`yellow-slot-${idx}`}
              className="absolute pointer-events-none flex items-center justify-center p-0.5"
              style={{
                left: `${(slot.col / 15) * 100}%`,
                top: `${(slot.row / 15) * 100}%`,
                width: `${(1 / 15) * 100}%`,
                height: `${(1 / 15) * 100}%`
              }}
            >
              <div className="w-full h-full rounded-full bg-amber-100/90 border-2 border-dashed border-amber-500 shadow-inner flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-500/40" />
              </div>
            </div>
          ))}

          {/* 4. Blue Yard (Bottom Left: rows 9..14, cols 0..5) */}
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] p-1 sm:p-2 pointer-events-none">
            <div
              className={`w-full h-full rounded-2xl bg-sky-600 p-1.5 sm:p-2 flex flex-col justify-between border-2 border-sky-700 shadow-md ${
                is3D ? 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_10px_rgba(2,132,199,0.3)]' : ''
              }`}
            >
              <div className="flex items-center justify-between text-white font-black text-[10px] sm:text-xs px-1.5 py-0.5 bg-slate-950/40 rounded-lg border border-white/20 shadow-sm backdrop-blur-sm">
                <span className="truncate">الأزرق (Blue)</span>
                <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-sky-200 text-sky-100 shrink-0" />
              </div>
            </div>
          </div>
          {/* Blue Yard Inner Base Card (rows 10..13, cols 1..4) */}
          <div
            className={`absolute rounded-xl ${themeStyles.yardInner} shadow-inner pointer-events-none ${
              is3D ? 'border border-sky-300/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)]' : ''
            }`}
            style={{
              left: `${(1 / 15) * 100}%`,
              top: `${(10 / 15) * 100}%`,
              width: `${(4 / 15) * 100}%`,
              height: `${(4 / 15) * 100}%`
            }}
          />
          {/* Blue 4 Circle Slots (rows 11..12, cols 2..3) */}
          {[
            { row: 11, col: 2 },
            { row: 11, col: 3 },
            { row: 12, col: 2 },
            { row: 12, col: 3 }
          ].map((slot, idx) => (
            <div
              key={`blue-slot-${idx}`}
              className="absolute pointer-events-none flex items-center justify-center p-0.5"
              style={{
                left: `${(slot.col / 15) * 100}%`,
                top: `${(slot.row / 15) * 100}%`,
                width: `${(1 / 15) * 100}%`,
                height: `${(1 / 15) * 100}%`
              }}
            >
              <div className="w-full h-full rounded-full bg-sky-100/90 border-2 border-dashed border-sky-500 shadow-inner flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-sky-500/40" />
              </div>
            </div>
          ))}

          {/* Center Triumph Zone (3x3 grid cells in center) */}
          <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] border-2 border-slate-900/60 shadow-xl overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Left triangle - Red */}
              <polygon points="0,0 50,50 0,100" fill="#e11d48" stroke="#be123c" strokeWidth="1" />
              {/* Top triangle - Green */}
              <polygon points="0,0 50,50 100,0" fill="#059669" stroke="#047857" strokeWidth="1" />
              {/* Right triangle - Yellow */}
              <polygon points="100,0 50,50 100,100" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
              {/* Bottom triangle - Blue */}
              <polygon points="0,100 50,50 100,100" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
              {/* Golden Center Crest */}
              <circle cx="50" cy="50" r="16" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
              <polygon points="50,40 53,46 60,47 55,52 56,58 50,55 44,58 45,52 40,47 47,46" fill="#eab308" />
            </svg>
          </div>

          {/* Render Pieces (Pawns) with 3D Figurine Layout */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {Object.entries(pieceCoordMap).map(([coordKey, pieceGroup]) => {
              const [rStr, cStr] = coordKey.split('_');
              const row = parseInt(rStr, 10);
              const col = parseInt(cStr, 10);

              // Percentage coordinates
              const leftPercent = (col / 15) * 100;
              const topPercent = (row / 15) * 100;
              const cellWidthPercent = 100 / 15;

              return (
                <div
                  key={`group-${coordKey}`}
                  className="absolute flex items-center justify-center pointer-events-auto"
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: `${cellWidthPercent}%`,
                    height: `${cellWidthPercent}%`
                  }}
                >
                  {pieceGroup.map((item, idx) => {
                    const { color, piece } = item;
                    const cfg = COLOR_CONFIG[color];
                    const isCurrentTurnPawn = color === turnColor;
                    const canMoveThis = isMyTurn && isCurrentTurnPawn && !canRoll && validPiecesToMove.includes(piece.id);
                    const isPieceSafe = piece.step >= 0 && piece.step <= 50 && isSafePosition(color, piece.step);

                    // Offset if multiple pieces share same tile
                    const count = pieceGroup.length;
                    const offsetX = count > 1 ? (idx - (count - 1) / 2) * 6 : 0;
                    const offsetY = count > 1 ? (idx - (count - 1) / 2) * -5 : 0;

                    return (
                      <motion.div
                        key={`piece-${color}-${piece.id}`}
                        id={`pawn-${color}-${piece.id}`}
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                          scale: canMoveThis ? [1, 1.15, 1] : 1,
                          x: offsetX,
                          y: canMoveThis && is3D ? [offsetY - 6, offsetY - 14, offsetY - 6] : offsetY,
                          opacity: 1
                        }}
                        transition={{
                          layout: { type: 'spring', stiffness: 350, damping: 25 },
                          scale: canMoveThis
                            ? { repeat: Infinity, duration: 0.9, ease: 'easeInOut' }
                            : { duration: 0.2 },
                          y: canMoveThis && is3D
                            ? { repeat: Infinity, duration: 0.9, ease: 'easeInOut' }
                            : undefined
                        }}
                        onClick={() => handlePieceClick(piece, color)}
                        className={`relative flex flex-col items-center justify-center cursor-pointer select-none ${
                          canMoveThis ? 'z-40' : 'z-10'
                        }`}
                        title={isPieceSafe ? 'قطعة في خانة آمنة (محمية من الأكل) 🛡️⭐' : undefined}
                        style={{
                          // Stand upright in 3D perspective
                          transform: is3D ? `rotateX(-${tiltDeg}deg)` : undefined,
                          transformOrigin: 'bottom center'
                        }}
                      >
                        {/* 3D Ground Cast Shadow underneath the figurine */}
                        {is3D && (
                          <div
                            className={`w-6 sm:w-7 h-2 rounded-full bg-black/50 blur-[1.5px] absolute -bottom-1 pointer-events-none transition-transform ${
                              canMoveThis ? 'scale-75 opacity-40' : 'scale-100 opacity-80'
                            }`}
                          />
                        )}

                        {/* Figurine Body (Roblox Blocky vs Modern 3D vs Classic) */}
                        {theme === 'roblox' ? (
                          /* Roblox Blocky Character Figurine */
                          <div
                            className={`relative flex flex-col items-center justify-center transition-all ${
                              canMoveThis ? 'drop-shadow-[0_0_14px_rgba(250,204,21,1)] scale-110' : ''
                            }`}
                          >
                            {/* Roblox Head (Cube with Face) */}
                            <div
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-[11px] sm:text-xs shadow-md border-2 ${
                                canMoveThis ? 'ring-2 ring-amber-300 border-amber-300 animate-bounce' : 'border-white/80'
                              }`}
                              style={{
                                background: `linear-gradient(135deg, ${cfg.accent}, #0f172a)`
                              }}
                            >
                              <span>
                                {color === 'red' ? '😎' : color === 'green' ? '😃' : color === 'yellow' ? '🤖' : '🦖'}
                              </span>
                            </div>

                            {/* Roblox Torso (Blocky Chest with R$ Logo) */}
                            <div
                              className="w-5 sm:w-6 h-3 rounded-sm -mt-0.5 border border-white/40 flex items-center justify-center text-[7px] font-black text-white shadow-inner"
                              style={{
                                background: `linear-gradient(to bottom, ${cfg.accent}, #020617)`
                              }}
                            >
                              <span className="bg-amber-400 text-slate-950 px-0.5 rounded-[2px] leading-none font-extrabold scale-90">R$</span>
                            </div>

                            {/* Safe Star Indicator Shield on Roblox Character */}
                            {isPieceSafe && (
                              <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[8px] font-black shadow border border-white animate-pulse">
                                ⭐
                              </div>
                            )}
                          </div>
                        ) : is3D ? (
                          <div
                            className={`relative flex flex-col items-center justify-center transition-transform ${
                              canMoveThis ? 'drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]' : ''
                            }`}
                          >
                            {/* Upper Shiny Sphere Head */}
                            <div
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border border-white/40 shadow-md ${
                                canMoveThis ? 'ring-2 ring-amber-300 ring-offset-1 ring-offset-slate-900' : ''
                              }`}
                              style={{
                                background: `radial-gradient(circle at 35% 28%, #ffffff 0%, ${cfg.accent} 65%, #050505 100%)`,
                                boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.6)'
                              }}
                            >
                              {/* Inner Jewel Glint */}
                              <div className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-sm" />
                            </div>

                            {/* 3D Figurine Base Pedestal */}
                            <div
                              className="w-5 sm:w-6 h-1.5 rounded-full -mt-0.5 border-t border-white/50 shadow-sm"
                              style={{
                                background: `linear-gradient(to bottom, ${cfg.accent}, #0f172a)`
                              }}
                            />

                            {/* Safe Star Indicator Shield on figurine */}
                            {isPieceSafe && (
                              <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[8px] font-black shadow border border-white/80 animate-pulse">
                                ⭐
                              </div>
                            )}
                          </div>
                        ) : (
                          // Classic 2D Pawn Disc
                          <div
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-lg flex items-center justify-center transition-transform relative ${
                              canMoveThis
                                ? 'ring-3 ring-amber-300 ring-offset-1 ring-offset-slate-950 animate-bounce'
                                : ''
                            }`}
                            style={{
                              background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${cfg.accent} 65%, #000000 100%)`,
                              boxShadow: canMoveThis
                                ? `0 0 15px #facc15, 0 4px 8px rgba(0,0,0,0.5)`
                                : `0 3px 6px rgba(0,0,0,0.4)`
                            }}
                          >
                            <div className="w-2.5 h-2.5 rounded-full bg-white/80 shadow-inner flex items-center justify-center">
                              <div className={`w-1 h-1 rounded-full ${cfg.bg}`} />
                            </div>

                            {/* Safe Star Indicator on 2D disc */}
                            {isPieceSafe && (
                              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[8px] font-black shadow border border-white/80">
                                ⭐
                              </div>
                            )}
                          </div>
                        )}

                        {/* Finish Triumph Star badge */}
                        {piece.step === 56 && (
                          <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 rounded-full w-3.5 h-3.5 text-[8px] font-black flex items-center justify-center shadow">
                            ✓
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
