import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeName, AnimationName, VoiceSettings, AnimationSettings } from '../types';
import { themes } from '../themes';
import { animations } from '../animations';

interface ThemeContextType {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  themes: Record<ThemeName, Theme>;
  animationName: AnimationName;
  setAnimationName: (name: AnimationName) => void;
  voiceSettings: VoiceSettings;
  setVoiceSettings: (settings: VoiceSettings) => void;
  animationSettings: AnimationSettings;
  setAnimationSettings: (settings: AnimationSettings) => void;
  resetAnimationToDefaults: () => void;
}

const defaultVoiceSettings: VoiceSettings = {
    voiceName: 'Zephyr',
    speakingRate: 1.0,
    pitch: 0.0,
};

const defaultAnimationSettings: AnimationSettings = {
    speed: 1.0,
    intensity: 1.0,
    saturation: 1.0,
};

export const ThemeContext = createContext<ThemeContextType>({
  themeName: 'aura-borealis',
  setThemeName: () => {},
  themes: themes,
  animationName: 'supernova',
  setAnimationName: () => {},
  voiceSettings: defaultVoiceSettings,
  setVoiceSettings: () => {},
  animationSettings: defaultAnimationSettings,
  setAnimationSettings: () => {},
  resetAnimationToDefaults: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('aura-borealis');
  const [animationName, setAnimationName] = useState<AnimationName>('supernova');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(defaultVoiceSettings);
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>(defaultAnimationSettings);

  useEffect(() => {
    // Load saved settings from localStorage on initial mount
    const savedTheme = localStorage.getItem('aura-theme') as ThemeName;
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme);
      // Set animation to saved animation if available, otherwise theme default
      const savedAnimation = localStorage.getItem('aura-animation') as AnimationName;
      if (savedAnimation && animations[savedAnimation]) {
        setAnimationName(savedAnimation);
      } else {
        setAnimationName(themes[savedTheme].defaultAnimation);
      }
    } else {
        setAnimationName(themes['aura-borealis'].defaultAnimation);
    }

    const savedVoiceSettings = localStorage.getItem('aura-voice-settings');
    if (savedVoiceSettings) {
        setVoiceSettings(JSON.parse(savedVoiceSettings));
    }

    const savedAnimationSettings = localStorage.getItem('aura-animation-settings');
    if (savedAnimationSettings) {
        setAnimationSettings(JSON.parse(savedAnimationSettings));
    }
  }, []);

  const handleSetTheme = (name: ThemeName) => {
    setThemeName(name);
    localStorage.setItem('aura-theme', name);
    // When theme changes, set animation to the theme's default
    const newDefaultAnimation = themes[name].defaultAnimation;
    setAnimationName(newDefaultAnimation);
    localStorage.setItem('aura-animation', newDefaultAnimation);
  };

  const handleSetAnimation = (name: AnimationName) => {
    setAnimationName(name);
    localStorage.setItem('aura-animation', name);
  };

  const handleSetVoiceSettings = (settings: VoiceSettings) => {
    setVoiceSettings(settings);
    localStorage.setItem('aura-voice-settings', JSON.stringify(settings));
  };

  const handleSetAnimationSettings = (settings: AnimationSettings) => {
    setAnimationSettings(settings);
    localStorage.setItem('aura-animation-settings', JSON.stringify(settings));
  };
  
  const handleResetAnimationToDefaults = () => {
    // Reset sliders to default values
    setAnimationSettings(defaultAnimationSettings);
    localStorage.setItem('aura-animation-settings', JSON.stringify(defaultAnimationSettings));

    // Reset animation to the current theme's default
    const currentThemeDefaultAnimation = themes[themeName].defaultAnimation;
    setAnimationName(currentThemeDefaultAnimation);
    localStorage.setItem('aura-animation', currentThemeDefaultAnimation);
  };

  const value = { 
      themeName, 
      setThemeName: handleSetTheme, 
      themes, 
      animationName, 
      setAnimationName: handleSetAnimation,
      voiceSettings,
      setVoiceSettings: handleSetVoiceSettings,
      animationSettings,
      setAnimationSettings: handleSetAnimationSettings,
      resetAnimationToDefaults: handleResetAnimationToDefaults,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};