import React from 'react';
import {
  Crown,
  Shield,
  Swords,
  Wand2,
  Flame,
  Zap,
  Target,
  Trophy,
  Gem,
  Anchor,
  Compass,
  Ghost,
  Feather,
  Dices,
  Sparkles,
  Bot
} from 'lucide-react';
import {
  AnimeHeroFace,
  AnimeNinjaFace,
  AnimeGirlFace,
  AnimeSenpaiFace,
  AnimeSaiyanFace,
  AnimePirateFace,
  AnimeNekoFace,
  ToonHappyBoyFace,
  ToonCuteMonsterFace,
  ToonBunnyFace,
  ToonPandaFace,
  ToonAlienFace
} from './avatarFaces';
import {
  RobloxNoobFace,
  RobloxBaconFace,
  RobloxPinkFace,
  RobloxDinoFace,
  RobloxCyberMechFace,
  RobloxWitchFace
} from './robloxFaces';

export type AvatarCategory = 'roblox' | 'anime' | 'cartoon' | 'classic' | 'custom';

export interface AvatarDefinition {
  id: string;
  name: string;
  tag: string;
  category: AvatarCategory;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
}

export const PREDEFINED_AVATARS: AvatarDefinition[] = [
  // ===================================
  // 0. ROBLOX AVATARS (شخصيات روبلوكس)
  // ===================================
  {
    id: 'roblox-noob',
    name: 'نوب روبلوكس',
    tag: 'كلاسيكي R$',
    category: 'roblox',
    icon: RobloxNoobFace,
    gradient: 'from-yellow-400 via-amber-500 to-amber-600',
    borderColor: 'border-yellow-300',
    glowColor: 'rgba(250, 204, 21, 0.6)',
    textColor: 'text-amber-300'
  },
  {
    id: 'roblox-bacon',
    name: 'بيكون هير (Bacon)',
    tag: 'مشهور',
    category: 'roblox',
    icon: RobloxBaconFace,
    gradient: 'from-amber-700 via-amber-800 to-stone-900',
    borderColor: 'border-amber-500',
    glowColor: 'rgba(217, 119, 6, 0.6)',
    textColor: 'text-amber-400'
  },
  {
    id: 'roblox-pink',
    name: 'فتاة روبلوكس',
    tag: 'أنيقة',
    category: 'roblox',
    icon: RobloxPinkFace,
    gradient: 'from-pink-500 via-rose-600 to-purple-700',
    borderColor: 'border-pink-300',
    glowColor: 'rgba(244, 114, 182, 0.6)',
    textColor: 'text-pink-300'
  },
  {
    id: 'roblox-dino',
    name: 'ديناصور روبلوكس',
    tag: 'مرح',
    category: 'roblox',
    icon: RobloxDinoFace,
    gradient: 'from-purple-600 via-purple-700 to-indigo-900',
    borderColor: 'border-amber-400',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    textColor: 'text-purple-300'
  },
  {
    id: 'roblox-cyber',
    name: 'سايبر روبلوكس Mech',
    tag: 'آلي متطور',
    category: 'roblox',
    icon: RobloxCyberMechFace,
    gradient: 'from-sky-500 via-cyan-600 to-slate-900',
    borderColor: 'border-cyan-300',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    textColor: 'text-cyan-300'
  },
  {
    id: 'roblox-witch',
    name: 'ساحرة Blox',
    tag: 'سحرية',
    category: 'roblox',
    icon: RobloxWitchFace,
    gradient: 'from-purple-800 via-indigo-900 to-slate-950',
    borderColor: 'border-amber-300',
    glowColor: 'rgba(192, 132, 252, 0.6)',
    textColor: 'text-amber-300'
  },
  // ===================================
  // 1. ANIME FACES (وشوش أنيمي)
  // ===================================
  {
    id: 'anime-hero',
    name: 'بطل الشونين',
    tag: 'حماسي',
    category: 'anime',
    icon: AnimeHeroFace,
    gradient: 'from-orange-500 via-amber-600 to-red-700',
    borderColor: 'border-amber-400',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    textColor: 'text-amber-300'
  },
  {
    id: 'anime-ninja',
    name: 'نينجا الظل',
    tag: 'غامض',
    category: 'anime',
    icon: AnimeNinjaFace,
    gradient: 'from-slate-700 via-slate-800 to-zinc-950',
    borderColor: 'border-red-500',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    textColor: 'text-rose-400'
  },
  {
    id: 'anime-girl',
    name: 'فتاة الكاواي',
    tag: 'لطيفة',
    category: 'anime',
    icon: AnimeGirlFace,
    gradient: 'from-pink-400 via-rose-500 to-purple-600',
    borderColor: 'border-pink-300',
    glowColor: 'rgba(244, 114, 182, 0.5)',
    textColor: 'text-pink-300'
  },
  {
    id: 'anime-saiyan',
    name: 'المحارب الذهبي',
    tag: 'أسطوري',
    category: 'anime',
    icon: AnimeSaiyanFace,
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    borderColor: 'border-yellow-300',
    glowColor: 'rgba(234, 179, 8, 0.55)',
    textColor: 'text-yellow-300'
  },
  {
    id: 'anime-pirate',
    name: 'قرصان القش',
    tag: 'مغامر',
    category: 'anime',
    icon: AnimePirateFace,
    gradient: 'from-red-500 via-amber-600 to-yellow-600',
    borderColor: 'border-red-400',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    textColor: 'text-red-300'
  },
  {
    id: 'anime-senpai',
    name: 'السينباي الذكي',
    tag: 'عبقري',
    category: 'anime',
    icon: AnimeSenpaiFace,
    gradient: 'from-blue-600 via-indigo-700 to-slate-900',
    borderColor: 'border-sky-400',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    textColor: 'text-sky-300'
  },
  {
    id: 'anime-neko',
    name: 'القطة أنيمي',
    tag: 'مرحة',
    category: 'anime',
    icon: AnimeNekoFace,
    gradient: 'from-purple-500 via-fuchsia-600 to-indigo-700',
    borderColor: 'border-purple-300',
    glowColor: 'rgba(192, 132, 252, 0.5)',
    textColor: 'text-purple-300'
  },

  // ===================================
  // 2. CARTOON CHARACTERS (أشكال كرتونية)
  // ===================================
  {
    id: 'toon-boy',
    name: 'الولد الشقي',
    tag: 'مرح',
    category: 'cartoon',
    icon: ToonHappyBoyFace,
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    borderColor: 'border-sky-300',
    glowColor: 'rgba(14, 165, 233, 0.45)',
    textColor: 'text-sky-300'
  },
  {
    id: 'toon-monster',
    name: 'الوحش الكيوت',
    tag: 'ظريف',
    category: 'cartoon',
    icon: ToonCuteMonsterFace,
    gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
    borderColor: 'border-violet-300',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    textColor: 'text-violet-300'
  },
  {
    id: 'toon-bunny',
    name: 'الأرنب السريع',
    tag: 'خفيف',
    category: 'cartoon',
    icon: ToonBunnyFace,
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    borderColor: 'border-emerald-300',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    textColor: 'text-emerald-300'
  },
  {
    id: 'toon-panda',
    name: 'الباندا الباسم',
    tag: 'هادئ',
    category: 'cartoon',
    icon: ToonPandaFace,
    gradient: 'from-slate-600 via-slate-800 to-zinc-900',
    borderColor: 'border-slate-300',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    textColor: 'text-slate-200'
  },
  {
    id: 'toon-alien',
    name: 'الفضائي الأخضر',
    tag: 'فضولي',
    category: 'cartoon',
    icon: ToonAlienFace,
    gradient: 'from-lime-500 via-green-600 to-emerald-800',
    borderColor: 'border-lime-300',
    glowColor: 'rgba(132, 204, 22, 0.5)',
    textColor: 'text-lime-300'
  },

  // ===================================
  // 3. CLASSIC ICONS (رموز كلاسيكية)
  // ===================================
  {
    id: 'crown',
    name: 'الملك',
    tag: 'ملكي',
    category: 'classic',
    icon: Crown,
    gradient: 'from-amber-500 to-yellow-600',
    borderColor: 'border-amber-400',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    textColor: 'text-amber-300'
  },
  {
    id: 'swords',
    name: 'الفارس',
    tag: 'شجاع',
    category: 'classic',
    icon: Swords,
    gradient: 'from-rose-500 to-red-600',
    borderColor: 'border-rose-400',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    textColor: 'text-rose-300'
  },
  {
    id: 'shield',
    name: 'المدافع',
    tag: 'حصين',
    category: 'classic',
    icon: Shield,
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-400',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    textColor: 'text-blue-300'
  },
  {
    id: 'flame',
    name: 'اللهب',
    tag: 'حماسي',
    category: 'classic',
    icon: Flame,
    gradient: 'from-orange-500 to-amber-600',
    borderColor: 'border-orange-400',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    textColor: 'text-orange-300'
  },
  {
    id: 'lightning',
    name: 'البرق',
    tag: 'سريع',
    category: 'classic',
    icon: Zap,
    gradient: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-300',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    textColor: 'text-yellow-300'
  },
  {
    id: 'wizard',
    name: 'الساحر',
    tag: 'غامض',
    category: 'classic',
    icon: Wand2,
    gradient: 'from-purple-500 to-indigo-700',
    borderColor: 'border-purple-400',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    textColor: 'text-purple-300'
  },
  {
    id: 'falcon',
    name: 'الصقر',
    tag: 'ثاقب',
    category: 'classic',
    icon: Feather,
    gradient: 'from-emerald-500 to-teal-700',
    borderColor: 'border-emerald-400',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    textColor: 'text-emerald-300'
  },
  {
    id: 'target',
    name: 'القناص',
    tag: 'دقيق',
    category: 'classic',
    icon: Target,
    gradient: 'from-red-500 to-rose-700',
    borderColor: 'border-red-400',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    textColor: 'text-red-300'
  },
  {
    id: 'trophy',
    name: 'البطل',
    tag: 'أسطوري',
    category: 'classic',
    icon: Trophy,
    gradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-300',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    textColor: 'text-amber-200'
  },
  {
    id: 'gem',
    name: 'الجوهرة',
    tag: 'نادر',
    category: 'classic',
    icon: Gem,
    gradient: 'from-cyan-400 to-blue-600',
    borderColor: 'border-cyan-300',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    textColor: 'text-cyan-300'
  },
  {
    id: 'captain',
    name: 'القبطان',
    tag: 'مغامر',
    category: 'classic',
    icon: Anchor,
    gradient: 'from-sky-500 to-indigo-600',
    borderColor: 'border-sky-400',
    glowColor: 'rgba(14, 165, 233, 0.4)',
    textColor: 'text-sky-300'
  },
  {
    id: 'compass',
    name: 'المستكشف',
    tag: 'ذكي',
    category: 'classic',
    icon: Compass,
    gradient: 'from-teal-500 to-emerald-700',
    borderColor: 'border-teal-400',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    textColor: 'text-teal-300'
  },
  {
    id: 'dices',
    name: 'المحظوظ',
    tag: 'مرح',
    category: 'classic',
    icon: Dices,
    gradient: 'from-fuchsia-500 to-pink-600',
    borderColor: 'border-fuchsia-400',
    glowColor: 'rgba(217, 70, 239, 0.4)',
    textColor: 'text-fuchsia-300'
  },
  {
    id: 'ghost',
    name: 'الشبح',
    tag: 'سري',
    category: 'classic',
    icon: Ghost,
    gradient: 'from-slate-600 to-slate-800',
    borderColor: 'border-slate-400',
    glowColor: 'rgba(148, 163, 184, 0.3)',
    textColor: 'text-slate-300'
  },
  {
    id: 'bot',
    name: 'الروبوت',
    tag: 'إلكتروني',
    category: 'classic',
    icon: Bot,
    gradient: 'from-violet-500 to-purple-800',
    borderColor: 'border-violet-400',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    textColor: 'text-violet-300'
  }
];

export const DEFAULT_AVATAR_ID = 'anime-hero';

export function isCustomPhotoAvatar(id?: string): boolean {
  if (!id) return false;
  return id.startsWith('data:image/') || id.startsWith('http://') || id.startsWith('https://') || id.startsWith('blob:');
}

export function getAvatarById(id?: string): AvatarDefinition {
  if (!id) return PREDEFINED_AVATARS[0];

  // Check if it's a custom uploaded user photo
  if (isCustomPhotoAvatar(id)) {
    return {
      id,
      name: 'صورتي الشخصية',
      tag: 'مخصص',
      category: 'custom',
      icon: () => null,
      gradient: 'from-amber-500 via-orange-500 to-rose-600',
      borderColor: 'border-amber-400',
      glowColor: 'rgba(251, 191, 36, 0.5)',
      textColor: 'text-amber-300'
    };
  }
  
  // Direct match by ID
  const found = PREDEFINED_AVATARS.find((a) => a.id === id);
  if (found) return found;

  // Fallback match for legacy emojis
  const emojiMap: Record<string, string> = {
    '👑': 'crown',
    '⚔️': 'swords',
    '🛡️': 'shield',
    '🔥': 'flame',
    '⚡': 'lightning',
    '✨': 'wizard',
    '🦅': 'falcon',
    '🎯': 'target',
    '🏆': 'trophy',
    '💎': 'gem',
    '⚓': 'captain',
    '🧭': 'compass',
    '🎲': 'dices',
    '🤖': 'bot',
    '🦁': 'crown',
    '🐉': 'flame',
    '🦊': 'swords',
    '🚀': 'lightning',
    '🐺': 'falcon'
  };

  const mappedId = emojiMap[id];
  if (mappedId) {
    const mapped = PREDEFINED_AVATARS.find((a) => a.id === mappedId);
    if (mapped) return mapped;
  }

  return PREDEFINED_AVATARS[0];
}
