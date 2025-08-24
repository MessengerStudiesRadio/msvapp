import React from 'react';
import BackIcon from '../components/icons/BackIcon';
import { useTheme, type Theme } from '../context/ThemeContext';
import LogoIcon from '../components/icons/LogoIcon';
import ExportIcon from '../components/icons/ExportIcon';
import ImportIcon from '../components/icons/ImportIcon';


interface SettingsProps {
  onBackToPlayer: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBackToPlayer }) => {
  const { theme, setTheme, updateCustomLogo, removeCustomLogo, importTheme } = useTheme();

  const handleLogoTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(prevTheme => ({ ...prevTheme, logoText: e.target.value }));
  };
  
  const handleScriptureChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTheme(prevTheme => ({ ...prevTheme, dailyScripture: e.target.value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          updateCustomLogo(file);
      }
      // Clear the input so the user can re-select the same file if needed.
      e.target.value = '';
  };

  const handleRemoveLogo = () => {
      removeCustomLogo();
  };

  const handleExportSettings = () => {
    try {
        // We only want to export settings that should be synced.
        const settingsToExport: Partial<Theme> = {
            logoText: theme.logoText,
            customLogoUrl: theme.customLogoUrl,
            showDailyScripture: theme.showDailyScripture,
            showLogoText: theme.showLogoText,
            themeMode: theme.themeMode,
            primaryColor: theme.primaryColor,
            liveStreamVideoId: theme.liveStreamVideoId,
            youtubePlaylistIdAudio: theme.youtubePlaylistIdAudio,
            youtubePlaylistIdDeepDives: theme.youtubePlaylistIdDeepDives,
            youtubePlaylistIdSeekersSabbath: theme.youtubePlaylistIdSeekersSabbath,
            youtubePlaylistIdHebrewMind: theme.youtubePlaylistIdHebrewMind,
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(settingsToExport, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "lashir-settings.json";
        link.click();
    } catch (error) {
        console.error("Failed to export settings:", error);
        alert("An error occurred while exporting settings.");
    }
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const result = event.target?.result;
            if (typeof result !== 'string') {
                throw new Error("File could not be read as text.");
            }
            const importedSettings = JSON.parse(result);
            
            // Basic validation
            if (typeof importedSettings === 'object' && importedSettings !== null) {
                importTheme(importedSettings);
                alert("Settings imported successfully!");
            } else {
                throw new Error("Invalid settings file format.");
            }
        } catch (error) {
            console.error("Failed to import settings:", error);
            alert(`Failed to import settings. Please ensure it's a valid JSON file. Error: ${error.message}`);
        } finally {
             // Clear the input so the user can re-select the same file if needed.
            e.target.value = '';
        }
    };
    reader.onerror = () => {
        alert("There was an error reading the selected file.");
    };
    reader.readAsText(file);
  };

  const ToggleSwitch = ({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string }) => (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="font-medium text-gray-700 dark:text-gray-300 select-none">
        {label}
      </label>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={id} className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-500 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
      </label>
    </div>
  );

  return (
    <main className="flex-grow p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <button 
            onClick={onBackToPlayer}
            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-primary-400 transition-colors duration-200 mr-4"
          >
            <BackIcon className="w-6 h-6" />
          </button>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-400">Site Settings</h2>
        </div>

        <div className="space-y-8">
          {/* Header Customization */}
           <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg md:text-xl font-semibold mb-6 text-primary-400 dark:text-primary-300">Header Customization</h3>
            <div className="space-y-6">
              <ToggleSwitch id="showLogoTextToggle" checked={theme.showLogoText} onChange={e => setTheme(prev => ({ ...prev, showLogoText: e.target.checked }))} label="Show Logo Text" />
              <div>
                <label htmlFor="logoText" className={`block text-sm font-medium mb-1 transition-opacity ${!theme.showLogoText ? 'opacity-50' : 'text-gray-700 dark:text-gray-300'}`}>Logo Text</label>
                <input id="logoText" type="text" value={theme.logoText} onChange={handleLogoTextChange} disabled={!theme.showLogoText} className={`w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-opacity ${!theme.showLogoText ? 'opacity-50 cursor-not-allowed' : ''}`} />
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <ToggleSwitch id="showDailyScriptureToggle" checked={theme.showDailyScripture} onChange={e => setTheme(prev => ({ ...prev, showDailyScripture: e.target.checked }))} label="Show Daily Scripture" />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom Logo</label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                    {theme.customLogoUrl ? (
                      <img src={theme.customLogoUrl} alt="Custom Logo" className="w-full h-full object-contain" />
                    ) : (
                      <LogoIcon className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="logo-upload" className="cursor-pointer bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
                      <span>Upload Image</span>
                      <input id="logo-upload" name="logo-upload" type="file" className="sr-only" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                    {theme.customLogoUrl && (
                      <button onClick={handleRemoveLogo} className="bg-red-600 text-white font-medium py-2 px-4 rounded-md shadow-sm hover:bg-red-700">
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* YouTube Integration */}
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg md:text-xl font-semibold mb-6 text-primary-400 dark:text-primary-300">YouTube Integration</h3>
            <div className="space-y-4">
              <div>
                  <label htmlFor="liveStreamVideoId" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Live Radio Stream ID</label>
                  <input 
                    id="liveStreamVideoId" 
                    type="text" 
                    value={theme.liveStreamVideoId} 
                    onChange={e => setTheme(prev => ({ ...prev, liveStreamVideoId: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., y5r2044I5uI"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter the 11-character Video ID of your YouTube live stream (for the 'Live Radio' page).
                  </p>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">Teaching Page Playlists</h4>
               <div>
                <label htmlFor="youtubePlaylistIdAudio" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">"Audio Library" Playlist ID</label>
                <input 
                  id="youtubePlaylistIdAudio" 
                  type="text" 
                  value={theme.youtubePlaylistIdAudio} 
                  onChange={e => setTheme(prev => ({ ...prev, youtubePlaylistIdAudio: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., PL..."
                />
              </div>
              <div>
                <label htmlFor="youtubePlaylistIdDeepDives" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">"Deep Dives" Playlist ID</label>
                <input 
                  id="youtubePlaylistIdDeepDives" 
                  type="text" 
                  value={theme.youtubePlaylistIdDeepDives} 
                  onChange={e => setTheme(prev => ({ ...prev, youtubePlaylistIdDeepDives: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., PL..."
                />
              </div>
               <div>
                <label htmlFor="youtubePlaylistIdSeekersSabbath" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">"Seeker's Sabbath Live" Playlist ID</label>
                <input 
                  id="youtubePlaylistIdSeekersSabbath" 
                  type="text" 
                  value={theme.youtubePlaylistIdSeekersSabbath} 
                  onChange={e => setTheme(prev => ({ ...prev, youtubePlaylistIdSeekersSabbath: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., PL..."
                />
              </div>
              <div>
                <label htmlFor="youtubePlaylistIdHebrewMind" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">"Restoring the Hebrew Mind" Playlist ID</label>
                <input 
                  id="youtubePlaylistIdHebrewMind" 
                  type="text" 
                  value={theme.youtubePlaylistIdHebrewMind} 
                  onChange={e => setTheme(prev => ({ ...prev, youtubePlaylistIdHebrewMind: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., PL..."
                />
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter the ID of a public YouTube playlist for each tab (the part after "list=" in the URL).
                </p>
              </div>
            </div>
          </div>
          
          {/* Import/Export */}
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg md:text-xl font-semibold mb-6 text-primary-400 dark:text-primary-300">Import / Export Settings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Export your site settings to a file, or import them on another device.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleExportSettings} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                <ExportIcon className="w-5 h-5" />
                Export Settings
              </button>
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-primary-400 transition-colors cursor-pointer">
                <ImportIcon className="w-5 h-5" />
                Import Settings
                <input type="file" className="hidden" accept=".json" onChange={handleImportSettings} />
              </label>
            </div>
          </div>

        </div>

        <footer className="text-center pt-8">
          <p className="text-xs text-gray-500">&copy; Messenger Studies 2025</p>
        </footer>
      </div>
    </main>
  );
};

export default Settings;
