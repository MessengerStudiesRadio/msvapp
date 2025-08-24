import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { StudyOutline, SavedStudyOutline, AncientHebrewLetter, HebrewDiacritic, HebrewWordStudy } from '../types';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import TrashIcon from '../components/icons/TrashIcon';
import XIcon from '../components/icons/XIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import { ANCIENT_HEBREW_MAP } from '../data/ancientHebrew';
import { HEBREW_DIACRITICS_MAP } from '../data/hebrewDiacritics';
import { useScripture } from '../context/ScriptureContext';
import { parseReference } from '../utils/scripture';

interface StudyBuddyProps {
    onNavigateToBible: (book: string, chapter: number, verse: number) => void;
    onNavigateToAncientLexicon: (letter: string) => void;
    onNavigateToLexicon: (strongs: string) => void;
    savedOutlines: SavedStudyOutline[];
    onSaveStudy: (outline: StudyOutline) => Promise<SavedStudyOutline>;
    onDeleteStudy: (id: string) => void;
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

const StudyBuddy: React.FC<StudyBuddyProps> = ({ onNavigateToBible, onNavigateToAncientLexicon, onNavigateToLexicon, savedOutlines, onSaveStudy, onDeleteStudy }) => {
    const [topic, setTopic] = useState('');
    const [length, setLength] = useState(30);
    const [audience, setAudience] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeStudy, setActiveStudy] = useState<SavedStudyOutline | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState('Copy to Clipboard');

    // --- SUMMARY STATE ---
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [summaryCopyStatus, setSummaryCopyStatus] = useState('Copy Summary');
    
    // --- POPOVER STATE & LOGIC ---
    const [letterInfoPopover, setLetterInfoPopover] = useState<{ baseLetter: AncientHebrewLetter | null; diacritics: HebrewDiacritic[]; targetRect: DOMRect; } | null>(null);
    const [popoverLayout, setPopoverLayout] = useState<{ style: React.CSSProperties; isBelow: boolean } | null>(null);
    const letterInfoPopoverHideTimeout = useRef<number | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const { showScripture, hideScripture, hideScriptureImmediately } = useScripture();

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
            if (top < PADDING) top = PADDING;

            let left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
            left = Math.max(PADDING, left);
            left = Math.min(left, clientWidth - popoverRect.width - PADDING);

            const arrowLeft = targetRect.left + targetRect.width / 2 - left;
            
            setPopoverLayout({
                style: { position: 'fixed', top: `${top}px`, left: `${left}px`, opacity: 1, '--arrow-left': `${arrowLeft}px` } as React.CSSProperties,
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
    const handleLetterMouseLeave = () => { letterInfoPopoverHideTimeout.current = window.setTimeout(() => setLetterInfoPopover(null), 200); };
    const handlePopoverMouseEnter = () => { if (letterInfoPopoverHideTimeout.current) clearTimeout(letterInfoPopoverHideTimeout.current); };
    const handlePopoverMouseLeave = () => { setLetterInfoPopover(null); };

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError("Please enter a study topic.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setActiveStudy(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const systemInstruction = `You are a helpful assistant for a student of the scriptures. Your task is to generate a detailed study outline. The outline should be theologically sound, well-structured, and practical. 
- Always use the name 'Eloah' instead of 'God'.
- Always use the name 'Yahshua' instead of 'Jesus'.
- Always use the name 'Master' instead of 'Lord'.
- When you include a scripture reference, wrap it in <scripture> tags. The text inside the tag must use the Hebrew book name, followed by the English name in parentheses. For example: <scripture>Yochanan (John) 3:16</scripture> or <scripture>Bereshit (Genesis) 1:1</scripture>. Here is a list of common book names: Bereshit (Genesis), Shemot (Exodus), Vayikra (Leviticus), Bamidbar (Numbers), Devarim (Deuteronomy), Yehoshua (Joshua), Tehillim (Psalms), Mishlei (Proverbs), Yeshayahu (Isaiah), Matityahu (Matthew), Yochanan (John), Romiyim (Romans), Ivrim (Hebrews), Hitgalut (Revelation).
- When you include a Hebrew word in its original script, wrap it in <hebrew> tags, for example: <hebrew>רוּחַ</hebrew>.
- When you include a transliterated Hebrew word from your "Hebrew Word Studies" section within the text, wrap it in <hebrew_translit> tags with its Strong's number. For example: ...true peace, <hebrew_translit strongs="H7965">shalom</hebrew_translit>, ...
- IMPORTANT: Do not place <hebrew> and <hebrew_translit> tags next to each other for the same word. Choose the tag that is most appropriate for the context. For example, instead of writing "<hebrew>שָׁלוֹם</hebrew> (<hebrew_translit strongs="H7965">shalom</hebrew_translit>)", write either "The word for peace is <hebrew>שָׁלוֹם</hebrew>" or "We seek true <hebrew_translit strongs="H7965">shalom</hebrew_translit>."
- All punctuation (commas, periods, parentheses, etc.) must be placed OUTSIDE of the custom tags. For example, write '(<hebrew>שָׁלוֹם</hebrew>),' not '<hebrew>(שָׁלוֹם,)</hebrew>'.
- CRITICAL: Ensure all custom tags like <scripture>, <hebrew>, and <hebrew_translit> are always well-formed and properly closed. Incomplete tags like "<hebrew_translit strongs=" are strictly forbidden. Always complete the tag, for example: <hebrew_translit strongs="H1234">word</hebrew_translit>.
- The outline must include a title, key scriptures, a list of relevant Hebrew word studies, and sections (Introduction, Main Points, Conclusion). Each section needs a title, talking points, an estimated time, and optional scripture references.
- The sum of section times should be close to the desired study length.
- The output must be a valid JSON object matching the provided schema.`;
            
            const prompt = `Generate a study outline with the following details:
            - Topic: "${topic}"
            - Desired Length: ${length} minutes
            - Target Audience: ${audience || 'a general audience'}`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A compelling title for the study." },
                    key_scriptures: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 primary scripture passages for the study." },
                    hebrew_word_studies: {
                        type: Type.ARRAY,
                        description: "A list of 2-4 relevant Hebrew words for study, related to the topic.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                hebrew_word: { type: Type.STRING, description: "The Hebrew word in its original script." },
                                transliteration: { type: Type.STRING, description: "The English transliteration of the Hebrew word." },
                                strongs_number: { type: Type.STRING, description: "The Strong's Concordance number for the word (e.g., 'H3068')." },
                                meaning: { type: Type.STRING, description: "A concise definition and relevance to the study topic." }
                            },
                            required: ["hebrew_word", "transliteration", "strongs_number", "meaning"]
                        }
                    },
                    sections: {
                        type: Type.ARRAY,
                        description: "The main sections of the study outline.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "The title of this section (e.g., 'Introduction')." },
                                points: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key talking points for this section. Can include <scripture> and <hebrew> tags." },
                                scripture_references: { type: Type.