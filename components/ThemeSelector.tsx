import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Theme } from '../types';

const ThemeSelector: React.FC = () => {
  const { themeName, setThemeName, themes } = useContext(ThemeContext);

  return (
    <div className="flex flex-nowrap gap-4 pb-2">
      {Object.values(themes).map((theme: Theme) => (
        <div 
          key={theme.name} 
          className="flex flex-col items-center space-y-2 cursor-pointer group flex-shrink-0"
          onClick={() => setThemeName(theme.name)}
        >
          <div 
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 ${themeName === theme.name ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ring-[var(--bg-accent)]' : ''}`}
            style={{
              background: `linear-gradient(135deg, ${theme.colors['--bg-primary']}, ${theme.colors['--border-primary']})`,
              border: `2px solid ${theme.colors['--border-secondary']}`
            }}
          >
            {themeName === theme.name && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <p className={`text-xs font-medium transition-colors ${themeName === theme.name ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
            {theme.displayName}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ThemeSelector;