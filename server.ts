import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import {
  GameState,
  Player,
  PlayerColor,
  AIDifficulty,
  ChatMessage,
  ServerToClientEvents,
  ClientToServerEvents
} from './src/types';
import {
  createNewGameState,
  executeDiceRoll,
  executeMovePiece,
  createInitialPieces,
  advanceTurn
} from './src/utils/ludoEngine';
import { chooseBestAIMove } from './src/utils/aiBot';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingInterval: 10000,
  pingTimeout: 25000,
  transports: ['websocket', 'polling']
});

// Rooms storage
const rooms = new Map<string, GameState>();
const roomCodeToId = new Map<string, string>();
const socketToRoom = new Map<string, { roomId: string; playerId: string; sessionId?: string }>();
const disconnectGraceTimers = new Map<string, NodeJS.Timeout>();
const disconnectPendingTimers = new Map<string, NodeJS.Timeout>();

const ALL_COLORS: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
const AVATARS = ['crown', 'swords', 'flame', 'lightning', 'falcon', 'target', 'gem', 'trophy'];

function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Automatically play turn if a human player is disconnected so game never freezes
function scheduleTurnAutoPlayIfOffline(roomId: string, turnColor: PlayerColor) {
  const timerKey = `${roomId}_${turnColor}`;
  if (disconnectGraceTimers.has(timerKey)) return;

  const timer = setTimeout(() => {
    disconnectGraceTimers.delete(timerKey);
    const state = rooms.get(roomId);
    if (!state || state.status !== 'playing' || state.turnColor !== turnColor) return;

    const currentPlayer = state.players.find((p) => p.color === turnColor);
    if (!currentPlayer || currentPlayer.isConnected) return; // Player reconnected

    // Player is still offline: roll and move on their behalf
    if (state.canRoll) {
      const rollResult = executeDiceRoll(state);
      rooms.set(roomId, rollResult.state);
      io.to(roomId).emit('game:dice_rolled', {
        color: turnColor,
        diceValue: rollResult.diceValue
      });
      io.to(roomId).emit('room:state', rollResult.state);

      if (rollResult.shouldPassTurn) {
        setTimeout(() => {
          const s = rooms.get(roomId);
          if (!s || s.status !== 'playing' || s.turnColor !== turnColor) return;
          const next = advanceTurn(s);
          rooms.set(roomId, next);
          io.to(roomId).emit('room:state', next);
          triggerAITurnIfNeeded(roomId);
        }, 1200);
        return;
      }

      setTimeout(() => {
        const s = rooms.get(roomId);
        if (!s || s.status !== 'playing' || s.turnColor !== turnColor) return;
        const bestPieceId = chooseBestAIMove(s, turnColor, rollResult.diceValue, 'easy');
        if (bestPieceId !== null) {
          const moveRes = executeMovePiece(s, bestPieceId);
          rooms.set(roomId, moveRes.state);
          io.to(roomId).emit('game:piece_moved', {
            color: turnColor,
            pieceId: bestPieceId,
            fromStep: s.pieces[turnColor].find((p) => p.id === bestPieceId)?.step ?? -1,
            toStep: moveRes.state.pieces[turnColor].find((p) => p.id === bestPieceId)?.step ?? 0,
            capturedColor: moveRes.capturedColor,
            reachedHome: moveRes.reachedHome
          });
          io.to(roomId).emit('room:state', moveRes.state);
          setTimeout(() => triggerAITurnIfNeeded(roomId), 800);
        }
      }, 900);
    }
  }, 12000); // 12 seconds grace period

  disconnectGraceTimers.set(timerKey, timer);
}

// AI Turn execution helper on server
function triggerAITurnIfNeeded(roomId: string) {
  const state = rooms.get(roomId);
  if (!state || state.status !== 'playing') return;

  const currentTurnPlayer = state.players[state.activeColorIndex];
  if (!currentTurnPlayer) return;

  // If disconnected human player, schedule grace timer
  if (!currentTurnPlayer.isAI) {
    if (!currentTurnPlayer.isConnected) {
      scheduleTurnAutoPlayIfOffline(roomId, currentTurnPlayer.color);
    }
    return;
  }

  const aiColor = currentTurnPlayer.color;

  // Step 1: Roll dice after short human-like thinking delay
  setTimeout(() => {
    const currentState = rooms.get(roomId);
    if (!currentState || currentState.status !== 'playing' || currentState.turnColor !== aiColor) return;

    if (currentState.canRoll) {
      const rollResult = executeDiceRoll(currentState);
      rooms.set(roomId, rollResult.state);

      io.to(roomId).emit('game:dice_rolled', {
        color: aiColor,
        diceValue: rollResult.diceValue
      });
      io.to(roomId).emit('room:state', rollResult.state);

      if (rollResult.shouldPassTurn) {
        // Keep dice value visible with message for 1.2s, then advance turn
        setTimeout(() => {
          const s = rooms.get(roomId);
          if (!s || s.status !== 'playing' || s.turnColor !== aiColor) return;
          const nextState = advanceTurn(s);
          rooms.set(roomId, nextState);
          io.to(roomId).emit('room:state', nextState);
          triggerAITurnIfNeeded(roomId);
        }, 1200);
        return;
      }

      // Step 2: Choose best piece to move
      setTimeout(() => {
        const afterRollState = rooms.get(roomId);
        if (!afterRollState || afterRollState.status !== 'playing' || afterRollState.turnColor !== aiColor) return;

        const bestPieceId = chooseBestAIMove(
          afterRollState,
          aiColor,
          rollResult.diceValue,
          currentTurnPlayer.aiDifficulty || 'medium'
        );

        if (bestPieceId !== null) {
          const moveResult = executeMovePiece(afterRollState, bestPieceId);
          rooms.set(roomId, moveResult.state);

          io.to(roomId).emit('game:piece_moved', {
            color: aiColor,
            pieceId: bestPieceId,
            fromStep: afterRollState.pieces[aiColor].find((p) => p.id === bestPieceId)?.step ?? -1,
            toStep: moveResult.state.pieces[aiColor].find((p) => p.id === bestPieceId)?.step ?? 0,
            capturedColor: moveResult.capturedColor,
            reachedHome: moveResult.reachedHome
          });
          io.to(roomId).emit('room:state', moveResult.state);

          // If bonus roll or next turn is also AI
          setTimeout(() => triggerAITurnIfNeeded(roomId), 800);
        }
      }, 900);
    }
  }, 900);
}

// Health check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: rooms.size,
    timestamp: Date.now()
  });
});

// Room details API for quick link verification
app.get('/api/rooms/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const roomId = roomCodeToId.get(code);
  if (!roomId || !rooms.has(roomId)) {
    return res.status(404).json({ error: 'Room not found' });
  }
  const state = rooms.get(roomId)!;
  res.json({
    roomId: state.roomId,
    roomCode: state.roomCode,
    status: state.status,
    playerCount: state.players.length,
    maxPlayers: state.maxPlayers,
    players: state.players.map((p) => ({ name: p.name, color: p.color, avatar: p.avatar, isAI: p.isAI }))
  });
});

// Socket.IO Events
io.on('connection', (socket: Socket) => {
  // 1. Create Room
  socket.on('room:create', ({ playerName, avatar, maxPlayers, fillWithAI, aiDifficulty, sessionId }) => {
    const roomId = 'room_' + Math.random().toString(36).substring(2, 9);
    let roomCode = generateRoomCode();
    while (roomCodeToId.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const hostSessionId = sessionId || `sess_${socket.id}`;
    const hostPlayer: Player = {
      id: socket.id,
      sessionId: hostSessionId,
      name: playerName || 'المضيف',
      color: 'red',
      isAI: false,
      isConnected: true,
      avatar: avatar || 'crown'
    };

    const players: Player[] = [hostPlayer];

    // If fillWithAI is enabled for 2, 3 or 4 players
    if (fillWithAI) {
      const botNames = ['روبوت الصقر', 'روبوت البرق', 'روبوت الفارس'];
      for (let i = 1; i < maxPlayers; i++) {
        players.push({
          id: `ai_${i}_${Math.random().toString(36).substring(2, 6)}`,
          sessionId: `ai_sess_${i}`,
          name: botNames[i - 1] || `بوت ${i + 1}`,
          color: ALL_COLORS[i],
          isAI: true,
          aiDifficulty: aiDifficulty || 'medium',
          isConnected: true,
          avatar: AVATARS[i % AVATARS.length]
        });
      }
    }

    const gameState = createNewGameState({
      roomId,
      roomCode,
      hostId: socket.id,
      mode: 'online',
      maxPlayers,
      players
    });

    rooms.set(roomId, gameState);
    roomCodeToId.set(roomCode, roomId);
    socketToRoom.set(socket.id, { roomId, playerId: socket.id, sessionId: hostSessionId });

    socket.join(roomId);
    socket.emit('room:state', gameState);
  });

  // 2. Join Room
  socket.on('room:join', ({ roomCode, playerName, avatar, sessionId }) => {
    const cleanCode = (roomCode || '').trim().toUpperCase();
    const roomId = roomCodeToId.get(cleanCode);

    if (!roomId || !rooms.has(roomId)) {
      socket.emit('room:error', 'رمز الغرفة غير صحيح أو أن الغرفة غير موجودة');
      return;
    }

    const state = rooms.get(roomId)!;
    const playerSessionId = sessionId || `sess_${socket.id}`;

    // Check if player is rejoining existing room with their sessionId
    const existingPlayer = state.players.find(
      (p) => (p.sessionId && p.sessionId === playerSessionId) || p.id === socket.id
    );

    if (existingPlayer) {
      existingPlayer.id = socket.id;
      existingPlayer.sessionId = playerSessionId;
      existingPlayer.isConnected = true;
      if (playerName) existingPlayer.name = playerName;
      if (avatar) existingPlayer.avatar = avatar;

      socketToRoom.set(socket.id, { roomId, playerId: socket.id, sessionId: playerSessionId });
      socket.join(roomId);

      // Cancel disconnect grace timer if any
      const timerKey = `${roomId}_${existingPlayer.color}`;
      if (disconnectGraceTimers.has(timerKey)) {
        clearTimeout(disconnectGraceTimers.get(timerKey)!);
        disconnectGraceTimers.delete(timerKey);
      }
      if (disconnectPendingTimers.has(timerKey)) {
        clearTimeout(disconnectPendingTimers.get(timerKey)!);
        disconnectPendingTimers.delete(timerKey);
      }

      io.to(roomId).emit('room:state', state);
      return;
    }

    if (state.status !== 'lobby') {
      socket.emit('room:error', 'اللعبة بدأت بالفعل ولا يمكن الانضمام الآن');
      return;
    }

    if (state.players.length >= state.maxPlayers) {
      socket.emit('room:error', 'الغرفة ممتلئة بالكامل');
      return;
    }

    // Determine color
    const usedColors = state.players.map((p) => p.color);
    const availableColor = ALL_COLORS.find((c) => !usedColors.includes(c)) || 'blue';

    const newPlayer: Player = {
      id: socket.id,
      sessionId: playerSessionId,
      name: playerName || `لاعب ${state.players.length + 1}`,
      color: availableColor,
      isAI: false,
      isConnected: true,
      avatar: avatar || AVATARS[state.players.length % AVATARS.length]
    };

    state.players.push(newPlayer);
    socketToRoom.set(socket.id, { roomId, playerId: socket.id, sessionId: playerSessionId });

    socket.join(roomId);
    io.to(roomId).emit('room:state', state);
  });

  // Reconnect player after mobile network blip
  socket.on('room:reconnect', ({ roomId, sessionId }) => {
    const state = rooms.get(roomId);
    if (!state) return;

    const player = state.players.find(
      (p) => (p.sessionId && p.sessionId === sessionId) || p.id === socket.id
    );

    if (player) {
      player.id = socket.id;
      player.sessionId = sessionId;
      player.isConnected = true;
      socketToRoom.set(socket.id, { roomId, playerId: socket.id, sessionId });
      socket.join(roomId);

      // Cancel disconnect grace timer if any
      const timerKey = `${roomId}_${player.color}`;
      if (disconnectGraceTimers.has(timerKey)) {
        clearTimeout(disconnectGraceTimers.get(timerKey)!);
        disconnectGraceTimers.delete(timerKey);
      }
      if (disconnectPendingTimers.has(timerKey)) {
        clearTimeout(disconnectPendingTimers.get(timerKey)!);
        disconnectPendingTimers.delete(timerKey);
      }

      io.to(roomId).emit('room:state', state);
    }
  });

  // 3. Start Game
  socket.on('room:start', ({ roomId }) => {
    const state = rooms.get(roomId);
    if (!state) return;

    if (state.hostId !== socket.id) {
      socket.emit('room:error', 'فقط المضيف يمكنه بدء اللعبة');
      return;
    }

    if (state.players.length < 2) {
      socket.emit('room:error', 'يجب وجود لاعبين على الأقل لبدء اللعبة');
      return;
    }

    state.status = 'playing';
    state.canRoll = true;
    state.activeColorIndex = 0;
    state.turnColor = state.players[0].color;
    state.pieces = createInitialPieces();

    io.to(roomId).emit('room:state', state);
    triggerAITurnIfNeeded(roomId);
  });

  // 4. Roll Dice
  socket.on('game:roll_dice', ({ roomId, sessionId }) => {
    const state = rooms.get(roomId);
    if (!state || state.status !== 'playing') return;

    const mapping = socketToRoom.get(socket.id);
    const clientSessionId = sessionId || mapping?.sessionId;

    const currentPlayer = state.players[state.activeColorIndex];
    if (!currentPlayer) return;

    // Validate turn either by matching socket ID or by matching sessionId
    const isPlayerMatch =
      currentPlayer.id === socket.id ||
      (Boolean(clientSessionId) && currentPlayer.sessionId === clientSessionId);

    if (!isPlayerMatch) {
      return; // Not player's turn
    }

    // Auto-heal connection status & socket ID if client reconnected seamlessly
    if (currentPlayer.id !== socket.id) {
      currentPlayer.id = socket.id;
      socketToRoom.set(socket.id, { roomId, playerId: socket.id, sessionId: currentPlayer.sessionId });
      socket.join(roomId);
    }
    currentPlayer.isConnected = true;

    // Cancel any pending disconnect or auto-play timer
    const timerKey = `${roomId}_${currentPlayer.color}`;
    if (disconnectGraceTimers.has(timerKey)) {
      clearTimeout(disconnectGraceTimers.get(timerKey)!);
      disconnectGraceTimers.delete(timerKey);
    }
    if (disconnectPendingTimers.has(timerKey)) {
      clearTimeout(disconnectPendingTimers.get(timerKey)!);
      disconnectPendingTimers.delete(timerKey);
    }

    if (!state.canRoll) return;

    const result = executeDiceRoll(state);
    rooms.set(roomId, result.state);

    io.to(roomId).emit('game:dice_rolled', {
      color: currentPlayer.color,
      diceValue: result.diceValue
    });
    io.to(roomId).emit('room:state', result.state);

    if (result.shouldPassTurn) {
      // Keep dice value visible with message for 1.2s, then pass turn
      setTimeout(() => {
        const curr = rooms.get(roomId);
        if (!curr || curr.status !== 'playing') return;
        const nextState = advanceTurn(curr);
        rooms.set(roomId, nextState);
        io.to(roomId).emit('room:state', nextState);
        triggerAITurnIfNeeded(roomId);
      }, 1200);
    }
  });

  // 5. Move Piece
  socket.on('game:move_piece', ({ roomId, pieceId, sessionId }) => {
    const state = rooms.get(roomId);
    if (!state || state.status !== 'playing') return;

    const mapping = socketToRoom.get(socket.id);
    const clientSessionId = sessionId || mapping?.sessionId;

    const currentPlayer = state.players[state.activeColorIndex];
    if (!currentPlayer) return;

    const isPlayerMatch =
      currentPlayer.id === socket.id ||
      (Boolean(clientSessionId) && currentPlayer.sessionId === clientSessionId);

    if (!isPlayerMatch) {
      return; // Not player's turn
    }

    // Auto-heal socket & connection status
    if (currentPlayer.id !== socket.id) {
      currentPlayer.id = socket.id;
      socketToRoom.set(socket.id, { roomId, playerId: socket.id, sessionId: currentPlayer.sessionId });
      socket.join(roomId);
    }
    currentPlayer.isConnected = true;

    // Cancel timers
    const timerKey = `${roomId}_${currentPlayer.color}`;
    if (disconnectGraceTimers.has(timerKey)) {
      clearTimeout(disconnectGraceTimers.get(timerKey)!);
      disconnectGraceTimers.delete(timerKey);
    }
    if (disconnectPendingTimers.has(timerKey)) {
      clearTimeout(disconnectPendingTimers.get(timerKey)!);
      disconnectPendingTimers.delete(timerKey);
    }

    const currentPiece = state.pieces[currentPlayer.color]?.find((p) => p.id === pieceId);
    const fromStep = currentPiece ? currentPiece.step : -1;

    const result = executeMovePiece(state, pieceId);
    rooms.set(roomId, result.state);

    const updatedPiece = result.state.pieces[currentPlayer.color]?.find((p) => p.id === pieceId);
    const toStep = updatedPiece ? updatedPiece.step : fromStep;

    io.to(roomId).emit('game:piece_moved', {
      color: currentPlayer.color,
      pieceId,
      fromStep,
      toStep,
      capturedColor: result.capturedColor,
      reachedHome: result.reachedHome
    });
    io.to(roomId).emit('room:state', result.state);

    // If next turn is AI
    setTimeout(() => triggerAITurnIfNeeded(roomId), 800);
  });

  // 6. Chat / Emoji / Voice
  socket.on('game:chat', ({ roomId, text, emoji, audioData, audioDuration, isVoice }) => {
    const state = rooms.get(roomId);
    if (!state) return;

    const player = state.players.find((p) => p.id === socket.id);
    if (!player) return;

    const chatMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      senderId: socket.id,
      senderName: player.name,
      senderColor: player.color,
      text,
      emoji,
      audioData,
      audioDuration,
      isVoice,
      timestamp: Date.now()
    };

    state.chatMessages = [...(state.chatMessages || []).slice(-30), chatMsg];

    io.to(roomId).emit('game:chat', chatMsg);
    if (emoji) {
      io.to(roomId).emit('game:emoji', {
        senderId: socket.id,
        color: player.color,
        emoji
      });
    }
  });

  // Voice Chat: Direct audio broadcast & speech transcription
  socket.on('game:voice_send', ({ roomId, audioData, duration, transcript }) => {
    const state = rooms.get(roomId);
    if (!state) return;

    const player = state.players.find((p) => p.id === socket.id);
    if (!player) return;

    const voiceMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      senderId: socket.id,
      senderName: player.name,
      senderColor: player.color,
      text: transcript ? `🎙️ ${transcript}` : '🎙️ رسالة صوتية',
      audioData,
      audioDuration: duration,
      isVoice: true,
      timestamp: Date.now()
    };

    state.chatMessages = [...(state.chatMessages || []).slice(-30), voiceMsg];

    io.to(roomId).emit('game:chat', voiceMsg);
    io.to(roomId).emit('game:voice_broadcast', {
      senderId: socket.id,
      senderName: player.name,
      senderColor: player.color,
      audioData,
      duration,
      transcript
    });
  });

  socket.on('game:voice_speaking', ({ roomId, isSpeaking }) => {
    const state = rooms.get(roomId);
    if (!state) return;

    const player = state.players.find((p) => p.id === socket.id);
    if (!player) return;

    io.to(roomId).emit('game:voice_speaking', {
      senderId: socket.id,
      senderColor: player.color,
      isSpeaking
    });
  });

  // 7. Rematch
  socket.on('game:rematch', ({ roomId }) => {
    const state = rooms.get(roomId);
    if (!state) return;

    const resetState = createNewGameState({
      roomId: state.roomId,
      roomCode: state.roomCode,
      hostId: state.hostId,
      mode: state.mode,
      maxPlayers: state.maxPlayers,
      players: state.players.map((p) => ({ ...p, rank: undefined })),
      theme: state.theme
    });
    resetState.status = 'playing';

    rooms.set(roomId, resetState);
    io.to(roomId).emit('room:state', resetState);
    triggerAITurnIfNeeded(roomId);
  });

  // Disconnect handler with 5-second grace buffer to prevent false "offline" alarms during transport switches
  socket.on('disconnect', () => {
    const mapping = socketToRoom.get(socket.id);
    if (!mapping) return;

    const { roomId, sessionId } = mapping;
    const state = rooms.get(roomId);
    if (!state) {
      socketToRoom.delete(socket.id);
      return;
    }

    const player = state.players.find(
      (p) => p.id === socket.id || (sessionId && p.sessionId === sessionId)
    );
    if (!player) {
      socketToRoom.delete(socket.id);
      return;
    }

    const timerKey = `${roomId}_${player.color}`;
    if (disconnectPendingTimers.has(timerKey)) {
      clearTimeout(disconnectPendingTimers.get(timerKey)!);
    }

    const timer = setTimeout(() => {
      disconnectPendingTimers.delete(timerKey);
      const curr = rooms.get(roomId);
      if (!curr) return;

      const p = curr.players.find((pl) => pl.color === player.color);
      if (p && p.id === socket.id) {
        // Confirmed offline after grace buffer
        p.isConnected = false;
        io.to(roomId).emit('room:state', curr);

        if (curr.status === 'playing' && curr.turnColor === p.color) {
          scheduleTurnAutoPlayIfOffline(roomId, p.color);
        }
      }
    }, 5000);

    disconnectPendingTimers.set(timerKey, timer);
    socketToRoom.delete(socket.id);
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Ludo server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
