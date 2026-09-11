import React from 'react';

// ==========================================
// ANIME FACES (وشوش أنيمي)
// ==========================================

// 1. Anime Shonen Hero (بطل الشونين - شعر أسود/برتقالي ورباط رأس أحمر)
export const AnimeHeroFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Spiky Anime Hair (Back) */}
    <path d="M20 45 L5 25 L30 30 L45 8 L60 25 L85 10 L78 38 L95 35 L80 55" fill="#1e293b" />
    {/* Face Base */}
    <path d="M26 38 C26 38 24 68 50 88 C76 68 74 38 74 38 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
    {/* Ears */}
    <ellipse cx="23" cy="52" rx="4" ry="7" fill="#fed7aa" />
    <ellipse cx="77" cy="52" rx="4" ry="7" fill="#fed7aa" />
    {/* Headband */}
    <path d="M24 38 Q50 43 76 38 L75 47 Q50 51 25 47 Z" fill="#dc2626" />
    <rect x="40" y="40" width="20" height="8" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
    <circle cx="50" cy="44" r="2" fill="#ef4444" />
    {/* Anime Eyes */}
    {/* Left Eye */}
    <path d="M33 55 Q41 53 45 56" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="39" cy="61" rx="4.5" ry="5.5" fill="#0284c7" />
    <ellipse cx="39" cy="61" rx="2.5" ry="3.5" fill="#082f49" />
    <circle cx="37" cy="59" r="1.5" fill="#ffffff" />
    <circle cx="41" cy="63" r="0.8" fill="#ffffff" />
    {/* Right Eye */}
    <path d="M55 56 Q59 53 67 55" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="61" cy="61" rx="4.5" ry="5.5" fill="#0284c7" />
    <ellipse cx="61" cy="61" rx="2.5" ry="3.5" fill="#082f49" />
    <circle cx="59" cy="59" r="1.5" fill="#ffffff" />
    <circle cx="63" cy="63" r="0.8" fill="#ffffff" />
    {/* Eyebrows */}
    <path d="M32 51 L44 54" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M68 51 L56 54" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
    {/* Anime Blush Marks */}
    <path d="M29 67 L33 65 M32 68 L36 66" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    <path d="M64 66 L68 64 M67 67 L71 65" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    {/* Nose & Grin */}
    <path d="M49 66 L51 68" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M42 75 Q50 82 58 75" fill="#991b1b" stroke="#0f172a" strokeWidth="1.5" />
    <path d="M44 76 Q50 78 56 76" fill="#ffffff" />
    {/* Front Hair Bangs */}
    <path d="M28 36 L38 48 L44 38 L52 50 L60 38 L72 46 L70 34" fill="#0f172a" />
  </svg>
);

// 2. Anime Ninja (النينجا الغامض - قناع وقناع عين شارينغان)
export const AnimeNinjaFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Silver/White Spiky Hair */}
    <path d="M22 46 L8 28 L28 32 L40 10 L58 8 L72 22 L92 18 L82 42 L95 48 L76 60" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
    {/* Face Base */}
    <path d="M28 38 C28 38 26 68 50 88 C74 68 72 38 72 38 Z" fill="#fed7aa" />
    {/* Ninja Mask covering mouth and nose */}
    <path d="M26 58 Q50 63 74 58 L72 82 Q50 92 28 82 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
    <path d="M36 66 Q50 72 64 66" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
    {/* Forehead Protector tilted */}
    <path d="M22 36 L78 30 L76 44 L22 48 Z" fill="#0f172a" />
    <rect x="36" y="34" width="28" height="11" rx="2" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" transform="rotate(-5 50 39)" />
    <circle cx="50" cy="39" r="2.5" fill="#334155" />
    {/* Right Eye (Normal Sharp Eye) */}
    <path d="M57 52 Q63 50 69 53" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="63" cy="55" rx="3.5" ry="4" fill="#1e293b" />
    <circle cx="62" cy="54" r="1" fill="#ffffff" />
    {/* Left Eye (Glowing Red Eye with Sharingan mark) */}
    <path d="M31 54 Q37 51 43 54" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="37" cy="56" rx="4" ry="4.5" fill="#dc2626" />
    <ellipse cx="37" cy="56" rx="2" ry="2" fill="#000000" />
    {/* Tomoe dots */}
    <circle cx="35" cy="54" r="0.9" fill="#000000" />
    <circle cx="39" cy="55" r="0.9" fill="#000000" />
    <circle cx="37" cy="58" r="0.9" fill="#000000" />
    <circle cx="36" cy="55" r="1.2" fill="#ffffff" />
    {/* Eyebrows */}
    <path d="M30 49 L42 51" stroke="#475569" strokeWidth="2" />
    <path d="M70 48 L58 50" stroke="#475569" strokeWidth="2" />
    {/* Front Hair Bang covering left forehead */}
    <path d="M26 34 L34 50 L40 38 L48 48 L56 36" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
  </svg>
);

// 3. Anime Kawaii Girl (فتاة الأنمي اللطيفة - شعر وردي وعيون براقة)
export const AnimeGirlFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Long Hair Back */}
    <path d="M16 35 C14 65 18 90 22 95 L30 90 L24 45 Z" fill="#f43f5e" />
    <path d="M84 35 C86 65 82 90 78 95 L70 90 L76 45 Z" fill="#f43f5e" />
    {/* Face Base */}
    <path d="M26 38 C26 38 25 68 50 86 C75 68 74 38 74 38 Z" fill="#fff1f2" />
    {/* Large Sparkly Anime Eyes */}
    {/* Left Eye */}
    <path d="M30 50 Q40 45 46 51" stroke="#4c0519" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="38" cy="60" rx="6.5" ry="8" fill="#ec4899" />
    <ellipse cx="38" cy="63" rx="4.5" ry="5.5" fill="#831843" />
    <circle cx="35" cy="56" r="2.8" fill="#ffffff" />
    <circle cx="41" cy="64" r="1.5" fill="#ffffff" />
    <circle cx="36" cy="65" r="0.9" fill="#ffffff" />
    {/* Eyelashes */}
    <path d="M46 49 L48 46" stroke="#4c0519" strokeWidth="2" strokeLinecap="round" />
    <path d="M30 50 L27 47" stroke="#4c0519" strokeWidth="2" strokeLinecap="round" />
    {/* Right Eye */}
    <path d="M54 51 Q60 45 70 50" stroke="#4c0519" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="62" cy="60" rx="6.5" ry="8" fill="#ec4899" />
    <ellipse cx="62" cy="63" rx="4.5" ry="5.5" fill="#831843" />
    <circle cx="59" cy="56" r="2.8" fill="#ffffff" />
    <circle cx="65" cy="64" r="1.5" fill="#ffffff" />
    <circle cx="60" cy="65" r="0.9" fill="#ffffff" />
    {/* Eyelashes */}
    <path d="M54 49 L52 46" stroke="#4c0519" strokeWidth="2" strokeLinecap="round" />
    <path d="M70 50 L73 47" stroke="#4c0519" strokeWidth="2" strokeLinecap="round" />
    {/* Sweet Blush */}
    <ellipse cx="29" cy="68" rx="4.5" ry="2.5" fill="#fb7185" opacity="0.6" />
    <ellipse cx="71" cy="68" rx="4.5" ry="2.5" fill="#fb7185" opacity="0.6" />
    {/* Tiny Nose & Happy Cat Mouth */}
    <circle cx="50" cy="67" r="1" fill="#f43f5e" />
    <path d="M46 73 Q48 76 50 74 Q52 76 54 73" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Bangs Hair */}
    <path d="M22 35 C25 15 75 15 78 35 C74 44 68 46 64 36 C58 48 50 48 46 36 C42 46 32 46 26 36 Z" fill="#fb7185" />
    {/* Star Hairpin */}
    <polygon points="26,30 28,34 32,35 29,38 30,42 26,40 22,42 23,38 20,35 24,34" fill="#facc15" stroke="#eab308" strokeWidth="1" />
  </svg>
);

// 4. Anime Smart Senpai (السينباي الذكي - نظارات براقة وتسريحة عصرية)
export const AnimeSenpaiFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dark Stylish Hair */}
    <path d="M22 45 L15 28 L30 20 L48 10 L70 12 L84 25 L78 45" fill="#1e1b4b" />
    {/* Face Base */}
    <path d="M26 38 C26 38 25 68 50 87 C75 68 74 38 74 38 Z" fill="#ffedd5" />
    {/* Front Hair Bangs sweeping across */}
    <path d="M24 35 L34 50 L42 36 L52 54 L62 38 L74 44 L70 30" fill="#312e81" />
    {/* Eyebrows */}
    <path d="M30 48 L44 50" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M70 48 L56 50" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
    {/* Anime Eyes */}
    <path d="M32 54 L44 54" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="38" cy="58" rx="4" ry="4.5" fill="#3b82f6" />
    <circle cx="36" cy="56" r="1.5" fill="#ffffff" />
    <path d="M56 54 L68 54" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="62" cy="58" rx="4" ry="4.5" fill="#3b82f6" />
    <circle cx="60" cy="56" r="1.5" fill="#ffffff" />
    {/* Modern Rectangular Anime Glasses with Glint */}
    <rect x="28" y="50" width="20" height="15" rx="3" fill="none" stroke="#38bdf8" strokeWidth="2.2" />
    <rect x="52" y="50" width="20" height="15" rx="3" fill="none" stroke="#38bdf8" strokeWidth="2.2" />
    <line x1="48" y1="56" x2="52" y2="56" stroke="#38bdf8" strokeWidth="2.5" />
    {/* Glasses Glint Line */}
    <line x1="30" y1="62" x2="42" y2="52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    {/* Nose & Calm Smirk */}
    <path d="M50 67 L48 71 L51 71" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M46 78 Q53 80 58 76" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 5. Anime Golden Saiyan (المحارب الذهبي السوبر - شعر ذهبي ناري)
export const AnimeSaiyanFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wild Golden Saiyan Spikes */}
    <path d="M12 40 L0 18 L24 22 L15 0 L40 10 L50 -2 L62 10 L88 0 L78 22 L100 18 L88 42 L80 55" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
    <path d="M20 32 L35 15 L45 28 L55 12 L68 28 L80 32" fill="#facc15" />
    {/* Face Base */}
    <path d="M26 38 C26 38 25 68 50 88 C75 68 74 38 74 38 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
    {/* Fierce Eyebrows */}
    <path d="M28 50 L44 56" stroke="#ca8a04" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M72 50 L56 56" stroke="#ca8a04" strokeWidth="3.5" strokeLinecap="round" />
    {/* Turquoise/Cyan Saiyan Eyes */}
    <path d="M30 54 Q38 52 44 57" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="38" cy="60" rx="4" ry="5" fill="#06b6d4" />
    <ellipse cx="38" cy="60" rx="2" ry="3" fill="#0e7490" />
    <circle cx="36" cy="58" r="1.5" fill="#ffffff" />
    <path d="M70 54 Q62 52 56 57" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="62" cy="60" rx="4" ry="5" fill="#06b6d4" />
    <ellipse cx="62" cy="60" rx="2" ry="3" fill="#0e7490" />
    <circle cx="60" cy="58" r="1.5" fill="#ffffff" />
    {/* Intense Focus Marks between eyes */}
    <path d="M48 55 L48 60 M52 55 L52 60" stroke="#ca8a04" strokeWidth="1.5" />
    {/* Nose and Confident Smile */}
    <path d="M50 66 L47 70 L52 70" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M40 76 Q50 82 60 76" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    {/* Golden Bangs falling on forehead */}
    <path d="M30 35 L40 50 L48 38 L54 52 L64 36" fill="#fde047" stroke="#eab308" strokeWidth="1" />
  </svg>
);

// 6. Anime Pirate Straw Hat (قرصان الأنمي - قبعة قش وابتسامة عريضة)
export const AnimePirateFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Straw Hat Crown */}
    <ellipse cx="50" cy="22" rx="26" ry="16" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
    <path d="M25 24 Q50 30 75 24 L75 29 Q50 35 25 29 Z" fill="#dc2626" />
    {/* Straw Hat Wide Brim */}
    <ellipse cx="50" cy="32" rx="46" ry="12" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
    {/* Face Base */}
    <path d="M28 36 C28 36 26 68 50 87 C74 68 72 36 72 36 Z" fill="#fed7aa" />
    {/* Black Messy Hair peeking under hat */}
    <path d="M26 36 L34 46 L40 38 L48 46 L56 38 L66 46 L72 36" fill="#1e293b" />
    {/* Round Enthusiastic Eyes */}
    <circle cx="38" cy="54" r="5.5" fill="#0f172a" />
    <circle cx="36" cy="52" r="2" fill="#ffffff" />
    <circle cx="62" cy="54" r="5.5" fill="#0f172a" />
    <circle cx="60" cy="52" r="2" fill="#ffffff" />
    {/* Small Scar under Left Eye */}
    <path d="M34 62 L42 64 M37 60 L39 66" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
    {/* Huge Grinning Anime Mouth */}
    <path d="M34 68 Q50 88 66 68 Z" fill="#991b1b" stroke="#0f172a" strokeWidth="2" />
    <path d="M37 69 Q50 76 63 69" fill="#ffffff" />
    {/* Rosy Cheeks */}
    <ellipse cx="28" cy="62" rx="3.5" ry="2" fill="#f43f5e" opacity="0.6" />
    <ellipse cx="72" cy="62" rx="3.5" ry="2" fill="#f43f5e" opacity="0.6" />
  </svg>
);

// 7. Anime Neko Kawaii (القطة الكاوائي - أذني قطة وردية)
export const AnimeNekoFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Cat Ears */}
    <polygon points="18,36 10,8 38,24" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />
    <polygon points="18,30 16,16 32,24" fill="#f472b6" />
    <polygon points="82,36 90,8 62,24" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />
    <polygon points="82,30 84,16 68,24" fill="#f472b6" />
    {/* Face Base */}
    <path d="M26 36 C26 36 24 66 50 86 C76 66 74 36 74 36 Z" fill="#faf5ff" />
    {/* Purple Anime Hair */}
    <path d="M22 34 C25 15 75 15 78 34 C72 44 65 44 60 36 C55 46 45 46 40 36 C35 44 28 44 22 34 Z" fill="#c084fc" />
    {/* Big Amber Cat Eyes */}
    <path d="M30 48 Q40 44 46 50" stroke="#581c87" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="38" cy="58" rx="6" ry="7.5" fill="#f59e0b" />
    <ellipse cx="38" cy="58" rx="2.5" ry="6" fill="#78350f" />
    <circle cx="36" cy="54" r="2.2" fill="#ffffff" />
    <circle cx="41" cy="62" r="1.2" fill="#ffffff" />
    <path d="M54 50 Q60 44 70 48" stroke="#581c87" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="62" cy="58" rx="6" ry="7.5" fill="#f59e0b" />
    <ellipse cx="62" cy="58" rx="2.5" ry="6" fill="#78350f" />
    <circle cx="60" cy="54" r="2.2" fill="#ffffff" />
    <circle cx="65" cy="62" r="1.2" fill="#ffffff" />
    {/* Kawaii Cat Mouth (3 shape) */}
    <path d="M44 68 Q47 72 50 69 Q53 72 56 68" stroke="#7e22ce" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    {/* Tiny Nose */}
    <polygon points="48,65 52,65 50,67" fill="#f472b6" />
    {/* Cat Whiskers on cheeks */}
    <line x1="20" y1="62" x2="30" y2="64" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="18" y1="68" x2="30" y2="68" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="80" y1="62" x2="70" y2="64" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="82" y1="68" x2="70" y2="68" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);


// ==========================================
// CARTOON CHARACTERS (أشكال كرتونية)
// ==========================================

// 8. Toon Happy Boy (الولد الكرتوني الباسم)
export const ToonHappyBoyFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Back Cap */}
    <path d="M18 36 C18 12 82 12 82 36 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="3" />
    <path d="M75 32 Q92 34 96 42 Q86 44 72 38 Z" fill="#0369a1" />
    {/* Big Round Face */}
    <circle cx="50" cy="56" r="32" fill="#fed7aa" stroke="#ea580c" strokeWidth="3" />
    {/* Big Round Cartoon Eyes */}
    <circle cx="38" cy="50" r="10" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
    <circle cx="40" cy="50" r="5" fill="#0284c7" />
    <circle cx="39" cy="48" r="2" fill="#ffffff" />
    <circle cx="62" cy="50" r="10" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
    <circle cx="60" cy="50" r="5" fill="#0284c7" />
    <circle cx="59" cy="48" r="2" fill="#ffffff" />
    {/* Big Round Nose */}
    <circle cx="50" cy="58" r="5" fill="#fb923c" stroke="#c2410c" strokeWidth="2" />
    {/* Wide Cheerful Grin with Tooth */}
    <path d="M34 66 Q50 86 66 66 Z" fill="#991b1b" stroke="#1e293b" strokeWidth="2.5" />
    <rect x="46" y="66" width="8" height="6" rx="1" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
    {/* Rosy Cheeks */}
    <circle cx="28" cy="62" r="4" fill="#f87171" opacity="0.6" />
    <circle cx="72" cy="62" r="4" fill="#f87171" opacity="0.6" />
  </svg>
);

// 9. Toon Cute Monster (الوحش الكرتوني اللطيف)
export const ToonCuteMonsterFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Monster Horns */}
    <path d="M26 30 Q16 10 32 16 Q30 26 26 30 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
    <path d="M74 30 Q84 10 68 16 Q70 26 74 30 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
    {/* Fluffy Purple Monster Head */}
    <rect x="18" y="24" width="64" height="64" rx="28" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="3" />
    {/* Big Single Center Eye (Cyclops style) or Big Double Eyes */}
    <circle cx="36" cy="46" r="11" fill="#ffffff" stroke="#4c1d95" strokeWidth="2.5" />
    <circle cx="38" cy="46" r="6" fill="#10b981" />
    <circle cx="36" cy="44" r="2.5" fill="#ffffff" />
    <circle cx="64" cy="46" r="11" fill="#ffffff" stroke="#4c1d95" strokeWidth="2.5" />
    <circle cx="62" cy="46" r="6" fill="#10b981" />
    <circle cx="60" cy="44" r="2.5" fill="#ffffff" />
    {/* Huge Warm Smile with cute fangs */}
    <path d="M30 64 Q50 84 70 64 Z" fill="#4c1d95" stroke="#312e81" strokeWidth="2" />
    {/* Little Cute Fangs */}
    <polygon points="38,64 42,64 40,70" fill="#ffffff" />
    <polygon points="58,64 62,64 60,70" fill="#ffffff" />
    {/* Pink Cheeks */}
    <ellipse cx="25" cy="62" rx="4" ry="2.5" fill="#f472b6" opacity="0.8" />
    <ellipse cx="75" cy="62" rx="4" ry="2.5" fill="#f472b6" opacity="0.8" />
  </svg>
);

// 10. Toon Bunny (الأرنب الكرتوني المرح)
export const ToonBunnyFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Long Bunny Ears */}
    <path d="M30 35 C20 0 40 -5 42 30 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2.5" />
    <path d="M32 28 C26 5 36 2 38 26 Z" fill="#f472b6" />
    <path d="M70 35 C80 0 60 -5 58 30 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2.5" />
    <path d="M68 28 C74 5 64 2 62 26 Z" fill="#f472b6" />
    {/* Chubby White Head */}
    <ellipse cx="50" cy="60" rx="34" ry="28" fill="#ffffff" stroke="#94a3b8" strokeWidth="3" />
    {/* Big Cartoon Eyes */}
    <ellipse cx="36" cy="52" rx="6" ry="8" fill="#0f172a" />
    <circle cx="34" cy="50" r="2.5" fill="#ffffff" />
    <ellipse cx="64" cy="52" rx="6" ry="8" fill="#0f172a" />
    <circle cx="62" cy="50" r="2.5" fill="#ffffff" />
    {/* Heart-shaped Pink Nose */}
    <path d="M46 60 Q50 58 54 60 Q50 66 46 60 Z" fill="#ec4899" />
    {/* Two Big Front Teeth */}
    <rect x="46" y="68" width="4" height="6" rx="1" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
    <rect x="50" y="68" width="4" height="6" rx="1" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
    {/* Bunny Smile */}
    <path d="M42 66 Q50 72 58 66" stroke="#475569" strokeWidth="2" fill="none" />
    {/* Whiskers */}
    <line x1="20" y1="58" x2="30" y2="60" stroke="#cbd5e1" strokeWidth="1.5" />
    <line x1="18" y1="64" x2="28" y2="64" stroke="#cbd5e1" strokeWidth="1.5" />
    <line x1="80" y1="58" x2="70" y2="60" stroke="#cbd5e1" strokeWidth="1.5" />
    <line x1="82" y1="64" x2="72" y2="64" stroke="#cbd5e1" strokeWidth="1.5" />
  </svg>
);

// 11. Toon Panda (الباندا الكرتوني)
export const ToonPandaFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Black Ears */}
    <circle cx="24" cy="28" r="14" fill="#1e293b" />
    <circle cx="76" cy="28" r="14" fill="#1e293b" />
    {/* White Head */}
    <circle cx="50" cy="56" r="34" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
    {/* Dark Eye Patches */}
    <ellipse cx="34" cy="50" rx="10" ry="12" fill="#1e293b" transform="rotate(-15 34 50)" />
    <ellipse cx="66" cy="50" rx="10" ry="12" fill="#1e293b" transform="rotate(15 66 50)" />
    {/* Cute White Eyes inside patches */}
    <circle cx="35" cy="49" r="4" fill="#ffffff" />
    <circle cx="36" cy="48" r="2" fill="#0284c7" />
    <circle cx="65" cy="49" r="4" fill="#ffffff" />
    <circle cx="64" cy="48" r="2" fill="#0284c7" />
    {/* Inverted Triangle Nose */}
    <polygon points="46,60 54,60 50,65" fill="#1e293b" />
    {/* Happy Panda Smile */}
    <path d="M44 68 Q50 74 56 68" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Cute Pink Cheeks */}
    <circle cx="26" cy="64" r="5" fill="#f472b6" opacity="0.6" />
    <circle cx="74" cy="64" r="5" fill="#f472b6" opacity="0.6" />
  </svg>
);

// 12. Toon Alien (الفضائي المرح)
export const ToonAlienFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Cute Antenna */}
    <line x1="50" y1="26" x2="50" y2="12" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="10" r="6" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
    {/* Green Alien Head */}
    <ellipse cx="50" cy="56" rx="36" ry="30" fill="#22c55e" stroke="#15803d" strokeWidth="3" />
    {/* Three Cartoon Eyes */}
    <circle cx="30" cy="48" r="8" fill="#ffffff" stroke="#15803d" strokeWidth="2" />
    <circle cx="31" cy="48" r="4" fill="#7c3aed" />
    <circle cx="30" cy="46" r="1.5" fill="#ffffff" />

    <circle cx="50" cy="42" r="9" fill="#ffffff" stroke="#15803d" strokeWidth="2" />
    <circle cx="50" cy="42" r="4.5" fill="#7c3aed" />
    <circle cx="49" cy="40" r="2" fill="#ffffff" />

    <circle cx="70" cy="48" r="8" fill="#ffffff" stroke="#15803d" strokeWidth="2" />
    <circle cx="69" cy="48" r="4" fill="#7c3aed" />
    <circle cx="68" cy="46" r="1.5" fill="#ffffff" />
    {/* Wide Goofy Smile */}
    <path d="M34 68 Q50 82 66 68" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
    {/* Cute spots */}
    <circle cx="30" cy="34" r="2" fill="#16a34a" />
    <circle cx="68" cy="34" r="2.5" fill="#16a34a" />
  </svg>
);
