console.log('🔥 FOTOJUT READY');

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) 
  || window.innerWidth < 768;
console.log('Device:', isMobile ? '📱 Mobile' : '💻 Desktop');

const video = document.getElementById('video');
const startBtn = document.getElementById('startMulti');
const downloadBtn = document.getElementById('downloadBtn');
const countdown = document.getElementById('countdown');
const stripCanvas = document.getElementById('stripCanvas');
const ctx = stripCanvas.getContext('2d');

const photos = [];
const TOTAL_SHOTS = 6;
const TIMER = 3;
const previewWrap = document.getElementById('photoPreviews');

function addPreview(img) {
  const thumb = document.createElement('img');
  thumb.src = img.src;
  previewWrap.appendChild(thumb);
}

/* ======================
   CAMERA INIT
====================== */
(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
  facingMode: "user",
  width: { ideal: 1280 },
  height: { ideal: 720 }
}
    });
    video.srcObject = stream;
    await video.play();
  } catch (err) {
    console.error('Camera error:', err);
  }
})();

/* ======================
   FRAME HANDLER
====================== */
const frameImg = new Image();
let currentFrame = 'frame1.PNG';

function setFrame(name) {
  currentFrame = name;
  frameImg.src = `assets/${name}`;
}

setFrame(currentFrame);

/* 🔥 FIX PENTING: pastikan frame ke-load */
frameImg.onload = () => {
  console.log('✅ Frame loaded');
};

document.querySelectorAll('.frame-thumb').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.frame-thumb')
      .forEach(t => t.classList.remove('active'));

    el.classList.add('active');
    setFrame(el.dataset.frame);
  });
});

/* ======================
   HELPER
====================== */
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ======================
   COUNTDOWN + FLASH
====================== */
async function runCountdown() {
  countdown.classList.remove('hidden');

  for (let t = TIMER; t > 0; t--) {
    countdown.textContent = t;
    await sleep(1000);
  }

  countdown.classList.add('hidden');
}

function triggerFlash() {
  const flash = document.getElementById('flash');
  if (!flash) return;

  flash.classList.add('active');
  setTimeout(() => flash.classList.remove('active'), 200);
}

/* ======================
   CAPTURE FOTO
====================== */
async function capturePhoto() {
  const vw = video.videoWidth;
  const vh = video.videoHeight;

  if (!vw || !vh) {
    console.warn('Video belum ready');
    return;
  }

  const c = document.createElement('canvas');
  const cctx = c.getContext('2d');

  let sx = 0, sy = 0, sw = vw, sh = vh;

  if (!isMobile) {
    // 💻 DESKTOP → crop biar sama preview
    const displayRatio = video.clientWidth / video.clientHeight;
    const videoRatio = vw / vh;

    if (videoRatio > displayRatio) {
      sw = vh * displayRatio;
      sx = (vw - sw) / 2;
    } else {
      sh = vw / displayRatio;
      sy = (vh - sh) / 2;
    }
  }

  // 📱 MOBILE → full frame (NO ZOOM)
  c.width = sw;
  c.height = sh;

  cctx.translate(sw, 0);
  cctx.scale(-1, 1);
  cctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

  const img = new Image();
  img.src = c.toDataURL();
  await img.decode();

  photos.push(img);
  addPreview(img);
}

/* ======================
   DRAW COVER
====================== */
function drawCover(img, x, y, w, h) {
  const ir = img.width / img.height;
  const br = w / h;

  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (ir > br) {
    sw = img.height * br;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / br;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/* ======================
   RENDER STRIP (ANTI KOSONG)
====================== */
function renderStrip() {
  if (!frameImg.complete) {
    console.warn('Frame belum ready, nunggu...');
    frameImg.onload = renderStrip;
    return;
  }

  if (photos.length === 0) {
    console.warn('Belum ada foto');
    return;
  }

  stripCanvas.width = frameImg.width;
  stripCanvas.height = frameImg.height;

  ctx.clearRect(0, 0, stripCanvas.width, stripCanvas.height);

  const slots = [
    { x: 55, y: 60, w: 488, h: 488 },
    { x: 652, y: 60, w: 488, h: 488 },
    { x: 55, y: 565, w: 488, h: 488 },
    { x: 652, y: 565, w: 488, h: 488 },
    { x: 55, y: 1070, w: 488, h: 488 },
    { x: 652, y: 1070, w: 488, h: 488 },
  ];

  photos.forEach((img, i) => {
    if (slots[i]) {
      drawCover(img, slots[i].x, slots[i].y, slots[i].w, slots[i].h);
    }
  });

  ctx.drawImage(frameImg, 0, 0);

  console.log('✅ STRIP RENDERED');
}

/* ======================
   BUTTONS
====================== */
const singleBtn = document.getElementById('takeSingle');
const retakeBtn = document.getElementById('retakeLast');

singleBtn?.addEventListener('click', async () => {
  if (photos.length >= TOTAL_SHOTS) return;

  await runCountdown();
  triggerFlash();
  await capturePhoto();

  if (photos.length === TOTAL_SHOTS) {
    renderStrip();
    singleBtn.disabled = true;
  }
});

retakeBtn?.addEventListener('click', () => {
  if (photos.length === 0) return;

  photos.pop();

  const previews = document.querySelectorAll('#photoPreviews img');
  if (previews.length) previews[previews.length - 1].remove();

  singleBtn.disabled = false;
});

/* ======================
   MULTI SHOT
====================== */
startBtn.addEventListener('click', async () => {
  photos.length = 0;
  previewWrap.innerHTML = '';
  singleBtn.disabled = false;

  for (let i = 0; i < TOTAL_SHOTS; i++) {
    await runCountdown();
    triggerFlash();
    await capturePhoto();
    await sleep(400);
  }

  renderStrip();
});

/* ======================
   DOWNLOAD
====================== */
downloadBtn.addEventListener('click', () => {
  renderStrip();

  const link = document.createElement('a');
  link.download = 'fotojut-result.png';
  link.href = stripCanvas.toDataURL();
  link.click();
});