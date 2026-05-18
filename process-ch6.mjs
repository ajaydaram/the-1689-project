import fs from 'fs';

let content = fs.readFileSync('ch6-raw.md', 'utf-8');

// The superscript mapping
const superMap = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
};

// 1. Replace superscripts like ¹⁰⁰ with [^100]
content = content.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (match) => {
  let numStr = '';
  for (const char of match) {
    numStr += superMap[char];
  }
  return `[^${numStr}]`;
});

// 2. Format the footnotes
content = content.replace(/^\[\^(\d+)\]\s+(.*)$/gm, '[^$1]: $2');

// 3. Remove "---", "**Footnotes for...", and "---" around footnotes
content = content.replace(/^---$/gm, '');
content = content.replace(/^\*\*Footnotes.*$/gm, '');

// Clean up extra blank lines
content = content.replace(/\n{3,}/g, '\n\n');

// 4. Wrap Confession text
const paragraphs = [
  `**"Although God created man upright and perfect, and gave him a righteous law, which had been unto life had he kept it, and threatened death upon the breach thereof, yet he did not long abide in this honour; Satan using the subtilty of the serpent to seduce Eve, then by her seducing Adam, who, without any compulsion, did wilfully transgress the law of their creation, and the command given to them, in eating the forbidden fruit, which God was pleased, according to his wise and holy counsel to permit, having purposed to order it to his own glory."**[^6]`,
  `**"Our first parents, by this sin, fell from their original righteousness and communion with God, and we in them whereby death came upon all: all becoming dead in sin, and wholly defiled in all the faculties and parts of soul and body."**[^23]`,
  `**"They being the root, and by God's appointment, standing in the room and stead of all mankind, the guilt of the sin was imputed, and corrupted nature conveyed, to all their posterity descending from them by ordinary generation, being now conceived in sin, and by nature children of wrath, the servants of sin, the subjects of death, and all other miseries, spiritual, temporal, and eternal, unless the Lord Jesus set them free."**[^35]`,
  `**"From this original corruption, whereby we are utterly indisposed, disabled, and made opposite to all good, and wholly inclined to all evil, do proceed all actual transgressions."**[^51]`,
  `**"The corruption of nature, during this life, does remain in those that are regenerated; and although it be through Christ pardoned and mortified, yet both itself, and the first motions thereof, are truly and properly sin."**[^63]`,
  `**"Every sin, both original and actual, being a transgression of the righteous law of God, and contrary thereunto, doth, in its own nature, bring guilt upon the sinner, whereby he is bound over to the wrath of God, and curse of the law, and so made subject to death, with all miseries spiritual, temporal, and eternal."**[^72]`
];

for (const p of paragraphs) {
    content = content.replace(p, '<ConfessionBox>\n' + p + '\n</ConfessionBox>');
}

// 5. Add frontmatter
const frontmatter = `---
title: "The Universal Tragedy: Why Original Sin Is the Doctrine Only the Gospel Can Answer"
chapterNumber: 6
slug: "fall-of-man"
description: "Explore Chapter 6 of the 1689 Confession, navigating the devastating reality of original sin and its universal consequences."
---
`;

content = frontmatter + '# ' + content.slice(2).trim() + '\n';

fs.writeFileSync('src/content/chapters/06-fall-of-man.mdx', content);
console.log("Created 06-fall-of-man.mdx");
