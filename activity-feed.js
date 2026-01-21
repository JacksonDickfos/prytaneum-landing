(function(){
  const DATA_URL = 'media.json';

  async function loadLatestTwo(){
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    const items = await res.json();
    items.sort((a,b)=> new Date(b.publishedAt) - new Date(a.publishedAt));
    return items.slice(0,2);
  }

  function updateCards(latest){
    // Keep the first card static. Replace the second and third with latest posts.
    const resources = document.querySelector('.resources-content');
    if (!resources) return;
    const slots = resources.querySelectorAll('.fund-links');
    // Expect at least 3 .fund-links blocks (1 static + 2 dynamic)
    if (slots.length < 3) return;

    for (let i=0; i<2; i++){
      const data = latest[i];
      const slot = slots[i+1]; // second and third
      if (!slot || !data) continue;
      const card = slot.querySelector('.fund-card');
      if (!card) continue;
      card.innerHTML = '';
      
      // Make entire card clickable if URL exists
      if (data.url){
        const url = data.url; // Capture URL in closure
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
          window.open(url, '_blank', 'noopener,noreferrer');
        });
      }
      
      if (data.image){
        const img = document.createElement('img');
        img.src = data.image; img.alt = data.title || 'Media item';
        card.appendChild(img);
      }
      if (data.description){
        const descP = document.createElement('p');
        descP.textContent = data.description;
        descP.style.display = '-webkit-box';
        descP.style.webkitLineClamp = '4';
        descP.style.webkitBoxOrient = 'vertical';
        descP.style.overflow = 'hidden';
        descP.style.textOverflow = 'ellipsis';
        card.appendChild(descP);
      }
    }
  }

  loadLatestTwo().then(updateCards).catch(console.error);
})();


