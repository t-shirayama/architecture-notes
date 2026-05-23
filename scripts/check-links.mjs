import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import markdownLinkCheck from "markdown-link-check";

const root = process.cwd();
const configPath = path.join(root, ".markdown-link-check.json");
const baseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

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

function checkMarkdown(content, config) {
  return new Promise((resolve, reject) => {
    markdownLinkCheck(content, config, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

const files = [
  path.join(root, "README.md"),
  ...walkMarkdownFiles(path.join(root, "docs"))
];

const failures = [];

for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf8");
  const config = {
    ...baseConfig,
    baseUrl: pathToFileURL(path.dirname(filePath) + path.sep).href
  };
  const results = await checkMarkdown(content, config);

  for (const result of results) {
    if (result.status === "dead") {
      failures.push(`${path.relative(root, filePath)}: ${result.link} (${result.statusCode ?? "dead"})`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Markdownリンクのチェックに成功しました。");
