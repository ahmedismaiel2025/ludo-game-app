import React, { useState } from 'react';
import {
  Trophy,
  XCircle,
  Percent,
  Flame,
  Calendar,
  X,
  RotateCcw,
  Globe,
  Bot,
  Users,
  Filter,
  Trash2,
  Sparkles,
  History,
  Crown
} from 'lucide-react';
import { PlayerStats, MatchRecord, resetPlayerStats, getPlayerStats } from '../utils/playerStats';
import { COLOR_CONFIG } from '../utils/ludoBoard';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onStatsUpdated: (stats: PlayerStats) => void;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  stats,
  onStatsUpdated
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'online' | 'ai' | 'local'>('all');
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'wins' | 'losses'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    const updated = resetPlayerStats();
    onStatsUpdated(updated);
    setShowClearConfirm(false);
  };

  // Filter matches
  const filteredMatches = stats.recentMatches.filter((match) => {
    if (filterMode !== 'all' && match.mode !== filterMode) return false;
    if (filterOutcome === 'wins' && !match.won) return false;
    if (filterOutcome === 'losses' && match.won) return false;
    return true;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModeInfo = (mode: string) => {
    switch (mode) {
      case 'online':
        return { label: 'أونلاين', icon: Globe, badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'ai':
        return { label: 'ضد الكمبيوتر', icon: Bot, badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' };
      case 'local':
        return { label: 'نفس الهاتف', icon: Users, badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      default:
        return { label: mode, icon: Globe, badgeClass: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <History className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>سجل المباريات السابقة</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Match History
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                محفوظة محلياً في جهازك ومسجلة بعد كل مباراة
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

        {/* Quick Stats Summary Banner */}
        <div className="grid grid-cols-4 gap-2 text-center p-2.5 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1">
              <History className="w-3 h-3 text-slate-400" />
              <span>المباريات</span>
            </div>
            <div className="text-base font-black text-white font-mono">{stats.totalGames}</div>
          </div>
          <div>
            <div className="text-[10px] text-amber-400 font-semibold flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>فوز</span>
            </div>
            <div className="text-base font-black text-amber-300 font-mono">{stats.wins}</div>
          </div>
          <div>
            <div className="text-[10px] text-rose-400 font-semibold flex items-center justify-center gap-1">
              <XCircle className="w-3 h-3" />
              <span>خسارة</span>
            </div>
            <div className="text-base font-black text-rose-400 font-mono">{stats.losses}</div>
          </div>
          <div>
            <div className="text-[10px] text-sky-400 font-semibold flex items-center justify-center gap-1">
              <Percent className="w-3 h-3" />
              <span>نسبة الفوز</span>
            </div>
            <div className="text-base font-black text-sky-300 font-mono">{stats.winRate}%</div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 shrink-0 text-xs">
          {/* Mode Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filterMode === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterMode('online')}
              className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                filterMode === 'online'
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>أونلاين</span>
            </button>
            <button
              onClick={() => setFilterMode('ai')}
              className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                filterMode === 'ai'
                  ? 'bg-indigo-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3 h-3" />
              <span>الكمبيوتر</span>
            </button>
            <button
              onClick={() => setFilterMode('local')}
              className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                filterMode === 'local'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>نفس الهاتف</span>
            </button>
          </div>

          {/* Outcome Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterOutcome('all')}
              className={`px-2 py-1 rounded-lg font-bold transition ${
                filterOutcome === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              النتائج
            </button>
            <button
              onClick={() => setFilterOutcome('wins')}
              className={`px-2 py-1 rounded-lg font-bold transition ${
                filterOutcome === 'wins'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              فوز 🏆
            </button>
            <button
              onClick={() => setFilterOutcome('losses')}
              className={`px-2 py-1 rounded-lg font-bold transition ${
                filterOutcome === 'losses'
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              خسارة ❌
            </button>
          </div>
        </div>

        {/* Scrollable Match List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <History className="w-12 h-12 mx-auto opacity-30 text-amber-400" />
              <p className="text-sm font-bold text-slate-400">لا توجد مباريات مسجلة مطابقة للفلتر</p>
              <p className="text-xs text-slate-500">
                العب مباريات جديدة وستُحفظ تلقائياً في سجلك هنا!
              </p>
            </div>
          ) : (
            filteredMatches.map((match) => {
              const modeInfo = getModeInfo(match.mode);
              const ModeIcon = modeInfo.icon;
              const colorCfg = match.playerColor ? COLOR_CONFIG[match.playerColor] : null;

              return (
                <div
                  key={match.id}
                  className={`p-3.5 rounded-2xl border transition relative overflow-hidden ${
                    match.won
                      ? 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/40 shadow-md shadow-amber-500/5'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Left: Rank Badge + Match Info */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-lg ${
                          match.won
                            ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950'
                            : match.rank === 2
                            ? 'bg-slate-700 text-slate-100 border border-slate-600'
                            : match.rank === 3
                            ? 'bg-amber-900/60 text-amber-200 border border-amber-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {match.won ? '🥇' : match.rank === 2 ? '🥈' : match.rank === 3 ? '🥉' : `#${match.rank}`}
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-black ${
                              match.won ? 'text-amber-300' : 'text-slate-200'
                            }`}
                          >
                            {match.won ? 'فوز بالمركز الأول 🏆' : `المركز ${match.rank}`}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${modeInfo.badgeClass}`}
                          >
                            <ModeIcon className="w-3 h-3" />
                            <span>{modeInfo.label}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{formatDate(match.timestamp)}</span>
                          </span>

                          {colorCfg && (
                            <span className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${colorCfg.bg}`} />
                              <span>{colorCfg.nameAr}</span>
                            </span>
                          )}

                          <span>• {match.totalPlayers} لاعبين</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Won / Lost tag */}
                    <div className="shrink-0 text-left">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-xl border inline-block ${
                          match.won
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {match.won ? 'فوز' : 'خسارة'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Clear History and Close */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          {showClearConfirm ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-rose-400 font-bold">مسح الكل؟</span>
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
              >
                تأكيد المسح
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-400 transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح سجل المباريات</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
