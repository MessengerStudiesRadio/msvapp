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
                                scripture_references: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Optional list of supporting scripture references." },
                                estimated_time: { type: Type.NUMBER, description: "Estimated time in minutes for this section." }
                            },
                            required: ["title", "points", "estimated_time"]
                        }
                    }
                },
                required: ["title", "key_scriptures", "hebrew_word_studies", "sections"]
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { systemInstruction, responseMimeType: "application/json", responseSchema, },
            });

            const parsedOutline: StudyOutline = JSON.parse(response.text);
            const savedStudy = await onSaveStudy(parsedOutline);
            setActiveStudy(savedStudy);

        } catch (err) {
            console.error("Error generating study outline:", err);
            setError("An error occurred while generating the outline. Please check the console for details and try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to permanently delete this study outline?")) {
            if (activeStudy?.id === id) {
                setActiveStudy(null);
            }
            onDeleteStudy(id);
        }
    };

    const renderInteractiveText = (text: string) => {
        const parts = text.split(/(<scripture>.*?<\/scripture>|<hebrew>.*?<\/hebrew>|<hebrew_translit.*?>.*?<\/hebrew_translit>)/gi).filter(part => part);
    
        return parts.map((part, index) => {
            const scriptureMatch = part.match(/<scripture>(.*?)<\/scripture>/i);
            if (scriptureMatch) {
                const ref = scriptureMatch[1];
                const parsedRef = parseReference(ref);
                if (parsedRef) {
                    const book = parsedRef.book;
                    const chapter = parsedRef.chapter - 1;
                    const verse = parsedRef.verse;
                    return <button 
                                key={index} 
                                onClick={() => {
                                    onNavigateToBible(book, chapter, verse);
                                    hideScriptureImmediately();
                                }} 
                                className="text-primary-500 dark:text-primary-300 hover:underline"
                                onMouseEnter={(e) => showScripture(ref, e.currentTarget)}
                                onMouseLeave={hideScripture}
                           >{ref}</button>;
                }
                return <span key={index}>{ref}</span>;
            }
    
            const hebrewMatch = part.match(/<hebrew>(.*?)<\/hebrew>/i);
            if (hebrewMatch) {
                const hebrewWord = hebrewMatch[1];
                const characterGroups = parseHebrewWord(hebrewWord);
                return <span key={index} className="inline-flex" dir="rtl">{characterGroups.map((group, gIndex) => (
                    <button key={gIndex} onClick={() => onNavigateToAncientLexicon(group.base)} onMouseEnter={(e) => handleLetterMouseEnter(e, group.base, group.diacritics)} onMouseLeave={handleLetterMouseLeave} className="hover:text-primary-500 dark:hover:text-primary-300 focus:outline-none transition-colors">{group.combined}</button>
                ))}</span>;
            }
            
            const translitMatch = part.match(/<hebrew_translit strongs="(.+?)">(.*?)<\/hebrew_translit>/i);
            if (translitMatch) {
                const strongs = translitMatch[1];
                const word = translitMatch[2];
                return (
                    <button 
                        key={index} 
                        onClick={() => onNavigateToLexicon(strongs)} 
                        className="text-primary-500 dark:text-primary-300 hover:underline"
                    >
                        {word}
                    </button>
                );
            }
    
            return <span key={index}>{part}</span>;
        });
    };

    const generatePlainTextStudy = (outline: StudyOutline): string => {
        const tagStripper = /<scripture>|<\/scripture>|<hebrew>|<\/hebrew>|<hebrew_translit.*?>|<\/hebrew_translit>/gi;
        let text = `${outline.title}\n\n`;
        
        const cleanKeyScriptures = outline.key_scriptures.map(s => s.replace(tagStripper, ''));
        text += `Key Scriptures: ${cleanKeyScriptures.join('; ')}\n\n`;

        if (outline.hebrew_word_studies && outline.hebrew_word_studies.length > 0) {
            text += 'Hebrew Word Studies:\n';
            outline.hebrew_word_studies.forEach(study => {
                text += `- ${study.hebrew_word} (${study.transliteration}, ${study.strongs_number}): ${study.meaning}\n`;
            });
            text += '\n';
        }

        text += '---\n\n';
        outline.sections.forEach(section => {
            text += `${section.title} (${section.estimated_time} min)\n`;
            section.points.forEach(point => {
                text += `- ${point.replace(tagStripper, '')}\n`;
            });
            if (section.scripture_references && section.scripture_references.length > 0) {
                const cleanReferences = section.scripture_references.map(r => r.replace(tagStripper, ''));
                text += `  References: ${cleanReferences.join(', ')}\n`;
            }
            text += '\n';
        });
        text += '---\nGenerated with LA\'SHIR AOD (Agent of Discovery) Study Buddy\nwww.MessengerStudies.com';
        return text;
    };

    const handleCopy = () => {
        if (!activeStudy) return;
        const textToCopy = generatePlainTextStudy(activeStudy);
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy to Clipboard'), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setCopyStatus('Copy Failed');
            setTimeout(() => setCopyStatus('Copy to Clipboard'), 2000);
        });
    };

    const handleShare = async () => {
        if (!activeStudy || !navigator.share) return;
        const shareText = generatePlainTextStudy(activeStudy);
        try {
            await navigator.share({
                title: activeStudy.title,
                text: shareText,
            });
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };
    
    const handleSummarize = async () => {
        if (!activeStudy) return;

        setIsSummarizing(true);
        setError(null);
        setSummary(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const plainTextOutline = generatePlainTextStudy(activeStudy);

            const systemInstruction = "You are a helpful assistant that summarizes study outlines. Your summaries should be clear, concise, and capture the main points and flow of the study. The summary should be written in a way that can be used as a short introduction or abstract for the study. Maintain the use of 'Eloah' and 'Yahshua' as used in the original outline.";
            
            const prompt = `Please summarize the following study outline:\n\n---\n\n${plainTextOutline}\n\n---`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { systemInstruction },
            });

            setSummary(response.text);
            setIsSummaryModalOpen(true);

        } catch (err) {
            console.error("Error generating summary:", err);
            setError("An error occurred while generating the summary. Please try again.");
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
             <header className="mb-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-primary-400 mb-2">AOD (Agent of Discovery) Study Buddy</h1>
                <p className="text-md text-gray-600 dark:text-gray-400">Enter a topic to generate a structured study outline, or select a saved study to review.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Generator Form */}
                    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Create New Study</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="study-topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Study Topic *</label>
                                <input id="study-topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., The Parable of the Sower" className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label htmlFor="study-audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience (Optional)</label>
                                <input id="study-audience" type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g., Youth group, new believers" className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label htmlFor="study-length" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Desired Length: <span className="font-bold text-primary-500 dark:text-primary-300">{length} minutes</span></label>
                                <input id="study-length" type="range" min="10" max="60" step="5" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer mt-2" />
                            </div>
                            <div className="pt-2 text-center">
                                <button onClick={handleGenerate} disabled={isLoading} className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-primary-500 text-white dark:text-gray-900 font-bold rounded-full hover:bg-primary-400 transition-colors shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isLoading ? ( <> <SpinnerIcon className="w-5 h-5 animate-spin" /> Generating... </> ) : ( <> <SparklesIcon className="w-5 h-5" /> Generate Outline </> )}
                                </button>
                            </div>
                        </div>
                    </div>
                     {/* Saved Outlines List */}
                    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 p-4 border-b border-gray-200 dark:border-gray-700">Saved Outlines</h2>
                        <div className="max-h-[40vh] overflow-y-auto">
                             {savedOutlines.length === 0 ? (
                                <p className="p-4 text-center text-gray-500 dark:text-gray-400">No saved studies yet.</p>
                            ) : (
                                <ul>
                                    {savedOutlines.map(study => (
                                        <li key={study.id} className="flex items-center border-b border-gray-200/50 dark:border-gray-700/50 last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-700/50 group">
                                            <button onClick={() => setActiveStudy(study)} className="flex-grow text-left p-3 min-w-0">
                                                <p className={`font-semibold truncate ${activeStudy?.id === study.id ? 'text-primary-500 dark:text-primary-300' : 'text-gray-800 dark:text-gray-200'}`}>{study.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(study.dateCreated).toLocaleDateString()}</p>
                                            </button>
                                            <button onClick={() => handleDelete(study.id)} className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-gray-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete study">
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2">
                    {isLoading && <div className="flex justify-center items-center h-full"><div className="text-center p-8 bg-white dark:bg-gray-800/50 rounded-lg shadow-xl"><SpinnerIcon className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-4" /><p className="text-lg text-gray-600 dark:text-gray-300">Generating your study...</p></div></div>}
                    {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p className="font-bold">Error</p><p>{error}</p></div>}
                    
                    {activeStudy && !isLoading && (
                         <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{activeStudy.title}</h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button 
                                        onClick={handleSummarize}
                                        disabled={isSummarizing}
                                        className="inline-flex items-center justify-center gap-1.5 text-sm px-3 py-1.5 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-400 transition-colors disabled:bg-gray-400"
                                    >
                                        {isSummarizing ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <DocumentTextIcon className="w-4 h-4" />}
                                        {isSummarizing ? 'Summarizing...' : 'Summarize'}
                                    </button>
                                    <button onClick={handleCopy} className="text-sm px-3 py-1.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors">{copyStatus}</button>
                                    {typeof navigator.share !== 'undefined' && <button onClick={handleShare} className="text-sm px-3 py-1.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-400 transition-colors">Share</button>}
                                </div>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">Key Scriptures</h4>
                            <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">{activeStudy.key_scriptures.map((s, i) => {
                                const cleanScripture = s.replace(/<scripture>|<\/scripture>/gi, '');
                                const taggedScripture = `<scripture>${cleanScripture}</scripture>`;
                                return <span key={i}>{renderInteractiveText(taggedScripture)}{i < activeStudy.key_scriptures.length - 1 ? '; ' : ''}</span>
                            })}</p>
                            <hr className="my-6 border-gray-300 dark:border-gray-700" />

                            {activeStudy.hebrew_word_studies && activeStudy.hebrew_word_studies.length > 0 && (
                                <>
                                    <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">Hebrew Word Studies</h4>
                                    <div className="space-y-3">
                                        {activeStudy.hebrew_word_studies.map((study, index) => (
                                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex text-xl font-semibold" dir="rtl">
                                                        {parseHebrewWord(study.hebrew_word).map((group, gIndex) => (
                                                            <button key={gIndex} onClick={() => onNavigateToAncientLexicon(group.base)} onMouseEnter={(e) => handleLetterMouseEnter(e, group.base, group.diacritics)} onMouseLeave={handleLetterMouseLeave} className="hover:text-primary-500 dark:hover:text-primary-300 focus:outline-none transition-colors">{group.combined}</button>
                                                        ))}
                                                    </span>
                                                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{study.transliteration}</p>
                                                    <button onClick={() => onNavigateToLexicon(study.strongs_number)} className="text-sm text-blue-500 hover:underline">({study.strongs_number})</button>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 mt-1">{study.meaning}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <hr className="my-6 border-gray-300 dark:border-gray-700" />
                                </>
                            )}

                            {activeStudy.sections.map((section, index) => (
                                <div key={index}>
                                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">{section.title} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({section.estimated_time} min)</span></h3>
                                    <ul className="list-disc list-inside space-y-2 mb-4 pl-4 text-gray-700 dark:text-gray-300 leading-relaxed">{section.points.map((point, pIndex) => <li key={pIndex}>{renderInteractiveText(point)}</li>)}</ul>
                                    {section.scripture_references && section.scripture_references.length > 0 && <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 leading-relaxed"><strong>References:</strong> {section.scripture_references.map((s, i) => {
                                        const cleanScripture = s.replace(/<scripture>|<\/scripture>/gi, '');
                                        const taggedScripture = `<scripture>${cleanScripture}</scripture>`;
                                        return <span key={i}>{renderInteractiveText(taggedScripture)}{i < section.scripture_references!.length - 1 ? ', ' : ''}</span>
                                    })}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && !activeStudy && (
                        <div className="flex justify-center items-center h-full text-center p-8 bg-white dark:bg-gray-800/50 rounded-lg shadow-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                            <div>
                                <SparklesIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Study Details Appear Here</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Generate a new study or select a saved one to begin.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {letterInfoPopover && (
                <div ref={popoverRef} className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 w-full max-w-xs border border-gray-200 dark:border-gray-700 z-[70] transition-opacity" style={popoverLayout ? popoverLayout.style : { position: 'fixed', opacity: 0 }} onMouseEnter={handlePopoverMouseEnter} onMouseLeave={handlePopoverMouseLeave}>
                    <div className={`absolute w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent ${!popoverLayout?.isBelow ? 'top-full border-t-8 border-t-white dark:border-t-gray-900' : 'bottom-full border-b-8 border-b-white dark:border-b-gray-900'}`} style={{ left: `var(--arrow-left)`, transform: 'translateX(-50%)' }} />
                    {letterInfoPopover.baseLetter && (
                        <div>
                            <div className="flex justify-between items-start mb-2"><h3 className="text-md font-semibold text-primary-400 dark:text-primary-300">{letterInfoPopover.baseLetter.name} ({letterInfoPopover.baseLetter.letter})</h3><p className="text-sm italic text-gray-500 dark:text-gray-400">{letterInfoPopover.baseLetter.pictographDescription}</p></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Meaning:</strong> {letterInfoPopover.baseLetter.meaning}</p>
                        </div>
                    )}
                    {letterInfoPopover.baseLetter && letterInfoPopover.diacritics.length > 0 && <hr className="my-2 border-gray-300 dark:border-gray-600" />}
                    {letterInfoPopover.diacritics.length > 0 && <div className="space-y-2">{letterInfoPopover.diacritics.map((diacritic, index) => (<div key={index}><h4 className="text-sm font-semibold text-primary-400 dark:text-primary-300">{diacritic.name} ({diacritic.symbol})</h4><p className="text-xs text-gray-600 dark:text-gray-400"><strong>Pronunciation:</strong> "{diacritic.pronunciation}" <br/>{diacritic.description}</p></div>))}</div>}
                </div>
            )}

            {isSummaryModalOpen && summary && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setIsSummaryModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-gray-200 dark:border-gray-700 relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary-400 dark:text-primary-300">Study Summary</h3>
                            <button onClick={() => setIsSummaryModalOpen(false)} className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" aria-label="Close">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto pr-2">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{summary}</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(summary).then(() => {
                                        setSummaryCopyStatus('Copied!');
                                        setTimeout(() => setSummaryCopyStatus('Copy Summary'), 2000);
                                    });
                                }}
                                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors"
                            >
                                {summaryCopyStatus}
                            </button>
                            <button 
                                onClick={() => setIsSummaryModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyBuddy;