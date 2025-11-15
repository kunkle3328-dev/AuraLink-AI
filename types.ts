export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export enum AIState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
}

export enum MicState {
  OFF = 'OFF',
  ON = 'ON',
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
}

export interface VoiceSettings {
  voiceName: string;
  speakingRate: number;
  pitch: number;
}

export interface AnimationSettings {
  speed: number;
  intensity: number;
  saturation: number;
}

export type ThemeName = 'aura-borealis' | 'liquid-metal' | 'retro-wave' | 'bento-serenity' | 'cosmic-rift' | 'supernova-burst';

export interface Theme {
  name: ThemeName;
  displayName: string;
  defaultAnimation: AnimationName;
  colors: {
    '--bg-primary': string;
    '--bg-secondary': string;
    '--bg-tertiary': string;
    '--bg-accent': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--text-tertiary': string;
    '--border-primary': string;
    '--border-secondary': string;
    '--glow-primary': string;
    '--glow-secondary': string;
    '--glow-tertiary': string;
    '--user-bubble': string;
    '--model-bubble': string;
    '--mic-on': string;
    '--mic-off': string;
  };
}

export type AnimationName = 'none' | 'aurora' | 'starfield' | 'retro-grid' | 'supernova' | 'liquid-metal';

export interface Animation {
  name: AnimationName;
  displayName: string;
}