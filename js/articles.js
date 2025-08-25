/**
 * Articles.js
 *
 * Author: Jonathan CJ
 * Date: 2025-08-26
 * Version: 1.0.0
 *
 * This file contains the JavaScript code for handling articles on the website.
 * It uses the marked.js library to render Markdown content.
 * The articles data is loaded from an external JSON file.
 */
// Configuration for marked.js
marked.setOptions({
    breaks: true,
    gfm: true,
    smartypants: true
});

// Articles data will be loaded from external JSON file
let articles = [];

// Function to load articles from JSON file
async function loadArticlesData() {
    try {
        const response = await fetch('/data/articles.json');
        if (!response.ok) {
            throw new Error('Failed to load articles data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading articles data:', error);
        return [];
    }
}

// Function to load and display articles
async function loadArticles() {
    // Load articles data first
    articles = await loadArticlesData();
    
    if (articles.length === 0) {
        console.error('No articles found');
        return;
    }
    const articleList = document.getElementById('article-list');
    
    // If we're on the articles listing page
    if (articleList) {
        const listHTML = articles.map(article => `
            <article class="article-preview no-image article-preview-large">
                <div class="article-preview-content">
                    <a class="article-preview-link" href="/articles/${article.id}.html">
                        <h2 class="article-preview-title">${article.title}</h2>
                        <div class="article-excerpt">${article.description}</p>
                    </a>
                    <footer class="article-meta">
                        <time datetime="${article.date}">${new Date(article.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                    </footer>
                </div>
            </article>
        `).join('');
        
        articleList.innerHTML = listHTML;
    } 
    // If we're on an individual article page
    else if (window.location.pathname.includes('/articles/') && window.location.pathname !== '/articles/') {
        // Extract ID from /articles/{id}.html
        let last = window.location.pathname.split('/').pop();
        const articleId = last ? last.replace(/\.html$/i, '') : '';
        const article = articles.find(a => a.id === articleId);
        
        if (article) {
            try {
                const response = await fetch(`/articles/markdown/${article.file}`);
                const markdown = await response.text();
                const content = document.createElement('div');
                content.className = 'article-content';
                content.innerHTML = marked(markdown);
                
                // Add article header
                const header = document.createElement('header');
                header.innerHTML = `
                    <h1>${article.title}</h1>
                    <div class="article-meta">${new Date(article.date).toLocaleDateString()}</div>
                `;
                
                const container = document.querySelector('.article-container');
                container.innerHTML = '';
                container.appendChild(header);
                container.appendChild(content);
                
                // Add back button
                const backLink = document.createElement('a');
                backLink.href = '/articles/';
                backLink.className = 'back-link';
                backLink.textContent = '← Back to Articles';
                container.insertBefore(backLink, container.firstChild);
                
                // Update page title
                document.title = `${article.title} | Joonjavellana`;
                
                // Update meta tags for social sharing
                updateMetaTags(article);
                
            } catch (error) {
                console.error('Error loading article:', error);
                document.querySelector('.article-container').innerHTML = `
                    <div class="error">
                        <h1>Article Not Found</h1>
                        <p>Sorry, the requested article could not be found.</p>
                        <a href="/articles/" class="button">Back to Articles</a>
                    </div>
                `;
            }
        } else {
            document.querySelector('.article-container').innerHTML = `
                <div class="error">
                    <h1>Article Not Found</h1>
                    <p>Sorry, the requested article could not be found.</p>
                    <a href="/articles/" class="button">Back to Articles</a>
                </div>
            `;
        }
    }
}

// Function to update meta tags for social sharing
function updateMetaTags(article) {
    // Update Open Graph tags
    document.querySelector('meta[property="og:title"]').content = `${article.title} | Joonjavellana`;
    document.querySelector('meta[property="og:description"]').content = article.description;
    document.querySelector('meta[property="og:url"]').content = `https://jonathancj-portfolio.netlify.app/articles/${article.id}.html`;
    
    // Update Twitter card tags
    document.querySelector('meta[property="twitter:title"]').content = `${article.title} | Joonjavellana`;
    document.querySelector('meta[property="twitter:description"]').content = article.description;
    document.querySelector('meta[property="twitter:url"]').content = `https://jonathancj-portfolio.netlify.app/articles/${article.id}.html`;
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = `https://jonathancj-portfolio.netlify.app/articles/${article.id}.html`;
}

// Load articles when the page loads
document.addEventListener('DOMContentLoaded', loadArticles);

// Handle browser back/forward navigation
window.addEventListener('popstate', loadArticles);
