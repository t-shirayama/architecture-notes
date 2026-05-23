import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "docs");
const errors = [];
const excludedSupportDocs = new Set([
  "README.md",
  "比較.md"
]);
const excludedSupportSuffixes = [
  "_notes.md",
  "_examples.md"
];

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

function toPosixRelative(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function isCategoryDir(dirPath) {
  return path.dirname(dirPath) === docsDir;
}

function isArchitectureDoc(filePath) {
  return path.dirname(path.dirname(filePath)) === docsDir && !isSupportDoc(path.basename(filePath));
}

function isSupportDoc(fileName) {
  return excludedSupportDocs.has(fileName) || excludedSupportSuffixes.some((suffix) => fileName.endsWith(suffix));
}

function linkTargetFor(fileName) {
  return fileName.replaceAll(" ", "%20");
}

for (const entry of fs.readdirSync(docsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) {
    continue;
  }

  const categoryDir = path.join(docsDir, entry.name);
  if (!isCategoryDir(categoryDir)) {
    continue;
  }

  const readmePath = path.join(categoryDir, "README.md");
  if (!fs.existsSync(readmePath)) {
    errors.push(`${toPosixRelative(categoryDir)} に README.md がありません。`);
    continue;
  }

  const readme = fs.readFileSync(readmePath, "utf8");
  const docs = fs.readdirSync(categoryDir, { withFileTypes: true })
    .filter((child) => child.isFile() && child.name.endsWith(".md") && !isSupportDoc(child.name))
    .map((child) => child.name);

  for (const doc of docs) {
    const rawLink = `./${doc}`;
    const encodedLink = `./${linkTargetFor(doc)}`;
    if (!readme.includes(rawLink) && !readme.includes(encodedLink)) {
      errors.push(`${toPosixRelative(readmePath)} から ${doc} へのリンクが見つかりません。`);
    }
  }
}

for (const filePath of walkMarkdownFiles(docsDir).filter(isArchitectureDoc)) {
  const content = fs.readFileSync(filePath, "utf8");
  const relative = toPosixRelative(filePath);

  if (!/^## 参考$/m.test(content)) {
    errors.push(`${relative} に "## 参考" がありません。`);
  }

  if (!content.includes("```mermaid")) {
    errors.push(`${relative} に Mermaid 図がありません。`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("ドキュメント構造の簡易チェックに成功しました。");
