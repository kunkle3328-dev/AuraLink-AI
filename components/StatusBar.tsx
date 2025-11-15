import React from 'react';
import { ConnectionState } from '../types';

interface StatusBarProps {
  connectionState: ConnectionState;
}

const StatusBar: React.FC<StatusBarProps> = ({ connectionState }) => {
  const statusInfo = {
    [ConnectionState.DISCONNECTED]: { text: 'Disconnected', color: 'bg-gray-500', pulse: false },
    [ConnectionState.CONNECTING]: { text: 'Connecting...', color: 'bg-yellow-500', pulse: true },
    [ConnectionState.CONNECTED]: { text: 'Connected', color: 'bg-green-500', pulse: false },
    [ConnectionState.ERROR]: { text: 'Connection Error', color: 'bg-red-500', pulse: false },
  };

  const { text, color, pulse } = statusInfo[connectionState];

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-2 text-[var(--text-primary)] text-sm bg-[var(--bg-secondary)] backdrop-blur-sm px-3 py-1.5 rounded-full">
      <span className={`relative flex h-3 w-3`}>
        <span className={`${color} rounded-full h-3 w-3`}></span>
        {pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>}
      </span>
      <span>{text}</span>
    </div>
  );
};

export default StatusBar;