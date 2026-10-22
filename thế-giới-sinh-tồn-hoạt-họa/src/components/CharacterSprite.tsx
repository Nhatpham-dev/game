import React from 'react';
import { CharacterAppearance } from '../types/game';

interface Props {
  appearance: CharacterAppearance;
  direction?: 'down' | 'up' | 'left' | 'right';
  isMoving?: boolean;
  isWorking?: boolean;
  activityIcon?: string;
  size?: number;
  className?: string;
}

export const CharacterSprite: React.FC<Props> = ({
  appearance,
  direction = 'down',
  isMoving = false,
  isWorking = false,
  activityIcon,
  size = 48,
  className = ''
}) => {
  const { skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessory } = appearance;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Activity floating icon when working */}
      {isWorking && activityIcon && (
        <div className="absolute -top-3 right-0 bg-white/95 rounded-full p-1 shadow-md animate-bounce text-xs border border-amber-300 z-20">
          {activityIcon}
        </div>
      )}

      {/* SVG Character Avatar */}
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        className={`transition-transform duration-150 ${isMoving ? 'animate-pulse' : ''}`}
      >
        {/* Shadow */}
        <ellipse cx="20" cy="37" rx="11" ry="3" fill="rgba(0,0,0,0.25)" />

        {/* Legs / Pants */}
        <rect
          x="14"
          y="28"
          width="5"
          height="8"
          rx="2"
          fill={pantsColor}
          className={isMoving ? 'transition-all duration-200' : ''}
        />
        <rect
          x="21"
          y="28"
          width="5"
          height="8"
          rx="2"
          fill={pantsColor}
        />

        {/* Shoes */}
        <rect x="13" y="34" width="6" height="3" rx="1.5" fill="#1E293B" />
        <rect x="21" y="34" width="6" height="3" rx="1.5" fill="#1E293B" />

        {/* Torso / Shirt */}
        <rect x="12" y="18" width="16" height="12" rx="3" fill={shirtColor} />

        {/* Collar / V-neck detail */}
        <path d="M18 18 L20 21 L22 18" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />

        {/* Arms */}
        <rect
          x="9"
          y={isWorking ? "16" : "19"}
          width="4"
          height="9"
          rx="2"
          fill={shirtColor}
          transform={isWorking ? "rotate(-20 11 20)" : ""}
        />
        <rect
          x="27"
          y={isWorking ? "16" : "19"}
          width="4"
          height="9"
          rx="2"
          fill={shirtColor}
          transform={isWorking ? "rotate(20 29 20)" : ""}
        />

        {/* Hands */}
        <circle cx="11" cy="28" r="2.2" fill={skinColor} />
        <circle cx="29" cy="28" r="2.2" fill={skinColor} />

        {/* Head */}
        <circle cx="20" cy="12" r="8.5" fill={skinColor} />

        {/* Hair Styles */}
        {hairStyle === 'short' && (
          <path
            d="M12 11 Q20 3 28 11 Q28 6 20 5 Q12 6 12 11 Z"
            fill={hairColor}
          />
        )}
        {hairStyle === 'spiky' && (
          <path
            d="M11 12 L13 4 L16 8 L20 2 L24 8 L27 4 L29 12 Q20 7 11 12 Z"
            fill={hairColor}
          />
        )}
        {hairStyle === 'long' && (
          <g>
            <path d="M12 12 Q20 3 28 12 Q28 5 20 4 Q12 5 12 12 Z" fill={hairColor} />
            <rect x="10" y="10" width="3" height="11" rx="1.5" fill={hairColor} />
            <rect x="27" y="10" width="3" height="11" rx="1.5" fill={hairColor} />
          </g>
        )}
        {hairStyle === 'curly' && (
          <g fill={hairColor}>
            <circle cx="13" cy="8" r="3.5" />
            <circle cx="18" cy="5" r="4" />
            <circle cx="23" cy="5" r="4" />
            <circle cx="27" cy="8" r="3.5" />
          </g>
        )}
        {hairStyle === 'buzz' && (
          <path
            d="M13 10 Q20 5 27 10"
            stroke={hairColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Face details based on direction */}
        {direction !== 'up' && (
          <>
            {/* Eyes */}
            {direction === 'left' ? (
              <circle cx="16" cy="12" r="1.3" fill="#0F172A" />
            ) : direction === 'right' ? (
              <circle cx="24" cy="12" r="1.3" fill="#0F172A" />
            ) : (
              <>
                <circle cx="17" cy="12" r="1.3" fill="#0F172A" />
                <circle cx="23" cy="12" r="1.3" fill="#0F172A" />
              </>
            )}

            {/* Smile */}
            <path
              d={direction === 'left' ? "M14 15 Q16 16.5 18 15" : direction === 'right' ? "M22 15 Q24 16.5 26 15" : "M18 15 Q20 17 22 15"}
              stroke="#0F172A"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Rosy cheeks */}
            <circle cx="15" cy="14" r="1" fill="#F43F5E" opacity="0.5" />
            <circle cx="25" cy="14" r="1" fill="#F43F5E" opacity="0.5" />
          </>
        )}

        {/* Accessories */}
        {accessory === 'glasses' && direction !== 'up' && (
          <g stroke="#0284C7" strokeWidth="1" fill="none">
            <rect x="15" y="10.5" width="4.5" height="3" rx="0.8" />
            <rect x="21" y="10.5" width="4.5" height="3" rx="0.8" />
            <line x1="19.5" y1="12" x2="21" y2="12" />
          </g>
        )}
        {accessory === 'hat' && (
          <path
            d="M10 7 L30 7 L28 2 L12 2 Z"
            fill="#EF4444"
          />
        )}
        {accessory === 'headphones' && (
          <g>
            <path d="M11 12 Q20 2 29 12" stroke="#059669" strokeWidth="2" fill="none" />
            <rect x="9" y="10" width="3" height="5" rx="1.5" fill="#10B981" />
            <rect x="28" y="10" width="3" height="5" rx="1.5" fill="#10B981" />
          </g>
        )}
        {accessory === 'backpack' && (
          <rect x="7" y="18" width="5" height="10" rx="2" fill="#D97706" />
        )}
      </svg>
    </div>
  );
};
