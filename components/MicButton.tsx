import React from 'react';
import { MicState } from '../types';

interface MicButtonProps {
  micState: MicState;
  onToggle: () => void;
}

const MicIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.75 6.75 0 1 1-13.5 0v-1.5a.75.75 0 0 1 .75-.75Z" />
    </svg>
);

const StopIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
    </svg>
);


const MicButton: React.FC<MicButtonProps> = ({ micState, onToggle }) => {
  const isMicOn = micState === MicState.ON;
  
  const baseClasses = "rounded-full p-5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4";
  const micOnClasses = "bg-[var(--mic-on)] hover:bg-red-600 focus:ring-red-400 shadow-lg shadow-red-500/50";
  const micOffClasses = "bg-[var(--mic-off)] hover:bg-cyan-600 focus:ring-cyan-400 shadow-lg shadow-cyan-500/50";

  return (
    <button
      onClick={onToggle}
      className={`${baseClasses} ${isMicOn ? micOnClasses : micOffClasses}`}
      aria-label={isMicOn ? 'Stop conversation' : 'Start conversation'}
    >
      {isMicOn ? <StopIcon className="h-8 w-8 text-white" /> : <MicIcon className="h-8 w-8 text-white" />}
    </button>
  );
};

export default MicButton;