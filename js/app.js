// Versiyon 4.1 - Akıllı Odaklama ve Gecikmeli Dönüş Motoru
let allContent = [];
let orbitalContent = [];
let filteredContent = [];
let currentRotation = 0;
let autoRotateSpeed = 0.05; 
let isDragging = false;
let startX = 0;
let startRotation = 0;
let pauseAutoRotate = false;
let pauseTimeout = null;

function initApp() {
  try {
    if (typeof DB === 'undefined') return;
    allContent = [...DB.movies, ...DB.series];
    orbitalContent = [...allContent]; 
    filteredContent = [...allContent];

    renderOrbital();
    renderContent();
    setupSearch();
    setupDragEvents();
    animate();

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closePlayer(); closeDetails(); }
    });

    window.addEventListener('resize', updateOrbitalTransforms);
  } catch (err) {
    console.error("Sistem hatası:", err);
  }
}

function animate() {
  if (!isDragging && !pauseAutoRotate) {
    currentRotation -= autoRotateSpeed;
    updateOrbitalTransforms();
  }
  requestAnimationFrame(animate);
}

function setupDragEvents() {
  const dragArea = document.getElementById('hero-drag-area');
  if (!dragArea) return;

  const onStart = (e) => {
    isDragging = true;
    startX = e.pageX || e.touches[0].pageX;
    startRotation = currentRotation;
    clearTimeout(pauseTimeout);
    pauseAutoRotate = true; // Sürüklerken durdur
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const x = e.pageX || e.touches[0].pageX;
    const diff = (x - startX) * 0.15;
    currentRotation = startRotation + diff;
    updateOrbitalTransforms();
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    // Bıraktıktan 3 saniye sonra dönmeye devam etsin (kullanıcı etkileşimi bittiyse)
    startPauseTimer(3000);
  };

  dragArea.addEventListener('mousedown', onStart);
  dragArea.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);
  dragArea.addEventListener('touchstart', onStart);
  dragArea.addEventListener('touchmove', onMove);
  window.addEventListener('touchend', onEnd);
}

function updateOrbitalTransforms() {
  const items = document.querySelectorAll('.cf-item');
  if (!items.length) return;
  const count = items.length;
  const angleStep = 360 / count;
  const isMobile = window.innerWidth < 768;
  
  // Mobilde afişlerin üst üste binmemesi için X ve Z yarıçaplarını genişletip mükemmel açıyoruz
  const radiusX = isMobile ? Math.max(window.innerWidth * 0.65, 250) : 700; 
  const radiusZ = isMobile ? Math.max(window.innerWidth * 0.25, 95) : 280;

  items.forEach((item, i) => {
    const angle = (i * angleStep) + currentRotation;
    const rad = (angle * Math.PI) / 180;
    const x = Math.sin(rad) * radiusX;
    const z = Math.cos(rad) * radiusZ;
    
    item.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + 0px), ${z}px) rotateY(${angle}deg) rotateX(-45deg)`;
    
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    // Mobilde aktiflik aralığını biraz daha esnek tutuyoruz
    const activeRange = isMobile ? 22 : 15;
    const isActive = normalizedAngle < activeRange || normalizedAngle > (360 - activeRange);
    
    if (isActive) {
      item.classList.add('active');
      item.style.opacity = "1";
      item.style.zIndex = "20000";
      item.style.pointerEvents = "auto";
    } else {
      item.classList.remove('active');
      
      // Arkada kalan ve kargaşa yaratan kartları tespit ediyoruz
      const isBack = normalizedAngle > 75 && normalizedAngle < 285;
      
      if (isMobile) {
        // Mobilde arkadaki kartları gizleyerek üst üste binme hissini sıfırlıyoruz!
        item.style.opacity = isBack ? "0" : "0.45";
        item.style.pointerEvents = isBack ? "none" : "auto";
      } else {
        item.style.opacity = isBack ? "0.15" : "0.55";
        item.style.pointerEvents = "auto";
      }
      
      item.style.zIndex = Math.round(z);
    }
  });
}

function handleOrbitalClick(index, id) {
  if (isDragging) return;

  const count = orbitalContent.length;
  const angleStep = 360 / count;
  const targetRotation = -(index * angleStep);
  
  const currentNorm = ((currentRotation % 360) + 360) % 360;
  const targetNorm = ((targetRotation % 360) + 360) % 360;
  const diff = Math.abs(currentNorm - targetNorm);

  // EĞER KART ZATEN MERKEZDEYSE (Filmi Aç)
  if (diff < 5 || diff > 355) {
    const item = allContent.find(i => i.id === id);
    if (!item) return;
    if (item.episodes || item.isCollection) openDetails(id);
    else openPlayer(item.file, item.title, item.poster);
  } 
  // EĞER KART MERKEZDE DEĞİLSE (Merkeze Getir ve 5sn durdur)
  else {
    currentRotation = targetRotation;
    updateOrbitalTransforms();
    startPauseTimer(5000);
  }
}

function startPauseTimer(ms) {
  clearTimeout(pauseTimeout);
  pauseAutoRotate = true;
  pauseTimeout = setTimeout(() => {
    pauseAutoRotate = false;
  }, ms);
}

function renderOrbital() {
  const container = document.getElementById('orbital-container');
  if (!container) return;
  container.innerHTML = orbitalContent.map((item, index) => {
    const isColl = item.isCollection || item.episodes;
    return `
      <div class="cf-item ${isColl ? 'collection-stack' : ''}" id="orb-${index}" onclick="handleOrbitalClick(${index}, '${item.id}')">
        ${isColl ? '<div class="collection-badge">SERİ</div>' : ''}
        <div class="neon-rim"></div>
        <img src="${item.poster}" alt="" onerror="this.src='https://via.placeholder.com/200x300?text=Afiş+Yok'">
      </div>
    `;
  }).join('');
}

function renderContent() {
  const content = document.getElementById('content-matrix');
  if (!content) return;
  content.innerHTML = `<div class="movie-grid">${filteredContent.map(item => {
    const isColl = item.isCollection || item.episodes;
    return `
      <div class="card-wrapper ${isColl ? 'collection-stack' : ''}" onclick="handleItemClick('${item.id}')">
        <div class="card">
          ${isColl ? '<div class="collection-badge">SERİ</div>' : ''}
          <img src="${item.poster}" alt="" onerror="this.src='https://via.placeholder.com/200x300?text=Afiş+Yok'">
        </div>
      </div>
    `;
  }).join('')}</div>`;
}

function handleItemClick(id) {
  const item = allContent.find(i => i.id === id);
  if (item.episodes || item.isCollection) openDetails(id);
  else openPlayer(item.file, item.title, item.poster);
}

function setupSearch() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  const resultsPanel = document.getElementById('search-results-panel');
  if (!input) return;

  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    
    // Temizleme butonu kontrolü
    if (q.length > 0) {
      if (clearBtn) clearBtn.classList.add('active');
      if (resultsPanel) {
        resultsPanel.style.display = 'flex';
        setTimeout(() => resultsPanel.classList.add('active'), 10);
      }
    } else {
      if (clearBtn) clearBtn.classList.remove('active');
      if (resultsPanel) {
        resultsPanel.classList.remove('active');
        setTimeout(() => resultsPanel.style.display = 'none', 300);
      }
    }

    // Ana kütüphane grid filtreleme
    filteredContent = allContent.filter(item => 
      (item.title && item.title.toLowerCase().includes(q)) || 
      (item.searchTags && item.searchTags.toLowerCase().includes(q))
    );
    renderContent();

    // Spotlight hızlı öneriler panelini render etme
    if (q.length > 0 && resultsPanel) {
      const matches = allContent.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) || 
        (item.searchTags && item.searchTags.toLowerCase().includes(q))
      ).slice(0, 5); // En iyi 5 eşleşmeyi al

      if (matches.length > 0) {
        resultsPanel.innerHTML = matches.map(item => {
          const isColl = item.isCollection || item.episodes;
          const ratingText = item.rating ? `⭐ <span>${item.rating}</span>` : 'Yakında';
          const typeText = isColl ? 'Seri' : 'Film';
          return `
            <div class="search-result-item" onclick="handleSuggestionClick('${item.id}')">
              <img src="${item.poster}" alt="">
              <div class="search-result-info">
                <div class="search-result-title">${item.title}</div>
                <div class="search-result-meta">${item.year || '2024'} • ${typeText} • ${ratingText}</div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        resultsPanel.innerHTML = `<div class="search-no-results">Aradığınız kriterlere uygun sonuç bulunamadı.</div>`;
      }
    }
  });

  // Dışarı tıklandığında paneli gizleme
  document.addEventListener('click', (e) => {
    if (resultsPanel && !e.target.closest('#search-container')) {
      resultsPanel.classList.remove('active');
      setTimeout(() => resultsPanel.style.display = 'none', 300);
    }
  });

  // Odaklanıldığında sorgu varsa paneli tekrar açma
  input.addEventListener('focus', () => {
    if (input.value.trim().length > 0 && resultsPanel) {
      resultsPanel.style.display = 'flex';
      setTimeout(() => resultsPanel.classList.add('active'), 10);
    }
  });
}

function handleSuggestionClick(id) {
  const resultsPanel = document.getElementById('search-results-panel');
  if (resultsPanel) {
    resultsPanel.classList.remove('active');
    setTimeout(() => resultsPanel.style.display = 'none', 300);
  }
  handleItemClick(id);
}

function clearSearchInput(event) {
  if (event) event.stopPropagation();
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  const resultsPanel = document.getElementById('search-results-panel');
  
  if (input) input.value = '';
  if (clearBtn) clearBtn.classList.remove('active');
  if (resultsPanel) {
    resultsPanel.classList.remove('active');
    setTimeout(() => resultsPanel.style.display = 'none', 300);
  }
  
  resetFilter();
  if (input) input.focus();
}

function openDetails(id) {
  const item = allContent.find(i => i.id === id);
  if (!item) return;
  const modal = document.getElementById('details-modal');
  const grid = document.getElementById('details-grid');
  document.getElementById('details-title').textContent = item.title;
  let subItems = item.episodes || item.collection || [];
  grid.innerHTML = subItems.map(sub => `
    <div class="series-item" onclick="event.stopPropagation(); openPlayer('${sub.file}', '${sub.title}', '${sub.poster || item.poster}')">
      <div class="card"><img src="${sub.poster || item.poster}" alt=""></div>
      <h3>${sub.title}</h3>
    </div>
  `).join('');
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('active'), 10);
}

function closeDetails() {
  const modal = document.getElementById('details-modal');
  if (modal) { modal.classList.remove('active'); setTimeout(() => modal.style.display = 'none', 500); }
}

function openPlayer(file, title, poster) {
  if (!file || file.includes('ID')) {
    openComingSoon(title, poster);
    return;
  }
  const modal = document.getElementById('player-modal');
  const iframe = document.getElementById('player-frame');
  const playerTitle = document.getElementById('player-title');
  const playerBackdrop = document.getElementById('player-backdrop');
  
  if (playerTitle) playerTitle.textContent = title || "Sinematik Deneyim";
  if (playerBackdrop) playerBackdrop.style.backgroundImage = poster ? `url(${poster})` : '';
  
  let finalUrl = file;
  if (file.includes('pixeldrain.com/u/')) finalUrl = file.replace('pixeldrain.com/u/', 'pixeldrain.com/u/') + '?embed';
  
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('active'), 10);
  iframe.src = finalUrl;
}

function openComingSoon(title, poster) {
  const modal = document.getElementById('coming-soon-modal');
  const csTitle = document.getElementById('cs-title');
  const csBackdrop = document.getElementById('cs-backdrop');
  
  csTitle.textContent = title || "Sinematik İçerik";
  if (poster) csBackdrop.style.backgroundImage = `url(${poster})`;
  
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('active'), 10);
}

function closeComingSoon() {
  const modal = document.getElementById('coming-soon-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 600);
  }
}

function closePlayer() {
  const modal = document.getElementById('player-modal');
  const iframe = document.getElementById('player-frame');
  if (modal) { modal.classList.remove('active'); setTimeout(() => { modal.style.display = 'none'; iframe.src = ''; }, 500); }
}

function resetFilter() {
  filteredContent = [...allContent];
  const input = document.getElementById('search-input');
  if (input) input.value = '';
  renderContent();
}

document.addEventListener('DOMContentLoaded', initApp);
