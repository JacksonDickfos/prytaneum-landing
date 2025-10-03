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

  const toEmbedUrl = (url) => {
    // Accept full LinkedIn share URLs and convert to official embed URL
    // Examples:
    // https://www.linkedin.com/posts/..._activity-7378805658780930048-...
    // -> https://www.linkedin.com/embed/feed/update/urn:li:activity:7378805658780930048
    try {
      const idMatch = url.match(/activity-(\d+)/);
      if (idMatch && idMatch[1]) {
        return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${idMatch[1]}?compact=1`;
      }
    } catch (_) {}
    return null;
  };

  for (const postUrl of feedPosts) {
    const post = document.createElement('div');
    post.className = 'linkedin-post';

    const iframe = document.createElement('iframe');
    const embedUrl = toEmbedUrl(postUrl);
    iframe.src = embedUrl || postUrl;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.setAttribute('title', 'LinkedIn Post');
    iframe.setAttribute('allow', 'encrypted-media; clipboard-write; picture-in-picture; web-share');

    post.appendChild(iframe);
    list.appendChild(post);
  }
})();


