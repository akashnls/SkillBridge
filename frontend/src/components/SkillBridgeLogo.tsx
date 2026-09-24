import React from 'react';

interface SkillBridgeLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SkillBridgeLogo: React.FC<SkillBridgeLogoProps> = ({
  size = 'md',
  className = ''
}) => {
  const containerSize =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const iconSize =
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div
      className={`${containerSize} rounded-xl bg-gradient-to-br from-[#1A2214] via-[#141A10] to-[#0D120B] border border-[#B6FF3B]/30 flex items-center justify-center shadow-[0_0_15px_rgba(182,255,59,0.2)] transition-transform group-hover:scale-105 shrink-0 ${className}`}
      title="SkillBridge"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSize} text-[#B6FF3B]`}
      >
        {/* Bridge archway connecting talent to opportunities */}
        <path
          d="M3.5 16.5C6 11.5 9 9 12 9C15 9 18 11.5 20.5 16.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Deck span */}
        <path
          d="M3 17H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Bridge suspension pillars */}
        <path
          d="M7.5 17V13M12 17V9M16.5 17V13"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Verified Skill star at apex */}
        <path
          d="M12 2.5L13.2 5.5L16 6.8L13.2 8.1L12 11L10.8 8.1L8 6.8L10.8 5.5L12 2.5Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};


