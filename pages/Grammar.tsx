

import React, { useState, useRef, useEffect } from 'react';
import { grammarRules } from '../data/grammarRules';
import { ANCIENT_HEBREW_MAP } from '../data/ancientHebrew';
import { HEBREW_DIACRITICS_MAP } from '../data/hebrewDiacritics';
import type { AncientHebrewLetter, HebrewDiacritic, HebrewExample } from '../types';

interface GrammarProps {
    onNavigateToAncientLexicon: (letter: string) => void;
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

const Grammar: React.FC<GrammarProps> = ({ onNavigateToAncientLexicon }) => {
    const [letterInfoPopover, setLetterInfoPopover] = useState<{ baseLetter: AncientHebrewLetter | null; diacritics: HebrewDiacritic[]; targetRect: DOMRect; } | null>(null);
    const [popoverLayout, setPopoverLayout] = useState<{ style: React.CSSProperties; isBelow: boolean } | null>(null);
    const letterInfoPopoverHideTimeout = useRef<number | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

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
        setLetterInfoPopover({ baseLetter: baseLetterEntry, diacritics: diacriticEntries, targetRect: rect });
    };

    const handleLetterMouseLeave = () => {
        letterInfoPopoverHideTimeout.current = window.setTimeout(() => setLetterInfoPopover(null), 200);
    };
    
    const handlePopoverMouseEnter = () => {
        if (letterInfoPopoverHideTimeout.current) clearTimeout(letterInfoPopoverHideTimeout.current);
    }

    const handlePopoverMouseLeave = () => {
        setLetterInfoPopover(null);
    }
    
    const renderHebrewWithLinks = (example: HebrewExample) => {
        const characterGroups = parseHebrewWord(example.hebrew);
        return (
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex" dir="rtl">
                    {characterGroups.map((group, index) => (
                        <button 
                            key={index} 
                            onClick={() => onNavigateToAncientLexicon(group.base)}
                            onMouseEnter={(e) => handleLetterMouseEnter(e, group.base, group.diacritics)}
                            onMouseLeave={handleLetterMouseLeave}
                            className="text-2xl text-gray-800 dark:text-gray-200 hover:text-primary-500 dark:hover:text-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-400 rounded-sm transition-colors"
                        >
                            {group.combined}
                        </button>
                    ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">- {example.meaning}</p>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
             <header className="mb-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-primary-400 mb-2">Ancient Hebrew Grammar</h1>
                <p className="text-md text-gray-600 dark:text-gray-400">Understanding the building blocks of the language.</p>
            </header>

            <div className="space-y-6">
                {grammarRules.map((rule, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800/50 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold text-primary-400 dark:text-primary-300 mb-3">{rule.title}</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{rule.explanation}</p>
                        <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                            {rule.examples.map((example, exIndex) => (
                                <div key={exIndex}>
                                    {renderHebrewWithLinks(example)}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

             {letterInfoPopover && (
                <div 
                    ref={popoverRef}
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 w-full max-w-xs border border-gray-200 dark:border-gray-700 z-50 transition-opacity"
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

export default Grammar;