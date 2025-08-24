

import type { GrammarRule } from '../types';

export const grammarRules: GrammarRule[] = [
    {
        title: "The Three-Letter Root (Shorosh)",
        explanation: "The vast majority of Hebrew words are built from a three-consonant root, known as a 'shorosh' (שׁוֹרֶשׁ). This root carries the core meaning of the word. Prefixes, suffixes, and vowel changes modify this core meaning to create different parts of speech (nouns, verbs, adjectives, etc.).",
        examples: [
            {
                hebrew: "שׁמר",
                meaning: "Root related to 'guarding' or 'keeping'."
            },
            {
                hebrew: "שׁוֹמֵר",
                meaning: "'shomer' - a guard (noun)."
            },
            {
                hebrew: "לִשְׁמוֹר",
                meaning: "'lishmor' - to guard (verb)."
            },
            {
                hebrew: "מִשְׁמֶרֶת",
                meaning: "'mishmeret' - a charge, a duty (noun)."
            }
        ]
    },
    {
        title: "Prefixes (The building blocks in front)",
        explanation: "Single letters can be added to the beginning of a word to change its meaning. These prefixes are fundamental to understanding Hebrew sentences.",
        examples: [
            {
                hebrew: "ה",
                meaning: "The letter 'Heh' (ה) as a prefix often means 'the'."
            },
            {
                hebrew: "הָאָרֶץ",
                meaning: "'ha'arets' - the earth (ה + אָרֶץ)."
            },
            {
                hebrew: "ו",
                meaning: "The letter 'Waw' (ו) as a prefix usually means 'and' or 'but'."
            },
            {
                hebrew: "וּבֵן",
                meaning: "'u'ven' - and a son (ו + בֵן)."
            },
            {
                hebrew: "ל",
                meaning: "The letter 'Lamed' (ל) as a prefix usually means 'to' or 'for'."
            },
            {
                hebrew: "לְמֶלֶךְ",
                meaning: "'l'melekh' - to a king (ל + מֶלֶךְ)."
            }
        ]
    },
    {
        title: "Possessive & Plural Suffixes",
        explanation: "Letters or groups of letters can be added to the end of a word to indicate possession (my, your, his) or plurality.",
        examples: [
             {
                hebrew: "יִם",
                meaning: "The suffix 'im' (ים) often makes a noun masculine plural."
            },
            {
                hebrew: "סוּסִים",
                meaning: "'susim' - horses (from סוּס, horse)."
            },
            {
                hebrew: "ךָ",
                meaning: "The suffix 'kha' (ךָ) at the end of a noun means 'your' (masculine singular)."
            },
            {
                hebrew: "סוּסְךָ",
                meaning: "'suskha' - your horse."
            }
        ]
    },
    {
        title: "Noun Gender (Masculine & Feminine)",
        explanation: "In Hebrew, every noun is either masculine or feminine. Feminine nouns often end with the letter 'Heh' (ה) or 'Tav' (ת), while masculine nouns typically have no special ending. Plurals also follow gendered patterns.",
        examples: [
            { hebrew: "סוּס", meaning: "'sus' - horse (masculine singular)." },
            { hebrew: "סוּסָה", meaning: "'susah' - mare (feminine singular)." },
            { hebrew: "סוּסִים", meaning: "'susim' - horses (masculine plural)." },
            { hebrew: "סוּסוֹת", meaning: "'susot' - mares (feminine plural)." }
        ]
    },
    {
        title: "The Construct State (Possession)",
        explanation: "To show possession (like 'king's horse'), Hebrew places the nouns next to each other. The first noun (the thing being possessed) often changes its form slightly. This is called the construct state. It literally reads as 'horse of the king'.",
        examples: [
            { hebrew: "דָּבָר + אֱלֹהִים", meaning: "'davar' (word) + 'Elohim' (God)." },
            { hebrew: "דְּבַר־אֱלֹהִים", meaning: "'d'var-Elohim' - the word of God." },
            { hebrew: "בֵּן + מֶלֶךְ", meaning: "'ben' (son) + 'melekh' (king)." },
            { hebrew: "בֶּן־מֶלֶךְ", meaning: "'ben-melekh' - the son of the king." }
        ]
    },
    {
        title: "Verb Tense (A Simple Look)",
        explanation: "Biblical Hebrew verbs don't have past, present, and future tenses like English. Instead, they have 'aspects': Perfect (completed action, often translated as past tense) and Imperfect (incomplete action, often translated as future tense). The form of the verb root changes to show this.",
        examples: [
            { hebrew: "שׁמר", meaning: "Root for 'to guard'." },
            { hebrew: "שָׁמַר", meaning: "'shamar' - he guarded (Perfect/completed action)." },
            { hebrew: "יִשְׁמֹר", meaning: "'yishmor' - he will guard (Imperfect/incomplete action)." }
        ]
    }
];
