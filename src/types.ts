export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type GameMode = 'online' | 'local' | 'ai';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type BoardTheme = 'classic' | 'royal' | 'heritage' | 'neon' | 'roblox';

export type DiceTheme = 'classic' | 'digital' | 'cartoon' | 'royal' | 'roblox';

export type GameViewStyle = 'classic' | 'modern3d';

export interface Piece {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // -1: in Yard, 0..50: common track, 51..55: home column, 56: finished/triumph
}

export interface Player {
  id: string; // socketId or local id
  sessionId?: string; // Persistent ID across reconnections
  name: string;
  color: PlayerColor;
  isAI: boolean;
  aiDifficulty?: AIDifficulty;
  isConnected: boolean;
  avatar: string;
  rank?: number; // 1st, 2nd, 3rd, 4th when finished
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: PlayerColor;
  text?: string;
  emoji?: string;
  audioData?: string;
  audioDuration?: number;
  isVoice?: boolean;
  timestamp: number;
}

export interface GameState {
  roomId: string;
  roomCode: string;
  hostId: string;
  mode: GameMode;
  status: 'lobby' | 'playing' | 'ended';
  players: Player[];
  activeColorIndex: number; // index in players array
  turnColor: PlayerColor;
  diceValue: number | null;
  isRolling: boolean;
  canRoll: boolean;
  consecutiveSixes: number;
  pieces: Record<PlayerColor, Piece[]>;
  winner: PlayerColor | null;
  rankings: PlayerColor[];
  lastMove: {
    color: PlayerColor;
    pieceId: number;
    fromStep: number;
    toStep: number;
    captured?: PlayerColor;
  } | null;
  validPiecesToMove: number[]; // piece IDs that can move
  turnTimeLeft: number;
  maxPlayers: 2 | 3 | 4;
  theme: BoardTheme;
  chatMessages: ChatMessage[];
  lastRollTimestamp?: number;
  passTurnMessage?: string | null;
}

export interface ServerToClientEvents {
  'room:state': (state: GameState) => void;
  'room:error': (message: string) => void;
  'game:dice_rolled': (data: { color: PlayerColor; diceValue: number }) => void;
  'game:piece_moved': (data: {
    color: PlayerColor;
    pieceId: number;
    fromStep: number;
    toStep: number;
    capturedColor?: PlayerColor;
    reachedHome?: boolean;
  }) => void;
  'game:chat': (message: ChatMessage) => void;
  'game:emoji': (data: { senderId: string; color: PlayerColor; emoji: string }) => void;
  'game:voice_broadcast': (data: {
    senderId: string;
    senderName: string;
    senderColor: PlayerColor;
    audioData: string;
    duration: number;
    transcript?: string;
  }) => void;
  'game:voice_speaking': (data: {
    senderId: string;
    senderColor: PlayerColor;
    isSpeaking: boolean;
  }) => void;
}

export interface ClientToServerEvents {
  'room:create': (data: {
    playerName: string;
    avatar: string;
    maxPlayers: 2 | 3 | 4;
    fillWithAI: boolean;
    aiDifficulty: AIDifficulty;
    sessionId?: string;
  }) => void;
  'room:join': (data: { roomCode: string; playerName: string; avatar: string; sessionId?: string }) => void;
  'room:reconnect': (data: { roomId: string; sessionId: string }) => void;
  'room:start': (data: { roomId: string }) => void;
  'game:roll_dice': (data: { roomId: string; sessionId?: string }) => void;
  'game:move_piece': (data: { roomId: string; pieceId: number; sessionId?: string }) => void;
  'game:chat': (data: { roomId: string; text?: string; emoji?: string; audioData?: string; audioDuration?: number; isVoice?: boolean }) => void;
  'game:voice_send': (data: {
    roomId: string;
    audioData: string;
    duration: number;
    transcript?: string;
  }) => void;
  'game:voice_speaking': (data: {
    roomId: string;
    isSpeaking: boolean;
  }) => void;
  'game:rematch': (data: { roomId: string }) => void;
}
