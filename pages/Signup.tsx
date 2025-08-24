import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../firebase/config';
import UserIcon from '../components/icons/UserIcon';
import MailIcon from '../components/icons/MailIcon';
import LockIcon from '../components/icons/LockIcon';
import LogoIcon from '../components/icons/LogoIcon';
import { useTheme } from '../context/ThemeContext';

interface SignupProps {
  onNavigateToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with username
        await updateProfile(user, { displayName: username });

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: user.email,
            role: 'user',
            createdAt: new Date(),
        });

        // Auth state listener in App.tsx will handle login
    } catch (err: any) {
        switch (err.code) {
            case 'auth/email-already-in-use':
              setError('An account with this email already exists.');
              break;
            case 'auth/invalid-email':
              setError('Please enter a valid email address.');
              break;
            case 'auth/weak-password':
              setError('Password should be at least 6 characters.');
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
      <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-400 mb-8 font-yeseva">Create Free La'Shir Account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <UserIcon className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-10 pr-3 py-3 text-base bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            aria-label="Username"
          />
        </div>
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
        <div className="relative">
           <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <LockIcon className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-3 py-3 text-base bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            aria-label="Confirm Password"
          />
        </div>
        
        {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-lg bg-primary-500 text-white dark:text-gray-900 font-bold rounded-lg hover:bg-primary-400 transition-colors duration-300 shadow-lg mt-2 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      
      <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-base">
        Already have an account?{' '}
        <button onClick={onNavigateToLogin} className="font-medium text-primary-500 dark:text-primary-400 hover:underline">
          Log In
        </button>
      </p>
      <p className="text-center text-sm text-gray-500 mt-8">&copy; Messenger Studies 2025</p>
    </div>
  );
};

export default Signup;