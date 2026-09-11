import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Palette,
  MessageSquare,
  Mic,
  MicOff,
  Radio,
  Share2,
  Check,
  Copy,
  LogOut,
  HelpCircle,
  Sparkles,
  Sliders,
  Tv,
  Play,
  Pause
} from 'lucide-react';
import { BoardTheme, DiceTheme, ChatMessage, PlayerColor, GameViewStyle } from '../types';
import { COLOR_CONFIG } from '../utils/ludoBoard';
import { soundManager } from '../utils/audio';
import { voiceManager } from '../utils/voiceManager';
import { VoiceChatModal } from './VoiceChatModal';

interface GameControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  theme: BoardTheme;
  onChangeTheme: (theme: BoardTheme) => void;
  diceTheme: DiceTheme;
  onChangeDiceTheme: (theme: DiceTheme) => void;
  viewStyle?: GameViewStyle;
  onChangeViewStyle?: (style: GameViewStyle) => void;
  onOpenSettings: () => void;
  onReplayIntro?: () => void;
  roomCode?: string;
  isOnlineMode: boolean;
  chatMessages: ChatMessage[];
  onSendChat: (text?: string, emoji?: string) => void;
  onSendVoiceNote?: (audioData: string, duration: number, transcript?: string) => void;
  onVoiceSpeaking?: (isSpeaking: boolean) => void;
  myColor?: PlayerColor;
  myName?: string;
  onOpenRules: () => void;
  onLeaveGame: () => void;
  onToggleSwipeChat?: () => void;
}

const QUICK_EMOJIS = ['😂', '🔥', '👑', '🎯', '👏', '😱', '💪', '⚡'];
const QUICK_PHRASES = [
  'يا حريف! 🔥',
  'حظك نار! 🎲',
  'مش هسيبك تعدي! ⚔️',
  'العب بسرعة ⏳',
  'لعبة حلوة! 👏',
  'مبروك مقدماً 👑'
];

export const GameControls: React.FC<GameControlsProps> = ({
  isMuted,
  onToggleMute,
  theme,
  onChangeTheme,
  diceTheme,
  onChangeDiceTheme,
  viewStyle = 'modern3d',
  onChangeViewStyle,
  onOpenSettings,
  onReplayIntro,
  roomCode,
  isOnlineMode,
  chatMessages,
  onSendChat,
  onSendVoiceNote,
  onVoiceSpeaking,
  myColor = 'red',
  myName = 'اللاعب',
  onOpenRules,
  onLeaveGame,
  onToggleSwipeChat
}) => {
  const [showChat, setShowChat] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  const handleCopyLink = () => {
    if (!roomCode) return;
    const shareUrl = `${window.location.origin}?room=${roomCode}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    if (!roomCode) return;
    const shareUrl = `${window.location.origin}?room=${roomCode}`;
    const text = encodeURIComponent(
      `🎲 تعال نلعب ليدو أونلاين معايا الآن!\nرمز الغرفة: ${roomCode}\nرابط الدخول المباشر: ${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSendCustomChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onSendChat(customInput.trim());
    soundManager.speakVoice(customInput.trim());
    setCustomInput('');
  };

  const handlePlayVoiceInChat = (msg: ChatMessage) => {
    if (!msg.audioData) return;
    if (playingMsgId === msg.id) {
      setPlayingMsgId(null);
      return;
    }
    const audio = voiceManager.playAudio(msg.audioData, soundManager.volume);
    if (audio) {
      setPlayingMsgId(msg.id);
      audio.onended = () => setPlayingMsgId(null);
      audio.onerror = () => setPlayingMsgId(null);
    }
  };

  return (
    <div className="w-full flex items-center justify-between gap-2 px-2 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl">
      {/* Left side actions */}
      <div className="flex items-center gap-1.5">
        {/* Sound Toggle */}
        <button
          id="btn-toggle-sound"
          onClick={onToggleMute}
          title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          className={`p-2 rounded-xl border transition-colors ${
            isMuted
              ? 'bg-slate-800 text-slate-500 border-slate-700'
              : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* 3D Modern vs Classic Quick Toggle */}
        {onChangeViewStyle && (
          <button
            id="btn-toggle-view-style"
            onClick={() => onChangeViewStyle(viewStyle === 'modern3d' ? 'classic' : 'modern3d')}
            title="تبديل مظهر اللعبة: كلاسيكي 2D أو موديرن 3D"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
              viewStyle === 'modern3d'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400/80 shadow-md shadow-cyan-500/20'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            <span>{viewStyle === 'modern3d' ? '⚡ 3D' : '🎲 2D'}</span>
            <span className="hidden sm:inline">{viewStyle === 'modern3d' ? 'موديرن' : 'كلاسيك'}</span>
          </button>
        )}

        {/* Settings & Theme Trigger */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          title="إعدادات ومظهر اللعبة والنرد"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors flex items-center gap-1"
        >
          <Sliders className="w-4 h-4" />
          <span className="hidden sm:inline text-[11px] font-bold">الإعدادات</span>
        </button>

        {/* Quick Theme Picker Dropdown */}
        <div className="relative">
          <button
            id="btn-open-theme"
            type="button"
            onClick={() => setShowThemePicker(!showThemePicker)}
            title="تبديل سريع للمظهر"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showThemePicker && (
            <>
              {/* Invisible Backdrop to close on click outside */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setShowThemePicker(false)}
              />

              <div className="absolute top-11 right-0 z-50 bg-slate-900 border border-slate-700 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[200px] animate-in fade-in">
                {/* Game View Style: Classic vs 3D */}
                {onChangeViewStyle && (
                  <div>
                    <span className="text-[10px] font-extrabold text-cyan-400 px-1 py-0.5 block">
                      ✨ نمط العرض
                    </span>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onChangeViewStyle('classic');
                          setShowThemePicker(false);
                        }}
                        className={`text-xs px-2 py-1.5 rounded-lg text-center font-bold transition-colors ${
                          viewStyle === 'classic'
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        🎲 كلاسيك 2D
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onChangeViewStyle('modern3d');
                          setShowThemePicker(false);
                        }}
                        className={`text-xs px-2 py-1.5 rounded-lg text-center font-bold transition-colors ${
                          viewStyle === 'modern3d'
                            ? 'bg-cyan-500 text-slate-950 font-black'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        ⚡ موديرن 3D
                      </button>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-slate-800 my-0.5" />

                {/* Dice Theme Section */}
                <div>
                  <span className="text-[10px] font-extrabold text-amber-400 px-1 py-0.5 block">
                    🎲 مظهر النرد
                  </span>
                  <div className="flex flex-col gap-1 mt-1">
                    {(
                      [
                        { id: 'classic', label: '🎲 كلاسيكي عاجي' },
                        { id: 'digital', label: '📟 رقمي ديجيتال' },
                        { id: 'cartoon', label: '🎨 كرتوني مرح' },
                        { id: 'royal', label: '👑 ملكي ذهبي' }
                      ] as const
                    ).map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          onChangeDiceTheme(d.id);
                          setShowThemePicker(false);
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-lg text-right font-semibold transition-colors flex items-center justify-between ${
                          diceTheme === d.id
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{d.label}</span>
                        {diceTheme === d.id && <span className="text-[11px] font-black">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-800 my-0.5" />

                {/* Board Theme Section */}
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 px-1 py-0.5 block">
                    🎨 رقعة اللعب
                  </span>
                  <div className="flex flex-col gap-1 mt-1">
                    {(['classic', 'royal', 'heritage', 'neon'] as BoardTheme[]).map((th) => (
                      <button
                        key={th}
                        type="button"
                        onClick={() => {
                          onChangeTheme(th);
                          setShowThemePicker(false);
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-lg text-right font-semibold transition-colors flex items-center justify-between ${
                          theme === th
                            ? 'bg-sky-500 text-slate-950 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>
                          {th === 'classic' && '🪵 كلاسيكي (خشبي)'}
                          {th === 'royal' && '👑 ملكي (ذهبي)'}
                          {th === 'heritage' && '🏛️ تراثي (أندلسي)'}
                          {th === 'neon' && '⚡ نيون ليزر'}
                        </span>
                        {theme === th && <span className="text-[11px] font-black">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* More settings button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowThemePicker(false);
                    onOpenSettings();
                  }}
                  className="mt-1 pt-1.5 border-t border-slate-800 text-[11px] font-bold text-amber-400 hover:text-amber-300 text-center"
                >
                  المزيد من الإعدادات والمعاينة ⚙️
                </button>
              </div>
            </>
          )}
        </div>

        {/* Rules button */}
        <button
          id="btn-open-rules"
          onClick={onOpenRules}
          title="شرح قواعد ليدو"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Replay Arena Crowd Intro button */}
        {onReplayIntro && (
          <button
            id="btn-replay-intro"
            onClick={onReplayIntro}
            title="إعادة عرض إنترو صالة الجماهير والتقريب السينمائي 🎬"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-pink-400 border border-slate-700 transition-colors flex items-center gap-1"
          >
            <Tv className="w-4 h-4" />
            <span className="hidden md:inline text-[11px] font-bold">إنترو الساحة</span>
          </button>
        )}
      </div>

      {/* Center: Online Room Code Badge if online */}
      {isOnlineMode && roomCode && (
        <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">الغرفة:</span>
          <span className="font-mono font-black text-amber-400 tracking-wider">
            {roomCode}
          </span>
          <button
            onClick={handleCopyLink}
            title="نسخ رابط الغرفة"
            className="p-1 hover:bg-slate-800 rounded text-slate-300 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleShareWhatsApp}
            title="مشاركة عبر واتساب"
            className="p-1 hover:bg-emerald-950/80 rounded text-emerald-400 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Right side: Voice Chat, Text Chat & Exit */}
      <div className="flex items-center gap-1.5">
        {/* VOICE CHAT BUTTON & POPOVER */}
        <div className="relative">
          <button
            id="btn-open-voice-chat"
            onClick={() => {
              setShowVoiceModal(!showVoiceModal);
              if (showChat) setShowChat(false);
            }}
            title="المحادثة الصوتية والتحدث بالمايكروفون"
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
              showVoiceModal
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 ring-2 ring-emerald-400/40'
                : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">شات صوتي 🎙️</span>
          </button>

          {/* Voice Chat Popover Dropdown */}
          <VoiceChatModal
            isOpen={showVoiceModal}
            onClose={() => setShowVoiceModal(false)}
            onSendVoiceNote={(audioData, duration, transcript) => {
              if (onSendVoiceNote) {
                onSendVoiceNote(audioData, duration, transcript);
              }
            }}
            onVoiceSpeaking={onVoiceSpeaking}
            onSendChatText={(text) => onSendChat(text)}
            chatMessages={chatMessages}
            myColor={myColor}
            myName={myName}
            isOnline={isOnlineMode}
          />
        </div>

        {/* Chat / Reactions */}
        <div className="relative">
          <button
            id="btn-open-chat"
            onClick={() => {
              if (onToggleSwipeChat) {
                onToggleSwipeChat();
              } else {
                setShowChat(!showChat);
              }
              if (showVoiceModal) setShowVoiceModal(false);
            }}
            className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">محادثة</span>
          </button>

          {/* Quick Chat & Emojis Drawer */}
          {showChat && (
            <div className="absolute top-11 left-0 sm:left-auto sm:right-0 z-50 bg-slate-900/95 border border-slate-700 p-3 rounded-2xl shadow-2xl w-72 max-h-[420px] flex flex-col gap-2.5 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  ردود سريعة ورموز
                </span>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-xs text-slate-400 hover:text-white px-1.5"
                >
                  ✕
                </button>
              </div>

              {/* Emoji bar */}
              <div className="grid grid-cols-4 gap-1.5">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSendChat(undefined, emoji);
                      setShowChat(false);
                    }}
                    className="text-xl p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 hover:scale-110 transition active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Quick phrases */}
              <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
                {QUICK_PHRASES.map((phrase) => (
                  <button
                    key={phrase}
                    onClick={() => {
                      onSendChat(phrase);
                      soundManager.speakVoice(phrase);
                      setShowChat(false);
                    }}
                    className="text-xs text-right font-medium text-slate-200 bg-slate-800/60 hover:bg-slate-700/80 px-2.5 py-1.5 rounded-lg border border-slate-700/50 transition"
                  >
                    {phrase}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <form onSubmit={handleSendCustomChat} className="flex gap-1 pt-1 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="اكتب رسالة..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  maxLength={60}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="bg-amber-500 text-slate-950 px-3 py-1 rounded-lg text-xs font-bold hover:bg-amber-400 transition shrink-0"
                >
                  إرسال
                </button>
              </form>

              {/* Recent Chat Feed with Voice message player */}
              {chatMessages.length > 0 && (
                <div className="mt-1 pt-1 border-t border-slate-800 max-h-32 overflow-y-auto flex flex-col gap-1.5 text-[11px]">
                  {chatMessages.slice(-5).map((msg) => {
                    const cfg = COLOR_CONFIG[msg.senderColor];
                    return (
                      <div key={msg.id} className="flex items-center justify-between gap-1.5 bg-slate-800/40 p-1.5 rounded-lg">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`font-bold ${cfg.text}`}>{msg.senderName}:</span>
                          <span className="text-slate-200 truncate">{msg.text || msg.emoji}</span>
                        </div>
                        {msg.audioData && (
                          <button
                            type="button"
                            onClick={() => handlePlayVoiceInChat(msg)}
                            className="p-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                            title="تشغيل الرسالة الصوتية"
                          >
                            {playingMsgId === msg.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Leave Game */}
        <button
          id="btn-leave-game"
          onClick={onLeaveGame}
          title="الخروج للقائمة الرئيسية"
          className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
