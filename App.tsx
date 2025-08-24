import React, { useState, useRef, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, onSnapshot, orderBy, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import type { User, StudyOutline, SavedStudyOutline, MediaNavView, ActiveMediaView } from './types';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import UserSettings from './pages/UserSettings';
import Bible from './pages/Bible';
import Lexicon from './pages/Lexicon';
import AncientHebrew from './pages/AncientLexicon';
import Grammar from './pages/Grammar';
import NameExplanation from './pages/NameExplanation';
import LiveRadio from './pages/LiveRadio';
import TeachingsPage from './pages/TeachingsPage';
import LogoutIcon from './components/icons/LogoutIcon';
import PaintBrushIcon from './components/icons/PaintBrushIcon';
import XIcon from './components/icons/XIcon';
import GearIcon from './components/icons/GearIcon';
import BookOpenIcon from './components/icons/BookOpenIcon';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LogoIcon from './components/icons/LogoIcon';
import RssIcon from './components/icons/RssIcon';
import LexiconIcon from './components/icons/LexiconIcon';
import AncientHebrewIcon from './components/icons/AncientHebrewIcon';
import GrammarIcon from './components/icons/GrammarIcon';
import NameplateIcon from './components/icons/NameplateIcon';
import HeartIcon from './components/icons/HeartIcon';
import { BOOKS } from './data/bible';
import StudyBuddy from './pages/SermonCreator';
import StudyBuddyIcon from './components/icons/SermonCreatorIcon';
import { ScriptureProvider, useScripture } from './context/ScriptureContext';
import ScripturePopover from './components/ScripturePopover';
import { parseReference } from './utils/scripture';
import YouTubeIcon from './components/icons/YouTubeIcon';
import CalendarIcon from './components/icons/CalendarIcon';
import ReadingPlan from './pages/ReadingPlan';
import DailyReading from './pages/DailyReading';
import MenuIcon from './components/icons/MenuIcon';
import SpeakerWaveIcon from './components/icons/SpeakerWaveIcon';
import SpinnerIcon from './components/icons/SpinnerIcon';

const AppContent: React.FC = () => {
  // --- AUTH & VIEW STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authIsLoading, setAuthIsLoading] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeMediaView, setActiveMediaView] = useState<ActiveMediaView>('live-radio');
  const { theme } = useTheme();
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
  const [initialLexiconStrongs, setInitialLexiconStrongs] = useState<string | null>(null);
  const [initialAncientLetter, setInitialAncientLetter] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [playingView, setPlayingView] = useState<string | null>(null);

  // --- SCRIPTURE POPOVER ---
  const { showScripture, hideScripture, hideScriptureImmediately } = useScripture();
  
  // --- BIBLE STATE ---
  const [biblePosition, setBiblePosition] = useState({ book: BOOKS[0], chapter: 0 });
  const [verseToScroll, setVerseToScroll] = useState<number | null>(null);

  // --- DATA STATE (FROM FIRESTORE) ---
  const [savedStudyOutlines, setSavedStudyOutlines] = useState<SavedStudyOutline[]>([]);
  const [completedReadings, setCompletedReadings] = useState<string[]>([]);
  const [selectedReadingDate, setSelectedReadingDate] = useState<Date | null>(null);

  // --- BROWSER HISTORY INTEGRATION ---
  const isPopStateUpdate = useRef(false);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        isPopStateUpdate.current = true;
        const { activeMediaView: view, isSettingsOpen: settings, isUserSettingsOpen: userSettings, selectedReadingDate: readingDate } = event.state;
        setActiveMediaView(view);
        setIsSettingsOpen(settings);
        setIsUserSettingsOpen(userSettings);
        setSelectedReadingDate(readingDate ? new Date(readingDate) : null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    const initialState = { activeMediaView, isSettingsOpen, isUserSettingsOpen, selectedReadingDate: selectedReadingDate ? selectedReadingDate.toISOString() : null };
    history.replaceState(initialState, '');
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (isPopStateUpdate.current) {
      isPopStateUpdate.current = false;
      return;
    }
    const navState = { activeMediaView, isSettingsOpen, isUserSettingsOpen, selectedReadingDate: selectedReadingDate ? selectedReadingDate.toISOString() : null };
    if (JSON.stringify(navState) !== JSON.stringify(history.state)) {
      history.pushState(navState, '');
    }
  }, [activeMediaView, isSettingsOpen, isUserSettingsOpen, selectedReadingDate]);

  // --- FIREBASE AUTH & DATA ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setCurrentUser({
                    uid: user.uid,
                    email: user.email,
                    username: user.displayName,
                    role: userData.role || 'user'
                });
            } else {
                setCurrentUser({
                    uid: user.uid,
                    email: user.email,
                    username: user.displayName,
                    role: 'user'
                });
            }
        } else {
            setCurrentUser(null);
        }
        setAuthIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
        setSavedStudyOutlines([]);
        setCompletedReadings([]);
        return;
    }

    const studiesRef = collection(db, "users", currentUser.uid, "savedStudies");
    const studiesQuery = query(studiesRef, orderBy("dateCreated", "desc"));
    const unsubscribeStudies = onSnapshot(studiesQuery, (snapshot) => {
        const studies = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as SavedStudyOutline[];
        setSavedStudyOutlines(studies);
    }, (error) => {
        console.error("Error fetching studies:", error);
        setAppError("Could not load your saved studies.");
    });

    const readingsRef = collection(db, "users", currentUser.uid, "completedReadings");
    const unsubscribeReadings = onSnapshot(readingsRef, (snapshot) => {
        const readings = snapshot.docs.map(doc => doc.id);
        setCompletedReadings(readings);
    }, (error) => {
        console.error("Error fetching completed readings:", error);
        setAppError("Could not load your reading progress.");
    });

    return () => {
        unsubscribeStudies();
        unsubscribeReadings();
    };
  }, [currentUser]);
  
  useEffect(() => {
    if (!isPopStateUpdate.current) {
        setSelectedReadingDate(null);
    }
  }, [activeMediaView]);
  
  const handleLogout = () => {
    auth.signOut();
  };

  // --- FIRESTORE HANDLERS ---
  const handleSaveStudy = async (outline: StudyOutline): Promise<SavedStudyOutline> => {
      if (!currentUser) throw new Error("No user logged in");
      const studyData = {
          ...outline,
          dateCreated: Date.now(),
      };
      const studiesCollectionRef = collection(db, "users", currentUser.uid, "savedStudies");
      const docRef = await addDoc(studiesCollectionRef, studyData);
      return { ...studyData, id: docRef.id };
  };

  const handleDeleteStudy = async (studyId: string) => {
      if (!currentUser) return;
      const studyDocRef = doc(db, "users", currentUser.uid, "savedStudies", studyId);
      await deleteDoc(studyDocRef);
  };

  const handleToggleDayCompleted = async (dateString: string) => {
    if (!currentUser) return;
    const readingDocRef = doc(db, "users", currentUser.uid, "completedReadings", dateString);
    if (completedReadings.includes(dateString)) {
        await deleteDoc(readingDocRef);
    } else {
        await setDoc(readingDocRef, { completed: true, date: new Date(dateString) });
    }
  };
  
  if (appError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans p-4">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">Application Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{appError}</p>
        </div>
      </div>
    );
  }
  
  if (authIsLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans p-4">
        <LogoIcon className="h-32 w-auto mb-4" />
        <SpinnerIcon className="w-8 h-8 animate-spin text-primary-400"/>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans p-4">
        {authView === 'login' ? (
          <Login onNavigateToSignup={() => setAuthView('signup')} />
        ) : (
          <Signup onNavigateToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  const handleNavigateToLexicon = (strongs: string) => {
    setInitialLexiconStrongs(strongs);
    setActiveMediaView('lexicon');
  };

  const handleNavigateToAncientLexicon = (letter: string) => {
    const finalToRegular: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
    const regularLetter = finalToRegular[letter] || letter;
    setInitialAncientLetter(regularLetter);
    setActiveMediaView('ancient-hebrew');
  };

  const handleNavigateToBible = (book: string, chapter: number, verse: number) => {
    setBiblePosition({ book, chapter });
    setVerseToScroll(verse);
    setActiveMediaView('bible');
  };

  const handleSidebarNav = (view: ActiveMediaView) => {
    setActiveMediaView(view);
    setIsSidebarOpen(false);
  };

  const mainNavItems: { id: MediaNavView; label: string; icon: React.FC<any> }[] = [
      { id: 'live-radio', label: 'Live Radio', icon: YouTubeIcon },
      { id: 'teachings', label: 'Teachings', icon: RssIcon },
      { id: 'reading-plan', label: 'Reading Plan', icon: CalendarIcon },
      { id: 'bible', label: 'Bible', icon: BookOpenIcon },
      { id: 'lexicon', label: 'Lexicon', icon: LexiconIcon },
      { id: 'ancient-hebrew', label: 'Ancient Hebrew', icon: AncientHebrewIcon },
      { id: 'grammar', label: 'Grammar', icon: GrammarIcon },
      { id: 'study-assistant', label: 'AOD Study Buddy', icon: StudyBuddyIcon },
  ];
  
  let activeNavItem: { id: ActiveMediaView; label: string; icon: React.FC<any>; } | undefined = mainNavItems.find(item => item.id === activeMediaView);
  if (activeMediaView === 'name-explanation') {
      activeNavItem = { id: 'name-explanation', label: 'The Sacred Name', icon: NameplateIcon };
  }
  
  const renderPlayerView = () => (
      <>
          <div className="px-4 lg:px-8 pt-4">
              <div className="hidden lg:flex space-x-2 border-b border-gray-200 dark:border-gray-700">
                  {mainNavItems.map(item => {
                      const isPlaying = (item.id === 'live-radio' && playingView === 'live-radio') || (item.id === 'teachings' && playingView?.startsWith('teachings-'));
                      return (
                          <button 
                              key={item.id}
                              onClick={() => setActiveMediaView(item.id)} 
                              className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium transition-colors flex-shrink-0 ${activeMediaView === item.id ? 'border-b-2 border-primary-400 text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                          >
                              <item.icon className="w-5 h-5" />
                              <span>{item.label}</span>
                              {isPlaying && <SpeakerWaveIcon className="w-4 h-4 text-primary-400 ml-2 animate-pulse" />}
                          </button>
                      );
                  })}
              </div>
          </div>
          <main className="flex-grow relative">
              <div className={`${activeMediaView === 'bible' ? 'absolute inset-0 overflow-y-auto' : 'hidden'}`}><div className="p-4 lg:p-8 h-full"><Bible position={biblePosition} setPosition={setBiblePosition} onNavigateToLexicon={handleNavigateToLexicon} initialVerseToScroll={verseToScroll} onScrollComplete={() => setVerseToScroll(null)} /></div></div>
              <div className={`${activeMediaView === 'reading-plan' ? 'absolute inset-0 overflow-y-auto' : 'hidden'}`}><div className="p-4 lg:p-8 h-full">{selectedReadingDate ? <DailyReading date={selectedReadingDate} completedReadings={completedReadings} onToggleCompleted={handleToggleDayCompleted} onBack={() => window.history.back()} onNavigateToBible={handleNavigateToBible} /> : <ReadingPlan completedReadings={completedReadings} onSelectDate={setSelectedReadingDate} />}</div></div>
              <div className={`${activeMediaView === 'live-radio' ? 'absolute inset-0 overflow-y-auto' : 'hidden'}`}><div className="p-4 lg:p-8 h-full"><LiveRadio setPlayingView={setPlayingView} playingView={playingView} /></div></div>
              <div className={`${activeMediaView === 'lexicon' ? 'absolute inset-0 overflow-y-auto' : 'hidden'}`}><div className="p-4 lg:p-8 h-full"><Lexicon initialEntryStrongs={initialLexiconStrongs} onNavigateToAncientLexicon={handleNavigateToAncientLexicon} onNavigateToBible={handleNavigateToBible} /></div></div>
              <div className={`${activeMediaView === 'ancient-hebrew' ? 'absolute inset-0 overflow-y-auto' : 'hidden'}`}><div className="p-4 lg:p-8 h-full"><AncientHebrew initialLetter={initialAncientLetter} /></div></div>
              <div className={`${activeMediaView === 'grammar' ? 'absolute inset-0 overflow-y-auto' : 'hidden'}`}><div className="p-4 lg:p-8 h-full"><Grammar onNavigateToAncientLexicon={handleNavigateToAncientLexicon} /></div></div>
              <div className={`${activeMediaView === 'study-assistant' ? 'absolute inset-0 overflow-y-auto' : 'hidden'}`}><div className="p-4 lg:p-8 h-full"><StudyBuddy onNavigateToBible={handleNavigateToBible} onNavigateToAncientLexicon={handleNavigateToAncientLexicon} onNavigateToLexicon={handleNavigateToLexicon} savedOutlines={savedStudyOutlines} onSaveStudy={handleSaveStudy} onDeleteStudy={handleDeleteStudy} /></div></div>
              <div className={`${activeMediaView === 'name-explanation' ? 'absolute inset-0 overflow-y-auto' : 'hidden'}`}><div className="p-4 lg:p-8 h-full"><NameExplanation onNavigateToAncientLexicon={handleNavigateToAncientLexicon} onNavigateToLexicon={handleNavigateToLexicon} /></div></div>
              <div className={`${activeMediaView === 'teachings' ? 'absolute inset-0 flex flex-col' : 'hidden'}`}><TeachingsPage setPlayingView={setPlayingView} playingView={playingView} /></div>
          </main>
      </>
  );

  const renderDailyScripture = (scripture: string) => {
    const parts = scripture.split(/(-[\s\w:]+)$/);
    if (parts.length < 2) return <p className="italic whitespace-pre-wrap">{scripture}</p>;
    const text = parts[0];
    const reference = parts[1].replace('-', '').trim();
    const parsedRef = parseReference(reference);
    const handleScriptureClick = () => {
      if (parsedRef) {
        handleNavigateToBible(parsedRef.book, parsedRef.chapter - 1, parsedRef.verse);
        hideScriptureImmediately();
      }
    };
    return <button onClick={handleScriptureClick} disabled={!parsedRef} className="w-full text-center group disabled:cursor-default italic whitespace-pre-wrap hover:text-primary-600 dark:hover:text-primary-100 transition-colors" onMouseEnter={(e) => { if(parsedRef) showScripture(reference, e.currentTarget); }} onMouseLeave={hideScripture} aria-label={`Navigate to ${reference}`}>{text} -<span className="font-semibold">{` ${reference}`}</span></button>;
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
        <div className={`fixed inset-0 bg-black/60 z-[60] transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
        <aside className={`fixed top-0 left-0 z-[70] w-72 h-full bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Welcome! {currentUser.username}!</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="overflow-y-auto flex-grow">
                    <nav className="p-2">
                         {mainNavItems.map(item => {
                            const isPlaying = (item.id === 'live-radio' && playingView === 'live-radio') || (item.id === 'teachings' && playingView?.startsWith('teachings-'));
                            return (
                                <button key={item.id} onClick={() => handleSidebarNav(item.id)} className={`w-full text-left flex items-center space-x-3 p-3 rounded-md transition-colors ${activeMediaView === item.id ? 'bg-primary-500/10 text-primary-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                    <item.icon className={`w-5 h-5 ${activeMediaView === item.id ? 'text-primary-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                    <span className={`${activeMediaView === item.id ? 'font-semibold' : ''}`}>{item.label}</span>
                                    {isPlaying && <SpeakerWaveIcon className="w-4 h-4 text-primary-400 ml-auto animate-pulse" />}
                                </button>
                            );
                        })}
                    </nav>
                    <hr className="my-2 border-gray-200 dark:border-gray-700"/>
                     <div className="p-2 space-y-1">
                          <button onClick={() => handleSidebarNav('name-explanation')} className="w-full text-left flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"><NameplateIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /><span>The Sacred Name</span></button>
                          <a href="https://www.paypal.com/donate/?hosted_button_id=6SRUNMNB3YLS8" target="_blank" rel="noopener noreferrer" className="w-full text-left flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"><HeartIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /><span>Donate</span></a>
                    </div>
                </div>
                 <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                    <button onClick={() => { setIsUserSettingsOpen(true); setIsSidebarOpen(false); }} className="w-full text-left flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"><GearIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /><span>Appearance</span></button>
                    {currentUser.role === 'admin' && (<button onClick={() => { setIsSettingsOpen(true); setIsSidebarOpen(false); }} className="w-full text-left flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"><PaintBrushIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /><span>Site Settings</span></button>)}
                    <button onClick={handleLogout} className="w-full text-left flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"><LogoutIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /><span>Logout</span></button>
                 </div>
            </div>
        </aside>

      <header className="relative p-2 lg:p-4 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-between z-50">
          <div className="flex items-center justify-between w-full lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700" aria-label="Open menu"><MenuIcon className="w-6 h-6" /></button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate px-2">{activeNavItem?.label}</h1>
             <a href="https://www.messengerstudies.com" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">{theme.customLogoUrl ? <img src={theme.customLogoUrl} alt="LA'SHIR Logo" className="h-10 w-auto object-contain" /> : <LogoIcon className="h-10 w-auto" />}</a>
          </div>
          <div className="hidden lg:flex flex-col lg:flex-row items-center lg:justify-between gap-4 w-full">
            <a href="https://www.messengerstudies.com" target="_blank" rel="noopener noreferrer" className="flex items-center group flex-shrink-0">{theme.customLogoUrl ? <img src={theme.customLogoUrl} alt="LA'SHIR Logo" className="h-28 w-auto object-contain transition-transform group-hover:scale-105" /> : <LogoIcon className="h-28 w-auto transition-transform group-hover:scale-105" />}{theme.showLogoText && <span className="hidden sm:inline-block text-xl font-bold ml-4 font-yeseva text-gray-800 dark:text-gray-200">{theme.logoText}</span>}</a>
            <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <button onClick={() => setActiveMediaView('name-explanation')} className="px-3 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center" aria-label="The Sacred Name"><NameplateIcon className="w-5 h-5 mr-2" /><span className="whitespace-nowrap">The Sacred Name</span></button>
                    <a href="https://www.paypal.com/donate/?hosted_button_id=6SRUNMNB3YLS8" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center" aria-label="Donate"><HeartIcon className="w-5 h-5 mr-2" /><span className="whitespace-nowrap">Donate</span></a>
                </div>
                {currentUser.role === 'admin' && (<div className="flex items-center space-x-1"><div className="relative group"><button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Site Settings"><PaintBrushIcon className="w-5 h-5" /></button><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Site Settings</span></div></div>)}
                <div className="border-l border-gray-300 dark:border-gray-600 h-6"></div>
                <div className="flex items-center space-x-1">
                     <div className="relative group"><button onClick={() => setIsUserSettingsOpen(true)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="User Settings"><GearIcon className="w-5 h-5" /></button><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Appearance</span></div>
                    <div className="relative group"><button onClick={handleLogout} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Logout"><LogoutIcon className="w-5 h-5" /></button><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Logout</span></div>
                </div>
            </div>
        </div>
      </header>
      
      {theme.showDailyScripture && (<div className="text-center p-2 text-sm bg-primary-500/10 text-primary-800 dark:text-primary-200 border-b border-primary-500/20">{renderDailyScripture(theme.dailyScripture)}</div>)}
      
      <div className="flex-grow flex flex-col">{renderPlayerView()}</div>

      {isUserSettingsOpen && <UserSettings onClose={() => window.history.back()} />}
      
      {isSettingsOpen && (<div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-[60] flex flex-col"><Settings onBackToPlayer={() => window.history.back()} /></div>)}
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <ScriptureProvider>
      <AppContent />
      <ScripturePopover />
    </ScriptureProvider>
  </ThemeProvider>
);

export default App;