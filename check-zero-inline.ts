import fs from "fs";
import path from "path";

const dir = "src/content/chapters";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".mdx"));

for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f), "utf-8");
  const inlineMatch = content.match(/\[\^(\d+)\](?!\:)/g) || [];
  if (inlineMatch.length === 0) {
     console.log(`ZERO INLINE: ${f}`);
  }
}
