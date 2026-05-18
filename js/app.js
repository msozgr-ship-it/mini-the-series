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
    
    // DÖNME DOLAPTA ARTIK SADECE TEKLİ FİMLERİN AFİŞLERİ OLACAK (Seriler ve koleksiyonlar elendi!)
    orbitalContent = allContent.filter(item => !(item.isCollection || item.episodes)); 
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
    dragArea.classList.add('dragging'); // Sürükleme esnasında CSS geçişlerini kapatarak 0ms gecikme sağlarız!
    startX = e.pageX || (e.touches && e.touches[0] ? e.touches[0].pageX : 0);
    startRotation = currentRotation;
    clearTimeout(pauseTimeout);
    pauseAutoRotate = true; // Sürüklerken durdur
  };

  const onMove = (e) => {
    if (!isDragging) return;
    
    // Mobilde yatay yörünge sürüklemesi yaparken tüm ekranın sağa sola kaymasını önlüyoruz!
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const x = e.pageX || (e.touches && e.touches[0] ? e.touches[0].pageX : 0);
    const diff = (x - startX) * 0.15;
    currentRotation = startRotation + diff;
    updateOrbitalTransforms();
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    dragArea.classList.remove('dragging'); // Sürükleme bittiğinde yumuşak animasyonları geri açarız!
    // Bıraktıktan 3 saniye sonra dönmeye devam etsin (kullanıcı etkileşimi bittiyse)
    startPauseTimer(3000);
  };

  dragArea.addEventListener('mousedown', onStart);
  dragArea.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);
  dragArea.addEventListener('touchstart', onStart, { passive: true });
  dragArea.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onEnd, { passive: true });
}

function updateOrbitalTransforms() {
  const items = document.querySelectorAll('.cf-item');
  if (!items.length) return;
  const count = items.length;
  const angleStep = 360 / count;
  const isMobile = window.innerWidth < 768;

  // 1. ADIM: Merkez odak noktasını belirle (Tek aktif kart garantisi)
  let closestIndex = -1;
  let minAbsAngle = 999999;
  
  const calculatedAngles = Array.from(items).map((item, i) => {
    let relAngle = (i * angleStep) + currentRotation;
    relAngle = ((relAngle + 180) % 360 + 360) % 360 - 180;
    const absAngle = Math.abs(relAngle);
    if (absAngle < minAbsAngle) {
      minAbsAngle = absAngle;
      closestIndex = i;
    }
    return { item, relAngle, absAngle };
  });

  if (isMobile) {
    // MOBİL İÇİN KUSURSUZ KESİNTİSİZ 3D ELİPS DÖNME DOLAP MOTORU
    const screenW = window.innerWidth;
    const maxSpanX = (screenW / 2) - 48;
    const radiusX = Math.min(maxSpanX, 115);
    const radiusY_vertical = 35; // Dikey eliptik kavis derinliği (Arttırıldı!)
    const radiusZ = 60; // 3D derinlik projeksiyonu

    calculatedAngles.forEach((data, i) => {
      const { item, relAngle } = data;
      const cosVal = Math.cos((relAngle * Math.PI) / 180);
      
      // Kusursuz kesintisiz 3D dairesel koordinatlar (Y ekseni tersine çevrildi: Önler yukarıda, arkalar aşağıda!)
      const x = Math.sin((relAngle * Math.PI) / 180) * radiusX;
      const y = -cosVal * radiusY_vertical;
      const z = cosVal * radiusZ;
      
      // Kusursuz Lineer Ölçekleme (Önler büyük, arkalar küçük!)
      const maxScale = 1.32;
      const minScale = 0.68;
      const scale = minScale + (maxScale - minScale) * (cosVal + 1) / 2;
      
      // Asil 3D yörünge eğimi
      const rotY = relAngle * 0.22;
      item.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) scale(${scale.toFixed(3)}) rotateY(${rotY.toFixed(2)}deg) rotateX(0deg)`;
      
      // Kesintisiz Opaklık (Önler parlak, arkalar loş!)
      const maxOpacity = 1.0;
      const minOpacity = 0.22;
      const opacity = minOpacity + (maxOpacity - minOpacity) * (cosVal + 1) / 2;
      item.style.opacity = opacity.toFixed(2);
      
      // Tek aktif kartı odaklama
      if (i === closestIndex) {
        item.classList.add('active');
        item.style.zIndex = "25000"; // Odaktaki kart her zaman en üstte!
        item.style.pointerEvents = "auto";
      } else {
        item.classList.remove('active');
        
        // S logosunun (19000 z-index) önünde veya arkasında olmasına göre kusursuz derinlik sıralaması!
        const zIndexBase = Math.round(19000 + cosVal * 1000);
        item.style.zIndex = zIndexBase;
        
        // Sadece ön yarımküredeki (S logosunun önündeki) kartlar tıklanabilir, arkadakiler sadece görsellik katar!
        if (cosVal >= 0) {
          item.style.pointerEvents = "auto";
        } else {
          item.style.pointerEvents = "none";
        }
      }
    });
  } else {
    // MASAÜSTÜ İÇİN SOL DİKEY DÖNME DOLAP (KÜÇÜLTÜLMÜŞ VE DAHA SOLA ALINMIŞ)
    const radiusY_vertical = 220; // Dikey çap (Çok daha küçük, afişleri kapatmaz)
    const radiusZ = 160; // 3D derinlik projeksiyonu
    const leftOffset = -550; // Çok daha sola itildi (Ekranın sol uç kenarına)
    const curveX = 30; // Dönüşteki yatay kavis

    calculatedAngles.forEach((data, i) => {
      const { item, relAngle } = data;
      const rad = (relAngle * Math.PI) / 180;
      const cosVal = Math.cos(rad); // Ön/Arka (Z)
      const sinVal = Math.sin(rad); // Yukarı/Aşağı (Y)
      
      // Dikey Dönüş Koordinatları
      const x = leftOffset + (Math.abs(sinVal) * curveX); 
      const y = sinVal * radiusY_vertical; 
      const z = cosVal * radiusZ; 
      
      // Küçültülmüş ve optimize edilmiş lineer ölçekleme (Genel boyutlar iyice küçüldü)
      const maxScale = 0.85; // Odaktaki kartın büyüklüğü
      const minScale = 0.35; // Arkadaki kartın küçüklüğü
      const scale = minScale + (maxScale - minScale) * (cosVal + 1) / 2;
      
      // Kartlar ekranın ortasına (sağa) hafif dönük olsun
      const rotY = 20; // Sola daha çok itildiği için merkeze dönüş açısı hafif artırıldı
      const rotX = -sinVal * 12; // Aşağı indikçe hafif yukarı bakar
      
      item.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) scale(${scale.toFixed(3)}) rotateY(${rotY}deg) rotateX(${rotX.toFixed(2)}deg)`;
      
      // Arka planı öne çıkarmak için tekerlek elemanlarının opaklığını daha da kıstık
      const maxOpacity = 0.85;
      const minOpacity = 0.10;
      const opacity = minOpacity + (maxOpacity - minOpacity) * (cosVal + 1) / 2;
      item.style.opacity = opacity.toFixed(2);
      
      // Tek aktif kartı odaklama
      if (i === closestIndex) {
        item.classList.add('active');
        item.style.zIndex = "25000"; // Odaktaki kart her zaman en üstte!
        item.style.pointerEvents = "auto";
      } else {
        item.classList.remove('active');
        
        const zIndexBase = Math.round(19000 + cosVal * 1000);
        item.style.zIndex = zIndexBase;
        
        if (cosVal >= 0) {
          item.style.pointerEvents = "auto";
        } else {
          item.style.pointerEvents = "none";
        }
      }
    });

    // Arka plan videosunu güncelle (Dönme Dolap Arkası Filmlerden Kesitler)
    if (closestIndex !== -1 && orbitalContent[closestIndex]) {
      updateBackgroundVideo(orbitalContent[closestIndex]);
    }
  }
}


// BREATHTAKING AMBIENT VIDEO BACKDROP GENERATOR
let bgVideoTimeout = null;
let currentBgVideoId = null;

function updateBackgroundVideo(item) {
  if (!item) return;
  if (currentBgVideoId === item.id) return;
  currentBgVideoId = item.id;

  const bgContainer = document.getElementById('hero-video-bg');
  if (!bgContainer) return;

  // Mevcut arka planı yumuşakça soldur
  bgContainer.classList.remove('active');

  clearTimeout(bgVideoTimeout);
  bgVideoTimeout = setTimeout(() => {
    let videoHtml = '';
    const file = item.file;

    // Filmlerin başlangıç/bitiş jeneriklerini atlamak için 20. dk (1200s) ile 50. dk (3000s) arasında rastgele bir orta saniye seç!
    const midPoint = Math.floor(Math.random() * 1800) + 1200; 

    if (file) {
      if (file.includes('youtube.com') || file.includes('youtu.be')) {
        let ytId = '';
        if (file.includes('embed/')) ytId = file.split('embed/')[1]?.split('?')[0];
        else ytId = file.split('v=')[1]?.split('&')[0];
        videoHtml = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&modestbranding=1&iv_load_policy=3&start=${midPoint}" allow="autoplay; encrypted-media; picture-in-picture" style="width:100vw; height:56.25vw; min-height:100vh; min-width:177.77vh; pointer-events: none;"></iframe>`;
      } else if (file.includes('archive.org')) {
        // archive.org embed linkini al, sessiz, autoplay ve orta noktadan başlama parametrelerini ekle
        const embedUrl = file.replace('/details/', '/embed/');
        videoHtml = `<iframe src="${embedUrl}?autoplay=1&muted=1&controls=0&loop=1&start=${midPoint}" allow="autoplay; fullscreen" style="width:100vw; height:56.25vw; min-height:100vh; min-width:177.77vh; pointer-events: none;"></iframe>`;
      } else if (file.endsWith('.mp4') || file.includes('.mp4?')) {
        // HTML5 Media Fragments (#t=saniye) kullanarak doğrudan MP4'ü ortasından oynat!
        videoHtml = `<video src="${file}#t=${midPoint}" autoplay muted loop playsinline style="width:100vw; height:56.25vw; min-height:100vh; min-width:177.77vh; object-fit:cover; pointer-events: none;"></video>`;
      } else if (file.includes('dailymotion.com')) {
        let dmId = file.split('video/')[1]?.split('?')[0]?.split('&')[0];
        if (dmId) {
          videoHtml = `<iframe src="https://www.dailymotion.com/embed/video/${dmId}?autoplay=1&mute=1&muted=1&controls=0&ui-logo=0&ui-start-screen-info=0" allow="autoplay; fullscreen; picture-in-picture" style="width:100vw; height:56.25vw; min-height:100vh; min-width:177.77vh; pointer-events: none;"></iframe>`;
        }
      }
    }

    if (videoHtml) {
      bgContainer.innerHTML = videoHtml;
      // Yeni arka planı yumuşakça aydınlat
      setTimeout(() => {
        bgContainer.classList.add('active');
      }, 150);
    } else {
      bgContainer.innerHTML = '';
    }
  }, 1200); // 1.2 saniye gecikme (drag/sürükleme esnasında kasmayı %100 önler!)
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

  // Seri ve tekli filmleri filtrele
  const collections = filteredContent.filter(item => item.isCollection || item.episodes);
  const singles = filteredContent.filter(item => !(item.isCollection || item.episodes));

  // Kart HTML oluşturucu yardımcı fonksiyon
  const makeCardHtml = (item) => {
    const isColl = item.isCollection || item.episodes;
    return `
      <div class="card-wrapper ${isColl ? 'collection-stack' : ''}" onclick="handleItemClick('${item.id}')">
        <div class="card">
          ${isColl ? '<div class="collection-badge">SERİ</div>' : ''}
          <img src="${item.poster}" alt="" onerror="this.src='https://via.placeholder.com/200x300?text=Afiş+Yok'">
        </div>
      </div>
    `;
  };

  content.innerHTML = `
    <div class="split-matrix-container">
      <!-- SOL BLOK: SERİ FİLMLER & KOLEKSİYONLAR -->
      <div class="matrix-column">
        <h3 class="matrix-column-title">SERİ FİLMLER & KOLEKSİYONLAR</h3>
        <div class="split-grid">
          ${collections.length > 0 ? collections.map(makeCardHtml).join('') : '<div class="no-results-text">Seri film bulunamadı.</div>'}
        </div>
      </div>

      <!-- SAĞ BLOK: TEKLİ FİLMLER -->
      <div class="matrix-column">
        <h3 class="matrix-column-title">TEKLİ FİLMLER</h3>
        <div class="split-grid">
          ${singles.length > 0 ? singles.map(makeCardHtml).join('') : '<div class="no-results-text">Tekli film bulunamadı.</div>'}
        </div>
      </div>
    </div>
  `;
}

// DEEP ITEM LOCATOR (Tüm seri bölümlerini ve koleksiyon alt filmlerini de bulur!)
function findItemDeep(id) {
  // 1. Üst seviyede ara
  let found = allContent.find(i => i.id === id);
  if (found) return found;

  // 2. Koleksiyonların içinde ara
  for (const item of allContent) {
    if (item.collection) {
      const nested = item.collection.find(f => f.id === id);
      if (nested) return nested;
    }
    // 3. Serilerin bölümlerinin içinde ara
    if (item.episodes) {
      const nested = item.episodes.find(e => e.id === id);
      if (nested) return nested;
    }
  }
  return null;
}

function handleItemClick(id) {
  const item = findItemDeep(id);
  if (!item) return;

  if (item.episodes || item.isCollection) {
    openDetails(id);
  } else {
    openPlayer(item.file, item.title, item.poster);
  }
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

    // Spotlight hızlı öneriler panelini render etme (Koleksiyon alt filmleri dahil!)
    if (q.length > 0 && resultsPanel) {
      const searchableItems = [];
      allContent.forEach(item => {
        searchableItems.push(item);
        if (item.collection) {
          item.collection.forEach(sub => {
            searchableItems.push({
              ...sub,
              searchTags: (sub.searchTags || '') + ' ' + (item.searchTags || '')
            });
          });
        }
        if (item.episodes) {
          item.episodes.forEach(sub => {
            searchableItems.push({
              ...sub,
              searchTags: (sub.searchTags || '') + ' ' + (item.searchTags || '')
            });
          });
        }
      });

      const matches = searchableItems.filter(item => 
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
  
  const item = findItemDeep(id);
  if (!item) return;

  // Arama sonucundan gelen tıklamalarda HER ZAMAN doğrudan oynatıcıyı aç!
  if (item.episodes && item.episodes.length > 0) {
    // Seri ise: İlk bölümü doğrudan oynat!
    const firstEp = item.episodes[0];
    openPlayer(firstEp.file, firstEp.title, firstEp.poster || item.poster);
  } else if (item.collection && item.collection.length > 0) {
    // Koleksiyon ise: İlk filmi doğrudan oynat!
    const firstMovie = item.collection[0];
    openPlayer(firstMovie.file, firstMovie.title, firstMovie.poster || item.poster);
  } else {
    // Tekil film veya alt film ise: Doğrudan oynat!
    openPlayer(item.file, item.title, item.poster);
  }
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
  const playerTitle = document.getElementById('player-title');
  const playerBackdrop = document.getElementById('player-backdrop');
  const container = document.querySelector('.player-container');
  
  if (playerTitle) playerTitle.textContent = title || "Sinematik Deneyim";
  if (playerBackdrop) playerBackdrop.style.backgroundImage = poster ? `url(${poster})` : '';
  
  // Eski içeriği temizle ve logoyu maskeleyen paneli sıfırla
  container.innerHTML = `
    <div class="player-logo-blocker" id="logo-blocker">
      <span class="blocker-dot"></span>
    </div>
  `;

  let finalUrl = file;
  let isDirectVideo = false;

  // Archive.org linklerini tespit edip DOĞRUDAN ham 1080p/720p HD MP4 akışına dönüştür!
  if (file.includes('archive.org/embed/') || file.includes('archive.org/details/')) {
    let identifier = '';
    if (file.includes('archive.org/embed/')) {
      identifier = file.split('archive.org/embed/')[1]?.split('?')[0];
    } else {
      identifier = file.split('archive.org/details/')[1]?.split('?')[0];
    }
    if (identifier) {
      finalUrl = `https://archive.org/download/${identifier}/${identifier}.mp4`;
      isDirectVideo = true;
    }
  } else if (file.endsWith('.mp4') || file.includes('.mp4?')) {
    isDirectVideo = true;
  }

  if (isDirectVideo) {
    // Özel premium, sıfır sıkıştırmalı yerel tarayıcı oynatıcısı (Süper HD Çözünürlük!)
    container.innerHTML += `
      <video id="player-video" src="${finalUrl}" controls autoplay playsinline style="width:100%; height:100%; object-fit:contain; border:none; display:block; outline:none; background:#000;"></video>
    `;
    
    // Doğrudan video akışı olduğu için Archive.org logosu bulunmaz, maskeleyicileri gizleyebiliriz!
    const blocker = document.getElementById('logo-blocker');
    if (blocker) blocker.style.display = 'none';

    // AKILLI HATA TOLERANS LİSENER'I: Eğer doğrudan MP4 bağlantısı 404/hata verirse, anında ve hissettirmeden güvenli iframe oynatıcısına geri döner!
    const videoEl = document.getElementById('player-video');
    if (videoEl) {
      videoEl.addEventListener('error', () => {
        console.warn("Doğrudan MP4 akışı başarısız oldu, iframe oynatıcısına geçiş yapılıyor.");
        // Iframe oynatıcısına geri dön (yedek plan)
        let iframeUrl = file;
        if (file.includes('archive.org/embed/')) {
          iframeUrl = file + (file.includes('?') ? '&' : '?') + 'autoplay=1';
        }
        container.innerHTML = `
          <div class="player-logo-blocker" id="logo-blocker">
            <span class="blocker-dot"></span>
          </div>
          <iframe id="player-frame" src="${iframeUrl}" allow="autoplay; fullscreen" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" oallowfullscreen="true" msallowfullscreen="true" style="width:100%; height:100%; border:none; display:block;"></iframe>
        `;
      });
    }
  } else {
    // YouTube / Pixeldrain vb. için iframe oynatıcısı (varsayılan yedek)
    if (file.includes('pixeldrain.com/u/')) {
      finalUrl = file.replace('pixeldrain.com/u/', 'pixeldrain.com/u/') + '?embed';
    } else if (file.includes('youtube.com') || file.includes('youtu.be')) {
      let ytId = '';
      if (file.includes('embed/')) ytId = file.split('embed/')[1]?.split('?')[0];
      else ytId = file.split('v=')[1]?.split('&')[0];
      finalUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&modestbranding=1&rel=0`;
    } else if (file.includes('dailymotion.com')) {
      let dmId = file.split('video/')[1]?.split('?')[0]?.split('&')[0];
      if (dmId) {
        finalUrl = `https://www.dailymotion.com/embed/video/${dmId}?autoplay=1&queue-enable=false&queue-autoplay-next=false&ui-logo=false`;
      }
    }
    container.innerHTML += `
      <iframe id="player-frame" src="${finalUrl}" allow="autoplay; fullscreen" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" oallowfullscreen="true" msallowfullscreen="true" style="width:100%; height:100%; border:none; display:block;"></iframe>
    `;
  }

  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('active'), 10);
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
  
  // Tam ekrandan çıkış yap (aktifse)
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  
  if (modal) { 
    modal.classList.remove('active'); 
    setTimeout(() => { 
      modal.style.display = 'none'; 
      const container = document.querySelector('.player-container');
      if (container) container.innerHTML = ''; // Videoyu durdur ve hafızayı temizle!
    }, 500); 
  }
}



function resetFilter() {
  filteredContent = [...allContent];
  const input = document.getElementById('search-input');
  if (input) input.value = '';
  renderContent();
}

document.addEventListener('DOMContentLoaded', initApp);
