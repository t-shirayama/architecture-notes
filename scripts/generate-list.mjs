import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "docs");
const outputPath = path.join(docsDir, "一覧.md");
const checkOnly = process.argv.includes("--check");

const categoryOrder = [
  "レイヤー・責務分離系",
  "分散システム系",
  "データ・更新モデル系",
  "フロントエンド系",
  "エンタープライズ統合・連携系",
  "インフラ・運用系",
  "セキュリティ・信頼性系"
];

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function encodeLinkTarget(fileName) {
  return fileName.replaceAll(" ", "%20");
}

function decodeLinkTarget(target) {
  return target.replaceAll("%20", " ");
}

function extractCategoryDocuments(category) {
  const categoryDir = path.join(docsDir, category);
  const readmePath = path.join(categoryDir, "README.md");
  const readme = readUtf8(readmePath);
  const links = [];
  const linkPattern = /\[([^\]]+)\]\(\.\/([^)]+\.md)\)/g;
  let match;

  while ((match = linkPattern.exec(readme)) !== null) {
    const [, title, target] = match;
    if (target === "README.md") {
      continue;
    }

    const decodedTarget = decodeLinkTarget(target);
    if (fs.existsSync(path.join(categoryDir, decodedTarget))) {
      links.push({ title, target: encodeLinkTarget(decodedTarget) });
    }
  }

  return links;
}

function buildList() {
  const lines = [
    "# アーキテクチャ一覧",
    "",
    "このページは、リポジトリ内のアーキテクチャ文書を横断して探すための入口です。",
    "",
    "各文書の概要や比較の早見表は、カテゴリ配下の `README.md` を正とします。説明文の重複を避けるため、このページでは個別文書へのリンクを中心にまとめます。",
    ""
  ];

  for (const category of categoryOrder) {
    lines.push(`## ${category}`, "");
    lines.push(`カテゴリ概要: [${category} README](./${category}/README.md)`, "");
    lines.push("| 文書 |", "| --- |");

    for (const doc of extractCategoryDocuments(category)) {
      lines.push(`| [${doc.title}](./${category}/${doc.target}) |`);
    }

    lines.push("");
  }

  lines.push(
    "## 参考",
    "",
    "- 各カテゴリREADMEの作成済みドキュメント一覧をもとに作成。",
    ""
  );

  return lines.join("\n");
}

const expected = buildList();

if (checkOnly) {
  const actual = fs.existsSync(outputPath) ? readUtf8(outputPath) : "";
  if (actual !== expected) {
    console.error("docs/一覧.md がカテゴリREADMEと同期していません。npm run docs:list を実行してください。");
    process.exit(1);
  }

  console.log("docs/一覧.md はカテゴリREADMEと同期しています。");
} else {
  fs.writeFileSync(outputPath, expected);
  console.log("docs/一覧.md を更新しました。");
}
