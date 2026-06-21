const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const www = path.join(root, "www");

const STATIC_FILES = [
  "app.js",
  "catalog-i18n.js",
  "i18n.js",
  "users-db.js",
  "styles.css",
  "manifest.webmanifest",
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else copyFile(from, to);
  }
}

if (fs.existsSync(www)) {
  fs.rmSync(www, { recursive: true, force: true });
}
ensureDir(www);

for (const file of fs.readdirSync(root)) {
  if (file.endsWith(".html")) {
    copyFile(path.join(root, file), path.join(www, file));
  }
}

for (const file of STATIC_FILES) {
  copyFile(path.join(root, file), path.join(www, file));
}

copyDir(path.join(root, "icons"), path.join(www, "icons"));

console.log("Web assets copied to www/");
