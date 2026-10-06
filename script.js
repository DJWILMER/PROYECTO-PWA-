document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('radio-audio');
  const btnPlay = document.getElementById('btn-play');
  const playIcon = document.getElementById('play-icon');
  const volumeSlider = document.getElementById('volume-slider');
  const playerArt = document.getElementById('player-art');
  const songTitle = document.getElementById('song-title');
  const themeSelect = document.getElementById('theme-select');
  const btnLike = document.getElementById('btn-like');
  const likeCount = document.getElementById('like-count');

  // 1. Control del Reproductor de Audio
  let isPlaying = false;

  function togglePlay() {
    if (isPlaying) {
      audio.pause();
      playIcon.className = 'fa-solid fa-play';
      playerArt.classList.remove('playing');
      document.body.classList.remove('is-playing');
    } else {
      audio.play().then(() => {
        playIcon.className = 'fa-solid fa-pause';
        playerArt.classList.add('playing');
        document.body.classList.add('is-playing');
      }).catch(err => {
        console.error("Error al reproducir audio:", err);
      });
    }
    isPlaying = !isPlaying;
  }

  btnPlay.addEventListener('click', togglePlay);

  volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
  });

  // 2. Metadatos Zeno FM en Tiempo Real (SSE)
  function initMetadata() {
    const metaUrl = 'https://api.zeno.fm/mounts/metadata/subscribe/zzrxpmz2mv8uv';
    
    if (window.EventSource) {
      const eventSource = new EventSource(metaUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.streamTitle) {
            songTitle.textContent = data.streamTitle;
          }
        } catch (e) {
          if (event.data && typeof event.data === 'string') {
            songTitle.textContent = event.data;
          }
        }
      };

      eventSource.onerror = () => {
        songTitle.textContent = "DJ WILMER - Sonando Fuerte";
      };
    } else {
      songTitle.textContent = "DJ WILMER - Transmisión Oficial";
    }
  }

  initMetadata();

  // 3. Sistema de Temas y Fondo
  themeSelect.addEventListener('change', (e) => {
    document.body.className = e.target.value;
    localStorage.setItem('dj_wilmer_theme', e.target.value);
  });

  const savedTheme = localStorage.getItem('dj_wilmer_theme');
  if (savedTheme) {
    document.body.className = savedTheme;
    themeSelect.value = savedTheme;
  }

  // 4. Contador de Likes
  let likes = parseInt(localStorage.getItem('dj_wilmer_likes') || '1240');
  let hasLiked = localStorage.getItem('dj_wilmer_has_liked') === 'true';

  if (hasLiked) {
    btnLike.classList.add('liked');
  }
  likeCount.textContent = likes;

  btnLike.addEventListener('click', () => {
    if (!hasLiked) {
      likes++;
      hasLiked = true;
      btnLike.classList.add('liked');
      localStorage.setItem('dj_wilmer_likes', likes);
      localStorage.setItem('dj_wilmer_has_liked', 'true');
    } else {
      likes--;
      hasLiked = false;
      btnLike.classList.remove('liked');
      localStorage.setItem('dj_wilmer_likes', likes);
      localStorage.setItem('dj_wilmer_has_liked', 'false');
    }
    likeCount.textContent = likes;
  });

  // 5. Sistema de Pestañas
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');

      if (tabId === 'tab-map' && window.mapInstance) {
        setTimeout(() => window.mapInstance.invalidateSize(), 200);
      }
    });
  });

  // 6. Cargar Noticias de Perú y el Mundo
  function loadNews() {
    const newsList = document.getElementById('news-list');
    const newsData = [
      {
        title: "Perú celebra festivales de música con récords de audiencia",
        desc: "Las emisoras PWA y transmisiones digitales marcan tendencia en todo el país.",
        date: "Hace 10 minutos"
      },
      {
        title: "Avances en la tecnología de streaming para DJs",
        desc: "Nuevas herramientas permiten transmitir audio de alta fidelidad sin interrupciones.",
        date: "Hace 35 minutos"
      },
      {
        title: "Éxito total en las redes sociales de DJ WILMER",
        desc: "Oyentes de Lima, Trujillo, Arequipa y el extranjero se conectan en simultáneo.",
        date: "Hace 1 hora"
      }
    ];

    newsList.innerHTML = newsData.map(item => `
      <article class="news-card glass">
        <span class="news-date">${item.date}</span>
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </article>
    `).join('');
  }

  loadNews();

  // 7. Mapa Interactivo de Oyentes en Directo
  function initMap() {
    const map = L.map('listeners-map').setView([-9.19, -75.015], 3); // Centrado en Perú/Sudamérica
    window.mapInstance = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 18
    }).addTo(map);

    // Ubicaciones simuladas de oyentes en tiempo real
    const listenersLocations = [
      { lat: -12.04637, lng: -77.04279, city: "Lima, Perú" },
      { lat: -8.11599, lng: -79.02998, city: "Trujillo, Perú" },
      { lat: -16.40904, lng: -71.53745, city: "Arequipa, Perú" },
      { lat: 19.4326, lng: -99.1332, city: "Ciudad de México, México" },
      { lat: 25.7617, lng: -80.1918, city: "Miami, EE. UU." },
      { lat: 40.4167, lng: -3.7037, city: "Madrid, España" },
      { lat: -34.6037, lng: -58.3816, city: "Buenos Aires, Argentina" }
    ];

    listenersLocations.forEach(loc => {
      const circle = L.circleMarker([loc.lat, loc.lng], {
        color: '#d946ef',
        fillColor: '#ec4899',
        fillOpacity: 0.8,
        radius: 8
      }).addTo(map);

      circle.bindPopup(`<b>Oyente Conectado</b><br>${loc.city}`);
    });
  }

  initMap();

  // 8. Registro del Service Worker y Soporte PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker registrado correctamente.'))
      .catch(err => console.error('Error Service Worker:', err));
  }

  // Captura para botón de instalación PWA
  let deferredPrompt;
  const installBtn = document.getElementById('install-pwa-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-flex';
  });

  installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          installBtn.style.display = 'none';
        }
        deferredPrompt = null;
      });
    }
  });
});