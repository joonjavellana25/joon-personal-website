// Configuration for marked.js
marked.setOptions({
    breaks: true,
    gfm: true,
    smartypants: true
});

// Article data - add your markdown files here
const articles = [
    {
        id: 'how-coding-saved-me',
        title: 'How Coding Saved Me from Myself',
        date: '2024-08-23',
        description: 'A personal journey of finding purpose and healing through code and faith.',
        file: 'how-coding-saved-me.md'
    },
    {
        id: 'getting-started',
        title: 'Getting Started with Web Development',
        date: '2024-08-23',
        description: 'A beginner\'s guide to starting your web development journey.',
        file: 'getting-started.md'
    }
];

// Function to load and display articles
async function loadArticles() {
    const articleList = document.getElementById('article-list');
    
    // If we're on the articles listing page
    if (articleList) {
        const listHTML = articles.map(article => `
            <article class="article-preview">
                <h2><a href="/articles/${article.id}">${article.title}</a></h2>
                <div class="article-meta">${new Date(article.date).toLocaleDateString()}</div>
                <p>${article.description}</p>
                <a href="/articles/${article.id}" class="read-more">Read more →</a>
            </article>
        `).join('');
        
        articleList.innerHTML = listHTML;
    } 
    // If we're on an individual article page
    else if (window.location.pathname.includes('/articles/') && window.location.pathname !== '/articles/') {
        const articleId = window.location.pathname.split('/').pop();
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
    document.querySelector('meta[property="og:url"]').content = `https://joonjavellana.com/articles/${article.id}`;
    
    // Update Twitter card tags
    document.querySelector('meta[property="twitter:title"]').content = `${article.title} | Joonjavellana`;
    document.querySelector('meta[property="twitter:description"]').content = article.description;
    document.querySelector('meta[property="twitter:url"]').content = `https://joonjavellana.com/articles/${article.id}`;
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = `https://joonjavellana.com/articles/${article.id}`;
}

// Load articles when the page loads
document.addEventListener('DOMContentLoaded', loadArticles);

// Handle browser back/forward navigation
window.addEventListener('popstate', loadArticles);
