/* ============================================================
   STARFIELD — a lightweight 3D-style particle field.
   Stars live at different "depths" (z). Closer stars are
   bigger, brighter, and drift faster, giving a real sense of
   depth as you scroll or move your mouse/tilt your phone.
   ============================================================ */
(function starfield(){
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let w, h, stars = [];
  const STAR_COUNT = 160;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function makeStar(){
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 1 + 0.15,        // depth: 0.15 (far) -> 1.15 (near)
      r: Math.random() * 1.4 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.15 + 0.02
    };
  }
  for (let i = 0; i < STAR_COUNT; i++) stars.push(makeStar());

  // gentle parallax offset driven by pointer / device tilt
  let parallaxX = 0, parallaxY = 0;
  let targetX = 0, targetY = 0;

  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / w - 0.5) * 18;
    targetY = (e.clientY / h - 0.5) * 18;
  });
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    targetX = Math.max(-18, Math.min(18, e.gamma / 3));
    targetY = Math.max(-18, Math.min(18, (e.beta - 40) / 4));
  });

  function draw(){
    ctx.clearRect(0, 0, w, h);
    parallaxX += (targetX - parallaxX) * 0.04;
    parallaxY += (targetY - parallaxY) * 0.04;

    for (const s of stars){
      s.twinkle += s.speed;
      s.y += s.speed * 0.4; // slow downward drift
      if (s.y > h) s.y = 0;

      const depthShiftX = parallaxX * s.z;
      const depthShiftY = parallaxY * s.z;
      const alpha = 0.5 + Math.sin(s.twinkle) * 0.4;
      const size = s.r * s.z * 2;

      ctx.beginPath();
      ctx.fillStyle = `rgba(251,244,248,${Math.max(0.15, alpha).toFixed(2)})`;
      ctx.arc(s.x + depthShiftX, s.y + depthShiftY, size, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ============================================================
   SIDE NAV DOTS — highlight the section currently in view
   ============================================================ */
(function navDots(){
  const panels = document.querySelectorAll('.panel');
  const dots = document.querySelectorAll('.dot');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.id;
        dots.forEach(d => d.classList.toggle('active', d.dataset.target === id));
      }
    });
  }, { threshold: 0.6 });
  panels.forEach(p => observer.observe(p));

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      document.getElementById(dot.dataset.target)?.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   CD / AUDIO PLAYER
   ============================================================ */
(function cdPlayer(){
  const cd = document.getElementById('cd');
  const audio = document.getElementById('song');
  const btn = document.getElementById('playBtn');
  const miniPlayer = document.getElementById('miniPlayer');

  btn.addEventListener('click', () => {
    if (audio.paused){
      audio.play().catch(() => {
        // If assets/song.mp3 hasn't been added yet, this will just no-op.
        console.info('Add your audio file at assets/song.mp3 to enable playback.');
      });
      cd.classList.add('spinning');
      btn.classList.add('playing');
      btn.querySelector('.icon').innerHTML = '&#10074;&#10074;';
      miniPlayer.classList.remove('hidden');
    } else {
      audio.pause();
      cd.classList.remove('spinning');
      btn.classList.remove('playing');
      btn.querySelector('.icon').innerHTML = '&#9658;';
      miniPlayer.classList.add('hidden');
    }
  });

  // clicking the mini indicator itself also pauses, from anywhere on the site
  miniPlayer.addEventListener('click', () => btn.click());

  audio.addEventListener('ended', () => {
    cd.classList.remove('spinning');
    btn.classList.remove('playing');
    btn.querySelector('.icon').innerHTML = '&#9658;';
    miniPlayer.classList.add('hidden');
  });
})();

/* ============================================================
   AMBIENT FLOATING HEARTS — soft, occasional, low-opacity
   hearts drifting up from the bottom of the screen throughout
   the whole scroll. Very subtle so it never distracts.
   ============================================================ */
(function floatingHearts(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function spawnHeart(){
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerHTML = '&#10084;';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.fontSize = (Math.random() * 10 + 10) + 'px';
    heart.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
    heart.style.animationDuration = (Math.random() * 6 + 9) + 's';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 16000);
  }

  setInterval(spawnHeart, 2600);
})();

/* ============================================================
   "DOES SHE LOVE ME?" — playful yes/no interaction.
   The "no" button gently dodges the cursor a few times before
   settling, and if it's ever actually clicked, a soft
   heartbreak animation plays before resetting.
   ============================================================ */
(function questionGame(){
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const heartbreak = document.getElementById('heartbreak');
  const revealModal = document.getElementById('revealModal');
  const closeReveal = document.getElementById('closeReveal');
  const answerRow = noBtn?.closest('.answer-row');

  let dodges = 0;
  const MAX_DODGES = 4;

  function dodge(){
    if (dodges >= MAX_DODGES || !answerRow) return;
    dodges++;
    const rowRect = answerRow.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const maxX = window.innerWidth - btnRect.width - 20;
    const maxY = window.innerHeight - btnRect.height - 20;
    const newX = Math.max(20, Math.random() * maxX);
    const newY = Math.max(20, Math.random() * maxY);
    noBtn.classList.add('dodging');
    noBtn.style.left = newX + 'px';
    noBtn.style.top = newY + 'px';
  }

  noBtn?.addEventListener('mouseenter', dodge);
  noBtn?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodge();
  }, { passive: false });

  noBtn?.addEventListener('click', () => {
    heartbreak.classList.remove('hidden');
    setTimeout(() => {
      heartbreak.classList.add('hidden');
      noBtn.classList.remove('dodging');
      noBtn.style.left = '';
      noBtn.style.top = '';
      dodges = 0;
    }, 2200);
  });

  yesBtn?.addEventListener('click', () => {
    revealModal.classList.remove('hidden');
  });

  closeReveal?.addEventListener('click', () => {
    revealModal.classList.add('hidden');
  });
})();
