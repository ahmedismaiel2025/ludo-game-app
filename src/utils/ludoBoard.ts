import { PlayerColor, Piece } from '../types';

export interface BoardCoord {
  row: number;
  col: number;
}

// 52 common track positions on 15x15 board
export const COMMON_TRACK: BoardCoord[] = [
  /* 0 - Red start */ { row: 6, col: 1 },
  /* 1 */ { row: 6, col: 2 },
  /* 2 */ { row: 6, col: 3 },
  /* 3 */ { row: 6, col: 4 },
  /* 4 */ { row: 6, col: 5 },
  /* 5 */ { row: 5, col: 6 },
  /* 6 */ { row: 4, col: 6 },
  /* 7 */ { row: 3, col: 6 },
  /* 8 - Safe Star */ { row: 2, col: 6 },
  /* 9 */ { row: 1, col: 6 },
  /* 10 */ { row: 0, col: 6 },
  /* 11 */ { row: 0, col: 7 },
  /* 12 */ { row: 0, col: 8 },
  /* 13 - Green start */ { row: 1, col: 8 },
  /* 14 */ { row: 2, col: 8 },
  /* 15 */ { row: 3, col: 8 },
  /* 16 */ { row: 4, col: 8 },
  /* 17 */ { row: 5, col: 8 },
  /* 18 */ { row: 6, col: 9 },
  /* 19 */ { row: 6, col: 10 },
  /* 20 */ { row: 6, col: 11 },
  /* 21 - Safe Star */ { row: 6, col: 12 },
  /* 22 */ { row: 6, col: 13 },
  /* 23 */ { row: 6, col: 14 },
  /* 24 */ { row: 7, col: 14 },
  /* 25 */ { row: 8, col: 14 },
  /* 26 - Yellow start */ { row: 8, col: 13 },
  /* 27 */ { row: 8, col: 12 },
  /* 28 */ { row: 8, col: 11 },
  /* 29 */ { row: 8, col: 10 },
  /* 30 */ { row: 8, col: 9 },
  /* 31 */ { row: 9, col: 8 },
  /* 32 */ { row: 10, col: 8 },
  /* 33 */ { row: 11, col: 8 },
  /* 34 - Safe Star */ { row: 12, col: 8 },
  /* 35 */ { row: 13, col: 8 },
  /* 36 */ { row: 14, col: 8 },
  /* 37 */ { row: 14, col: 7 },
  /* 38 */ { row: 14, col: 6 },
  /* 39 - Blue start */ { row: 13, col: 6 },
  /* 40 */ { row: 12, col: 6 },
  /* 41 */ { row: 11, col: 6 },
  /* 42 */ { row: 10, col: 6 },
  /* 43 */ { row: 9, col: 6 },
  /* 44 */ { row: 8, col: 5 },
  /* 45 */ { row: 8, col: 4 },
  /* 46 */ { row: 8, col: 3 },
  /* 47 - Safe Star */ { row: 8, col: 2 },
  /* 48 */ { row: 8, col: 1 },
  /* 49 */ { row: 8, col: 0 },
  /* 50 */ { row: 7, col: 0 },
  /* 51 */ { row: 6, col: 0 }
];

export const COLOR_OFFSETS: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

export const SAFE_TRACK_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

export const HOME_COLUMNS: Record<PlayerColor, BoardCoord[]> = {
  red: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
    { row: 7, col: 6 } // Finish Goal
  ],
  green: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
    { row: 6, col: 7 } // Finish Goal
  ],
  yellow: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
    { row: 7, col: 8 } // Finish Goal
  ],
  blue: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
    { row: 8, col: 7 } // Finish Goal
  ]
};

export const YARD_POSITIONS: Record<PlayerColor, BoardCoord[]> = {
  red: [
    { row: 2, col: 2 },
    { row: 2, col: 3 },
    { row: 3, col: 2 },
    { row: 3, col: 3 }
  ],
  green: [
    { row: 2, col: 11 },
    { row: 2, col: 12 },
    { row: 3, col: 11 },
    { row: 3, col: 12 }
  ],
  yellow: [
    { row: 11, col: 11 },
    { row: 11, col: 12 },
    { row: 12, col: 11 },
    { row: 12, col: 12 }
  ],
  blue: [
    { row: 11, col: 2 },
    { row: 11, col: 3 },
    { row: 12, col: 2 },
    { row: 12, col: 3 }
  ]
};

export const GOAL_POSITIONS: Record<PlayerColor, BoardCoord> = {
  red: { row: 7, col: 6 },
  green: { row: 6, col: 7 },
  yellow: { row: 7, col: 8 },
  blue: { row: 8, col: 7 }
};

export const TOTAL_STEPS = 56; // 0 to 50 on common track, 51 to 55 in home column, 56 at goal

/**
 * Returns grid row & col for a piece given its color, pieceId, and step (-1..56)
 */
export function getPieceCoordinates(color: PlayerColor, pieceId: number, step: number): BoardCoord {
  if (step === -1) {
    return YARD_POSITIONS[color][pieceId];
  }
  if (step >= 56) {
    return GOAL_POSITIONS[color];
  }
  if (step >= 51) {
    const homeIndex = step - 51;
    return HOME_COLUMNS[color][homeIndex];
  }
  // On common track
  const offset = COLOR_OFFSETS[color];
  const trackIndex = (offset + step) % 52;
  return COMMON_TRACK[trackIndex];
}

/**
 * Gets global track index (0..51) for a piece if it's currently on the common track (step 0..50).
 * Returns null if piece is in yard or in home column/goal.
 */
export function getGlobalTrackIndex(color: PlayerColor, step: number): number | null {
  if (step < 0 || step > 50) return null;
  const offset = COLOR_OFFSETS[color];
  return (offset + step) % 52;
}

/**
 * Checks if a step is on a safe square
 */
export function isSafePosition(color: PlayerColor, step: number): boolean {
  if (step === -1 || step >= 51) return true; // in yard or home stretch is safe
  const trackIdx = getGlobalTrackIndex(color, step);
  if (trackIdx === null) return true;
  return SAFE_TRACK_INDICES.includes(trackIdx);
}

/**
 * Checks if a piece can move with the given dice roll.
 */
export function canPieceMove(piece: Piece, diceValue: number): boolean {
  if (piece.step === 56) {
    // Already in finish/goal
    return false;
  }
  if (piece.step === -1) {
    // In yard: only a 6 can bring it out to step 0
    return diceValue === 6;
  }
  const nextStep = piece.step + diceValue;
  // Cannot overshoot the goal (56)
  return nextStep <= TOTAL_STEPS;
}

/**
 * Returns list of piece IDs (0..3) that can legally move given the dice roll.
 */
export function getValidPiecesToMove(pieces: Piece[], diceValue: number): number[] {
  const valid: number[] = [];
  pieces.forEach((p) => {
    if (canPieceMove(p, diceValue)) {
      valid.push(p.id);
    }
  });
  return valid;
}

/**
 * Color metadata definitions
 */
export const COLOR_CONFIG: Record<
  PlayerColor,
  {
    nameAr: string;
    nameEn: string;
    bg: string;
    border: string;
    text: string;
    accent: string;
    gradient: string;
    ring: string;
  }
> = {
  red: {
    nameAr: 'الأحمر',
    nameEn: 'Red',
    bg: 'bg-rose-600',
    border: 'border-rose-500',
    text: 'text-rose-400',
    accent: '#e11d48',
    gradient: 'from-rose-500 to-rose-700',
    ring: 'ring-rose-500'
  },
  green: {
    nameAr: 'الأخضر',
    nameEn: 'Green',
    bg: 'bg-emerald-600',
    border: 'border-emerald-500',
    text: 'text-emerald-400',
    accent: '#059669',
    gradient: 'from-emerald-500 to-emerald-700',
    ring: 'ring-emerald-500'
  },
  yellow: {
    nameAr: 'الأصفر',
    nameEn: 'Yellow',
    bg: 'bg-amber-500',
    border: 'border-amber-400',
    text: 'text-amber-300',
    accent: '#d97706',
    gradient: 'from-amber-400 to-amber-600',
    ring: 'ring-amber-400'
  },
  blue: {
    nameAr: 'الأزرق',
    nameEn: 'Blue',
    bg: 'bg-sky-600',
    border: 'border-sky-500',
    text: 'text-sky-400',
    accent: '#0284c7',
    gradient: 'from-sky-500 to-sky-700',
    ring: 'ring-sky-500'
  }
};
