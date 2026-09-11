import React from 'react';
import { BookOpen, Star, Swords, ShieldCheck, Dice6, Share2, Smartphone, X } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[85vh] bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-100">
                قواعد «ليدو الأصدقاء» & اللعب أونلاين
              </h3>
              <p className="text-[10px] text-amber-400/80 font-bold">تصميم أحمد إسماعيل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-4 py-4 text-slate-200 text-xs sm:text-sm leading-relaxed pr-1">
          {/* Section 1: How to play with friend on separate phone */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
              <Smartphone className="w-4 h-4" />
              <span>كيف تلعب مع صاحبك من موبايله؟</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>اختر <strong>«أونلاين مع الأصدقاء»</strong> ثم <strong>«إنشاء غرفة»</strong>.</li>
              <li>انسخ <strong>رمز الغرفة (5 أحرف)</strong> أو اضغط زر <strong>مشاركة الرابط</strong> وابعته لصاحبك على واتساب.</li>
              <li>صاحبك يفتح الرابط على موبايله أو يكتب الكود في خانة <strong>«انضمام لغرفة»</strong>.</li>
              <li>بمجرد دخوله اضغط <strong>«ابدأ اللعبة»</strong> وستلعبان في نفس اللحظة بث مباشر!</li>
            </ol>
          </div>

          {/* Section 2: Core Rules */}
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                <Dice6 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-0.5">الرقم 6 وخروج القطع</h4>
                <p className="text-slate-400 text-xs">
                  لا يمكنك إخراج أي قطعة من القاعدة إلا بالحصول على رقم 6. الحصول على 6 يمنحك رمية نرد إضافية! (3 ستات متتالية تلغي الدور).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-0.5">صيد قطع الخصم ⚔️</h4>
                <p className="text-slate-400 text-xs">
                  إذا هبطت قطعتك على نفس خانة قطعة الخصم (غير الآمنة)، يتم أكل قطعته وإرجاعها لقاعدته فوراً، وتحصل أنت على رمية نرد إضافية كمكافأة!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-0.5">خانات الأمان والنجوم ⭐</h4>
                <p className="text-slate-400 text-xs">
                  الخانات التي تحمل علامة النجمة ⭐ وخانات البداية الملونة تعتبر مناطق آمنة؛ لا يمكن لأي خصم أكل قطعتك أثناء وقوفك عليها.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
              <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-0.5">الفوز باللعبة 👑</h4>
                <p className="text-slate-400 text-xs">
                  أول لاعب ينجح في إدخال قطعه الأربعة كاملة إلى المثلث المركزي في النهاية يفوز بالمركز الأول!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition active:scale-95"
          >
            فهمت، لنبدأ اللعب!
          </button>
        </div>
      </div>
    </div>
  );
};
