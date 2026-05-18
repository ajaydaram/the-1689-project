import fs from 'fs';

let content = fs.readFileSync('ch30-raw.md', 'utf-8');

// Superscript mapping
const superMap: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
};
content = content.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (match) => {
  let numStr = '';
  for (const char of match) {
    numStr += superMap[char];
  }
  return `[^${numStr}]`;
});

// Format footnotes
content = content.replace(/^\[\^(\d+)\]\s*(.*)$/gm, '[^$1]: $2');
content = content.replace(/^---$/gm, '');
content = content.replace(/\n{3,}/g, '\n\n');
content = content.replace(/^\s*\n\n###.*?\n\n/m, '');
content = content.replace(/^## He Is Here.*?\n/m, '');

// ConfessionBox substitution
content = content.replace(/\*\*[“"‘]([\s\S]*?)[”"’]\*\*(\[\^\d+\])?/g, '<ConfessionBox>\n"$1"\n</ConfessionBox>$2');

const frontmatter = `---
title: "He Is Here: Why the Lord's Supper Is the Believer's Spiritual Feast, Not a Repeated Sacrifice"
chapterNumber: 30
slug: "of-the-lords-supper"
description: "Explore Chapter 30 of the 1689 Confession, understanding the biblical shape, elements, real spiritual presence, and worthy reception of the Lord's supper."
---

# He Is Here: Why the Lord's Supper Is the Believer's Spiritual Feast, Not a Repeated Sacrifice

`;

content = frontmatter + content.trim() + '\n';

fs.writeFileSync('src/content/chapters/30-of-the-lords-supper.mdx', content);
console.log("Created 30-of-the-lords-supper.mdx");
