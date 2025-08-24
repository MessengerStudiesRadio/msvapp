
import React, { useRef, useState, useEffect } from 'react';
import ClipboardIcon from '../components/icons/ClipboardIcon';
import ShareIcon from '../components/icons/ShareIcon';
import { useScripture } from '../context/ScriptureContext';
import { ANCIENT_HEBREW_MAP } from '../data/ancientHebrew';
import { HEBREW_DIACRITICS_MAP } from '../data/hebrewDiacritics';
import type { AncientHebrewLetter, HebrewDiacritic, LexiconEntry } from '../types';
import { LEXICON_MAP } from '../data/lexicon';

interface NameExplanationProps {
    onNavigateToAncientLexicon: (letter: string) => void;
    onNavigateToLexicon: (strongs: string) => void;
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

const NameExplanation: React.FC<NameExplanationProps> = ({ onNavigateToAncientLexicon, onNavigateToLexicon }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [copyButtonText, setCopyButtonText] = useState('Copy Text');
    const { showScripture, hideScripture } = useScripture();

    const [letterInfoPopover, setLetterInfoPopover] = useState<{ baseLetter: AncientHebrewLetter | null; diacritics: HebrewDiacritic[]; targetRect: DOMRect; } | null>(null);
    const [letterPopoverLayout, setLetterPopoverLayout] = useState<{ style: React.CSSProperties; isBelow: boolean } | null>(null);
    const letterInfoPopoverHideTimeout = useRef<number | null>(null);
    const letterPopoverRef = useRef<HTMLDivElement>(null);

    const [strongsPopover, setStrongsPopover] = useState<{ content: LexiconEntry; targetRect: DOMRect } | null>(null);
    const [strongsPopoverLayout, setStrongsPopoverLayout] = useState<{ style: React.CSSProperties; isBelow: boolean } | null>(null);
    const strongsPopoverHideTimeout = useRef<number | null>(null);
    const strongsPopoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (letterInfoPopover && letterPopoverRef.current) {
            const { targetRect } = letterInfoPopover;
            const popoverRect = letterPopoverRef.current.getBoundingClientRect();
            const PADDING = 8;
            const clientWidth = document.documentElement.clientWidth;
            const clientHeight = document.documentElement.clientHeight;

            let top = targetRect.bottom + PADDING;
            let isBelow = true;

            if (top + popoverRect.height > clientHeight - PADDING) {
                top = targetRect.top - popoverRect.height - PADDING;
                isBelow = false;
            }
            
            if (top < PADDING) {
                top = PADDING;
            }

            let left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
            
            left = Math.max(PADDING, left);
            left = Math.min(left, clientWidth - popoverRect.width - PADDING);

            const arrowLeft = targetRect.left + targetRect.width / 2 - left;
            
            setLetterPopoverLayout({
                style: {
                    position: 'fixed',
                    top: `${top}px`,
                    left: `${left}px`,
                    opacity: 1,
                    '--arrow-left': `${arrowLeft}px`,
                } as React.CSSProperties,
                isBelow: isBelow,
            });
        } else {
            setLetterPopoverLayout(null);
        }
    }, [letterInfoPopover]);

    useEffect(() => {
        if (strongsPopover && strongsPopoverRef.current) {
            const { targetRect } = strongsPopover;
            const popoverRect = strongsPopoverRef.current.getBoundingClientRect();
            const PADDING = 8;
            const clientWidth = document.documentElement.clientWidth;
            const clientHeight = document.documentElement.clientHeight;
    
            let top = targetRect.bottom + PADDING;
            let isBelow = true;
    
            if (top + popoverRect.height > clientHeight - PADDING) {
                top = targetRect.top - popoverRect.height - PADDING;
                isBelow = false;
            }
            
            if (top < PADDING) {
                top = PADDING;
            }
    
            let left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
            
            left = Math.max(PADDING, left);
            left = Math.min(left, clientWidth - popoverRect.width - PADDING);
    
            const arrowLeft = targetRect.left + targetRect.width / 2 - left;
            
            setStrongsPopoverLayout({
                style: {
                    position: 'fixed',
                    top: `${top}px`,
                    left: `${left}px`,
                    opacity: 1,
                    '--arrow-left': `${arrowLeft}px`,
                } as React.CSSProperties,
                isBelow: isBelow,
            });
        } else {
            setStrongsPopoverLayout(null);
        }
    }, [strongsPopover]);


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

    const handleLetterMouseLeave = () => {
        letterInfoPopoverHideTimeout.current = window.setTimeout(() => setLetterInfoPopover(null), 200);
    };
    
    const handleLetterPopoverMouseEnter = () => {
        if (letterInfoPopoverHideTimeout.current) clearTimeout(letterInfoPopoverHideTimeout.current);
    }

    const handleLetterPopoverMouseLeave = () => {
        setLetterInfoPopover(null);
    }

    const handleStrongsMouseEnter = (event: React.MouseEvent, strongs: string) => {
        if (strongsPopoverHideTimeout.current) clearTimeout(strongsPopoverHideTimeout.current);
        const entry = LEXICON_MAP[strongs];
        if (!entry) return;
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setStrongsPopover({ content: entry, targetRect: rect });
    };
    
    const handleStrongsMouseLeave = () => {
        strongsPopoverHideTimeout.current = window.setTimeout(() => {
            setStrongsPopover(null);
        }, 200);
    };
    
    const handleStrongsPopoverMouseEnter = () => {
        if (strongsPopoverHideTimeout.current) clearTimeout(strongsPopoverHideTimeout.current);
    };
    
    const handleStrongsPopoverMouseLeave = () => {
        setStrongsPopover(null);
    };

    const ScriptureLink: React.FC<{ children: string }> = ({ children }) => (
        <button
            className="text-blue-500 hover:underline"
            onMouseEnter={(e) => showScripture(children, e.currentTarget)}
            onMouseLeave={hideScripture}
        >
            {children}
        </button>
    );

    const handleCopy = () => {
        if (contentRef.current) {
            const textToCopy = contentRef.current.innerText || contentRef.current.textContent || '';
            const appLink = "\n\nRead more at LA'SHIR: https://www.messengerstudies.com/msv-app";
            navigator.clipboard.writeText(textToCopy + appLink).then(() => {
                setCopyButtonText('Copied!');
                setTimeout(() => setCopyButtonText('Copy Text'), 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                setCopyButtonText('Copy Failed');
                setTimeout(() => setCopyButtonText('Copy Text'), 2000);
            });
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'The Sacred Name: Yahweh',
                text: "Understanding the pronunciation and significance of the Creator's personal name.",
                url: 'https://www.messengerstudies.com/msv-app',
            }).catch((error) => console.log('Error sharing', error));
        } else {
            alert('Web Share API is not supported in your browser. You can copy the text instead.');
        }
    };
    
    const renderInteractiveHebrew = (hebrew: string) => {
        const characterGroups = parseHebrewWord(hebrew);
        return (
            <span className="inline-flex text-2xl font-bold mx-2" dir="rtl">
                {characterGroups.map((group, index) => (
                    <button 
                        key={index} 
                        onClick={() => onNavigateToAncientLexicon(group.base)}
                        onMouseEnter={(e) => handleLetterMouseEnter(e, group.base, group.diacritics)}
                        onMouseLeave={handleLetterMouseLeave}
                        className="hover:text-primary-500 dark:hover:text-primary-300 focus:outline-none transition-colors"
                    >
                        {group.combined}
                    </button>
                ))}
            </span>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">The Sacred Name: Yahweh</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">Understanding the pronunciation and significance of the Creator's personal name.</p>
            </header>

            <div ref={contentRef} className="prose dark:prose-invert prose-orange max-w-none">
                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold border-b-2 border-primary-400/50 pb-2">The Tetragrammaton (YHWH)</h2>
                        <p>
                            In the original Hebrew Scriptures, the personal covenant name of the Creator is written with four consonants: 
                            {renderInteractiveHebrew("יְהוָה")}
                            (Yod, Heh, Waw, Heh). This four-letter name, known as the Tetragrammaton, appears nearly 7,000 times in the Tanakh (Old Testament).
                        </p>
                        <p>
                            Out of profound reverence and a desire to avoid misusing the sacred name (in accordance with the commandment in Exodus 20:7), the Jewish people eventually ceased to pronounce it aloud. When reading the scriptures, they would substitute the name with titles like 
                            <strong className="text-primary-500 dark:text-primary-300">"Adonai"</strong> (which means "my Master") or 
                            <strong className="text-primary-500 dark:text-primary-300">"HaShem"</strong> (meaning "The Name").
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold border-b-2 border-primary-400/50 pb-2">The "Jehovah" Error: A Linguistic Impossibility</h2>
                        <p>
                            The original Hebrew text contained only consonants. To preserve the traditional pronunciation, medieval Jewish scribes known as the Masoretes added vowel points (nikkud) to the text. However, when they came to the Tetragrammaton (YHWH), they did something unique.
                        </p>
                        <p>
                            Instead of writing the vowels for the sacred name itself, they inserted the vowel points for the substitute word, <strong className="text-primary-500 dark:text-primary-300">"Adonai"</strong>. This was a visual reminder to the reader to say "Adonai" and not attempt to pronounce the name.
                        </p>
                        <blockquote className="border-l-4 border-primary-400 pl-4 italic">
                            The combination looked something like this: The consonants <span className="font-bold">Y-H-W-H</span> were combined with the vowels <span className="font-bold">a-o-ai</span> from Adonai.
                        </blockquote>
                        <p>
                            Centuries later, translators who were not aware of this scribal tradition made a critical error. They mistakenly merged the consonants of the sacred name (YHWH) with the vowels of the substitute name (Adonai). This created the hybrid, artificial name <strong className="text-red-500 dark:text-red-400">"YaHoWaH,"</strong> which was then transliterated into German and Latin as "Jehovah." This name is a linguistic and historical impossibility that was never used in antiquity.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold border-b-2 border-primary-400/50 pb-2">A Note on Common Titles: 'God' and 'Lord'</h2>
                        <p>
                            In addition to using the sacred name Yahweh, this application intentionally uses the Hebrew titles "Eloah" and "Master" instead of the more common English translations "God" and "Lord." This choice is rooted in a desire to avoid terms that, in their original linguistic and historical contexts, are associated with pagan deities.
                        </p>
                    
                        <h3 className="text-xl font-semibold mt-6">Why 'Eloah' Instead of 'God'?</h3>
                        <p>
                            The English word "God" is phonetically very similar to the Hebrew name {renderInteractiveHebrew("גָּד")} (Gad), who was the Babylonian deity of "fortune" or "luck." The prophet Isaiah explicitly warns against setting a table for this false deity:
                        </p>
                        <blockquote className="border-l-4 border-primary-400 pl-4 italic">
                            "But you who forsake Yahweh, who forget my holy mountain, who set a table for Fortune (Gad)..." (<ScriptureLink>Isaiah 65:11</ScriptureLink>)
                        </blockquote>
                        <p>
                            Given this direct scriptural warning and the phonetic similarity, we prefer to use the original Hebrew titles <strong className="text-primary-500 dark:text-primary-300">Eloah</strong> or <strong className="text-primary-500 dark:text-primary-300">Elohim</strong>, plural for mighty ones, in regard to false deities. Also used for men of renown, fame and stature. Men of Magistrates and Judges. See{' '}
                            <strong 
                                onMouseEnter={(e) => handleStrongsMouseEnter(e, 'H430')}
                                onMouseLeave={handleStrongsMouseLeave}
                                onClick={() => onNavigateToLexicon('H430')}
                                className="text-blue-500 hover:underline cursor-pointer font-semibold"
                            >
                                Strong's H430
                            </strong>
                            /
                            <strong 
                                onMouseEnter={(e) => handleStrongsMouseEnter(e, 'H433')}
                                onMouseLeave={handleStrongsMouseLeave}
                                onClick={() => onNavigateToLexicon('H433')}
                                className="text-blue-500 hover:underline cursor-pointer font-semibold"
                            >
                                H433
                            </strong>
                            . We use these proper titles in order to clearly distinguish the Creator from any pagan associations.
                        </p>
                    
                        <h3 className="text-xl font-semibold mt-6">Why 'Master' Instead of 'Lord'?</h3>
                        <p>
                            The common title "Lord" is a direct translation of the Hebrew word {renderInteractiveHebrew("בַּעַל")} (Ba'al). While "Ba'al" can simply mean "master," "owner," or "husband," it is overwhelmingly associated in Scripture with the primary false deity of the Canaanites. Yahweh's people were repeatedly ensnared by the worship of Ba'al.
                        </p>
                        <p>
                            The Scriptures even record Yahweh expressing a desire to be called by a different title to separate Himself from this idol. In the book of Hosea, He says:
                        </p>
                        <blockquote className="border-l-4 border-primary-400 pl-4 italic">
                            "And in that day, declares Yahweh, you will call me 'My Husband,' and no longer will you call me 'My Ba'al' (My Lord)." (<ScriptureLink>Hosea 2:16</ScriptureLink>)
                        </blockquote>
                        <p>
                            To honor this distinction, we use the title <strong className="text-primary-500 dark:text-primary-300">Master</strong>, which corresponds to the Hebrew title <strong className="text-primary-500 dark:text-primary-300">Adonai</strong>—the substitute title the Jewish scribes themselves used when reading the sacred name. This avoids any confusion with the pagan deity Ba'al.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold border-b-2 border-primary-400/50 pb-2">Evidence for "Yahweh"</h2>
                        <p>
                            While the exact ancient pronunciation can't be known with 100% certainty, the scholarly consensus points overwhelmingly to "Yahweh" as the most accurate reconstruction. This conclusion is based on several lines of evidence:
                        </p>
                        <ul>
                            <li>
                                <strong>Early Christian Writers:</strong> Theologians like Clement of Alexandria (c. 150-215 AD) and Theodoret (c. 393-458 AD), who wrote in Greek, transcribed the name as <span className="font-mono">Ἰαουέ</span> (Iaoue) or <span className="font-mono">Ἰαβέ</span> (Iabe), which phonetically aligns with "Yahweh."
                            </li>
                            <li>
                                <strong>Hebrew Grammar:</strong> The name is widely believed to be a form of the Hebrew verb "to be" (<span className="font-mono">hayah</span>). The pronunciation "Yahweh" fits the grammatical patterns for causative verbs, suggesting a meaning like "He Who Causes to Be," "He Brings Into Existence," or simply "The Self-Existent One."
                            </li>
                            <li>
                                <strong>Poetic Forms:</strong> A shortened form of the name, "Yah" (<span dir="rtl">יָהּ</span>), appears in poetic and liturgical texts, such as in "Hallelu-Yah" (Praise Yah). This supports the "Yah-" beginning of the full name.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold border-b-2 border-primary-400/50 pb-2">Extra-Biblical & Archaeological Evidence</h2>
                        <p>
                            Remarkably, the use of the name "Yahweh" is supported by ancient, non-biblical sources. One of the most significant discoveries is an Egyptian hieroglyphic inscription in the Soleb Temple, located in modern-day Sudan.
                        </p>
                        <blockquote className="border-l-4 border-primary-400 pl-4 italic">
                            Dating to the 14th century BC during the reign of Pharaoh Amenhotep III, the inscription mentions the <strong className="text-primary-500 dark:text-primary-300">"Shasu-land of Yahweh."</strong> The Shasu were nomads from the lands of Canaan and Transjordan. This inscription provides powerful evidence that the name Yahweh was known and associated with a specific people group centuries before many other known texts were written.
                        </blockquote>
                        <p>
                            This archaeological find independently confirms the antiquity of the sacred name, connecting it to the very time and region of the Exodus.
                        </p>
                        <p>
                            For more in-depth information, you can read about this finding at {' '}
                            <a href="https://biblearchaeology.org/research/exodus-from-egypt/3233-the-name-yahweh-in-egyptian-hieroglyphic-texts" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">BibleArchaeology.org</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold border-b-2 border-primary-400/50 pb-2">Why is Using the Name Important?</h2>
                        <p>
                            Beyond historical and linguistic accuracy, the Scriptures themselves place great significance on the Creator's personal name. It is not merely a title but a core aspect of His identity and relationship with His people.
                        </p>
                        <ul>
                            <li>
                                <strong>An Eternal Memorial:</strong> Yahweh Himself declares His name to be a memorial for all generations. This implies it is not meant to be forgotten or replaced. (<ScriptureLink>Exodus 3:15</ScriptureLink>)
                            </li>
                            <li>
                                <strong>The Name of Salvation:</strong> The prophet Joel states that "everyone who calls on the name of Yahweh shall be saved." The Apostle Paul later quotes this same passage, reaffirming that salvation is intrinsically linked to calling upon His name. (<ScriptureLink>Joel 2:32</ScriptureLink>, <ScriptureLink>Romans 10:13</ScriptureLink>)
                            </li>
                            <li>
                                <strong>A Place of Safety:</strong> The name is described as a place of refuge and security for the righteous. (<ScriptureLink>Proverbs 18:10</ScriptureLink>)
                            </li>
                            <li>
                                <strong>The Name of the Messiah:</strong> Yahshua the Messiah stated He came in His Father's name. In His prayer before His crucifixion, He emphasized that He had made the Father's name known to His disciples and would continue to do so. (<ScriptureLink>John 5:43</ScriptureLink>, <ScriptureLink>John 17:6</ScriptureLink>, <ScriptureLink>John 17:26</ScriptureLink>)
                            </li>
                        </ul>
                    </section>

                     <section>
                        <h2 className="text-2xl font-semibold border-b-2 border-primary-400/50 pb-2">Conclusion</h2>
                        <p>
                            Based on linguistic, historical, and archaeological evidence, "Yahweh" stands as the most accurate and respectful rendering of the Creator's personal name. Using this name restores a vital piece of our spiritual heritage, moving away from a later, man-made error and closer to the original scriptures.
                        </p>
                    </section>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md w-full sm:w-auto justify-center"
                >
                    <ClipboardIcon className="w-4 h-4" />
                    <span>{copyButtonText}</span>
                </button>
                {typeof navigator.share !== 'undefined' && (
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-md w-full sm:w-auto justify-center"
                    >
                        <ShareIcon className="w-4 h-4" />
                        <span>Share</span>
                    </button>
                )}
            </div>

             {letterInfoPopover && (
                <div 
                    ref={letterPopoverRef}
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 w-full max-w-xs border border-gray-200 dark:border-gray-700 z-50 transition-opacity"
                    style={letterPopoverLayout ? letterPopoverLayout.style : { position: 'fixed', opacity: 0 }}
                    onMouseEnter={handleLetterPopoverMouseEnter}
                    onMouseLeave={handleLetterPopoverMouseLeave}
                >
                    <div
                        className={`absolute w-0 h-0 
                            border-l-8 border-l-transparent 
                            border-r-8 border-r-transparent 
                            ${!letterPopoverLayout?.isBelow 
                                ? 'top-full border-t-8 border-t-white dark:border-t-gray-900'
                                : 'bottom-full border-b-8 border-b-white dark:border-b-gray-900'
                            }`}
                        style={{
                            left: `var(--arrow-left)`,
                            transform: 'translateX(-50%)',
                        }}
                    />
                    
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
            {strongsPopover && (
                <div
                ref={strongsPopoverRef}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 w-full max-w-sm border border-gray-200 dark:border-gray-700 z-50 transition-opacity"
                style={strongsPopoverLayout ? strongsPopoverLayout.style : { position: 'fixed', opacity: 0, pointerEvents: 'none' }}
                onMouseEnter={handleStrongsPopoverMouseEnter}
                onMouseLeave={handleStrongsPopoverMouseLeave}
                >
                <div
                    className={`absolute w-0 h-0 
                        border-l-8 border-l-transparent 
                        border-r-8 border-r-transparent 
                        ${!strongsPopoverLayout?.isBelow 
                            ? 'top-full border-t-8 border-t-white dark:border-t-gray-900' // Arrow on bottom pointing down
                            : 'bottom-full border-b-8 border-b-white dark:border-b-gray-900' // Arrow on top pointing up
                        }`}
                    style={{
                    left: `var(--arrow-left)`,
                    transform: 'translateX(-50%)',
                    }}
                />
                <h3 className="text-md font-bold text-primary-400 dark:text-primary-300">{strongsPopover.content.hebrew} ({strongsPopover.content.transliteration})</h3>
                <p className="text-sm italic text-gray-500 dark:text-gray-400 mb-2">{strongsPopover.content.pronunciation}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{strongsPopover.content.definition}</p>
                <p className="text-xs text-blue-500 mt-2">Click to see full lexicon entry.</p>
                </div>
            )}
        </div>
    );
};

export default NameExplanation;
