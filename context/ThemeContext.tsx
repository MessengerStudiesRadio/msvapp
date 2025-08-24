import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { SCRIPTURES } from '../constants';

export const COLOR_PALETTES: Record<string, Record<string, string>> = {
  orange: {
    '100': '255 237 213',
    '200': '254 215 170',
    '300': '253 186 116',
    '400': '251 146 60',
    '500': '249 115 22',
  },
  blue: {
    '100': '219 234 254',
    '200': '191 219 254',
    '300': '147 197 253',
    '400': '96 165 250',
    '500': '59 130 246',
  },
  green: {
    '100': '209 250 229',
    '200': '167 243 208',
    '300': '110 231 183',
    '400': '52 211 153',
    '500': '16 185 129',
  },
  red: {
    '100': '254 226 226',
    '200': '254 202 202',
    '300': '252 165 165',
    '400': '248 113 113',
    '500': '239 68 68',
  },
  purple: {
    '100': '243 232 255',
    '200': '233 213 255',
    '300': '209 196 247',
    '400': '167 139 250',
    '500': '139 92 246',
  },
};

export interface Theme {
  logoText: string;
  dailyScripture: string;
  customLogoUrl: string;
  showDailyScripture: boolean;
  showLogoText: boolean;
  themeMode: 'light' | 'dark';
  primaryColor: string;
  liveStreamVideoId: string;
  youtubePlaylistIdAudio: string;
  youtubePlaylistIdDeepDives: string;
  youtubePlaylistIdSeekersSabbath: string;
  youtubePlaylistIdHebrewMind: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  updateCustomLogo: (file: File) => void;
  removeCustomLogo: () => void;
  importTheme: (theme: Partial<Theme>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const APP_THEME_SETTINGS_KEY = 'app-theme-settings';
const APP_THEME_LOGO_KEY = 'app-theme-logo';
const MAX_LOGO_SIZE_MB = 5;
const MAX_LOGO_SIZE_BYTES = MAX_LOGO_SIZE_MB * 1024 * 1024;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const defaultTheme: Theme = { 
        logoText: "LA'SHIR",
        dailyScripture: SCRIPTURES[Math.floor(Math.random() * SCRIPTURES.length)],
        customLogoUrl: "",
        showDailyScripture: true,
        showLogoText: true,
        themeMode: 'light',
        primaryColor: 'orange',
        liveStreamVideoId: "eyiNWfdh9Z8",
        youtubePlaylistIdAudio: "PLZZNhMjZ-Wc82uLmsiW305U-_CRokKPlh",
        youtubePlaylistIdDeepDives: "PLGYuzu0HWJB2Dg5OThkF6IRLkgmVZ7-Pi",
        youtubePlaylistIdSeekersSabbath: "PLKKNLCKc5pWj-2He2WaoIk2L_ag1TJyTw",
        youtubePlaylistIdHebrewMind: "PLKKNLCKc5pWhrAwsQnhe8gbPM2F79Wl0l",
    };

    try {
      const storedSettings = localStorage.getItem(APP_THEME_SETTINGS_KEY);
      const storedLogo = localStorage.getItem(APP_THEME_LOGO_KEY);
      
      const combinedTheme = { ...defaultTheme };
      if (storedSettings) {
        Object.assign(combinedTheme, JSON.parse(storedSettings));
      }
      if (storedLogo) {
        combinedTheme.customLogoUrl = storedLogo;
      }
      
      // Always initialize with a fresh random scripture
      combinedTheme.dailyScripture = SCRIPTURES[Math.floor(Math.random() * SCRIPTURES.length)];

      return combinedTheme;
    } catch (error) {
      console.error('Could not parse stored theme:', error);
    }
    
    return defaultTheme;
  });

  // Effect to handle scripture rotation
  useEffect(() => {
    const scriptureInterval = setInterval(() => {
        setTheme(prevTheme => {
            let newScripture = prevTheme.dailyScripture;
            // Ensure we don't pick the same scripture twice in a row if possible
            if (SCRIPTURES.length > 1) {
                do {
                    const randomIndex = Math.floor(Math.random() * SCRIPTURES.length);
                    newScripture = SCRIPTURES[randomIndex];
                } while (newScripture === prevTheme.dailyScripture);
            }
            return { ...prevTheme, dailyScripture: newScripture };
        });
    }, 30000); // Change scripture every 30 seconds

    return () => clearInterval(scriptureInterval); // Cleanup on unmount
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to handle dark/light mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme.themeMode === 'light') {
        root.classList.remove('dark');
    } else {
        root.classList.add('dark');
    }
  }, [theme.themeMode]);

  // Effect to handle primary color CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const palette = COLOR_PALETTES[theme.primaryColor] || COLOR_PALETTES.orange;
    Object.entries(palette).forEach(([shade, rgb]) => {
        root.style.setProperty(`--color-primary-${shade}`, rgb);
    });
  }, [theme.primaryColor]);

  // Persist all theme settings EXCEPT the logo, which is handled separately.
  // This prevents re-saving the large logo data URL on every minor settings change.
  useEffect(() => {
    try {
      const { customLogoUrl, dailyScripture, ...settingsToSave } = theme;
      localStorage.setItem(APP_THEME_SETTINGS_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Could not save theme settings to storage:', error);
    }
  }, [theme.logoText, theme.showDailyScripture, theme.showLogoText, theme.themeMode, theme.primaryColor, theme.liveStreamVideoId, theme.youtubePlaylistIdAudio, theme.youtubePlaylistIdDeepDives, theme.youtubePlaylistIdSeekersSabbath, theme.youtubePlaylistIdHebrewMind]);

  const updateCustomLogo = useCallback((file: File) => {
    if (file.size > MAX_LOGO_SIZE_BYTES) {
        alert(`The selected image is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Please choose a file smaller than ${MAX_LOGO_SIZE_MB}MB.`);
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        const result = reader.result as string;
        try {
            // Save to storage first, then update state.
            localStorage.setItem(APP_THEME_LOGO_KEY, result);
            setTheme(prev => ({ ...prev, customLogoUrl: result }));
        } catch (e) {
            // This catch is a safeguard if storage is full for other reasons.
            if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                alert(`Custom logo is too large to save. Please use a smaller image file (under ${MAX_LOGO_SIZE_MB}MB). The logo has been reset.`);
                localStorage.removeItem(APP_THEME_LOGO_KEY);
                setTheme(prev => ({...prev, customLogoUrl: ''}));
            } else {
                console.error('Could not save theme logo to storage:', e);
                alert('An unexpected error occurred while saving the logo.');
            }
        }
    };
    reader.onerror = () => {
        console.error("Error reading file.");
        alert("There was an error reading the selected file.");
    };
    reader.readAsDataURL(file);
  }, []);

  const removeCustomLogo = useCallback(() => {
    // Update storage first, then state.
    localStorage.removeItem(APP_THEME_LOGO_KEY);
    setTheme(prev => ({...prev, customLogoUrl: ''}));
  }, []);

  const importTheme = useCallback((newTheme: Partial<Theme>) => {
    try {
        const themeToApply = { ...theme, ...newTheme };

        // Persist the logo separately first, as it's in a different localStorage key
        if (themeToApply.customLogoUrl) {
            localStorage.setItem(APP_THEME_LOGO_KEY, themeToApply.customLogoUrl);
        } else {
            localStorage.removeItem(APP_THEME_LOGO_KEY);
        }

        // We call setTheme with a function to get the previous state
        setTheme(prev => ({
            ...prev, // Keep old state
            ...newTheme, // Overwrite with imported values
            dailyScripture: prev.dailyScripture // But preserve the rotating scripture
        }));
    } catch(error) {
        console.error("Failed to import theme:", error);
        alert("Could not import settings. The file might be invalid or storage is full.");
    }
  }, [theme]);
  
  const value = useMemo(() => ({ theme, setTheme, updateCustomLogo, removeCustomLogo, importTheme }), [theme, updateCustomLogo, removeCustomLogo, importTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
