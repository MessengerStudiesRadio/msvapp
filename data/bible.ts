
import { genesis } from './bible/genesis';
import { exodus } from './bible/exodus';
import { leviticus } from './bible/leviticus';
import { numbers } from './bible/numbers';
import { deuteronomy } from './bible/deuteronomy';
import { joshua } from './bible/joshua';
import { samuel1 } from './bible/1samuel';
import { psalms } from './bible/psalms';
import { proverbs } from './bible/proverbs';
import { isaiah } from './bible/isaiah';
import { hosea } from './bible/hosea';
import { joel } from './bible/joel';
import { matthew } from './bible/matthew';
import { mark } from './bible/mark';
import { luke } from './bible/luke';
import { john } from './bible/john';
import { romans } from './bible/romans';
import { corinthians1 } from './bible/1corinthians';
import { galatians } from './bible/galatians';
import { revelation } from './bible/revelation';
import type { BibleBook } from '../types';

export const BIBLE_DATA: Record<string, BibleBook> = {
    'Genesis': genesis,
    'Exodus': exodus,
    'Leviticus': leviticus,
    'Numbers': numbers,
    'Deuteronomy': deuteronomy,
    'Joshua': joshua,
    '1 Samuel': samuel1,
    'Psalms': psalms,
    'Proverbs': proverbs,
    'Isaiah': isaiah,
    'Hosea': hosea,
    'Joel': joel,
    'Matthew': matthew,
    'Mark': mark,
    'Luke': luke,
    'John': john,
    'Romans': romans,
    '1 Corinthians': corinthians1,
    'Galatians': galatians,
    'Revelation': revelation,
};


export const BOOKS: string[] = Object.keys(BIBLE_DATA);
