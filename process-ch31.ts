import fs from 'fs';

let content = fs.readFileSync('ch31-raw.md', 'utf-8');

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
content = content.replace(/^## Anchored in Eternity.*?\n/m, '');

// ConfessionBox substitution
content = content.replace(/\*\*[“"‘]([\s\S]*?)[”"’]\*\*(\[\^\d+\])?/g, '<ConfessionBox>\n"$1"\n</ConfessionBox>$2');

const frontmatter = `---
title: "Anchored in Eternity: Why the State After Death and the Resurrection Are the Believer's Sure Hope"
chapterNumber: 31
slug: "of-the-state-of-man-after-death-and-of-the-resurrection-of-the-dead"
description: "Explore Chapter 31 of the 1689 Confession, understanding the intermediate state, resurrection of the body, and the final state of all humanity."
---

# Anchored in Eternity: Why the State After Death and the Resurrection Are the Believer's Sure Hope

`;

content = frontmatter + content.trim() + '\n';

fs.writeFileSync('src/content/chapters/31-of-the-state-of-man-after-death-and-of-the-resurrection-of-the-dead.mdx', content);
console.log("Created 31-of-the-state-of-man-after-death-and-of-the-resurrection-of-the-dead.mdx");
