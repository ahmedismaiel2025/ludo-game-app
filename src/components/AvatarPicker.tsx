import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import {
  PREDEFINED_AVATARS,
  getAvatarById,
  isCustomPhotoAvatar,
  AvatarCategory
} from '../data/avatars';
import { soundManager } from '../utils/audio';
import { processProfilePhoto } from '../utils/imageUtils';

interface AvatarPickerProps {
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
  label?: string;
  compact?: boolean;
}

type TabCategory = 'my_photo' | 'all' | 'roblox' | 'anime' | 'cartoon' | 'classic';

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedAvatarId,
  onSelectAvatar,
  label = 'اختر صورتك الشخصية أو شخصيتك المفضلة',
  compact = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom photo from localStorage or selectedAvatarId
  const [customPhoto, setCustomPhoto] = useState<string | null>(() => {
    if (isCustomPhotoAvatar(selectedAvatarId)) {
      return selectedAvatarId;
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ludo_custom_photo');
      if (saved && isCustomPhotoAvatar(saved)) return saved;
    }
    return null;
  });

  const [selectedCategory, setSelectedCategory] = useState<TabCategory>(() => {
    return isCustomPhotoAvatar(selectedAvatarId) ? 'my_photo' : 'all';
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const currentAvatar = getAvatarById(selectedAvatarId);
  const isCustomSelected = isCustomPhotoAvatar(selectedAvatarId);

  const handleSelect = (id: string) => {
    soundManager.playPieceStep();
    soundManager.vibrate(20);
    onSelectAvatar(id);
  };

  const handleProcessFile = async (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    setIsProcessing(true);
    try {
      const dataUrl = await processProfilePhoto(file);
      setCustomPhoto(dataUrl);
      try {
        localStorage.setItem('ludo_custom_photo', dataUrl);
      } catch {
        // storage quota fallback
      }
      soundManager.playPieceStep();
      soundManager.vibrate(25);
      onSelectAvatar(dataUrl);
      setSelectedCategory('my_photo');
    } catch (err: any) {
      setUploadError(err?.message || 'تعذر معالجة الصورة');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPhoto(null);
    try {
      localStorage.removeItem('ludo_custom_photo');
    } catch {
      // ignore
    }
    onSelectAvatar('anime-hero');
    setSelectedCategory('all');
  };

  const filteredAvatars =
    selectedCategory === 'all'
      ? PREDEFINED_AVATARS
      : selectedCategory === 'my_photo'
      ? []
      : PREDEFINED_AVATARS.filter((a) => a.category === selectedCategory);

  return (
    <div className="space-y-2.5">
      {/* Hidden File Input (supports click + drag-drop) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Header with Selected Avatar Badge */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{label}</span>
        </label>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-bold">
          <span className="text-slate-400">المختار:</span>
          {isCustomSelected ? (
            <span className="text-amber-300 flex items-center gap-1">
              <span>📷</span>
              <span>صورتي الشخصية</span>
            </span>
          ) : (
            <span className={`${currentAvatar.textColor}`}>{currentAvatar.name}</span>
          )}
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900/80 text-slate-300 border border-slate-700">
            {isCustomSelected ? 'صورتي' : currentAvatar.tag}
          </span>
        </div>
      </div>

      {/* Category Tabs: My Photo, All, Anime, Cartoon, Classic */}
      <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setSelectedCategory('my_photo')}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            selectedCategory === 'my_photo'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow font-black'
              : 'text-amber-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>📷</span>
          <span>صورتي</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
            selectedCategory === 'all'
              ? 'bg-amber-400 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          الكل
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('roblox')}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            selectedCategory === 'roblox'
              ? 'bg-amber-400 text-slate-950 shadow font-black ring-1 ring-amber-300'
              : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/60'
          }`}
        >
          <span>🤖</span>
          <span>روبلوكس</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('anime')}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            selectedCategory === 'anime'
              ? 'bg-rose-500 text-white shadow'
              : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/60'
          }`}
        >
          <span>⚡</span>
          <span>أنيمي</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('cartoon')}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            selectedCategory === 'cartoon'
              ? 'bg-sky-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-sky-300 hover:bg-slate-800/60'
          }`}
        >
          <span>🎨</span>
          <span>كرتون</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('classic')}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            selectedCategory === 'classic'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
          }`}
        >
          <span>👑</span>
          <span>كلاسيك</span>
        </button>
      </div>

      {/* Upload Error Alert */}
      {uploadError && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-950/70 border border-rose-600/50 text-rose-300 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Tab: MY PHOTO (صورتي الشخصية) */}
      {selectedCategory === 'my_photo' && (
        <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
          {customPhoto ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/80">
              {/* Photo Preview */}
              <div className="relative group shrink-0">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg border-2 ${
                    isCustomSelected ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-700'
                  }`}
                >
                  <img
                    src={customPhoto}
                    alt="صورتك الشخصية"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isCustomSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Photo Status & Actions */}
              <div className="flex-1 text-center sm:text-right space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-sm font-bold text-white">صورتك الشخصية جاهزة</span>
                  {isCustomSelected && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[10px] font-bold text-amber-300">
                      نشطة حالياً
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  تظهر صورتك في قائمة الأدوار وبطاقة اللاعب وعلى لوحة الليدو.
                </p>

                {/* Buttons */}
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  {!isCustomSelected && (
                    <button
                      type="button"
                      onClick={() => handleSelect(customPhoto)}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>تحديد كصورتي</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                    <span>تغيير الصورة</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold border border-rose-800/60 transition-all flex items-center gap-1"
                    title="حذف الصورة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Drag & Drop Upload Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                  : 'border-slate-700 bg-slate-900/60 hover:border-amber-400/70 hover:bg-slate-900/90'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
                {isProcessing ? (
                  <RefreshCw className="w-7 h-7 animate-spin" />
                ) : (
                  <Camera className="w-7 h-7" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {isProcessing
                    ? 'جاري ضبط وتحسين صورتك...'
                    : 'اضغط لاختيار صورة من جهازك أو اسحبها هنا'}
                </h4>
                <p className="text-xs text-slate-400">
                  يدعم JPG و PNG و WebP (يتم اقتصاصها وتوسيطها دائرياً وتصغير حجمها تلقائياً)
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-md">
                <Upload className="w-3.5 h-3.5" />
                <span>اختيار صورة شخصية</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid of Avatar Icons (for All, Anime, Cartoon, Classic) */}
      {selectedCategory !== 'my_photo' && (
        <div
          className={`grid gap-2 p-2 rounded-2xl bg-slate-950/80 border border-slate-800/90 max-h-52 overflow-y-auto custom-scrollbar ${
            compact ? 'grid-cols-4 sm:grid-cols-5' : 'grid-cols-4 sm:grid-cols-6'
          }`}
        >
          {/* First slot in 'all' view: Quick Custom Photo Tile */}
          {selectedCategory === 'all' && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (customPhoto) {
                  handleSelect(customPhoto);
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className={`relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl transition-all ${
                isCustomSelected
                  ? 'bg-slate-800/90 ring-2 ring-amber-400 border border-amber-300 shadow-lg shadow-amber-500/20'
                  : 'bg-gradient-to-tr from-amber-500/15 to-rose-500/15 border border-amber-500/30 hover:border-amber-400'
              }`}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow overflow-hidden">
                {customPhoto ? (
                  <img
                    src={customPhoto}
                    alt="صورتي"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-5 h-5 text-amber-400" />
                )}
              </div>

              <span
                className={`mt-1 text-[9px] sm:text-[10px] font-bold truncate max-w-[58px] ${
                  isCustomSelected ? 'text-amber-300 font-black' : 'text-amber-400'
                }`}
              >
                {customPhoto ? 'صورتي' : '+ صورتك'}
              </span>

              {isCustomSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </motion.button>
          )}

          {filteredAvatars.map((avatar) => {
            const isSelected = !isCustomSelected && currentAvatar.id === avatar.id;
            const IconComponent = avatar.icon;

            return (
              <motion.button
                key={avatar.id}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(avatar.id)}
                className={`relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 ring-2 ring-amber-400 border border-amber-300 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                {/* Avatar Icon Circle */}
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr ${avatar.gradient} flex items-center justify-center text-white shadow-md border ${avatar.borderColor} transition-transform overflow-hidden p-0.5`}
                >
                  <IconComponent className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow" />
                </div>

                {/* Avatar Name Label */}
                <span
                  className={`mt-1 text-[9px] sm:text-[10px] font-bold truncate max-w-[58px] ${
                    isSelected ? 'text-amber-300 font-black' : 'text-slate-400'
                  }`}
                >
                  {avatar.name}
                </span>

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
};
