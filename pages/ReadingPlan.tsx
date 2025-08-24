import React, { useState } from 'react';
import { READING_PLAN } from '../data/readingPlan';
import { getMonthDays, isSameDay, findReadingForDate, formatDate, getHebrewYearInfo } from '../utils/dateUtils';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';

interface ReadingPlanProps {
    completedReadings: string[];
    onSelectDate: (date: Date) => void;
}

const ReadingPlan: React.FC<ReadingPlanProps> = ({ completedReadings, onSelectDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const hebrewYearInfo = getHebrewYearInfo(currentDate);

    const monthDays = getMonthDays(currentDate);
    const today = new Date();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    
    const handleGoToToday = () => {
        setCurrentDate(new Date());
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-6 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">Reading Plan Calendar</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    {hebrewYearInfo.year} ({hebrewYearInfo.cycle} Cycle)
                </p>
            </header>

            <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">&lt;</button>
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={handleGoToToday} className="text-sm text-primary-500 hover:underline">Go to Today</button>
                    </div>
                    <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {monthDays.map((day, index) => {
                        if (!day) return <div key={index}></div>;

                        const reading = findReadingForDate(day, READING_PLAN);
                        const dayString = formatDate(day, 'YYYY-MM-DD');
                        const isCompleted = completedReadings.includes(dayString);
                        const isToday = isSameDay(day, today);
                        
                        const dayClasses = [
                            "h-24 p-1.5 flex flex-col rounded-md transition-colors text-sm relative",
                            reading ? "cursor-pointer bg-primary-500/10 hover:bg-primary-500/20 dark:bg-primary-400/10 dark:hover:bg-primary-400/20" : "bg-gray-50 dark:bg-gray-800",
                            isToday ? "border-2 border-primary-500" : "border border-gray-200 dark:border-gray-700",
                            day.getMonth() !== currentDate.getMonth() ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200",
                        ].join(" ");

                        return (
                            <div key={index} className={dayClasses} onClick={() => reading && onSelectDate(day)}>
                                <div className={`font-semibold ${isToday ? 'text-primary-500' : ''}`}>{day.getDate()}</div>
                                {reading && (
                                    <div className="mt-1 text-xs text-left overflow-hidden">
                                        <p className="truncate text-primary-800 dark:text-primary-200 font-medium">{reading.parashah}</p>
                                    </div>
                                )}
                                {isCompleted && (
                                    <div className="absolute bottom-1 right-1">
                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ReadingPlan;