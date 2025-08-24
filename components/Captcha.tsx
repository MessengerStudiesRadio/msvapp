import React from 'react';
import RefreshIcon from './icons/RefreshIcon';

interface CaptchaProps {
  captchaText: string;
  onRefresh: () => void;
}

const Captcha: React.FC<CaptchaProps> = ({ captchaText, onRefresh }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-200/50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-300 dark:border-gray-600">
      <span 
        className="font-mono text-2xl tracking-widest text-primary-400 dark:text-primary-300 select-none italic"
        style={{ textDecoration: 'line-through', textDecorationColor: 'rgba(var(--color-primary-400), 0.5)' }}
        aria-label="CAPTCHA code"
      >
        {captchaText}
      </span>
      <div className="relative group">
        <button
          type="button"
          onClick={onRefresh}
          className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary-400 transition-colors"
          aria-label="Refresh CAPTCHA"
        >
          <RefreshIcon className="w-5 h-5" />
        </button>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            New code
        </span>
      </div>
    </div>
  );
};

export default Captcha;