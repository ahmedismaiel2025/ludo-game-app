import React, { useState, useEffect } from 'react';
import {
  Users,
  Globe,
  Bot,
  Copy,
  Check,
  Share2,
  Play,
  Sparkles,
  HelpCircle,
  Crown,
  UserCheck,
  LogIn,
  Sliders,
  Palette,
  History,
  Trophy,
  Flame,
  Percent,
  ArrowRight,
  LogOut,
  X
} from 'lucide-react';
import { AIDifficulty, Player, DiceTheme, BoardTheme } from '../types';
import { PREDEFINED_AVATARS, DEFAULT_AVATAR_ID, getAvatarById } from '../data/avatars';
import { AvatarDisplay } from './AvatarDisplay';
import { AvatarPicker } from './AvatarPicker';
import { getPlayerStats, PlayerStats } from '../utils/playerStats';
import { MatchHistoryModal } from './MatchHistoryModal';

interface LobbyProps {
  onCreateOnlineRoom: (params: {
    playerName: string;
    avatar: string;
    maxPlayers: 2 | 3 | 4;
    fillWithAI: boolean;
    aiDifficulty: AIDifficulty;
  }) => void;
  onJoinOnlineRoom: (params: {
    roomCode: string;
    playerName: string;
    avatar: string;
  }) => void;
  onStartLocalGame: (params: {
    playersCount: 2 | 3 | 4;
    players: { name: string; avatar: string }[];
  }) => void;
  onStartAIGame: (params: {
    playerName: string;
    avatar: string;
    botCount: 1 | 2 | 3;
    aiDifficulty: AIDifficulty;
  }) => void;
  onOpenRules: () => void;
  onOpenSettings?: () => void;
  boardTheme?: BoardTheme;
  onChangeBoardTheme?: (theme: BoardTheme) => void;
  diceTheme?: DiceTheme;
  initialRoomCode?: string;
  lobbyState?: {
    roomCode: string;
    players: Player[];
    maxPlayers: number;
    isHost: boolean;
    onStartGame: () => void;
    onLeaveLobby?: () => void;
  } | null;
}

export const Lobby: React.FC<LobbyProps> = ({
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onStartLocalGame,
  onStartAIGame,
  onOpenRules,
  onOpenSettings,
  boardTheme = 'classic',
  onChangeBoardTheme,
  diceTheme = 'classic',
  initialRoomCode = '',
  lobbyState
}) => {
  const [activeTab, setActiveTab] = useState<'online' | 'local' | 'ai'>('online');
  const [onlineSubTab, setOnlineSubTab] = useState<'create' | 'join'>('create');

  // Helper to load saved custom photo from localStorage if present
  const getSavedPhoto = (fallback: string) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ludo_custom_photo');
      if (saved) return saved;
    }
    return fallback;
  };

  // Online Create Profile State
  const [createPlayerName, setCreatePlayerName] = useState('البطل');
  const [createAvatar, setCreateAvatar] = useState(() => getSavedPhoto(DEFAULT_AVATAR_ID));
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(2);
  const [fillWithAI, setFillWithAI] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');

  // Online Join Profile State
  const [joinCode, setJoinCode] = useState(initialRoomCode);
  const [joinPlayerName, setJoinPlayerName] = useState('المتحدي');
  const [joinAvatar, setJoinAvatar] = useState(() => getSavedPhoto('swords'));
  const [copiedLink, setCopiedLink] = useState(false);

  // Local Game Form State
  const [localPlayersCount, setLocalPlayersCount] = useState<2 | 3 | 4>(2);
  const [localPlayers, setLocalPlayers] = useState<Array<{ name: string; avatar: string }>>(() => [
    { name: 'اللاعب 1 (أحمر)', avatar: getSavedPhoto('crown') },
    { name: 'اللاعب 2 (أخضر)', avatar: 'swords' },
    { name: 'اللاعب 3 (أصفر)', avatar: 'flame' },
    { name: 'اللاعب 4 (أزرق)', avatar: 'lightning' }
  ]);
  const [activeLocalAvatarSelectIdx, setActiveLocalAvatarSelectIdx] = useState<number | null>(null);

  // AI Game Form State
  const [aiPlayerName, setAiPlayerName] = useState('البطل');
  const [aiPlayerAvatar, setAiPlayerAvatar] = useState(() => getSavedPhoto('crown'));
  const [aiBotCount, setAiBotCount] = useState<1 | 2 | 3>(1);

  // Player Stats and Match History State
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => getPlayerStats());
  const [showMatchHistoryModal, setShowMatchHistoryModal] = useState(false);

  // Refresh stats whenever modal opens
  const handleOpenMatchHistory = () => {
    setPlayerStats(getPlayerStats());
    setShowMatchHistoryModal(true);
  };

  useEffect(() => {
    if (initialRoomCode) {
      setActiveTab('online');
      setOnlineSubTab('join');
      setJoinCode(initialRoomCode);
    }
  }, [initialRoomCode]);

  const handleCopyLobbyLink = () => {
    if (!lobbyState) return;
    const url = `${window.location.origin}?room=${lobbyState.roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    if (!lobbyState) return;
    const url = `${window.location.origin}?room=${lobbyState.roomCode}`;
    const msg = encodeURIComponent(
      `🎲 تعال نلعب ليدو أونلاين معايا الآن!\nرمز الغرفة: ${lobbyState.roomCode}\nرابط الدخول: ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  // If in an active Waiting Lobby for online game
  if (lobbyState) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl space-y-5 relative">
        {/* Top Header with Back / Close Button */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <button
            id="btn-lobby-back-top"
            onClick={lobbyState.onLeaveLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition border border-slate-700/60"
            title="العودة للقائمة الرئيسية"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>

          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            غرفة الانتظار أونلاين
          </div>

          <button
            onClick={lobbyState.onLeaveLobby}
            className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 flex items-center justify-center transition border border-slate-700/60"
            title="إغلاق الغرفة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center space-y-1 pt-1">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            في انتظار انضمام الأصدقاء...
          </h2>
          <p className="text-xs text-slate-400">
            شارك الرمز أو الرابط مع أصحابك للدخول من هواتفهم
          </p>
        </div>

        {/* Room Code Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border-2 border-amber-500/50 text-center space-y-3 shadow-inner">
          <span className="text-xs font-bold text-slate-400">رمز الغرفة (Room Code)</span>
          <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-amber-400 select-all">
            {lobbyState.roomCode}
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={handleCopyLobbyLink}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl shadow-lg transition"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة واتساب</span>
            </button>
          </div>
        </div>

        {/* Connected Players List with AvatarDisplay */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>اللاعبون المنضمون</span>
            <span>
              {lobbyState.players.length} / {lobbyState.maxPlayers}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: lobbyState.maxPlayers }).map((_, idx) => {
              const player = lobbyState.players[idx];
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition ${
                    player
                      ? 'bg-slate-800/90 border-slate-700 text-slate-100 shadow'
                      : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-500 justify-center'
                  }`}
                >
                  {player ? (
                    <>
                      <AvatarDisplay avatarId={player.avatar} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs truncate">{player.name}</div>
                        <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                          {idx === 0 ? '👑 المضيف' : 'لاعب'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs font-medium py-2">في الانتظار...</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {lobbyState.isHost ? (
            <button
              id="btn-start-lobby-game"
              onClick={lobbyState.onStartGame}
              disabled={lobbyState.players.length < 2}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition active:scale-95 ${
                lobbyState.players.length >= 2
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {lobbyState.players.length < 2
                  ? 'في انتظار لاعب آخر على الأقل...'
                  : 'بدء اللعبة الآن! 🎲'}
              </span>
            </button>
          ) : (
            <div className="text-center p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-bold text-amber-300 animate-pulse">
              في انتظار المضيف لبدء المباراة...
            </div>
          )}

          {/* Dedicated Leave / Cancel Button */}
          {lobbyState.onLeaveLobby && (
            <button
              id="btn-leave-lobby"
              onClick={lobbyState.onLeaveLobby}
              className="w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700/70 hover:border-rose-500/30 transition shadow"
            >
              <LogOut className="w-4 h-4" />
              <span>إلغاء ومغادرة الغرفة ↩️</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl space-y-5">
      {/* Title Header */}
      <div className="text-center space-y-1.5">
        {/* Roblox Mode Quick Switcher Badge */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <button
            type="button"
            onClick={() => {
              const nextTheme = boardTheme === 'roblox' ? 'classic' : 'roblox';
              onChangeBoardTheme?.(nextTheme);
            }}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1.5 shadow-lg ${
              boardTheme === 'roblox'
                ? 'bg-gradient-to-r from-red-600 via-emerald-600 to-sky-600 text-white ring-2 ring-amber-300 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
            }`}
          >
            <span>🤖</span>
            <span>{boardTheme === 'roblox' ? 'ثيم ليدو روبلوكس (نشط 🎮)' : 'تفعيل ليدو روبلوكس 🤖'}</span>
          </button>
        </div>

        {boardTheme === 'roblox' ? (
          /* Roblox Blox Valley Hero Header */
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-900/90 via-indigo-950/90 to-sky-900/90 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] relative">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded border border-white">
                R$ 10,000 ROBUX
              </span>
              <span className="text-xs font-black text-amber-300">BLOX VALLEY LOBBY</span>
              <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded border border-white">
                OBBY 3D
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              🎮 ليدو روبلوكس 🤖
            </h1>
            <p className="text-xs text-amber-200 font-bold mt-0.5">
              عالم روبلوكس الأصلي - تتحرك شخصيات روبلوكس بعد رمي النرد!
            </p>

            {/* Roblox Characters Row Showcase */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="text-xl animate-bounce">😃</span>
              <span className="text-xl animate-bounce [animation-delay:0.1s]">😎</span>
              <span className="text-xl animate-bounce [animation-delay:0.2s]">🦖</span>
              <span className="text-xl animate-bounce [animation-delay:0.3s]">🤖</span>
              <span className="text-xl animate-bounce [animation-delay:0.4s]">🧙‍♀️</span>
            </div>
          </div>
        ) : (
          /* Classic Header */
          <>
            <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30 shadow-sm">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>ليدو الأصدقاء</span>
              <span className="text-[10px] text-amber-400/80 bg-slate-900/80 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                تصميم أحمد إسماعيل
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400">
              ليدو الأصدقاء
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              العب أونلاين مع أصحابك بمشاركة رمز الغرفة أو على نفس الجهاز
            </p>
          </>
        )}

        {/* Quick Stats & Match History Trigger Bar */}
        <div className="pt-1.5 flex items-center justify-between gap-2">
          <button
            type="button"
            id="btn-open-match-history"
            onClick={handleOpenMatchHistory}
            className="flex-1 p-2 bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl flex items-center justify-between gap-2 transition group shadow-inner"
          >
            <div className="flex items-center gap-2 text-right">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <History className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>سجل المباريات</span>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 px-1.5 py-0.2 rounded-full border border-amber-500/30">
                    Match History
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                  <span>{playerStats.totalGames} مباراة</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{playerStats.wins} فوز</span>
                  <span>•</span>
                  <span className="text-sky-400 font-bold">{playerStats.winRate}%</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-bold text-amber-400 bg-amber-500/10 group-hover:bg-amber-500/20 px-2 py-1 rounded-xl border border-amber-500/30 transition">
              عرض السجل 📜
            </div>
          </button>
        </div>
      </div>

      {/* Main Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('online')}
          className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
            activeTab === 'online'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>أونلاين</span>
        </button>

        <button
          onClick={() => setActiveTab('local')}
          className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
            activeTab === 'local'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>نفس الهاتف</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
            activeTab === 'ai'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>ضد البوت</span>
        </button>
      </div>

      {/* 1. ONLINE TAB CONTENT */}
      {activeTab === 'online' && (
        <div className="space-y-4">
          {/* Sub-tabs: Create or Join */}
          <div className="flex gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setOnlineSubTab('create')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                onlineSubTab === 'create'
                  ? 'bg-slate-800 text-amber-300 border border-slate-700 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>إنشاء غرفة جديدة</span>
            </button>
            <button
              onClick={() => setOnlineSubTab('join')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                onlineSubTab === 'join'
                  ? 'bg-slate-800 text-amber-300 border border-slate-700 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>انضمام برمز الغرفة</span>
            </button>
          </div>

          {onlineSubTab === 'create' ? (
            <div className="space-y-4 pt-1">
              {/* Host Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">اسم اللاعب (المضيف)</label>
                <div className="flex items-center gap-2">
                  <AvatarDisplay avatarId={createAvatar} size="sm" />
                  <input
                    type="text"
                    value={createPlayerName}
                    onChange={(e) => setCreatePlayerName(e.target.value)}
                    placeholder="اسمك في اللعبة..."
                    maxLength={20}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Pre-defined Avatar Picker */}
              <AvatarPicker
                selectedAvatarId={createAvatar}
                onSelectAvatar={setCreateAvatar}
                label="اختر أيقونة شخصيتك"
              />

              {/* Max Players */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">عدد اللاعبين</label>
                <div className="grid grid-cols-3 gap-2">
                  {([2, 3, 4] as const).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxPlayers(num)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        maxPlayers === num
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {num} لاعبين
                    </button>
                  ))}
                </div>
              </div>

              {/* Fill with AI toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">ملء الأماكن الشاغرة بالبوتات</div>
                  <div className="text-[10px] text-slate-400">إذا لم ينضم أصدقاء كافيين لبدء المباراة</div>
                </div>
                <input
                  type="checkbox"
                  checked={fillWithAI}
                  onChange={(e) => setFillWithAI(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              <button
                id="btn-create-room"
                onClick={() =>
                  onCreateOnlineRoom({
                    playerName: createPlayerName.trim() || 'المضيف',
                    avatar: createAvatar,
                    maxPlayers,
                    fillWithAI,
                    aiDifficulty
                  })
                }
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <span>إنشاء الغرفة ومشاركة الرمز 🎲</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {/* Room Code */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">رمز الغرفة (5 أحرف)</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="مثال: 7B2X9"
                  maxLength={6}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-mono font-black tracking-widest text-amber-400 focus:outline-none focus:border-amber-400 uppercase"
                />
              </div>

              {/* Joining Player Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">اسم اللاعب المنضم</label>
                <div className="flex items-center gap-2">
                  <AvatarDisplay avatarId={joinAvatar} size="sm" />
                  <input
                    type="text"
                    value={joinPlayerName}
                    onChange={(e) => setJoinPlayerName(e.target.value)}
                    placeholder="اسمك..."
                    maxLength={20}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Predefined Avatar Picker for Joiner */}
              <AvatarPicker
                selectedAvatarId={joinAvatar}
                onSelectAvatar={setJoinAvatar}
                label="اختر أيقونة شخصيتك عند الانضمام"
              />

              <button
                id="btn-join-room"
                onClick={() =>
                  onJoinOnlineRoom({
                    roomCode: joinCode.trim(),
                    playerName: joinPlayerName.trim() || 'المتحدي',
                    avatar: joinAvatar
                  })
                }
                disabled={!joinCode.trim()}
                className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-95 ${
                  joinCode.trim()
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 shadow-xl shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>الانضمام للعبة فوراً 🚀</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. LOCAL PASS & PLAY TAB CONTENT */}
      {activeTab === 'local' && (
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-center">
            <span className="text-xs font-bold text-slate-200">اللعب على نفس الجهاز</span>
            <p className="text-[11px] text-slate-400">
              يتناوب اللاعبون على رمي النرد وتحريك القطع على نفس الشاشة
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">عدد اللاعبين</label>
            <div className="grid grid-cols-3 gap-2">
              {([2, 3, 4] as const).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setLocalPlayersCount(num)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    localPlayersCount === num
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {num} لاعبين
                </button>
              ))}
            </div>
          </div>

          {/* Local Players Configuration */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-300">أسماء وأيقونات اللاعبين</label>
            {Array.from({ length: localPlayersCount }).map((_, idx) => {
              const p = localPlayers[idx] || { name: `لاعب ${idx + 1}`, avatar: PREDEFINED_AVATARS[idx % PREDEFINED_AVATARS.length].id };
              const isEditingAvatar = activeLocalAvatarSelectIdx === idx;

              return (
                <div key={idx} className="space-y-2 p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveLocalAvatarSelectIdx(isEditingAvatar ? null : idx)
                      }
                      className="shrink-0 group relative"
                      title="اضغط لتغيير الأيقونة"
                    >
                      <AvatarDisplay avatarId={p.avatar} size="sm" withGlow={isEditingAvatar} />
                      <span className="absolute -bottom-1 -right-1 text-[8px] bg-slate-800 text-amber-300 px-1 rounded border border-slate-700">
                        تغيير
                      </span>
                    </button>

                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => {
                        const updated = [...localPlayers];
                        updated[idx] = { ...updated[idx], name: e.target.value };
                        setLocalPlayers(updated);
                      }}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Inline Avatar Picker for this local player */}
                  {isEditingAvatar && (
                    <div className="pt-1 border-t border-slate-800/80">
                      <AvatarPicker
                        selectedAvatarId={p.avatar}
                        onSelectAvatar={(newAvatar) => {
                          const updated = [...localPlayers];
                          updated[idx] = { ...updated[idx], avatar: newAvatar };
                          setLocalPlayers(updated);
                          setActiveLocalAvatarSelectIdx(null);
                        }}
                        label={`اختر أيقونة ${p.name}`}
                        compact={true}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            id="btn-start-local-game"
            onClick={() => {
              const players = Array.from({ length: localPlayersCount }).map((_, idx) => ({
                name: localPlayers[idx]?.name || `لاعب ${idx + 1}`,
                avatar: localPlayers[idx]?.avatar || PREDEFINED_AVATARS[idx % PREDEFINED_AVATARS.length].id
              }));
              onStartLocalGame({
                playersCount: localPlayersCount,
                players
              });
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>بدء اللعبة المحلية 🎲</span>
          </button>
        </div>
      )}

      {/* 3. SOLO VS AI TAB CONTENT */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">اسم اللاعب</label>
            <div className="flex items-center gap-2">
              <AvatarDisplay avatarId={aiPlayerAvatar} size="sm" />
              <input
                type="text"
                value={aiPlayerName}
                onChange={(e) => setAiPlayerName(e.target.value)}
                placeholder="اسمك..."
                maxLength={20}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* User's Predefined Avatar Picker */}
          <AvatarPicker
            selectedAvatarId={aiPlayerAvatar}
            onSelectAvatar={setAiPlayerAvatar}
            label="اختر أيقونة شخصيتك"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">عدد الروبوتات المنافسة</label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as const).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setAiBotCount(num)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    aiBotCount === num
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {num} بوت ({num + 1} لاعبين)
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">مستوى ذكاء البوت</label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setAiDifficulty(diff)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    aiDifficulty === diff
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {diff === 'easy' && 'سهل 🌱'}
                  {diff === 'medium' && 'متوسط ⚡'}
                  {diff === 'hard' && 'محترف 🔥'}
                </button>
              ))}
            </div>
          </div>

          <button
            id="btn-start-ai-game"
            onClick={() =>
              onStartAIGame({
                playerName: aiPlayerName.trim() || 'البطل',
                avatar: aiPlayerAvatar,
                botCount: aiBotCount,
                aiDifficulty
              })
            }
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Bot className="w-5 h-5" />
            <span>بدء التحدي ضد الذكاء الاصطناعي 🤖</span>
          </button>
        </div>
      )}

      {/* Rules and Settings trigger buttons in Lobby */}
      <div className="pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 px-1">
        <button
          onClick={onOpenRules}
          className="text-xs font-bold text-slate-400 hover:text-amber-300 flex items-center gap-1.5 transition"
        >
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>شرح القواعد والدعوة</span>
        </button>

        {onOpenSettings && (
          <button
            id="btn-lobby-open-settings"
            onClick={onOpenSettings}
            className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>مظهر النرد والرقعة</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/30">
              {diceTheme === 'classic' && '🎲 كلاسيكي'}
              {diceTheme === 'digital' && '📟 رقمي'}
              {diceTheme === 'cartoon' && '🎨 كرتوني'}
              {diceTheme === 'royal' && '👑 ملكي'}
            </span>
          </button>
        )}
      </div>

      {/* Designer Credit Tag */}
      <div className="text-center pt-1 text-[11px] text-slate-500 font-medium">
        ليدو الأصدقاء • تصميم وبرمجة <span className="text-amber-400 font-bold">أحمد إسماعيل</span>
      </div>

      {/* Match History Modal */}
      <MatchHistoryModal
        isOpen={showMatchHistoryModal}
        onClose={() => setShowMatchHistoryModal(false)}
        stats={playerStats}
        onStatsUpdated={(newStats) => setPlayerStats(newStats)}
      />
    </div>
  );
};
