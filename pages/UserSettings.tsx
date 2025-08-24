
import React, { useState } from 'react';
import { useTheme, COLOR_PALETTES } from '../context/ThemeContext';
import XIcon from '../components/icons/XIcon';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';
import InfoIcon from '../components/icons/InfoIcon';

interface UserSettingsProps {
  onClose: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ onClose }) => {
  const { theme, setTheme } = useTheme();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleConfirmRefresh = () => {
    // Clear all known localStorage keys for this app
    localStorage.removeItem('msr_users');
    localStorage.removeItem('msr_study_outlines');
    localStorage.removeItem('msr_completed_readings_daily');
    localStorage.removeItem('app-theme-settings');
    localStorage.removeItem('app-theme-logo');
    
    // Obsolete keys from previous versions, clear just in case
    localStorage.removeItem('msr_teaching_playlists');
    localStorage.removeItem('msr_teaching_catalog');
    
    // Reload the application
    window.location.reload();
  };
  
  const ConfirmationModal = () => (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
    >
        <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-red-500/50"
        >
            <div className="p-6 text-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 id="confirm-title" className="text-xl font-bold text-gray-900 dark:text-white">Are you absolutely sure?</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    This action is irreversible. It will permanently delete <strong>all local data</strong>, including user accounts, saved studies, and completed readings, will be permanently deleted.
                </p>
                 <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-500/30 text-left flex items-start gap-3">
                    <InfoIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="font-semibold text-gray-800 dark:text-gray-200">Why refresh?</strong><br/>
                        This action ensures you receive the latest app additions and upgrades. It will not harm your device.
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                <button 
                    onClick={() => setIsConfirmModalOpen(false)} 
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleConfirmRefresh} 
                    className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                >
                    Confirm Refresh
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <>
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-settings-title"
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 id="user-settings-title" className="text-lg font-semibold text-primary-400 dark:text-primary-300">Appearance Settings</h3>
                <div className="relative group">
                    <button onClick={onClose} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full" aria-label="Close">
                        <XIcon className="w-5 h-5" />
                    </button>
                    <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Close</span>
                </div>
            </div>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <label htmlFor="themeToggle" className="font-medium text-gray-700 dark:text-gray-300">Theme</label>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500">Light</span>
                        <label className="relative inline-flex items-center cursor-pointer mx-3">
                            <input type="checkbox" id="themeToggle" className="sr-only peer" checked={theme.themeMode === 'dark'} onChange={e => setTheme(prev => ({...prev, themeMode: e.target.checked ? 'dark' : 'light'}))} />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-500 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                        </label>
                        <span className="text-sm text-gray-500">Dark</span>
                    </div>
                </div>

                 {/* Primary Color Section */}
                <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Primary Color</h4>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(COLOR_PALETTES).map(([colorName, palette]) => {
                            const isActive = theme.primaryColor === colorName;
                            const bgColor = `rgb(${palette['400']})`;
                            return (
                                <button
                                    key={colorName}
                                    onClick={() => setTheme(prev => ({ ...prev, primaryColor: colorName }))}
                                    className={`w-10 h-10 rounded-full border-2 transition-transform transform hover:scale-110 ${isActive ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-current' : 'border-transparent'}`}
                                    style={{ backgroundColor: bgColor, color: bgColor }}
                                    aria-label={`Set primary color to ${colorName}`}
                                    title={colorName.charAt(0).toUpperCase() + colorName.slice(1)}
                                />
                            );
                        })}
                    </div>
                </div>
                
                {/* Danger Zone Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="flex items-center gap-2 text-md font-semibold text-red-500 dark:text-red-400 mb-3">
                        <ExclamationTriangleIcon className="w-5 h-5" />
                        Danger Zone
                    </h4>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">Refresh App</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">This will reset all data and settings to default.</p>
                            </div>
                            <button
                                onClick={() => setIsConfirmModalOpen(true)}
                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
        {isConfirmModalOpen && <ConfirmationModal />}
    </>
  );
};

export default UserSettings;
