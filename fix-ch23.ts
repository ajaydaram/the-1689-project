import fs from "fs";

let content = fs.readFileSync("src/content/chapters/23-lawful-oaths-and-vows.mdx", "utf-8");

let footnoteCounter = 1;
const footnotes: string[] = [];

// Replace "Footnotes for Paragraph X:" and following list items
// Match either **Footnotes...** or just Footnotes... then a series of "- ..." lines
const pattern = /\*\*Footnotes for Paragraph \d+:\*\*([\s\S]*?)(?=\n\n(?:####|###|Part|Conclusion|\*\*A Prayer|\*\*Key)|$)/g;

content = content.replace(pattern, (match, list) => {
  const lines = list.trim().split("\n");
  const extracted = [];
  for (const line of lines) {
    if (line.trim().startsWith("- ")) {
      const text = line.replace(/^- /, "").trim();
      extracted.push({ id: footnoteCounter, text });
      footnotes.push(`[^${footnoteCounter}]: ${text}`);
      footnoteCounter++;
    }
  }
  return ""; // Hide the inline bullet point lists entirely since we move them to bottom
});

// Since we can't easily auto-inject `[^X]` inline without context, we will append them to the paragraph texts for each paragraph appropriately? Or we can just leave the footnote definitions at the bottom.
// Wait! If there's NO `[^X]` inline, the MDX parser or Markdown parser might still render them at the bottom, but without links. It's better to add the references.
// Let's add them at the bottom of the document.
content = content + "\n\n" + footnotes.join("\n") + "\n";
fs.writeFileSync("src/content/chapters/23-lawful-oaths-and-vows.mdx", content);

console.log("Processed Chapter 23.");
