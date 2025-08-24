
import React, { useState, useEffect, useRef } from 'react';
import { useScripture } from '../context/ScriptureContext';
import { getVerse, parseReference } from '../utils/scripture';
import type { BibleVerse } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import XIcon from './icons/XIcon';

const ScripturePopover: React.FC = () => {
    const { popoverState, keepScriptureVisible, hideScripture, hideScriptureImmediately } = useScripture();
    const { reference, targetRect } = popoverState;
    const popoverRef = useRef<HTMLDivElement>(null);

    const [verseData, setVerseData] = useState<BibleVerse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({ opacity: 0, pointerEvents: 'none' });

    useEffect(() => {
        if (!reference) {
            setVerseData(null);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        const parsedRef = parseReference(reference);
        if (!parsedRef) {
            setError(`Invalid reference: ${reference}`);
            setIsLoading(false);
            return;
        }

        const data = getVerse(parsedRef);
        if (data) {
            setVerseData(data);
        } else {
            setError(`Could not find scripture for ${reference}.`);
        }
        setIsLoading(false);

    }, [reference]);
    
    useEffect(() => {
        if (targetRect && popoverRef.current) {
            const popoverRect = popoverRef.current.getBoundingClientRect();
            const PADDING = 10;
            const clientWidth = document.documentElement.clientWidth;
            const clientHeight = document.documentElement.clientHeight;

            let top = targetRect.bottom + PADDING;
            if (top + popoverRect.height > clientHeight - PADDING) {
                top = targetRect.top - popoverRect.height - PADDING;
            }
            
            let left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
            if (left < PADDING) left = PADDING;
            if (left + popoverRect.width > clientWidth - PADDING) left = clientWidth - popoverRect.width - PADDING;

            setPositionStyle({
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                opacity: 1,
                transition: 'opacity 0.2s',
            });
        } else {
            setPositionStyle({ opacity: 0, pointerEvents: 'none' });
        }
    }, [targetRect, isLoading, verseData, error]);

    if (!reference) return null;

    const verseText = verseData ? verseData.map(part => part.text).join('') : '';

    return (
        <div
            ref={popoverRef}
            style={positionStyle}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-4 w-full max-w-sm border border-gray-200 dark:border-gray-700 z-[100] relative"
            onMouseEnter={keepScriptureVisible}
            onMouseLeave={hideScripture}
        >
            <button 
                onClick={hideScriptureImmediately}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close scripture preview"
            >
                <XIcon className="w-4 h-4" />
            </button>
            <h3 className="text-md font-bold text-primary-400 dark:text-primary-300 mb-2 pr-6">{reference}</h3>
            {isLoading && <div className="flex items-center gap-2"><SpinnerIcon className="w-4 h-4 animate-spin" /><span>Loading...</span></div>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {verseData && <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{verseText}"</p>}
        </div>
    );
};

export default ScripturePopover;
