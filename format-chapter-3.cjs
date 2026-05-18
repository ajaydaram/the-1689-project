const fs = require('fs');

const fileContent = fs.readFileSync('./ch3.raw', 'utf8');

const superscripts = {
  '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4', 
  '⁵':'5', '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9'
};

let text = fileContent.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match) => {
  const num = match.split('').map(c => superscripts[c]).join('');
  return `[^${num}]`;
});

// Since the footnotes in the second format do not have brackets in the source like the previous one,
// let's look at the actual footnote lines in ch3.raw
// They look like: "¹ The 1689 Baptist Confession..." or "¹¹⁴ The prayer is original..."
// Let's replace those with standard markdown
text = text.replace(/^([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\s+/gm, (match, p1) => {
  const num = p1.split('').map(c => superscripts[c]).join('');
  return `[^${num}]: `;
});

const frontmatter = `---
title: "The Deepest Mystery and Sweetest Comfort: Why the Doctrine of God's Decree Is the Believer's Anchor"
chapterNumber: 3
slug: "gods-decree"
description: "Explore the eternal plan of God, the blueprint of all that comes to pass, in Chapter 3 of the 1689 Confession, balancing divine sovereignty and human responsibility."
---

`;

fs.writeFileSync('./src/content/chapters/03-gods-decree.mdx', frontmatter + text);
console.log('Successfully formatted chapter 3!');
