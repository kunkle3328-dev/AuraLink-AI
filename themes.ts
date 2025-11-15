import { Theme, ThemeName } from './types';

export const themes: Record<ThemeName, Theme> = {
    'aura-borealis': {
        name: 'aura-borealis',
        displayName: 'Aura Borealis',
        defaultAnimation: 'aurora',
        colors: {
            '--bg-primary': '#020617', // slate-950
            '--bg-secondary': 'rgba(15, 23, 42, 0.5)', // slate-900 with alpha
            '--bg-tertiary': 'rgba(51, 65, 85, 0.7)', // slate-700 with alpha
            '--bg-accent': '#22d3ee', // cyan-400
            '--text-primary': '#e2e8f0', // slate-200
            '--text-secondary': '#94a3b8', // slate-400
            '--text-tertiary': '#64748b', // slate-500
            '--border-primary': '#22d3ee', // cyan-400
            '--border-secondary': '#334155', // slate-700
            '--glow-primary': 'rgba(34, 211, 238, 0.7)', // cyan-400
            '--glow-secondary': 'rgba(74, 222, 128, 0.7)', // green-400
            '--glow-tertiary': 'rgba(192, 132, 252, 0.7)', // purple-400
            '--user-bubble': '#0891b2', // cyan-600
            '--model-bubble': '#1e293b', // slate-800
            '--mic-on': '#ef4444', // red-500
            '--mic-off': '#22d3ee', // cyan-400
        }
    },
    'liquid-metal': {
        name: 'liquid-metal',
        displayName: 'Liquid Metal',
        defaultAnimation: 'liquid-metal',
        colors: {
            '--bg-primary': '#111827',
            '--bg-secondary': 'rgba(31, 41, 55, 0.5)',
            '--bg-tertiary': 'rgba(75, 85, 99, 0.7)',
            '--bg-accent': '#e5e7eb',
            '--text-primary': '#f9fafb',
            '--text-secondary': '#d1d5db',
            '--text-tertiary': '#9ca3af',
            '--border-primary': '#9ca3af',
            '--border-secondary': '#4b5563',
            '--glow-primary': 'rgba(229, 231, 235, 0.6)',
            '--glow-secondary': 'rgba(249, 250, 251, 0.6)',
            '--glow-tertiary': 'rgba(209, 213, 219, 0.6)',
            '--user-bubble': '#4b5563',
            '--model-bubble': '#1f2937',
            '--mic-on': '#f87171',
            '--mic-off': '#e5e7eb',
        }
    },
    'retro-wave': {
        name: 'retro-wave',
        displayName: 'Retro Wave',
        defaultAnimation: 'retro-grid',
        colors: {
            '--bg-primary': '#0c0028',
            '--bg-secondary': 'rgba(24, 9, 53, 0.5)',
            '--bg-tertiary': 'rgba(57, 30, 108, 0.7)',
            '--bg-accent': '#f92ccc',
            '--text-primary': '#f0eaff',
            '--text-secondary': '#c59dfa',
            '--text-tertiary': '#8e5cf1',
            '--border-primary': '#00e5ff',
            '--border-secondary': '#580894',
            '--glow-primary': 'rgba(0, 229, 255, 0.7)',
            '--glow-secondary': 'rgba(249, 44, 204, 0.7)',
            '--glow-tertiary': 'rgba(142, 92, 241, 0.8)',
            '--user-bubble': '#8e5cf1',
            '--model-bubble': '#2a0e5a',
            '--mic-on': '#ff3d7a',
            '--mic-off': '#f92ccc',
        }
    },
    'bento-serenity': {
        name: 'bento-serenity',
        displayName: 'Bento Serenity',
        defaultAnimation: 'none',
        colors: {
            '--bg-primary': '#f5f5f4', // stone-100
            '--bg-secondary': 'rgba(255, 255, 255, 0.5)', // white
            '--bg-tertiary': 'rgba(229, 231, 235, 0.7)', // gray-200
            '--bg-accent': '#fb7185', // rose-500
            '--text-primary': '#292524', // stone-800
            '--text-secondary': '#78716c', // stone-500
            '--text-tertiary': '#a8a29e', // stone-400
            '--border-primary': '#fb7185', // rose-500
            '--border-secondary': '#e7e5e4', // stone-200
            '--glow-primary': 'rgba(251, 113, 133, 0.5)', // rose-500
            '--glow-secondary': 'rgba(250, 204, 21, 0.6)', // amber-400
            '--glow-tertiary': 'rgba(167, 139, 250, 0.6)', // violet-400
            '--user-bubble': '#fb7185', // rose-500
            '--model-bubble': '#ffffff', // white
            '--mic-on': '#ef4444', // red-500
            '--mic-off': '#fb7185', // rose-500
        }
    },
    'cosmic-rift': {
        name: 'cosmic-rift',
        displayName: 'Cosmic Rift',
        defaultAnimation: 'starfield',
        colors: {
            '--bg-primary': '#0a0a1a',
            '--bg-secondary': 'rgba(13, 13, 34, 0.5)',
            '--bg-tertiary': 'rgba(30, 30, 68, 0.7)',
            '--bg-accent': '#38bdf8',
            '--text-primary': '#e0e0ff',
            '--text-secondary': '#a0a0e0',
            '--text-tertiary': '#7070c0',
            '--border-primary': '#38bdf8',
            '--border-secondary': '#2a2a5a',
            '--glow-primary': 'rgba(56, 189, 248, 0.7)',
            '--glow-secondary': 'rgba(236, 72, 153, 0.7)',
            '--glow-tertiary': 'rgba(139, 92, 246, 0.7)',
            '--user-bubble': '#38bdf8',
            '--model-bubble': '#141434',
            '--mic-on': '#fb7185',
            '--mic-off': '#38bdf8',
        }
    },
    'supernova-burst': {
        name: 'supernova-burst',
        displayName: 'Supernova',
        defaultAnimation: 'supernova',
        colors: {
            '--bg-primary': '#0a021a',
            '--bg-secondary': 'rgba(19, 7, 43, 0.5)',
            '--bg-tertiary': 'rgba(44, 23, 85, 0.7)',
            '--bg-accent': '#ff8c00',
            '--text-primary': '#f0f8ff',
            '--text-secondary': '#c7b8e6',
            '--text-tertiary': '#8a7f9d',
            '--border-primary': '#ff8c00',
            '--border-secondary': '#4b0082',
            '--glow-primary': 'rgba(255, 165, 0, 0.8)',
            '--glow-secondary': 'rgba(255, 0, 255, 0.8)',
            '--glow-tertiary': 'rgba(0, 191, 255, 0.8)',
            '--user-bubble': '#c75c00',
            '--model-bubble': '#1c0b3b',
            '--mic-on': '#ff4500',
            '--mic-off': '#ff8c00',
        }
    }
};