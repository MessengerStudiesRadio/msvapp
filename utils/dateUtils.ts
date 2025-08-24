import type { WeeklyReading } from '../types';

export function getMonthDays(date: Date): (Date | null)[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];
    
    // Add padding for days before the start of the month
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
        days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        days.push(new Date(year, month, i));
    }

    return days;
}

export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export function findReadingForDate(date: Date, allReadings: WeeklyReading[]): WeeklyReading | null {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    for (const reading of allReadings) {
        const startDate = new Date(reading.startDate + 'T00:00:00');
        const endDate = new Date(reading.endDate + 'T23:59:59');
        if (targetDate >= startDate && targetDate <= endDate) {
            return reading;
        }
    }
    return null;
}

export function formatDate(date: Date, format: 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getHebrewYearInfo(date: Date): { year: string; cycle: string } {
    // Start dates are based on the first Parashah of the cycle
    const d5787 = new Date(2026, 9, 4); // 2026-10-04
    const d5786 = new Date(2025, 9, 12); // 2025-10-12
    const d5785 = new Date(2024, 9, 20); // 2024-10-20

    if (date >= d5787) {
        return { year: '5787', cycle: '2026-2027' };
    }
    if (date >= d5786) {
        return { year: '5786', cycle: '2025-2026' };
    }
    // Default to 5785 for any valid date within or before its cycle starts
    return { year: '5785', cycle: '2024-2025' };
}