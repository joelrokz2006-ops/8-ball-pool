/**
 * Settings Store
 * Persisted to localStorage
 */

import { audioManager } from '../game/audio/audioManager.js';

const STORAGE_KEY = 'billiards_settings_data_v1';

const DEFAULT_SETTINGS = {
  sfxVolume: 0.8,
  musicVolume: 0.4,
  muted: false,
  aimAssist: 'extended', // 'extended', 'standard', 'off'
  cameraMode: '3d', // '3d', 'topdown'
  handMode: 'right', // 'right', 'left'
  haptics: true,
  quality: 'high' // 'high', 'medium', 'low'
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Could not load settings from storage:', err);
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Could not save settings to storage:', err);
  }
}

let currentSettings = loadSettings();
const listeners = new Set();

// Synchronize audio manager with initial settings
audioManager.setSFXVolume(currentSettings.sfxVolume);
audioManager.setMusicVolume(currentSettings.musicVolume);
audioManager.setMuted(currentSettings.muted);

export const settingsStore = {
  getState() {
    return currentSettings;
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify() {
    saveSettings(currentSettings);
    listeners.forEach((fn) => fn(currentSettings));
  },

  updateSetting(key, value) {
    currentSettings[key] = value;

    if (key === 'sfxVolume') audioManager.setSFXVolume(value);
    if (key === 'musicVolume') audioManager.setMusicVolume(value);
    if (key === 'muted') audioManager.setMuted(value);

    this.notify();
  },

  triggerHaptic(duration = 25) {
    if (currentSettings.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch (e) {
        // Safe catch on unsupported browsers
      }
    }
  }
};
