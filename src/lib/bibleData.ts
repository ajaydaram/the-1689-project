import bibleUrl from '../../public/bible.json?url';

export type BibleBook = {
  name: string;
  abbrev: string;
  chapters: string[][];
}

export type BibleData = BibleBook[];

let cachedData: BibleData | null = null;
let loadPromise: Promise<BibleData> | null = null;

export async function getBibleData(): Promise<BibleData> {
  if (cachedData) return cachedData;
  if (!loadPromise) {
    loadPromise = fetch(bibleUrl)
      .then(res => {
         if (!res.ok) throw new Error("Failed to load bible.json");
         return res.json();
      })
      .then((data) => {
        cachedData = data as BibleData;
        return cachedData;
      });
  }
  return loadPromise;
}

const bookNameMap: Record<string, string> = {
  'gen': 'Genesis', 'ex': 'Exodus', 'exod': 'Exodus', 'lev': 'Leviticus', 'num': 'Numbers', 'deut': 'Deuteronomy',
  'josh': 'Joshua', 'judg': 'Judges', '1 sam': '1 Samuel', '2 sam': '2 Samuel',
  '1 kgs': '1 Kings', '2 kgs': '2 Kings', '1 chron': '1 Chronicles', '1 chr': '1 Chronicles',
  '2 chron': '2 Chronicles', '2 chr': '2 Chronicles', 'neh': 'Nehemiah', 'esth': 'Esther',
  'ps': 'Psalms', 'psalm': 'Psalms', 'prov': 'Proverbs', 'eccles': 'Ecclesiastes', 'ecc': 'Ecclesiastes',
  'song': 'Song of Solomon', 'isa': 'Isaiah', 'jer': 'Jeremiah', 'lam': 'Lamentations', 'ezek': 'Ezekiel',
  'dan': 'Daniel', 'hos': 'Hosea', 'obad': 'Obadiah', 'mic': 'Micah', 'nah': 'Nahum',
  'hab': 'Habakkuk', 'zeph': 'Zephaniah', 'hag': 'Haggai', 'zech': 'Zechariah', 'mal': 'Malachi',
  'matt': 'Matthew', 'mt': 'Matthew', 'mk': 'Mark', 'lk': 'Luke', 'jn': 'John',
  'rom': 'Romans', '1 cor': '1 Corinthians', '2 cor': '2 Corinthians', 'gal': 'Galatians',
  'eph': 'Ephesians', 'phil': 'Philippians', 'col': 'Colossians', '1 thess': '1 Thessalonians',
  '2 thess': '2 Thessalonians', '1 tim': '1 Timothy', '2 tim': '2 Timothy', 'tit': 'Titus',
  'philem': 'Philemon', 'heb': 'Hebrews', 'jas': 'James', '1 pet': '1 Peter', '2 pet': '2 Peter',
  '1 jn': '1 John', '2 jn': '2 John', '3 jn': '3 John', 'rev': 'Revelation'
};

export async function getPassageText(reference: string): Promise<string> {
  const data = await getBibleData();
  
  // Clean up reference: "Romans 9:22-23" or "Luke 16:29, 31"
  reference = reference.replace(/–/g, '-').trim();
  
  // Extract book and chapter/verses
  // Find the last alphabet character or the end of the book name
  // A good heuristic: split at the last space before the first number that has a colon next to it, or just find the first number preceded by a space and possibly followed by colon.
  const match = reference.match(/^(.+?)\s+(\d+:\d+.*)$/);
  
  if (!match) {
    // Maybe it's just a book and chapter like "Jude 6" -> match as \d+ without colon
    const chapterMatch = reference.match(/^(.+?)\s+(\d+.*)$/);
    if (!chapterMatch) return "Invalid reference.";
    
    let bookStr = chapterMatch[1].replace(/\.$/, '').trim();
    const verseStr = chapterMatch[2].trim();
    
    // Jude case etc. where the chapter might just be verses if it's a 1-chapter book
    const normalizedBook = bookNameMap[bookStr.toLowerCase()] || bookStr;
    const book = data.find(b => b.name.toLowerCase() === normalizedBook.toLowerCase());
    if (!book) return "Book not found.";
    
    // If book has only 1 chapter, treat the number as verse
    if (book.chapters.length === 1) {
       return getVersesFromChapter(book.chapters[0], verseStr);
    } else {
       return "Please provide verse numbers with a colon (e.g., 3:16).";
    }
  }

  let bookStr = match[1].replace(/\.$/, '').trim();
  const verseStr = match[2].trim(); // "16:29, 31"
  
  const normalizedBook = bookNameMap[bookStr.toLowerCase()] || bookStr;
  const book = data.find(b => b.name.toLowerCase() === normalizedBook.toLowerCase());
  if (!book) return "Book not found.";
  
  const colonIdx = verseStr.indexOf(':');
  const chapNum = parseInt(verseStr.substring(0, colonIdx), 10);
  const chapter = book.chapters[chapNum - 1]; // 0-indexed
  if (!chapter) return "Chapter not found.";
  
  const rest = verseStr.substring(colonIdx + 1); // "22-23" or "29, 31"
  
  return getVersesFromChapter(chapter, rest);
}

function getVersesFromChapter(chapter: string[], verseSelection: string): string {
  let inRange = false;
  let parsedVerses: number[] = [];
  let currentNumbers = [];
  let tokenRegex = /(\d+)(?:(\s*-\s*|\s*,\s*))?/g;
  let match;
  let lastNum = -1;
  
  while ((match = tokenRegex.exec(verseSelection)) !== null) {
      // Avoid infinite loops with zero-width matches
      if (match.index === tokenRegex.lastIndex) {
          tokenRegex.lastIndex++;
      }
      
      let num = parseInt(match[1]);
      if (inRange && lastNum !== -1) {
          for (let i = lastNum + 1; i <= num; i++) {
              parsedVerses.push(i);
          }
          inRange = false;
      } else {
          parsedVerses.push(num);
      }
      
      if (match[2] && match[2].includes('-')) {
          inRange = true;
      }
      lastNum = num;
  }
  
  parsedVerses = [...new Set(parsedVerses)].sort((a,b)=>a-b);
  
  if (parsedVerses.length === 0) return "Passage not found.";
  
  let resultText: string[] = [];
  for (const vNum of parsedVerses) {
    let text = chapter[vNum - 1];
    if (text) {
      // Clean KJV tags like {his} or {fitted: or, made up}
      // If it has a colon, it's a translation note, so we remove the whole bracket
      text = text.replace(/\{[^}]+:[^}]+\}/g, '');
      // Otherwise it's just italics formatting like {his}, so we just strip the brackets
      text = text.replace(/\{|\}/g, '');
      // Clean up multiple spaces that might result from stripping
      text = text.replace(/\s{2,}/g, ' ').trim();
      resultText.push(`[${vNum}] ${text}`);
    }
  }
  
  return resultText.join(' ');
}
