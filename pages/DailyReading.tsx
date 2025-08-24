
import React from 'react';
import type { WeeklyReading } from '../types';
import { READING_PLAN } from '../data/readingPlan';
import { useScripture } from '../context/ScriptureContext';
import { parseReference } from '../utils/scripture';
import { findReadingForDate, formatDate } from '../utils/dateUtils';
import BackIcon from '../components/icons/BackIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';

interface DailyReadingProps {
    date: Date;
    completedReadings: string[];
    onToggleCompleted: (dateString: string) => void;
    onBack: () => void;
    onNavigateToBible: (book: string, chapter: number, verse: number) => void;
}

const ScriptureLink: React.FC<{ reference: string; onNavigate: (book: string, chapter: number, verse: number) => void; }> = ({ reference, onNavigate }) => {
    const { showScripture, hideScripture, hideScriptureImmediately } = useScripture();
    const firstPart = reference.split(/[-−–]/)[0].trim();
    const parsedRef = parseReference(firstPart);
    
    const handleClick = () => {
        if (parsedRef) {
            onNavigate(parsedRef.book, parsedRef.chapter - 1, parsedRef.verse - 1);
            hideScriptureImmediately();
        }
    };

    return (
        <button 
            onClick={handleClick} 
            disabled={!parsedRef}
            className="text-primary-500 dark:text-primary-300 hover:underline disabled:text-gray-500 disabled:no-underline"
            onMouseEnter={(e) => { if(parsedRef) showScripture(reference, e.currentTarget); }}
            onMouseLeave={hideScripture}
        >
            {reference}
        </button>
    );
};

const ScriptureLinks: React.FC<{ references: string; onNavigate: (book: string, chapter: number, verse: number) => void; }> = ({ references, onNavigate }) => {
    const parts = references.split(';').map(s => s.trim());
    return (
        <>
            {parts.map((part, index) => (
                <React.Fragment key={index}>
                    <ScriptureLink reference={part} onNavigate={onNavigate} />
                    {index < parts.length - 1 && <span className="mx-1 text-gray-500">;</span>}
                </React.Fragment>
            ))}
        </>
    );
};


const DailyReading: React.FC<DailyReadingProps> = ({ date, completedReadings, onToggleCompleted, onBack, onNavigateToBible }) => {
    const reading = findReadingForDate(date, READING_PLAN);
    const dateString = formatDate(date, 'YYYY-MM-DD');
    const isCompleted = completedReadings.includes(dateString);

    if (!reading) {
        return (
            <div className="text-center p-8">
                <p className="text-lg text-gray-600 dark:text-gray-400">No reading scheduled for this day.</p>
                <button onClick={onBack} className="mt-4 flex items-center gap-2 mx-auto text-primary-500 hover:underline">
                    <BackIcon className="w-5 h-5"/>
                    <span>Back to Calendar</span>
                </button>
            </div>
        );
    }
    
    const handleToggle = () => {
        onToggleCompleted(dateString);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <button onClick={onBack} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-primary-400 transition-colors duration-200">
                    <BackIcon className="w-6 h-6" />
                    <span>Back to Calendar</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                <header className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h1 className="text-3xl font-bold text-primary-500 dark:text-primary-300 mt-1">{reading.parashah}</h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 italic">{reading.title}</p>
                </header>
                
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Torah</h2>
                        <p className="text-lg">
                            <ScriptureLinks references={reading.torah} onNavigate={onNavigateToBible} />
                        </p>
                    </div>
                     <div>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Prophets (Haftarah)</h2>
                        <p className="text-lg">
                            <ScriptureLinks references={reading.prophets} onNavigate={onNavigateToBible} />
                        </p>
                    </div>
                     <div>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Apostolic Writings</h2>
                        <p className="text-lg">
                            <ScriptureLinks references={reading.apostolic} onNavigate={onNavigateToBible} />
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <label htmlFor="completed-checkbox" className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            id="completed-checkbox"
                            checked={isCompleted}
                            onChange={handleToggle}
                            className="opacity-0 absolute h-6 w-6"
                        />
                         <div className={`h-6 w-6 flex items-center justify-center rounded-md border-2 transition-all ${isCompleted ? 'bg-green-500 border-green-500' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'}`}>
                             {isCompleted && <CheckCircleIcon className="w-5 h-5 text-white" />}
                         </div>
                        <span className={`font-semibold ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            Mark as Completed
                        </span>
                    </label>
                </div>

            </div>
        </div>
    );
};

export default DailyReading;