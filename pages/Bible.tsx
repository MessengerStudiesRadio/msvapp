
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { BOOKS, BIBLE_DATA } from '../data/bible';
import { LEXICON_MAP } from '../data/lexicon';
import TextSizeIncreaseIcon from '../components/icons/TextSizeIncreaseIcon';
import TextSizeDecreaseIcon from '../components/icons/TextSizeDecreaseIcon';
import SpeakerWaveIcon from '../components/icons/SpeakerWaveIcon';
import StopCircleIcon from '../components/icons/StopCircleIcon';
import SearchIcon from '../components/icons/SearchIcon';
import XIcon from '../components/icons/XIcon';
import BackIcon from '../components/icons/BackIcon';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import type { BibleBook, BibleVerse, LexiconEntry } from '../types';
import PlayCircleIcon from '../components/icons/PlayCircleIcon';
import ChevronUpDownIcon from '../components/icons/ChevronUpDownIcon';

const BIBLE_FONT_SIZE_KEY = 'msr_bible_font_size';
const BIBLE_VOICE_URI_KEY = 'msr_bible_voice_uri';
const BIBLE_PLAYBACK_RATE_KEY = 'msr_bible_playback_rate';
const MIN_FONT_SIZE = 80;
const MAX_FONT_SIZE = 200;
const FONT_STEP = 10;

const PLAYBACK_RATES = [
    { label: '0.75x', value: 0.75 },
    { label: '1x (Normal)', value: 1 },
    { label: '1.25x', value: 1.25 },
    { label: '1.5x', value: 1.5 },
    { label: '2x', value: 2 },
];

type SearchResult = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

interface BibleProps {
    position: { book: string; chapter: number };
    setPosition: (pos: { book: string; chapter: number }) => void;
    onNavigateToLexicon: (strongs: string) => void;
    initialVerseToScroll?: number | null;
    onScrollComplete: () => void;
}

const Bible: React.FC<BibleProps> = ({ position, setPosition, onNavigateToLexicon, initialVerseToScroll, onScrollComplete }) => {
  const { book: selectedBook, chapter: selectedChapter } = position;
  
  const currentBookData: BibleBook = useMemo(() => BIBLE_DATA[selectedBook] || [], [selectedBook]);

  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const storedSize = localStorage.getItem(BIBLE_FONT_SIZE_KEY);
      return storedSize ? Number(storedSize) : 100; // Default to 100%
    } catch (error) {
      console.error("Could not read font size from localStorage", error);
      return 100;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [scrollToVerse, setScrollToVerse] = useState<number | null>(null);
  
  const [strongsPopover, setStrongsPopover] = useState<{ content: LexiconEntry; targetRect: DOMRect } | null>(null);
  const [popoverLayout, setPopoverLayout] = useState<{ style: React.CSSProperties; isBelow: boolean } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverHideTimeout = React.useRef<number | null>(null);

  // --- AUDIO READER STATE ---
  const [isReading, setIsReading] = useState(false);
  const [isContinuousPlay, setIsContinuousPlay] = useState(false);
  const [currentlyReadingVerse, setCurrentlyReadingVerse] = useState<number | null>(null);
  const utteranceQueue = useRef<SpeechSynthesisUtterance[]>([]);
  const isReadingRef = useRef(false);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(() => {
    try { return localStorage.getItem(BIBLE_VOICE_URI_KEY); } catch { return null; }
  });
  const [isVoiceSelectorOpen, setIsVoiceSelectorOpen] = useState(false);
  const voiceSelectorRef = useRef<HTMLDivElement>(null);

  const [playbackRate, setPlaybackRate] = useState<number>(() => {
    try {
      const storedRate = localStorage.getItem(BIBLE_PLAYBACK_RATE_KEY);
      return storedRate ? Number(storedRate) : 1;
    } catch { return 1; }
  });
  const [isSpeedSelectorOpen, setIsSpeedSelectorOpen] = useState(false);
  const speedSelectorRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    try { localStorage.setItem(BIBLE_FONT_SIZE_KEY, String(fontSize)); } 
    catch (error) { console.error("Could not save font size to localStorage", error); }
  }, [fontSize]);
  
  useEffect(() => {
    try { localStorage.setItem(BIBLE_PLAYBACK_RATE_KEY, String(playbackRate)); } 
    catch (error) { console.error("Could not save playback rate to localStorage", error); }
  }, [playbackRate]);

  useEffect(() => { isReadingRef.current = isReading; }, [isReading]);


  // --- AUDIO READER LOGIC ---

  useEffect(() => {
    const populateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            setAvailableVoices(voices);
            // Only set a default if one isn't already loaded from localStorage
            const storedVoice = localStorage.getItem(BIBLE_VOICE_URI_KEY);
            if (!storedVoice && voices.length > 0) {
                // Prioritize Microsoft Matthew as requested
                let defaultVoice = voices.find(v => v.name === 'Microsoft Matthew - English (United States)');
                
                // Fallback to browser default or first English voice if Matthew is not available
                if (!defaultVoice) {
                    defaultVoice = voices.find(v => v.lang.startsWith('en') && v.default) || voices.find(v => v.lang.startsWith('en'));
                }
                
                if (defaultVoice) {
                    setSelectedVoiceURI(defaultVoice.voiceURI);
                }
            }
        }
    };
    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoices;
    }
    return () => {
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = null;
        }
    }
  }, []);

  useEffect(() => {
    try {
        if(selectedVoiceURI) localStorage.setItem(BIBLE_VOICE_URI_KEY, selectedVoiceURI);
        else localStorage.removeItem(BIBLE_VOICE_URI_KEY);
    } catch (error) { console.error("Could not save voice to localStorage", error); }
  }, [selectedVoiceURI]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (voiceSelectorRef.current && !voiceSelectorRef.current.contains(event.target as Node)) setIsVoiceSelectorOpen(false);
        if (speedSelectorRef.current && !speedSelectorRef.current.contains(event.target as Node)) setIsSpeedSelectorOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const chapters = currentBookData;
  const currentBookIndex = BOOKS.indexOf(selectedBook);
  const isLastChapterOfAll = currentBookIndex === BOOKS.length - 1 && chapters && selectedChapter === chapters.length - 1;

  const handleNextChapter = useCallback(() => {
    if (chapters && selectedChapter < chapters.length - 1) {
      setPosition({ book: selectedBook, chapter: selectedChapter + 1 });
    } else if (currentBookIndex < BOOKS.length - 1) {
      const nextBook = BOOKS[currentBookIndex + 1];
      setPosition({ book: nextBook, chapter: 0 });
    }
  }, [chapters, selectedChapter, selectedBook, currentBookIndex, setPosition]);


  const stopReading = useCallback(() => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
      }
      setIsReading(false);
      setCurrentlyReadingVerse(null);
      utteranceQueue.current = [];
      setIsContinuousPlay(false);
  }, []);
  
  const processNextUtterance = useCallback(() => {
    if (utteranceQueue.current.length > 0) {
        const utterance = utteranceQueue.current.shift()!;
        
        utterance.onstart = () => {
            const verseNum = (utterance as any).verseNumber;
            if (verseNum) {
                setCurrentlyReadingVerse(verseNum);
                const element = document.getElementById(`verse-${verseNum}`);
                if (element) {
                   element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        };

        utterance.onend = () => {
            processNextUtterance();
        };

        window.speechSynthesis.speak(utterance);
    } else {
        setCurrentlyReadingVerse(null);
        if (isContinuousPlay && !isLastChapterOfAll) {
            handleNextChapter();
        } else {
            stopReading();
        }
    }
  }, [isContinuousPlay, isLastChapterOfAll, handleNextChapter, stopReading]);

  const speakFromVerse = useCallback((verses: BibleVerse[], startingIndex: number = 0, readChapterNum: boolean = false) => {
    if (!('speechSynthesis' in window) || verses.length === 0) {
        alert("Audio reading is not supported in your browser or there is no content to read.");
        return;
    }
    
    window.speechSynthesis.cancel();
    utteranceQueue.current = [];

    const selectedVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
    const currentRate = playbackRate;

    if (readChapterNum) {
        const utterance = new SpeechSynthesisUtterance(`Chapter ${selectedChapter + 1}`);
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.lang = selectedVoice?.lang || 'en-US';
        utterance.rate = currentRate;
        utteranceQueue.current.push(utterance);
    }

    const versesToRead = verses.slice(startingIndex);

    versesToRead.forEach((verseParts, index) => {
        const verseNumber = startingIndex + index + 1;
        const verseText = verseParts.map(part => part.text).join('');
        const utterance = new SpeechSynthesisUtterance(verseText);
        
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.lang = selectedVoice?.lang || 'en-US';
        utterance.rate = currentRate;
        (utterance as any).verseNumber = verseNumber;
        utteranceQueue.current.push(utterance);
    });

    if (utteranceQueue.current.length > 0) {
        setIsReading(true);
        processNextUtterance();
    } else {
        stopReading();
    }
  }, [availableVoices, selectedVoiceURI, playbackRate, selectedChapter, processNextUtterance, stopReading]);

  const chapterContent: BibleVerse[] = useMemo(() => chapters[selectedChapter] || [], [chapters, selectedChapter]);

  useEffect(() => {
    if (isContinuousPlay && !isReadingRef.current) {
        speakFromVerse(chapterContent, 0, true);
    }
  }, [position, isContinuousPlay, chapterContent, speakFromVerse]);

  useEffect(() => {
      return () => {
          stopReading();
      };
  }, [stopReading]);

  const handleToggleReading = () => {
      if (isReading) {
          stopReading();
      } else {
          setIsContinuousPlay(true);
      }
  };

  const handleReadFromVerse = (verseIndex: number) => {
    if (isReading) {
        stopReading();
    }
    setTimeout(() => {
        setIsContinuousPlay(true);
        speakFromVerse(chapterContent, verseIndex, false);
    }, 100);
  };


  // --- POPOVER & DATA FETCHING ---

  useEffect(() => {
    if (strongsPopover && popoverRef.current) {
        const { targetRect } = strongsPopover;
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const PADDING = 8;
        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = document.documentElement.clientHeight;

        let top = targetRect.bottom + PADDING;
        let isBelow = true;

        if (top + popoverRect.height > clientHeight - PADDING) {
            top = targetRect.top - popoverRect.height - PADDING;
            isBelow = false;
        }
        
        if (top < PADDING) {
            top = PADDING;
        }

        let left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
        
        left = Math.max(PADDING, left);
        left = Math.min(left, clientWidth - popoverRect.width - PADDING);

        const arrowLeft = targetRect.left + targetRect.width / 2 - left;
        
        setPopoverLayout({
            style: {
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                opacity: 1,
                '--arrow-left': `${arrowLeft}px`,
            } as React.CSSProperties,
            isBelow: isBelow,
        });
    } else {
        setPopoverLayout(null);
    }
  }, [strongsPopover]);


  // --- SEARCH LOGIC ---
    const handleSearch = useCallback(async () => {
        const query = searchQuery.trim().toLowerCase() === 'god' ? 'eloah' : searchQuery;

        if (query.trim().length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const results: SearchResult[] = [];
        const lowerCaseQuery = query.toLowerCase();

        for (const bookName of BOOKS) {
            const bookData = BIBLE_DATA[bookName];
            bookData.forEach((chapterContent, chapterIndex) => {
                chapterContent.forEach((verseParts, verseIndex) => {
                    const verseText = verseParts.map(part => part.text).join('');
                    if (verseText.toLowerCase().includes(lowerCaseQuery)) {
                        results.push({
                            book: bookName,
                            chapter: chapterIndex + 1,
                            verse: verseIndex + 1,
                            text: verseText,
                        });
                    }
                });
            });
        }
        
        setSearchResults(results);
        setIsSearching(false);
    }, [searchQuery]);


  useEffect(() => {
    const handler = setTimeout(() => {
        handleSearch();
    }, 500); // Debounce search
    return () => clearTimeout(handler);
  }, [searchQuery, handleSearch]);


  // --- SCROLL & NAVIGATION ---
    useEffect(() => {
        if (initialVerseToScroll) {
            setScrollToVerse(initialVerseToScroll);
            onScrollComplete();
        }
    }, [initialVerseToScroll, onScrollComplete]);

  useEffect(() => {
    if (scrollToVerse) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`verse-${scrollToVerse}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-primary-400/20', 'rounded-md', 'transition-all', 'duration-1000', 'p-1', '-m-1');
          setTimeout(() => {
             element.classList.remove('bg-primary-400/20', 'rounded-md', 'transition-all', 'duration-1000', 'p-1', '-m-1');
          }, 2500);
        }
        setScrollToVerse(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scrollToVerse]);

  useEffect(() => {
    const mainContent = document.querySelector('main > div.absolute.inset-0.overflow-y-auto');
    if (mainContent) {
        mainContent.scrollTop = 0;
    }
  }, [chapterContent]);

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPosition({ book: e.target.value, chapter: 0 });
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPosition({ book: selectedBook, chapter: Number(e.target.value) });
  };

  const handleIncreaseFontSize = () => setFontSize(prev => Math.min(prev + FONT_STEP, MAX_FONT_SIZE));
  const handleDecreaseFontSize = () => setFontSize(prev => Math.max(prev - FONT_STEP, MIN_FONT_SIZE));

  const isFirstChapterOfAll = currentBookIndex === 0 && selectedChapter === 0;

  const handlePrevChapter = () => {
    if (selectedChapter > 0) {
      setPosition({ book: selectedBook, chapter: selectedChapter - 1 });
    } else if (currentBookIndex > 0) {
      const prevBookName = BOOKS[currentBookIndex - 1];
      const prevBookData = BIBLE_DATA[prevBookName];
      setPosition({ book: prevBookName, chapter: prevBookData.length - 1 });
    }
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <strong key={i} className="bg-primary-400/30 text-primary-500 dark:text-primary-200 rounded">{part}</strong>
                ) : ( part )
            )}
        </span>
    );
  };

  const handleGoToVerse = (book: string, chapter: number, verse: number) => {
    setSearchQuery(''); 
    setSearchResults([]);
    setPosition({ book, chapter: chapter - 1 });
    setScrollToVerse(verse); 
  };
  
  const handleWordMouseEnter = (event: React.MouseEvent, strongs: string) => {
    if (popoverHideTimeout.current) clearTimeout(popoverHideTimeout.current);
    const entry = LEXICON_MAP[strongs];
    if (!entry) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setStrongsPopover({ content: entry, targetRect: rect });
  };

  const handleWordMouseLeave = () => {
    popoverHideTimeout.current = window.setTimeout(() => {
        setStrongsPopover(null);
    }, 200);
  };

  const handlePopoverMouseEnter = () => {
    if (popoverHideTimeout.current) clearTimeout(popoverHideTimeout.current);
  }

  const handlePopoverMouseLeave = () => {
    setStrongsPopover(null);
  }

  const selectedVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800/50 rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-400 mb-4">MSV Scriptures</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Book/Chapter Selectors */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex-1 min-w-[120px]">
              <label htmlFor="book-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Book</label>
              <select id="book-select" value={selectedBook} onChange={handleBookChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                {BOOKS.map(book => <option key={book} value={book}>{book}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label htmlFor="chapter-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chapter</label>
              <select id="chapter-select" value={selectedChapter} onChange={handleChapterChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                {chapters.map((_, i) => <option key={i} value={i}>Chapter {i + 1}</option>)}
              </select>
            </div>
          </div>
          {/* Search Input */}
          <div className="relative">
            <label htmlFor="bible-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Scripture</label>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 top-7">
                <SearchIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input
                id="bible-search"
                type="text"
                placeholder="Search for a word or phrase..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3 group top-7" aria-label="Clear search">
                    <XIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                </button>
            )}
          </div>
        </div>
      </header>

      {/* Search Results Display */}
      {searchQuery.length > 2 && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-primary-400 mb-2">Search Results ({isSearching ? '...' : searchResults.length})</h2>
          {isSearching ? (
             <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400"><SpinnerIcon className="w-5 h-5 animate-spin"/><span>Searching...</span></div>
          ) : searchResults.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.map((result, index) => (
                <li key={index} className="border-b border-gray-200 dark:border-gray-700/50 pb-2">
                  <button onClick={() => handleGoToVerse(result.book, result.chapter, result.verse)} className="text-left w-full hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md">
                    <p className="font-semibold text-primary-500 dark:text-primary-300">{result.book} {result.chapter}:{result.verse}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{highlightText(result.text, searchQuery.trim().toLowerCase() === 'god' ? 'eloah' : searchQuery)}"</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No results found for "{searchQuery}".</p>
          )}
        </div>
      )}

      {/* Main Content: Chapter Navigation & Text */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevChapter} disabled={isFirstChapterOfAll} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 text-center">{selectedBook} {selectedChapter + 1}</h2>
        <button onClick={handleNextChapter} disabled={isLastChapterOfAll} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
      </div>

       <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Audio Controls */}
            <div className="flex items-center gap-2">
                <button onClick={handleToggleReading} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${isReading ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`} aria-label={isReading ? 'Stop Reading' : 'Read Chapter Aloud'}>
                    {isReading ? <StopCircleIcon className="w-5 h-5"/> : <SpeakerWaveIcon className="w-5 h-5"/>}
                    <span>{isReading ? 'Stop' : 'Read Aloud'}</span>
                </button>
                 <div className="relative" ref={voiceSelectorRef}>
                    <button onClick={() => setIsVoiceSelectorOpen(prev => !prev)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        <span>Voice: {selectedVoice?.name.split(' ')[0] || 'Default'}</span>
                        <ChevronUpDownIcon className="w-4 h-4" />
                    </button>
                    {isVoiceSelectorOpen && (
                        <div className="absolute bottom-full mb-2 w-56 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg z-20">
                            {availableVoices.filter(v => v.lang.startsWith('en')).map(voice => (
                                <button key={voice.voiceURI} onClick={() => { setSelectedVoiceURI(voice.voiceURI); setIsVoiceSelectorOpen(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                    {voice.name} ({voice.lang})
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                 <div className="relative" ref={speedSelectorRef}>
                    <button onClick={() => setIsSpeedSelectorOpen(prev => !prev)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        <span>Speed: {playbackRate}x</span>
                        <ChevronUpDownIcon className="w-4 h-4" />
                    </button>
                    {isSpeedSelectorOpen && (
                        <div className="absolute bottom-full mb-2 w-32 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg z-20">
                            {PLAYBACK_RATES.map(rate => (
                                <button key={rate.value} onClick={() => { setPlaybackRate(rate.value); setIsSpeedSelectorOpen(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                    {rate.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Font Controls */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <button onClick={handleDecreaseFontSize} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50" disabled={fontSize <= MIN_FONT_SIZE} aria-label="Decrease font size"><TextSizeDecreaseIcon className="w-5 h-5"/></button>
                    <span className="text-sm w-10 text-center">{fontSize}%</span>
                    <button onClick={handleIncreaseFontSize} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50" disabled={fontSize >= MAX_FONT_SIZE} aria-label="Increase font size"><TextSizeIncreaseIcon className="w-5 h-5"/></button>
                </div>
            </div>
        </div>

        <div className="text-gray-800 dark:text-gray-200" style={{ fontSize: `${fontSize}%`, lineHeight: 1.8 }}>
          {chapterContent.map((verse, verseIndex) => (
            <p key={verseIndex} id={`verse-${verseIndex + 1}`} className={`mb-1 text-justify pl-8 -indent-8 transition-colors duration-300 rounded-md ${currentlyReadingVerse === verseIndex + 1 ? 'bg-primary-400/20 px-2 py-1' : 'py-1'}`}>
              <sup className="text-xs text-primary-500 dark:text-primary-300 font-semibold align-super mr-2">{verseIndex + 1}</sup>
              {verse.map((part, partIndex) => (
                <React.Fragment key={partIndex}>
                  {part.strongs ? (
                    <button 
                      onMouseEnter={(e) => handleWordMouseEnter(e, part.strongs!)}
                      onMouseLeave={handleWordMouseLeave}
                      onClick={() => onNavigateToLexicon(part.strongs!)}
                      className="text-primary-500 dark:text-primary-300 hover:underline focus:outline-none focus:ring-1 focus:ring-primary-400 rounded-sm"
                    >{part.text.trim()}</button>
                  ) : (
                    <span>{part.text.trim()}</span>
                  )}
                  {' '}
                </React.Fragment>
              ))}
               <button onClick={() => handleReadFromVerse(verseIndex)} className="ml-2 opacity-20 hover:opacity-100 focus:opacity-100 transition-opacity" aria-label={`Read from verse ${verseIndex + 1}`}>
                    <PlayCircleIcon className="w-5 h-5 inline-block text-primary-400" />
                </button>
            </p>
          ))}
        </div>

      {chapterContent.length > 0 && (
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handlePrevChapter} disabled={isFirstChapterOfAll} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <BackIcon className="w-4 h-4" />
                <span>Previous Chapter</span>
            </button>
            <button onClick={handleNextChapter} disabled={isLastChapterOfAll} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <span>Next Chapter</span>
                <BackIcon className="w-4 h-4 transform rotate-180" />
            </button>
        </div>
      )}

       {strongsPopover && (
        <div
          ref={popoverRef}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 w-full max-w-sm border border-gray-200 dark:border-gray-700 z-50 transition-opacity"
          style={popoverLayout ? popoverLayout.style : { position: 'fixed', opacity: 0, pointerEvents: 'none' }}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
        >
          <div
            className={`absolute w-0 h-0 
              border-l-8 border-l-transparent 
              border-r-8 border-r-transparent 
              ${!popoverLayout?.isBelow 
                  ? 'top-full border-t-8 border-t-white dark:border-t-gray-900' // Arrow on bottom pointing down
                  : 'bottom-full border-b-8 border-b-white dark:border-b-gray-900' // Arrow on top pointing up
              }`}
            style={{
              left: `var(--arrow-left)`,
              transform: 'translateX(-50%)',
            }}
          />
          <h3 className="text-md font-bold text-primary-400 dark:text-primary-300">{strongsPopover.content.hebrew} ({strongsPopover.content.transliteration})</h3>
          <p className="text-sm italic text-gray-500 dark:text-gray-400 mb-2">{strongsPopover.content.pronunciation}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{strongsPopover.content.definition}</p>
          <p className="text-xs text-blue-500 mt-2">Click to see full lexicon entry.</p>
        </div>
      )}
    </div>
  );
};

export default Bible;
