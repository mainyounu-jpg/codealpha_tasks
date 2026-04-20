const PICSUM_SEEDS = [
    {seed:'aurora',title:'Aurora Borealis',author:'Elena Vasquez',category:'nature',tags:['northern lights','iceland','night sky','green'],likes:2847,views:14520,date:'2024-01-15',badge:'Featured'},
    {seed:'tokyo',title:'Tokyo Reflections',author:'Kenji Mori',category:'urban',tags:['japan','city','rain','neon'],likes:1923,views:9841,date:'2024-02-03'},
    {seed:'desert',title:'Saharan Dunes',author:'Amir Hassan',category:'nature',tags:['desert','sand','dunes','africa'],likes:1456,views:7230,date:'2024-01-28'},
    {seed:'arch',title:'Hagia Sophia',author:'Sofia Papadopoulos',category:'architecture',tags:['istanbul','dome','history','byzantine'],likes:3102,views:18763,date:'2024-02-10',badge:'Popular'},
    {seed:'portrait1',title:'Golden Hour',author:'Mia Chen',category:'portrait',tags:['portrait','sunlight','warm','bokeh'],likes:4210,views:22150,date:'2024-02-20'},
    {seed:'forest',title:'Misty Forest',author:'Lars Eriksson',category:'nature',tags:['forest','fog','green','morning'],likes:987,views:5412,date:'2024-01-05'},
    {seed:'street',title:'Rainy Seoul',author:'Ji-yeon Park',category:'urban',tags:['korea','street','rain','umbrella'],likes:1678,views:8920,date:'2024-03-01'},
    {seed:'abstract2',title:'Fractal Dreams',author:'Marco Rossi',category:'abstract',tags:['fractal','color','digital','art'],likes:2340,views:12033,date:'2024-02-14'},
    {seed:'mountain',title:'Alpine Sunrise',author:'Hans Mueller',category:'nature',tags:['mountains','alps','sunrise','snow'],likes:2901,views:15670,date:'2024-01-22',badge:'New'},
    {seed:'bridge',title:'Ponte Vecchio',author:'Giulia Ferrari',category:'architecture',tags:['italy','florence','bridge','renaissance'],likes:1234,views:6870,date:'2024-02-08'},
    {seed:'lake',title:'Mirror Lake',author:'Emma Wilson',category:'nature',tags:['lake','reflection','mountains','still'],likes:3456,views:19230,date:'2024-03-05'},
    {seed:'abstract3',title:'Chromatic Flow',author:'Diego Morales',category:'abstract',tags:['colors','fluid','abstract','art'],likes:876,views:4560,date:'2024-01-30'},
    {seed:'city2',title:'Manhattan Dusk',author:'Sarah Johnson',category:'urban',tags:['new york','skyline','dusk','usa'],likes:2123,views:11240,date:'2024-02-17'},
    {seed:'temple',title:'Angkor at Dawn',author:'Priya Sharma',category:'architecture',tags:['cambodia','temple','dawn','ancient'],likes:1789,views:9450,date:'2024-01-18'},
    {seed:'port',title:'Lisbon Mosaic',author:'Carlos Silva',category:'urban',tags:['portugal','tiles','color','street'],likes:1345,views:7120,date:'2024-02-25'},
    {seed:'nebula',title:'Orion Nebula',author:'Dr. Yuki Tanaka',category:'abstract',tags:['space','nebula','stars','cosmos'],likes:5600,views:32100,date:'2024-03-08',badge:'Trending'},
  ];
  
  let gallery = PICSUM_SEEDS.map((d,i) => ({
    id: i+1,
    ...d,
    src: `https://picsum.photos/seed/${d.seed}/800/600`,
    thumb: `https://picsum.photos/seed/${d.seed}/400/300`,
    favorite: false,
    isNew: i >= 14,
  }));
  
  let currentFilter = 'all';
  let currentTag = 'all';
  let currentSearch = '';
  let currentSort = 'default';
  let currentView = 'grid';
  let currentLbIndex = 0;
  let selectionMode = false;
  let selected = new Set();
  let filteredCache = [];
  
  // ── RENDER ────────────────────────────────────────────────────────
  function filterAndSort() {
    let items = [...gallery];
  
    if(currentFilter === 'favorites') items = items.filter(i => i.favorite);
    else if(currentFilter === 'recent') items = items.slice().reverse().slice(0,8);
    else if(currentFilter === 'new') items = items.filter(i => i.isNew);
    else if(['nature','architecture','portrait','abstract','urban'].includes(currentFilter))
      items = items.filter(i => i.category === currentFilter);
  
    if(currentTag !== 'all') items = items.filter(i => i.category === currentTag || i.tags.includes(currentTag));
  
    if(currentSearch) {
      const q = currentSearch.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(q) || i.category.includes(q) || i.tags.some(t=>t.includes(q)) || i.author.toLowerCase().includes(q));
    }
  
    switch(currentSort) {
      case 'title': items.sort((a,b)=>a.title.localeCompare(b.title)); break;
      case 'title-desc': items.sort((a,b)=>b.title.localeCompare(a.title)); break;
      case 'newest': items.sort((a,b)=>new Date(b.date)-new Date(a.date)); break;
      case 'likes': items.sort((a,b)=>b.likes-a.likes); break;
      case 'views': items.sort((a,b)=>b.views-a.views); break;
    }
    return items;
  }
  
  function renderGallery() {
    filteredCache = filterAndSort();
    const grid = document.getElementById('galleryGrid');
    grid.className = `gallery-grid view-${currentView}`;
  
    document.getElementById('visibleCount').textContent = filteredCache.length;
    document.getElementById('countAll').textContent = gallery.length;
    document.getElementById('countFav').textContent = gallery.filter(i=>i.favorite).length;
  
    if(!filteredCache.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <h3>No photos found</h3>
        <p>Try adjusting your search or filters</p>
      </div>`;
      return;
    }
  
    grid.innerHTML = filteredCache.map((img, idx) => `
      <div class="card ${selected.has(img.id)?'selected':''}" data-id="${img.id}" data-idx="${idx}" style="animation-delay:${idx*0.04}s">
        ${img.badge ? `<div class="card-badge">${img.badge}</div>` : ''}
        <div class="card-img-wrap">
          <img src="${img.thumb}" alt="${img.title}" loading="lazy">
          <div class="card-overlay">
            <div style="font-family:'Cormorant Garamond',serif;font-size:15px;color:#fff">${img.title}</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.6);margin-top:3px">${img.author}</div>
          </div>
        </div>
        <div class="card-actions">
          <div class="icon-btn ${img.favorite?'favorited':''}" data-action="fav" data-id="${img.id}" title="Favorite">
            <svg viewBox="0 0 24 24" fill="${img.favorite?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <div class="icon-btn" data-action="download" data-id="${img.id}" title="Download">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
          <div class="icon-btn" data-action="expand" data-id="${img.id}" title="View">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </div>
        </div>
        <div class="card-info">
          <div class="card-title">${img.title}</div>
          <div class="card-meta">
            <span>${img.author}</span>
            <span>♥ ${img.likes.toLocaleString()}</span>
          </div>
          <div class="card-tags">${img.tags.slice(0,3).map(t=>`<span class="card-tag">${t}</span>`).join('')}</div>
        </div>
      </div>
    `).join('');
  
    // Card clicks
    grid.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', e => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        const id = parseInt(e.target.closest('[data-id]')?.dataset.id || card.dataset.id);
        if(!id) return;
  
        if(selectionMode) { toggleSelect(id); return; }
  
        if(action === 'fav') { toggleFav(id); return; }
        if(action === 'download') { downloadImg(id); return; }
        if(action === 'expand') { openLightbox(parseInt(card.dataset.idx)); return; }
        openLightbox(parseInt(card.dataset.idx));
      });
    });
  }
  
  // ── FAVORITES ────────────────────────────────────────────────────
  function toggleFav(id) {
    const img = gallery.find(i=>i.id===id);
    if(!img) return;
    img.favorite = !img.favorite;
    toast(img.favorite ? `Added "${img.title}" to favorites` : `Removed from favorites`);
    renderGallery();
  }
  
  // ── DOWNLOAD ─────────────────────────────────────────────────────
  function downloadImg(id) {
    const img = gallery.find(i=>i.id===id);
    if(!img) return;
    const a = document.createElement('a');
    a.href = img.src;
    a.download = img.title + '.jpg';
    a.target = '_blank';
    a.click();
    toast(`Downloading "${img.title}"...`);
  }
  
  // ── LIGHTBOX ─────────────────────────────────────────────────────
  function openLightbox(idx) {
    currentLbIndex = idx;
    populateLightbox();
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
  
    // Increment views
    const img = filteredCache[idx];
    if(img) img.views++;
  }
  
  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }
  
  function populateLightbox() {
    const img = filteredCache[currentLbIndex];
    if(!img) return;
    document.getElementById('lbImg').src = img.src;
    document.getElementById('lbTitle').textContent = img.title;
    document.getElementById('lbAuthor').textContent = 'by ' + img.author;
    document.getElementById('lbLikes').textContent = img.likes.toLocaleString();
    document.getElementById('lbViews').textContent = img.views.toLocaleString();
    document.getElementById('lbCategory').textContent = img.category;
    document.getElementById('lbDate').textContent = new Date(img.date).toLocaleDateString('en',{month:'short',day:'numeric'});
    document.getElementById('lbTags').innerHTML = img.tags.map(t=>`<span class="lb-tag">${t}</span>`).join('');
    document.getElementById('lbFavorite').innerHTML = img.favorite
      ? `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;color:var(--danger)"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Remove Favorite`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Add to Favorites`;
  }
  
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxBg').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => { currentLbIndex = (currentLbIndex-1+filteredCache.length)%filteredCache.length; populateLightbox(); });
  document.getElementById('lbNext').addEventListener('click', () => { currentLbIndex = (currentLbIndex+1)%filteredCache.length; populateLightbox(); });
  document.getElementById('lbDownload').addEventListener('click', () => downloadImg(filteredCache[currentLbIndex]?.id));
  document.getElementById('lbFavorite').addEventListener('click', () => { toggleFav(filteredCache[currentLbIndex]?.id); populateLightbox(); });
  document.getElementById('lbShare').addEventListener('click', () => {
    navigator.clipboard?.writeText(filteredCache[currentLbIndex]?.src).then(()=>toast('Link copied to clipboard!')).catch(()=>toast('Share link ready!'));
  });
  
  document.addEventListener('keydown', e => {
    if(document.getElementById('lightbox').classList.contains('open')) {
      if(e.key==='Escape') closeLightbox();
      if(e.key==='ArrowLeft') { currentLbIndex=(currentLbIndex-1+filteredCache.length)%filteredCache.length; populateLightbox(); }
      if(e.key==='ArrowRight') { currentLbIndex=(currentLbIndex+1)%filteredCache.length; populateLightbox(); }
    }
    if(e.key==='Escape' && document.getElementById('uploadModal').classList.contains('open')) closeUpload();
  });
  
  // ── UPLOAD ───────────────────────────────────────────────────────
  document.getElementById('openUpload').addEventListener('click', ()=>document.getElementById('uploadModal').classList.add('open'));
  document.getElementById('cancelUpload').addEventListener('click', closeUpload);
  document.getElementById('uploadModal').addEventListener('click', e=>{ if(e.target===e.currentTarget) closeUpload(); });
  
  function closeUpload() { document.getElementById('uploadModal').classList.remove('open'); resetUpload(); }
  function resetUpload() {
    document.getElementById('uploadTitle').value='';
    document.getElementById('uploadTags').value='';
    document.getElementById('progressBar').classList.remove('active');
    document.getElementById('progressFill').style.width='0%';
  }
  
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', e=>{ e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', ()=>dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e=>{ e.preventDefault(); dropZone.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); });
  fileInput.addEventListener('change', ()=>handleFiles(fileInput.files));
  
  function handleFiles(files) {
    if(!files.length) return;
    const bar = document.getElementById('progressBar');
    const fill = document.getElementById('progressFill');
    bar.classList.add('active');
    let p=0;
    const iv = setInterval(()=>{ p+=Math.random()*20; fill.style.width=Math.min(p,90)+'%'; if(p>=90) clearInterval(iv); }, 200);
  
    Array.from(files).forEach((file,i) => {
      const reader = new FileReader();
      reader.onload = e => {
        setTimeout(()=>{
          fill.style.width='100%';
          setTimeout(()=>{ bar.classList.remove('active'); fill.style.width='0%'; },500);
        }, 800);
        const title = document.getElementById('uploadTitle').value || file.name.replace(/\.[^.]+$/,'');
        const cat = document.getElementById('uploadCategory').value;
        const tags = document.getElementById('uploadTags').value.split(',').map(t=>t.trim()).filter(Boolean);
        gallery.unshift({
          id: Date.now()+i,
          title, author:'You', category:cat, tags,
          src: e.target.result, thumb: e.target.result,
          likes:0, views:0, favorite:false, isNew:true,
          date: new Date().toISOString().slice(0,10),
        });
        renderGallery();
        toast(`"${title}" added to gallery!`);
      };
      reader.readAsDataURL(file);
    });
  }
  
  document.getElementById('confirmUpload').addEventListener('click', ()=>{ closeUpload(); });
  
  // ── SELECTION ────────────────────────────────────────────────────
  document.getElementById('selectionToggle').addEventListener('click', ()=>{
    selectionMode = !selectionMode;
    selected.clear();
    document.getElementById('selectionBar').classList.toggle('open', selectionMode);
    updateSelectionCount();
    renderGallery();
  });
  
  document.getElementById('cancelSelection').addEventListener('click', ()=>{
    selectionMode = false;
    selected.clear();
    document.getElementById('selectionBar').classList.remove('open');
    renderGallery();
  });
  
  document.getElementById('selectAll').addEventListener('click', ()=>{
    filteredCache.forEach(i=>selected.add(i.id));
    updateSelectionCount();
    renderGallery();
  });
  
  document.getElementById('favoriteSelected').addEventListener('click', ()=>{
    selected.forEach(id=>{ const i=gallery.find(g=>g.id===id); if(i) i.favorite=true; });
    toast(`${selected.size} photos added to favorites`);
    selected.clear();
    renderGallery();
  });
  
  document.getElementById('downloadSelected').addEventListener('click', ()=>{
    selected.forEach(id=>downloadImg(id));
    toast(`Downloading ${selected.size} photos...`);
  });
  
  document.getElementById('deleteSelected').addEventListener('click', ()=>{
    gallery = gallery.filter(i=>!selected.has(i.id));
    toast(`${selected.size} photos deleted`,'error');
    selected.clear();
    selectionMode=false;
    document.getElementById('selectionBar').classList.remove('open');
    renderGallery();
  });
  
  function toggleSelect(id) {
    if(selected.has(id)) selected.delete(id); else selected.add(id);
    updateSelectionCount();
    renderGallery();
  }
  function updateSelectionCount() { document.getElementById('selectedCount').textContent = selected.size; }
  
  // ── FILTERS & SEARCH ─────────────────────────────────────────────
  document.querySelectorAll('.sidebar-item').forEach(item=>{
    item.addEventListener('click', ()=>{
      document.querySelectorAll('.sidebar-item').forEach(i=>i.classList.remove('active'));
      item.classList.add('active');
      currentFilter = item.dataset.filter || 'all';
      renderGallery();
    });
  });
  
  document.getElementById('filterTags').addEventListener('click', e=>{
    const tag = e.target.closest('.tag');
    if(!tag) return;
    document.querySelectorAll('.tag').forEach(t=>t.classList.remove('active'));
    tag.classList.add('active');
    currentTag = tag.dataset.tag;
    renderGallery();
  });
  
  document.getElementById('searchInput').addEventListener('input', e=>{ currentSearch=e.target.value; renderGallery(); });
  document.getElementById('sortSelect').addEventListener('change', e=>{ currentSort=e.target.value; renderGallery(); });
  
  document.querySelectorAll('.view-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.view-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      renderGallery();
    });
  });
  
  // ── TOAST ─────────────────────────────────────────────────────────
  function toast(msg, type='') {
    const tc = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    tc.appendChild(el);
    setTimeout(()=>el.remove(), 3500);
  }
  
  // ── INIT ──────────────────────────────────────────────────────────
  renderGallery();