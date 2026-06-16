const fs = require("fs");
const path = require("path");

const root = __dirname;
const out = path.join(root, "dist");

const files = [
  "index.html",
  "about.html",
  "services.html",
  "subsidy.html",
  "business.html",
  "gallery.html",
  "contact.html",
  "login.html",
  "signup.html",
  "affiliate-panel.html",
  "vendor-panel.html",
  "admin-panel.html",
  "favicon.png",
];

function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(out, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const file of files) {
  copyFile(file);
}

fs.cpSync(path.join(root, "assets"), path.join(out, "assets"), {
  recursive: true,
});

console.log("Static site built in dist/");
