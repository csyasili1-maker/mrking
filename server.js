const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ttf": "font/ttf",
};

function send(res, file) {
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}

function safeJoin(urlPath) {
  const cleanPath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const requested = path.join(root, cleanPath);
  return requested.startsWith(root) ? requested : null;
}

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const requested = safeJoin(urlPath);

    if (requested && fs.existsSync(requested) && fs.statSync(requested).isFile()) {
      send(res, requested);
      return;
    }

    if (requested && !path.extname(requested)) {
      const htmlPage = `${requested}.html`;
      const indexPage = path.join(requested, "index.html");

      if (fs.existsSync(htmlPage) && fs.statSync(htmlPage).isFile()) {
        send(res, htmlPage);
        return;
      }

      if (fs.existsSync(indexPage) && fs.statSync(indexPage).isFile()) {
        send(res, indexPage);
        return;
      }
    }

    send(res, path.join(root, "index.html"));
  })
  .listen(port, () => {
    console.log(`Mr king site running at http://localhost:${port}/homevideo`);
  });
