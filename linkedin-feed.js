// Minimal client-side LinkedIn post embed renderer (no API keys). 
// Provide full public post URLs in the 'feedPosts' array.

(function renderLinkedInFeed() {
  const container = document.getElementById('linkedin-feed');
  if (!container) return;

  // Public post URLs from the company page (must be publicly viewable)
  const feedPosts = [
    'https://www.linkedin.com/posts/prytaneum-partners_activity-7378805658780930048-_bo9?utm_source=share&utm_medium=member_desktop&rcm=ACoAACSdvxYB_oO5QZzqutM6EFu_vHX-AsZmsVo',
    'https://www.linkedin.com/posts/prytaneum-partners_activity-7376996483822182400-bU0n?utm_source=share&utm_medium=member_desktop&rcm=ACoAACSdvxYB_oO5QZzqutM6EFu_vHX-AsZmsVo',
    'https://www.linkedin.com/posts/prytaneum-partners_activity-7375553970901090304-4Lel?utm_source=share&utm_medium=member_desktop&rcm=ACoAACSdvxYB_oO5QZzqutM6EFu_vHX-AsZmsVo'
  ];

  if (!Array.isArray(feedPosts) || feedPosts.length === 0) {
    const info = document.createElement('div');
    info.className = 'feed-empty';
    info.textContent = 'LinkedIn posts will appear here.';
    container.appendChild(info);
    return;
  }

  const list = document.createElement('div');
  list.className = 'feed-list';
  container.appendChild(list);

  for (const postUrl of feedPosts) {
    const post = document.createElement('div');
    post.className = 'linkedin-post';

    // LinkedIn supports oEmbed for public posts via iframe embed endpoints in limited contexts.
    // We will use a generic iframe. Many public post URLs allow embedding via <iframe src=postUrl> when X-Frame-Options permit.
    // If a post blocks embedding, replace with screenshot or use a third-party service.
    const iframe = document.createElement('iframe');
    iframe.src = postUrl;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';

    post.appendChild(iframe);
    list.appendChild(post);
  }
})();


