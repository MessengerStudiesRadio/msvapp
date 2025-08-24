
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LEXICON_DATA, LEXICON_MAP } from '../data/lexicon';
import { ANCIENT_HEBREW_MAP } from '../data/ancientHebrew';
import { HEBREW_DIACRITICS_MAP } from '../data/hebrewDiacritics';
import type { LexiconEntry, AncientHebrewLetter, HebrewDiacritic, ConcordanceMap, BibleVerse } from '../types';
import SearchIcon from '../components/icons/SearchIcon';
import XIcon from '../components/icons/XIcon';
import BackIcon from '../components/icons/BackIcon';
import VolumeUpIcon from '../components/icons/VolumeUpIcon';
import { BOOKS, BIBLE_DATA } from '../data/bible';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import { useScripture } from '../context/ScriptureContext';
import LinkIcon from '../components/icons/LinkIcon';

interface LexiconProps {
    initialEntryStrongs?: string | null;
    onNavigateToAncientLexicon: (letter: string) => void;
    onNavigateToBible: (book: string, chapter: number, verse: number) => void;
}

const parseHebrewWord = (hebrewWord: string): { base: string; diacritics: string; combined: string }[] => {
    const components: { base: string; diacritics: string; combined: string }[] = [];
    let i = 0;
    const hebrewBaseLetters = "אבגדהוזחטיכךלמםנןסעפףצץקרשת";
    
    while (i < hebrewWord.length) {
        let baseChar = hebrewWord[i];
        
        if (hebrewBaseLetters.indexOf(baseChar) === -1) {
            i++;
            continue;
        }

        let diacritics = '';
        let currentIndex = i;
        i++;
        
        while (i < hebrewWord.length && hebrewWord.charCodeAt(i) >= 0x0591 && hebrewWord.charCodeAt(i) <= 0x05C7) {
            diacritics += hebrewWord[i];
            i++;
        }
        
        components.push({ base: baseChar, diacritics: diacritics, combined: hebrewWord.substring(currentIndex, i) });
    }
    return components;
};


const Lexicon: React.FC<LexiconProps> = ({ initialEntryStrongs, onNavigateToAncientLexicon, onNavigateToBible }) => {
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [selectedEntry, setSelectedEntry] = useState<LexiconEntry | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const listRef = useRef<HTMLUListElement>(null);

    const [concordanceData, setConcordanceData] = useState<ConcordanceMap | null>(null);

    const [letterInfoPopover, setLetterInfoPopover] = useState<{ baseLetter: AncientHebrewLetter | null; diacritics: HebrewDiacritic[]; targetRect: DOMRect; } | null>(null);
    const [popoverLayout, setPopoverLayout] = useState<{ style: React.CSSProperties; isBelow: boolean } | null>(null);
    const letterInfoPopoverHideTimeout = useRef<number | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    
    const { showScripture, hideScripture } = useScripture();

    useEffect(() => {
        const generateConcordance = () => {
            const data: ConcordanceMap = {};
            for (const bookName of BOOKS) {
                const bookData = BIBLE_DATA[bookName];
                bookData.forEach((chapterContent, chapterIndex) => {
                    chapterContent.forEach((verseParts, verseIndex) => {
                        const uniqueStrongsInVerse = new Set<string>();
                        verseParts.forEach(part => {
                            if (part.strongs) {
                                uniqueStrongsInVerse.add(part.strongs);
                            }
                        });

                        uniqueStrongsInVerse.forEach(strongs => {
                            if (!data[strongs]) {
                                data[strongs] = [];
                            }
                            data[strongs].push({
                                book: bookName,
                                chapter: chapterIndex,
                                verse: verseIndex,
                                verseData: verseParts,
                            });
                        });
                    });
                });
            }
            setConcordanceData(data);
        };
        generateConcordance();
    }, []);

    useEffect(() => {
        if (initialEntryStrongs) {
            const entry = LEXICON_DATA.find(e => e.strongs === initialEntryStrongs);
            if (entry) {
                setSelectedEntry(entry);
                setView('detail');
            }
        }
    }, [initialEntryStrongs]);
    
    useEffect(() => {
        if (letterInfoPopover && popoverRef.current) {
            const { targetRect } = letterInfoPopover;
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
    }, [letterInfoPopover]);

    const playPronunciation = (e: React.MouseEvent, entry: LexiconEntry) => {
        e.stopPropagation(); // Prevent navigation when clicking the button
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any currently playing speech
            const textToSpeak = entry.pronunciation.replace(/['`]/g, '');
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'en-US'; 
            try {
                const storedRate = localStorage.getItem('msr_bible_playback_rate');
                utterance.rate = storedRate ? Number(storedRate) : 1;
            } catch {
                utterance.rate = 1;
            }
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn("Speech Synthesis not supported in this browser.");
            alert("Sorry, your browser doesn't support audio playback for this feature.");
        }
    };

    const filteredLexicon = useMemo(() => {
        if (!searchQuery.trim()) return LEXICON_DATA;

        const query = searchQuery.toLowerCase();
        return LEXICON_DATA.filter(entry => 
            entry.strongs.toLowerCase().includes(query) ||
            entry.hebrew.toLowerCase().includes(query) ||
            entry.transliteration.toLowerCase().includes(query) ||
            entry.definition.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const handleSelectEntry = (entry: LexiconEntry) => {
        setSelectedEntry(entry);
        setView('detail');
    };

    const handleNavigateToEntry = (strongs: string) => {
        const entry = LEXICON_DATA.find(e => e.strongs === strongs);
        if (entry) {
            handleSelectEntry(entry);
        } else {
            console.warn(`Could not find lexicon entry for ${strongs}`);
        }
    };
    
    const handleLetterMouseEnter = (event: React.MouseEvent, baseLetter: string, diacritics: string) => {
        if (letterInfoPopoverHideTimeout.current) clearTimeout(letterInfoPopoverHideTimeout.current);

        const finalToRegular: Record<string, string> = {
          'ך': 'כ',
          'ם': 'מ',
          'ן': 'נ',
          'ף': 'פ',
          'ץ': 'צ'
        };
        const regularLetter = finalToRegular[baseLetter] || baseLetter;
        const baseLetterEntry = ANCIENT_HEBREW_MAP[regularLetter] || null;
        
        const diacriticEntries = diacritics.split('').map(d => HEBREW_DIACRITICS_MAP[d]).filter((item): item is HebrewDiacritic => !!item);

        if (!baseLetterEntry && diacriticEntries.length === 0) return;

        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setLetterInfoPopover({
            baseLetter: baseLetterEntry,
            diacritics: diacriticEntries,
            targetRect: rect,
        });
    };

    const handleLetterMouseLeave = () => {
        letterInfoPopoverHideTimeout.current = window.setTimeout(() => {
            setLetterInfoPopover(null);
        }, 200);
    };
    
    const handlePopoverMouseEnter = () => {
        if (letterInfoPopoverHideTimeout.current) clearTimeout(letterInfoPopoverHideTimeout.current);
    }

    const handlePopoverMouseLeave = () => {
        setLetterInfoPopover(null);
    }

    const renderInteractiveVerse = (verseData: BibleVerse, strongsToHighlight: string) => (
        <>
            {verseData.map((part, index) => {
                if (!part.strongs) {
                    return <span key={index}>{part.text}</span>;
                }

                const isHighlighted = part.strongs === strongsToHighlight;
                const lexiconEntry = LEXICON_MAP[part.strongs];

                return (
                    <span key={index}>
                        <strong className={isHighlighted ? 'text-primary-500 dark:text-primary-300' : ''}>{part.text}</strong>
                        {lexiconEntry && (
                            <span className="text-gray-600 dark:text-gray-400 font-normal">
                                {' ('}
                                {lexiconEntry.strongs.startsWith('G') ? (
                                    <span className="inline-flex">{lexiconEntry.hebrew}</span>
                                ) : (
                                    <span className="inline-flex" dir="rtl">
                                        {parseHebrewWord(lexiconEntry.hebrew).map((group, groupIndex) => (
                                            <button
                                                key={groupIndex}
                                                onClick={(e) => { e.stopPropagation(); onNavigateToAncientLexicon(group.base); }}
                                                onMouseEnter={(e) => handleLetterMouseEnter(e, group.base, group.diacritics)}
                                                onMouseLeave={handleLetterMouseLeave}
                                                className="hover:text-primary-500 dark:hover:text-primary-300 focus:outline-none transition-colors"
                                            >
                                                {group.combined}
                                            </button>
                                        ))}
                                    </span>
                                )}
                                {')'}
                            </span>
                        )}
                    </span>
                );
            })}
        </>
    );

    const DetailItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
        <div>
            <p className="text-sm font-semibold text-primary-400 dark:text-primary-300">{label}</p>
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">{value}</p>
        </div>
    );

    const renderWordWithLinks = (word: string, strongs: string) => {
        if (strongs.startsWith('G')) {
            return <div className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">{word}</div>
        }
        const characterGroups = parseHebrewWord(word);
        return (
            <div className="flex flex-wrap items-center" dir="rtl">
                {characterGroups.map((group, index) => (
                    <button 
                        key={index} 
                        onClick={() => onNavigateToAncientLexicon(group.base)}
                        onMouseEnter={(e) => handleLetterMouseEnter(e, group.base, group.diacritics)}
                        onMouseLeave={handleLetterMouseLeave}
                        className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 hover:text-primary-500 dark:hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded-md transition-colors px-0.5"
                        title={`View ancient meaning of ${group.base}`}
                    >
                        {group.combined}
                    </button>
                ))}
            </div>
        );
    };

    const renderDetailView = () => {
        if (!selectedEntry) return null;
        const occurrences = concordanceData ? (concordanceData[selectedEntry.strongs] || []) : [];

        return (
            <div className="max-w-4xl mx-auto">
                 <div className="mb-6 relative group">
                    <button 
                        onClick={() => setView('list')} 
                        className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-primary-400 transition-colors duration-200"
                    >
                        <BackIcon className="w-6 h-6" />
                        <span>Back to Lexicon List</span>
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                    <div className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                        {renderWordWithLinks(selectedEntry.hebrew, selectedEntry.strongs)}
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-lg text-primary-500 dark:text-primary-300 font-semibold">{selectedEntry.transliteration}</p>
                            <button 
                                onClick={(e) => playPronunciation(e, selectedEntry)} 
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
                                aria-label={`Play pronunciation for ${selectedEntry.transliteration}`}
                            >
                                <VolumeUpIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedEntry.pronunciation}</p>
                    </div>
                    <div className="space-y-4">
                        <DetailItem label="Strong's Number" value={selectedEntry.strongs} />
                        <DetailItem label="Part of Speech" value={selectedEntry.partOfSpeech} />
                        <div>
                            <p className="text-sm font-semibold text-primary-400 dark:text-primary-300">Definition</p>
                            <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedEntry.definition}</p>
                        </div>
                    </div>
                </div>

                {selectedEntry.septuagint && (
                    <div className="mt-8 bg-white dark:bg-gray-800/50 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                            <LinkIcon className="w-5 h-5 text-primary-400" />
                            Septuagint (LXX) Connection
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            In the Septuagint (the Greek translation of the Hebrew Scriptures), this word is commonly translated using the Greek word:
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                            <button 
                                onClick={() => handleNavigateToEntry(selectedEntry.septuagint!.strongs)}
                                className="w-full text-left group"
                            >
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary-500 dark:group-hover:text-primary-300 transition-colors">
                                    {selectedEntry.septuagint.greek}
                                </p>
                                <p className="text-lg text-primary-500 dark:text-primary-300 font-semibold group-hover:underline">
                                    {selectedEntry.septuagint.transliteration} ({selectedEntry.septuagint.strongs})
                                </p>
                                <p className="text-sm text-blue-500 mt-2">Click to view the Greek entry and New Testament occurrences.</p>
                            </button>
                        </div>
                    </div>
                )}
                
                {selectedEntry.hebrew_origins && (
                    <div className="mt-8 bg-white dark:bg-gray-800/50 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                            <LinkIcon className="w-5 h-5 text-primary-400 transform -scale-x-100" />
                            Hebrew Origins (via Septuagint)
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            This Greek word was commonly used in the Septuagint to translate the following Hebrew word(s):
                        </p>
                        <div className="space-y-4">
                            {selectedEntry.hebrew_origins.map(origin => (
                                <div key={origin.strongs} className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                                    <button 
                                        onClick={() => handleNavigateToEntry(origin.strongs)}
                                        className="w-full text-left group"
                                    >
                                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary-500 dark:group-hover:text-primary-300 transition-colors" dir="rtl">
                                            {origin.hebrew}
                                        </p>
                                        <p className="text-lg text-primary-500 dark:text-primary-300 font-semibold group-hover:underline">
                                            {origin.transliteration} ({origin.strongs})
                                        </p>
                                        <p className="text-sm text-blue-500 mt-2">Click to view the Hebrew entry and Old Testament occurrences.</p>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Concordance ({!concordanceData ? '...' : occurrences.length} occurrences)
                    </h3>
                     {!concordanceData ? (
                        <div className="flex items-center justify-center p-4"><SpinnerIcon className="w-8 h-8 animate-spin text-primary-400" /></div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                            <ul className="divide-y divide-gray-200/50 dark:divide-gray-700/50 max-h-[60vh] overflow-y-auto">
                                {occurrences.length > 0 ? occurrences.map((occ, index) => (
                                    <li key={index}>
                                        <button 
                                            onClick={() => onNavigateToBible(occ.book, occ.chapter, occ.verse + 1)}
                                            className="p-4 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <p className="font-bold text-primary-500 dark:text-primary-300">{occ.book} {occ.chapter + 1}:{occ.verse + 1}</p>
                                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed italic">
                                                "{renderInteractiveVerse(occ.verseData, selectedEntry.strongs)}"
                                            </p>
                                        </button>
                                    </li>
                                )) : (
                                    <p className="p-4 text-gray-500 dark:text-gray-400">No occurrences found in the available scriptures.</p>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    
    const handleAlphabetJump = (letter: string) => {
        const list = listRef.current;
        if (!list) return;

        const firstMatchIndex = LEXICON_DATA.findIndex(entry => 
            entry.transliteration.toLowerCase().startsWith(letter.toLowerCase())
        );

        if (firstMatchIndex > -1) {
            const itemElement = list.children[firstMatchIndex] as HTMLElement;
            if (itemElement) {
                itemElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setSearchQuery('');
            }
        } else {
            alert(`No entries found starting with the letter "${letter}".`);
        }
    };


    const renderListView = () => (
        <div className="max-w-4xl mx-auto">
            <header className="mb-6 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-primary-400 mb-2">Hebrew & Greek Lexicon</h1>
                <p className="text-md text-gray-600 dark:text-gray-400">Search for a word to see its definition and all occurrences in scripture.</p>
            </header>
            <div className="relative mb-4">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                </span>
                <input
                    type="text"
                    placeholder="Search Strong's #, Hebrew, Greek, or English (e.g., H430, G2316, Elohim, Theos, peace)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3 group" aria-label="Clear search">
                        <XIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                    </button>
                )}
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 mb-4 px-2">
                {alphabet.map(letter => (
                    <button 
                        key={letter} 
                        onClick={() => handleAlphabetJump(letter)} 
                        className="w-8 h-8 flex items-center justify-center text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-primary-400 hover:text-white dark:hover:bg-primary-500 dark:hover:text-gray-900 transition-colors"
                    >
                        {letter}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <ul className="h-[60vh] overflow-y-auto" ref={listRef}>
                    {!concordanceData && (
                         <div className="flex items-center justify-center h-full text-gray-500"><SpinnerIcon className="w-6 h-6 animate-spin mr-2"/> Loading Concordance...</div>
                    )}
                    {concordanceData && filteredLexicon.length > 0 ? filteredLexicon.map(entry => (
                        <li key={entry.strongs} id={`lexicon-${entry.strongs}`}>
                            <button onClick={() => handleSelectEntry(entry)} className="w-full flex items-center justify-between p-3 border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200 group text-left">
                                <div className="flex-grow min-w-0">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-400 transition-colors truncate">
                                        {entry.transliteration} <span className="text-gray-500 dark:text-gray-400 font-normal">({entry.strongs})</span>
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate" dir={entry.strongs.startsWith('H') ? "rtl" : "ltr"}>{entry.hebrew}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                                        {concordanceData && concordanceData[entry.strongs] ? `${concordanceData[entry.strongs].length}x` : '0x'}
                                    </div>
                                    <div className="relative group/item ml-2">
                                        <button 
                                            onClick={(e) => playPronunciation(e, entry)} 
                                            className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            aria-label={`Play pronunciation for ${entry.transliteration}`}
                                        >
                                            <VolumeUpIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </button>
                        </li>
                    )) : concordanceData && (
                       <p className="text-center text-gray-500 dark:text-gray-400 p-8">No results found for "{searchQuery}".</p>
                    )}
                </ul>
            </div>
        </div>
    );

    return (
        <div>
            {view === 'list' ? renderListView() : renderDetailView()}

            {letterInfoPopover && (
                <div 
                    ref={popoverRef}
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 w-full max-w-sm border border-gray-200 dark:border-gray-700 z-[70] transition-opacity"
                    style={popoverLayout ? popoverLayout.style : { position: 'fixed', opacity: 0 }}
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
                    
                    {letterInfoPopover.baseLetter && (
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-md font-semibold text-primary-400 dark:text-primary-300">
                                    {letterInfoPopover.baseLetter.name} ({letterInfoPopover.baseLetter.letter})
                                </h3>
                                <p className="text-sm italic text-gray-500 dark:text-gray-400">{letterInfoPopover.baseLetter.pictographDescription}</p>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Meaning:</strong> {letterInfoPopover.baseLetter.meaning}
                            </p>
                        </div>
                    )}
                    
                    {letterInfoPopover.baseLetter && letterInfoPopover.diacritics.length > 0 && (
                         <hr className="my-2 border-gray-300 dark:border-gray-600" />
                    )}

                    {letterInfoPopover.diacritics.length > 0 && (
                        <div className="space-y-2">
                            {letterInfoPopover.diacritics.map((diacritic, index) => (
                                <div key={index}>
                                    <h4 className="text-sm font-semibold text-primary-400 dark:text-primary-300">
                                        {diacritic.name} ({diacritic.symbol})
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        <strong>Pronunciation:</strong> "{diacritic.pronunciation}" <br/>
                                        {diacritic.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Lexicon;
