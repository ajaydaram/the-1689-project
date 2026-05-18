import { visit } from 'unist-util-visit';

const bookNames = [
  'Genesis', 'Gen\\.', 'Gen', 'Exodus', 'Exod\\.', 'Exod', 'Ex', 'Leviticus', 'Lev\\.', 'Lev', 'Numbers', 'Num\\.', 'Num', 'Deuteronomy', 'Deut\\.', 'Deut', 'Joshua', 'Josh\\.', 'Josh', 'Judges', 'Judg\\.', 'Judg', 'Ruth',
  '1 Samuel', '1 Sam\\.', '1 Sam', '2 Samuel', '2 Sam\\.', '2 Sam', '1 Kings', '1 Kgs\\.', '1 Kgs', '2 Kings', '2 Kgs\\.', '2 Kgs', '1 Chronicles', '1 Chron\\.', '1 Chron', '1 Chr\\.', '1 Chr', '2 Chronicles', '2 Chron\\.', '2 Chron', '2 Chr\\.', '2 Chr', 'Ezra',
  'Nehemiah', 'Neh\\.', 'Neh', 'Esther', 'Esth\\.', 'Esth', 'Job', 'Psalm', 'Psalms', 'Ps\\.', 'Ps', 'Proverbs', 'Prov\\.', 'Prov', 'Ecclesiastes', 'Eccles\\.', 'Eccles', 'Ecc\\.', 'Ecc', 'Song of Solomon', 'Song',
  'Isaiah', 'Isa\\.', 'Isa', 'Jeremiah', 'Jer\\.', 'Jer', 'Lamentations', 'Lam\\.', 'Lam', 'Ezekiel', 'Ezek\\.', 'Ezek', 'Daniel', 'Dan\\.', 'Dan', 'Hosea', 'Hos\\.', 'Hos', 'Joel', 'Amos',
  'Obadiah', 'Obad\\.', 'Obad', 'Jonah', 'Micah', 'Mic\\.', 'Mic', 'Nahum', 'Nah\\.', 'Nah', 'Habakkuk', 'Hab\\.', 'Hab', 'Zephaniah', 'Zeph\\.', 'Zeph', 'Haggai', 'Hag\\.', 'Hag', 'Zechariah', 'Zech\\.', 'Zech',
  'Malachi', 'Mal\\.', 'Mal', 'Matthew', 'Matt\\.', 'Matt', 'Mt\\.', 'Mt', 'Mark', 'Mk\\.', 'Mk', 'Luke', 'Lk\\.', 'Lk', 'John', 'Jn\\.', 'Jn', 'Acts', 'Romans', 'Rom\\.', 'Rom', '1 Corinthians', '1 Cor\\.', '1 Cor',
  '2 Corinthians', '2 Cor\\.', '2 Cor', 'Galatians', 'Gal\\.', 'Gal', 'Ephesians', 'Eph\\.', 'Eph', 'Philippians', 'Phil\\.', 'Phil', 'Colossians', 'Col\\.', 'Col', '1 Thessalonians', '1 Thess\\.', '1 Thess',
  '2 Thessalonians', '2 Thess\\.', '2 Thess', '1 Timothy', '1 Tim\\.', '1 Tim', '2 Timothy', '2 Tim\\.', '2 Tim', 'Titus', 'Tit\\.', 'Tit', 'Philemon', 'Philem\\.', 'Philem', 'Hebrews', 'Heb\\.', 'Heb', 'James', 'Jas\\.', 'Jas',
  '1 Peter', '1 Pet\\.', '1 Pet', '2 Peter', '2 Pet\\.', '2 Pet', '1 John', '1 Jn\\.', '1 Jn', '2 John', '2 Jn\\.', '2 Jn', '3 John', '3 Jn\\.', '3 Jn', 'Jude', 'Revelation', 'Rev\\.', 'Rev'
];

export default function remarkBibleVerses() {
  const booksRegex = bookNames.join('|');
  // Matches "Romans 9:22-23", "2 Timothy 3:15", "Jude 6", "Luke 16:29, 31".
  // Restricts verse separators to comma or dash to prevent swallowing books like "Jude 6; 2 Cor..."
  const regex = new RegExp(`\\b(?:${booksRegex})\\s+\\d+(?::\\d+)?(?:(?:[,]\\s*|[\\-–]\\s*)\\d+)*\\b`, 'gi');

  return (tree: any) => {
    visit(tree, 'text', (node: any, index: number | undefined, parent: any) => {
      // Don't parse text inside links to avoid breaking markdown links
      if (!parent || parent.type === 'link' || parent.type === 'heading') return;

      const value = node.value;
      const matches = [];
      let match;
      regex.lastIndex = 0;
      
      while ((match = regex.exec(value)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          text: match[0]
        });
      }

      if (matches.length === 0 || typeof index !== 'number') return;

      const children = [];
      let lastIndex = 0;

      for (const m of matches) {
        if (m.index > lastIndex) {
          children.push({ type: 'text', value: value.slice(lastIndex, m.index) });
        }
        children.push({
          type: 'text',
          value: m.text,
          data: {
            hName: 'span',
            hProperties: { className: 'bible-verse-hover', 'data-verse': m.text }
          }
        });
        lastIndex = m.index + m.length;
      }

      if (lastIndex < value.length) {
        children.push({ type: 'text', value: value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...children);
      
      // Return skip so we don't visit the newly inserted text nodes and infinite loop
      return index + children.length;
    });
  };
}
