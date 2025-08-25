/*
 Simple static generator for per-article pages and sitemap.xml
 - Reads data/articles.json
 - Emits /articles/{id}.html with populated SEO meta tags
 - Regenerates /sitemap.xml including each article URL
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname ? path.join(__dirname, '..') : process.cwd();
const ARTICLES_JSON = path.join(ROOT, 'data', 'articles.json');
const ARTICLES_DIR = path.join(ROOT, 'articles');
const MARKDOWN_DIR = path.join(ARTICLES_DIR, 'markdown');
const SITEMAP_FILE = path.join(ROOT, 'sitemap.xml');

const BASE_URL = 'https://joonjavellana.com';

/**
 * Basic HTML escape
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDateForSitemap(str) {
  // Expecting YYYY-MM-DD; if invalid, fallback to today
  const d = new Date(str);
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function readArticles() {
  const raw = fs.readFileSync(ARTICLES_JSON, 'utf-8');
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) throw new Error('articles.json must be an array');
  return items;
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function buildArticleHtml({ id, title, description, image, file, date }) {
  const pageTitle = `${title} | Joonjavellana`;
  const url = `${BASE_URL}/articles/${id}`;
  const img = image || '/assets/img/001-mac.jpeg';
  const escapedTitle = escapeHtml(pageTitle);
  const escapedDesc = escapeHtml(description || '');

  // Note: Body content uses client-side marked to render markdown for simplicity; meta is server-side.
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle}</title>
  <link rel="stylesheet" href="../css/global.css">
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/articles.css">
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <meta property="og:title" content="${escapedTitle}">
  <meta property="og:description" content="${escapedDesc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${img}">
  <meta name="twitter:card" content="summary_large_image">
  <meta property="twitter:title" content="${escapedTitle}">
  <meta property="twitter:description" content="${escapedDesc}">
  <meta property="twitter:url" content="${url}">
  <meta property="twitter:image" content="${img}">
  <link rel="canonical" href="${url}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <nav class="navbar">
    <div class="container">
      <a href="/" class="logo underline-none uppercase text-bold">Joonjavellana</a>
      <ul class="nav-links">
        <li><a href="/" class="text-bold">Home</a></li>
        <li><a href="/#about" class="text-bold">About</a></li>
        <li><a href="/#projects" class="text-bold">Projects</a></li>
        <li><a href="/articles/" class="text-bold active">Articles</a></li>
      </ul>
    </div>
  </nav>

  <main class="container article-list article-container max-w-screen-md lg:max-w-screen-lg">
    <section class="p-8 px-2 md:px-3 lg:px-4 relative">
      <div class="flex justify-between mb-4">
        <button onclick="window.history.back()" class="btn btn-primary px-4 py-2 mt-4">
            &larr; <span class="text-lg">Back</span>
        </button>
        <button onclick="window.location.href='/articles/'" class="btn btn-primary px-4 py-2 mt-4">
            <span class="text-lg">Articles</span>
        </button>
      </div>
      <article class="article-preview">
        <header>
          <h1>${escapeHtml(title)}</h1>
          <div class="article-meta">${escapeHtml(new Date(date).toLocaleDateString())}</div>
        </header>
        <div id="article-body" class="article-body article-content"></div>
      </article>
      <div id="article-meta" class="article-meta"></div>
      <div id="article-comments" class="article-comments"></div>
    </section>
    <div class="flex justify-center">
      <a href="/articles/" class="btn btn-primary px-4 py-2 mt-4">&larr; <span class="text-lg">More Articles</span></a>
    </div>
  </main>

  <footer class="main-footer">
    <div class="container">
      <p><a href="https://joonjavellana.com/">Joonjavellana</a> &copy; 2025</p>
    </div>
  </footer>

  <script>
    (function(){
      const mdPath = '/articles/markdown/${file}';
      const articleBody = document.getElementById('article-body');
      const showError = (msg) => { articleBody.innerHTML = '<p>' + msg + '</p>'; };

      fetch(mdPath)
        .then(r => { if (!r.ok) throw new Error('Failed to fetch markdown'); return r.text(); })
        .then(txt => { if (!txt.trim()) throw new Error('Empty markdown'); articleBody.innerHTML = marked.parse(txt); })
        .catch(err => { console.error(err); showError('This post has been removed or failed to load.'); });
    })();
  </script>
</body>
</html>`;
}

function writeArticles(pages) {
  pages.forEach(p => {
    const outPath = path.join(ARTICLES_DIR, `${p.id}.html`);
    fs.writeFileSync(outPath, buildArticleHtml(p), 'utf-8');
    console.log('Generated', outPath);
  });
}

function buildSitemap(pages) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${BASE_URL}/`, lastmod: today, changefreq: 'weekly', priority: '1.0' },
    { loc: `${BASE_URL}/projects`, lastmod: today, changefreq: 'monthly', priority: '0.8' },
    { loc: `${BASE_URL}/articles`, lastmod: today, changefreq: 'monthly', priority: '0.8' },
    ...pages.map(p => ({
      loc: `${BASE_URL}/articles/${p.id}`,
      lastmod: formatDateForSitemap(p.date),
      changefreq: 'monthly',
      priority: '0.7'
    }))
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(u => (
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )),
    '</urlset>',
    ''
  ].join('\n');

  fs.writeFileSync(SITEMAP_FILE, xml, 'utf-8');
  console.log('Updated', SITEMAP_FILE);
}

function main() {
  ensureDir(ARTICLES_DIR);
  ensureDir(MARKDOWN_DIR);
  const articles = readArticles();
  writeArticles(articles);
  buildSitemap(articles);
}

if (require.main === module) {
  main();
}
