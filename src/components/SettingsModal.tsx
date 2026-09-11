import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Palette,
  Volume2,
  VolumeX,
  Smartphone,
  Check,
  RotateCw,
  Sliders,
  Box,
  Layers,
  Eye
} from 'lucide-react';
import { BoardTheme, DiceTheme, GameViewStyle } from '../types';
import { Dice } from './Dice';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  diceTheme: DiceTheme;
  onChangeDiceTheme: (theme: DiceTheme) => void;
  boardTheme: BoardTheme;
  onChangeBoardTheme: (theme: BoardTheme) => void;
  viewStyle?: GameViewStyle;
  onChangeViewStyle?: (style: GameViewStyle) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const DICE_THEMES: Array<{
  id: DiceTheme;
  name: string;
  badge: string;
  desc: string;
  icon: string;
  previewBg: string;
}> = [
  {
    id: 'classic',
    name: 'كلاسيكي عاجي',
    badge: 'تقليدي',
    desc: 'تصميم عاجي رخامي أنيق بنقاط غائرة كلاسيكية مستوحى من طاولات ليدو الأصلية.',
    icon: '🎲',
    previewBg: 'bg-slate-800'
  },
  {
    id: 'digital',
    name: 'رقمي ديجيتال (LED)',
    badge: 'سايبر نيون',
    desc: 'شاشة إلكترونية متوهجة مع أرقام نيون زرقاء ومؤثرات تشفير رقمية حديثة.',
    icon: '📟',
    previewBg: 'bg-cyan-950/40 border border-cyan-500/30'
  },
  {
    id: 'cartoon',
    name: 'كرتوني مرح (Pop Art)',
    badge: 'مبهج وبوب-آرت',
    desc: 'تصميم كرتوني مليء بالحيوية، خطوط عريضة مرسومة وألوان حلوى مبهجة.',
    icon: '🎨',
    previewBg: 'bg-amber-950/40 border border-amber-500/30'
  },
  {
    id: 'royal',
    name: 'ملكي ذهبي (Royal Gold)',
    badge: 'ذهب وأحجار كريمة',
    desc: 'كتلة من الذهب المصقول مرصعة بالياقوت والزمرد الفاخر لرمية أسطورية.',
    icon: '👑',
    previewBg: 'bg-yellow-950/40 border border-yellow-500/30'
  },
  {
    id: 'roblox',
    name: 'ليدو روبلوكس (Roblox Blox)',
    badge: 'شعار Robux $ ومكعبات Lego',
    desc: 'مكعبات Lego ملونة مع شعارات Robux وشخصيات روبلوكس حقيقية!',
    icon: '🤖',
    previewBg: 'bg-rose-950/40 border border-rose-500/40'
  }
];

const BOARD_THEMES: Array<{
  id: BoardTheme;
  name: string;
  badge: string;
  icon: string;
  desc: string;
  palette: string;
}> = [
  {
    id: 'roblox',
    name: 'ليدو روبلوكس (Roblox Blox Valley)',
    badge: 'عالم روبلوكس وبلاط Obby 3D',
    icon: '🤖',
    desc: 'بيئة Blox Valley الخرافية مع أزرار Lego Studs وشخصيات Roblox أصلية تتحرك بعد رمي النرد!',
    palette: 'bg-gradient-to-r from-red-600 via-emerald-600 to-sky-600 border-amber-400'
  },
  {
    id: 'classic',
    name: 'كلاسيكي خشبي (Classic Wood)',
    badge: 'خشب الجوز والماهوجني',
    icon: '🪵',
    desc: 'خشب الجوز الفاخر المصقول مع خانات بلون الخشب الذهبي وإطارات دافئة تقليدية.',
    palette: 'bg-[#451e0e] border-[#78350f]'
  },
  {
    id: 'royal',
    name: 'ملكي فاخر (Royal Velvet & Gold)',
    badge: 'مخمل ملكي وذهب 24K',
    icon: '👑',
    desc: 'قاعدة مخملية أرجوانية عميقة محاطة بإطارات من الذهب الخالص وخانات مرصعة ومضيئة.',
    palette: 'bg-[#15092a] border-amber-400'
  },
  {
    id: 'heritage',
    name: 'تراثي أندلسي (Andalusian Zellij)',
    badge: 'فسيفساء ورخام مغربي',
    icon: '🏛️',
    desc: 'بلاط رخامي أندلسي فاخر بلون الرمال وزخارف أرابيسك وتراكوتا مع إطارات زمردية أصيلة.',
    palette: 'bg-[#f0e4cc] border-emerald-700'
  },
  {
    id: 'neon',
    name: 'نيون سايبر (Cyberpunk Laser)',
    badge: 'سايبر ماتركس ونيون',
    icon: '⚡',
    desc: 'مصفوفة داكنة فائقة المستقبلية مع خطوط ليزر نيون زرقاء متوهجة وأضواء مشعة نابضة.',
    palette: 'bg-[#030712] border-cyan-400'
  }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  diceTheme,
  onChangeDiceTheme,
  boardTheme,
  onChangeBoardTheme,
  viewStyle = 'modern3d',
  onChangeViewStyle,
  isMuted,
  onToggleMute
}) => {
  const [previewValue, setPreviewValue] = useState<number | null>(6);
  const [isPreviewRolling, setIsPreviewRolling] = useState(false);
  const [activeTab, setActiveTab] = useState<'style' | 'dice' | 'board' | 'sound'>('style');

  if (!isOpen) return null;

  const handleTriggerPreviewRoll = () => {
    if (isPreviewRolling) return;
    setIsPreviewRolling(true);
    setTimeout(() => {
      const randomVal = Math.floor(Math.random() * 6) + 1;
      setPreviewValue(randomVal);
      setIsPreviewRolling(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white">إعدادات ومظهر اللعبة</h3>
              <p className="text-xs text-slate-400">تخصيص العرض ثلاثي الأبعاد، النرد، الرقعة والمؤثرات</p>
            </div>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto custom-scrollbar">
          <button
            id="tab-settings-style"
            onClick={() => setActiveTab('style')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition-all border-b-2 shrink-0 ${
              activeTab === 'style'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚡</span>
            <span>شكل اللعبة (3D / 2D)</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded-full border border-cyan-500/30">
              جديد
            </span>
          </button>

          <button
            id="tab-settings-dice"
            onClick={() => setActiveTab('dice')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition-all border-b-2 shrink-0 ${
              activeTab === 'dice'
                ? 'border-amber-400 text-amber-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎲</span>
            <span>مظهر النرد</span>
          </button>

          <button
            id="tab-settings-board"
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition-all border-b-2 shrink-0 ${
              activeTab === 'board'
                ? 'border-amber-400 text-amber-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎨</span>
            <span>ألوان الرقعة</span>
          </button>

          <button
            id="tab-settings-sound"
            onClick={() => setActiveTab('sound')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition-all border-b-2 shrink-0 ${
              activeTab === 'sound'
                ? 'border-amber-400 text-amber-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🔊</span>
            <span>الصوت</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 0: GAME VIEW STYLE (3D vs Classic) */}
          {activeTab === 'style' && (
            <div className="space-y-4">
              <div className="text-center sm:text-right space-y-1">
                <span className="text-xs font-semibold text-slate-400 block">
                  اختر النمط البصري المفضل لرقعة اللعب والبيادق:
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Modern 3D Card */}
                <button
                  type="button"
                  onClick={() => onChangeViewStyle && onChangeViewStyle('modern3d')}
                  className={`p-4 rounded-2xl text-right transition-all flex flex-col justify-between border-2 relative overflow-hidden group ${
                    viewStyle === 'modern3d'
                      ? 'bg-gradient-to-b from-slate-800/90 to-cyan-950/50 border-cyan-400 shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                      : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center text-xl shadow-md">
                        ⚡
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-base text-white">موديرن 3D</span>
                          <span className="text-[10px] bg-cyan-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                            مجسم
                          </span>
                        </div>
                        <span className="text-xs text-cyan-300 font-semibold">
                          تجربة بصرية ثلاثية الأبعاد
                        </span>
                      </div>
                    </div>

                    {viewStyle === 'modern3d' && (
                      <div className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    رقعة مجسمة بزاوية ميلان طبيعية وظلال طاولة حقيقية، مع بيادق مجسمة تقفز وتضيء عند إمكانية الحركة، وخيارات متعددة لزوايا الكاميرا التفاعلية.
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-700/50 text-[11px] text-cyan-200">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">بيادق 3D لامعة</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">زوايا كاميرا</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">قاعدة بارزة</span>
                  </div>
                </button>

                {/* Classic 2D Card */}
                <button
                  type="button"
                  onClick={() => onChangeViewStyle && onChangeViewStyle('classic')}
                  className={`p-4 rounded-2xl text-right transition-all flex flex-col justify-between border-2 relative overflow-hidden group ${
                    viewStyle === 'classic'
                      ? 'bg-gradient-to-b from-slate-800/90 to-amber-950/50 border-amber-400 shadow-xl shadow-amber-500/20 ring-1 ring-amber-400/50'
                      : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center text-xl shadow-md">
                        🎲
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-base text-white">كلاسيكي 2D</span>
                          <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                            تقليدي
                          </span>
                        </div>
                        <span className="text-xs text-amber-300 font-semibold">
                          الرؤية العلوية المسطحة
                        </span>
                      </div>
                    </div>

                    {viewStyle === 'classic' && (
                      <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    الشكل الكلاسيكي الأصلي ذو المسقط الرأسي المباشر، يوفر وضوحاً فائقاً ورؤية شاملة وسريعة لكامل الخانات ومسارات الخصوم.
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-700/50 text-[11px] text-amber-200">
                    <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">عرض مسطح</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">تركيز تكتيكي</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">أداء فوري</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: DICE THEME */}
          {activeTab === 'dice' && (
            <div className="space-y-4">
              {/* Live Preview Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-right">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      معاينة حية للنرد
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-200">
                    {DICE_THEMES.find((d) => d.id === diceTheme)?.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    جرب الضغط على النرد لمعاينة حركة الرمي والتأثيرات
                  </p>
                </div>

                {/* Interactive Dice Preview */}
                <div className="flex flex-col items-center gap-2">
                  <Dice
                    value={previewValue}
                    isRolling={isPreviewRolling}
                    canRoll={true}
                    turnColor="red"
                    isMyTurn={true}
                    onRoll={handleTriggerPreviewRoll}
                    theme={diceTheme}
                    compact={true}
                  />
                  <button
                    onClick={handleTriggerPreviewRoll}
                    disabled={isPreviewRolling}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-amber-300 transition"
                  >
                    <RotateCw className={`w-3 h-3 ${isPreviewRolling ? 'animate-spin' : ''}`} />
                    <span>رمية تجريبية</span>
                  </button>
                </div>
              </div>

              {/* Theme Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DICE_THEMES.map((themeItem) => {
                  const isSelected = diceTheme === themeItem.id;
                  return (
                    <button
                      key={themeItem.id}
                      id={`btn-select-dice-theme-${themeItem.id}`}
                      onClick={() => onChangeDiceTheme(themeItem.id)}
                      className={`p-3.5 rounded-2xl text-right transition-all flex flex-col justify-between border-2 ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-400 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{themeItem.icon}</span>
                          <div>
                            <span className="font-bold text-sm text-white block">
                              {themeItem.name}
                            </span>
                            <span className="text-[10px] text-amber-400/90 font-medium">
                              {themeItem.badge}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {themeItem.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BOARD THEME */}
          {activeTab === 'board' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                اختر تصميم وألوان رقعة اللعب المفضلة:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BOARD_THEMES.map((b) => {
                  const isSelected = boardTheme === b.id;
                  return (
                    <button
                      key={b.id}
                      id={`btn-select-board-theme-${b.id}`}
                      onClick={() => onChangeBoardTheme(b.id)}
                      className={`p-3.5 rounded-2xl text-right transition-all flex flex-col justify-between border-2 relative overflow-hidden ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-400 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{b.icon}</span>
                          <div>
                            <span className="font-bold text-sm text-white block">
                              {b.name}
                            </span>
                            <span className="text-[10px] text-amber-400/90 font-medium">
                              {b.badge}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                        {b.desc}
                      </p>

                      <div className="w-full h-2 rounded-full border overflow-hidden mt-1 flex">
                        <div className={`w-full h-full ${b.palette}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SOUND & VIBRATION */}
          {activeTab === 'sound' && (
            <div className="space-y-4">
              {/* Sound Toggle and Volume */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isMuted ? 'bg-slate-700 text-slate-400' : 'bg-indigo-600/20 text-indigo-400'
                      }`}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">المؤثرات الصوتية العامة</h4>
                      <p className="text-xs text-slate-400">
                        أصوات دحرجة النرد، تحريك القطع، والاحتفال بالستة والنصر
                      </p>
                    </div>
                  </div>

                  <button
                    id="btn-settings-toggle-sound"
                    onClick={onToggleMute}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      isMuted
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    }`}
                  >
                    {isMuted ? 'مكتوم' : 'مفعل'}
                  </button>
                </div>

                {/* Volume slider */}
                {!isMuted && (
                  <div className="pt-2 border-t border-slate-700/50 flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-semibold min-w-[70px]">مستوى الصوت:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={soundManager.volume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        soundManager.setVolume(val);
                        soundManager.playPieceStep();
                      }}
                      className="flex-1 accent-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-indigo-300">
                      {Math.round(soundManager.volume * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Sound Packs Selection */}
              <div>
                <span className="text-xs font-bold text-amber-400 mb-2 block">
                  🎵 اختر حزمة المؤثرات الصوتية:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'stadium',
                      name: '🏟️ حماسي جماهيري (Stadium Roar)',
                      desc: 'هتاف وتصفيق جماهير حقيقي مع كل أكلة وفوز'
                    },
                    {
                      id: 'classic',
                      name: '🪵 كلاسيكي أصيل (Classic Retro)',
                      desc: 'طقطقة نرد خشبية وأصوات ليدو الأصلية'
                    },
                    {
                      id: 'digital',
                      name: '⚡ ديجيتال ليزر (Cyber Arcade)',
                      desc: 'نغمات 8-bit ومؤثرات خيال علمي متوهجة'
                    },
                    {
                      id: 'cartoon',
                      name: '🎨 مرح وكرتوني (Cartoon Pop)',
                      desc: 'أصوات فقاعات ومؤثرات قفز كرتونية مبهجة'
                    }
                  ].map((sp) => {
                    const isSelected = soundManager.soundPack === sp.id;
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => {
                          soundManager.setSoundPack(sp.id as any);
                          soundManager.playDiceRoll();
                        }}
                        className={`p-3 rounded-xl text-right transition-all border ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-400 shadow-md ring-1 ring-indigo-400/40 text-white'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-white">{sp.name}</span>
                          {isSelected && <span className="text-xs text-indigo-400 font-bold">✓</span>}
                        </div>
                        <p className="text-[11px] text-slate-400">{sp.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sound Test / Preview Buttons */}
              <div className="p-3 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                <span className="text-xs font-bold text-slate-300 mb-2 block">
                  🔊 اختبار وتجربة المؤثرات الصوتية:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => soundManager.playDiceRoll()}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-semibold"
                  >
                    🎲 النرد
                  </button>
                  <button
                    type="button"
                    onClick={() => soundManager.playPieceStep()}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-semibold"
                  >
                    👣 الخطوة
                  </button>
                  <button
                    type="button"
                    onClick={() => soundManager.playCapture()}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-semibold"
                  >
                    ⚔️ أكل قطعة
                  </button>
                  <button
                    type="button"
                    onClick={() => soundManager.playSafeStar()}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-semibold"
                  >
                    ⭐ نجمة الأمان
                  </button>
                  <button
                    type="button"
                    onClick={() => soundManager.playHomeGoal()}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-semibold"
                  >
                    🏆 دخول البيت
                  </button>
                  <button
                    type="button"
                    onClick={() => soundManager.playVictory()}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-semibold"
                  >
                    👑 لحن الفوز
                  </button>
                  <button
                    type="button"
                    onClick={() => soundManager.playCrowdApplause(3, 1)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-semibold"
                  >
                    👏 تصفيق الجماهير
                  </button>
                  <button
                    type="button"
                    onClick={() => soundManager.speakVoice('يا حريف! لعبة حلوة')}
                    className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 border border-amber-500/30 font-semibold"
                  >
                    🗣️ محادثة صوتية
                  </button>
                </div>
              </div>

              {/* Haptic Vibration */}
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-0.5">الاهتزاز اللمسي (Haptic Feedback)</strong>
                  يعمل تلقائياً على الهواتف والأجهزة الداعمة عند رمي النرد وأكل قطع الخصم لمزيد من الحماس.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            يتم حفظ إعداداتك تلقائياً على هذا الجهاز
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};
