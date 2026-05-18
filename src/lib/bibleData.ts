export type BibleBook = {
  abbrev: string;
  chapters: string[][];
}

export type BibleData = BibleBook[];

let cachedData: BibleData | null = null;
let loadPromise: Promise<BibleData> | null = null;

export async function getBibleData(): Promise<BibleData> {
  if (cachedData) return cachedData;
  if (!loadPromise) {
    loadPromise = fetch('/bible.json')
      .then(res => {
         if (!res.ok) throw new Error("Failed to load bible.json");
         return res.text();
      })
      .then(text => {
         // Handle potential BOM issue
         if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
         return JSON.parse(text);
      })
      .then((data) => {
        cachedData = data as BibleData;
        return cachedData;
      });
  }
  return loadPromise;
}

const abbrevMap: Record<string, string> = {
  'genesis': 'gn', 'gen': 'gn',
  'exodus': 'ex', 'exod': 'ex',
  'leviticus': 'lv', 'lev': 'lv',
  'numbers': 'nm', 'num': 'nm',
  'deuteronomy': 'dt', 'deut': 'dt',
  'joshua': 'js', 'josh': 'js',
  'judges': 'jud', 'judg': 'jud',
  'ruth': 'rt',
  '1 samuel': '1sm', '1 sam': '1sm',
  '2 samuel': '2sm', '2 sam': '2sm',
  '1 kings': '1kgs', '1 kgs': '1kgs',
  '2 kings': '2kgs', '2 kgs': '2kgs',
  '1 chronicles': '1ch', '1 chron': '1ch', '1 chr': '1ch',
  '2 chronicles': '2ch', '2 chron': '2ch', '2 chr': '2ch',
  'ezra': 'ezr',
  'nehemiah': 'ne', 'neh': 'ne',
  'esther': 'et', 'esth': 'et',
  'job': 'job',
  'psalms': 'ps', 'psalm': 'ps',
  'proverbs': 'prv', 'prov': 'prv',
  'ecclesiastes': 'ec', 'eccles': 'ec', 'ecc': 'ec',
  'song of solomon': 'so', 'song': 'so',
  'isaiah': 'is', 'isa': 'is',
  'jeremiah': 'jr', 'jer': 'jr',
  'lamentations': 'lm', 'lam': 'lm',
  'ezekiel': 'ez', 'ezek': 'ez',
  'daniel': 'dn', 'dan': 'dn',
  'hosea': 'ho', 'hos': 'ho',
  'joel': 'jl',
  'amos': 'am',
  'obadiah': 'ob', 'obad': 'ob',
  'jonah': 'jn',
  'micah': 'mi', 'mic': 'mi',
  'nahum': 'na', 'nah': 'na',
  'habakkuk': 'hk', 'hab': 'hk',
  'zephaniah': 'zp', 'zeph': 'zp',
  'haggai': 'hg', 'hag': 'hg',
  'zechariah': 'zc', 'zech': 'zc',
  'malachi': 'ml', 'mal': 'ml',
  'matthew': 'mt', 'matt': 'mt', 'mt': 'mt',
  'mark': 'mk',
  'luke': 'lk',
  'john': 'jo', 'jn': 'jo',
  'acts': 'act',
  'romans': 'rm', 'rom': 'rm',
  '1 corinthians': '1co', '1 cor': '1co',
  '2 corinthians': '2co', '2 cor': '2co',
  'galatians': 'gl', 'gal': 'gl',
  'ephesians': 'eph',
  'philippians': 'ph', 'phil': 'ph',
  'colossians': 'cl', 'col': 'cl',
  '1 thessalonians': '1ts', '1 thess': '1ts',
  '2 thessalonians': '2ts', '2 thess': '2ts',
  '1 timothy': '1tm', '1 tim': '1tm',
  '2 timothy': '2tm', '2 tim': '2tm',
  'titus': 'tt', 'tit': 'tt',
  'philemon': 'phm', 'philem': 'phm',
  'hebrews': 'hb', 'heb': 'hb',
  'james': 'jm', 'jas': 'jm',
  '1 peter': '1pe', '1 pet': '1pe',
  '2 peter': '2pe', '2 pet': '2pe',
  '1 john': '1jo', '1 jn': '1jo',
  '2 john': '2jo', '2 jn': '2jo',
  '3 john': '3jo', '3 jn': '3jo',
  'jude': 'jd',
  'revelation': 're', 'rev': 're'
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
    const abbrev = abbrevMap[bookStr.toLowerCase()] || bookStr.toLowerCase();
    const book = data.find(b => b.abbrev === abbrev);
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
  
  const abbrev = abbrevMap[bookStr.toLowerCase()] || bookStr.toLowerCase();
  const book = data.find(b => b.abbrev === abbrev);
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
