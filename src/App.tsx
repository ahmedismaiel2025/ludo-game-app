/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  GameState,
  Player,
  PlayerColor,
  BoardTheme,
  DiceTheme,
  GameViewStyle,
  AIDifficulty,
  ChatMessage,
  ServerToClientEvents,
  ClientToServerEvents
} from './types';
import { Board } from './components/Board';
import { Dice } from './components/Dice';
import { PlayerCard } from './components/PlayerCard';
import { GameControls } from './components/GameControls';
import { Lobby } from './components/Lobby';
import { VictoryModal } from './components/VictoryModal';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import { ArenaIntro } from './components/ArenaIntro';
import { TableSeatedPlayers } from './components/TableSeatedPlayers';
import { SwipeChatDrawer } from './components/SwipeChatDrawer';
import stadiumCrowdImg from './assets/images/stadium_crowd_arena_1789123732909.jpg';
import {
  createNewGameState,
  executeDiceRoll,
  executeMovePiece,
  advanceTurn
} from './utils/ludoEngine';
import { chooseBestAIMove } from './utils/aiBot';
import { soundManager } from './utils/audio';
import { voiceManager } from './utils/voiceManager';
import { Mic, Volume2 } from 'lucide-react';
import { COLOR_CONFIG } from './utils/ludoBoard';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'p_default';
  // Use sessionStorage exclusively so each browser tab/window is an independent player
  let sid: string | null = null;
  try {
    sid = sessionStorage.getItem('ludo_session_id');
  } catch {
    // ignore access error
  }

  if (!sid) {
    sid = 'p_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    try {
      sessionStorage.setItem('ludo_session_id', sid);
    } catch {
      // ignore
    }
  }
  return sid;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [theme, setTheme] = useState<BoardTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ludo_board_theme') as BoardTheme | null;
      if (saved && ['classic', 'royal', 'heritage', 'neon', 'roblox'].includes(saved)) {
        return saved;
      }
    }
    return 'classic';
  });

  const handleBoardThemeChange = (newTheme: BoardTheme) => {
    setTheme(newTheme);
    if (gameState) {
      setGameState((prev) => (prev ? { ...prev, theme: newTheme } : null));
    }
    try {
      localStorage.setItem('ludo_board_theme', newTheme);
    } catch {
      // ignore
    }
  };
  const [diceTheme, setDiceTheme] = useState<DiceTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ludo_dice_theme') as DiceTheme | null;
      if (saved && ['classic', 'digital', 'cartoon', 'royal'].includes(saved)) {
        return saved;
      }
    }
    return 'classic';
  });
  const [viewStyle, setViewStyle] = useState<GameViewStyle>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ludo_view_style') as GameViewStyle | null;
      if (saved && ['classic', 'modern3d'].includes(saved)) {
        return saved;
      }
    }
    return 'modern3d';
  });
  const [isMuted, setIsMuted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showArenaIntro, setShowArenaIntro] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');
  const [floatingEmojis, setFloatingEmojis] = useState<Record<PlayerColor, string | undefined>>({
    red: undefined,
    green: undefined,
    yellow: undefined,
    blue: undefined
  });
  const [activeSpeaker, setActiveSpeaker] = useState<{
    name: string;
    color: PlayerColor;
    transcript?: string;
  } | null>(null);

  // Mobile Swipe-To-Chat Drawer State & Gestures
  const [isSwipeChatOpen, setIsSwipeChatOpen] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Detect horizontal swipe (horizontal delta > 55px and dominant over vertical delta)
    if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      setIsSwipeChatOpen(true);
      soundManager.playPieceStep();
      soundManager.vibrate(20);
    }
  };

  const handleDiceThemeChange = (newTheme: DiceTheme) => {
    setDiceTheme(newTheme);
    try {
      localStorage.setItem('ludo_dice_theme', newTheme);
    } catch {
      // ignore
    }
  };

  const handleViewStyleChange = (style: GameViewStyle) => {
    setViewStyle(style);
    try {
      localStorage.setItem('ludo_view_style', style);
    } catch {
      // ignore
    }
  };

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const aiTimersRef = useRef<NodeJS.Timeout[]>([]);
  const lastHandledAiKeyRef = useRef<string>('');
  const playerTurnTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTurnTimers = () => {
    aiTimersRef.current.forEach(clearTimeout);
    aiTimersRef.current = [];
    playerTurnTimersRef.current.forEach(clearTimeout);
    playerTurnTimersRef.current = [];
    lastHandledAiKeyRef.current = '';
  };

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Extract ?room=XYZ from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        setInitialRoomCode(roomParam.trim().toUpperCase());
      }
    }
  }, []);

  // Initialize Socket connection with auto-reconnection
  useEffect(() => {
    const socket = io({
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      const current = gameStateRef.current;
      if (current && current.mode === 'online' && current.roomId) {
        socket.emit('room:reconnect', {
          roomId: current.roomId,
          sessionId: getOrCreateSessionId()
        });
      }
    });

    socket.on('room:state', (state: GameState) => {
      setGameState((prevState) => {
        if ((!prevState || prevState.status === 'lobby') && state.status === 'playing') {
          setShowArenaIntro(true);
        }
        return state;
      });
      setErrorMessage(null);
    });

    socket.on('room:error', (msg: string) => {
      setErrorMessage(msg);
      soundManager.vibrate([40, 40, 40]);
      setTimeout(() => setErrorMessage(null), 5000);
    });

    socket.on('game:dice_rolled', ({ color, diceValue }) => {
      soundManager.playDiceRoll();
      soundManager.vibrate(30);
    });

    socket.on('game:piece_moved', ({ capturedColor, reachedHome }) => {
      if (capturedColor) {
        soundManager.playCapture();
        soundManager.vibrate([60, 50, 100]);
      } else if (reachedHome) {
        soundManager.playHomeGoal();
        soundManager.vibrate([100, 50, 150]);
      } else {
        soundManager.playPieceStep();
      }
    });

    socket.on('game:emoji', ({ color, emoji }) => {
      setFloatingEmojis((prev) => ({ ...prev, [color]: emoji }));
      setTimeout(() => {
        setFloatingEmojis((prev) => ({ ...prev, [color]: undefined }));
      }, 2500);
    });

    socket.on('game:voice_broadcast', (data) => {
      if (!soundManager.isMuted && data.audioData) {
        voiceManager.playAudio(data.audioData, soundManager.volume);
      }
      setActiveSpeaker({
        name: data.senderName,
        color: data.senderColor,
        transcript: data.transcript
      });
      const durationMs = Math.max(3000, ((data.duration || 3) * 1000) + 800);
      setTimeout(() => {
        setActiveSpeaker(null);
      }, durationMs);
    });

    socket.on('game:voice_speaking', ({ senderColor, isSpeaking }) => {
      if (isSpeaking) {
        const p = gameStateRef.current?.players.find((pl) => pl.color === senderColor);
        if (p) {
          setActiveSpeaker({
            name: p.name,
            color: senderColor
          });
        }
      } else {
        setActiveSpeaker(null);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Local/AI Mode Game Runner (when mode is not online)
  useEffect(() => {
    if (!gameState || gameState.mode === 'online' || gameState.status !== 'playing') {
      clearAllTurnTimers();
      return;
    }

    const currentTurnPlayer = gameState.players[gameState.activeColorIndex];
    if (!currentTurnPlayer || !currentTurnPlayer.isAI) {
      // It's a human player's turn: clear any pending AI timers
      aiTimersRef.current.forEach(clearTimeout);
      aiTimersRef.current = [];
      lastHandledAiKeyRef.current = '';
      return;
    }

    const aiColor = currentTurnPlayer.color;

    // Form unique key for the current AI turn phase
    const actionKey = `${gameState.activeColorIndex}_${gameState.consecutiveSixes}_${
      gameState.canRoll ? 'roll' : gameState.diceValue ?? 'none'
    }`;

    if (lastHandledAiKeyRef.current === actionKey) {
      return;
    }
    lastHandledAiKeyRef.current = actionKey;

    if (gameState.canRoll) {
      // Phase 1: AI rolls dice
      // Wait 500ms thinking delay, then show dice rolling animation
      const rollTimer = setTimeout(() => {
        setGameState((s1) => {
          if (!s1 || s1.status !== 'playing' || s1.turnColor !== aiColor || !s1.canRoll) {
            return s1;
          }
          soundManager.playDiceRoll();
          return { ...s1, isRolling: true };
        });

        // Phase 2: Finish roll animation and compute dice result after 550ms
        const finishTimer = setTimeout(() => {
          setGameState((s2) => {
            if (!s2 || s2.status !== 'playing' || s2.turnColor !== aiColor) {
              return s2;
            }

            const rollResult = executeDiceRoll(s2);
            return rollResult.state;
          });
        }, 550);
        aiTimersRef.current.push(finishTimer);
      }, 500);
      aiTimersRef.current.push(rollTimer);
    } else if (gameState.diceValue !== null) {
      // Phase 3: Dice has been rolled for the AI
      if (gameState.validPiecesToMove.length === 0) {
        // No moves available: wait 1500ms so players can clearly read the explanation, then advance turn safely
        const passTimer = setTimeout(() => {
          setGameState((s3) => {
            if (!s3 || s3.status !== 'playing' || s3.turnColor !== aiColor) return s3;
            return advanceTurn(s3);
          });
        }, 1500);
        aiTimersRef.current.push(passTimer);
      } else {
        // AI has valid pieces to move: wait 750ms thinking delay, then select and move best piece
        const moveTimer = setTimeout(() => {
          setGameState((s4) => {
            if (!s4 || s4.status !== 'playing' || s4.turnColor !== aiColor) return s4;

            const bestPieceId = chooseBestAIMove(
              s4,
              aiColor,
              s4.diceValue || 1,
              currentTurnPlayer.aiDifficulty || 'medium'
            );

            if (bestPieceId !== null) {
              const moveResult = executeMovePiece(s4, bestPieceId);
              if (moveResult.capturedColor) {
                soundManager.playCapture();
              } else if (moveResult.reachedHome) {
                soundManager.playHomeGoal();
              } else {
                soundManager.playPieceStep();
              }
              return moveResult.state;
            }
            return advanceTurn(s4);
          });
        }, 750);
        aiTimersRef.current.push(moveTimer);
      }
    }
  }, [gameState]);

  // Online Action Handlers
  const handleCreateOnlineRoom = ({
    playerName,
    avatar,
    maxPlayers,
    fillWithAI,
    aiDifficulty
  }: {
    playerName: string;
    avatar: string;
    maxPlayers: 2 | 3 | 4;
    fillWithAI: boolean;
    aiDifficulty: AIDifficulty;
  }) => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:create', {
      playerName,
      avatar,
      maxPlayers,
      fillWithAI,
      aiDifficulty,
      sessionId: getOrCreateSessionId()
    });
  };

  const handleJoinOnlineRoom = ({
    roomCode,
    playerName,
    avatar
  }: {
    roomCode: string;
    playerName: string;
    avatar: string;
  }) => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:join', {
      roomCode: roomCode.trim().toUpperCase(),
      playerName,
      avatar,
      sessionId: getOrCreateSessionId()
    });
  };

  const handleStartLobbyGame = () => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit('room:start', { roomId: gameState.roomId });
  };

  // Local Pass & Play Setup
  const handleStartLocalGame = ({
    playersCount,
    players
  }: {
    playersCount: 2 | 3 | 4;
    players: { name: string; avatar: string }[];
  }) => {
    const colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
    const playerObjects: Player[] = players.slice(0, playersCount).map((p, idx) => ({
      id: `local_${idx}`,
      name: p.name,
      color: colors[idx],
      isAI: false,
      isConnected: true,
      avatar: p.avatar
    }));

    const newState = createNewGameState({
      roomId: 'local_' + Date.now(),
      roomCode: 'LOCAL',
      hostId: 'local_0',
      mode: 'local',
      maxPlayers: playersCount,
      players: playerObjects,
      theme
    });
    newState.status = 'playing';
    setShowArenaIntro(true);
    setGameState(newState);
  };

  // AI Solo Game Setup
  const handleStartAIGame = ({
    playerName,
    avatar,
    botCount,
    aiDifficulty
  }: {
    playerName: string;
    avatar: string;
    botCount: 1 | 2 | 3;
    aiDifficulty: AIDifficulty;
  }) => {
    const colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
    const botNames = ['روبوت الصقر', 'روبوت البرق', 'روبوت الفارس'];
    const botAvatars = ['falcon', 'lightning', 'swords'];

    const playerObjects: Player[] = [
      {
        id: 'local_user',
        name: playerName,
        color: 'red',
        isAI: false,
        isConnected: true,
        avatar: avatar || 'crown'
      }
    ];

    for (let i = 1; i <= botCount; i++) {
      playerObjects.push({
        id: `ai_${i}`,
        name: botNames[i - 1] || `بوت ${i + 1}`,
        color: colors[i],
        isAI: true,
        aiDifficulty,
        isConnected: true,
        avatar: botAvatars[i - 1] || 'bot'
      });
    }

    const newState = createNewGameState({
      roomId: 'ai_' + Date.now(),
      roomCode: 'VS-AI',
      hostId: 'local_user',
      mode: 'ai',
      maxPlayers: (botCount + 1) as 2 | 3 | 4,
      players: playerObjects,
      theme
    });
    newState.status = 'playing';
    setShowArenaIntro(true);
    setGameState(newState);
  };

  // In-Game Interaction Handlers
  const handleRollDice = () => {
    if (!gameState || gameState.status !== 'playing') return;

    if (gameState.mode === 'online') {
      if (!socketRef.current) return;
      socketRef.current.emit('game:roll_dice', {
        roomId: gameState.roomId,
        sessionId: getOrCreateSessionId()
      });
    } else {
      // Local/AI Mode
      if (!gameState.canRoll) return;

      // Clear any pending player turn timers
      playerTurnTimersRef.current.forEach(clearTimeout);
      playerTurnTimersRef.current = [];

      const currentTurnColor = gameState.turnColor;
      const result = executeDiceRoll(gameState);
      soundManager.playDiceRoll();
      setGameState(result.state);

      if (result.shouldPassTurn) {
        const passTimer = setTimeout(() => {
          setGameState((prev) => {
            if (!prev || prev.status !== 'playing' || prev.turnColor !== currentTurnColor) {
              return prev;
            }
            return advanceTurn(prev);
          });
        }, 1500);
        playerTurnTimersRef.current.push(passTimer);
      }
    }
  };

  const handleSelectPiece = (pieceId: number) => {
    if (!gameState || gameState.status !== 'playing') return;

    if (gameState.mode === 'online') {
      if (!socketRef.current) return;
      socketRef.current.emit('game:move_piece', {
        roomId: gameState.roomId,
        pieceId,
        sessionId: getOrCreateSessionId()
      });
    } else {
      // Local/AI Mode
      playerTurnTimersRef.current.forEach(clearTimeout);
      playerTurnTimersRef.current = [];

      const result = executeMovePiece(gameState, pieceId);
      if (result.capturedColor) {
        soundManager.playCapture();
      } else if (result.reachedHome) {
        soundManager.playHomeGoal();
      } else {
        soundManager.playPieceStep();
      }
      setGameState(result.state);
    }
  };

  const handleSendChat = (text?: string, emoji?: string) => {
    if (!gameState) return;
    if (gameState.mode === 'online') {
      if (!socketRef.current) return;
      socketRef.current.emit('game:chat', {
        roomId: gameState.roomId,
        text,
        emoji
      });
    } else {
      // Local emoji flash
      if (emoji) {
        const turnCol = gameState.turnColor;
        setFloatingEmojis((prev) => ({ ...prev, [turnCol]: emoji }));
        setTimeout(() => {
          setFloatingEmojis((prev) => ({ ...prev, [turnCol]: undefined }));
        }, 2500);
      }
      if (text) {
        const currentTurnColor = gameState.turnColor;
        const player = gameState.players.find((p) => p.color === currentTurnColor) || gameState.players[0];
        const chatMsg: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          senderId: player.id,
          senderName: player.name,
          senderColor: player.color,
          text,
          timestamp: Date.now()
        };
        setGameState((prev) =>
          prev ? { ...prev, chatMessages: [...(prev.chatMessages || []).slice(-30), chatMsg] } : prev
        );
      }
    }
  };

  const handleSendVoiceNote = (audioData: string, duration: number, transcript?: string) => {
    if (!gameState) return;
    if (gameState.mode === 'online') {
      if (!socketRef.current) return;
      socketRef.current.emit('game:voice_send', {
        roomId: gameState.roomId,
        audioData,
        duration,
        transcript
      });
    } else {
      // Local mode
      const currentTurnColor = gameState.turnColor;
      const player = gameState.players.find((p) => p.color === currentTurnColor) || gameState.players[0];
      const voiceMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        senderId: player.id,
        senderName: player.name,
        senderColor: player.color,
        text: transcript ? `🎙️ ${transcript}` : '🎙️ رسالة صوتية',
        audioData,
        audioDuration: duration,
        isVoice: true,
        timestamp: Date.now()
      };
      setGameState((prev) =>
        prev ? { ...prev, chatMessages: [...(prev.chatMessages || []).slice(-30), voiceMsg] } : prev
      );
      // Play voice locally in single-player
      if (!soundManager.isMuted) {
        voiceManager.playAudio(audioData, soundManager.volume);
      }
      setActiveSpeaker({
        name: player.name,
        color: player.color,
        transcript
      });
      setTimeout(() => setActiveSpeaker(null), Math.max(3000, duration * 1000 + 800));
    }
  };

  const handleVoiceSpeaking = (isSpeaking: boolean) => {
    if (!gameState || gameState.mode !== 'online' || !socketRef.current) return;
    socketRef.current.emit('game:voice_speaking', {
      roomId: gameState.roomId,
      isSpeaking
    });
  };

  const handleRematch = () => {
    if (!gameState) return;
    clearAllTurnTimers();
    if (gameState.mode === 'online') {
      if (!socketRef.current) return;
      socketRef.current.emit('game:rematch', { roomId: gameState.roomId });
    } else {
      // Local rematch
      const reset = createNewGameState({
        roomId: gameState.roomId,
        roomCode: gameState.roomCode,
        hostId: gameState.hostId,
        mode: gameState.mode,
        maxPlayers: gameState.maxPlayers,
        players: gameState.players.map((p) => ({ ...p, rank: undefined })),
        theme
      });
      reset.status = 'playing';
      setShowArenaIntro(true);
      setGameState(reset);
    }
  };

  const handleLeaveGame = () => {
    clearAllTurnTimers();
    setGameState(null);
  };

  const handleToggleMute = () => {
    soundManager.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Determine if it is the current local user's turn
  const isMyTurn = React.useMemo(() => {
    if (!gameState || gameState.status !== 'playing') return false;
    if (gameState.mode === 'local') return true; // Local pass and play is always playable on screen
    if (gameState.mode === 'ai') {
      const activePlayer = gameState.players[gameState.activeColorIndex];
      return Boolean(activePlayer && !activePlayer.isAI);
    }
    // Online mode
    const activePlayer = gameState.players[gameState.activeColorIndex];
    if (!activePlayer) return false;
    const mySessionId = getOrCreateSessionId();
    return Boolean(
      activePlayer.id === socketRef.current?.id ||
      (activePlayer.sessionId && activePlayer.sessionId === mySessionId)
    );
  }, [gameState]);

  const currentSessionId = getOrCreateSessionId();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif] relative overflow-x-hidden">
      {/* Stadium Arena Crowd Ambient Background - Vivid & Present Everywhere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img
          src={stadiumCrowdImg}
          alt="صالة الجماهير والمدرجات"
          className="w-full h-full object-cover object-center opacity-70 sm:opacity-80 scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Stadium Spotlights and Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,6,23,0.7)_90%)]" />

        {/* Dynamic Stadium Light Beams */}
        <div className="absolute -top-10 left-1/4 w-72 h-[600px] bg-gradient-to-b from-amber-400/25 via-amber-300/10 to-transparent rotate-[25deg] blur-2xl animate-pulse" />
        <div className="absolute -top-10 right-1/4 w-72 h-[600px] bg-gradient-to-b from-cyan-400/25 via-blue-300/10 to-transparent -rotate-[25deg] blur-2xl animate-pulse" />
      </div>

      {/* Toast Error Message */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-2xl border border-rose-400 animate-bounce">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Main Screen Content */}
      {!gameState || gameState.status === 'lobby' ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <Lobby
            onCreateOnlineRoom={handleCreateOnlineRoom}
            onJoinOnlineRoom={handleJoinOnlineRoom}
            onStartLocalGame={handleStartLocalGame}
            onStartAIGame={handleStartAIGame}
            onOpenRules={() => setShowRules(true)}
            onOpenSettings={() => setShowSettings(true)}
            boardTheme={theme}
            onChangeBoardTheme={handleBoardThemeChange}
            diceTheme={diceTheme}
            initialRoomCode={initialRoomCode}
            lobbyState={
              gameState?.status === 'lobby'
                ? {
                    roomCode: gameState.roomCode,
                    players: gameState.players,
                    maxPlayers: gameState.maxPlayers,
                    isHost:
                      gameState.hostId === socketRef.current?.id ||
                      gameState.players.find((p) => p.id === gameState.hostId)?.sessionId === currentSessionId,
                    onStartGame: handleStartLobbyGame,
                    onLeaveLobby: handleLeaveGame
                  }
                : null
            }
          />
        </div>
      ) : (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-2 sm:p-4 gap-2 sm:gap-3 touch-pan-y"
        >
          {/* Top Controls Bar */}
          <GameControls
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            theme={theme}
            onChangeTheme={setTheme}
            diceTheme={diceTheme}
            onChangeDiceTheme={handleDiceThemeChange}
            viewStyle={viewStyle}
            onChangeViewStyle={handleViewStyleChange}
            onOpenSettings={() => setShowSettings(true)}
            onReplayIntro={() => setShowArenaIntro(true)}
            roomCode={gameState.mode === 'online' ? gameState.roomCode : undefined}
            isOnlineMode={gameState.mode === 'online'}
            chatMessages={gameState.chatMessages || []}
            onSendChat={handleSendChat}
            onSendVoiceNote={handleSendVoiceNote}
            onVoiceSpeaking={handleVoiceSpeaking}
            myColor={
              gameState.players.find(
                (p) =>
                  p.id === socketRef.current?.id ||
                  (Boolean(p.sessionId) && p.sessionId === currentSessionId)
              )?.color || gameState.turnColor
            }
            myName={
              gameState.players.find(
                (p) =>
                  p.id === socketRef.current?.id ||
                  (Boolean(p.sessionId) && p.sessionId === currentSessionId)
              )?.name || 'اللاعب'
            }
            onOpenRules={() => setShowRules(true)}
            onLeaveGame={handleLeaveGame}
            onToggleSwipeChat={() => setIsSwipeChatOpen((prev) => !prev)}
          />

          {/* Live Active Voice Speaker Banner */}
          {activeSpeaker && (
            <div className="flex items-center justify-center -mb-1 animate-in fade-in zoom-in-95 duration-200">
              <div
                className={`px-4 py-1.5 rounded-full border shadow-xl flex items-center gap-2.5 backdrop-blur-md ${
                  activeSpeaker.color === 'red'
                    ? 'bg-rose-950/90 border-rose-500/60 text-rose-200 ring-2 ring-rose-500/30'
                    : activeSpeaker.color === 'green'
                    ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200 ring-2 ring-emerald-500/30'
                    : activeSpeaker.color === 'yellow'
                    ? 'bg-amber-950/90 border-amber-500/60 text-amber-200 ring-2 ring-amber-500/30'
                    : 'bg-blue-950/90 border-blue-500/60 text-blue-200 ring-2 ring-blue-500/30'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Mic className="w-4 h-4 animate-pulse text-white" />
                  <span className="font-bold text-xs">{activeSpeaker.name} يتحدث الآن</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-current rounded-full animate-bounce" />
                  <span className="w-1 h-5 bg-current rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
                {activeSpeaker.transcript && (
                  <span className="text-[11px] opacity-90 italic max-w-[220px] truncate border-r border-current/30 pr-2 mr-1">
                    "{activeSpeaker.transcript}"
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Players Grid Header (Top 2 players) */}
          <div className="grid grid-cols-2 gap-2">
            {gameState.players.slice(0, 2).map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isActiveTurn={gameState.turnColor === player.color}
                pieces={gameState.pieces[player.color] || []}
                lastEmoji={floatingEmojis[player.color]}
                isCurrentUser={
                  player.id === socketRef.current?.id ||
                  (Boolean(player.sessionId) && player.sessionId === currentSessionId)
                }
              />
            ))}
          </div>

          {/* Center Ludo Board & Side/Bottom Dice */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4 my-auto">
            <div className="w-full flex justify-center">
              <div className="relative p-6 sm:p-8">
                {/* Seated players around the 3D board during gameplay */}
                <TableSeatedPlayers
                  players={gameState.players}
                  activeTurnColor={gameState.turnColor}
                  isWideView={false}
                />

                <Board
                  pieces={gameState.pieces}
                  validPiecesToMove={gameState.validPiecesToMove}
                  turnColor={gameState.turnColor}
                  isMyTurn={isMyTurn}
                  canRoll={gameState.canRoll}
                  diceValue={gameState.diceValue}
                  onSelectPiece={handleSelectPiece}
                  theme={theme}
                  viewStyle={viewStyle}
                  onChangeViewStyle={handleViewStyleChange}
                />
              </div>
            </div>

            {/* Interactive Dice Widget */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-xl shrink-0 min-w-[130px]">
              <Dice
                value={gameState.diceValue}
                isRolling={gameState.isRolling}
                canRoll={gameState.canRoll}
                turnColor={gameState.turnColor}
                isMyTurn={isMyTurn}
                onRoll={handleRollDice}
                disabled={!isMyTurn}
                passTurnMessage={gameState.passTurnMessage}
                validPiecesCount={gameState.validPiecesToMove?.length ?? 0}
                diceTheme={diceTheme}
                activePlayerName={gameState.players[gameState.activeColorIndex]?.name}
                isTurnPlayerAI={Boolean(gameState.players[gameState.activeColorIndex]?.isAI)}
              />
            </div>
          </div>

          {/* Bottom Players Grid (Players 3 and 4 if present) */}
          {gameState.players.length > 2 && (
            <div className="grid grid-cols-2 gap-2">
              {gameState.players.slice(2, 4).map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isActiveTurn={gameState.turnColor === player.color}
                  pieces={gameState.pieces[player.color] || []}
                  lastEmoji={floatingEmojis[player.color]}
                  isCurrentUser={
                    player.id === socketRef.current?.id ||
                    (Boolean(player.sessionId) && player.sessionId === currentSessionId)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Victory Celebration Modal */}
      {gameState && gameState.status === 'ended' && (
        <VictoryModal
          winnerColor={gameState.winner}
          rankings={gameState.rankings}
          players={gameState.players}
          onRematch={handleRematch}
          onHome={handleLeaveGame}
        />
      )}

      {/* Arena Crowd Stadium Intro */}
      {showArenaIntro && gameState && gameState.status === 'playing' && (
        <ArenaIntro
          players={gameState.players}
          theme={theme}
          viewStyle={viewStyle}
          onComplete={() => setShowArenaIntro(false)}
        />
      )}

      {/* Illustrated Rules & Tutorial Modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* Mobile Swipe-To-Chat Drawer */}
      {gameState && gameState.status === 'playing' && (
        <SwipeChatDrawer
          isOpen={isSwipeChatOpen}
          onOpen={() => setIsSwipeChatOpen(true)}
          onClose={() => setIsSwipeChatOpen(false)}
          chatMessages={gameState.chatMessages || []}
          onSendChat={handleSendChat}
          onSendVoiceNote={handleSendVoiceNote}
          onVoiceSpeaking={handleVoiceSpeaking}
          myColor={
            gameState.players.find(
              (p) =>
                p.id === socketRef.current?.id ||
                (Boolean(p.sessionId) && p.sessionId === currentSessionId)
            )?.color || gameState.turnColor
          }
          myName={
            gameState.players.find(
              (p) =>
                p.id === socketRef.current?.id ||
                (Boolean(p.sessionId) && p.sessionId === currentSessionId)
            )?.name || 'اللاعب'
          }
          isOnlineMode={gameState.mode === 'online'}
        />
      )}

      {/* Game & Dice Theme Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        diceTheme={diceTheme}
        onChangeDiceTheme={handleDiceThemeChange}
        boardTheme={theme}
        onChangeBoardTheme={(newTheme) => {
          setTheme(newTheme);
          if (gameState) {
            setGameState((prev) => (prev ? { ...prev, theme: newTheme } : null));
          }
        }}
        viewStyle={viewStyle}
        onChangeViewStyle={handleViewStyleChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />
    </main>
  );
}
