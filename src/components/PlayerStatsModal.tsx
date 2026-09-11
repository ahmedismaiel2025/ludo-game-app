import React, { useState } from 'react';
import {
  Trophy,
  XCircle,
  Percent,
  Flame,
  BarChart3,
  X,
  Swords,
  Dices,
  RotateCcw,
  Globe,
  Bot,
  Users,
  Calendar,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { PlayerStats, resetPlayerStats } from '../utils/playerStats';

interface PlayerStatsModalProps {
  stats: PlayerStats;
  isOpen: boolean;
  onClose: () => void;
  onStatsUpdated?: (updated: PlayerStats) => void;
}

export const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({
  stats,
  isOpen,
  onClose,
  onStatsUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    const cleared = resetPlayerStats();
    if (onStatsUpdated) onStatsUpdated(cleared);
    setShowResetConfirm(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'online':
        return { label: 'أونلاين', icon: Globe, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'ai':
        return { label: 'ضد الكمبيوتر', icon: Bot, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
      case 'local':
        return { label: 'نفس الهاتف', icon: Users, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      default:
        return { label: mode, icon: Globe, color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>سجل وإحصائيات اللاعب</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-400">
                محفوظة محلياً وتتحدث تلقائياً بعد كل مباراة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Overview vs Match History */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-slate-950 shadow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>نظرة عامة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-amber-400 text-slate-950 shadow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>سجل آخر المباريات ({stats.recentMatches.length})</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
          {activeTab === 'overview' && (
            <>
              {/* Primary Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Wins */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/10 rounded-full blur-lg pointer-events-none" />
                  <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <div className="text-2xl font-black text-amber-300 font-mono">
                    {stats.wins}
                  </div>
                  <div className="text-[11px] font-bold text-amber-400/90">مرات الفوز</div>
                </div>

                {/* Losses */}
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/10 rounded-full blur-lg pointer-events-none" />
                  <XCircle className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                  <div className="text-2xl font-black text-rose-300 font-mono">
                    {stats.losses}
                  </div>
                  <div className="text-[11px] font-bold text-rose-400/90">مرات الخسارة</div>
                </div>

                {/* Win Rate */}
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-sky-500/10 rounded-full blur-lg pointer-events-none" />
                  <Percent className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                  <div className="text-2xl font-black text-sky-300 font-mono">
                    {stats.winRate}%
                  </div>
                  <div className="text-[11px] font-bold text-sky-400/90">نسبة الفوز</div>
                </div>

                {/* Total Games */}
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/10 rounded-full blur-lg pointer-events-none" />
                  <BarChart3 className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                  <div className="text-2xl font-black text-indigo-300 font-mono">
                    {stats.totalGames}
                  </div>
                  <div className="text-[11px] font-bold text-indigo-400/90">إجمالي المباريات</div>
                </div>
              </div>

              {/* Secondary Highlights: Streaks & In-game fun counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {/* Current Streak */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-orange-400 mb-0.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">السلسلة الحالية</span>
                  </div>
                  <div className="text-lg font-black text-orange-300 font-mono">
                    {stats.currentStreak} {stats.currentStreak > 1 ? '🔥' : ''}
                  </div>
                </div>

                {/* Best Streak */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                    <Trophy className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">أفضل سلسلة</span>
                  </div>
                  <div className="text-lg font-black text-amber-300 font-mono">
                    {stats.bestStreak} 👑
                  </div>
                </div>

                {/* Captured Pawns */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-rose-400 mb-0.5">
                    <Swords className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">قطع تم أكلها</span>
                  </div>
                  <div className="text-lg font-black text-rose-300 font-mono">
                    {stats.piecesCaptured} ⚔️
                  </div>
                </div>

                {/* Sixes Rolled */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                    <Dices className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">رميات الرقم 6</span>
                  </div>
                  <div className="text-lg font-black text-emerald-300 font-mono">
                    {stats.sixesRolled} 🎲
                  </div>
                </div>
              </div>

              {/* Breakdown by Game Mode */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-slate-300 block">
                  تفصيل المباريات حسب النمط:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Online Mode */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/90 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Globe className="w-3.5 h-3.5" />
                      <span>أونلاين</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>لعب: {stats.byMode.online.played}</span>
                      <span className="text-emerald-400 font-bold">فوز: {stats.byMode.online.won}</span>
                      <span className="text-rose-400">خسارة: {stats.byMode.online.lost}</span>
                    </div>
                  </div>

                  {/* AI Mode */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/90 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                      <Bot className="w-3.5 h-3.5" />
                      <span>ضد الكمبيوتر</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>لعب: {stats.byMode.ai.played}</span>
                      <span className="text-indigo-400 font-bold">فوز: {stats.byMode.ai.won}</span>
                      <span className="text-rose-400">خسارة: {stats.byMode.ai.lost}</span>
                    </div>
                  </div>

                  {/* Local Mode */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/90 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>نفس الهاتف</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>لعب: {stats.byMode.local.played}</span>
                      <span className="text-amber-400 font-bold">فوز: {stats.byMode.local.won}</span>
                      <span className="text-rose-400">خسارة: {stats.byMode.local.lost}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              {stats.recentMatches.length === 0 ? (
                <div className="text-center py-10 text-slate-500 space-y-2">
                  <Calendar className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-xs">لم تسجل أي مباريات بعد، العب الآن وستظهر هنا مباشرة!</p>
                </div>
              ) : (
                stats.recentMatches.map((match) => {
                  const modeInfo = getModeLabel(match.mode);
                  const ModeIcon = modeInfo.icon;

                  return (
                    <div
                      key={match.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition ${
                        match.won
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-slate-950 border-slate-800/80'
                      }`}
                    >
                      {/* Left: Result Badge + Mode */}
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow ${
                            match.won
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {match.won ? '🥇' : `#${match.rank}`}
                        </span>

                        <div className="text-right">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-black ${
                                match.won ? 'text-amber-300' : 'text-slate-200'
                              }`}
                            >
                              {match.won ? 'فوز بالمركز الأول' : `المركز ${match.rank}`}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.2 rounded-full border inline-flex items-center gap-1 ${modeInfo.color}`}
                            >
                              <ModeIcon className="w-3 h-3" />
                              <span>{modeInfo.label}</span>
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {formatDate(match.timestamp)} • عدد اللاعبين: {match.totalPlayers}
                          </div>
                        </div>
                      </div>

                      {/* Right: Won / Lost pill */}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          match.won
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {match.won ? 'فوز 🏆' : 'خسارة'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions: Reset Stats & Close */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>تأكيد تصفير السجل؟</span>
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
              >
                نعم، احذف
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-400 transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تعيين الإحصائيات</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
