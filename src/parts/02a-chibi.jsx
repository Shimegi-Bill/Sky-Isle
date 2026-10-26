
/* ============================================================
 * 6a. Q版角色（精緻版）：描邊、陰影、動漫眼、每位角色專屬配件同武器
 * ============================================================ */
const OL = 'rgba(30,20,46,0.9)';
// 每位角色的造型設定
const LOOKS = {
  c01: { weapon: 'sky', head: 'tiara', shoulder: 'silver', skirt: true, collar: '#ffffff' },
  c02: { weapon: 'dark', shoulder: 'spike', scarf: '#c0262d', aura: 'dark', eyeGlow: '#ff3b2f' },
  c03: { weapon: 'lion', head: 'lionband', mane: true, belt: 'champ' },
  c04: { weapon: 'wind', head: 'feather', shoulder: 'light', scarf: '#5fe0a0', skirt: true },
  c05: { weapon: 'star', head: 'witch', hatCol: '#26215c', hatBand: '#ffe27a', charm: 'star', orbit: '#ffe27a', capeStars: true, skirt: true },
  c06: { weapon: 'baguette', head: 'kerchief', apron: true, skirt: true },
  c07: { weapon: 'wraps', beads: true, eyes: 'calm', sash: '#8f3f1a' },
  c08: { weapon: 'ice', fur: true, scarf: '#9fe3ff', head: 'snowpin' },
  c09: { weapon: 'flower', head: 'witch', hatCol: '#2f6b3a', hatBand: '#ff9ec4', charm: 'flower', skirt: true, vine: true },
  c10: { weapon: 'katana', back: 'kasa', scarf: '#a33a3a', longScarf: true },
  c11: { weapon: 'rookie', head: 'band', bandCol: '#3b6fd1', back: 'pack' },
  c12: { weapon: 'tape', head: 'cap', capCol: '#e2453c' },
  c13: { weapon: 'halberd', head: 'helm', tabard: true },
  c14: { weapon: 'wand', head: 'bighat', hatCol: '#5b3a8c', hatBand: '#ffcf5a', glasses: true },
  c15: { weapon: 'skybow', head: 'circlet', back: 'quiver', shoulder: 'light', skirt: true, collar: '#ffffff' },
  c16: { weapon: 'huntbow', head: 'feathercap', back: 'quiver', scarf: '#8a5a2b' },
  c17: { weapon: 'shortbow', head: 'band', bandCol: '#ffe066', back: 'quiver', skirt: true },
};
const DEFAULT_WEAPON = { sword: 'rookie', lance: 'halberd', mage: 'wand', fist: 'tape', bow: 'shortbow' };
const weaponKind = (c) => (LOOKS[c.id] && LOOKS[c.id].weapon) || DEFAULT_WEAPON[c.cls];
// 手握位置（沿武器方向）
const GRIP = { sky: 4.5, dark: 4.5, baguette: 4.5, katana: 4.5, rookie: 4, wind: 8, ice: 8, halberd: 8, star: 4, flower: 4, wand: 2, skybow: 8, huntbow: 8, shortbow: 7.5 };

function poly(ctx, pts) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
function olS(ctx, w = 0.9) { ctx.lineWidth = w; ctx.strokeStyle = OL; ctx.stroke(); }
function lgrad(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; }
// 四角閃光
function sparkle(ctx, x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
}

/* ---------- 武器（世界座標角度繪製） ---------- */
function drawWeapon(ctx, c, x, y, ang, swing = 0, glow = 0, t = 0, lite = false) {
  const k = weaponKind(c), fist = c.cls === 'fist', bow = c.cls === 'bow';
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang + (fist || bow ? 0 : swing));
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (glow > 0 && !lite) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.55 * glow;
    const L = c.cls === 'lance' ? 50 : c.cls === 'mage' ? 34 : fist ? 18 : 40;
    const gg = ctx.createRadialGradient(L * 0.7, 0, 1, L * 0.7, 0, L * 0.5);
    gg.addColorStop(0, '#ffffff'); gg.addColorStop(0.4, c.accent); gg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(L * 0.62, 0, L * 0.6, fist ? 10 : 8, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  const S = (w) => { if (!lite) olS(ctx, w); };
  switch (k) {
    case 'sky': {
      ctx.fillStyle = '#2b3f7a'; rrect(ctx, 1, -1.6, 7, 3.2, 1.4); ctx.fill(); S();
      ctx.fillStyle = '#ffd76a'; ctx.beginPath(); ctx.arc(0.6, 0, 1.8, 0, TAU); ctx.fill(); S();
      ctx.fillStyle = lgrad(ctx, 0, -8, 0, 8, ['#fff3b8', '#e0a83a']);
      ctx.beginPath(); ctx.moveTo(8, 0); ctx.quadraticCurveTo(9, -6, 5.5, -9); ctx.quadraticCurveTo(11.5, -6.5, 11, 0); ctx.quadraticCurveTo(11.5, 6.5, 5.5, 9); ctx.quadraticCurveTo(9, 6, 8, 0); ctx.fill(); S();
      ctx.fillStyle = lgrad(ctx, 0, -3, 0, 3, ['#ffffff', '#d6e4ff', '#8ea6d8']);
      poly(ctx, [[10.5, -3], [34, -2.3], [40, 0], [34, 2.3], [10.5, 3]]); ctx.fill(); S();
      ctx.strokeStyle = '#4f7dd8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(12.5, 0); ctx.lineTo(33, 0); ctx.stroke();
      ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(9.6, 0, 1.8, 0, TAU); ctx.fill(); ctx.fillStyle = '#cfe4ff'; ctx.beginPath(); ctx.arc(9.1, -0.6, 0.6, 0, TAU); ctx.fill();
      break;
    }
    case 'dark': {
      ctx.fillStyle = '#1b1622'; rrect(ctx, 0.5, -1.6, 8, 3.2, 1.2); ctx.fill(); S();
      ctx.fillStyle = '#7a1420'; poly(ctx, [[8, -6.5], [10, -2], [12.5, -7.5], [11.2, 0], [12.5, 7.5], [10, 2], [8, 6.5]]); ctx.fill(); S();
      ctx.fillStyle = lgrad(ctx, 0, -4, 0, 4, ['#4a3a5a', '#1d1526', '#3a2440']);
      poly(ctx, [[11, -2.8], [18, -3.8], [22, -2.4], [28, -3.6], [35, -1.8], [41, 0], [35, 1.8], [28, 3.1], [22, 2.2], [18, 3.3], [11, 2.8]]); ctx.fill(); S();
      ctx.strokeStyle = '#ff4a2e'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(12, -2.4); ctx.lineTo(18, -3.3); ctx.lineTo(22, -2); ctx.lineTo(28, -3.1); ctx.lineTo(35, -1.4); ctx.lineTo(40, 0); ctx.stroke();
      if (!lite) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.35 + 0.15 * Math.sin(t * 9); ctx.strokeStyle = '#ff6a3a'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
      break;
    }
    case 'baguette': {
      ctx.fillStyle = '#f4efe4'; rrect(ctx, 0, -2.4, 9, 4.8, 1.5); ctx.fill(); S();
      ctx.strokeStyle = '#c9b8a0'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(3, -2.4); ctx.lineTo(4.5, 2.4); ctx.moveTo(6, -2.4); ctx.lineTo(7.5, 2.4); ctx.stroke();
      ctx.fillStyle = lgrad(ctx, 0, -4, 0, 4, ['#f5bf73', '#d98a3e', '#a8601f']); rrect(ctx, 8, -3.7, 31, 7.4, 3.7); ctx.fill(); S();
      ctx.strokeStyle = '#ffe3ae'; ctx.lineWidth = 1.3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(13 + i * 6.2, -2.2); ctx.lineTo(16.5 + i * 6.2, 1.6); ctx.stroke(); }
      break;
    }
    case 'katana': {
      ctx.fillStyle = '#2a2433'; rrect(ctx, -1, -1.6, 10.5, 3.2, 1); ctx.fill(); S();
      ctx.strokeStyle = '#d9c9a8'; ctx.lineWidth = 0.6; ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.moveTo(i * 2.4, -1.4); ctx.lineTo(i * 2.4 + 1.6, 1.4); ctx.moveTo(i * 2.4 + 1.6, -1.4); ctx.lineTo(i * 2.4, 1.4); } ctx.stroke();
      ctx.fillStyle = '#c9a14a'; ctx.beginPath(); ctx.ellipse(10, 0, 1.4, 4.2, 0, 0, TAU); ctx.fill(); S();
      ctx.fillStyle = lgrad(ctx, 0, -3, 0, 2, ['#ffffff', '#c7d0e2', '#8f9ab0']);
      ctx.beginPath(); ctx.moveTo(11.5, -1.5); ctx.quadraticCurveTo(27, -3.6, 43, -2.2); ctx.lineTo(42, 0.2); ctx.quadraticCurveTo(27, -0.6, 11.5, 1.4); ctx.closePath(); ctx.fill(); S();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(14, 0.6); ctx.quadraticCurveTo(27, -0.9, 41, -0.2); ctx.stroke();
      break;
    }
    case 'rookie': {
      ctx.fillStyle = '#7a5230'; rrect(ctx, 0.5, -1.4, 7, 2.8, 1); ctx.fill(); S();
      ctx.fillStyle = '#8a6a48'; rrect(ctx, 7, -4.6, 2.4, 9.2, 1); ctx.fill(); S();
      ctx.fillStyle = lgrad(ctx, 0, -2.4, 0, 2.4, ['#f2f5fa', '#c3cad8', '#8d96a8']);
      poly(ctx, [[9.4, -2.2], [28, -2], [32, 0], [28, 2], [9.4, 2.2]]); ctx.fill(); S();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(11, -0.8); ctx.lineTo(27, -0.8); ctx.stroke();
      break;
    }
    case 'wind': {
      ctx.fillStyle = lgrad(ctx, 0, -1.5, 0, 1.5, ['#f4fff8', '#a8dcc0']); rrect(ctx, -12, -1.4, 45, 2.8, 1.4); ctx.fill(); S();
      ctx.fillStyle = '#1e5e48'; ctx.fillRect(3, -1.7, 8, 3.4);
      if (!lite) for (let i = 0; i < 2; i++) {
        const w = Math.sin(t * 12 + i * 1.7) * 2.5;
        ctx.strokeStyle = i ? '#5fe0a0' : '#c9ffe2'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(31, 0); ctx.quadraticCurveTo(24, 4 + w + i * 2, 17, 2 + w * 1.4 + i * 3); ctx.stroke();
      }
      ctx.fillStyle = '#fff17a'; rrect(ctx, 31, -2.7, 3, 5.4, 1); ctx.fill(); S();
      ctx.fillStyle = lgrad(ctx, 34, 0, 51, 0, ['#5fd38d', '#e8fff2', '#bff5d6']);
      ctx.beginPath(); ctx.moveTo(34, 0); ctx.quadraticCurveTo(40, -6, 51, 0); ctx.quadraticCurveTo(40, 6, 34, 0); ctx.fill(); S();
      ctx.strokeStyle = 'rgba(30,94,72,0.7)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(35, 0); ctx.lineTo(49, 0); ctx.moveTo(40, 0); ctx.lineTo(43, -2.5); ctx.moveTo(40, 0); ctx.lineTo(43, 2.5); ctx.stroke();
      break;
    }
    case 'ice': {
      ctx.fillStyle = lgrad(ctx, 0, -1.5, 0, 1.5, ['#f2f9ff', '#8fb8e0']); rrect(ctx, -12, -1.4, 45, 2.8, 1.4); ctx.fill(); S();
      ctx.fillStyle = '#3a6fa8'; ctx.fillRect(3, -1.7, 8, 3.4);
      ctx.fillStyle = '#eaf6ff'; ctx.beginPath(); ctx.arc(32, 0, 2.6, 0, TAU); ctx.fill(); S();
      ctx.fillStyle = lgrad(ctx, 33, -5, 51, 5, ['#ffffff', '#b9ecff', '#4ea8ff']);
      poly(ctx, [[33, 0], [38.5, -4.8], [52, 0], [38.5, 4.8]]); ctx.fill(); S();
      ctx.fillStyle = '#d9f4ff'; poly(ctx, [[34.5, -2.2], [36, -7.5], [38, -2.6]]); ctx.fill(); S(0.6); poly(ctx, [[34.5, 2.2], [36, 7.5], [38, 2.6]]); ctx.fill(); S(0.6);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(51, 0); ctx.moveTo(38.5, -4.6); ctx.lineTo(42, 0); ctx.lineTo(38.5, 4.6); ctx.stroke();
      break;
    }
    case 'halberd': {
      ctx.fillStyle = lgrad(ctx, 0, -1.5, 0, 1.5, ['#9a7650', '#5e4128']); rrect(ctx, -13, -1.5, 47, 3, 1.4); ctx.fill(); S();
      ctx.fillStyle = '#d0d4dc'; ctx.fillRect(4, -1.8, 2, 3.6); ctx.fillRect(14, -1.8, 2, 3.6);
      ctx.fillStyle = lgrad(ctx, 0, -11, 0, 0, ['#f2f4f8', '#9aa3b4']);
      ctx.beginPath(); ctx.moveTo(29.5, -1.5); ctx.quadraticCurveTo(28, -9.5, 35.5, -11); ctx.quadraticCurveTo(32.5, -5.5, 37.5, -1.5); ctx.closePath(); ctx.fill(); S();
      ctx.fillStyle = lgrad(ctx, 33, -2, 33, 2, ['#ffffff', '#a9b1c2']); poly(ctx, [[33, -2.1], [48, 0], [33, 2.1]]); ctx.fill(); S();
      ctx.fillStyle = '#b8c0d0'; poly(ctx, [[31, 1.5], [33.5, 6.5], [35, 1.5]]); ctx.fill(); S(0.7);
      break;
    }
    case 'star': {
      ctx.fillStyle = lgrad(ctx, 0, -1.5, 0, 1.5, ['#6b4a38', '#3a2620']); rrect(ctx, -6, -1.4, 33, 2.8, 1.4); ctx.fill(); S();
      ctx.fillStyle = '#ffe27a'; ctx.fillRect(4, -1.9, 2, 3.8); ctx.fillRect(22, -1.9, 2, 3.8);
      ctx.fillStyle = lgrad(ctx, 26, -7, 26, 7, ['#fff6c9', '#e8b33a']);
      ctx.beginPath(); ctx.arc(31, 0, 6.6, -2.3, 2.3); ctx.arc(33.6, 0, 5.2, 2.05, -2.05, true); ctx.closePath(); ctx.fill(); S();
      if (!lite) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(31.5, 0, 0, 31.5, 0, 8); gl.addColorStop(0, 'rgba(255,240,180,0.9)'); gl.addColorStop(1, 'rgba(255,200,80,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(31.5, 0, 8, 0, TAU); ctx.fill(); ctx.restore(); }
      ctx.fillStyle = '#fffbe0'; star5(ctx, 31.5, 0, 3.6, 1.5, -Math.PI / 2 + t * 1.5); ctx.fill(); S(0.6);
      break;
    }
    case 'flower': {
      ctx.strokeStyle = OL; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(-6, 0.5); ctx.quadraticCurveTo(12, 2.5, 26, -0.5); ctx.stroke();
      ctx.strokeStyle = '#7a5530'; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.fillStyle = '#5fbf62'; ctx.beginPath(); ctx.ellipse(12, 3.4, 3.2, 1.5, 0.6, 0, TAU); ctx.fill(); S(0.6); ctx.beginPath(); ctx.ellipse(18, -2.6, 3.2, 1.5, -0.6, 0, TAU); ctx.fill(); S(0.6);
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + t * 0.6; ctx.fillStyle = i % 2 ? '#ff7fb0' : '#ff9ec4'; ctx.beginPath(); ctx.ellipse(29.5 + Math.cos(a) * 3, Math.sin(a) * 3, 3, 2, a, 0, TAU); ctx.fill(); S(0.6); }
      ctx.fillStyle = '#ffd1e3'; ctx.beginPath(); ctx.arc(29.5, 0, 2.4, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.arc(29.5, 0, 1.1, 0, TAU); ctx.fill();
      break;
    }
    case 'wand': {
      ctx.fillStyle = '#ffffff'; rrect(ctx, 0, -1.2, 18, 2.4, 1.2); ctx.fill(); S();
      ctx.fillStyle = '#e2453c'; for (let i = 0; i < 4; i++) ctx.fillRect(2 + i * 4, -1.2, 1.6, 2.4);
      if (!lite) { const w = Math.sin(t * 10) * 2; ctx.strokeStyle = '#ff7fb0'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(17, 0); ctx.quadraticCurveTo(13, 4 + w, 9, 5 + w); ctx.stroke(); }
      ctx.fillStyle = lgrad(ctx, 17, -6, 25, 6, ['#fff7b0', '#ffcf3a']); star5(ctx, 21.5, 0, 5.4, 2.3, -Math.PI / 2 + Math.sin(t * 3) * 0.3); ctx.fill(); S();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(20.5, -1.4, 0.9, 0, TAU); ctx.fill();
      break;
    }
    // 弓：swing 代表拉弓程度（0–1）
    case 'skybow': case 'huntbow': case 'shortbow': {
      const big = k === 'skybow', Lh = k === 'shortbow' ? 11 : 14, bx = 8, pull = clamp(swing, 0, 1) * 6;
      const limb = () => { ctx.beginPath(); ctx.moveTo(bx - 4, -Lh); ctx.quadraticCurveTo(bx + 6, -Lh * 0.55, bx + 1.5, 0); ctx.quadraticCurveTo(bx + 6, Lh * 0.55, bx - 4, Lh); };
      // 弦同箭
      ctx.strokeStyle = big ? '#bff4ff' : 'rgba(255,255,255,0.85)'; ctx.lineWidth = big ? 1.1 : 0.8;
      ctx.beginPath(); ctx.moveTo(bx - 4, -Lh); ctx.lineTo(bx - 4 - pull, 0); ctx.lineTo(bx - 4, Lh); ctx.stroke();
      if (big && !lite) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.4 + 0.2 * Math.sin(t * 6); ctx.lineWidth = 3; ctx.strokeStyle = '#7fe8ff'; ctx.stroke(); ctx.restore(); }
      if (pull > 0.4 || glow > 0) {
        const ax = bx - 4 - pull;
        ctx.strokeStyle = OL; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(bx + 13, 0); ctx.stroke();
        ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = big ? '#bff4ff' : '#dfe6f2'; poly(ctx, [[bx + 17, 0], [bx + 12, -2.6], [bx + 12, 2.6]]); ctx.fill(); S(0.6);
        ctx.fillStyle = c.accent; poly(ctx, [[ax + 1, 0], [ax + 4, -2.4], [ax + 6, -2.4], [ax + 3.5, 0], [ax + 6, 2.4], [ax + 4, 2.4]]); ctx.fill();
      }
      ctx.strokeStyle = OL; ctx.lineWidth = big ? 4.6 : 4; limb(); ctx.stroke();
      ctx.strokeStyle = big ? lgrad(ctx, 0, -Lh, 0, Lh, ['#ffffff', '#ffe9a8', '#ffffff']) : k === 'huntbow' ? '#8a5a2b' : '#b07a48'; ctx.lineWidth = big ? 2.8 : 2.3; limb(); ctx.stroke();
      if (big) {
        for (const sy of [-1, 1]) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(bx - 4, sy * Lh); ctx.quadraticCurveTo(bx - 11, sy * (Lh + 3), bx - 12, sy * (Lh - 2)); ctx.quadraticCurveTo(bx - 8, sy * (Lh - 1), bx - 4, sy * (Lh - 2.5)); ctx.closePath(); ctx.fill(); S(0.6); }
        ctx.fillStyle = '#22a874'; ctx.beginPath(); ctx.arc(bx + 2, 0, 1.9, 0, TAU); ctx.fill(); S(0.6);
      } else if (k === 'huntbow') {
        ctx.fillStyle = '#e8c64a'; ctx.beginPath(); ctx.arc(bx - 4, -Lh, 1.2, 0, TAU); ctx.arc(bx - 4, Lh, 1.2, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = '#5a3a22'; rrect(ctx, bx, -2.4, 3.4, 4.8, 1); ctx.fill();
      break;
    }
    // 拳套：手臂伸出，拳頭位置跟出拳距離
    case 'lion': case 'wraps': case 'tape': default: {
      const fx = 12 + swing * 6;
      ctx.strokeStyle = OL; ctx.lineWidth = 4.6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(fx - 3, 0); ctx.stroke();
      ctx.strokeStyle = k === 'wraps' ? c.skin : shade(c.outfit, -0.1); ctx.lineWidth = 3; ctx.stroke();
      if (k === 'lion') {
        ctx.fillStyle = lgrad(ctx, fx, -5, fx, 5, ['#fff0a0', '#e8a81e', '#a8710c']); rrect(ctx, fx - 5, -5, 10, 10, 3.6); ctx.fill(); S();
        ctx.fillStyle = '#fff6c4'; for (let i = -1; i <= 1; i++) { poly(ctx, [[fx + 4.5, i * 3 - 1.2], [fx + 8, i * 3], [fx + 4.5, i * 3 + 1.2]]); ctx.fill(); S(0.5); }
        ctx.fillStyle = '#e33'; ctx.beginPath(); ctx.arc(fx, 0, 1.8, 0, TAU); ctx.fill();
      } else if (k === 'wraps') {
        ctx.fillStyle = c.skin; ctx.beginPath(); ctx.arc(fx, 0, 4.6, 0, TAU); ctx.fill(); S();
        ctx.strokeStyle = '#f4efe4'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(fx - 3.5, -2.5); ctx.lineTo(fx + 1, 3.6); ctx.moveTo(fx - 1, -4); ctx.lineTo(fx + 3.6, 2); ctx.stroke();
      } else {
        ctx.fillStyle = lgrad(ctx, fx, -5, fx, 5, ['#ff8a80', '#d6302a']); ctx.beginPath(); ctx.arc(fx, 0, 4.9, 0, TAU); ctx.fill(); S();
        ctx.fillStyle = '#ffffff'; rrect(ctx, fx - 6.5, -3.4, 2.6, 6.8, 1); ctx.fill(); S(0.6);
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(fx + 1, -1.8, 1.4, 0, TAU); ctx.fill();
      }
      break;
    }
  }
  // 手（拳師的拳頭本身就係手）
  if (!fist) { const g = GRIP[k] || 4; ctx.fillStyle = c.skin; ctx.beginPath(); ctx.arc(g, 0, 2.3, 0, TAU); ctx.fill(); S(0.8); }
  ctx.restore();
}

/* ---------- 頭髮 ---------- */
function hairBackPath(ctx, c, L, hy, t, HR) {
  const st = c.hairStyle, sw = Math.sin(t * 2.6) * 1.2;
  if (L.mane) {
    // 金獅鬃毛：頭後面一圈尖角
    ctx.beginPath();
    for (let i = 0; i <= 14; i++) { const a = Math.PI * 0.75 + (i / 14) * Math.PI * 1.5, r = i % 2 ? HR + 2 : HR + 7.5; const px = Math.cos(a) * r, py = hy + Math.sin(a) * r * 0.95; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath(); return true;
  }
  if (st === 'long') {
    ctx.beginPath(); ctx.moveTo(-HR - 0.5, hy - 2);
    ctx.bezierCurveTo(-HR - 3, hy + 8, -HR - 2 + sw, hy + 16, -HR + 1 + sw, hy + 19);
    ctx.quadraticCurveTo(-6, hy + 16, -3 + sw, hy + 20); ctx.quadraticCurveTo(2, hy + 16, 5 + sw, hy + 19.5); ctx.quadraticCurveTo(8, hy + 15, HR - 0.5 + sw, hy + 18);
    ctx.bezierCurveTo(HR + 2, hy + 12, HR + 2.5, hy + 4, HR + 0.5, hy - 2); ctx.closePath(); return true;
  }
  if (st === 'twin') {
    ctx.beginPath();
    for (const sx of [-1, 1]) {
      const bx = sx * (HR + 1), sway = Math.sin(t * 3 + sx) * 1.8;
      ctx.moveTo(bx, hy - 5); ctx.bezierCurveTo(bx + sx * 8, hy - 2, bx + sx * 7 + sway, hy + 12, bx + sx * 2 + sway, hy + 18); ctx.bezierCurveTo(bx + sx * 1, hy + 10, bx - sx * 2, hy + 2, bx, hy - 5);
    }
    return true;
  }
  if (st === 'pony') {
    const sway = Math.sin(t * 4) * 2.2;
    ctx.beginPath(); ctx.moveTo(-HR + 3, hy - 9); ctx.bezierCurveTo(-HR - 9, hy - 10, -HR - 10 + sway, hy + 4, -HR - 6 + sway, hy + 14); ctx.bezierCurveTo(-HR - 4 + sway, hy + 6, -HR - 1, hy - 1, -HR + 4, hy - 4); ctx.closePath(); return true;
  }
  if (st === 'bob') { ctx.beginPath(); ctx.arc(0, hy, HR + 1.6, Math.PI * 0.85, Math.PI * 2.15); ctx.lineTo(HR + 1.4, hy + 9); ctx.lineTo(-HR - 1.4, hy + 9); ctx.closePath(); return true; }
  return false;
}
function hairFrontPath(ctx, c, hy, HR) {
  const st = c.hairStyle;
  ctx.beginPath();
  if (st === 'spiky') {
    ctx.moveTo(-HR - 0.6, hy + 2.5);
    [[-15, hy - 4], [-11, hy - 6], [-13.5, hy - 12], [-7, hy - 10.5], [-6, hy - 16.5], [-1, hy - 12.5], [2, hy - 17.5], [5, hy - 12.5], [10.5, hy - 15.5], [9.5, hy - 9], [15.5, hy - 8.5], [HR + 0.8, hy - 2], [HR + 0.8, hy + 3],
      [9, hy - 1], [7, hy + 3.2], [4, hy - 1], [1.5, hy + 3.8], [-1.5, hy - 1], [-4.5, hy + 3.2], [-7, hy - 1], [-10, hy + 2.8]].forEach(([x, y]) => ctx.lineTo(x, y));
  } else if (st === 'shaved') {
    ctx.arc(0, hy - 0.5, HR + 0.4, Math.PI * 1.06, Math.PI * 1.94); ctx.quadraticCurveTo(0, hy - 8.5, -HR + 0.2, hy - 4.2);
  } else if (st === 'bob') {
    ctx.moveTo(-HR - 1.6, hy + 9.5); ctx.arc(0, hy - 0.5, HR + 1.3, Math.PI - 0.3, Math.PI * 2 + 0.3);
    ctx.lineTo(HR + 1.6, hy + 9.5); ctx.quadraticCurveTo(HR - 0.5, hy + 10, 9.6, hy + 7.5); ctx.lineTo(9.2, hy + 0.5);
    ctx.quadraticCurveTo(6, hy + 3.2, 3, hy + 1.5); ctx.quadraticCurveTo(0, hy + 3.4, -3, hy + 1.6); ctx.quadraticCurveTo(-6, hy + 3.2, -9.2, hy + 0.5);
    ctx.lineTo(-9.6, hy + 7.5); ctx.quadraticCurveTo(-HR + 0.5, hy + 10, -HR - 1.6, hy + 9.5);
  } else {
    ctx.moveTo(-HR - 0.7, hy + 3.5); ctx.arc(0, hy - 0.5, HR + 0.9, Math.PI - 0.14, Math.PI * 2 + 0.14);
    ctx.lineTo(HR + 0.4, hy + 5); ctx.quadraticCurveTo(9.2, hy + 1, 8.2, hy - 1.2);
    ctx.quadraticCurveTo(6.8, hy + 3.4, 4.6, hy + 4.2); ctx.quadraticCurveTo(3.6, hy + 0.6, 1.6, hy - 1.2);
    ctx.quadraticCurveTo(0.2, hy + 3.6, -2.6, hy + 4.4); ctx.quadraticCurveTo(-3.2, hy + 0.6, -5.2, hy - 0.6);
    ctx.quadraticCurveTo(-7.2, hy + 3.1, -9.7, hy + 3.7); ctx.quadraticCurveTo(-10.2, hy + 1.2, -11.6, hy + 0.2);
  }
  ctx.closePath();
}

/* ---------- 頭飾 ---------- */
function drawHeadgear(ctx, c, L, hy, HR, t, back, ecx) {
  const S = (w) => olS(ctx, w);
  switch (L.head) {
    case 'tiara': {
      ctx.strokeStyle = OL; ctx.lineWidth = 2.8; ctx.beginPath(); ctx.arc(0, hy - 0.5, HR - 0.6, Math.PI * 1.13, Math.PI * 1.87); ctx.stroke();
      ctx.strokeStyle = '#ffd76a'; ctx.lineWidth = 1.6; ctx.stroke();
      if (!back) { ctx.fillStyle = '#3b82f6'; poly(ctx, [[ecx * 0.5, hy - HR - 1.4], [ecx * 0.5 + 2, hy - HR + 1.2], [ecx * 0.5, hy - HR + 3.6], [ecx * 0.5 - 2, hy - HR + 1.2]]); ctx.fill(); S(0.7); }
      for (const sx of [-1, 1]) {
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); const bx = sx * (HR - 1), by = hy - 5;
        ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + sx * 5, by - 7, bx + sx * 8, by - 6); ctx.quadraticCurveTo(bx + sx * 6, by - 3.5, bx + sx * 7, by - 1.5); ctx.quadraticCurveTo(bx + sx * 4, by - 1, bx, by + 1); ctx.closePath(); ctx.fill(); S(0.7);
      }
      break;
    }
    case 'witch': case 'bighat': {
      const big = L.head === 'bighat', col = L.hatCol || '#2a2350';
      const brimR = big ? 18 : 16, by = hy - (big ? 7.5 : 8.5);
      ctx.fillStyle = lgrad(ctx, 0, by - 4, 0, by + 4, [shade(col, 0.15), shade(col, -0.25)]);
      ctx.beginPath(); ctx.ellipse(0, by, brimR, big ? 5.5 : 4.4, big ? 0.1 : -0.06, 0, TAU); ctx.fill(); S();
      ctx.fillStyle = lgrad(ctx, -8, by - 24, 8, by, [shade(col, 0.25), col, shade(col, -0.2)]);
      ctx.beginPath();
      if (big) { ctx.moveTo(-10, by - 1); ctx.bezierCurveTo(-9, by - 15, 4, by - 20, 10, by - 17); ctx.quadraticCurveTo(15, by - 15, 14, by - 9); ctx.quadraticCurveTo(10, by - 12, 8, by - 9); ctx.quadraticCurveTo(9, by - 4, 10, by - 1); }
      else { ctx.moveTo(-9, by - 1.5); ctx.bezierCurveTo(-6, by - 14, -2, by - 20, -12, by - 24 + Math.sin(t * 2) * 0.8); ctx.bezierCurveTo(-2, by - 18, 6, by - 12, 9, by - 1.5); }
      ctx.closePath(); ctx.fill(); S();
      ctx.fillStyle = L.hatBand || c.accent; ctx.beginPath(); ctx.moveTo(-9.4, by - 1.2); ctx.quadraticCurveTo(0, by + 1.4, 9.4, by - 1.2); ctx.lineTo(8.8, by - 4); ctx.quadraticCurveTo(0, by - 1.6, -8.8, by - 4); ctx.closePath(); ctx.fill(); S(0.7);
      if (big) { ctx.fillStyle = '#d9534f'; rrect(ctx, -5, by - 11, 4.5, 4.5, 0.8); ctx.fill(); S(0.6); ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-4.4, by - 10.4); ctx.lineTo(-1.2, by - 7.2); ctx.stroke(); }
      if (L.charm === 'star') {
        const tx = -12, ty = by - 24 + Math.sin(t * 2) * 0.8, sw2 = Math.sin(t * 3) * 1.5;
        ctx.strokeStyle = '#ffe27a'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - 1 + sw2, ty + 5); ctx.stroke();
        ctx.fillStyle = '#ffe27a'; star5(ctx, tx - 1 + sw2, ty + 7.5, 3, 1.3); ctx.fill(); S(0.6);
        ctx.fillStyle = '#fff6c9'; ctx.beginPath(); ctx.arc(3, by - 9, 2.4, 0.6, 5.6); ctx.arc(4.3, by - 9, 1.9, 5.4, 0.8, true); ctx.closePath(); ctx.fill();
      } else if (L.charm === 'flower') {
        [[3, by - 2.6, '#ff9ec4'], [6.8, by - 3.4, '#fff3a8'], [-1, by - 2.2, '#ffffff']].forEach(([fx, fy, fc]) => {
          for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; ctx.fillStyle = fc; ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 1.6, fy + Math.sin(a) * 1.6, 1.3, 0, TAU); ctx.fill(); }
          ctx.fillStyle = '#ffcf3a'; ctx.beginPath(); ctx.arc(fx, fy, 0.9, 0, TAU); ctx.fill();
        });
        ctx.fillStyle = '#5fbf62'; ctx.beginPath(); ctx.ellipse(9.5, by - 2.5, 2.4, 1, -0.4, 0, TAU); ctx.fill();
      }
      break;
    }
    case 'feather': {
      const bx = back ? -6 : 7, by = hy - 7;
      ctx.fillStyle = '#f4fff8'; ctx.beginPath(); ctx.moveTo(bx, by + 2); ctx.quadraticCurveTo(bx + 7, by - 4, bx + 4, by - 12); ctx.quadraticCurveTo(bx + 1, by - 5, bx, by + 2); ctx.fill(); S(0.7);
      ctx.fillStyle = '#5fe0a0'; ctx.beginPath(); ctx.moveTo(bx + 4, by - 12); ctx.quadraticCurveTo(bx + 5.5, by - 8, bx + 4.6, by - 6); ctx.quadraticCurveTo(bx + 2.8, by - 8, bx + 4, by - 12); ctx.fill();
      ctx.fillStyle = '#fff17a'; ctx.beginPath(); ctx.arc(bx + 0.5, by + 1.5, 1.5, 0, TAU); ctx.fill(); S(0.6);
      break;
    }
    case 'lionband': case 'band': {
      const col = L.head === 'band' ? (L.bandCol || '#3b6fd1') : '#c8302a', y0 = hy - 5;
      const tw = Math.sin(t * 9) * 1.6;
      ctx.fillStyle = shade(col, -0.15);
      ctx.beginPath(); ctx.moveTo(-HR + 0.5, y0); ctx.quadraticCurveTo(-HR - 6, y0 - 2 + tw, -HR - 9, y0 + 1 + tw); ctx.lineTo(-HR - 7, y0 + 3 + tw); ctx.quadraticCurveTo(-HR - 4, y0 + 1, -HR + 0.5, y0 + 2.5); ctx.closePath(); ctx.fill(); S(0.7);
      ctx.beginPath(); ctx.moveTo(-HR + 0.5, y0 + 1); ctx.quadraticCurveTo(-HR - 5, y0 + 3 - tw, -HR - 7, y0 + 7 - tw); ctx.lineTo(-HR - 5, y0 + 7.5 - tw); ctx.quadraticCurveTo(-HR - 3, y0 + 4, -HR + 0.5, y0 + 3); ctx.closePath(); ctx.fill(); S(0.7);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-HR, y0 - 1); ctx.quadraticCurveTo(0, y0 - 4.5, HR, y0 - 1); ctx.lineTo(HR, y0 + 2); ctx.quadraticCurveTo(0, y0 - 1.5, -HR, y0 + 2); ctx.closePath(); ctx.fill(); S(0.7);
      if (L.head === 'lionband' && !back) { ctx.fillStyle = lgrad(ctx, 0, y0 - 5, 0, y0 + 2, ['#fff3b0', '#e0a83a']); ctx.beginPath(); ctx.ellipse(ecx * 0.6, y0 - 2, 3.4, 2.6, 0, 0, TAU); ctx.fill(); S(0.6); ctx.fillStyle = '#e33'; ctx.beginPath(); ctx.arc(ecx * 0.6, y0 - 2, 1, 0, TAU); ctx.fill(); }
      break;
    }
    case 'kerchief': {
      ctx.fillStyle = '#e2453c'; ctx.beginPath(); ctx.arc(0, hy - 0.5, HR + 1, Math.PI * 1.06, Math.PI * 1.94); ctx.quadraticCurveTo(0, hy - 7.5, -HR - 0.6, hy - 3.2); ctx.closePath(); ctx.fill(); S();
      ctx.fillStyle = '#ffffff'; [[-6, hy - 9], [-1, hy - 11.5], [4, hy - 10], [8, hy - 7], [-9, hy - 5.5], [1, hy - 7.6]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(dx, dy, 0.8, 0, TAU); ctx.fill(); });
      const tw = Math.sin(t * 7) * 1.2;
      ctx.fillStyle = '#c93a32'; ctx.beginPath(); ctx.moveTo(-HR, hy - 3); ctx.lineTo(-HR - 5, hy - 1 + tw); ctx.lineTo(-HR - 3, hy + 2 + tw); ctx.closePath(); ctx.fill(); S(0.7);
      ctx.beginPath(); ctx.moveTo(-HR, hy - 3); ctx.lineTo(-HR - 4, hy + 4 - tw); ctx.lineTo(-HR - 1.2, hy + 4.5 - tw); ctx.closePath(); ctx.fill(); S(0.7);
      break;
    }
    case 'circlet': {
      ctx.strokeStyle = OL; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(0, hy - 0.5, HR - 0.4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      ctx.strokeStyle = '#4fae5a'; ctx.lineWidth = 1.5; ctx.stroke();
      for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const a = Math.PI * (1.5 + sx * (0.22 + i * 0.1)), lx = Math.cos(a) * (HR - 0.4), ly = hy - 0.5 + Math.sin(a) * (HR - 0.4); ctx.fillStyle = i % 2 ? '#7fd66a' : '#4fae5a'; ctx.beginPath(); ctx.ellipse(lx, ly - 1, 2.4, 1.1, a + Math.PI / 2 + sx * 0.6, 0, TAU); ctx.fill(); }
      if (!back) { ctx.fillStyle = '#ffd76a'; ctx.beginPath(); ctx.arc(ecx * 0.5, hy - HR + 0.6, 1.8, 0, TAU); ctx.fill(); olS(ctx, 0.6); ctx.fillStyle = '#22a874'; ctx.beginPath(); ctx.arc(ecx * 0.5, hy - HR + 0.6, 0.9, 0, TAU); ctx.fill(); }
      break;
    }
    case 'feathercap': {
      ctx.fillStyle = lgrad(ctx, 0, hy - HR - 4, 0, hy - 2, ['#5a8a4a', '#2f5a2e']);
      ctx.beginPath(); ctx.moveTo(-HR - 1, hy - 2); ctx.quadraticCurveTo(-HR + 1, hy - HR - 3, 2, hy - HR - 2); ctx.quadraticCurveTo(HR, hy - HR + 1, HR + 2, hy - 3); ctx.quadraticCurveTo(0, hy - 6, -HR - 1, hy - 2); ctx.closePath(); ctx.fill(); S();
      ctx.beginPath(); ctx.moveTo(-HR + 1, hy - 6); ctx.quadraticCurveTo(-HR - 6, hy - 9, -HR - 9, hy - 5); ctx.quadraticCurveTo(-HR - 4, hy - 4, -HR + 1, hy - 3); ctx.closePath(); ctx.fill(); S(0.8);
      const fw = Math.sin(t * 5) * 0.8;
      ctx.fillStyle = '#e2453c'; ctx.beginPath(); ctx.moveTo(-4, hy - HR); ctx.quadraticCurveTo(-8 + fw, hy - HR - 9, -14 + fw, hy - HR - 11); ctx.quadraticCurveTo(-9, hy - HR - 4, -3, hy - HR + 1); ctx.closePath(); ctx.fill(); S(0.7);
      ctx.strokeStyle = '#c9a14a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-HR + 0.5, hy - 3.5); ctx.quadraticCurveTo(0, hy - 6.5, HR + 1, hy - 4.5); ctx.stroke();
      break;
    }
    case 'snowpin': {
      const bx = back ? -6 : 7.5, by = hy - 6;
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2;
      ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = (i * Math.PI) / 3; ctx.moveTo(bx - Math.cos(a) * 3.4, by - Math.sin(a) * 3.4); ctx.lineTo(bx + Math.cos(a) * 3.4, by + Math.sin(a) * 3.4); } ctx.stroke();
      ctx.fillStyle = '#9fe3ff'; ctx.beginPath(); ctx.arc(bx, by, 1.2, 0, TAU); ctx.fill();
      break;
    }
    case 'cap': {
      const col = L.capCol || '#e2453c';
      ctx.fillStyle = shade(col, -0.2); ctx.beginPath(); ctx.ellipse(-HR - 1.5, hy - 3.2, 6, 2, -0.15, 0, TAU); ctx.fill(); S();
      ctx.fillStyle = lgrad(ctx, 0, hy - HR, 0, hy - 2, [shade(col, 0.2), col]);
      ctx.beginPath(); ctx.arc(0, hy - 1.5, HR + 0.9, Math.PI * 1.02, Math.PI * 1.98); ctx.quadraticCurveTo(0, hy - 3.5, -HR - 0.7, hy - 1.8); ctx.closePath(); ctx.fill(); S();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, hy - HR - 1.6, 1.2, 0, TAU); ctx.fill(); S(0.6);
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(0, hy - HR - 1); ctx.quadraticCurveTo(2, hy - 6, 1, hy - 3); ctx.stroke();
      break;
    }
    case 'helm': {
      const by = hy - 5.5;
      ctx.fillStyle = lgrad(ctx, 0, by - 12, 0, by, ['#eef1f6', '#a3abbb', '#7a8296']);
      ctx.beginPath(); ctx.arc(0, by, 10.8, Math.PI, TAU); ctx.closePath(); ctx.fill(); S();
      ctx.fillStyle = lgrad(ctx, 0, by - 3, 0, by + 3, ['#d9dee8', '#7a8296']); ctx.beginPath(); ctx.ellipse(0, by, 15.5, 3.8, 0, 0, TAU); ctx.fill(); S();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, by, 9, Math.PI * 1.2, Math.PI * 1.5); ctx.stroke();
      ctx.strokeStyle = OL; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, by - 10.8); ctx.lineTo(0, by); ctx.stroke();
      ctx.fillStyle = '#5a6278'; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 5.6, by + 0.4, 0.8, 0, TAU); ctx.fill(); }
      break;
    }
    default: break;
  }
}

/* ---------- Q版角色（俯視 3/4 角度） ---------- */
function drawChibi(ctx, c, x, y, o = {}) {
  const L = LOOKS[c.id] || {};
  const s = o.scale || 1, t = o.t || 0, face = o.face ?? Math.PI / 2;
  const fx = Math.cos(face), fy = Math.sin(face);
  const flip = fx < -0.1 ? -1 : 1;
  const back = fy < -0.55;
  const lite = !!o.lite, moving = !!o.moving;
  const bob = moving ? Math.abs(Math.sin(t * 14)) * 2 : Math.sin(t * 3) * 0.6;
  const cloakCol = o.cloak || c.cloak;
  const H = c.hair, Hd = shade(H, -0.3), Hl = shade(H, 0.45);
  const OUT = c.outfit, OUTd = shade(OUT, -0.32), OUTl = shade(OUT, 0.16);
  const HR = 12, hy = -32 - bob;
  const S = (w) => { if (!lite) olS(ctx, w); };
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (!o.noShadow) { ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 5, 0, 0, TAU); ctx.fill(); }
  // 卡伊：黑焰氣場
  if (L.aura === 'dark' && !lite) {
    ctx.save(); ctx.globalAlpha *= 0.55;
    for (let i = 0; i < 5; i++) {
      const px = -10 + i * 5, h = 10 + Math.sin(t * 9 + i * 1.7) * 4 + (i % 2) * 4;
      ctx.fillStyle = i % 2 ? '#2a0f3a' : '#4a1650'; ctx.beginPath(); ctx.moveTo(px - 3.5, -1); ctx.quadraticCurveTo(px - 2, -h * 0.6, px + Math.sin(t * 7 + i) * 1.5, -h); ctx.quadraticCurveTo(px + 2, -h * 0.6, px + 3.5, -1); ctx.fill();
    }
    ctx.restore();
  }
  // 覺醒：腳下金色光環
  if (o.awakened && !lite) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.35 + 0.15 * Math.sin(t * 4);
    const ag = ctx.createRadialGradient(0, -2, 2, 0, -2, 18); ag.addColorStop(0, 'rgba(255,230,140,0.9)'); ag.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = ag; ctx.beginPath(); ctx.ellipse(0, -2, 18, 7, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  const wAng = o.weaponAng ?? (flip > 0 ? -0.6 : Math.PI + 0.6);
  const weaponBehind = back || (o.weaponAng != null && Math.sin(o.weaponAng) < -0.3);
  const wx = 7 * flip, wy = -14 - bob, swing = o.swing || 0, glow = o.glow || 0;
  // 手臂連武器（世界座標）
  const armWeapon = () => {
    if (o.noWeapon) return;
    const fist = c.cls === 'fist', k = weaponKind(c);
    const ga = wAng + (fist ? 0 : swing), reach = fist ? 0 : GRIP[k] || 4;
    const sx = 5 * flip, sy = -19 - bob;
    if (!fist) {
      const hx = wx + Math.cos(ga) * reach, hy2 = wy + Math.sin(ga) * reach;
      if (!lite) { ctx.strokeStyle = OL; ctx.lineWidth = 4.4; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy2); ctx.stroke(); }
      ctx.strokeStyle = OUT; ctx.lineWidth = 2.8; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy2); ctx.stroke();
    }
    drawWeapon(ctx, c, wx, wy, wAng, swing, glow, t, lite);
  };
  if (weaponBehind) armWeapon();
  ctx.save(); ctx.scale(flip, 1);
  const step = moving ? Math.sin(t * 14) * 3 : 0;
  // ---- 背後：配件、頭髮、斗篷 ----
  const backAcc = () => {
    if (L.back === 'kasa') {
      const bx = back ? 0 : -4, by = -23 - bob;
      ctx.fillStyle = lgrad(ctx, bx, by - 9, bx, by + 9, ['#f0d48a', '#c99a4a']); ctx.beginPath(); ctx.ellipse(bx, by, 11.5, 9.5, 0, 0, TAU); ctx.fill(); S();
      ctx.strokeStyle = 'rgba(120,80,30,0.55)'; ctx.lineWidth = 0.6; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a) * 11, by + Math.sin(a) * 9); } ctx.stroke();
      ctx.fillStyle = '#8a5a2b'; ctx.beginPath(); ctx.arc(bx, by, 1.6, 0, TAU); ctx.fill();
    } else if (L.back === 'quiver') {
      ctx.save(); if (back) { ctx.translate(3, -21 - bob); ctx.rotate(0.35); } else { ctx.translate(-7.5, -23 - bob); ctx.rotate(-0.45); }
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-1.6 + i * 1.6, -6); ctx.lineTo(-1.6 + i * 1.6, -10); ctx.stroke(); ctx.fillStyle = i === 1 ? c.accent : '#ffffff'; poly(ctx, [[-2.6 + i * 1.6, -10], [-1.6 + i * 1.6, -13.5], [-0.6 + i * 1.6, -10]]); ctx.fill(); }
      ctx.fillStyle = lgrad(ctx, -3, 0, 3, 0, ['#9a6a3a', '#6b4528']); rrect(ctx, -3.2, -7, 6.4, 15, 2.2); ctx.fill(); S(0.8);
      ctx.fillStyle = c.accent; ctx.fillRect(-3.2, -5, 6.4, 1.3); ctx.fillRect(-3.2, 4, 6.4, 1.3);
      ctx.restore();
    } else if (L.back === 'pack') {
      ctx.fillStyle = lgrad(ctx, 0, -22, 0, -9, ['#a87a4a', '#6e4a28']);
      if (back) { rrect(ctx, -5.5, -22 - bob, 11, 12, 3); ctx.fill(); S(); ctx.fillStyle = '#c99a5a'; rrect(ctx, -4, -16 - bob, 8, 4, 1.5); ctx.fill(); S(0.6); }
      else { rrect(ctx, -12.5, -21 - bob, 6, 11, 2.5); ctx.fill(); S(); }
    }
  };
  const scarfTail = () => {
    if (!L.scarf) return;
    const len = L.longScarf ? 20 : 12, w1 = Math.sin(t * 8) * (moving ? 3 : 1.5), w2 = Math.sin(t * 8 + 1.5) * (moving ? 3 : 1.5);
    ctx.fillStyle = shade(L.scarf, -0.15);
    ctx.beginPath(); ctx.moveTo(-3, -22 - bob); ctx.bezierCurveTo(-8, -22 + w1, -len * 0.7, -19 + w2, -len, -17 + w1 + (moving ? -2 : 3));
    ctx.lineTo(-len + 1.5, -14 + w1 + (moving ? -2 : 3)); ctx.bezierCurveTo(-len * 0.6, -16 + w2, -7, -19, -2, -19.5 - bob); ctx.closePath(); ctx.fill(); S(0.8);
  };
  const cape = () => {
    const flap = Math.sin(t * 8) * (moving ? 3 : 1), flap2 = Math.sin(t * 8 + 1.3) * (moving ? 2.4 : 0.8);
    ctx.fillStyle = lgrad(ctx, 0, -22, 0, 0, [shade(cloakCol, 0.12), cloakCol, shade(cloakCol, -0.22)]);
    ctx.beginPath(); ctx.moveTo(-8, -21.5 - bob);
    ctx.bezierCurveTo(-13 - flap, -15, -14.5 - flap * 1.2, -7, -12.5 - flap, -1.5 + flap2 * 0.3);
    ctx.quadraticCurveTo(-9 - flap * 0.6, -3.5 + flap2 * 0.5, -6 - flap * 0.4, -1.2); ctx.quadraticCurveTo(-3, -3, 0, -1); ctx.quadraticCurveTo(4, -2.8, 9.5, -1.8);
    ctx.bezierCurveTo(11.5, -8, 11, -15, 8, -21.5 - bob); ctx.closePath(); ctx.fill(); S();
    if (!lite) {
      ctx.fillStyle = shade(cloakCol, -0.35); ctx.beginPath(); ctx.moveTo(-12.5 - flap, -1.5 + flap2 * 0.3); ctx.quadraticCurveTo(-9 - flap * 0.6, -3.5 + flap2 * 0.5, -6 - flap * 0.4, -1.2); ctx.quadraticCurveTo(-9, -6, -11.5 - flap, -5); ctx.closePath(); ctx.fill();
      if (L.capeStars) { ctx.fillStyle = '#ffe27a'; [[-11, -8], [-9, -14], [-12.5, -4], [-7.5, -5], [-10, -11]].forEach(([sx, sy], i) => { sparkle(ctx, sx - flap * 0.6, sy, 1.1 + 0.5 * Math.sin(t * 5 + i), '#ffe27a'); }); }
    }
  };
  const legs = () => {
    const boot = shade(OUT, -0.5);
    [[-5.6, step], [1, -step]].forEach(([lx, st]) => {
      const bx = lx + st * 0.5, lift = Math.max(0, st) * 0.4;
      ctx.fillStyle = boot; rrect(ctx, bx, -7.2 - lift, 4.6, 7.2, 2); ctx.fill(); S(0.8);
      if (!lite) { ctx.fillStyle = c.accent; ctx.fillRect(bx + 0.4, -6.6 - lift, 3.8, 1.1); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(bx + 0.8, -4.5 - lift, 1, 3); }
    });
  };
  const torso = () => {
    const top = -21.5 - bob;
    if (L.skirt) {
      ctx.fillStyle = lgrad(ctx, 0, -12, 0, -4, [OUTl, OUTd]);
      ctx.beginPath(); ctx.moveTo(-7.4, -12.5 - bob); ctx.lineTo(-10.5, -5.2); ctx.quadraticCurveTo(0, -3, 10.5, -5.2); ctx.lineTo(7.4, -12.5 - bob); ctx.closePath(); ctx.fill(); S();
      if (!lite) { ctx.strokeStyle = c.accent; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-10, -5.8); ctx.quadraticCurveTo(0, -3.8, 10, -5.8); ctx.stroke(); ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.moveTo(-3, -11 - bob); ctx.lineTo(-4.5, -4.6); ctx.moveTo(3, -11 - bob); ctx.lineTo(4.5, -4.6); ctx.stroke(); }
    }
    ctx.fillStyle = lgrad(ctx, 0, top, 0, -7, [OUTl, OUT, OUTd]);
    rrect(ctx, -7.5, top, 15, L.skirt ? 10.5 : 14.5, 5); ctx.fill(); S();
    if (lite) return;
    ctx.fillStyle = 'rgba(0,0,0,0.14)'; rrect(ctx, -7.5, top, 4.5, L.skirt ? 10.5 : 14.5, 4); ctx.fill();
    if (L.apron) { ctx.fillStyle = '#fffaf0'; rrect(ctx, -4.6, top + 3, 9.2, L.skirt ? 13 : 11, 2.4); ctx.fill(); S(0.7); ctx.strokeStyle = '#e2a87a'; ctx.lineWidth = 0.7; rrect(ctx, -2.2, top + 8, 4.4, 3, 1); ctx.stroke(); }
    if (L.tabard) { ctx.fillStyle = '#3d5a8c'; poly(ctx, [[-4.5, top + 1], [4.5, top + 1], [4.5, top + 15], [0, top + 17.5], [-4.5, top + 15]]); ctx.fill(); S(0.7); ctx.fillStyle = '#e8c64a'; ctx.beginPath(); ctx.arc(0, top + 8, 2.2, 0, TAU); ctx.fill(); ctx.fillStyle = '#3d5a8c'; star5(ctx, 0, top + 8, 1.6, 0.7); ctx.fill(); }
    if (L.sash) { ctx.fillStyle = L.sash; ctx.beginPath(); ctx.moveTo(-6, top + 0.5); ctx.lineTo(-3, top); ctx.lineTo(7.5, top + 11); ctx.lineTo(5, top + 13); ctx.closePath(); ctx.fill(); S(0.6); }
    // 衣領
    ctx.fillStyle = L.collar || c.accent; poly(ctx, [[-3.8, top], [0, top + 4.2], [3.8, top]]); ctx.fill(); S(0.6);
    // 腰帶
    const beltY = -12.6 - bob;
    if (L.belt === 'champ') { ctx.fillStyle = lgrad(ctx, 0, beltY - 2, 0, beltY + 3, ['#fff0a0', '#d4a020']); rrect(ctx, -8, beltY - 1.2, 16, 4, 1.5); ctx.fill(); S(0.7); ctx.fillStyle = '#e33'; ctx.beginPath(); ctx.ellipse(1, beltY + 0.8, 2.6, 2.2, 0, 0, TAU); ctx.fill(); S(0.6); }
    else if (!L.apron && !L.tabard) { ctx.fillStyle = shade(OUT, -0.58); ctx.fillRect(-7.5, beltY, 15, 2.2); ctx.fillStyle = c.accent; rrect(ctx, -1.4, beltY - 0.5, 2.8, 3.2, 0.8); ctx.fill(); }
    // 肩甲
    if (L.shoulder) {
      const pal = L.shoulder === 'silver' ? ['#ffffff', '#c3cde0', '#8090b0'] : L.shoulder === 'spike' ? ['#5a4a6a', '#2a2433', '#15111c'] : ['#e8fff2', '#7fd6a6', '#3f9a6a'];
      for (const sx of [-1, 1]) {
        ctx.fillStyle = lgrad(ctx, 0, top - 3, 0, top + 4, pal); ctx.beginPath(); ctx.ellipse(sx * 6.8, top + 1.8, 4, 3, sx * 0.25, 0, TAU); ctx.fill(); S(0.7);
        if (L.shoulder === 'spike') { ctx.fillStyle = '#b8323a'; poly(ctx, [[sx * 5.5, top - 0.5], [sx * 7.5, top - 5.5], [sx * 8.5, top]]); ctx.fill(); S(0.6); }
      }
    }
    // 圍巾／毛領／佛珠
    if (L.scarf) { ctx.fillStyle = L.scarf; rrect(ctx, -6.2, top - 1.6, 12.4, 3.6, 1.8); ctx.fill(); S(0.7); }
    if (L.fur) { ctx.fillStyle = '#f4f8ff'; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.arc(i * 2.2, top + Math.abs(i) * 0.3, 2.1, 0, TAU); ctx.fill(); } ctx.strokeStyle = 'rgba(150,180,210,0.6)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.arc(0, top - 4, 7.5, 0.35 * Math.PI, 0.65 * Math.PI); ctx.stroke(); }
    if (L.beads) { for (let i = 0; i <= 8; i++) { const a = Math.PI * (0.15 + (i / 8) * 0.7), r = 6.4; ctx.fillStyle = i === 4 ? '#c9a14a' : '#6b3a1f'; ctx.beginPath(); ctx.arc(Math.cos(a) * r, top - 1 + Math.sin(a) * r * 0.9, i === 4 ? 1.9 : 1.4, 0, TAU); ctx.fill(); S(0.5); } }
    if (L.vine) { ctx.strokeStyle = '#5fbf62'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-6, top + 2); ctx.quadraticCurveTo(-2, top + 6, 2, top + 3); ctx.quadraticCurveTo(5, top + 1, 6.5, top + 6); ctx.stroke(); ctx.fillStyle = '#ff9ec4'; ctx.beginPath(); ctx.arc(2, top + 3, 1.2, 0, TAU); ctx.fill(); }
  };
  const backArm = () => {
    const sw2 = moving ? -Math.sin(t * 14) * 0.5 : Math.sin(t * 3) * 0.08, top = -19.5 - bob;
    const cast = o.pose === 'cast';
    const ex2 = cast ? -9 : -8.5 + sw2 * 2, ey2 = cast ? top - 8 : top + 6.5;
    if (!lite) { ctx.strokeStyle = OL; ctx.lineWidth = 4.2; ctx.beginPath(); ctx.moveTo(-6, top); ctx.lineTo(ex2, ey2); ctx.stroke(); }
    ctx.strokeStyle = OUTd; ctx.lineWidth = 2.7; ctx.beginPath(); ctx.moveTo(-6, top); ctx.lineTo(ex2, ey2); ctx.stroke();
    if (c.cls === 'fist') {
      const k = weaponKind(c);
      ctx.fillStyle = k === 'lion' ? '#e8a81e' : k === 'wraps' ? c.skin : '#d6302a'; ctx.beginPath(); ctx.arc(ex2, ey2 + 1, 3.4, 0, TAU); ctx.fill(); S(0.7);
      if (k === 'wraps' && !lite) { ctx.strokeStyle = '#f4efe4'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ex2 - 2.4, ey2 - 0.5); ctx.lineTo(ex2 + 2, ey2 + 2.5); ctx.stroke(); }
    } else { ctx.fillStyle = c.skin; ctx.beginPath(); ctx.arc(ex2, ey2 + 0.6, 2.1, 0, TAU); ctx.fill(); S(0.7); }
  };
  const head = () => {
    const sg = ctx.createRadialGradient(-3, hy - 5, 2, 0, hy, HR + 1);
    sg.addColorStop(0, shade(c.skin, 0.3)); sg.addColorStop(1, shade(c.skin, -0.07));
    ctx.fillStyle = back ? c.skin : sg; ctx.beginPath(); ctx.arc(0, hy, HR, 0, TAU); ctx.fill(); S();
  };
  const faceF = () => {
    if (lite) return;
    const ecx = Math.abs(fx) * 3, eyY = hy + 2.6, fore = 1 - Math.abs(fx) * 0.18;
    const seed = c.id.charCodeAt(2) * 0.37;
    const blink = ((t + seed) % 3.6) < 0.11;
    for (const dx of [-4.3, 4.1]) {
      const ex = ecx + dx * fore;
      if (blink || L.eyes === 'calm') {
        ctx.strokeStyle = '#2a1a2e'; ctx.lineWidth = 1.2; ctx.beginPath();
        if (L.eyes === 'calm' && !blink) ctx.arc(ex, eyY - 0.6, 2.2, 0.15 * Math.PI, 0.85 * Math.PI); else { ctx.moveTo(ex - 2.3, eyY + 0.6); ctx.quadraticCurveTo(ex, eyY + 1.8, ex + 2.3, eyY + 0.6); }
        ctx.stroke(); continue;
      }
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(ex, eyY, 2.5, 3.3, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, eyY - 3, 0, eyY + 3, [shade(c.eye, -0.4), c.eye, shade(c.eye, 0.45)]);
      ctx.beginPath(); ctx.ellipse(ex + 0.3, eyY + 0.4, 2.05, 2.85, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = shade(c.eye, -0.68); ctx.beginPath(); ctx.ellipse(ex + 0.35, eyY + 0.6, 1.0, 1.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex - 0.6, eyY - 1.1, 0.95, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(ex + 1, eyY + 1.6, 0.45, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#2a1a2e'; ctx.lineWidth = 1.25; ctx.beginPath(); ctx.ellipse(ex, eyY - 0.1, 2.75, 3.35, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
      if (L.eyeGlow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.55 + 0.25 * Math.sin(t * 8); ctx.fillStyle = L.eyeGlow; ctx.beginPath(); ctx.arc(ex + 0.3, eyY + 0.4, 2.6, 0, TAU); ctx.fill(); ctx.restore(); }
    }
    ctx.fillStyle = 'rgba(255,120,140,0.35)'; ctx.beginPath(); ctx.ellipse(ecx - 6.2, hy + 6.6, 2.2, 1.2, 0, 0, TAU); ctx.ellipse(ecx + 6, hy + 6.6, 2.2, 1.2, 0, 0, TAU); ctx.fill();
    if (o.shout) { ctx.fillStyle = '#8a2a3a'; ctx.beginPath(); ctx.ellipse(ecx, hy + 7.6, 1.6, 1.3, 0, 0, TAU); ctx.fill(); }
    else { ctx.strokeStyle = '#a5524c'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(ecx, hy + 6.4, 1.3, 0.25 * Math.PI, 0.75 * Math.PI); ctx.stroke(); }
    if (L.glasses) {
      ctx.strokeStyle = '#6b4a2e'; ctx.lineWidth = 0.9;
      for (const dx of [-4.3, 4.1]) { ctx.beginPath(); ctx.arc(ecx + dx * fore, eyY + 0.2, 3.5, 0, TAU); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(ecx - 0.9, eyY); ctx.lineTo(ecx + 0.7, eyY); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(ecx - 5.2, eyY - 1.2, 1, 0, TAU); ctx.arc(ecx + 3.2, eyY - 1.2, 1, 0, TAU); ctx.fill();
    }
  };
  const hairGrad = () => lgrad(ctx, 0, hy - HR - 2, 0, hy + 6, [shade(H, 0.15), H, Hd]);
  const hairShine = () => {
    if (lite || c.hairStyle === 'shaved') return;
    ctx.save(); ctx.globalAlpha *= 0.75; ctx.strokeStyle = Hl; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, hy - 1, HR - 3.2, Math.PI * 1.2, Math.PI * 1.42); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, hy - 1, HR - 3.2, Math.PI * 1.52, Math.PI * 1.7); ctx.stroke();
    ctx.restore();
  };
  const sideLocks = () => {
    if (!['long', 'twin', 'pony', 'short'].includes(c.hairStyle)) return;
    ctx.fillStyle = hairGrad();
    ctx.beginPath(); ctx.moveTo(-HR + 0.2, hy - 1); ctx.quadraticCurveTo(-HR - 1.4, hy + 6, -HR + 0.8, hy + 10); ctx.quadraticCurveTo(-HR + 2.6, hy + 6, -HR + 3, hy + 1); ctx.closePath(); ctx.fill(); S(0.7);
    ctx.beginPath(); ctx.moveTo(HR - 0.6, hy); ctx.quadraticCurveTo(HR + 0.6, hy + 5, HR - 1, hy + 8.5); ctx.quadraticCurveTo(HR - 2.8, hy + 5, HR - 3.2, hy + 1.5); ctx.closePath(); ctx.fill(); S(0.7);
  };
  const twinTies = () => { if (c.hairStyle === 'twin' && !lite) { ctx.fillStyle = c.accent; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * (HR + 1.5), hy - 4.5, 2.2, 0, TAU); ctx.fill(); S(0.6); } } };
  const orbit = () => {
    if (!L.orbit || lite) return;
    const a = t * 2.4, ox = Math.cos(a) * 17, oy = -24 + Math.sin(a) * 6;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.6;
    const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, 6); og.addColorStop(0, 'rgba(255,240,170,0.9)'); og.addColorStop(1, 'rgba(255,220,100,0)'); ctx.fillStyle = og; ctx.beginPath(); ctx.arc(ox, oy, 6, 0, TAU); ctx.fill(); ctx.restore();
    ctx.fillStyle = L.orbit; star5(ctx, ox, oy, 2.8, 1.2, a); ctx.fill(); S(0.5);
  };

  if (back) {
    legs(); backArm(); torso();
    head();
    ctx.fillStyle = hairGrad(); ctx.beginPath(); ctx.arc(0, hy, HR + 0.8, 0, TAU); ctx.fill(); S();
    if (!lite && c.hairStyle !== 'shaved') { ctx.strokeStyle = Hd; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, hy - HR); ctx.quadraticCurveTo(-2, hy, -1, hy + 8); ctx.moveTo(-5, hy - 9); ctx.quadraticCurveTo(-7, hy, -6, hy + 7); ctx.moveTo(5, hy - 9); ctx.quadraticCurveTo(6.5, hy, 5.5, hy + 7); ctx.stroke(); }
    if (hairBackPath(ctx, c, L, hy, t, HR)) { ctx.fillStyle = hairGrad(); ctx.fill(); S(); }
    twinTies();
    cape(); scarfTail(); backAcc();
    drawHeadgear(ctx, c, L, hy, HR, t, true, 0);
    hairShine();
  } else {
    backAcc(); scarfTail();
    if (hairBackPath(ctx, c, L, hy, t, HR)) { ctx.fillStyle = L.mane ? lgrad(ctx, 0, hy - 20, 0, hy + 10, [shade(H, 0.1), Hd]) : lgrad(ctx, 0, hy - HR, 0, hy + 20, [Hd, shade(H, -0.45)]); ctx.fill(); S(); }
    cape(); backArm(); legs(); torso();
    head(); faceF();
    ctx.fillStyle = hairGrad(); hairFrontPath(ctx, c, hy, HR); ctx.fill(); S();
    sideLocks(); hairShine(); twinTies();
    if (L.head) drawHeadgear(ctx, c, L, hy, HR, t, false, Math.abs(fx) * 3);
  }
  ctx.restore();
  if (!weaponBehind) armWeapon();
  ctx.save(); ctx.scale(flip, 1); orbit(); ctx.restore();
  if (o.awakened && !lite) { const ga0 = ctx.globalAlpha; for (let i = 0; i < 3; i++) { const k = (t * 0.8 + i / 3) % 1; ctx.globalAlpha = ga0 * Math.sin(k * Math.PI) * 0.9; sparkle(ctx, Math.cos(i * 2.1 + t) * 14, -10 - k * 30, 2.2, '#fff3b0'); } ctx.globalAlpha = ga0; }
  ctx.restore();
}
