import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { VoiceSettings, AnimationSettings } from '../types';
import ThemeSelector from './ThemeSelector';
import AnimationSelector from './AnimationSelector';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const voices = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];

const Slider: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}> = ({ label, value, min, max, step, onChange }) => (
    <div>
        <div className="flex justify-between items-center text-sm mb-1">
            <label className="font-medium text-[var(--text-secondary)]">{label}</label>
            <span className="text-[var(--text-tertiary)] font-mono">{value.toFixed(2)}x</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer slider-thumb"
        />
    </div>
);

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { 
    voiceSettings, 
    setVoiceSettings, 
    animationSettings, 
    setAnimationSettings,
    resetAnimationToDefaults
  } = useContext(ThemeContext);

  if (!isOpen) return null;

  const handleVoiceSettingChange = (field: keyof VoiceSettings, value: string | number) => {
    setVoiceSettings({
      ...voiceSettings,
      [field]: value,
    });
  };

  const handleAnimationSettingChange = (field: keyof AnimationSettings, value: number) => {
    setAnimationSettings({
        ...animationSettings,
        [field]: value,
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-secondary)] text-[var(--text-primary)] p-6 rounded-2xl w-full max-w-md mx-4 shadow-2xl backdrop-blur-lg border border-[var(--border-secondary)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-3xl leading-none">&times;</button>
        </div>
        
        <div className="space-y-6">
          {/* Voice Settings */}
          <div className="space-y-4 p-4 rounded-lg bg-[var(--bg-primary)] bg-opacity-40">
            <h3 className="font-semibold text-lg">AI Voice</h3>
            <div>
              <label htmlFor="voice-select" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Voice Model
              </label>
              <select
                id="voice-select"
                value={voiceSettings.voiceName}
                onChange={(e) => handleVoiceSettingChange('voiceName', e.target.value)}
                className="w-full bg-[var(--bg-tertiary)] border-[var(--border-secondary)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--bg-accent)] focus:outline-none transition-colors"
              >
                {voices.map(voice => (
                  <option key={voice} value={voice}>{voice}</option>
                ))}
              </select>
            </div>
            <Slider 
                label="Speaking Rate"
                value={voiceSettings.speakingRate}
                min={0.5} max={1.5} step={0.05}
                onChange={(val) => handleVoiceSettingChange('speakingRate', val)}
            />
            <Slider 
                label="Pitch"
                value={voiceSettings.pitch}
                min={-10.0} max={10.0} step={0.5}
                onChange={(val) => handleVoiceSettingChange('pitch', val)}
            />
          </div>

          {/* Theme Settings */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Theme
            </label>
            <div className="horizontal-scroll">
                <ThemeSelector />
            </div>
          </div>

          {/* Animation Settings */}
          <div className="space-y-4 p-4 rounded-lg bg-[var(--bg-primary)] bg-opacity-40">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Animation</h3>
                <button
                    onClick={resetAnimationToDefaults}
                    className="text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors duration-200 flex items-center gap-1 rounded-full px-2 py-1 hover:bg-[var(--bg-tertiary)]"
                    aria-label="Reset animation settings to default"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Reset
                </button>
            </div>
            <div className="horizontal-scroll">
                <AnimationSelector />
            </div>
             <Slider 
                label="Speed"
                value={animationSettings.speed}
                min={0.1} max={3.0} step={0.1}
                onChange={(val) => handleAnimationSettingChange('speed', val)}
            />
             <Slider 
                label="Intensity"
                value={animationSettings.intensity}
                min={0.0} max={2.0} step={0.1}
                onChange={(val) => handleAnimationSettingChange('intensity', val)}
            />
            <Slider 
                label="Saturation"
                value={animationSettings.saturation}
                min={0.0} max={2.0} step={0.1}
                onChange={(val) => handleAnimationSettingChange('saturation', val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;