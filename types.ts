export interface User {
  uid: string;
  email: string | null;
  username: string | null;
  role: 'admin' | 'user';
}

// Types for structured Bible data with Strong's Concordance
export type BibleVersePart = {
  text: string;
  strongs?: string; // e.g., "H1234" or "G567"
};
export type BibleVerse = BibleVersePart[];
export type BibleChapter = BibleVerse[];
export type BibleBook = BibleChapter[];

// Type for Hebrew Lexicon data
export interface LexiconEntry {
    strongs: string;        // e.g., "H430"
    hebrew: string;         // e.g., "אֱלֹהִים" or "θεός"
    transliteration: string; // e.g., "Elohim"
    pronunciation: string;  // e.g., "el-o-heem'"
    partOfSpeech: string;   // e.g., "Noun Masculine Plural"
    definition: string;
    septuagint?: {          // Greek equivalent from the Septuagint (LXX)
      strongs: string;        // e.g., "G2316"
      greek: string;          // e.g., "θεός"
      transliteration: string; // e.g., "Theos"
    };
    hebrew_origins?: {      // Hebrew source words from the Septuagint (LXX)
      strongs: string;        // e.g., "H1697"
      hebrew: string;         // e.g., "דָּבָר"
      transliteration: string; // e.g., "Dabar (noun)"
    }[];
}

// Type for Vowel Examples
export interface VowelExample {
    combination: string;
    pronunciation: string;
    name: string;
    note?: string;
}

// Type for Ancient Hebrew Letter data
export interface AncientHebrewLetter {
    letter: string;
    name: string;
    pictographDescription: string;
    meaning: string;
    numericValue: number;
    transliteration: string;
    details: string;
    grammarNotes?: string;
    vowelExamples?: VowelExample[];
}

// Type for Hebrew Diacritics (vowel points, etc.)
export interface HebrewDiacritic {
    symbol: string;
    name: string;
    pronunciation: string;
    description: string;
}

// Types for Grammar Rules
export interface HebrewExample {
  hebrew: string;
  meaning: string;
}

export interface GrammarRule {
  title: string;
  explanation: string;
  examples: HebrewExample[];
}

// Types for Strong's Concordance
export interface ConcordanceOccurrence {
  book: string;
  chapter: number; // 0-indexed
  verse: number; // 0-indexed
  verseData: BibleVerse;
}

export type ConcordanceMap = Record<string, ConcordanceOccurrence[]>;

// Types for Teachings
export interface Teaching {
  id: number;
  title: string;
  seriesName: string;
  coverArtUrl: string;
  audioUrl: string;
  episodeNumber?: number;
  releaseDate?: string;
  description?: string;
  dateAdded: number; // Unix timestamp
}

export interface TeachingPlaylist {
  id: number;
  name: string;
  teachings: Teaching[];
}

// Types for Study Buddy
export interface HebrewWordStudy {
  hebrew_word: string;
  transliteration: string;
  strongs_number: string; // e.g., "H430"
  meaning: string;
}

export interface StudySection {
  title: string;
  points: string[];
  scripture_references?: string[];
  estimated_time: number;
}

export interface StudyOutline {
  title: string;
  key_scriptures: string[];
  hebrew_word_studies: HebrewWordStudy[];
  sections: StudySection[];
}

export interface SavedStudyOutline extends StudyOutline {
  id: string; // Firestore document ID
  dateCreated: number; // Unix timestamp
}

// Types for Scripture Reading Plan
export interface WeeklyReading {
  id: string;
  parashah: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  torah: string;
  prophets: string;
  apostolic: string;
  hebrewYear: string;
}

export interface DailyReading {
    date: Date;
    reading: WeeklyReading;
}

// Types for navigation
export type MediaNavView = 'bible' | 'teachings' | 'lexicon' | 'ancient-hebrew' | 'grammar' | 'study-assistant' | 'live-radio' | 'reading-plan';
export type ActiveMediaView = MediaNavView | 'name-explanation';

// Types for YouTube API response
export interface YouTubeThumbnail { url: string; width: number; height: number; }
export interface YouTubeThumbnails { default: YouTubeThumbnail; medium: YouTubeThumbnail; high: YouTubeThumbnail; }
export interface YouTubeVideoSnippet {
  publishedAt: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  resourceId: { videoId: string; };
  position: number;
}
export interface YouTubePlaylistItem {
  id: string;
  snippet: YouTubeVideoSnippet;
}