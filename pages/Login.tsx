import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase/config';
import UserIcon from '../components/icons/UserIcon';
import LockIcon from '../components/icons/LockIcon';
import LogoIcon from '../components/icons/LogoIcon';
import { useTheme } from '../context/ThemeContext';
import MailIcon from '../components/icons/MailIcon';

interface LoginProps {
  onNavigateToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change will be handled by the listener in App.tsx
    } catch (err: any) {
       switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        default:
          setError('An unknown error occurred. Please try again.');
          break;
      }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
      <a href="https://www.messengerstudies.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center mb-8 group">
         {theme.customLogoUrl ? (
            <img src={theme.customLogoUrl} alt="LA'SHIR Logo" className="w-full max-w-md h-auto object-contain transition-transform group-hover:scale-105" />
          ) : (
            <LogoIcon className="w-full max-w-md h-auto transition-transform group-hover:scale-105" />
          )}
      </a>
      <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-400 mb-2 font-yeseva">Welcome Back to La'Shir</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-base md:text-lg">Log in to your account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <MailIcon className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3 py-3 text-base bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            aria-label="Email"
          />
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <LockIcon className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-3 py-3 text-base bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            aria-label="Password"
          />
        </div>
        
        {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-lg bg-primary-500 text-white dark:text-gray-900 font-bold rounded-lg hover:bg-primary-400 transition-colors duration-300 shadow-lg mt-2 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>
      
      <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-base">
        Don't have an account?{' '}
        <button onClick={onNavigateToSignup} className="font-medium text-primary-500 dark:text-primary-400 hover:underline">
          Sign Up
        </button>
      </p>

      <p className="text-center text-sm text-gray-500 mt-8">&copy; Messenger Studies 2025</p>
    </div>
  );
};

export default Login;