
/* ============================================================
 * 6c. 新怪物造型：冰霜狼、毒蘑菇怪、石像鬼、炸彈小鬼、冰霜巨人、深淵魔龍
 * ============================================================ */
function eyeGlow(ctx, x, y, r, col, a = 0.9) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = col; ctx.globalAlpha = a;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.globalAlpha = a * 0.35; ctx.beginPath(); ctx.arc(x, y, r * 2.8, 0, TAU); ctx.fill(); ctx.restore();
}

/* ---------- 冰霜狼 ---------- */
function drawWolf(ctx, e, t) {
  const z = e.z || 0, flash = e.flash > 0;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(e.x, e.y, 17, 5.5, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(e.x, e.y - z); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const flip = Math.cos(e.state === 'charge' ? e.chA ?? e.face : e.face) < 0 ? -1 : 1; ctx.scale(flip, 1);
  const dash = e.state === 'charge' && e.t >= (e.chWind ?? 0), crouch = e.state === 'charge' && !dash, breath = e.state === 'cast', roar = e.state === 'roar';
  const run = e.state === 'idle' || dash, ph = t * (dash ? 26 : 14) + e.id;
  if (dash) ctx.scale(1.18, 0.9); else if (crouch) ctx.scale(1, 0.86);
  const fur = flash ? '#ffffff' : lgrad(ctx, 0, -24, 0, -6, ['#ffffff', '#d6e9ff', '#8fb0d8']), furD = flash ? '#ffffff' : '#7f9cc4';
  // 尾巴
  const tw = Math.sin(t * 6 + e.id) * 0.25;
  ctx.save(); ctx.translate(-13, -17); ctx.rotate(-0.6 + tw);
  ctx.fillStyle = fur; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-8, -10, -6, -18); ctx.quadraticCurveTo(-1, -12, 4, -4); ctx.closePath(); ctx.fill(); olS(ctx);
  ctx.restore();
  // 後腿＋前腿
  const leg = (x, p0, near) => {
    const sw = run ? Math.sin(ph + p0) * 0.55 : 0;
    ctx.save(); ctx.translate(x, -12); ctx.rotate(sw);
    ctx.fillStyle = near ? furD : shade('#7f9cc4', -0.2); rrect(ctx, -2.2, 0, 4.4, 12, 2); ctx.fill(); olS(ctx, 0.8);
    ctx.fillStyle = '#5a6f90'; ctx.beginPath(); ctx.ellipse(0.8, 12, 2.8, 1.6, 0, 0, TAU); ctx.fill();
    ctx.restore();
  };
  leg(-9, Math.PI, false); leg(7, 0, false);
  // 身體
  ctx.fillStyle = fur; ctx.beginPath(); ctx.ellipse(0, -16, 15, 8, 0, 0, TAU); ctx.fill(); olS(ctx);
  // 背上冰晶
  if (!flash) {
    [[-7, -22, 6], [-1, -24, 8], [5, -23, 6]].forEach(([x, y, h]) => { ctx.fillStyle = lgrad(ctx, x, y - h, x, y, ['#ffffff', '#9fe3ff', '#4ea8ff']); poly(ctx, [[x - 2.5, y + 1], [x, y - h], [x + 2.5, y + 1]]); ctx.fill(); olS(ctx, 0.7); });
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-3, -20, 7, 2, 0, 0, TAU); ctx.fill();
  }
  leg(-5, Math.PI + 1.2, true); leg(10, 1.2, true);
  // 頭
  const hx = 15, hy = roar ? -26 : breath ? -21 : -22;
  ctx.save(); ctx.translate(hx, hy); if (roar) ctx.rotate(-0.45);
  ctx.fillStyle = fur; poly(ctx, [[-4, -5], [-2, -13], [2, -6]]); ctx.fill(); olS(ctx, 0.8); poly(ctx, [[1, -6], [4, -13], [6, -5]]); ctx.fill(); olS(ctx, 0.8);
  ctx.fillStyle = flash ? '#ffffff' : '#ffb3c8'; poly(ctx, [[-2.6, -6], [-2, -10.5], [0.6, -6.5]]); ctx.fill();
  ctx.fillStyle = fur; ctx.beginPath(); ctx.ellipse(0, 0, 7.5, 6.5, 0, 0, TAU); ctx.fill(); olS(ctx);
  const open = breath || roar ? 3.2 : 0;
  ctx.fillStyle = flash ? '#ffffff' : '#eef6ff'; ctx.beginPath(); ctx.moveTo(4, -2); ctx.quadraticCurveTo(13, -2, 13, 1); ctx.lineTo(5, 2.5); ctx.closePath(); ctx.fill(); olS(ctx, 0.8);
  if (open) { ctx.fillStyle = '#5a1a2a'; poly(ctx, [[5, 2.5], [12.5, 1.4], [11, 3 + open], [5, 4 + open * 0.5]]); ctx.fill(); ctx.fillStyle = '#ffffff'; poly(ctx, [[7, 2.2], [8, 4], [9, 2]]); ctx.fill(); }
  ctx.fillStyle = flash ? '#ffffff' : '#dfeeff'; ctx.beginPath(); ctx.moveTo(5, 2.5 + open); ctx.quadraticCurveTo(10, 4 + open, 11.5, 2.5 + open); ctx.lineTo(5, 5 + open * 0.5); ctx.closePath(); ctx.fill(); olS(ctx, 0.7);
  ctx.fillStyle = '#1a1a2a'; ctx.beginPath(); ctx.arc(13, -0.6, 1.4, 0, TAU); ctx.fill();
  ctx.fillStyle = '#10182a'; ctx.beginPath(); ctx.ellipse(2.5, -1.5, 1.8, 1.4, 0.2, 0, TAU); ctx.fill();
  eyeGlow(ctx, 2.7, -1.6, 1, crouch || dash || breath ? '#ff5d5d' : '#7fe3ff');
  ctx.restore();
  if (breath && !flash) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, hx + 14, hy + 2, 10 + Math.sin(t * 30) * 2, '#9fe3ff', 0.8); ctx.restore(); }
  if (e.haste > 0 && !flash) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#bfe9ff'; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.2; for (let i = 0; i < 3; i++) { const y = -10 - i * 6; ctx.beginPath(); ctx.moveTo(-18 - ((t * 120 + i * 9) % 14), y); ctx.lineTo(-26 - ((t * 120 + i * 9) % 14), y); ctx.stroke(); } ctx.restore(); }
  if (e.elite) drawCrown(ctx, hx, hy - 12, 10);
  ctx.restore();
}

/* ---------- 毒蘑菇怪 ---------- */
function drawShroom(ctx, e, t) {
  const z = e.z || 0, flash = e.flash > 0, cast = e.state === 'cast', crouch = e.state === 'leap' && e.t < 0.45;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(e.x, e.y, 18 * (1 - z / 140), 6, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(e.x, e.y - z); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const flip = Math.cos(e.face) < 0 ? -1 : 1; ctx.scale(flip, 1);
  const sq = crouch ? 0.8 : 1 + Math.sin(t * 4 + e.id) * 0.04, puff = cast ? 1 + Math.sin(Math.min(1, e.t / 0.55) * Math.PI) * 0.18 : 1;
  ctx.scale(2 - sq, sq);
  // 腳
  const st = e.state === 'idle' ? Math.sin(t * 8 + e.id) * 2 : 0;
  ctx.fillStyle = flash ? '#ffffff' : '#8a6a4a'; ctx.beginPath(); ctx.ellipse(-6 + st, -1.5, 4.5, 2.6, 0, 0, TAU); ctx.fill(); olS(ctx, 0.8); ctx.beginPath(); ctx.ellipse(6 - st, -1.5, 4.5, 2.6, 0, 0, TAU); ctx.fill(); olS(ctx, 0.8);
  // 莖（身體）
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, -24, 0, -2, ['#fffaf0', '#efe2c8', '#c9b48e']);
  ctx.beginPath(); ctx.moveTo(-9, -3); ctx.quadraticCurveTo(-11, -14, -8, -22); ctx.lineTo(8, -22); ctx.quadraticCurveTo(11, -14, 9, -3); ctx.quadraticCurveTo(0, 0, -9, -3); ctx.closePath(); ctx.fill(); olS(ctx);
  // 臉
  ctx.fillStyle = '#2a1a2e'; ctx.beginPath(); ctx.ellipse(-2, -14, 2, 2.6, 0, 0, TAU); ctx.ellipse(5, -14, 2, 2.6, 0, 0, TAU); ctx.fill();
  if (cast || crouch) { eyeGlow(ctx, -1.8, -14, 0.9, '#ff5dd5'); eyeGlow(ctx, 5.2, -14, 0.9, '#ff5dd5'); } else { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-2.6, -15, 0.8, 0, TAU); ctx.arc(4.4, -15, 0.8, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = '#2a1a2e'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-4.5, -18); ctx.lineTo(0, -16.5); ctx.moveTo(7.5, -18); ctx.lineTo(3, -16.5); ctx.stroke();
  ctx.beginPath(); if (cast) ctx.ellipse(1.5, -9, 2.2, 1.6, 0, 0, TAU); else { ctx.moveTo(-1, -8.5); ctx.quadraticCurveTo(1.5, -10.5, 4, -8.5); } cast ? (ctx.fillStyle = '#5a1a3a', ctx.fill()) : ctx.stroke();
  // 傘蓋
  ctx.save(); ctx.translate(0, -22); ctx.scale(puff, puff);
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, -18, 0, 2, ['#c98aff', '#9a4ad8', '#5e2a90']);
  ctx.beginPath(); ctx.moveTo(-21, 1); ctx.bezierCurveTo(-22, -12, -12, -20, 0, -20); ctx.bezierCurveTo(12, -20, 22, -12, 21, 1); ctx.quadraticCurveTo(0, 5, -21, 1); ctx.closePath(); ctx.fill(); olS(ctx, 1.1);
  if (!flash) {
    ctx.fillStyle = '#e8d4ff'; ctx.beginPath(); ctx.moveTo(-19, 1); ctx.quadraticCurveTo(0, 6, 19, 1); ctx.quadraticCurveTo(0, 2.5, -19, 1); ctx.fill();
    ctx.fillStyle = '#fff6ff'; [[-11, -9, 3.4], [2, -14, 3.8], [12, -7, 3], [-3, -5, 2.4], [-15, -2, 2]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.8, 0, 0, TAU); ctx.fill(); });
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-8, -15, 6, 2.4, -0.4, 0, TAU); ctx.fill();
  }
  ctx.restore();
  if (cast && !flash) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const a = t * 3 + i * 1.26, r = 20 + (t * 30 + i * 7) % 10; glow(ctx, Math.cos(a) * r, -26 + Math.sin(a) * r * 0.5, 4, '#c98aff', 0.6); } ctx.restore(); }
  if (e.elite) drawCrown(ctx, 0, -44 * puff, 11);
  ctx.restore();
}

/* ---------- 石像鬼 ---------- */
function drawGarg(ctx, e, t) {
  const z = e.z || 0, flash = e.flash > 0, stone = e.state === 'stone', dive = e.state === 'dive';
  const zs = Math.max(0.35, 1 - z / 110);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(e.x, e.y, 15 * zs, 5 * zs, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(e.x, e.y - z); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const flip = Math.cos(e.face) < 0 ? -1 : 1; ctx.scale(flip, 1);
  const base = stone ? '#b9bcc6' : '#8a8f9e', S0 = flash ? '#ffffff' : lgrad(ctx, 0, -34, 0, -4, [shade(base, 0.25), base, shade(base, -0.35)]);
  const flap = stone ? -0.9 : dive ? (e.t < 0.45 ? Math.sin(t * 22) * 0.5 : -1.1) : Math.sin(t * 11 + e.id) * 0.55;
  // 翼
  const wing = (sx) => {
    ctx.save(); ctx.translate(sx * 3, -24); ctx.scale(sx, 1); ctx.rotate(-flap * 0.8);
    ctx.fillStyle = flash ? '#ffffff' : stone ? '#a9acb8' : '#5e6274'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(16, -14); ctx.lineTo(24, -8); ctx.quadraticCurveTo(20, -3, 21, 2); ctx.quadraticCurveTo(15, 0, 14, 5); ctx.quadraticCurveTo(8, 2, 5, 7); ctx.closePath(); ctx.fill(); olS(ctx, 0.9);
    ctx.strokeStyle = 'rgba(30,20,46,0.6)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(21, 2); ctx.moveTo(1, 0); ctx.lineTo(14, 5); ctx.stroke();
    ctx.restore();
  };
  wing(-1); wing(1);
  // 尾
  ctx.strokeStyle = OL; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(-5, -8); ctx.quadraticCurveTo(-16, -6, -16, 2); ctx.stroke(); ctx.strokeStyle = flash ? '#ffffff' : base; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = flash ? '#ffffff' : base; poly(ctx, [[-16, 1], [-19, 5], [-16, 7], [-13, 5]]); ctx.fill(); olS(ctx, 0.7);
  // 身
  ctx.fillStyle = S0; ctx.beginPath(); ctx.ellipse(0, -16, 9, 11, 0, 0, TAU); ctx.fill(); olS(ctx);
  ctx.fillStyle = flash ? '#ffffff' : shade(base, -0.2); rrect(ctx, -8, -8, 6, 8, 2.5); ctx.fill(); olS(ctx, 0.8); rrect(ctx, 2, -8, 6, 8, 2.5); ctx.fill(); olS(ctx, 0.8);
  ctx.fillStyle = '#4a4e5c'; for (const x of [-7, -5, -3, 3, 5, 7]) poly(ctx, [[x - 1, 0], [x, 2], [x + 1, 0]]), ctx.fill();
  // 頭＋角
  ctx.fillStyle = S0; ctx.beginPath(); ctx.ellipse(3, -29, 7.5, 6.5, 0, 0, TAU); ctx.fill(); olS(ctx);
  ctx.fillStyle = flash ? '#ffffff' : '#4a4e5c';
  ctx.beginPath(); ctx.moveTo(-1, -33); ctx.quadraticCurveTo(-6, -38, -4, -43); ctx.quadraticCurveTo(-2, -38, 2, -35); ctx.closePath(); ctx.fill(); olS(ctx, 0.7);
  ctx.beginPath(); ctx.moveTo(5, -34); ctx.quadraticCurveTo(7, -40, 12, -42); ctx.quadraticCurveTo(9, -38, 8, -33); ctx.closePath(); ctx.fill(); olS(ctx, 0.7);
  ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.ellipse(6, -30, 2, 1.4, -0.3, 0, TAU); ctx.ellipse(1.5, -30, 1.8, 1.3, 0.3, 0, TAU); ctx.fill();
  if (!stone) { eyeGlow(ctx, 6, -30, 1, e.state === 'cast' ? '#ff3b3b' : '#ff7a3a'); eyeGlow(ctx, 1.5, -30, 0.9, e.state === 'cast' ? '#ff3b3b' : '#ff7a3a'); }
  ctx.fillStyle = '#ffffff'; poly(ctx, [[3, -25.5], [4, -23.5], [5, -25.5]]); ctx.fill(); poly(ctx, [[6, -25.5], [7, -23.5], [8, -25.5]]); ctx.fill();
  // 爪
  ctx.fillStyle = flash ? '#ffffff' : shade(base, -0.1); ctx.beginPath(); ctx.ellipse(8, -15, 3, 2.4, 0, 0, TAU); ctx.fill(); olS(ctx, 0.7);
  if (stone && !flash) {
    ctx.strokeStyle = 'rgba(60,60,70,0.7)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-4, -24); ctx.lineTo(0, -18); ctx.lineTo(-2, -12); ctx.moveTo(3, -34); ctx.lineTo(5, -28); ctx.stroke();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 8); ctx.strokeStyle = '#e8eef8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -20, 18, 22, 0, 0, TAU); ctx.stroke(); ctx.restore();
  }
  if (e.elite) drawCrown(ctx, 3, -38, 10);
  ctx.restore();
}

/* ---------- 炸彈小鬼 ---------- */
function drawImp(ctx, e, t) {
  const z = e.z || 4, flash = e.flash > 0, blink = e.state === 'blink', boom = e.state === 'charge', cast = e.state === 'cast';
  let alpha = 1; if (blink) alpha = e.t < 0.25 ? 1 - e.t / 0.25 : (e.t - 0.25) / 0.25;
  ctx.fillStyle = `rgba(0,0,0,${0.22 * alpha})`; ctx.beginPath(); ctx.ellipse(e.x, e.y, 11, 4, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.globalAlpha = clamp(alpha, 0, 1); ctx.translate(e.x, e.y - z); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const flip = Math.cos(e.face) < 0 ? -1 : 1; ctx.scale(flip, 1);
  const red = flash || (boom && Math.floor(t * 14) % 2) ? '#ffffff' : '#e04a3a';
  const flap = Math.sin(t * 24 + e.id) * 0.5;
  // 翼
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 3, -20); ctx.scale(sx, 1); ctx.rotate(-flap); ctx.fillStyle = flash ? '#ffffff' : '#5a1a2a'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, -8); ctx.lineTo(13, -2); ctx.quadraticCurveTo(9, -1, 9, 3); ctx.quadraticCurveTo(5, 1, 3, 4); ctx.closePath(); ctx.fill(); olS(ctx, 0.8); ctx.restore(); }
  // 尾
  const tw = Math.sin(t * 6 + e.id) * 2;
  ctx.strokeStyle = OL; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-5, -8); ctx.quadraticCurveTo(-13, -6 + tw, -14, -14 + tw); ctx.stroke(); ctx.strokeStyle = red; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.fillStyle = red; poly(ctx, [[-14, -18 + tw], [-17, -12 + tw], [-11, -13 + tw]]); ctx.fill(); olS(ctx, 0.6);
  // 身
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, -28, 0, -2, [shade('#e04a3a', 0.25), red, shade('#e04a3a', -0.35)]); ctx.beginPath(); ctx.arc(0, -15, 10, 0, TAU); ctx.fill(); olS(ctx);
  ctx.fillStyle = flash ? '#ffffff' : '#ffb08a'; ctx.beginPath(); ctx.ellipse(1.5, -11, 5.5, 4.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2a1020'; poly(ctx, [[-6, -23], [-8, -31], [-2, -25]]); ctx.fill(); poly(ctx, [[3, -25], [6, -32], [7, -23]]); ctx.fill();
  ctx.fillStyle = '#ffe14d'; ctx.beginPath(); ctx.ellipse(-1, -18, 2.4, 2.8, 0, 0, TAU); ctx.ellipse(5, -18, 2.2, 2.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1a0a10'; ctx.beginPath(); ctx.ellipse(-0.4, -17.6, 1, 1.8, 0, 0, TAU); ctx.ellipse(5.4, -17.6, 0.9, 1.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#5a1020'; ctx.beginPath(); ctx.moveTo(-3, -13); ctx.quadraticCurveTo(2, -8, 8, -13); ctx.quadraticCurveTo(2, -11, -3, -13); ctx.fill();
  ctx.fillStyle = '#ffffff'; poly(ctx, [[-1, -12.6], [0, -11], [1, -12.3]]); ctx.fill(); poly(ctx, [[4, -12.3], [5, -11], [6, -12.6]]); ctx.fill();
  // 手上炸彈
  if (!(cast && e.t < 0.35)) {
    const bx = boom ? 0 : 11, by = boom ? -2 : -14, br = boom ? 7 : 5;
    ctx.fillStyle = '#2a2433'; ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill(); olS(ctx, 0.8);
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(bx - br * 0.35, by - br * 0.35, br * 0.28, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#c9a14a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(bx, by - br); ctx.quadraticCurveTo(bx + 3, by - br - 3, bx + 1, by - br - 5); ctx.stroke();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, bx + 1, by - br - 5, (boom ? 9 : 5) + Math.sin(t * 40) * 1.5, '#ffb347', 1); ctx.restore();
  }
  if (boom && !flash) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 + 0.3 * Math.sin(t * 28); glow(ctx, 0, -14, 22, '#ff5d3a', 1); ctx.restore(); }
  if (e.elite) drawCrown(ctx, 0, -31, 9);
  ctx.restore();
}

/* ---------- 頭目：冰霜巨人 ---------- */
function drawYeti(ctx, e, t) {
  const R = e.r, z = e.z || 0, zs = Math.max(0.4, 1 - z / 160), flash = e.flash > 0, en = e.enraged;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(e.x, e.y, R * 1.05 * zs, R * 0.4 * zs, 0, 0, TAU); ctx.fill();
  if (en && !flash) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) { const a = t * 1.5 + (i / 6) * TAU, r = R * 1.2; glow(ctx, e.x + Math.cos(a) * r, e.y - R + Math.sin(a) * r * 0.5, 8, '#9fe3ff', 0.5); }
    glow(ctx, e.x, e.y - R, R * 1.6, '#7fd6ff', 0.2 + 0.08 * Math.sin(t * 6)); ctx.restore();
  }
  ctx.save(); ctx.translate(e.x, e.y - z); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const flip = Math.cos(e.face) < 0 ? -1 : 1; ctx.scale(flip, 1);
  const cast = e.state === 'cast', pose = cast ? e.pose : e.state === 'leap' ? 'stomp' : e.state === 'roar' ? 'roar' : null;
  const ck = cast ? Math.min(1, e.t / Math.max(0.3, e.castDur || 1)) : 0;
  const bob = Math.sin(t * (en ? 8 : 4)) * 1.5;
  const fur = flash ? '#ffffff' : lgrad(ctx, 0, -R * 2, 0, 0, ['#ffffff', '#e8f2ff', '#b8cce4']), furD = flash ? '#ffffff' : '#9fb4d0';
  const tuft = (cx, cy, rx, ry, n) => { ctx.beginPath(); for (let i = 0; i <= n * 2; i++) { const a = (i / (n * 2)) * TAU, r = i % 2 ? 1 : 0.84; const px = cx + Math.cos(a) * rx * r, py = cy + Math.sin(a) * ry * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); };
  // 腿
  for (const lx of [-R * 0.35, R * 0.32]) { ctx.fillStyle = furD; rrect(ctx, lx - R * 0.2, -R * 0.6, R * 0.4, R * 0.6, R * 0.16); ctx.fill(); olS(ctx); ctx.fillStyle = flash ? '#ffffff' : '#5a7090'; rrect(ctx, lx - R * 0.22, -R * 0.12, R * 0.44, R * 0.14, 4); ctx.fill(); }
  // 後臂
  const armUp = pose === 'stomp' || pose === 'roar' ? -1 : 0;
  ctx.save(); ctx.translate(-R * 0.7, -R * 1.45 + bob); ctx.rotate(0.3 + armUp * 2.4 * (pose === 'stomp' ? Math.sin(Math.min(1, ck * 1.4) * Math.PI) : 1));
  ctx.fillStyle = furD; tuft(0, R * 0.42, R * 0.24, R * 0.48, 7); ctx.fill(); olS(ctx); ctx.fillStyle = flash ? '#ffffff' : '#7fa0c8'; ctx.beginPath(); ctx.arc(0, R * 0.88, R * 0.22, 0, TAU); ctx.fill(); olS(ctx);
  ctx.restore();
  // 身
  ctx.fillStyle = fur; tuft(0, -R * 1.2 + bob, R * 0.92, R * 0.78, 12); ctx.fill(); olS(ctx, 1.2);
  if (!flash) { ctx.fillStyle = 'rgba(160,190,225,0.5)'; ctx.beginPath(); ctx.ellipse(R * 0.12, -R * 1.05 + bob, R * 0.45, R * 0.4, 0, 0, TAU); ctx.fill(); }
  // 肩上冰晶
  if (!flash) for (const [x, y, h] of [[-R * 0.55, -R * 1.85, 14], [-R * 0.35, -R * 1.95, 18], [R * 0.55, -R * 1.8, 13]]) {
    ctx.fillStyle = lgrad(ctx, x, y + bob - h, x, y + bob, ['#ffffff', '#9fe3ff', '#3a8ad8']); poly(ctx, [[x - 4, y + bob + 2], [x, y + bob - h], [x + 4, y + bob + 2]]); ctx.fill(); olS(ctx, 0.8);
    if (en) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y + bob - h * 0.5, 9, '#9fe3ff', 0.6); ctx.restore(); }
  }
  // 頭
  const hx = R * 0.25, hy = -R * 1.95 + bob + (pose === 'roar' ? -3 : 0);
  ctx.fillStyle = fur; tuft(hx, hy, R * 0.45, R * 0.4, 9); ctx.fill(); olS(ctx);
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, hy - R * 0.2, 0, hy + R * 0.3, ['#9ab8d8', '#6a8ab0']); ctx.beginPath(); ctx.ellipse(hx + R * 0.12, hy + R * 0.06, R * 0.28, R * 0.24, 0, 0, TAU); ctx.fill(); olS(ctx, 0.9);
  // 冰角
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, hy - R * 0.8, 0, hy - R * 0.2, ['#ffffff', '#9fe3ff']);
  ctx.beginPath(); ctx.moveTo(hx - R * 0.25, hy - R * 0.25); ctx.quadraticCurveTo(hx - R * 0.5, hy - R * 0.5, hx - R * 0.35, hy - R * 0.78); ctx.quadraticCurveTo(hx - R * 0.25, hy - R * 0.5, hx - R * 0.08, hy - R * 0.32); ctx.closePath(); ctx.fill(); olS(ctx, 0.8);
  ctx.beginPath(); ctx.moveTo(hx + R * 0.3, hy - R * 0.28); ctx.quadraticCurveTo(hx + R * 0.58, hy - R * 0.5, hx + R * 0.5, hy - R * 0.8); ctx.quadraticCurveTo(hx + R * 0.36, hy - R * 0.5, hx + R * 0.14, hy - R * 0.34); ctx.closePath(); ctx.fill(); olS(ctx, 0.8);
  // 眼＋口
  ctx.fillStyle = '#10182a'; ctx.beginPath(); ctx.ellipse(hx + R * 0.02, hy - R * 0.02, R * 0.07, R * 0.05, 0, 0, TAU); ctx.ellipse(hx + R * 0.24, hy - R * 0.03, R * 0.07, R * 0.05, 0, 0, TAU); ctx.fill();
  const ec = en || cast ? '#4fe0ff' : '#bfe9ff';
  eyeGlow(ctx, hx + R * 0.03, hy - R * 0.02, R * 0.035, ec); eyeGlow(ctx, hx + R * 0.25, hy - R * 0.03, R * 0.035, ec);
  ctx.strokeStyle = OL; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx - R * 0.1, hy - R * 0.12); ctx.lineTo(hx + R * 0.08, hy - R * 0.06); ctx.moveTo(hx + R * 0.36, hy - R * 0.14); ctx.lineTo(hx + R * 0.18, hy - R * 0.07); ctx.stroke();
  const mo = pose === 'breath' || pose === 'roar' ? R * 0.1 : R * 0.03;
  ctx.fillStyle = '#2a1030'; ctx.beginPath(); ctx.ellipse(hx + R * 0.14, hy + R * 0.18, R * 0.12, mo, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff'; poly(ctx, [[hx + R * 0.05, hy + R * 0.15], [hx + R * 0.08, hy + R * 0.22], [hx + R * 0.11, hy + R * 0.15]]); ctx.fill(); poly(ctx, [[hx + R * 0.17, hy + R * 0.15], [hx + R * 0.2, hy + R * 0.22], [hx + R * 0.23, hy + R * 0.15]]); ctx.fill();
  if ((pose === 'breath' || en) && !flash) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, hx + R * 0.35, hy + R * 0.2, R * (pose === 'breath' ? 0.5 : 0.2), '#bfe9ff', 0.7); ctx.restore(); }
  // 前臂（出拳／舉高／拋擲）
  let fa = 0.25;
  if (pose === 'punch') fa = ck < 0.7 ? 0.25 - easeOut(ck / 0.7) * 1.2 : lerp(-0.95, -1.7, easeIn((ck - 0.7) / 0.3));
  else if (pose === 'stomp' || pose === 'roar') fa = -2.6;
  else if (pose === 'throw') fa = ck < 0.45 ? -2.8 : -0.8;
  ctx.save(); ctx.translate(R * 0.72, -R * 1.45 + bob); ctx.rotate(fa);
  ctx.fillStyle = fur; tuft(0, R * 0.45, R * 0.26, R * 0.5, 7); ctx.fill(); olS(ctx);
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, -R * 0.2, R * 0.75, R * 0.2, R * 1.1, ['#b8d8f8', '#6a8ab0']); ctx.beginPath(); ctx.arc(0, R * 0.92, R * 0.26, 0, TAU); ctx.fill(); olS(ctx);
  if (pose === 'throw' && ck < 0.45) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, R * 1.2, R * 0.28, 0, TAU); ctx.fill(); olS(ctx); }
  ctx.restore();
  ctx.restore();
}

/* ---------- 最終頭目：深淵魔龍 ---------- */
function drawDragon(ctx, e, t) {
  const R = e.r, z = e.z || 0, zs = Math.max(0.35, 1 - z / 150), flash = e.flash > 0, en = e.enraged;
  ctx.fillStyle = 'rgba(0,0,0,0.32)'; ctx.beginPath(); ctx.ellipse(e.x, e.y, R * 1.2 * zs, R * 0.45 * zs, 0, 0, TAU); ctx.fill();
  if (en && !flash) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) { const px = e.x + (i - 3) * R * 0.34, hgt = R * (1.5 + 0.6 * Math.sin(t * 8 + i * 1.7)); const fg = ctx.createLinearGradient(0, e.y - z, 0, e.y - z - hgt); fg.addColorStop(0, 'rgba(180,80,255,0.3)'); fg.addColorStop(1, 'rgba(120,40,255,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(px - R * 0.3, e.y - z); ctx.quadraticCurveTo(px - R * 0.12, e.y - z - hgt * 0.6, px + Math.sin(t * 6 + i) * 6, e.y - z - hgt); ctx.quadraticCurveTo(px + R * 0.12, e.y - z - hgt * 0.6, px + R * 0.3, e.y - z); ctx.fill(); }
    ctx.restore();
  }
  ctx.save(); ctx.translate(e.x, e.y - z); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const flip = Math.cos(e.face) < 0 ? -1 : 1; ctx.scale(flip, 1);
  const cast = e.state === 'cast', fly = e.state === 'fly', roar = e.state === 'roar', pose = cast ? e.pose : null;
  const ck = cast ? Math.min(1, e.t / Math.max(0.3, e.castDur || 1)) : 0;
  const bob = Math.sin(t * (en ? 7 : 4)) * 2;
  const scale = flash ? '#ffffff' : lgrad(ctx, 0, -R * 2, 0, 0, ['#8a5ac8', '#5a2a8a', '#2e1450']), belly = flash ? '#ffffff' : '#e8a8ff';
  const flap = fly ? Math.sin(t * 9) : Math.sin(t * 3) * 0.35;
  // 翼（後）
  // 翼：向上同向後展開（遠側較暗），唔會遮住頭
  const wing = (ox, back) => {
    ctx.save(); ctx.translate(ox, -R * 1.45 + bob); ctx.scale(-1, 1); ctx.rotate(-0.55 - flap * 0.45 + (back ? 0.25 : 0)); if (back) ctx.scale(0.85, 0.85);
    ctx.fillStyle = flash ? '#ffffff' : back ? '#3a1a5a' : lgrad(ctx, 0, -R * 1.4, R * 1.6, 0, ['#7a3ab8', '#4a1a7a']);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R * 0.7, -R * 1.25); ctx.lineTo(R * 1.6, -R * 1.05);
    ctx.quadraticCurveTo(R * 1.3, -R * 0.65, R * 1.45, -R * 0.2); ctx.quadraticCurveTo(R * 1.05, -R * 0.35, R * 0.95, R * 0.05); ctx.quadraticCurveTo(R * 0.6, -R * 0.15, R * 0.45, R * 0.25); ctx.closePath(); ctx.fill(); olS(ctx, 1.1);
    if (!flash) { ctx.strokeStyle = '#2a0f40'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(R * 0.7, -R * 1.25); ctx.lineTo(R * 1.45, -R * 0.2); ctx.moveTo(R * 0.7, -R * 1.25); ctx.lineTo(R * 0.95, R * 0.05); ctx.moveTo(R * 0.7, -R * 1.25); ctx.lineTo(R * 0.45, R * 0.25); ctx.stroke(); ctx.fillStyle = '#e8dcc0'; poly(ctx, [[R * 0.7, -R * 1.25], [R * 0.78, -R * 1.45], [R * 0.82, -R * 1.22]]); ctx.fill(); }
    ctx.restore();
  };
  wing(R * 0.15, true);
  // 尾
  const tw = Math.sin(t * 2.5) * 0.2 + (pose === 'tail' ? Math.sin(ck * Math.PI) * 1.2 : 0);
  ctx.save(); ctx.translate(-R * 0.6, -R * 0.55 + bob); ctx.rotate(tw);
  ctx.fillStyle = scale; ctx.beginPath(); ctx.moveTo(0, -R * 0.25); ctx.quadraticCurveTo(-R * 0.9, -R * 0.35, -R * 1.35, R * 0.15); ctx.lineTo(-R * 1.25, R * 0.28); ctx.quadraticCurveTo(-R * 0.8, R * 0.05, 0, R * 0.22); ctx.closePath(); ctx.fill(); olS(ctx);
  ctx.fillStyle = flash ? '#ffffff' : '#e8dcc0'; poly(ctx, [[-R * 1.3, R * 0.2], [-R * 1.6, R * 0.05], [-R * 1.42, R * 0.38]]); ctx.fill(); olS(ctx, 0.8);
  ctx.restore();
  // 腿
  for (const [lx, d] of [[-R * 0.38, -1], [R * 0.35, 1]]) {
    if (fly) { ctx.fillStyle = scale; ctx.beginPath(); ctx.ellipse(lx, -R * 0.45 + bob, R * 0.18, R * 0.24, d * 0.6, 0, TAU); ctx.fill(); olS(ctx); continue; }
    ctx.fillStyle = scale; rrect(ctx, lx - R * 0.2, -R * 0.62, R * 0.4, R * 0.58, R * 0.15); ctx.fill(); olS(ctx);
    ctx.fillStyle = flash ? '#ffffff' : '#e8dcc0'; for (let i = -1; i <= 1; i++) { poly(ctx, [[lx + i * R * 0.1 + R * 0.06, -R * 0.06], [lx + i * R * 0.1 + R * 0.14, R * 0.02], [lx + i * R * 0.1 + R * 0.02, R * 0.02]]); ctx.fill(); }
  }
  // 身
  ctx.fillStyle = scale; ctx.beginPath(); ctx.ellipse(0, -R * 1.0 + bob, R * 0.85, R * 0.62, 0, 0, TAU); ctx.fill(); olS(ctx, 1.2);
  ctx.fillStyle = belly; ctx.beginPath(); ctx.ellipse(R * 0.2, -R * 0.92 + bob, R * 0.45, R * 0.42, 0, 0, TAU); ctx.fill();
  if (!flash) { ctx.strokeStyle = 'rgba(120,60,150,0.55)'; ctx.lineWidth = 1.2; for (let i = 0; i < 4; i++) { const y = -R * 1.2 + i * R * 0.15 + bob; ctx.beginPath(); ctx.moveTo(R * -0.12, y); ctx.quadraticCurveTo(R * 0.2, y + 4, R * 0.55, y); ctx.stroke(); } }
  // 背刺
  if (!flash) { ctx.fillStyle = '#e8dcc0'; for (let i = 0; i < 4; i++) { const x = -R * 0.55 + i * R * 0.28; poly(ctx, [[x - 4, -R * 1.52 + bob + Math.abs(i - 1.5) * 3], [x, -R * 1.75 + bob + Math.abs(i - 1.5) * 3], [x + 4, -R * 1.52 + bob + Math.abs(i - 1.5) * 3]]); ctx.fill(); olS(ctx, 0.7); } }
  wing(-R * 0.1, false);
  // 胸口火光（吐息／火球前）
  const charging = pose === 'breath' || pose === 'fireballs' || pose === 'dark';
  if ((charging || en) && !flash) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, R * 0.25, -R * 1.0 + bob, R * (charging ? 0.55 + ck * 0.3 : 0.3), pose === 'dark' ? '#c06bff' : '#ff7a2a', 0.8); ctx.restore(); }
  // 頸＋頭
  const nk = roar ? -0.35 : charging ? -0.15 + ck * 0.25 : 0;
  ctx.save(); ctx.translate(R * 0.5, -R * 1.35 + bob); ctx.rotate(nk); ctx.scale(1.15, 1.15);
  ctx.fillStyle = scale; ctx.beginPath(); ctx.moveTo(-R * 0.2, 0); ctx.quadraticCurveTo(R * 0.05, -R * 0.6, R * 0.35, -R * 0.8); ctx.lineTo(R * 0.6, -R * 0.62); ctx.quadraticCurveTo(R * 0.3, -R * 0.4, R * 0.25, R * 0.1); ctx.closePath(); ctx.fill(); olS(ctx);
  ctx.translate(R * 0.5, -R * 0.82);
  // 角
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, -R * 0.6, 0, 0, ['#fff6e0', '#c9b890']);
  ctx.beginPath(); ctx.moveTo(-R * 0.15, -R * 0.12); ctx.quadraticCurveTo(-R * 0.45, -R * 0.3, -R * 0.55, -R * 0.62); ctx.quadraticCurveTo(-R * 0.3, -R * 0.36, -R * 0.02, -R * 0.24); ctx.closePath(); ctx.fill(); olS(ctx, 0.8);
  ctx.beginPath(); ctx.moveTo(R * 0.02, -R * 0.2); ctx.quadraticCurveTo(-R * 0.15, -R * 0.45, -R * 0.2, -R * 0.75); ctx.quadraticCurveTo(-R * 0.02, -R * 0.45, R * 0.15, -R * 0.26); ctx.closePath(); ctx.fill(); olS(ctx, 0.8);
  // 頭殼＋顎
  const jaw = pose === 'breath' || pose === 'dark' || roar ? R * 0.14 : pose === 'fireballs' ? R * 0.1 : R * 0.02;
  ctx.fillStyle = scale; ctx.beginPath(); ctx.moveTo(-R * 0.22, -R * 0.12); ctx.quadraticCurveTo(-R * 0.1, -R * 0.32, R * 0.2, -R * 0.24); ctx.lineTo(R * 0.55, -R * 0.08); ctx.quadraticCurveTo(R * 0.6, R * 0.02, R * 0.5, R * 0.04); ctx.lineTo(-R * 0.15, R * 0.1); ctx.closePath(); ctx.fill(); olS(ctx);
  if (jaw > R * 0.05) { ctx.fillStyle = pose === 'dark' ? '#3a0a5a' : '#5a1010'; poly(ctx, [[-R * 0.05, R * 0.06], [R * 0.52, R * 0.03], [R * 0.45, R * 0.04 + jaw], [-R * 0.02, R * 0.12 + jaw * 0.4]]); ctx.fill(); if (!flash) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, R * 0.3, R * 0.06 + jaw * 0.5, R * 0.22, pose === 'dark' ? '#c06bff' : '#ffb347', 0.9); ctx.restore(); } }
  ctx.fillStyle = scale; ctx.beginPath(); ctx.moveTo(-R * 0.1, R * 0.12 + jaw * 0.4); ctx.lineTo(R * 0.46, R * 0.05 + jaw); ctx.lineTo(R * 0.4, R * 0.13 + jaw); ctx.quadraticCurveTo(R * 0.1, R * 0.2 + jaw, -R * 0.12, R * 0.18 + jaw * 0.4); ctx.closePath(); ctx.fill(); olS(ctx, 0.9);
  ctx.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) { const x = R * (0.05 + i * 0.11); poly(ctx, [[x, R * 0.05 + jaw * (i / 4)], [x + R * 0.03, R * 0.1 + jaw * (i / 4)], [x + R * 0.06, R * 0.05 + jaw * (i / 4)]]); ctx.fill(); }
  ctx.fillStyle = '#1a0a20'; ctx.beginPath(); ctx.ellipse(R * 0.12, -R * 0.12, R * 0.07, R * 0.045, -0.2, 0, TAU); ctx.fill();
  eyeGlow(ctx, R * 0.13, -R * 0.12, R * 0.035, en ? '#ff3bff' : '#ffd23f');
  ctx.fillStyle = '#1a0a20'; ctx.beginPath(); ctx.arc(R * 0.52, -R * 0.04, 1.6, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.restore();
}
