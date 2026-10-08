/* =====================================================
   LINKS: websites + maps (quotes ke andar link daalo)
   Khali ('') chhodo to click par kuch nahi hoga.
   ===================================================== */
const LINKS = {
  webBog:        'https://bog-international.com/',   // BOG website
  webAldo:       'https://aldopartnersmd.com/',   // ALDO website
  mapUganda:     '',   // Uganda Google Maps link
  mapMadagascar: ''    // Madagascar Google Maps link
};

/* =====================================================
   SOCIAL: har platform ke liye BOG aur ALDO dono ke links
   - dono bhare hon  -> popup aayega (BOG / ALDO chuno)
   - sirf ek bhara   -> seedha wahi khulega
   - dono khali      -> kuch nahi hoga
   ===================================================== */
const SOCIAL = {
  linkedin: {
    bog:  'https://www.linkedin.com/in/bathia-ocean-gold-international-277887438',
    aldo: 'https://www.instagram.com/bathiaoceangold'   // ALDO LinkedIn link yahan daalo
  },
  instagram: {
    bog:  'https://www.instagram.com/bathiaoceangold',
    aldo: ''   // ALDO Instagram link yahan daalo
  },
  facebook: {
    bog:  'https://www.facebook.com/share/19YTEJqdeT/?mibextid=wwXIfr',
    aldo: ''   // ALDO Facebook link yahan daalo
  },
  tiktok: {
    bog:  'https://www.tiktok.com/@BOG3166',
    aldo: ''   // ALDO TikTok link yahan daalo
  }
};
const SOCIAL_NAMES = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok'
};

/* ---------- normal links (websites + maps) ---------- */
document.querySelectorAll('[data-link]').forEach(el => {
  const key = el.dataset.link;
  if (SOCIAL[key]) return;                  // social neeche handle hota hai
  const url = LINKS[key];
  if (url) {
    el.href = url;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  } else {
    el.addEventListener('click', e => e.preventDefault());
  }
});

/* ---------- social links: popup chooser ---------- */
const chooser      = document.getElementById('chooser');
const chooseBog    = document.getElementById('chooseBog');
const chooseAldo   = document.getElementById('chooseAldo');
const chooserTitle = document.getElementById('chooserTitle');
const chooserClose = document.getElementById('chooserClose');

function closeChooser() {
  if (!chooser) return;
  chooser.classList.remove('open');
  chooser.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-link]').forEach(el => {
  const key = el.dataset.link;
  if (!SOCIAL[key]) return;

  el.addEventListener('click', e => {
    e.preventDefault();
    const { bog, aldo } = SOCIAL[key];

    if (!bog && !aldo) return;                                   // koi link nahi
    if (bog && !aldo) { window.open(bog,  '_blank', 'noopener'); return; }
    if (aldo && !bog) { window.open(aldo, '_blank', 'noopener'); return; }

    /* dono links hain -> popup */
    if (!chooser) { window.open(bog, '_blank', 'noopener'); return; }
    chooserTitle.textContent = SOCIAL_NAMES[key];
    chooseBog.href  = bog;
    chooseAldo.href = aldo;
    chooser.classList.add('open');
    chooser.setAttribute('aria-hidden', 'false');
  });
});

if (chooser) {
  chooserClose.addEventListener('click', closeChooser);
  chooser.addEventListener('click', e => { if (e.target === chooser) closeChooser(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeChooser(); });
  [chooseBog, chooseAldo].forEach(a =>
    a.addEventListener('click', () => setTimeout(closeChooser, 150))
  );
}

/* =====================================================
   FIT TO SCREEN: design ko phone ki width par scale karta hai
   ===================================================== */
const DESIGN_W = 860;
const stage = document.getElementById('stage');
const card  = document.getElementById('card');

function fit() {
  const avail = document.documentElement.clientWidth - 20;
  const s = Math.min(1, avail / DESIGN_W);
  card.style.transform = 'scale(' + s + ')';
  stage.style.width  = (DESIGN_W * s) + 'px';
  stage.style.height = (card.offsetHeight * s) + 'px';
}
fit();
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', fit);
window.addEventListener('load', fit);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

/* =====================================================
   GLOBE: rotating gold world map + orbits + connections
   ===================================================== */
const canvas = document.getElementById('globe');
const ctx = canvas.getContext('2d');
const W = 620, H = 360, CX = W / 2, CY = H / 2, R = 140;

/* sharp rendering: screen ke hisab se resolution, minimum 3x, maximum 4x */
let Q = 3;
function sizeCanvas() {
  Q = Math.min(4, Math.max(3, Math.ceil((window.devicePixelRatio || 1) * 2)));
  canvas.width  = Math.round(W * Q);
  canvas.height = Math.round(H * Q);
  ctx.setTransform(Q, 0, 0, Q, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}
sizeCanvas();
window.addEventListener('resize', sizeCanvas);

const reduceMotion = window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ROTATION_SPEED = reduceMotion ? 0 : 0.014;   // rotation speed yahan se badlo

const projection = d3.geoOrthographic().scale(R).translate([CX, CY]).clipAngle(90);
const path = d3.geoPath(projection, ctx);
const graticule = d3.geoGraticule10();

/* colours */
const landGrad = ctx.createLinearGradient(CX - R, CY - R, CX + R, CY + R);
landGrad.addColorStop(0, '#fbe59a');
landGrad.addColorStop(0.5, '#d9a21b');
landGrad.addColorStop(1, '#9c6f0c');

/* locations */
const places = [
  { name: 'UGANDA',     coord: [32.3, 1.4],   dx: -16, dy: -4,  align: 'right' },
  { name: 'MADAGASCAR', coord: [46.8, -19.5], dx: 16,  dy: 12,  align: 'left'  },
  { name: 'DUBAI',      coord: [55.3, 25.2],  dx: 16,  dy: -10, align: 'left'  }
];
const routes = [[0, 1], [1, 2], [2, 0]];

/* thin orbit rings */
const orbits = [
  { r: 215, tilt: 0.32, rot: -0.42, speed: 0.00050, off: 0, dash: false },
  { r: 238, tilt: 0.28, rot:  0.36, speed: -0.00035, off: 2, dash: true  },
  { r: 192, tilt: 0.45, rot:  0.05, speed: 0.00028, off: 4, dash: false }
];

const sparkles = [[-74,40],[2,48],[37,-1],[78,22],[116,-30],[-58,-14],[139,36],[32,31],[12,8],[100,14]];

let land = null;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json')
  .then(r => r.json())
  .then(world => { land = topojson.feature(world, world.objects.land); })
  .catch(() => { /* internet na ho to globe bina land ke chalta rahega */ });

/* ---------- helpers ---------- */
function orbPt(o, th) {
  const x = o.r * Math.cos(th), z0 = o.r * Math.sin(th);
  const y = z0 * Math.sin(o.tilt), z = z0 * Math.cos(o.tilt);
  return {
    X: CX + x * Math.cos(o.rot) - y * Math.sin(o.rot),
    Y: CY + x * Math.sin(o.rot) + y * Math.cos(o.rot),
    z
  };
}

function drawOrbits(front, t) {
  orbits.forEach(o => {
    ctx.save();
    ctx.beginPath();
    const step = 0.05;
    for (let th = 0; th < Math.PI * 2; th += step) {
      const a = orbPt(o, th), b = orbPt(o, th + step);
      if (((a.z + b.z) / 2 > 0) === front) {
        ctx.moveTo(a.X, a.Y);
        ctx.lineTo(b.X, b.Y);
      }
    }
    ctx.strokeStyle = front ? 'rgba(212,160,23,.85)' : 'rgba(212,160,23,.35)';
    ctx.lineWidth = front ? 1 : 0.8;
    ctx.setLineDash(o.dash ? [2, 6] : []);
    ctx.stroke();
    ctx.restore();

    /* moving dots */
    for (let k = 0; k < 2; k++) {
      const th = t * o.speed * 6 + o.off + k * Math.PI;
      const p = orbPt(o, th);
      if ((p.z > 0) !== front) continue;
      const g = ctx.createRadialGradient(p.X, p.Y, 0, p.X, p.Y, 9);
      g.addColorStop(0, 'rgba(255,250,200,1)');
      g.addColorStop(0.4, 'rgba(255,215,100,.8)');
      g.addColorStop(1, 'rgba(255,200,60,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.X, p.Y, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff6c4';
      ctx.beginPath(); ctx.arc(p.X, p.Y, 2.2, 0, Math.PI * 2); ctx.fill();
    }
  });
}

function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function arrowAt(pts, u, dir) {
  const n = pts.length - 1;
  const i = clamp(Math.floor(u * n), 0, n - 1);
  const a = pts[i], b = pts[i + 1];
  if (!a || !b) return;
  const x = a.x + (b.x - a.x) * (u * n - i);
  const y = a.y + (b.y - a.y) * (u * n - i);
  const ang = Math.atan2((b.y - a.y) * dir, (b.x - a.x) * dir);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.shadowColor = 'rgba(255,200,60,.9)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(7, 0); ctx.lineTo(-5, -5); ctx.lineTo(-2, 0); ctx.lineTo(-5, 5);
  ctx.closePath();
  ctx.fillStyle = '#ffe28a';
  ctx.fill();
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = '#8a5f08';
  ctx.stroke();
  ctx.restore();
}

function drawConnections(t, center) {
  routes.forEach(([ia, ib], idx) => {
    const interp = d3.geoInterpolate(places[ia].coord, places[ib].coord);
    const N = 60, pts = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const ll = interp(u);
      const vis = d3.geoDistance(ll, center) < Math.PI / 2 - 0.02;
      const p = projection(ll);
      const k = 1 + 0.2 * Math.sin(Math.PI * u);
      pts.push(vis && p ? { x: CX + (p[0] - CX) * k, y: CY + (p[1] - CY) * k } : null);
    }
    /* split into visible runs */
    const runs = []; let cur = [];
    pts.forEach(p => { if (p) cur.push(p); else { if (cur.length > 1) runs.push(cur); cur = []; } });
    if (cur.length > 1) runs.push(cur);

    runs.forEach(run => {
      ctx.save();
      ctx.beginPath();
      run.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.strokeStyle = 'rgba(255,200,60,.28)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.setLineDash([6, 5]);
      ctx.lineDashOffset = -t * 0.03;
      ctx.strokeStyle = '#fff2b0';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = 'rgba(255,200,60,.9)';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.restore();
    });

    /* moving arrows (only if whole arc visible) */
    if (pts.every(Boolean)) {
      const u = ((t * 0.00035) + idx * 0.33) % 1;
      arrowAt(pts, u, 1);
      arrowAt(pts, 1 - ((u + 0.5) % 1), -1);
    }
  });
}

function drawPlaces(t, center) {
  places.forEach((pl, i) => {
    const cosd = Math.cos(d3.geoDistance(pl.coord, center));
    if (cosd <= 0.02) return;
    const p = projection(pl.coord);
    if (!p) return;
    const alpha = clamp((cosd - 0.05) / 0.3, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;

    /* pulse ring */
    const k = ((t / 1400) + i * 0.33) % 1;
    ctx.beginPath(); ctx.arc(p[0], p[1], 5 + k * 17, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,215,90,${(1 - k) * 0.9})`;
    ctx.lineWidth = 1.5; ctx.stroke();

    /* marker */
    const g = ctx.createRadialGradient(p[0] - 1, p[1] - 1, 0, p[0], p[1], 6);
    g.addColorStop(0, '#fffbe0'); g.addColorStop(1, '#d4a017');
    ctx.shadowColor = 'rgba(255,200,60,1)'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1; ctx.strokeStyle = '#0b3b2a'; ctx.stroke();

    /* label pill */
    ctx.font = '700 10px Cinzel, "Times New Roman", serif';
    const tw = ctx.measureText(pl.name).width;
    const w = tw + 18, h = 20;
    const lx = pl.align === 'left' ? p[0] + pl.dx : p[0] + pl.dx - w;
    const ly = p[1] + pl.dy - h / 2;

    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.lineTo(pl.align === 'left' ? lx : lx + w, ly + h / 2);
    ctx.strokeStyle = 'rgba(212,160,23,.9)'; ctx.lineWidth = 1; ctx.stroke();

    rr(lx, ly, w, h, 10);
    const bg = ctx.createLinearGradient(0, ly, 0, ly + h);
    bg.addColorStop(0, '#14543b'); bg.addColorStop(1, '#06261b');
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = '#d4a017'; ctx.lineWidth = 1.3; ctx.stroke();

    ctx.fillStyle = '#f7d774';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(pl.name, lx + w / 2, ly + h / 2 + 0.5);
    ctx.restore();
  });
}

/* ---------- main loop ---------- */
function drawFrame(t) {
  /* tab chhupa ho to drawing skip (battery bachti hai) */
  if (document.hidden) return;

  const lam = -45 + t * ROTATION_SPEED;
  projection.rotate([lam, -18, 0]);
  const center = [-lam, 18];

  ctx.clearRect(0, 0, W, H);

  /* back half of orbits */
  drawOrbits(false, t);

  /* glass sphere */
  const sg = ctx.createRadialGradient(CX - R * 0.3, CY - R * 0.35, 8, CX, CY, R);
  sg.addColorStop(0, 'rgba(255,255,255,1)');
  sg.addColorStop(0.6, 'rgba(255,243,210,.95)');
  sg.addColorStop(1, 'rgba(236,196,92,.9)');
  ctx.beginPath(); path({ type: 'Sphere' });
  ctx.fillStyle = sg; ctx.fill();

  /* grid */
  ctx.beginPath(); path(graticule);
  ctx.strokeStyle = 'rgba(200,150,30,.25)'; ctx.lineWidth = 0.5; ctx.stroke();

  /* gold land */
  if (land) {
    ctx.beginPath(); path(land);
    ctx.fillStyle = landGrad; ctx.fill();
    ctx.strokeStyle = '#8a5f08'; ctx.lineWidth = 0.6; ctx.stroke();
  }

  /* twinkling lights */
  sparkles.forEach(([lon, lat], i) => {
    if (d3.geoDistance([lon, lat], center) >= Math.PI / 2 - 0.05) return;
    const p = projection([lon, lat]);
    if (!p) return;
    const tw = 0.5 + 0.5 * Math.sin(t / 400 + i * 1.7);
    const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 8);
    g.addColorStop(0, `rgba(255,252,210,${tw})`);
    g.addColorStop(1, 'rgba(255,220,100,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p[0], p[1], 8, 0, Math.PI * 2); ctx.fill();
  });

  /* edge shading + highlight + outline */
  const edge = ctx.createRadialGradient(CX, CY, R * 0.7, CX, CY, R);
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(120,80,0,.3)');
  ctx.beginPath(); path({ type: 'Sphere' });
  ctx.fillStyle = edge; ctx.fill();

  const hl = ctx.createRadialGradient(CX - R * 0.4, CY - R * 0.45, 0, CX - R * 0.4, CY - R * 0.45, R * 0.6);
  hl.addColorStop(0, 'rgba(255,255,255,.55)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath(); path({ type: 'Sphere' });
  ctx.fillStyle = hl; ctx.fill();
  ctx.strokeStyle = 'rgba(212,160,23,.9)'; ctx.lineWidth = 1.5; ctx.stroke();

  /* connections, markers, labels */
  drawConnections(t, center);
  drawPlaces(t, center);

  /* front half of orbits */
  drawOrbits(true, t);
}

/* ek frame ka error poore globe ko band nahi karega */
function draw(t) {
  try { drawFrame(t); }
  catch (err) { console.error('Globe error:', err); }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);