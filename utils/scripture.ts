
import { BIBLE_DATA } from '../data/bible';
import type { BibleVerse } from '../types';

export interface ParsedReference {
  book: string;
  chapter: number; // 1-indexed
  verse: number;   // 1-indexed
}

export function parseReference(ref: string): ParsedReference | null {
    let restOfRef = ref.trim();

    // Check for "HebrewName (EnglishName) chapter:verse" format
    // This will handle "Yochanan (John) 3:16" and extract "John 3:16"
    const parenMatch = restOfRef.match(/^(?:.*?)\s*\((.*?)\)\s*(.*)$/);
    if (parenMatch) {
        const englishBookName = parenMatch[1].trim();
        const chapterAndVerse = parenMatch[2].trim();
        // Reconstruct a string that the main regex can parse
        restOfRef = `${englishBookName} ${chapterAndVerse}`;
    }
    
    // Regex to handle book names that may or may not start with a number and have spaces.
    // E.g., "Genesis 1:1", "1 Kings 1:1", "Song of Solomon 1:1"
    // Made the book name part non-greedy to handle multi-word book names correctly.
    const match = restOfRef.match(/^((\d\s)?[a-zA-Z\s]+?)\s*(\d+):(\d+)$/);

    if (!match) {
        console.warn(`Could not parse scripture reference: "${ref}"`);
        return null;
    }

    const book = match[1].trim();
    const chapter = parseInt(match[3], 10);
    const verse = parseInt(match[4], 10);

    return { book, chapter, verse };
}

export function getVerse(
  parsedRef: ParsedReference
): BibleVerse | null {
    try {
        const bookData = BIBLE_DATA[parsedRef.book];
        if (!bookData) return null;

        // Adjust for 0-based indexing
        const chapterIndex = parsedRef.chapter - 1;
        const verseIndex = parsedRef.verse - 1;

        const chapterData = bookData[chapterIndex];
        if (!chapterData) return null;

        const verseData = chapterData[verseIndex];
        return verseData || null;
    } catch (error) {
        console.error(`Error fetching verse for ${parsedRef.book} ${parsedRef.chapter}:${parsedRef.verse}`, error);
        return null;
    }
}
