(function(){
  const DATA_URL = 'media.json';

  async function loadPosts(){
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    const items = await res.json();
    // newest first by publishedAt
    items.sort((a,b)=> new Date(b.publishedAt) - new Date(a.publishedAt));
    return items;
  }

  function renderList(items){
    const list = document.getElementById('media-list');
    if (!list) return;
    list.innerHTML = '';
    items.forEach(item => {
      const cardWrap = document.createElement('div');
      cardWrap.className = 'fund-links';
      const card = document.createElement('div');
      card.className = 'fund-card';
      if (item.image) {
        const img = document.createElement('img');
        img.src = item.image; img.alt = item.title || 'Media item';
        card.appendChild(img);
      }
      const p = document.createElement('p');
      if (item.url) {
        const a = document.createElement('a');
        a.href = item.url; a.textContent = item.title || 'View post';
        a.className = 'card-link';
        p.appendChild(a);
      } else {
        p.textContent = item.title || '';
      }
      card.appendChild(p);
      cardWrap.appendChild(card);
      list.appendChild(cardWrap);
    });
  }

  // simple client-side "storage" for demo: updates media.json via webhook
  async function appendPostClient(item){
    // For real deployments, use a serverless function or n8n webhook to persist.
    // This demo just posts to an n8n webhook if configured via window.N8N_WEBHOOK_URL
    if (window.N8N_WEBHOOK_URL) {
      await fetch(window.N8N_WEBHOOK_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    } else {
      alert('Set window.N8N_WEBHOOK_URL to enable saving via n8n webhook.');
    }
  }

  function wireForm(){
    const form = document.getElementById('mediaForm');
    if (!form) return;
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const title = document.getElementById('title').value.trim();
      const url = document.getElementById('url').value.trim();
      const image = document.getElementById('image').value.trim();
      const item = {
        id: Date.now().toString(),
        title, url, image,
        publishedAt: new Date().toISOString()
      };
      await appendPostClient(item);
      // Reload list (if webhook writes immediately to media.json via backend)
      try { const items = await loadPosts(); renderList(items); } catch {}
      form.reset();
    });
  }

  // init
  loadPosts().then(renderList).catch(console.error);
  wireForm();
})();


