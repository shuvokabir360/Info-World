// ===================================================
// HEROES OF CINEMA (নায়ক জগৎ) - INTERACTIVE ENGINE
// ===================================================

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentIndex = 0;
  let isPlaying = false;
  const SPEED_STEPS = [3000, 5000, 8000, 10000, 12000, 15000];
  let speedIndex = 2; // Default 8000ms (8s)
  let autoplayDuration = SPEED_STEPS[speedIndex];
  let timerInterval = null;
  let progressStep = 0;
  let recentIndices = [];
  let isSoundEnabled = localStorage.getItem('hero_sound_enabled') !== 'false';
  let audioCtx = null;
  let touchStartX = 0;
  let touchEndX = 0;

  // DOM Elements - Hero & Cards
  const introOverlay = document.getElementById('introOverlay');
  const startPlayBtn = document.getElementById('startPlayBtn');
  
  const heroCard = document.getElementById('heroCard');
  const cardTimerBar = document.getElementById('cardTimerBar');
  const photoFrame = document.getElementById('photoFrame');
  const heroImg = document.getElementById('heroImg');
  const heroBadgeTag = document.getElementById('heroBadgeTag');
  const heroBadgeText = document.getElementById('heroBadgeText');
  const heroRankIndex = document.getElementById('heroRankIndex');
  const heroRealName = document.getElementById('heroRealName');
  
  const heroTitle = document.getElementById('heroTitle');
  const heroNameBn = document.getElementById('heroNameBn');
  const heroNameEn = document.getElementById('heroNameEn');
  const heroBirthDate = document.getElementById('heroBirthDate');
  const heroAge = document.getElementById('heroAge');
  const heroProfession = document.getElementById('heroProfession');
  const heroSpecialty = document.getElementById('heroSpecialty');
  const heroDebut = document.getElementById('heroDebut');
  const movieChipsWrap = document.getElementById('movieChipsWrap');
  const heroDialogue = document.getElementById('heroDialogue');
  const heroAchievements = document.getElementById('heroAchievements');

  const orb1 = document.getElementById('orb1');
  const orb2 = document.getElementById('orb2');

  const animHeader = document.getElementById('animHeader');
  const animBirthday = document.getElementById('animBirthday');
  const animProfession = document.getElementById('animProfession');
  const animMovies = document.getElementById('animMovies');
  const animDialogue = document.getElementById('animDialogue');
  const animAchievements = document.getElementById('animAchievements');
  const animElements = [animHeader, animBirthday, animProfession, animMovies, animDialogue, animAchievements];
  let activeAnimationTimeouts = [];

  // Minimal Bottom Bar Controls
  const nextBtn = document.getElementById('nextBtn');
  const speedDownBtn = document.getElementById('speedDownBtn');
  const speedUpBtn = document.getElementById('speedUpBtn');
  const speedDisplayVal = document.getElementById('speedDisplayVal');

  // Home Screen Settings Toolbar Elements
  const homeSoundBtn = document.getElementById('homeSoundBtn');
  const homeSoundIcon = document.getElementById('homeSoundIcon');
  const homeDrawerBtn = document.getElementById('homeDrawerBtn');
  const homeFullscreenBtn = document.getElementById('homeFullscreenBtn');

  // Floating Settings Modal Elements
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const settingsSoundToggle = document.getElementById('settingsSoundToggle');
  const settingsSoundIcon = document.getElementById('settingsSoundIcon');
  const settingsSoundStatus = document.getElementById('settingsSoundStatus');
  const settingsSoundDesc = document.getElementById('settingsSoundDesc');
  const settingsDrawerTrigger = document.getElementById('settingsDrawerTrigger');
  const settingsFullscreenToggle = document.getElementById('settingsFullscreenToggle');
  const settingsAutoplayToggle = document.getElementById('settingsAutoplayToggle');
  const settingsPlayIcon = document.getElementById('settingsPlayIcon');
  const settingsPlayStatus = document.getElementById('settingsPlayStatus');
  const settingsPlayDesc = document.getElementById('settingsPlayDesc');
  const settingsHomeReturn = document.getElementById('settingsHomeReturn');

  // Heroes Grid Drawer Elements
  const heroesDrawer = document.getElementById('heroesDrawer');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const drawerGrid = document.getElementById('drawerGrid');

  // ===================================================
  // SOUND SYNTHESIZER (Web Audio API)
  // ===================================================
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playWhooshSound() {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, audioCtx.currentTime + 0.18);
      osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}
  }

  function playChimeSound() {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.06);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + i * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.06);
        osc.stop(audioCtx.currentTime + i * 0.06 + 0.45);
      });
    } catch (e) {}
  }

  function playClickSound() {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {}
  }

  // Update Sound UI across Home and Settings Modal
  function updateSoundUI() {
    if (isSoundEnabled) {
      if (homeSoundIcon) homeSoundIcon.textContent = '🔊';
      if (homeSoundBtn) homeSoundBtn.classList.add('active');
      if (settingsSoundIcon) settingsSoundIcon.textContent = '🔊';
      if (settingsSoundStatus) {
        settingsSoundStatus.textContent = 'অন';
        settingsSoundStatus.classList.remove('off');
      }
      if (settingsSoundDesc) settingsSoundDesc.textContent = 'অডিও ইফেক্টস সক্রিয়';
    } else {
      if (homeSoundIcon) homeSoundIcon.textContent = '🔇';
      if (homeSoundBtn) homeSoundBtn.classList.remove('active');
      if (settingsSoundIcon) settingsSoundIcon.textContent = '🔇';
      if (settingsSoundStatus) {
        settingsSoundStatus.textContent = 'অফ';
        settingsSoundStatus.classList.add('off');
      }
      if (settingsSoundDesc) settingsSoundDesc.textContent = 'শব্দ মিউট করা আছে';
    }
  }
  updateSoundUI();

  function toggleSound() {
    initAudio();
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('hero_sound_enabled', isSoundEnabled);
    updateSoundUI();
    if (isSoundEnabled) playClickSound();
  }

  // ===================================================
  // RENDER HERO WITH ANIMATIONS & PASSPORT RATIO
  // ===================================================
  function renderHero(index, isRandomJump = false) {
    if (index < 0 || index >= HEROES_DATA.length) return;
    currentIndex = index;

    const hero = HEROES_DATA[currentIndex];

    // Track history for random non-repeats
    recentIndices.push(currentIndex);
    if (recentIndices.length > 5) recentIndices.shift();

    // 1. Play Transition Sound
    playWhooshSound();

    // 2. Dynamic Theme Variables
    document.documentElement.style.setProperty('--hero-color', hero.themeColor);
    document.documentElement.style.setProperty('--hero-gradient', hero.gradient);
    orb1.style.background = hero.themeColor;

    // 3. Clear any ongoing animation timeouts from previous hero
    activeAnimationTimeouts.forEach(t => clearTimeout(t));
    activeAnimationTimeouts = [];

    // Reset all staggered animation classes
    animElements.forEach(el => {
      if (el) {
        el.classList.remove('anim-active', 'anim-settled', 'anim-pop-in', 'revealed', 'anim-highlight');
      }
    });

    // 4. STEP 1: PHOTO ENTERS FIRST WITH ELASTIC SPRING-IN (Information stays hidden)
    photoFrame.classList.remove('photo-spring');
    void photoFrame.offsetWidth; // Trigger reflow
    photoFrame.classList.add('photo-spring');

    // Update Photo & Badges
    heroImg.classList.remove('animate-zoom');
    heroImg.src = hero.image;
    heroImg.alt = hero.nameBn;

    setTimeout(() => {
      heroImg.classList.add('animate-zoom');
    }, 50);

    heroBadgeText.textContent = hero.badge;
    heroBadgeTag.style.borderColor = hero.themeColor;
    heroBadgeTag.style.color = hero.themeColor;
    
    // Formatted Index: 01 / 30 in Roboto font
    const currentNum = String(currentIndex + 1).padStart(2, '0');
    const totalCount = String(HEROES_DATA.length).padStart(2, '0');
    heroRankIndex.innerHTML = `<span class="numeric">${currentNum}</span>/<span class="numeric">${totalCount}</span>`;
    if (heroRealName) {
      heroRealName.textContent = hero.realName;
    }

    // Helper to wrap numbers in .numeric class for Roboto
    function formatNumbers(str) {
      if (!str) return '';
      return String(str).replace(/([0-9]+|[\u09E6-\u09EF]+)/g, '<span class="numeric">$1</span>');
    }

    // 5. Populate text contents
    heroTitle.textContent = hero.title;
    heroNameBn.textContent = hero.nameBn;
    heroNameEn.textContent = hero.nameEn;

    heroBirthDate.innerHTML = formatNumbers(hero.birthDate);
    heroAge.innerHTML = formatNumbers(hero.age);
    heroProfession.textContent = hero.profession;
    if (heroSpecialty) {
      heroSpecialty.textContent = hero.specialty;
    }

    heroDebut.innerHTML = formatNumbers(hero.debut);

    // Populate Movie Chips (initially hidden, each with distinct colorful theme)
    movieChipsWrap.innerHTML = '';
    const movieChipElements = [];
    hero.famousMovies.forEach((movie, mIdx) => {
      const chip = document.createElement('span');
      chip.className = `movie-chip color-${(mIdx % 8) + 1}`;
      chip.innerHTML = formatNumbers(movie);
      movieChipsWrap.appendChild(chip);
      movieChipElements.push(chip);
    });

    heroDialogue.textContent = `"${hero.famousDialogue}"`;
    heroAchievements.innerHTML = formatNumbers(hero.achievements);

    // 6. PHOTO ENTERS FIRST, THEN ALL TEXT ARRIVES TOGETHER (FULL CARD STAYS FOR SELECTED TIME)
    const photoHoldTime = 320; // Photo lands first

    const tAllTextEntrance = setTimeout(() => {
      playChimeSound();

      // All text & info sections arrive together with dynamic pop-in
      animElements.forEach((el, idx) => {
        if (el) {
          const tItem = setTimeout(() => {
            el.classList.add('anim-pop-in');
            el.classList.add('anim-settled');
          }, idx * 40); // Subtle 40ms fluid wave so they glide in together
          activeAnimationTimeouts.push(tItem);
        }
      });

      // All colorful movie chips bounce in together
      movieChipElements.forEach((chip, cIdx) => {
        const cTimer = setTimeout(() => {
          chip.classList.add('chip-pop');
          chip.classList.add('chip-revealed');
        }, 80 + cIdx * 30);
        activeAnimationTimeouts.push(cTimer);
      });
    }, photoHoldTime);
    activeAnimationTimeouts.push(tAllTextEntrance);

    // 7. Update Grid Drawer selection
    updateGridCurrent();

    // 8. Reset Autoplay progress if playing
    if (isPlaying) {
      resetTimer();
    }
  }

  // ===================================================
  // RANDOM & NAVIGATION HELPERS
  // ===================================================
  function getRandomHeroIndex() {
    const available = [];
    for (let i = 0; i < HEROES_DATA.length; i++) {
      if (!recentIndices.includes(i)) {
        available.push(i);
      }
    }
    const pool = available.length > 0 ? available : HEROES_DATA.map((_, i) => i).filter(i => i !== currentIndex);
    const randomIndex = pool[Math.floor(Math.random() * pool.length)];
    return randomIndex;
  }

  function nextHero(isRandom = true) {
    playClickSound();
    if (isRandom) {
      const nextIdx = getRandomHeroIndex();
      renderHero(nextIdx, true);
    } else {
      const nextIdx = (currentIndex + 1) % HEROES_DATA.length;
      renderHero(nextIdx, false);
    }
  }

  // ===================================================
  // AUTOPLAY TIMER ENGINE
  // ===================================================
  function startAutoplay() {
    isPlaying = true;
    updateAutoplayUI();
    resetTimer();
  }

  function pauseAutoplay() {
    isPlaying = false;
    updateAutoplayUI();
    clearInterval(timerInterval);
    cardTimerBar.style.width = '0%';
  }

  function updateAutoplayUI() {
    if (settingsPlayIcon) settingsPlayIcon.textContent = isPlaying ? '⏸' : '▶';
    if (settingsPlayStatus) {
      settingsPlayStatus.textContent = isPlaying ? 'চলমান' : 'স্থগিত';
      if (isPlaying) settingsPlayStatus.classList.remove('off');
      else settingsPlayStatus.classList.add('off');
    }
    if (settingsPlayDesc) {
      settingsPlayDesc.textContent = isPlaying ? 'স্বয়ংক্রিয়ভাবে পরবর্তী হিরো আসবে' : 'অটো-প্লে স্থগিত আছে';
    }
  }

  function resetTimer() {
    clearInterval(timerInterval);
    progressStep = 0;
    cardTimerBar.style.width = '0%';

    const stepInterval = 50; // every 50ms update progress
    const totalSteps = autoplayDuration / stepInterval;

    timerInterval = setInterval(() => {
      if (!isPlaying) {
        clearInterval(timerInterval);
        return;
      }
      progressStep++;
      const percent = Math.min((progressStep / totalSteps) * 100, 100);
      cardTimerBar.style.width = `${percent}%`;

      if (progressStep >= totalSteps) {
        clearInterval(timerInterval);
        cardTimerBar.style.width = '100%';
        // Advance to next random hero
        nextHero(true);
      }
    }, stepInterval);
  }

  // ===================================================
  // SPEED CONTROL ENGINE ([-], [+], 8s)
  // ===================================================
  function updateSpeedUI() {
    if (speedDisplayVal) {
      speedDisplayVal.textContent = (autoplayDuration / 1000) + 's';
    }
  }
  updateSpeedUI();

  // Speed Up (Faster = fewer seconds)
  function speedUp() {
    initAudio();
    playClickSound();
    if (speedIndex > 0) {
      speedIndex--;
      autoplayDuration = SPEED_STEPS[speedIndex];
      updateSpeedUI();
      if (isPlaying) resetTimer();
    }
  }

  // Speed Down (Slower = more seconds)
  function speedDown() {
    initAudio();
    playClickSound();
    if (speedIndex < SPEED_STEPS.length - 1) {
      speedIndex++;
      autoplayDuration = SPEED_STEPS[speedIndex];
      updateSpeedUI();
      if (isPlaying) resetTimer();
    }
  }

  speedUpBtn.addEventListener('click', speedUp);
  speedDownBtn.addEventListener('click', speedDown);

  // ===================================================
  // SETTINGS MODAL ENGINE
  // ===================================================
  function openSettings() {
    playClickSound();
    settingsModal.classList.add('active');
    settingsModal.setAttribute('aria-hidden', 'false');
    updateSoundUI();
    updateAutoplayUI();
  }

  function closeSettings() {
    playClickSound();
    settingsModal.classList.remove('active');
    settingsModal.setAttribute('aria-hidden', 'true');
  }

  openSettingsBtn.addEventListener('click', openSettings);
  closeSettingsBtn.addEventListener('click', closeSettings);
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettings();
  });

  settingsSoundToggle.addEventListener('click', toggleSound);
  
  settingsAutoplayToggle.addEventListener('click', () => {
    initAudio();
    playClickSound();
    if (isPlaying) pauseAutoplay();
    else startAutoplay();
  });

  settingsDrawerTrigger.addEventListener('click', () => {
    closeSettings();
    openDrawer();
  });

  settingsFullscreenToggle.addEventListener('click', () => {
    toggleFullscreen();
  });

  settingsHomeReturn.addEventListener('click', () => {
    closeSettings();
    pauseAutoplay();
    introOverlay.classList.remove('hidden');
  });

  // ===================================================
  // HOME SCREEN SETTINGS BUTTONS
  // ===================================================
  homeSoundBtn.addEventListener('click', toggleSound);
  
  homeDrawerBtn.addEventListener('click', () => {
    openDrawer();
  });

  homeFullscreenBtn.addEventListener('click', () => {
    toggleFullscreen();
  });

  // ===================================================
  // ALL 10 HEROES GRID DRAWER
  // ===================================================
  function buildHeroesDrawer() {
    drawerGrid.innerHTML = '';
    HEROES_DATA.forEach((hero, idx) => {
      const card = document.createElement('div');
      card.className = `grid-hero-card ${idx === currentIndex ? 'current' : ''}`;
      card.dataset.index = idx;

      card.innerHTML = `
        <img src="${hero.image}" alt="${hero.nameBn}" class="grid-avatar" loading="lazy">
        <div class="grid-name">${hero.nameBn}</div>
        <div class="grid-title">${hero.badge}</div>
      `;

      card.addEventListener('click', () => {
        playClickSound();
        renderHero(idx, false);
        closeDrawer();
      });

      drawerGrid.appendChild(card);
    });
  }

  function updateGridCurrent() {
    const cards = drawerGrid.querySelectorAll('.grid-hero-card');
    cards.forEach(card => {
      const idx = parseInt(card.dataset.index, 10);
      if (idx === currentIndex) {
        card.classList.add('current');
      } else {
        card.classList.remove('current');
      }
    });
  }

  function openDrawer() {
    playClickSound();
    updateGridCurrent();
    heroesDrawer.classList.add('active');
    heroesDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    playClickSound();
    heroesDrawer.classList.remove('active');
    heroesDrawer.setAttribute('aria-hidden', 'true');
  }

  closeDrawerBtn.addEventListener('click', closeDrawer);
  heroesDrawer.addEventListener('click', (e) => {
    if (e.target === heroesDrawer) closeDrawer();
  });

  // ===================================================
  // FULLSCREEN HANDLER
  // ===================================================
  function toggleFullscreen() {
    playClickSound();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // ===================================================
  // EVENT LISTENERS
  // ===================================================

  // Welcome Intro Play Button
  startPlayBtn.addEventListener('click', () => {
    initAudio();
    playChimeSound();
    introOverlay.classList.add('hidden');
    
    // Pick initial random hero
    const initialIndex = Math.floor(Math.random() * HEROES_DATA.length);
    renderHero(initialIndex, true);
    startAutoplay();
  });

  // ONLY Next Button in Bottom Bar
  nextBtn.addEventListener('click', () => {
    initAudio();
    nextHero(true);
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (introOverlay && !introOverlay.classList.contains('hidden')) return;

    if (e.code === 'Space') {
      e.preventDefault();
      initAudio();
      if (isPlaying) pauseAutoplay();
      else startAutoplay();
    } else if (e.code === 'ArrowRight') {
      initAudio();
      nextHero(true);
    } else if (e.key === 'r' || e.key === 'R') {
      initAudio();
      const rand = getRandomHeroIndex();
      renderHero(rand, true);
    } else if (e.key === 'm' || e.key === 'M') {
      toggleSound();
    } else if (e.code === 'Escape') {
      closeDrawer();
      closeSettings();
    }
  });

  // Touch Swipe for Mobile (Left: Next, Right: Next Random)
  heroCard.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  heroCard.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
      initAudio();
      nextHero(true);
    }
  }

  // Tilt Effect on Photo Hover/Touch
  photoFrame.addEventListener('mousemove', (e) => {
    const rect = photoFrame.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    photoFrame.style.transform = `perspective(1000px) rotateY(${x * 0.05}deg) rotateX(${-y * 0.05}deg) scale(1.03)`;
  });

  // ===================================================
  // PWA (PROGRESSIVE WEB APP) & INSTALL PROMPT ENGINE
  // ===================================================
  let deferredPrompt = null;
  const homeInstallBtn = document.getElementById('homeInstallBtn');
  const settingsInstallBtn = document.getElementById('settingsInstallBtn');
  const settingsInstallBadge = document.getElementById('settingsInstallBadge');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('Hero PWA ServiceWorker active:', reg.scope))
        .catch((err) => console.warn('Hero PWA ServiceWorker error:', err));
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (homeInstallBtn) {
      homeInstallBtn.classList.add('active');
    }
    if (settingsInstallBadge) {
      settingsInstallBadge.textContent = 'ইনস্টল রেডি';
    }
  });

  function triggerPWAInstall() {
    initAudio();
    playClickSound();

    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User installed the Hero app');
          if (settingsInstallBadge) settingsInstallBadge.textContent = 'ইনস্টল হয়েছে';
        }
        deferredPrompt = null;
      });
    } else {
      const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
      if (isIos) {
        alert("📲 আইফোনে ইনস্টল করার নিয়ম:\n\n১. নিচে থাকা Safari Share (শেয়ার) আইকনে চাপুন।\n২. মেনু থেকে 'Add to Home Screen' বেছে নিন।\n৩. উপরে 'Add' বাটনে চাপলেই হোম স্ক্রিনে অ্যাপ চলে আসবে!");
      } else if (window.matchMedia('(display-mode: standalone)').matches) {
        alert("✅ অ্যাপটি ইতিমধ্যে আপনার হোম স্ক্রিনে ইনস্টল করা আছে!");
      } else {
        alert("📲 হোম স্ক্রিনে ইনস্টল করার জন্য:\n\nব্রাউজারের ডানপাশের মেনু (তিনটি ডট ⋮) চাপুন এবং 'Add to Home screen' বা 'Install app' অপশনটি বেছে নিন!");
      }
    }
  }

  if (homeInstallBtn) homeInstallBtn.addEventListener('click', triggerPWAInstall);
  if (settingsInstallBtn) settingsInstallBtn.addEventListener('click', triggerPWAInstall);

  window.addEventListener('appinstalled', () => {
    console.log('Hero app installed successfully');
    deferredPrompt = null;
    if (settingsInstallBadge) settingsInstallBadge.textContent = 'ইনস্টল হয়েছে';
  });

  // Initialize Drawer Grid
  buildHeroesDrawer();

  // Initial render (First hero ready behind intro)
  renderHero(0, false);
});
