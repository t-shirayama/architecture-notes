import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const docsDir = path.join(root, "docs");
const mmdcPath = path.join(root, "node_modules", "@mermaid-js", "mermaid-cli", "src", "cli.js");
const puppeteerConfig = path.join(root, "mermaid-puppeteer-config.json");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "architecture-notes-mermaid-"));
const failures = [];

function walkMarkdownFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractMermaidBlocks(content) {
  const blocks = [];
  const pattern = /```mermaid\r?\n([\s\S]*?)```/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    blocks.push(match[1]);
  }

  return blocks;
}

if (!fs.existsSync(mmdcPath)) {
  console.error("Mermaid CLI が見つかりません。npm install を実行してください。");
  process.exit(1);
}

let index = 0;

for (const filePath of walkMarkdownFiles(docsDir)) {
  const relative = path.relative(root, filePath).replaceAll(path.sep, "/");
  const content = fs.readFileSync(filePath, "utf8");
  const blocks = extractMermaidBlocks(content);

  for (const [blockIndex, block] of blocks.entries()) {
    index += 1;
    const inputPath = path.join(tempDir, `${index}.mmd`);
    const outputPath = path.join(tempDir, `${index}.svg`);
    fs.writeFileSync(inputPath, block);

    const result = spawnSync(
      process.execPath,
      [mmdcPath, "-i", inputPath, "-o", outputPath, "-b", "transparent", "-p", puppeteerConfig],
      { encoding: "utf8" }
    );

    if (result.status !== 0) {
      const detail = result.stderr || result.stdout || result.error?.message || "詳細不明";
      failures.push(`${relative} の Mermaid ブロック ${blockIndex + 1} の構文確認に失敗しました。\n${detail}`);
    }
  }
}

fs.rmSync(tempDir, { recursive: true, force: true });

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Mermaid図の構文チェックに成功しました。");
