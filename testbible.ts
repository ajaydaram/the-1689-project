import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/bible.json', 'utf-8'));
console.log("Total books:", data.length);
console.log("Book 1:", data[0].name, data[0].abbrev);
console.log("Chapters in Book 1:", data[0].chapters.length);
console.log("Verses in Ch 1:", data[0].chapters[0].length);
console.log("Example verse:", data[0].chapters[0][0]);
