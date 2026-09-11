import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  Pause,
  Send,
  Radio,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  X
} from 'lucide-react';
import { PlayerColor, ChatMessage } from '../types';
import { voiceManager, VoiceRecordingResult } from '../utils/voiceManager';
import { soundManager } from '../utils/audio';

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceNote: (audioData: string, duration: number, transcript?: string) => void;
  onVoiceSpeaking?: (isSpeaking: boolean) => void;
  onSendChatText: (text: string) => void;
  chatMessages: ChatMessage[];
  myColor?: PlayerColor;
  myName?: string;
  isOnline: boolean;
}

const VOICE_TAUNTS = [
  { id: 'v1', text: 'يا حريف! لعبة حلوة ومبروك مقدماً', label: '🔥 يا حريف!' },
  { id: 'v2', text: 'حظك نار النهاردة في النرد!', label: '🎲 حظك نار!' },
  { id: 'v3', text: 'مش هسيبك تعدي خالص من هنا!', label: '⚔️ مش هسيبك تعدي' },
  { id: 'v4', text: 'العب بسرعة يا كابتن دورك جه', label: '⏳ العب بسرعة' },
  { id: 'v5', text: 'هجيب ستة وأكلك دلوقتي حالا!', label: '🎯 هجيب ستة' },
  { id: 'v6', text: 'عاش يا بطل رمية ممتازة والله!', label: '👏 عاش يا بطل!' },
  { id: 'v7', text: 'أنا اللي هفوز بالدور ده إن شاء الله', label: '👑 أنا الفايز!' },
  { id: 'v8', text: 'أمان يا كابتن، النجمة دي بتاعتي!', label: '⭐ أمان ونجمة' }
];

export const VoiceChatModal: React.FC<VoiceChatModalProps> = ({
  isOpen,
  onClose,
  onSendVoiceNote,
  onVoiceSpeaking,
  onSendChatText,
  chatMessages,
  myColor = 'red',
  myName = 'اللاعب',
  isOnline
}) => {
  const [permissionGranted, setPermissionGranted] = useState(voiceManager.permissionGranted);
  const [permissionError, setPermissionError] = useState<string | null>(voiceManager.permissionError);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to voiceManager state
  useEffect(() => {
    const unsubscribe = voiceManager.subscribe((state) => {
      setPermissionGranted(state.permissionGranted);
      setPermissionError(state.permissionError);
      setIsRecording(state.isRecording);
      setAudioLevel(state.audioLevel);
      if (state.liveTranscript) {
        setLiveTranscript(state.liveTranscript);
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Request mic on opening if not granted
  useEffect(() => {
    if (isOpen && !permissionGranted && !permissionError) {
      voiceManager.requestMicPermission();
    }
  }, [isOpen, permissionGranted, permissionError]);

  // Handle Recording Timer
  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
      if (onVoiceSpeaking) onVoiceSpeaking(true);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (onVoiceSpeaking) onVoiceSpeaking(false);
    }
  }, [isRecording, onVoiceSpeaking]);

  if (!isOpen) return null;

  const handleStartRecord = async () => {
    setPermissionError(null);
    setStatusNotice(null);
    const ok = await voiceManager.startRecording();
    if (!ok) {
      setStatusNotice('يرجى السماح باستخدام المايكروفون');
    }
  };

  const handleStopAndSend = async () => {
    if (!isRecording) return;
    const result: VoiceRecordingResult | null = await voiceManager.stopRecording();
    if (result && result.audioData) {
      onSendVoiceNote(result.audioData, result.duration, result.transcript || liveTranscript);
      setStatusNotice('تم إرسال الرسالة الصوتية 🎙️');
      setTimeout(() => setStatusNotice(null), 2500);
      setLiveTranscript('');
    }
  };

  const handleCancelRecord = () => {
    voiceManager.cancelRecording();
    setLiveTranscript('');
    setRecordSeconds(0);
  };

  const handlePlayTaunt = (taunt: { text: string; label: string }) => {
    onSendChatText(taunt.label);
    soundManager.playPieceStep();
    setStatusNotice(`تم إرسال: "${taunt.label}"`);
    setTimeout(() => setStatusNotice(null), 2000);
  };

  const handlePlayAudioMessage = (msg: ChatMessage) => {
    if (!msg.audioData) return;

    if (currentlyPlayingId === msg.id && activeAudioRef.current) {
      activeAudioRef.current.pause();
      setCurrentlyPlayingId(null);
      return;
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }

    const audio = voiceManager.playAudio(msg.audioData, soundManager.volume);
    if (audio) {
      activeAudioRef.current = audio;
      setCurrentlyPlayingId(msg.id);
      audio.onended = () => setCurrentlyPlayingId(null);
      audio.onerror = () => setCurrentlyPlayingId(null);
    }
  };

  const voiceMessages = (chatMessages || []).filter((m) => m.isVoice && m.audioData);

  return (
    <div
      id="voice-chat-popover"
      className="absolute top-11 left-0 sm:left-auto sm:right-0 z-[100] w-80 sm:w-88 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[480px] text-slate-100 animate-in fade-in zoom-in-95 duration-150"
      style={{
        backgroundColor: '#0f172a', // Solid non-transparent background
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.9), 0 8px 10px -6px rgba(0, 0, 0, 0.8)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center shadow-md">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
              المحادثة الصوتية
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                مباشر
              </span>
            </h4>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          title="إغلاق"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-3 overflow-y-auto space-y-2.5 text-right">
        {/* Permission / Status Bar */}
        <div className="px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            {permissionGranted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : permissionError ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Radio className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
            )}
            <span className="text-[11px] font-bold text-slate-200 truncate">
              {permissionGranted
                ? 'المايكروفون مفعّل وجاهز 🟢'
                : permissionError
                ? 'المايك غير مفعّل'
                : 'جاري فحص المايك...'}
            </span>
          </div>

          {!permissionGranted && (
            <button
              onClick={() => voiceManager.requestMicPermission()}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow transition shrink-0 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>سماح بالمايك</span>
            </button>
          )}

          {permissionGranted && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">مستوى:</span>
              <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-75"
                  style={{ width: `${Math.max(5, audioLevel)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Recording Center Card */}
        <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-col items-center justify-center text-center relative">
          {/* Sound waves visualization */}
          <div className="h-6 flex items-center gap-1 mb-2">
            {[20, 60, 30, 80, 50, 90, 40, 70, 45, 85, 30, 65].map((h, i) => (
              <span
                key={i}
                className={`w-0.5 rounded-full transition-all duration-100 ${
                  isRecording
                    ? 'bg-rose-500 animate-pulse'
                    : audioLevel > 15
                    ? 'bg-emerald-400'
                    : 'bg-slate-700'
                }`}
                style={{
                  height: isRecording
                    ? `${Math.max(6, (audioLevel / 100) * (h * 0.25))}px`
                    : '6px'
                }}
              />
            ))}
          </div>

          {/* Record / Send Buttons */}
          {!isRecording ? (
            <button
              id="btn-voice-start-record"
              onClick={handleStartRecord}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition font-bold text-xs"
            >
              <Mic className="w-4 h-4" />
              <span>اضغط للتحدث بصوتك 🎙️</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                id="btn-voice-cancel-record"
                onClick={handleCancelRecord}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold transition"
              >
                إلغاء ✕
              </button>

              <button
                id="btn-voice-stop-send"
                onClick={handleStopAndSend}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 text-white flex items-center gap-2 shadow-lg shadow-rose-600/40 animate-pulse font-bold text-xs"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الصوت ({recordSeconds}ث) 🚀</span>
              </button>
            </div>
          )}

          {liveTranscript && (
            <div className="mt-2 p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-emerald-300 w-full truncate">
              "{liveTranscript}"
            </div>
          )}

          {statusNotice && (
            <div className="mt-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {statusNotice}
            </div>
          )}
        </div>

        {/* Quick Taunts (Text) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              عبارات نصية سريعة:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 max-h-28 overflow-y-auto">
            {VOICE_TAUNTS.map((taunt) => (
              <button
                key={taunt.id}
                onClick={() => handlePlayTaunt(taunt)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-950/40 text-slate-200 hover:text-amber-300 border border-slate-700 text-[11px] font-bold text-right transition flex items-center justify-between"
              >
                <span className="truncate">{taunt.label}</span>
                <Send className="w-3 h-3 text-amber-400 shrink-0 mr-1 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Voice Messages in Room */}
        {voiceMessages.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-indigo-300 block mb-1">
              🔊 رسائل صوتية سابقة:
            </span>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {voiceMessages.slice(-3).map((msg) => {
                const isPlaying = currentlyPlayingId === msg.id;
                return (
                  <div
                    key={msg.id}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <button
                        onClick={() => handlePlayAudioMessage(msg)}
                        className={`p-1 rounded-full text-white shrink-0 ${
                          isPlaying ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                      <span className="font-bold text-slate-200">{msg.senderName}:</span>
                      <span className="text-slate-400 truncate">
                        {msg.text || `${msg.audioDuration || 3} ثوانٍ`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
