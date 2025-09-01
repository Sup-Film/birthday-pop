// Small, cute interactions for the birthday page 💖

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Palette
const COLORS = [
  "#ff6fb5", "#ff9ecd", "#ffd3e6",
  "#7aa2ff", "#cfe0ff", "#ffe9a8",
  "#9be3c5", "#f7a9a8"
];

// Confetti
function confetti(burst = 160) {
  for (let i = 0; i < burst; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    piece.style.background = color;
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.top = -10 + "px";
    const rotate = (Math.random() * 360) | 0;
    const scale = 0.8 + Math.random() * 0.6;
    piece.style.transform = `rotate(${rotate}deg) scale(${scale})`;

    document.body.appendChild(piece);

    const duration = 2800 + Math.random() * 2200; // ms
    const driftX = (Math.random() * 200 - 100); // px

    const anim = piece.animate([
      { transform: `translate(0, 0) rotate(${rotate}deg) scale(${scale})`, offset: 0 },
      { transform: `translate(${driftX}px, 110vh) rotate(${rotate + 180}deg) scale(${scale})`, offset: 1 }
    ], { duration, easing: "linear" });
    anim.onfinish = () => piece.remove();
  }
}

// Fireworks (Canvas-based)
let fxCanvas, fxCtx, dpr = Math.min(window.devicePixelRatio || 1, 2);
function setupFireworks() {
  fxCanvas = document.getElementById('fxCanvas');
  if (!fxCanvas) return;
  fxCtx = fxCanvas.getContext('2d');
  const resize = () => {
    fxCanvas.width = Math.floor(innerWidth * dpr);
    fxCanvas.height = Math.floor(innerHeight * dpr);
    fxCanvas.style.width = innerWidth + 'px';
    fxCanvas.style.height = innerHeight + 'px';
    fxCtx.scale(dpr, dpr);
  };
  resize();
  window.addEventListener('resize', resize);
}

const fireworks = [];
function spawnFirework(x, y, color) {
  const particles = 40 + (Math.random()*20|0);
  for (let i=0;i<particles;i++) {
    const angle = (Math.PI*2) * (i/particles);
    const speed = 2 + Math.random()*3;
    fireworks.push({
      x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
      life: 60 + (Math.random()*20|0), color, alpha: 1
    });
  }
}

let fwRAF, fwRunning = false;
function fireworksLoop() {
  if (!fxCtx) return;
  fwRunning = true;
  fxCtx.clearRect(0,0, innerWidth, innerHeight);
  for (let i=fireworks.length-1; i>=0; i--) {
    const p = fireworks[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.04; // gravity
    p.life -= 1;
    p.alpha = Math.max(0, p.life/80);
    fxCtx.globalAlpha = p.alpha;
    fxCtx.fillStyle = p.color;
    fxCtx.fillRect(p.x, p.y, 2, 2);
    if (p.life <= 0) fireworks.splice(i,1);
  }
  fxCtx.globalAlpha = 1;
  if (fireworks.length) fwRAF = requestAnimationFrame(fireworksLoop);
  else fwRunning = false;
}

function startFireworks(durationMs = 2000) {
  if (!fxCtx) return;
  const spawn = () => {
    const x = Math.random()*innerWidth*0.8 + innerWidth*0.1;
    const y = Math.random()*innerHeight*0.4 + innerHeight*0.1;
    spawnFirework(x, y, COLORS[Math.floor(Math.random()*COLORS.length)]);
    if (!fwRunning) fireworksLoop();
  };
  const timer = setInterval(spawn, 220);
  spawn();
  setTimeout(() => clearInterval(timer), durationMs);
}

// Hearts on click
function spawnHeart(x, y) {
  const heart = document.createElement("div");
  heart.className = "heart";
  heart.style.left = x + "px";
  heart.style.top = y + "px";
  heart.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  document.body.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove());
}

// Balloons
function releaseBalloons(count = 8) {
  for (let i = 0; i < count; i++) {
    const b = document.createElement("div");
    b.className = "balloon";
    b.style.left = Math.random() * 100 + "vw";
    b.style.background = `radial-gradient(circle at 30% 30%, #fff8, transparent 50%), ${COLORS[i % COLORS.length]}`;
    const delay = Math.random() * 1000;
    b.style.animationDelay = delay + "ms";
    document.body.appendChild(b);
    b.addEventListener("animationend", () => b.remove());
  }
}

// Typewriter for the wish message
function typeText(el, text, speed = 28) {
  el.innerHTML = "";
  const parsed = text.replaceAll("/", "\n");
  let i = 0;
  return new Promise(resolve => {
    const tick = () => {
      if (i > parsed.length) return resolve();
      const ch = parsed[i++] || "";
      if (ch === "\n") el.innerHTML += "<br/>";
      else el.textContent += ch;
      setTimeout(tick, speed + Math.random() * 40);
    };
    tick();
  });
}

// Drag & Drop images into gallery
function setupDragDrop() {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  const prevent = e => { e.preventDefault(); e.stopPropagation(); };
  ["dragenter", "dragover", "dragleave", "drop"].forEach(evt => {
    gallery.addEventListener(evt, prevent);
  });
  gallery.addEventListener("dragover", () => gallery.classList.add("dragover"));
  gallery.addEventListener("dragleave", () => gallery.classList.remove("dragover"));
  gallery.addEventListener("drop", e => {
    gallery.classList.remove("dragover");
    const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith("image/"));
    if (!files.length) return;
    const imgs = $$('img', gallery);
    files.slice(0, imgs.length).forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      imgs[idx].src = url;
      imgs[idx].alt = file.name;
    });
  });
}

// Music toggle
function setupMusic() {
  const audio = $("#bgm");
  const btn = $("#musicToggle");
  if (!audio || !btn) return;

  const updateLabel = () => {
    btn.textContent = (audio.paused ? "เพลงปิดอยู่" : "กำลังเล่นเพลง") + " ♪";
    btn.setAttribute("aria-pressed", String(!audio.paused));
  };

  audio.addEventListener("error", () => {
    btn.textContent = "เพิ่มเพลงได้ที่ assets/audio/";
    btn.disabled = true;
  });

  btn.addEventListener("click", async () => {
    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (e) {
      // Autoplay policy may block; user interaction should allow, ignore
    } finally {
      updateLabel();
    }
  });

  updateLabel();
}

// Cake: candles blow/relight + optional mic
function setupCake() {
  const candles = $$('.candle');
  const blowBtn = $('#blowBtn');
  const relightBtn = $('#relightBtn');
  const micBtn = $('#micToggle');
  if (!candles.length) return;

  const blow = () => candles.forEach(c => { c.classList.add('out'); });
  const relight = () => candles.forEach(c => { c.classList.remove('out'); });

  blowBtn?.addEventListener('click', blow);
  relightBtn?.addEventListener('click', relight);

  let stream, audioCtx, analyser, dataArray, micOn = false, raf;
  async function toggleMic() {
    if (micOn) {
      micOn = false; micBtn.setAttribute('aria-pressed','false'); micBtn.textContent = 'ใช้ไมค์เป่า';
      cancelAnimationFrame(raf);
      try { stream?.getTracks().forEach(t=>t.stop()); } catch {}
      audioCtx?.close?.();
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);
      micOn = true; micBtn.setAttribute('aria-pressed','true'); micBtn.textContent = 'ปิดไมค์';
      const loop = () => {
        analyser.getByteTimeDomainData(dataArray);
        // Simple RMS amplitude
        let sum = 0;
        for (let i=0;i<dataArray.length;i++) { const v = (dataArray[i]-128)/128; sum += v*v; }
        const rms = Math.sqrt(sum/dataArray.length);
        if (rms > 0.14) { // threshold to "blow"
          blow();
        }
        if (micOn) raf = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      micOn = false; micBtn.textContent = 'ไมค์ใช้ไม่ได้'; micBtn.disabled = true;
    }
  }
  micBtn?.addEventListener('click', toggleMic);
}

// Main interactions
window.addEventListener("DOMContentLoaded", () => {
  const celebrateBtn = $("#celebrateBtn");
  const balloonBtn = $("#balloonBtn");
  const openCardBtn = $("#openCard");
  const replayTypeBtn = $("#replayType");
  const confettiAgainBtn = $("#confettiAgain");
  const fireworksBtn = $("#fireworksBtn");
  const wishCard = document.querySelector(".wish");
  const typed = $("#typed");

  celebrateBtn?.addEventListener("click", () => confetti());
  balloonBtn?.addEventListener("click", () => releaseBalloons());

  openCardBtn?.addEventListener("click", async () => {
    wishCard?.classList.add("open");
    if (typed) await typeText(typed, typed.dataset.text || "");
    confetti(100);
    startFireworks(2200);
  });

  replayTypeBtn?.addEventListener("click", async () => {
    if (typed) await typeText(typed, typed.dataset.text || "");
  });
  confettiAgainBtn?.addEventListener("click", () => confetti(140));
  fireworksBtn?.addEventListener("click", () => startFireworks(1800));

  // Hearts on any click (avoid on buttons only if modifier?)
  document.addEventListener("click", (e) => {
    // avoid spawning when clicking on controls to reduce clutter
    const target = e.target;
    const shouldSkip = target.closest?.("button, a, input, textarea, select, label");
    if (shouldSkip) return;
    spawnHeart(e.clientX, e.clientY);
  });

  setupDragDrop();
  setupMusic();
  setupFireworks();
  setupCake();
});
