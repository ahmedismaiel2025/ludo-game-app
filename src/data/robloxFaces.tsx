import React from 'react';

// ==========================================
// ROBLOX FACES (شخصيات روبلوكس الأصلية)
// ==========================================

// 1. Roblox Noob (نوب روبلوكس - رأس أصفر بسماعات أزرق)
export const RobloxNoobFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Blocky Cube Head Base */}
    <rect x="18" y="22" width="64" height="60" rx="6" fill="#facc15" stroke="#ca8a04" strokeWidth="2.5" />
    {/* Headphone Band */}
    <path d="M16 34 C16 14 84 14 84 34" fill="none" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" />
    {/* Left Ear cup */}
    <rect x="12" y="32" width="10" height="20" rx="3" fill="#0369a1" stroke="#0284c7" strokeWidth="1.5" />
    <rect x="14" y="36" width="6" height="12" rx="1.5" fill="#38bdf8" />
    {/* Right Ear cup */}
    <rect x="78" y="32" width="10" height="20" rx="3" fill="#0369a1" stroke="#0284c7" strokeWidth="1.5" />
    <rect x="80" y="36" width="6" height="12" rx="1.5" fill="#38bdf8" />
    {/* Classic Roblox Smile Eyes */}
    <circle cx="38" cy="48" r="4" fill="#0f172a" />
    <circle cx="62" cy="48" r="4" fill="#0f172a" />
    {/* Classic Roblox Happy Open Mouth */}
    <path d="M35 60 Q50 72 65 60 Z" fill="#0f172a" stroke="#0f172a" strokeWidth="1.5" />
    <path d="M42 66 Q50 70 58 66" fill="#ef4444" />
    {/* Robux Symbol on Cheeks/Forehead */}
    <rect x="42" y="28" width="16" height="10" rx="2" fill="#e11d48" stroke="#ffffff" strokeWidth="1" />
    <text x="50" y="36" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="900" fontFamily="sans-serif">R$</text>
  </svg>
);

// 2. Roblox Bacon Hair Guy (بيكون هير - الشعر البني الشهير)
export const RobloxBaconFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Blocky Cube Head Base */}
    <rect x="20" y="26" width="60" height="58" rx="6" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
    {/* Bacon Hair Layers (Spiky Brown Blocky Strips) */}
    <path d="M14 28 L30 10 L50 22 L70 8 L86 28 L78 38 L22 38 Z" fill="#78350f" stroke="#451e0e" strokeWidth="2" />
    <path d="M25 22 L40 12 L55 24 L72 14" fill="none" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
    {/* Cool Wink & Smile */}
    <circle cx="36" cy="52" r="4.5" fill="#0f172a" />
    <circle cx="38" cy="50" r="1.5" fill="#ffffff" />
    {/* Cool Wink Right Eye */}
    <path d="M58 52 L68 52" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    {/* Confident Smile */}
    <path d="M36 65 Q50 74 64 65" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
    {/* Red Cap accent */}
    <path d="M22 34 Q50 26 78 34" fill="none" stroke="#dc2626" strokeWidth="4" />
  </svg>
);

// 3. Roblox Pink Girl (فتاة روبلوكس الوردية)
export const RobloxPinkFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Long Hair Back */}
    <rect x="14" y="24" width="72" height="66" rx="10" fill="#f43f5e" />
    {/* Blocky Cube Head Base */}
    <rect x="22" y="26" width="56" height="54" rx="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
    {/* Front Hair Bangs */}
    <path d="M22 26 Q50 36 78 26 L78 36 Q50 42 22 36 Z" fill="#e11d48" />
    {/* Pink Visor Cap */}
    <rect x="18" y="20" width="64" height="12" rx="3" fill="#fb7185" stroke="#ffffff" strokeWidth="1.5" />
    {/* Sparkle Eyes */}
    <ellipse cx="38" cy="50" rx="4" ry="5" fill="#0284c7" />
    <circle cx="36" cy="48" r="1.5" fill="#ffffff" />
    <ellipse cx="62" cy="50" rx="4" ry="5" fill="#0284c7" />
    <circle cx="60" cy="48" r="1.5" fill="#ffffff" />
    {/* Eyelashes */}
    <path d="M32 44 L36 46 M68 44 L64 46" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    {/* Cute Smile */}
    <path d="M40 63 Q50 70 60 63" fill="none" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
    {/* Pink Star Clip */}
    <polygon points="70,22 72,26 76,26 73,28 74,32 70,30 66,32 67,28 64,26 68,26" fill="#facc15" />
  </svg>
);

// 4. Roblox Dino Suit (ديناصور روبلوكس البنفسجي/الأخضر)
export const RobloxDinoFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dino Hood Outer Head */}
    <rect x="16" y="16" width="68" height="68" rx="14" fill="#a855f7" stroke="#6b21a8" strokeWidth="3" />
    {/* Dino Spikes on Top */}
    <polygon points="34,16 40,4 46,16" fill="#facc15" />
    <polygon points="54,16 60,4 66,16" fill="#facc15" />
    {/* Dino Teeth Border */}
    <path d="M26 30 L32 36 L38 30 L44 36 L50 30 L56 36 L62 30 L68 36 L74 30" fill="#ffffff" stroke="#6b21a8" strokeWidth="1" />
    {/* Face Opening (Blocky Cube inside) */}
    <rect x="26" y="36" width="48" height="42" rx="6" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
    {/* Cute Face */}
    <circle cx="40" cy="54" r="3.5" fill="#0f172a" />
    <circle cx="60" cy="54" r="3.5" fill="#0f172a" />
    <path d="M42 64 Q50 70 58 64" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// 5. Roblox Cyber Mech (سايبر روبلوكس الآلي)
export const RobloxCyberMechFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Metallic Blocky Head Base */}
    <rect x="18" y="20" width="64" height="62" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />
    {/* Cyan Visor LED bar */}
    <rect x="24" y="38" width="52" height="18" rx="4" fill="#0284c7" stroke="#000000" strokeWidth="1.5" />
    <rect x="28" y="42" width="44" height="10" rx="2" fill="#38bdf8" />
    {/* Glowing Visor Text */}
    <circle cx="38" cy="47" r="3" fill="#ffffff" />
    <circle cx="62" cy="47" r="3" fill="#ffffff" />
    {/* Robot Grill Mouth */}
    <rect x="36" y="62" width="28" height="10" rx="2" fill="#0f172a" stroke="#0284c7" strokeWidth="1" />
    <line x1="43" y1="62" x2="43" y2="72" stroke="#38bdf8" strokeWidth="1.5" />
    <line x1="50" y1="62" x2="50" y2="72" stroke="#38bdf8" strokeWidth="1.5" />
    <line x1="57" y1="62" x2="57" y2="72" stroke="#38bdf8" strokeWidth="1.5" />
    {/* Robot Antennas */}
    <rect x="10" y="36" width="8" height="16" rx="2" fill="#0284c7" />
    <rect x="82" y="36" width="8" height="16" rx="2" fill="#0284c7" />
  </svg>
);

// 6. Roblox Witch / Wizard (ساحرة روبلوكس الأسطورية)
export const RobloxWitchFace: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Pointy Purple Witch Hat */}
    <polygon points="50,2 20,38 80,38" fill="#581c87" stroke="#c084fc" strokeWidth="2" />
    <ellipse cx="50" cy="38" rx="42" ry="8" fill="#3b0764" stroke="#c084fc" strokeWidth="2" />
    <rect x="36" y="30" width="28" height="8" fill="#facc15" />
    {/* Face Base */}
    <rect x="24" y="38" width="52" height="48" rx="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
    {/* Purple Magic Eyes */}
    <circle cx="40" cy="58" r="4.5" fill="#7e22ce" />
    <circle cx="38" cy="56" r="1.5" fill="#ffffff" />
    <circle cx="60" cy="58" r="4.5" fill="#7e22ce" />
    <circle cx="58" cy="56" r="1.5" fill="#ffffff" />
    {/* Smile */}
    <path d="M40 72 Q50 80 60 72" fill="none" stroke="#581c87" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
