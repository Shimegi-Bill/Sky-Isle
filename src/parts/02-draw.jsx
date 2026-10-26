
/* ============================================================
 * 6. Canvas 繪圖：Q版角色、怪物、場景
 * ============================================================ */
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function star5(ctx, x, y, r1, r2, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? r2 : r1, a = rot + (i * Math.PI) / 5;
    i ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
}

// 斗篷遮身（抽蛋跳傘用）
function drawCloaked(ctx, x, y, s, kind, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const purple = kind === 'purple', rainbow = kind === 'rainbow';
  let g = ctx.createLinearGradient(-14, -40, 14, 4);
  if (rainbow) { ['#ff5e7e', '#ffb84d', '#fff35c', '#5fe08a', '#5fc8ff', '#a77bff'].forEach((col, i) => g.addColorStop(i / 5, col)); }
  else if (purple) { g.addColorStop(0, '#7b3cff'); g.addColorStop(0.55, '#4a1fa8'); g.addColorStop(1, '#2a0f66'); }
  else { g.addColorStop(0, '#ffe58a'); g.addColorStop(0.6, '#e8a81e'); g.addColorStop(1, '#a8710c'); }
  const flap = Math.sin(t * 9) * 3;
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, -42); ctx.quadraticCurveTo(15, -36, 14, -18); ctx.quadraticCurveTo(18 + flap, -4, 15 + flap, 4); ctx.lineTo(-15 - flap, 4); ctx.quadraticCurveTo(-18 - flap, -4, -14, -18); ctx.quadraticCurveTo(-15, -36, 0, -42); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = purple || rainbow ? '#ffd86b' : '#fff3c4'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.ellipse(0, -27, 7.5, 6.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-2.6, -26.5, 1.1, 0, TAU); ctx.arc(2.6, -26.5, 1.1, 0, TAU); ctx.fill();
  if (purple || rainbow) {
    for (let i = 0; i < 5; i++) {
      const a = t * 2 + i * 1.26, rr = 16 + Math.sin(t * 3 + i) * 4;
      ctx.fillStyle = `rgba(255,236,150,${0.5 + 0.5 * Math.sin(t * 6 + i)})`;
      star5(ctx, Math.cos(a) * rr, -20 + Math.sin(a) * rr * 0.7, 3, 1.2); ctx.fill();
    }
  }
  ctx.restore();
}

// 場景
const THEMES = {
  grass: { base: '#5aa84c', dark: '#3f8a3a', light: '#7cc463', edge: '#2f5a2e', deco: ['tuft', 'flower', 'bush', 'rock'] },
  canyon: { base: '#c99a62', dark: '#a87a48', light: '#ddb27a', edge: '#6b4a2e', deco: ['rock', 'bone', 'crack', 'cactus'] },
  temple: { base: '#7c8396', dark: '#666c7d', light: '#9aa1b3', edge: '#3a3f4f', deco: ['pillar', 'torch', 'crack', 'rubble'] },
  lava: { base: '#4a3634', dark: '#36262a', light: '#5e4440', edge: '#1e1416', deco: ['lavacrack', 'rock', 'torch', 'rubble'] },
  snow: { base: '#dfe9f3', dark: '#c3d3e4', light: '#f6faff', edge: '#6f86a6', deco: ['snowpine', 'icerock', 'snowmound', 'crystal'] },
  swamp: { base: '#4c5c3a', dark: '#3a4a2c', light: '#62724a', edge: '#1e2816', deco: ['mushroom', 'reed', 'puddle', 'log'] },
  sky: { base: '#cfd9e8', dark: '#b2bfd3', light: '#e8eef8', edge: '#4f74b8', deco: ['column', 'cloud', 'statue', 'crack'] },
  abyss: { base: '#2c2438', dark: '#1f1a2a', light: '#3c3250', edge: '#0c0912', deco: ['purpleflame', 'spike', 'skullpile', 'voidcrack'] },
};
function makeGroundPattern(ctx, theme) {
  const T = THEMES[theme];
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = T.base; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = Math.random() < 0.5 ? T.dark : T.light; g.globalAlpha = 0.25;
    g.beginPath(); g.ellipse(Math.random() * 128, Math.random() * 128, rand(3, 12), rand(2, 7), Math.random() * 3, 0, TAU); g.fill();
  }
  g.globalAlpha = 1;
  if (theme === 'temple' || theme === 'lava' || theme === 'sky' || theme === 'abyss') {
    g.strokeStyle = theme === 'sky' ? 'rgba(90,110,150,0.25)' : 'rgba(0,0,0,0.18)'; g.lineWidth = 2;
    for (let i = 0; i <= 128; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); }
  }
  if (theme === 'sky') { g.strokeStyle = 'rgba(230,190,90,0.45)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(32, 0); g.lineTo(32, 128); g.moveTo(96, 0); g.lineTo(96, 128); g.stroke(); }
  if (theme === 'abyss') { g.strokeStyle = 'rgba(180,90,255,0.35)'; g.lineWidth = 1.4; for (let i = 0; i < 4; i++) { let x = Math.random() * 128, y = Math.random() * 128; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += rand(-14, 14); y += rand(-14, 14); g.lineTo(x, y); } g.stroke(); } }
  if (theme === 'snow') { g.fillStyle = '#ffffff'; for (let i = 0; i < 24; i++) { g.globalAlpha = rand(0.4, 1); g.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5); } g.globalAlpha = 1; }
  if (theme === 'swamp') { g.fillStyle = 'rgba(120,160,60,0.35)'; for (let i = 0; i < 10; i++) { g.beginPath(); g.arc(Math.random() * 128, Math.random() * 128, rand(1, 2.5), 0, TAU); g.fill(); } }
  if (theme === 'grass') {
    g.strokeStyle = T.light; g.lineWidth = 1.2;
    for (let i = 0; i < 18; i++) { const x = Math.random() * 128, y = Math.random() * 128; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y - 5); g.moveTo(x, y); g.lineTo(x + 2, y - 5); g.stroke(); }
  }
  return ctx.createPattern(c, 'repeat');
}
function genDecor(theme, W, H) {
  const T = THEMES[theme], out = [];
  for (let i = 0; i < 46; i++) out.push({ k: pick(T.deco), x: rand(30, W - 30), y: rand(30, H - 30), s: rand(0.8, 1.3), seed: Math.random() * 10 });
  return out;
}
function drawDecor(ctx, d, t) {
  const { x, y, s } = d;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  switch (d.k) {
    case 'tuft': ctx.strokeStyle = '#8fd46e'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = -2; i <= 2; i++) { ctx.moveTo(i * 3, 0); ctx.lineTo(i * 4 + Math.sin(t * 2 + d.seed) * 1.5, -10 + Math.abs(i) * 2); } ctx.stroke(); break;
    case 'flower': ['#ff8fb1', '#fff27a', '#9fd8ff'].forEach((col, i) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(i * 7 - 7, -2 - (i % 2) * 4, 3, 0, TAU); ctx.fill(); }); break;
    case 'bush': ctx.fillStyle = '#3d8a3a'; ctx.beginPath(); ctx.arc(-7, -6, 9, 0, TAU); ctx.arc(6, -7, 10, 0, TAU); ctx.arc(0, -13, 9, 0, TAU); ctx.fill(); ctx.fillStyle = '#5fb04d'; ctx.beginPath(); ctx.arc(-3, -14, 4, 0, TAU); ctx.fill(); break;
    case 'rock': ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 4, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#8b8f9a'; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-8, -10); ctx.lineTo(4, -13); ctx.lineTo(12, -3); ctx.lineTo(10, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#a9adb8'; ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(4, -13); ctx.lineTo(0, -6); ctx.closePath(); ctx.fill(); break;
    case 'bone': ctx.strokeStyle = '#efe6cf'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-8, -2); ctx.lineTo(8, 2); ctx.stroke(); break;
    case 'crack': ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-14, -2); ctx.lineTo(-4, 2); ctx.lineTo(3, -3); ctx.lineTo(14, 1); ctx.stroke(); break;
    case 'cactus': ctx.fillStyle = '#4f8f4a'; rrect(ctx, -4, -26, 8, 26, 4); ctx.fill(); rrect(ctx, -12, -18, 6, 10, 3); ctx.fill(); rrect(ctx, 6, -22, 6, 10, 3); ctx.fill(); break;
    case 'pillar': ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#b8bccb'; ctx.fillRect(-11, -50, 22, 50); ctx.fillStyle = '#d4d7e2'; ctx.fillRect(-14, -54, 28, 7); ctx.fillStyle = '#9a9fb0'; ctx.fillRect(-4, -48, 3, 46); break;
    case 'torch': {
      ctx.fillStyle = '#5a4a3a'; ctx.fillRect(-2, -22, 4, 22);
      const fl = 1 + Math.sin(t * 18 + d.seed) * 0.15;
      ctx.fillStyle = 'rgba(255,170,60,0.18)'; ctx.beginPath(); ctx.arc(0, -26, 22 * fl, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.ellipse(0, -27, 4 * fl, 7 * fl, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff1a8'; ctx.beginPath(); ctx.ellipse(0, -25, 2, 3.5, 0, 0, TAU); ctx.fill(); break;
    }
    case 'rubble': ctx.fillStyle = '#9aa0ae'; for (let i = 0; i < 4; i++) { ctx.fillRect(i * 5 - 10, -3 - (i % 2) * 3, 5, 4); } break;
    case 'snowpine': {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#6b4a2e'; ctx.fillRect(-3, -12, 6, 12);
      [[-20, -10, 18], [-34, -22, 14], [-46, -32, 10]].forEach(([y0, y1, w]) => { ctx.fillStyle = '#2f6b4a'; ctx.beginPath(); ctx.moveTo(-w, y0); ctx.lineTo(0, y1 - 14); ctx.lineTo(w, y0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#f4f9ff'; ctx.beginPath(); ctx.moveTo(-w * 0.7, y0 - 4); ctx.lineTo(0, y1 - 14); ctx.lineTo(w * 0.7, y0 - 4); ctx.quadraticCurveTo(0, y0 - 9, -w * 0.7, y0 - 4); ctx.fill(); });
      break;
    }
    case 'icerock': ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 4, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#a9c4e0'; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-8, -10); ctx.lineTo(4, -13); ctx.lineTo(12, -3); ctx.lineTo(10, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(4, -13); ctx.lineTo(0, -6); ctx.closePath(); ctx.fill(); break;
    case 'snowmound': ctx.fillStyle = '#c3d3e4'; ctx.beginPath(); ctx.ellipse(0, -2, 16, 6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(-3, -4, 11, 4, 0, 0, TAU); ctx.fill(); break;
    case 'crystal': {
      const gl = 0.6 + 0.4 * Math.sin(t * 2 + d.seed);
      ctx.fillStyle = `rgba(140,220,255,${0.15 * gl})`; ctx.beginPath(); ctx.arc(0, -8, 16, 0, TAU); ctx.fill();
      [[-5, 12, -0.3], [0, 18, 0], [5, 11, 0.35]].forEach(([x, h, a]) => { ctx.save(); ctx.translate(x, 0); ctx.rotate(a); ctx.fillStyle = '#8fd8ff'; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(0, -h); ctx.lineTo(3, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#e8f8ff'; ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(0, -h); ctx.lineTo(1, -2); ctx.closePath(); ctx.fill(); ctx.restore(); });
      break;
    }
    case 'mushroom': {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 4, 0, 0, TAU); ctx.fill();
      [[-6, 14, 9, '#a05ad8'], [6, 9, 6, '#c96ad8']].forEach(([x, h, r, c]) => { ctx.fillStyle = '#efe2c8'; ctx.fillRect(x - 2, -h, 4, h); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, -h, r, r * 0.6, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff6ff'; ctx.beginPath(); ctx.arc(x - r * 0.3, -h - r * 0.3, r * 0.18, 0, TAU); ctx.arc(x + r * 0.35, -h - r * 0.2, r * 0.14, 0, TAU); ctx.fill(); });
      break;
    }
    case 'reed': ctx.strokeStyle = '#7a8a4a'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = -2; i <= 2; i++) { ctx.moveTo(i * 3, 0); ctx.quadraticCurveTo(i * 4, -10, i * 5 + Math.sin(t * 1.5 + d.seed + i) * 2, -20 + Math.abs(i) * 3); } ctx.stroke(); ctx.fillStyle = '#6b4a2e'; ctx.beginPath(); ctx.ellipse(0, -18, 1.6, 4, 0, 0, TAU); ctx.fill(); break;
    case 'puddle': {
      ctx.fillStyle = 'rgba(110,160,40,0.55)'; ctx.beginPath(); ctx.ellipse(0, 0, 20, 7, 0, 0, TAU); ctx.fill();
      const k = (t * 0.6 + d.seed) % 1; ctx.strokeStyle = `rgba(200,255,120,${1 - k})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(-4, -1, 2 + k * 5, (2 + k * 5) * 0.4, 0, 0, TAU); ctx.stroke();
      break;
    }
    case 'log': ctx.fillStyle = '#5a3e26'; rrect(ctx, -16, -6, 32, 8, 4); ctx.fill(); ctx.fillStyle = '#8a6a48'; ctx.beginPath(); ctx.ellipse(15, -2, 3, 4, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#6a8a3a'; ctx.beginPath(); ctx.ellipse(-4, -6, 8, 2, 0, 0, TAU); ctx.fill(); break;
    case 'column': {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 15, 5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e8eef8'; ctx.fillRect(-10, -44, 20, 44); ctx.fillStyle = '#c9d3e4'; ctx.fillRect(-10, -44, 5, 44); ctx.fillStyle = '#ffffff'; ctx.fillRect(-13, -6, 26, 6);
      ctx.fillStyle = '#e8eef8'; ctx.beginPath(); ctx.moveTo(-10, -44); ctx.lineTo(-4, -50); ctx.lineTo(2, -45); ctx.lineTo(10, -48); ctx.lineTo(10, -44); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(120,140,170,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-2, -42); ctx.lineTo(-2, -6); ctx.moveTo(4, -42); ctx.lineTo(4, -6); ctx.stroke();
      break;
    }
    case 'cloud': { const b = Math.sin(t * 1.2 + d.seed) * 1.5; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(-8, -4 + b, 7, 0, TAU); ctx.arc(2, -7 + b, 9, 0, TAU); ctx.arc(11, -3 + b, 6, 0, TAU); ctx.fill(); break; }
    case 'statue': {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#c9d3e4'; ctx.fillRect(-12, -10, 24, 10); ctx.fillStyle = '#dfe6f2';
      ctx.beginPath(); ctx.moveTo(-6, -10); ctx.lineTo(-5, -32); ctx.lineTo(5, -32); ctx.lineTo(6, -10); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -37, 5, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-4, -28); ctx.quadraticCurveTo(-18, -40, -20, -24); ctx.quadraticCurveTo(-12, -28, -5, -20); ctx.closePath(); ctx.moveTo(4, -28); ctx.quadraticCurveTo(18, -40, 20, -24); ctx.quadraticCurveTo(12, -28, 5, -20); ctx.closePath(); ctx.fill();
      break;
    }
    case 'purpleflame': {
      ctx.fillStyle = '#3a3048'; ctx.fillRect(-6, -14, 12, 14); ctx.fillStyle = '#5a4a6a'; ctx.fillRect(-9, -17, 18, 4);
      const fl = 1 + Math.sin(t * 16 + d.seed) * 0.15;
      ctx.fillStyle = 'rgba(180,90,255,0.2)'; ctx.beginPath(); ctx.arc(0, -24, 24 * fl, 0, TAU); ctx.fill();
      ctx.fillStyle = '#b06bff'; ctx.beginPath(); ctx.ellipse(0, -25, 5 * fl, 9 * fl, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#f0d8ff'; ctx.beginPath(); ctx.ellipse(0, -22, 2.4, 4.5, 0, 0, TAU); ctx.fill();
      break;
    }
    case 'spike': ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, 0, 12, 4, 0, 0, TAU); ctx.fill(); [[-6, 14], [0, 22], [6, 12]].forEach(([x, h]) => { ctx.fillStyle = '#4a2a6a'; ctx.beginPath(); ctx.moveTo(x - 4, 0); ctx.lineTo(x, -h); ctx.lineTo(x + 4, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#8a5ac8'; ctx.beginPath(); ctx.moveTo(x - 1, -2); ctx.lineTo(x, -h); ctx.lineTo(x + 1.5, -2); ctx.closePath(); ctx.fill(); }); break;
    case 'skullpile': ctx.fillStyle = '#d9cfb8'; [[-6, -3], [5, -3], [0, -9]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 4.5, 0, TAU); ctx.fill(); }); ctx.fillStyle = '#2a1f2f'; [[-6, -3], [5, -3], [0, -9]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x - 1.5, y, 1, 0, TAU); ctx.arc(x + 1.5, y, 1, 0, TAU); ctx.fill(); }); break;
    case 'voidcrack': {
      const gl = 0.6 + 0.4 * Math.sin(t * 2 + d.seed);
      ctx.strokeStyle = `rgba(190,100,255,${0.5 + gl * 0.4})`; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-6, -4); ctx.lineTo(2, 2); ctx.lineTo(16, -2); ctx.stroke(); break;
    }
    case 'lavacrack': {
      const gl = 0.6 + 0.4 * Math.sin(t * 2 + d.seed);
      ctx.strokeStyle = `rgba(255,${120 + gl * 60 | 0},40,${0.5 + gl * 0.4})`; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-6, -4); ctx.lineTo(2, 2); ctx.lineTo(16, -2); ctx.stroke(); break;
    }
    default: break;
  }
  ctx.restore();
}
function drawWindmill(ctx, x, y, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 9, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#efe4cf'; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-12, -78); ctx.lineTo(12, -78); ctx.lineTo(20, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b5483c'; ctx.beginPath(); ctx.moveTo(-17, -76); ctx.lineTo(0, -98); ctx.lineTo(17, -76); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6b4a2e'; rrect(ctx, -6, -18, 12, 18, 5); ctx.fill();
  ctx.translate(0, -76); ctx.rotate(t * 0.8);
  for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.fillStyle = '#8a6a48'; ctx.fillRect(-2, 0, 4, 52); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(2, 12, 12, 38); }
  ctx.fillStyle = '#5a3a22'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill();
  ctx.restore();
}
