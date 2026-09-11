import { PlayerColor, Piece, GameState, AIDifficulty } from '../types';
import {
  canPieceMove,
  getGlobalTrackIndex,
  isSafePosition,
  TOTAL_STEPS
} from './ludoBoard';

/**
 * Evaluates candidate piece moves and selects the best piece ID to move for the AI.
 */
export function chooseBestAIMove(
  gameState: GameState,
  aiColor: PlayerColor,
  diceValue: number,
  difficulty: AIDifficulty = 'medium'
): number | null {
  const pieces = gameState.pieces[aiColor];
  const validPieces = pieces.filter((p) => canPieceMove(p, diceValue));

  if (validPieces.length === 0) return null;
  if (validPieces.length === 1) return validPieces[0].id;

  // If Easy difficulty, 40% chance of picking a random valid piece
  if (difficulty === 'easy' && Math.random() < 0.4) {
    const randomIndex = Math.floor(Math.random() * validPieces.length);
    return validPieces[randomIndex].id;
  }

  // Score each candidate piece move
  let bestPieceId = validPieces[0].id;
  let highestScore = -Infinity;

  const opponentColors: PlayerColor[] = (['red', 'green', 'yellow', 'blue'] as PlayerColor[]).filter(
    (c) => c !== aiColor
  );

  for (const piece of validPieces) {
    let score = 0;
    const currentStep = piece.step;
    const targetStep = currentStep === -1 ? 0 : currentStep + diceValue;

    // 1. Entering game from Yard with a 6
    if (currentStep === -1 && diceValue === 6) {
      score += 45; // High incentive to get pieces out into the game
      // If we have very few pieces on track, increase priority
      const piecesOnTrack = pieces.filter((p) => p.step >= 0 && p.step < 56).length;
      if (piecesOnTrack === 0) score += 30;
    }

    // 2. Reaching exact goal (step 56)
    if (targetStep === TOTAL_STEPS) {
      score += 90; // Winning/finishing a piece is top priority
    }

    // 3. Entering home safety column (step >= 51)
    if (targetStep >= 51 && currentStep < 51) {
      score += 55; // Entering safe home stretch
    }

    // 4. Capturing an opponent piece
    if (targetStep <= 50) {
      const targetGlobalTrack = getGlobalTrackIndex(aiColor, targetStep);
      const isTargetSafe = isSafePosition(aiColor, targetStep);

      if (targetGlobalTrack !== null && !isTargetSafe) {
        for (const oppColor of opponentColors) {
          const oppPieces = gameState.pieces[oppColor] || [];
          for (const oppPiece of oppPieces) {
            if (oppPiece.step >= 0 && oppPiece.step <= 50) {
              const oppTrack = getGlobalTrackIndex(oppColor, oppPiece.step);
              if (oppTrack === targetGlobalTrack) {
                // Potential capture!
                score += 80;
                // Higher reward if opponent piece was already far along its journey
                score += Math.floor(oppPiece.step / 2);
              }
            }
          }
        }
      }
    }

    // 5. Landing on a Safe Star square
    if (targetStep <= 50 && isSafePosition(aiColor, targetStep)) {
      score += 25;
    }

    // 6. Evading imminent danger (if currently on an unsafe tile with an opponent behind)
    if (currentStep >= 0 && currentStep <= 50 && !isSafePosition(aiColor, currentStep)) {
      const currentGlobalTrack = getGlobalTrackIndex(aiColor, currentStep);
      if (currentGlobalTrack !== null) {
        let inDanger = false;
        for (const oppColor of opponentColors) {
          const oppPieces = gameState.pieces[oppColor] || [];
          for (const oppPiece of oppPieces) {
            if (oppPiece.step >= 0 && oppPiece.step <= 50) {
              const oppTrack = getGlobalTrackIndex(oppColor, oppPiece.step);
              if (oppTrack !== null) {
                const distanceBehind = (currentGlobalTrack - oppTrack + 52) % 52;
                if (distanceBehind >= 1 && distanceBehind <= 6) {
                  inDanger = true;
                  break;
                }
              }
            }
          }
          if (inDanger) break;
        }
        if (inDanger) {
          score += 35; // Urgent escape!
        }
      }
    }

    // 7. General forward progression weight
    score += targetStep * 0.5;

    // Add slight variance for natural feel
    score += Math.random() * (difficulty === 'hard' ? 2 : 6);

    if (score > highestScore) {
      highestScore = score;
      bestPieceId = piece.id;
    }
  }

  return bestPieceId;
}
