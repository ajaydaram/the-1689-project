import fs from 'fs';

let content = fs.readFileSync('ch32-raw.md', 'utf-8');

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
content = content.replace(/^## The Day That Rights Every Wrong.*?\n/m, '');

// ConfessionBox substitution
content = content.replace(/\*\*[“"‘]([\s\S]*?)[”"’]\*\*(\[\^\d+\])?/g, '<ConfessionBox>\n"$1"\n</ConfessionBox>$2');

const frontmatter = `---
title: "The Day That Rights Every Wrong: Why the Last Judgment Is the Believer's Hope and the Unbeliever's Fear"
chapterNumber: 32
slug: "of-the-last-judgment"
description: "Explore Chapter 32 of the 1689 Confession, understanding the certainty, nature, purpose, and present impact of the last judgment."
---

# The Day That Rights Every Wrong: Why the Last Judgment Is the Believer's Hope and the Unbeliever's Fear

`;

content = frontmatter + content.trim() + '\n';

fs.writeFileSync('src/content/chapters/32-of-the-last-judgment.mdx', content);
console.log("Created 32-of-the-last-judgment.mdx");
