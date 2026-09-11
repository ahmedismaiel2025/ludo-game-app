import React, { useState } from 'react';
import { getAvatarById, isCustomPhotoAvatar } from '../data/avatars';

interface AvatarDisplayProps {
  avatarId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
  withGlow?: boolean;
}

const SIZE_CONFIG = {
  xs: {
    container: 'w-6 h-6',
    icon: 'w-4.5 h-4.5',
    border: 'border'
  },
  sm: {
    container: 'w-8 h-8',
    icon: 'w-6 h-6',
    border: 'border-2'
  },
  md: {
    container: 'w-10 h-10',
    icon: 'w-7.5 h-7.5',
    border: 'border-2'
  },
  lg: {
    container: 'w-12 h-12',
    icon: 'w-9 h-9',
    border: 'border-2'
  },
  xl: {
    container: 'w-16 h-16',
    icon: 'w-12 h-12',
    border: 'border-2'
  }
};

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarId,
  size = 'md',
  className = '',
  showBorder = true,
  withGlow = false
}) => {
  const [hasError, setHasError] = useState(false);
  const isCustom = isCustomPhotoAvatar(avatarId) && !hasError;
  const avatar = getAvatarById(avatarId);
  const IconComponent = avatar.icon;
  const sizeCfg = SIZE_CONFIG[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl ${
        isCustom ? 'bg-slate-900' : `bg-gradient-to-tr ${avatar.gradient}`
      } text-white shadow-md select-none transition-transform overflow-hidden ${sizeCfg.container} ${
        showBorder ? `${sizeCfg.border} ${avatar.borderColor}` : ''
      } ${className}`}
      style={
        withGlow
          ? {
              boxShadow: `0 0 14px ${avatar.glowColor}`
            }
          : undefined
      }
      title={isCustom ? 'الصورة الشخصية' : avatar.name}
    >
      {isCustom && avatarId ? (
        <img
          src={avatarId}
          alt="الصورة الشخصية"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      ) : (
        <IconComponent className={`${sizeCfg.icon} drop-shadow-sm`} />
      )}
    </div>
  );
};
