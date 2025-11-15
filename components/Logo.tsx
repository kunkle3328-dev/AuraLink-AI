import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--border-primary)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'var(--glow-tertiary)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path d="M50 15 L85 85 H68 L59.5 65 H40.5 L32 85 H15 L50 15 Z M45 55 H55 L50 40 L45 55 Z" fill="url(#logo-grad)" />
      </svg>
      <span className="text-2xl font-bold text-[var(--text-primary)]">AuraLink AI</span>
    </div>
  );
};

export default Logo;