
import React, { useState, useEffect } from 'react';
import { ANCIENT_HEBREW_DATA, ANCIENT_HEBREW_MAP } from '../data/ancientHebrew';
import type { AncientHebrewLetter } from '../types';
import BackIcon from '../components/icons/BackIcon';
import VolumeUpIcon from '../components/icons/VolumeUpIcon';
import * as Pictograms from '../components/pictograms';

interface AncientHebrewProps {
    initialLetter?: string | null;
}

const pictogramMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    'א': Pictograms.AlephPictogram,
    'ב': Pictograms.BetPictogram,
    'ג': Pictograms.GimelPictogram,
    'ד': Pictograms.DaletPictogram,
    'ה': Pictograms.HehPictogram,
    'ו': Pictograms.WawPictogram,
    'ז': Pictograms.ZayinPictogram,
    'ח': Pictograms.ChetPictogram,
    'ט': Pictograms.TetPictogram,
    'י': Pictograms.YodPictogram,
    'כ': Pictograms.KaphPictogram,
    'ל': Pictograms.LamedPictogram,
    'מ': Pictograms.MemPictogram,
    'נ': Pictograms.NunPictogram,
    'ס': Pictograms.SamekhPictogram,
    'ע': Pictograms.AyinPictogram,
    'פ': Pictograms.PePictogram,
    'צ': Pictograms.TsadePictogram,
    'ק': Pictograms.QophPictogram,
    'ר': Pictograms.ReshPictogram,
    'ש': Pictograms.ShinPictogram,
    'ת': Pictograms.TawPictogram,
};

const AncientHebrew: React.FC<AncientHebrewProps> = ({ initialLetter }) => {
    const [selectedLetter, setSelectedLetter] = useState<AncientHebrewLetter | null>(null);

    useEffect(() => {
        if (initialLetter) {
            const letterData = ANCIENT_HEBREW_MAP[initialLetter];
            if (letterData) {
                setSelectedLetter(letterData);
            }
        }
    }, [initialLetter]);

    const playPronunciation = (e: React.MouseEvent, letter: AncientHebrewLetter) => {
        e.stopPropagation(); // Prevent parent button onClick from firing
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any currently playing speech

            // Speak the English name of the letter. For letters with alternate names (e.g., "Tav/Taw"),
            // we use the first one.
            const textToSpeak = letter.name.split('/')[0];

            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'en-US'; // Use an English voice for all letter names
            
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


    if (selectedLetter) {
        const PictogramComponent = pictogramMap[selectedLetter.letter];
        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 relative group">
                    <button 
                        onClick={() => setSelectedLetter(null)} 
                        className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-primary-400 transition-colors duration-200"
                    >
                        <BackIcon className="w-6 h-6" />
                        <span>Back to Aleph-Bet</span>
                    </button>
                    <span className="absolute bottom-full left-0 mb-2 whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">Go Back</span>
                </div>
                <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                    <div className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-6 flex justify-between items-start">
                        <div>
                            <p className="text-6xl md:text-7xl font-bold text-gray-800 dark:text-gray-200">{selectedLetter.letter}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-2xl text-primary-500 dark:text-primary-300 font-semibold">{selectedLetter.name}</p>
                                <button 
                                    onClick={(e) => playPronunciation(e, selectedLetter)} 
                                    className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
                                    aria-label={`Play pronunciation for ${selectedLetter.name}`}
                                >
                                    <VolumeUpIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                         {PictogramComponent && (
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                                    <PictogramComponent className="w-full h-full text-primary-500" />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1">{selectedLetter.pictographDescription}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-semibold text-primary-400 dark:text-primary-300">Meaning</p>
                            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300">{selectedLetter.meaning}</p>
                        </div>
                         <div>
                            <p className="text-sm font-semibold text-primary-400 dark:text-primary-300">Details</p>
                            <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedLetter.details}</p>
                        </div>

                        {selectedLetter.grammarNotes && (
                            <div>
                                <p className="text-sm font-semibold text-primary-400 dark:text-primary-300">Grammar & Usage</p>
                                <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedLetter.grammarNotes}</p>
                            </div>
                        )}

                        {selectedLetter.vowelExamples && selectedLetter.vowelExamples.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold text-primary-400 dark:text-primary-300 mb-2">Common Vowel Combinations</p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-300">
                                        <thead className="bg-gray-100 dark:bg-gray-900/50">
                                            <tr>
                                                <th className="p-2 font-semibold">Hebrew</th>
                                                <th className="p-2 font-semibold">Pronunciation</th>
                                                <th className="p-2 font-semibold">Vowel Name</th>
                                                <th className="p-2 font-semibold">Note</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedLetter.vowelExamples.map((example, index) => (
                                                <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                                                    <td className="p-2 text-xl">{example.combination}</td>
                                                    <td className="p-2 italic">"{example.pronunciation}"</td>
                                                    <td className="p-2">{example.name}</td>
                                                    <td className="p-2">{example.note || '---'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                             <div>
                                <p className="text-sm font-semibold text-primary-400 dark:text-primary-300">Numeric Value</p>
                                <p className="text-base text-gray-700 dark:text-gray-300">{selectedLetter.numericValue}</p>
                            </div>
                             <div>
                                <p className="text-sm font-semibold text-primary-400 dark:text-primary-300">Transliteration</p>
                                <p className="text-base text-gray-700 dark:text-gray-300">{selectedLetter.transliteration}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-primary-400 mb-2">The Ancient Hebrew Aleph-Bet</h1>
                <p className="text-md text-gray-600 dark:text-gray-400">Click a letter to explore its ancient pictographic meaning.</p>
            </header>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {ANCIENT_HEBREW_DATA.map(letter => {
                    const PictogramComponent = pictogramMap[letter.letter];
                    return (
                        <button 
                            key={letter.name}
                            onClick={() => setSelectedLetter(letter)}
                            className="p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-center hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-500 transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
                        >
                             {PictogramComponent && (
                                <div className="w-12 h-12 mx-auto mb-2">
                                    <PictogramComponent className="w-full h-full text-primary-500/80" />
                                </div>
                            )}
                            <p className="text-5xl font-bold text-gray-800 dark:text-gray-200">{letter.letter}</p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <p className="text-lg font-semibold text-primary-500 dark:text-primary-400">{letter.name}</p>
                                <button 
                                    onClick={(e) => playPronunciation(e, letter)} 
                                    className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
                                    aria-label={`Play pronunciation for ${letter.name}`}
                                >
                                    <VolumeUpIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-500">{letter.pictographDescription}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AncientHebrew;
