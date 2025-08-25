/**
 * Featured.js
 *
 * Author: Jonathan CJ
 * Date: 2025-08-26
 * Version: 1.0.0
 *
 * This file contains the JavaScript code for handling featured articles on the homepage.
 */

// Load and display featured articles on the homepage
document.addEventListener('DOMContentLoaded', function() {
    const featuredContainer = document.getElementById('featured-articles');
    
    if (!featuredContainer) return; // Exit if not on the homepage

    fetch('/articles/featured.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(articles => {
            // Clear any loading state
            featuredContainer.innerHTML = '';
            
            // Display the first three articles
            articles.slice(0, 3).forEach(article => {
                const articleElement = document.createElement('article');
                articleElement.className = 'article-card';
                articleElement.innerHTML = `
                    <div class="article-card-image">
                        <img src="${article.image}" alt="${article.title}" loading="lazy">
                    </div>
                    <div class="article-card-content">
                        <span class="article-category">${article.category}</span>
                        <h2>
                            <a href="/articles/post.html?id=${article.id}">${article.title}</a>
                        </h2>
                        <p class="article-excerpt">${article.description}</p>
                        <div class="article-meta">
                            <time datetime="${article.date}">${new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                            <span>•</span>
                            <span>${article.readTime}</span>
                        </div>
                    </div>
                `;
                featuredContainer.appendChild(articleElement);
            });
        })
        .catch(error => {
            console.error('Error loading featured articles:', error);
            featuredContainer.innerHTML = `
                <div class="error-message">
                    <p>Unable to load featured articles at the moment. Please try again later.</p>
                </div>
            `;
        });
});
