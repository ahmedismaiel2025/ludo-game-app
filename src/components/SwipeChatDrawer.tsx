import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Sparkles,
  Send,
  Mic,
  Volume2,
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Smile,
  Radio,
  GripVertical
} from 'lucide-react';
import { ChatMessage, PlayerColor } from '../types';
import { COLOR_CONFIG } from '../utils/ludoBoard';
import { soundManager } from '../utils/audio';
import { voiceManager, VoiceRecordingResult } from '../utils/voiceManager';

interface SwipeChatDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  chatMessages: ChatMessage[];
  onSendChat: (text?: string, emoji?: string) => void;
  onSendVoiceNote?: (audioData: string, duration: number, transcript?: string) => void;
  onVoiceSpeaking?: (isSpeaking: boolean) => void;
  myColor?: PlayerColor;
  myName?: string;
  isOnlineMode: boolean;
}

const QUICK_EMOJIS = ['😂', '🔥', '👑', '🎯', '👏', '😱', '💪', '⚡', '🎲', '🏆', '⚔️', '🚀'];
const QUICK_PHRASES = [
  'يا حريف! 🔥',
  'حظك نار النهاردة! 🎲',
  'مش هسيبك تعدي خالص! ⚔️',
  'العب بسرعة يا كابتن ⏳',
  'لعبة حلوة والله! 👏',
  'مبروك مقدماً يا بطل 👑',
  'هجيب ستة وأكلك دلوقتي! 🎯',
  'أنا الفايز بالدور ده 🏆'
];

export const SwipeChatDrawer: React.FC<SwipeChatDrawerProps> = ({
  isOpen,
  onOpen,
  onClose,
  chatMessages,
  onSendChat,
  onSendVoiceNote,
  onVoiceSpeaking,
  myColor = 'red',
  myName = 'اللاعب',
  isOnlineMode
}) => {
  const [customInput, setCustomInput] = useState('');
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [swipeNotice, setSwipeNotice] = useState<string | null>(null);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  // Recording Timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
      if (onVoiceSpeaking) onVoiceSpeaking(true);
    } else {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      if (onVoiceSpeaking) onVoiceSpeaking(false);
    }
  }, [isRecordingVoice, onVoiceSpeaking]);

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onSendChat(customInput.trim());
    setCustomInput('');
    soundManager.playPieceStep();
  };

  const handleStartVoiceRecord = async () => {
    const ok = await voiceManager.startRecording();
    if (ok) {
      setIsRecordingVoice(true);
    } else {
      setSwipeNotice('يرجى السماح بالمايكروفون 🎙️');
      setTimeout(() => setSwipeNotice(null), 2500);
    }
  };

  const handleStopAndSendVoice = async () => {
    if (!isRecordingVoice) return;
    setIsRecordingVoice(false);
    const res: VoiceRecordingResult | null = await voiceManager.stopRecording();
    if (res && res.audioData && onSendVoiceNote) {
      onSendVoiceNote(res.audioData, res.duration, res.transcript);
      setSwipeNotice('تم إرسال الرسالة الصوتية 🚀');
      setTimeout(() => setSwipeNotice(null), 2500);
    }
  };

  const handlePlayVoiceMsg = (msg: ChatMessage) => {
    if (!msg.audioData) return;

    if (playingMsgId === msg.id && activeAudioRef.current) {
      activeAudioRef.current.pause();
      setPlayingMsgId(null);
      return;
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }

    const audio = voiceManager.playAudio(msg.audioData, soundManager.volume);
    if (audio) {
      activeAudioRef.current = audio;
      setPlayingMsgId(msg.id);
      audio.onended = () => setPlayingMsgId(null);
      audio.onerror = () => setPlayingMsgId(null);
    }
  };

  return (
    <>
      {/* Side Edge Swipe Handle (Visible on mobile/small screens when drawer is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-40 sm:hidden flex items-center"
          >
            <button
              onClick={() => {
                soundManager.playPieceStep();
                soundManager.vibrate(20);
                onOpen();
              }}
              className="bg-slate-900/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-l-0 border-amber-500/50 py-3.5 px-1.5 rounded-r-2xl shadow-2xl backdrop-blur-md flex flex-col items-center gap-1 group active:scale-95 transition-all"
              title="اسحب أو اضغط للدردشة السريعة"
            >
              <GripVertical className="w-3.5 h-3.5 opacity-60" />
              <MessageSquare className="w-4 h-4 text-amber-400 group-hover:text-slate-950 animate-bounce" />
              <span className="[writing-mode:vertical-lr] text-[10px] font-black tracking-wider py-1">
                اسحب للدردشة 💬
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:text-slate-950" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over Drawer Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md transition-opacity"
          />
        )}
      </AnimatePresence>

      {/* Mobile Swipe Chat Side Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              // Close if dragged significantly to the left
              if (info.offset.x < -80 || info.velocity.x < -300) {
                soundManager.vibrate(15);
                onClose();
              }
            }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[88vw] max-w-sm bg-slate-900/95 border-r border-slate-700/80 shadow-2xl flex flex-col text-slate-100 backdrop-blur-2xl"
            style={{
              boxShadow: '10px 0 30px rgba(0,0,0,0.8)'
            }}
          >
            {/* Drawer Header */}
            <div className="p-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                    الدردشة السريعة 💬
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      مباشر
                    </span>
                  </h3>
                  <span className="text-[10px] text-slate-400 block">
                    اسحب لليسار للإغلاق ✕
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="إغلاق الدردشة"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Top Quick Emoji Reaction Strip (1-click send) */}
            <div className="px-3 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-inner">
              <span className="text-[10px] font-black text-amber-400 shrink-0 flex items-center gap-1 ml-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                <Smile className="w-3 h-3" />
                سريع:
              </span>
              {['😂', '😡', '👍', '👏', '🔥', '👑', '😱', '🎯', '💪', '⚔️'].map((emoji) => (
                <button
                  key={`top-strip-${emoji}`}
                  onClick={() => {
                    onSendChat(undefined, emoji);
                    soundManager.playPieceStep();
                  }}
                  className="text-lg p-1.5 rounded-xl bg-slate-800/90 hover:bg-amber-500/30 hover:scale-125 active:scale-90 border border-slate-700/80 transition-transform shrink-0 flex items-center justify-center shadow-sm"
                  title={`إرسال ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Notice Bar */}
            {swipeNotice && (
              <div className="bg-amber-500/20 text-amber-300 text-center py-1 text-xs font-bold border-b border-amber-500/30">
                {swipeNotice}
              </div>
            )}

            {/* Main Scrollable Chat Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Quick Emojis Grid */}
              <div>
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mb-1.5">
                  <Smile className="w-3.5 h-3.5" />
                  إرسال رمز تعبيري سريع:
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onSendChat(undefined, emoji);
                        soundManager.playPieceStep();
                      }}
                      className="text-2xl p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 hover:scale-110 active:scale-90 border border-slate-700/60 transition flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Phrases (Text Only) */}
              <div>
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  عبارات سريعة:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_PHRASES.map((phrase) => (
                    <button
                      key={phrase}
                      onClick={() => {
                        onSendChat(phrase);
                        soundManager.playPieceStep();
                      }}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-amber-950/40 text-slate-200 hover:text-amber-300 border border-slate-700/70 text-right text-xs font-bold transition flex items-center justify-between active:scale-95"
                    >
                      <span className="truncate">{phrase}</span>
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 opacity-70" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Voice Note Recorder */}
              <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-col items-center justify-center text-center">
                {!isRecordingVoice ? (
                  <button
                    onClick={handleStartVoiceRecord}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition"
                  >
                    <Mic className="w-4 h-4" />
                    <span>تسجيل بصوتك للغرفة 🎙️</span>
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-rose-400 animate-pulse flex items-center gap-1">
                      <Radio className="w-4 h-4 animate-spin" />
                      جاري التسجيل ({recordSeconds}ث)...
                    </span>
                    <button
                      onClick={handleStopAndSendVoice}
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 animate-bounce"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال 🚀</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Chat Message History Feed */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">
                  سجل المحادثة بالغرفة:
                </span>

                {chatMessages.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4 italic">
                    لا توجد رسائل بعد... كن أول من يتحدث! 💬
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {chatMessages.map((msg) => {
                      const cfg = COLOR_CONFIG[msg.senderColor || 'red'];
                      const isPlaying = playingMsgId === msg.id;

                      return (
                        <div
                          key={msg.id}
                          className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <span className={`font-black ${cfg.text} ml-1`}>
                              {msg.senderName}:
                            </span>
                            <span className="text-slate-100 font-medium">
                              {msg.text || msg.emoji}
                            </span>
                          </div>

                          {msg.audioData && (
                            <button
                              onClick={() => handlePlayVoiceMsg(msg)}
                              className={`p-1.5 rounded-full text-white shrink-0 ${
                                isPlaying
                                  ? 'bg-rose-500 animate-pulse'
                                  : 'bg-emerald-600 hover:bg-emerald-500'
                              }`}
                              title="تشغيل الصوت"
                            >
                              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Custom Input Footer */}
            <div className="p-3 bg-slate-800/90 border-t border-slate-700">
              <form onSubmit={handleSendCustomMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اكتب رسالة للجميع..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  maxLength={70}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!customInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs transition flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
