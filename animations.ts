import { AnimationName, Animation } from './types';

export const animations: Record<AnimationName, Animation> = {
    'none': {
        name: 'none',
        displayName: 'Static',
    },
    'aurora': {
        name: 'aurora',
        displayName: 'Aurora',
    },
    'liquid-metal': {
        name: 'liquid-metal',
        displayName: 'Metal',
    },
    'retro-grid': {
        name: 'retro-grid',
        displayName: 'Grid',
    },
    'starfield': {
        name: 'starfield',
        displayName: 'Starfield',
    },
    'supernova': {
        name: 'supernova',
        displayName: 'Supernova',
    },
};
