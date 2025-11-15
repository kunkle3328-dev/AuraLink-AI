import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { animations } from '../animations';
import { Animation } from '../types';

const AnimationSelector: React.FC = () => {
  const { animationName, setAnimationName } = useContext(ThemeContext);

  return (
    <div className="flex flex-nowrap gap-4 pb-2">
      {Object.values(animations).map((anim: Animation) => (
        <div 
          key={anim.name} 
          className="flex flex-col items-center space-y-2 cursor-pointer group flex-shrink-0"
          onClick={() => setAnimationName(anim.name)}
        >
          <div 
            className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 transform group-hover:scale-110 ${animationName === anim.name ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ring-[var(--bg-accent)]' : ''}`}
            style={{
              background: 'var(--bg-primary)',
              border: `2px solid var(--border-secondary)`
            }}
          >
            <div className="background-animation-preview" data-animation-preview={anim.name}></div>
             {animationName === anim.name && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          <p className={`text-xs font-medium transition-colors ${animationName === anim.name ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
            {anim.displayName}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AnimationSelector;