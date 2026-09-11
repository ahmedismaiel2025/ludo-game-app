import {
  GameState,
  Player,
  PlayerColor,
  Piece,
  GameMode,
  BoardTheme,
  AIDifficulty
} from '../types';
import {
  canPieceMove,
  getValidPiecesToMove,
  getGlobalTrackIndex,
  isSafePosition,
  TOTAL_STEPS,
  COLOR_CONFIG
} from './ludoBoard';
import { chooseBestAIMove } from './aiBot';

const ORDERED_COLORS: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

export function createInitialPieces(): Record<PlayerColor, Piece[]> {
  const result: Record<PlayerColor, Piece[]> = {
    red: [],
    green: [],
    yellow: [],
    blue: []
  };

  ORDERED_COLORS.forEach((color) => {
    result[color] = [0, 1, 2, 3].map((id) => ({
      id,
      color,
      step: -1
    }));
  });

  return result;
}

export function createNewGameState(options: {
  roomId: string;
  roomCode: string;
  hostId: string;
  mode: GameMode;
  maxPlayers: 2 | 3 | 4;
  players: Player[];
  theme?: BoardTheme;
}): GameState {
  const activeColorIndex = 0;
  const turnColor = options.players[0].color;

  return {
    roomId: options.roomId,
    roomCode: options.roomCode,
    hostId: options.hostId,
    mode: options.mode,
    status: options.mode === 'online' ? 'lobby' : 'playing',
    players: options.players,
    activeColorIndex,
    turnColor,
    diceValue: null,
    isRolling: false,
    canRoll: true,
    consecutiveSixes: 0,
    pieces: createInitialPieces(),
    winner: null,
    rankings: [],
    lastMove: null,
    validPiecesToMove: [],
    turnTimeLeft: 20,
    maxPlayers: options.maxPlayers,
    theme: options.theme || 'classic',
    chatMessages: []
  };
}

export interface MoveResult {
  state: GameState;
  capturedColor?: PlayerColor;
  capturedPieceId?: number;
  reachedHome?: boolean;
  bonusTurn: boolean;
  gameEnded: boolean;
  winner?: PlayerColor;
}

/**
 * Cryptographically uniform random dice roll (1 to 6)
 */
export function getFairDiceRoll(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return (array[0] % 6) + 1;
  }
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Executes a dice roll in the game state
 */
export function executeDiceRoll(state: GameState, forcedValue?: number): {
  state: GameState;
  diceValue: number;
  validPieces: number[];
  autoMovedPieceId?: number;
  shouldPassTurn: boolean;
} {
  if (!state.canRoll || state.status !== 'playing') {
    return {
      state,
      diceValue: state.diceValue || 1,
      validPieces: state.validPiecesToMove,
      shouldPassTurn: false
    };
  }

  const diceValue = forcedValue ?? getFairDiceRoll();
  const turnColor = state.turnColor;
  const pieces = state.pieces[turnColor];
  let consecutiveSixes = state.consecutiveSixes;

  if (diceValue === 6) {
    consecutiveSixes += 1;
  } else {
    consecutiveSixes = 0;
  }

  const activePlayer = state.players.find((p) => p.color === turnColor);
  const isAiPlayer = Boolean(activePlayer?.isAI);
  const playerName = activePlayer?.name || COLOR_CONFIG[turnColor].nameAr;
  const isAllInYard = pieces.every((p) => p.step === -1);

  // 3 consecutive 6s rule: player loses turn
  if (consecutiveSixes >= 3) {
    const updatedState: GameState = {
      ...state,
      diceValue,
      isRolling: false,
      canRoll: false,
      consecutiveSixes: 0,
      validPiecesToMove: [],
      passTurnMessage: isAiPlayer
        ? `ثلاث مرات 6 متتالية لـ ${playerName}! يُلغى الدور`
        : 'ثلاث مرات 6 متتالية! يُلغى دورك وينتقل للاعب التالي'
    };

    return {
      state: updatedState,
      diceValue,
      validPieces: [],
      shouldPassTurn: true
    };
  }

  const validPieces = getValidPiecesToMove(pieces, diceValue);

  if (validPieces.length === 0) {
    // Clear, friendly explanation of why no move is available
    let explanation: string;
    if (isAllInYard) {
      if (isAiPlayer) {
        explanation = `الرقم ${diceValue} لـ ${playerName} - يحتاج 6 للخروج من البداية`;
      } else {
        explanation = `الرقم ${diceValue} - تحتاج إلى 6 لإخراج القطعة من البداية 🏠`;
      }
    } else {
      if (isAiPlayer) {
        explanation = `الرقم ${diceValue} لـ ${playerName} - لا توجد حركة متاحة`;
      } else {
        explanation = `الرقم ${diceValue} - لا توجد حركة متاحة (تتجاوز خط النهاية)`;
      }
    }

    const updatedState: GameState = {
      ...state,
      diceValue,
      isRolling: false,
      canRoll: false,
      consecutiveSixes,
      validPiecesToMove: [],
      passTurnMessage: explanation
    };

    return {
      state: updatedState,
      diceValue,
      validPieces: [],
      shouldPassTurn: true
    };
  }

  const updatedState: GameState = {
    ...state,
    diceValue,
    isRolling: false,
    canRoll: false,
    consecutiveSixes,
    validPiecesToMove: validPieces,
    passTurnMessage: null
  };

  return {
    state: updatedState,
    diceValue,
    validPieces,
    shouldPassTurn: false
  };
}

/**
 * Executes moving a piece
 */
export function executeMovePiece(state: GameState, pieceId: number): MoveResult {
  const turnColor = state.turnColor;
  const diceValue = state.diceValue;

  if (!diceValue || !state.validPiecesToMove.includes(pieceId)) {
    return {
      state,
      bonusTurn: false,
      gameEnded: false
    };
  }

  const piecesCopy = { ...state.pieces };
  const playerPieces = [...piecesCopy[turnColor]];
  const pieceIndex = playerPieces.findIndex((p) => p.id === pieceId);

  if (pieceIndex === -1) {
    return { state, bonusTurn: false, gameEnded: false };
  }

  const currentPiece = playerPieces[pieceIndex];
  const fromStep = currentPiece.step;
  const toStep = fromStep === -1 ? 0 : fromStep + diceValue;

  playerPieces[pieceIndex] = {
    ...currentPiece,
    step: toStep
  };
  piecesCopy[turnColor] = playerPieces;

  let capturedColor: PlayerColor | undefined = undefined;
  let capturedPieceId: number | undefined = undefined;
  let bonusTurn = diceValue === 6;

  // Check if reached goal (56)
  const reachedGoal = toStep === TOTAL_STEPS;
  if (reachedGoal) {
    bonusTurn = true; // Bonus roll for getting a piece home!
  }

  // Check captures on common track (0..50)
  if (toStep <= 50 && !isSafePosition(turnColor, toStep)) {
    const targetTrackIndex = getGlobalTrackIndex(turnColor, toStep);

    if (targetTrackIndex !== null) {
      // Check other players' pieces
      const otherColors = ORDERED_COLORS.filter((c) => c !== turnColor);
      for (const otherColor of otherColors) {
        const otherPieces = [...piecesCopy[otherColor]];
        let pieceCaptured = false;

        for (let i = 0; i < otherPieces.length; i++) {
          const op = otherPieces[i];
          if (op.step >= 0 && op.step <= 50) {
            const opTrack = getGlobalTrackIndex(otherColor, op.step);
            if (opTrack === targetTrackIndex) {
              // Captured!
              otherPieces[i] = { ...op, step: -1 };
              capturedColor = otherColor;
              capturedPieceId = op.id;
              bonusTurn = true; // Capturing grants bonus roll!
              pieceCaptured = true;
              break; // capture one piece
            }
          }
        }

        if (pieceCaptured) {
          piecesCopy[otherColor] = otherPieces;
          break;
        }
      }
    }
  }

  // Check if this player finished all 4 pieces
  const allFinished = playerPieces.every((p) => p.step === TOTAL_STEPS);
  let rankings = [...state.rankings];
  let winner = state.winner;
  let gameEnded = false;

  if (allFinished && !rankings.includes(turnColor)) {
    rankings.push(turnColor);
    if (!winner) {
      winner = turnColor;
    }
    // Update player rank
    const updatedPlayers = state.players.map((pl) => {
      if (pl.color === turnColor) {
        return { ...pl, rank: rankings.length };
      }
      return pl;
    });
    state = { ...state, players: updatedPlayers };

    // Check if game is completed (e.g. 1 player left or all ranked)
    const activeRemaining = state.players.filter((p) => !rankings.includes(p.color));
    if (activeRemaining.length <= 1) {
      gameEnded = true;
      if (activeRemaining.length === 1) {
        rankings.push(activeRemaining[0].color);
      }
    }
  }

  let nextState: GameState = {
    ...state,
    pieces: piecesCopy,
    diceValue: null,
    validPiecesToMove: [],
    passTurnMessage: null,
    rankings,
    winner,
    status: gameEnded ? 'ended' : 'playing',
    lastMove: {
      color: turnColor,
      pieceId,
      fromStep,
      toStep,
      captured: capturedColor
    }
  };

  if (!gameEnded) {
    if (bonusTurn && !allFinished) {
      // Player gets another roll!
      nextState.canRoll = true;
      nextState.turnTimeLeft = 20;
    } else {
      // Turn passes to next player
      nextState = advanceTurn(nextState);
    }
  }

  return {
    state: nextState,
    capturedColor,
    capturedPieceId,
    reachedHome: reachedGoal,
    bonusTurn,
    gameEnded,
    winner
  };
}

/**
 * Advances the active turn to the next non-finished player
 */
export function advanceTurn(state: GameState): GameState {
  if (state.status === 'ended') return state;

  const totalPlayers = state.players.length;
  let nextIndex = (state.activeColorIndex + 1) % totalPlayers;
  let attempts = 0;

  // Skip players who have finished all their pieces
  while (attempts < totalPlayers) {
    const candidatePlayer = state.players[nextIndex];
    if (
      !state.rankings.includes(candidatePlayer.color) &&
      state.pieces[candidatePlayer.color].some((p) => p.step < TOTAL_STEPS)
    ) {
      break;
    }
    nextIndex = (nextIndex + 1) % totalPlayers;
    attempts++;
  }

  if (attempts >= totalPlayers) {
    // All players finished!
    return {
      ...state,
      status: 'ended',
      canRoll: false,
      diceValue: null,
      validPiecesToMove: []
    };
  }

  const nextTurnColor = state.players[nextIndex].color;

  return {
    ...state,
    activeColorIndex: nextIndex,
    turnColor: nextTurnColor,
    diceValue: null,
    isRolling: false,
    canRoll: true,
    consecutiveSixes: 0,
    validPiecesToMove: [],
    turnTimeLeft: 20,
    passTurnMessage: null
  };
}
