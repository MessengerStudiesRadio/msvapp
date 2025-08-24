import type { HebrewDiacritic } from '../types';

// This data provides information on Hebrew diacritics (nikkud).
// The symbols are the raw Unicode combining characters.
export const HEBREW_DIACRITICS_DATA: HebrewDiacritic[] = [
    { symbol: '\u05B7', name: 'Patach', pronunciation: 'ah', description: 'Makes an "ah" sound, as in "father".' },
    { symbol: '\u05B8', name: 'Qamatz', pronunciation: 'ah', description: 'Usually makes an "ah" sound, as in "father". Can sometimes make an "o" sound (Qamatz Katan).' },
    { symbol: '\u05B6', name: 'Segol', pronunciation: 'eh', description: 'Makes an "eh" sound, as in "bed".' },
    { symbol: '\u05B5', name: 'Tzere', pronunciation: 'ey', description: 'Makes an "ey" sound, as in "they".' },
    { symbol: '\u05B4', name: 'Hiriq', pronunciation: 'ee', description: 'Makes an "ee" sound, as in "ski".' },
    { symbol: '\u05B9', name: 'Holam', pronunciation: 'oh', description: 'Makes an "oh" sound, as in "go". It usually appears as a dot over the top-left of a letter.' },
    { symbol: '\u05BB', name: 'Qubutz', pronunciation: 'oo', description: 'Makes an "oo" sound, as in "blue". Represented by three diagonal dots under a letter.' },
    { symbol: '\u05B0', name: 'Shva', pronunciation: 'silent or short "e"', description: 'Can be silent (at the end of a syllable) or a very short "e" sound (at the beginning of a syllable).' },
    { symbol: '\u05BC', name: 'Dagesh or Shuruk', pronunciation: 'hardens consonant or "oo"', description: 'A dot inside a letter. It can harden the sound (e.g., בּ is "b" not "v"), indicate a doubled consonant, or create the "oo" sound when inside a Vav (וּ).' },
    { symbol: '\u05C1', name: 'Shin Dot', pronunciation: 'sh', description: 'A dot on the upper-right of the letter Shin (ש), indicating the "sh" sound.' },
    { symbol: '\u05C2', name: 'Sin Dot', pronunciation: 's', description: 'A dot on the upper-left of the letter Shin (ש), indicating the "s" sound.' },
    { symbol: '\u05B1', name: 'Hataf Segol', pronunciation: 'short eh', description: 'A composite Shva; a very short "eh" sound.' },
    { symbol: '\u05B2', name: 'Hataf Patach', pronunciation: 'short ah', description: 'A composite Shva; a very short "ah" sound.' },
    { symbol: '\u05B3', name: 'Hataf Qamatz', pronunciation: 'short o', description: 'A composite Shva; a very short "o" sound.' }
];

export const HEBREW_DIACRITICS_MAP: Record<string, HebrewDiacritic> = HEBREW_DIACRITICS_DATA.reduce((acc, entry) => {
    acc[entry.symbol] = entry;
    return acc;
}, {} as Record<string, HebrewDiacritic>);
