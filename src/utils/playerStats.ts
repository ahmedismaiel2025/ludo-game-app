import { GameMode, PlayerColor } from '../types';

export interface MatchRecord {
  id: string;
  timestamp: number;
  mode: GameMode;
  won: boolean;
  rank: number;
  totalPlayers: number;
  playerColor: PlayerColor;
  playerName: string;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number; // 0 - 100 %
  currentStreak: number;
  bestStreak: number;
  piecesCaptured: number;
  sixesRolled: number;
  byMode: {
    online: { played: number; won: number; lost: number };
    ai: { played: number; won: number; lost: number };
    local: { played: number; won: number; lost: number };
  };
  recentMatches: MatchRecord[];
}

const STATS_STORAGE_KEY = 'ludo_player_stats_v1';

export const INITIAL_STATS: PlayerStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  currentStreak: 0,
  bestStreak: 0,
  piecesCaptured: 0,
  sixesRolled: 0,
  byMode: {
    online: { played: 0, won: 0, lost: 0 },
    ai: { played: 0, won: 0, lost: 0 },
    local: { played: 0, won: 0, lost: 0 }
  },
  recentMatches: []
};

/**
 * Loads the current player stats from localStorage.
 */
export function getPlayerStats(): PlayerStats {
  if (typeof window === 'undefined') return INITIAL_STATS;

  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return INITIAL_STATS;

    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_STATS,
      ...parsed,
      byMode: {
        online: { ...INITIAL_STATS.byMode.online, ...(parsed.byMode?.online || {}) },
        ai: { ...INITIAL_STATS.byMode.ai, ...(parsed.byMode?.ai || {}) },
        local: { ...INITIAL_STATS.byMode.local, ...(parsed.byMode?.local || {}) }
      },
      recentMatches: Array.isArray(parsed.recentMatches) ? parsed.recentMatches : []
    };
  } catch (err) {
    console.error('Error loading player stats from localStorage:', err);
    return INITIAL_STATS;
  }
}

/**
 * Saves player stats to localStorage.
 */
function savePlayerStats(stats: PlayerStats): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Error saving player stats to localStorage:', err);
  }
}

/**
 * Records a completed match outcome and updates stats.
 */
export function recordMatchResult(params: {
  won: boolean;
  rank: number;
  mode: GameMode;
  playerColor: PlayerColor;
  totalPlayers: number;
  playerName: string;
}): PlayerStats {
  const current = getPlayerStats();

  const totalGames = current.totalGames + 1;
  const wins = current.wins + (params.won ? 1 : 0);
  const losses = current.losses + (params.won ? 0 : 1);
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const currentStreak = params.won ? current.currentStreak + 1 : 0;
  const bestStreak = Math.max(current.bestStreak, currentStreak);

  const modeKey = params.mode;
  const currentModeStats = current.byMode[modeKey] || { played: 0, won: 0, lost: 0 };
  const updatedModeStats = {
    played: currentModeStats.played + 1,
    won: currentModeStats.won + (params.won ? 1 : 0),
    lost: currentModeStats.lost + (params.won ? 0 : 1)
  };

  const newMatch: MatchRecord = {
    id: 'match_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
    mode: params.mode,
    won: params.won,
    rank: params.rank,
    totalPlayers: params.totalPlayers,
    playerColor: params.playerColor,
    playerName: params.playerName
  };

  const recentMatches = [newMatch, ...current.recentMatches].slice(0, 15);

  const updatedStats: PlayerStats = {
    ...current,
    totalGames,
    wins,
    losses,
    winRate,
    currentStreak,
    bestStreak,
    byMode: {
      ...current.byMode,
      [modeKey]: updatedModeStats
    },
    recentMatches
  };

  savePlayerStats(updatedStats);
  return updatedStats;
}

/**
 * Increments the counter of pieces captured by player.
 */
export function recordPieceCaptured(): void {
  const stats = getPlayerStats();
  stats.piecesCaptured += 1;
  savePlayerStats(stats);
}

/**
 * Increments the counter of sixes rolled by player.
 */
export function recordSixRolled(): void {
  const stats = getPlayerStats();
  stats.sixesRolled += 1;
  savePlayerStats(stats);
}

/**
 * Clears/resets all saved player statistics.
 */
export function resetPlayerStats(): PlayerStats {
  savePlayerStats(INITIAL_STATS);
  return INITIAL_STATS;
}
