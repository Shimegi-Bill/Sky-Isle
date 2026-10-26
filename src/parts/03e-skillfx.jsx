
/* ---------- 03e 技能特效：魔法陣、光柱、殘影、發光粒子（每位角色有專屬主題） ---------- */
// 顏色轉 rgba
function colA(col, a) {
  if (col[0] === '#') { const n = parseInt(col.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
  const m = col.match(/\d+/g); return m ? `rgba(${m[0]},${m[1]},${m[2]},${a})` : col;
}
// 預先畫好的發光貼圖（用 drawImage 疊加，比每次建漸層快好多）
const _glowCache = new Map();
function glowSprite(col) {
  let c = _glowCache.get(col);
  if (!c) {
    c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.22, colA(col, 0.95)); gr.addColorStop(0.55, colA(col, 0.35)); gr.addColorStop(1, colA(col, 0));
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); _glowCache.set(col, c);
  }
  return c;
}
function glow(ctx, x, y, r, col, a = 1) { if (a <= 0.01 || r <= 0.5) return; const ga = ctx.globalAlpha; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(glowSprite(col), x - r, y - r, r * 2, r * 2); ctx.globalAlpha = ga; }
// 地上魔法陣（預先畫成貼圖，再旋轉＋壓扁成俯視橢圓）
const _mcCache = new Map(), MC_R = 210, MC_S = 448;
function magicSprite(col, sides) {
  const key = col + '|' + sides; let c = _mcCache.get(key);
  if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = MC_S;
  const g = c.getContext('2d'), r = MC_R; g.translate(MC_S / 2, MC_S / 2); g.strokeStyle = col; g.fillStyle = col; g.lineCap = 'round';
  g.shadowColor = col; g.shadowBlur = 8;
  g.lineWidth = 6; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r * 0.84, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, r * 0.42, 0, TAU); g.stroke();
  g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 24; i++) { const an = (i / 24) * TAU, r1 = r * 0.86, r2 = r * (i % 2 ? 0.92 : 0.98); g.moveTo(Math.cos(an) * r1, Math.sin(an) * r1); g.lineTo(Math.cos(an) * r2, Math.sin(an) * r2); } g.stroke();
  g.lineWidth = 4; g.beginPath(); for (let i = 0; i < sides; i++) { const a1 = (i / sides) * TAU, a2 = (((i + 2) % sides) / sides) * TAU; g.moveTo(Math.cos(a1) * r * 0.84, Math.sin(a1) * r * 0.84); g.lineTo(Math.cos(a2) * r * 0.84, Math.sin(a2) * r * 0.84); } g.stroke();
  for (let i = 0; i < sides; i++) { const an = (i / sides) * TAU; g.beginPath(); g.arc(Math.cos(an) * r * 0.84, Math.sin(an) * r * 0.84, 6, 0, TAU); g.fill(); }
  g.lineWidth = 2.5; g.beginPath(); for (let i = 0; i < 8; i++) { const an = (i / 8) * TAU; g.moveTo(Math.cos(an) * r * 0.42, Math.sin(an) * r * 0.42); g.lineTo(Math.cos(an + 0.4) * r * 0.62, Math.sin(an + 0.4) * r * 0.62); } g.stroke();
  // 符文字
  g.shadowBlur = 0; g.lineWidth = 2;
  for (let i = 0; i < 12; i++) { const an = (i / 12) * TAU + 0.13, rx = Math.cos(an) * r * 0.92, ry = Math.sin(an) * r * 0.92; g.save(); g.translate(rx, ry); g.rotate(an + Math.PI / 2); g.beginPath(); g.moveTo(-5, -4); g.lineTo(0, 4); g.lineTo(5, -4); if (i % 3 === 0) { g.moveTo(-5, 1); g.lineTo(5, 1); } g.stroke(); g.restore(); }
  _mcCache.set(key, c); return c;
}
function magicCircle(ctx, x, y, r, col, rot, a, sides = 6) {
  if (a <= 0.01 || r < 2) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.55); ctx.rotate(rot); ctx.globalAlpha = Math.min(1, a);
  const k = r / MC_R; ctx.drawImage(magicSprite(col, sides), -MC_S / 2 * k, -MC_S / 2 * k, MC_S * k, MC_S * k);
  ctx.restore();
}
// 光柱（預先畫好的貼圖）
const _pillarCache = new Map();
function pillarSprite(col) {
  let c = _pillarCache.get(col); if (c) return c;
  c = document.createElement('canvas'); c.width = 32; c.height = 128;
  const g = c.getContext('2d');
  const h = g.createLinearGradient(0, 0, 32, 0); h.addColorStop(0, colA(col, 0)); h.addColorStop(0.3, colA(col, 0.85)); h.addColorStop(0.5, 'rgba(255,255,255,1)'); h.addColorStop(0.7, colA(col, 0.85)); h.addColorStop(1, colA(col, 0));
  g.fillStyle = h; g.fillRect(0, 0, 32, 128);
  g.globalCompositeOperation = 'destination-in'; const v = g.createLinearGradient(0, 128, 0, 0); v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = v; g.fillRect(0, 0, 32, 128);
  _pillarCache.set(col, c); return c;
}
function lightPillar(ctx, x, y, w, h, col, a) {
  if (a <= 0.01 || h < 1) return;
  const ga = ctx.globalAlpha; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(pillarSprite(col), x - w / 2, y - h, w, h); ctx.globalAlpha = ga;
}
function shockRing(ctx, x, y, r, lw, col, a, sy = 0.75) {
  if (a <= 0.01 || r < 1) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, a); ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.5, lw);
  ctx.beginPath(); ctx.ellipse(x, y, r, r * sy, 0, 0, TAU); ctx.stroke();
  if (lw > 2.5 && a > 0.2) { ctx.globalAlpha *= 0.3; ctx.lineWidth = lw * 1.9; ctx.stroke(); }
  ctx.restore();
}
// 新月形刀光
function crescent(ctx, x, y, ang, r, col, a, thick = 0.42) {
  if (a <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha = Math.min(1, a);
  const g = ctx.createLinearGradient(-r * 0.5, 0, r, 0); g.addColorStop(0, colA(col, 0)); g.addColorStop(0.65, col); g.addColorStop(1, '#ffffff');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, -1.2, 1.2); ctx.arc(-r * thick, 0, r * 0.94, 1.02, -1.02, true); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// 角色特效主題
const FX_THEME = { c01: 'holy', c02: 'dark', c03: 'gold', c04: 'wind', c05: 'star', c06: 'fire', c07: 'gold', c08: 'ice', c09: 'flower', c10: 'wind', c11: 'basic', c12: 'fire', c13: 'basic', c14: 'fire', c15: 'sky', c16: 'wind', c17: 'basic' };
const FX_THEMES = {
  holy: { a: '#8fd0ff', b: '#ffffff', c: '#ffe9a8', p: 'feather' },
  dark: { a: '#ff4a2e', b: '#ffb09a', c: '#9a3aff', p: 'ember', dark: true },
  gold: { a: '#ffc93a', b: '#fff3b0', c: '#ff9a3a', p: 'spark' },
  wind: { a: '#6dffc0', b: '#e8fff4', c: '#bfffe0', p: 'leaf' },
  star: { a: '#ffe27a', b: '#ffffff', c: '#c9a8ff', p: 'star' },
  fire: { a: '#ff8a3a', b: '#ffe08a', c: '#ff4a2e', p: 'ember' },
  ice: { a: '#8fe0ff', b: '#ffffff', c: '#c9f0ff', p: 'snow' },
  flower: { a: '#ff8ec0', b: '#fff0f6', c: '#9dff9a', p: 'petal' },
  basic: { a: null, b: '#ffffff', c: '#ffe9a8', p: 'spark' },
  sky: { a: '#6fe6ff', b: '#ffffff', c: '#ffe27a', p: 'star' },
};
function fxTheme(ch) { const k = FX_THEME[ch.id] || 'basic', T = FX_THEMES[k]; return { ...T, k, a: T.a || ch.accent || '#ffffff' }; }
const ADD_KINDS = new Set(['glow', 'ember', 'spark', 'snow', 'orb', 'streak', 'ring', 'xslash', 'fistfx']);

Object.assign(Battle.prototype, {
  pfx(kind, x, y, o = {}) {
    if (this.parts.length > (this.lowFx ? 300 : 620) || (this.lowFx && Math.random() < 0.45)) return;
    const life = o.life || 0.6;
    this.parts.push({ kind, x, y, vx: o.vx || 0, vy: o.vy || 0, life, max: life, color: o.color || '#ffffff', size: o.size || 3, rot: o.rot ?? rand(0, TAU), vr: o.vr || 0, sway: o.sway || 0, seed: rand(0, 10), grav: o.grav || 0, drag: o.drag, delay: o.delay || 0 });
  },
  themeBurst(T, x, y, n, spd, o = {}) {
    const kind = o.kind || T.p, fall = kind === 'feather' || kind === 'petal' || kind === 'leaf';
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), s = rand(spd * 0.3, spd);
      this.pfx(kind, x + rand(-4, 4), y + rand(-4, 4), { vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.75 - (o.up || 0), life: rand(0.5, 1.0) * (o.life || (fall ? 1.6 : 1)), color: pick([T.a, T.b, T.c || T.a]), size: rand(2, 4) * (o.size || 1), vr: rand(-7, 7), sway: fall ? 40 : 0, grav: fall ? 60 : o.grav || 0, drag: fall ? 0.2 : undefined });
    }
  },
  // 施放瞬間：腳下魔法陣＋光柱
  castFx(p, T, sides = 6) {
    const x = p.x, y = p.y;
    this.fx.push({ t: 0, dur: 0.6, draw: (ctx, f) => {
      const k = f.t / f.dur; ctx.globalCompositeOperation = 'lighter';
      magicCircle(ctx, x, y, 30 + easeOut(k * 2) * 26, T.a, f.t * 4, (1 - k) * 0.95, sides);
      lightPillar(ctx, x, y + 2, 30 * (1 - k * 0.6), 100 * easeOut(k * 3), T.a, (1 - k) * 0.7);
      glow(ctx, x, y - 16, 40 * (1 - k * 0.5), T.a, (1 - k) * 0.6);
    } });
    for (let i = 0; i < 10; i++) { const a = rand(0, TAU); this.pfx('glow', x + Math.cos(a) * 26, y + Math.sin(a) * 12, { vy: rand(-160, -60), life: rand(0.4, 0.7), color: pick([T.a, T.b]), size: rand(2.5, 4.5), drag: 0.3 }); }
  },
  // 命中閃光
  hitFx(x, y, col, big) {
    this.pfx('glow', x, y, { size: big ? 22 : 15, life: 0.16, color: col || '#ffffff' });
    this.pfx('xslash', x, y, { size: big ? 26 : 18, life: 0.16, color: col || '#ffffff', rot: rand(0, Math.PI) });
  },

  /* ---------- 普攻刀光（更流暢、有拖尾同發光） ---------- */
  slashFx(d, actor, cls, step, buff) {
    const ang = actor.face, col = d.charged ? '#ffe88a' : buff ? '#ffd36b' : '#ffffff';
    const ch = actor === this.p ? this.cur().char : actor.c ? CHAR_BY_ID[actor.c] : null, T = ch ? fxTheme(ch) : { a: '#ffffff', b: '#ffffff' };
    const tint = d.charged ? '#ffd34d' : buff ? '#ffc93a' : T.a;
    if (cls === 'sword') {
      const dir = step % 2 ? -1 : 1, R = d.range * 0.82, big = d.charged || d.kb;
      this.fx.push({ t: 0, dur: big ? 0.26 : 0.2, draw: (ctx, f) => {
        const k = f.t / f.dur, sweep = easeOut(Math.min(1, k * 1.8)), a0 = ang - (d.arc / 2) * dir, aE = a0 + d.arc * dir * sweep;
        const lo = Math.min(a0, aE), hi = Math.max(a0, aE), cx = actor.x, cy = actor.y - 12, fade = 1 - easeIn(k);
        ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
          const rr = R - i * 4.5, tail = (hi - lo) * (i * 0.12);
          ctx.globalAlpha = fade * (i === 0 ? 0.95 : 0.5 - i * 0.1); ctx.strokeStyle = i === 0 ? col : tint; ctx.lineWidth = (big ? 9 : 6) - i * 1.4;
          ctx.beginPath(); if (dir > 0) ctx.arc(cx, cy, rr, lo + tail, hi); else ctx.arc(cx, cy, rr, lo, hi - tail); ctx.stroke();
        }
        ctx.globalAlpha = fade * 0.25; ctx.strokeStyle = tint; ctx.lineWidth = big ? 26 : 18; ctx.beginPath(); ctx.arc(cx, cy, R - 8, lo, hi); ctx.stroke();
        const ex = cx + Math.cos(aE) * R, ey = cy + Math.sin(aE) * R; glow(ctx, ex, ey, big ? 18 : 12, tint, fade * 0.9);
      } });
      if (d.charged) this.themeBurst(T, actor.x + Math.cos(ang) * 40, actor.y - 12 + Math.sin(ang) * 40, 10, 220, { kind: 'glow' });
    } else if (cls === 'lance') {
      this.fx.push({ t: 0, dur: d.charged ? 0.26 : 0.18, draw: (ctx, f) => {
        const k = f.t / f.dur, L = d.range * easeOut(Math.min(1, k * 2.2)), fade = 1 - easeIn(k), x0 = actor.x, y0 = actor.y - 12;
        ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        const g = ctx.createLinearGradient(0, 0, L, 0); g.addColorStop(0, colA(tint, 0)); g.addColorStop(1, tint);
        ctx.globalAlpha = fade * 0.5; ctx.strokeStyle = g; ctx.lineWidth = d.charged ? 20 : 12; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(L, 0); ctx.stroke();
        ctx.globalAlpha = fade; ctx.strokeStyle = col; ctx.lineWidth = d.charged ? 5 : 3; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(L, 0); ctx.stroke();
        ctx.strokeStyle = tint; ctx.lineWidth = 1.6; ctx.globalAlpha = fade * 0.8;
        for (let i = 0; i < 3; i++) { const xx = L * (0.35 + i * 0.22), rr = (d.charged ? 11 : 7) * (1 - i * 0.2); ctx.beginPath(); ctx.ellipse(xx, 0, 2.5, rr * (0.6 + k), 0, 0, TAU); ctx.stroke(); }
        glow(ctx, L, 0, d.charged ? 20 : 13, tint, fade);
        ctx.restore();
      } });
    } else if (cls === 'fist') {
      const hx = actor.x + Math.cos(ang) * d.range * 0.75, hy = actor.y - 12 + Math.sin(ang) * d.range * 0.75, big = d.charged || d.kb;
      this.pfx('fistfx', hx, hy, { size: big ? 22 : 13, life: big ? 0.22 : 0.14, color: d.charged ? '#ffe88a' : tint, rot: ang });
      if (big) this.themeBurst(T, hx, hy, 8, 200, { kind: 'glow' });
    }
  },

  /* ---------- 投射物繪圖 ---------- */
  drawProj(ctx, pr) {
    const a0 = Math.min(1, pr.life * 3) * (pr.ghost ? 0.8 : 1), col = pr.color || '#ffffff';
    pr.trail = pr.trail || [];
    const lt = pr.trail[pr.trail.length - 1];
    if (!lt || Math.abs(lt.x - pr.x) + Math.abs(lt.y - pr.y) > 3) { pr.trail.push({ x: pr.x, y: pr.y }); if (pr.trail.length > (pr.kind === 'wave' ? 6 : 9)) pr.trail.shift(); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (pr.kind === 'wave') {
      const T = pr.theme || { a: col, b: '#ffffff' };
      pr.trail.forEach((q, i) => { const k = (i + 1) / pr.trail.length; crescent(ctx, q.x, q.y, pr.ang, pr.r * (0.6 + 0.4 * k), T.a, a0 * k * 0.3); });
      glow(ctx, pr.x, pr.y, pr.r * 1.7, T.a, a0 * 0.55);
      crescent(ctx, pr.x, pr.y, pr.ang, pr.r, T.a, a0);
      ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(pr.ang); ctx.globalAlpha = a0; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(0, 0, pr.r, -1.05, 1.05); ctx.stroke(); ctx.restore();
      if (Math.random() < 0.5 && !this.paused) this.pfx(T.p === 'spark' ? 'glow' : T.p, pr.x + rand(-12, 12), pr.y + rand(-14, 14), { vx: -pr.vx * 0.08, vy: -pr.vy * 0.08, life: 0.5, color: pick([T.a, T.b]), size: rand(2, 3.5), vr: 6 });
    } else if (pr.kind === 'parrow') {
      const ang = Math.atan2(pr.vy, pr.vx), L = pr.big ? 26 : 18, ac = pr.theme ? pr.theme.a : col;
      for (let i = 1; i < pr.trail.length; i++) { const q0 = pr.trail[i - 1], q1 = pr.trail[i], k = i / pr.trail.length; ctx.globalAlpha = a0 * k * 0.6; ctx.strokeStyle = ac; ctx.lineCap = 'round'; ctx.lineWidth = (pr.big ? 7 : 4) * k; ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke(); }
      glow(ctx, pr.x, pr.y, pr.big ? 24 : 12, ac, a0 * 0.8);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a0;
      ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(ang);
      ctx.strokeStyle = OL; ctx.lineWidth = pr.big ? 3.4 : 2.6; ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(2, 0); ctx.stroke();
      ctx.strokeStyle = pr.big ? '#fff6c9' : '#e8dcc0'; ctx.lineWidth = pr.big ? 1.8 : 1.2; ctx.stroke();
      ctx.fillStyle = pr.big ? '#ffffff' : '#dfe6f2'; poly(ctx, [[pr.big ? 8 : 6, 0], [0, -3], [0, 3]]); ctx.fill(); olS(ctx, 0.6);
      ctx.fillStyle = col; poly(ctx, [[-L, 0], [-L + 4, -3], [-L + 7, -3], [-L + 4, 0], [-L + 7, 3], [-L + 4, 3]]); ctx.fill();
      ctx.restore();
    } else {
      const fire = pr.theme && pr.theme.k === 'fire';
      for (let i = 1; i < pr.trail.length; i++) {
        const q0 = pr.trail[i - 1], q1 = pr.trail[i], k = i / pr.trail.length;
        ctx.globalAlpha = a0 * k * 0.7; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = pr.r * 1.5 * k;
        ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke();
      }
      glow(ctx, pr.x, pr.y, pr.r * (fire ? 3.4 : 2.8), fire ? '#ff7a2a' : col, a0 * 0.9);
      glow(ctx, pr.x, pr.y, pr.r * 1.2, '#ffffff', a0);
      if (fire && Math.random() < 0.6) this.pfx('ember', pr.x, pr.y, { vx: rand(-30, 30), vy: rand(-60, -20), life: 0.35, color: pick(['#ff8a3a', '#ffe08a']), size: rand(1.5, 3) });
    }
    ctx.restore();
  },

  /* ---------- 粒子繪圖（普通＋發光兩層） ---------- */
  drawParticles(ctx) {
    const pass = (additive) => {
      for (const q of this.parts) {
        if (q.delay > 0 && q.kind !== 'orb') continue;
        if (ADD_KINDS.has(q.kind) !== additive) continue;
        const k = Math.max(0, q.life / q.max), al = Math.min(1, k * 1.6);
        ctx.globalAlpha = al; ctx.fillStyle = q.color;
        switch (q.kind) {
          case 'glow': glow(ctx, q.x, q.y, q.size * (0.6 + k * 0.6) * 2.4, q.color, al); break;
          case 'ember': glow(ctx, q.x, q.y, q.size * 2.6, q.color, al * 0.8); ctx.globalAlpha = al; ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(q.x, q.y, q.size * 0.45, 0, TAU); ctx.fill(); break;
          case 'spark': ctx.strokeStyle = q.color; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - q.vx * 0.045, q.y - q.vy * 0.045); ctx.stroke(); break;
          case 'snow': ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.1; ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = q.rot + (i * Math.PI) / 3; ctx.moveTo(q.x - Math.cos(a) * q.size, q.y - Math.sin(a) * q.size); ctx.lineTo(q.x + Math.cos(a) * q.size, q.y + Math.sin(a) * q.size); } ctx.stroke(); glow(ctx, q.x, q.y, q.size * 2, q.color, al * 0.5); break;
          case 'orb': glow(ctx, q.x, q.y, q.size * 3, q.color, 0.8); break;
          case 'ring': ctx.strokeStyle = q.color; ctx.lineWidth = 3 * k + 0.5; ctx.beginPath(); ctx.arc(q.x, q.y, q.size * (1.3 - k * 0.8), 0, TAU); ctx.stroke(); break;
          case 'streak': { ctx.strokeStyle = q.color; ctx.lineWidth = 3 * k + 1; const L = q.size * (1.2 - k * 0.4); ctx.beginPath(); ctx.moveTo(q.x - q.vx * L / 2, q.y - q.vy * L / 2); ctx.lineTo(q.x + q.vx * L / 2, q.y + q.vy * L / 2); ctx.stroke(); break; }
          case 'xslash': {
            const L = q.size * (1.25 - k * 0.5); ctx.strokeStyle = q.color; ctx.lineCap = 'round';
            for (const da of [0, Math.PI / 2]) { const a = q.rot + da; ctx.lineWidth = 3.5 * k + 0.5; ctx.beginPath(); ctx.moveTo(q.x - Math.cos(a) * L, q.y - Math.sin(a) * L); ctx.lineTo(q.x + Math.cos(a) * L, q.y + Math.sin(a) * L); ctx.stroke(); }
            break;
          }
          case 'fistfx': {
            const s = q.size * (1.5 - k * 0.5);
            glow(ctx, q.x, q.y, s * 1.6, q.color, al);
            ctx.fillStyle = q.color; ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU, r = i % 2 ? s * 0.45 : s; ctx.lineTo(q.x + Math.cos(a) * r, q.y + Math.sin(a) * r); } ctx.closePath(); ctx.globalAlpha = al * 0.6; ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.globalAlpha = al; ctx.beginPath(); ctx.arc(q.x, q.y, s * 0.7, 0, TAU); ctx.stroke();
            ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = -1; i <= 1; i++) { const a = q.rot + Math.PI + i * 0.35; ctx.moveTo(q.x + Math.cos(a) * s * 0.9, q.y + Math.sin(a) * s * 0.9); ctx.lineTo(q.x + Math.cos(a) * s * 1.7, q.y + Math.sin(a) * s * 1.7); } ctx.stroke();
            break;
          }
          case 'star': star5(ctx, q.x, q.y, q.size * 1.6, q.size * 0.6, q.rot); ctx.fill(); break;
          case 'smoke': ctx.globalAlpha = k * 0.45; ctx.beginPath(); ctx.arc(q.x, q.y, q.size * (2 - k), 0, TAU); ctx.fill(); break;
          case 'fist': ctx.beginPath(); ctx.arc(q.x, q.y, q.size * (1.4 - k * 0.4), 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); break;
          case 'coin': ctx.fillStyle = '#ffd84d'; ctx.beginPath(); ctx.ellipse(q.x, q.y, q.size, q.size * Math.abs(Math.sin(q.life * 20)) + 0.5, 0, 0, TAU); ctx.fill(); break;
          case 'feather': ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(0, 0, q.size * 2, q.size * 0.8, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = q.color; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-q.size * 2.2, 0); ctx.lineTo(q.size * 2, 0); ctx.stroke(); ctx.restore(); break;
          case 'petal': ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillStyle = q.color === '#9dff9a' ? '#ff9ec4' : q.color; ctx.beginPath(); ctx.moveTo(0, -q.size * 1.4); ctx.quadraticCurveTo(q.size * 1.3, 0, 0, q.size * 1.4); ctx.quadraticCurveTo(-q.size * 1.3, 0, 0, -q.size * 1.4); ctx.fill(); ctx.restore(); break;
          case 'leaf': ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillStyle = q.color; ctx.beginPath(); ctx.moveTo(-q.size * 1.8, 0); ctx.quadraticCurveTo(0, -q.size, q.size * 1.8, 0); ctx.quadraticCurveTo(0, q.size, -q.size * 1.8, 0); ctx.fill(); ctx.strokeStyle = 'rgba(30,94,72,0.6)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-q.size * 1.6, 0); ctx.lineTo(q.size * 1.6, 0); ctx.stroke(); ctx.restore(); break;
          case 'shard': ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillStyle = q.color; ctx.beginPath(); ctx.moveTo(0, -q.size * 1.8); ctx.lineTo(q.size * 0.8, 0); ctx.lineTo(0, q.size * 1.8); ctx.lineTo(-q.size * 0.8, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 0.7; ctx.stroke(); ctx.restore(); break;
          case 'rock': ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillStyle = q.color; ctx.beginPath(); ctx.moveTo(-q.size, -q.size * 0.6); ctx.lineTo(q.size * 0.4, -q.size); ctx.lineTo(q.size, q.size * 0.3); ctx.lineTo(-q.size * 0.2, q.size); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore(); break;
          case 'cross': ctx.fillStyle = q.color; ctx.fillRect(q.x - q.size * 0.35, q.y - q.size, q.size * 0.7, q.size * 2); ctx.fillRect(q.x - q.size, q.y - q.size * 0.35, q.size * 2, q.size * 0.7); break;
          default: ctx.beginPath(); ctx.arc(q.x, q.y, q.size * k + 0.5, 0, TAU); ctx.fill();
        }
      }
    };
    ctx.save(); pass(false); ctx.globalCompositeOperation = 'lighter'; pass(true); ctx.restore();
    ctx.globalAlpha = 1;
  },

  /* ---------- 技能（actor 可以係自己或隊友的影像） ---------- */
  runSkill(m, sk, which, actor = this.p, ghost = false, forceAng = null, forceDist = null) {
    const p = actor, b = this, ch = m.char, T = fxTheme(ch);
    // 只鎖定技能範圍內的敵人；範圍外唔追蹤，照面向方向施放
    const R = skillRange(sk, ch.cls);
    const tgt = forceAng == null ? this.nearestEnemy(p.x, p.y, R) : null;
    const ang = forceAng != null ? forceAng : tgt ? Math.atan2(tgt.y - p.y, tgt.x - p.x) : p.face;
    p.face = ang;
    const inRange = (e) => !e.dead && e.spawnT <= 0 && dist(p.x, p.y, e.x, e.y) - e.r <= R;
    const tDist = tgt ? Math.min(R, dist(p.x, p.y, tgt.x, tgt.y)) : forceDist != null && forceDist >= 0 ? forceDist : -1;
    const per = sk.mult / Math.max(1, sk.hits);
    const col = T.a, ccol = CLS[ch.cls].color;
    const O = { skill: true, m, color: col, ghost };
    if (!ghost && this.net) this.netEmit('sk', which, Math.round(p.x), Math.round(p.y), Math.round(ang * 100), Math.round(tDist));
    SFX.skill(); if (!ghost) this.shake = Math.max(this.shake, 6);
    this.castFx(p, T, ch.cls === 'mage' ? 6 : ch.cls === 'sword' ? 5 : 8);
    let lockOverride = null;
    switch (sk.kind) {
      /* 劍氣波：發光新月刀氣＋殘影＋主題粒子 */
      case 'wave': {
        const n = sk.hits;
        for (let i = 0; i < n; i++) {
          const a = ang + (i - (n - 1) / 2) * 0.22;
          this.projs.push({ kind: 'wave', x: p.x + Math.cos(a) * 18, y: p.y - 14 + Math.sin(a) * 18, vx: Math.cos(a) * 540, vy: Math.sin(a) * 540, r: 34, life: (R + 30) / 540, mult: per, hit: new Set(), o: O, color: col, theme: T, ang: a, ghost });
        }
        this.fx.push({ t: 0, dur: 0.3, draw: (ctx, f) => { const k = f.t / f.dur; ctx.globalCompositeOperation = 'lighter'; crescent(ctx, p.x, p.y - 14, ang, 30 + k * 30, T.b, (1 - k) * 0.9, 0.3); glow(ctx, p.x + Math.cos(ang) * 20, p.y - 14 + Math.sin(ang) * 20, 30, T.a, 1 - k); } });
        break;
      }
      /* 旋風：多層立體刀環＋魔法陣＋氣流粒子，最後爆發 */
      case 'whirl': {
        const dur = 0.95;
        this.fx.push({ t: 0, dur, tick: 0, update(f, dt) {
          const want = Math.floor((f.t / dur) * sk.hits + 0.5);
          while (f.tick < want && f.tick < sk.hits) { f.tick++; b.hitCircle(p.x, p.y - 10, 125, per, { ...O, kb: 30, pull: true }); SFX.slash(); }
          p.face += dt * 22;
          for (let i = 0; i < 2; i++) { const a = rand(0, TAU), r = rand(40, 120); b.pfx(T.p === 'spark' ? 'glow' : T.p, p.x + Math.cos(a) * r, p.y - 10 + Math.sin(a) * r * 0.6, { vx: -Math.sin(a) * 300, vy: Math.cos(a) * 180 - 50, life: 0.4, color: pick([T.a, T.b]), size: rand(2, 3.5), vr: 12, drag: 0.15 }); }
          if (f.t > dur - 0.1 && !f.fin) { f.fin = true; b.themeBurst(T, p.x, p.y - 10, 22, 340); b.shake = Math.max(b.shake, ghost ? 0 : 8); }
        }, draw(ctx, f) {
          const k = f.t / dur, fade = k < 0.82 ? Math.min(1, k * 8) : (1 - k) / 0.18, cx = p.x, cy = p.y - 10;
          ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
          magicCircle(ctx, p.x, p.y, 125, T.a, -f.t * 4, 0.5 * fade, 6);
          glow(ctx, cx, cy, 80, T.a, 0.32 * fade);
          ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.62);
          for (let i = 0; i < 7; i++) {
            const a0 = f.t * 22 + (i * TAU) / 7, rr = 46 + (i % 3) * 30 + Math.sin(f.t * 12 + i) * 5, main = i % 3 === 0;
            ctx.strokeStyle = i % 2 ? T.b : T.a; ctx.lineWidth = main ? 6 : 3;
            ctx.globalAlpha = fade * (main ? 0.95 : 0.6); ctx.beginPath(); ctx.arc(0, 0, rr, a0, a0 + 1.5); ctx.stroke();
            if (main) { ctx.globalAlpha = fade * 0.22; ctx.lineWidth = 14; ctx.stroke(); }
          }
          ctx.restore();
          if (k > 0.82) shockRing(ctx, cx, cy + 10, 125 + (k - 0.82) * 300, 10 * (1 - k) / 0.18, T.b, (1 - k) / 0.18);
        } });
        break;
      }
      /* 爆炸：先聚能，再大爆炸（光芒、衝擊波、主題碎片） */
      case 'nova': {
        const nd = tgt ? null : tDist >= 0 ? tDist : 110;
        const cx = tgt ? tgt.x : p.x + Math.cos(ang) * nd, cy = tgt ? tgt.y : p.y + Math.sin(ang) * nd;
        const dur = 0.95, delay = 0.22, style = ch.id === 'c07' ? 'palm' : ch.id === 'c11' ? 'slash' : ch.id === 'c12' ? 'fist' : ch.id === 'c09' ? 'thorn' : T.k;
        const rays = Array.from({ length: 10 }, (_, i) => (i / 10) * TAU + rand(-0.15, 0.15));
        this.fx.push({ t: 0, dur, tick: 0, update(f) {
          if (f.t < delay) { for (let i = 0; i < 2; i++) { const a = rand(0, TAU), r = rand(50, 95); b.pfx('glow', cx + Math.cos(a) * r, cy - 20 + Math.sin(a) * r * 0.6, { vx: -Math.cos(a) * r * 4.2, vy: -Math.sin(a) * r * 2.5, life: 0.22, color: pick([T.a, T.b]), size: 2.6, drag: 1 }); } return; }
          const want = Math.floor(((f.t - delay) / (dur - delay)) * sk.hits) + 1;
          while (f.tick < want && f.tick < sk.hits) {
            f.tick++; b.hitCircle(cx, cy, 105, per, { ...O, kb: 60 });
            if (f.tick === 1) {
              SFX.boom(); b.shake = Math.max(b.shake, 12); b.dust(cx, cy, 10);
              b.themeBurst(T, cx, cy - 10, 26, 360, { up: 40 });
              if (style === 'thorn') b.themeBurst(T, cx, cy - 10, 16, 260, { kind: 'petal' });
              if (style === 'dark' || style === 'fire') for (let i = 0; i < 12; i++) b.pfx('ember', cx + rand(-60, 60), cy + rand(-30, 30), { vy: rand(-180, -60), vx: rand(-30, 30), life: rand(0.5, 0.9), color: pick([T.a, T.c]), size: rand(2, 4), drag: 0.4 });
              for (let i = 0; i < 6; i++) b.pfx('rock', cx + rand(-20, 20), cy, { vx: rand(-160, 160), vy: rand(-260, -120), grav: 700, life: 0.8, color: '#8a7a6a', size: rand(2, 4), vr: rand(-10, 10) });
            }
          }
        }, draw(ctx, f) {
          ctx.lineCap = 'round';
          if (f.t < delay) {
            const k = f.t / delay; ctx.globalCompositeOperation = 'lighter';
            magicCircle(ctx, cx, cy, 70 * easeOut(k), T.a, f.t * 8, 0.9, 5);
            glow(ctx, cx, cy - 20, 12 + k * 30, T.a, 0.95); glow(ctx, cx, cy - 20, 6 + k * 12, '#ffffff', 1);
            return;
          }
          const k = (f.t - delay) / (dur - delay), fade = 1 - k;
          ctx.globalAlpha = 0.35 * fade; ctx.fillStyle = T.dark ? '#1a0820' : 'rgba(20,10,10,1)'; ctx.beginPath(); ctx.ellipse(cx, cy, 95, 60, 0, 0, TAU); ctx.fill();
          ctx.globalCompositeOperation = 'lighter';
          glow(ctx, cx, cy - 12, 115 * (0.6 + k * 0.45), T.a, fade * 0.9);
          glow(ctx, cx, cy - 12, 62 * (1 - k * 0.5), '#ffffff', fade);
          ctx.fillStyle = T.b;
          rays.forEach((a, i) => { const L = (130 + (i % 3) * 25) * easeOut(k * 1.8), w = 9 * fade; ctx.globalAlpha = fade * 0.75; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a + 1.57) * w, cy - 12 + Math.sin(a + 1.57) * w * 0.6); ctx.lineTo(cx + Math.cos(a) * L, cy - 12 + Math.sin(a) * L * 0.6); ctx.lineTo(cx - Math.cos(a + 1.57) * w, cy - 12 - Math.sin(a + 1.57) * w * 0.6); ctx.fill(); });
          shockRing(ctx, cx, cy, 125 * easeOut(k * 1.3), 9 * fade + 1, T.b, fade);
          shockRing(ctx, cx, cy, 85 * easeOut(k * 2.2), 5 * fade, T.a, fade * 0.85);
          if (style === 'palm' && k < 0.6) {
            const a = (1 - k / 0.6), s = 1 + k * 0.6; ctx.globalAlpha = a * 0.9; ctx.fillStyle = '#ffd34d';
            ctx.save(); ctx.translate(cx, cy - 30); ctx.scale(s, s);
            ctx.beginPath(); ctx.ellipse(0, 6, 22, 24, 0, 0, TAU); ctx.fill();
            [[-17, -14, -0.5], [-7, -24, -0.15], [5, -25, 0.1], [16, -18, 0.4], [26, 4, 1.1]].forEach(([fx2, fy2, ra]) => { ctx.save(); ctx.translate(fx2, fy2); ctx.rotate(ra); rrect(ctx, -4.5, -12, 9, 22, 4.5); ctx.fill(); ctx.restore(); });
            ctx.restore();
          } else if (style === 'slash' && k < 0.5) {
            const a = 1 - k / 0.5; ctx.globalAlpha = a; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8 * a + 2;
            ctx.beginPath(); ctx.moveTo(cx - 70 * easeOut(k * 4), cy - 80 * easeOut(k * 4)); ctx.lineTo(cx + 70 * easeOut(k * 4), cy + 50 * easeOut(k * 4)); ctx.stroke();
            ctx.strokeStyle = T.a; ctx.lineWidth = 20 * a; ctx.globalAlpha = a * 0.4; ctx.stroke();
          } else if (style === 'fist' && k < 0.45) {
            const a = 1 - k / 0.45; glow(ctx, cx, cy - 20, 50 * (1 + k), '#ff8a3a', a);
            ctx.globalAlpha = a; ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 16; i++) { const aa = (i / 16) * TAU, r = (i % 2 ? 30 : 60) * (0.6 + k); ctx.lineTo(cx + Math.cos(aa) * r, cy - 20 + Math.sin(aa) * r * 0.7); } ctx.closePath(); ctx.stroke();
          } else if (style === 'thorn') {
            ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#3f8a3a'; ctx.lineWidth = 3.5 * fade + 0.5; ctx.globalAlpha = fade;
            for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.3, L = 95 * easeOut(k * 2.2); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(cx + Math.cos(a + 0.5) * L * 0.6, cy + Math.sin(a + 0.5) * L * 0.4, cx + Math.cos(a) * L, cy + Math.sin(a) * L * 0.6); ctx.stroke(); }
          } else if (style === 'dark') {
            ctx.globalCompositeOperation = 'source-over';
            for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU, r = 60 * easeOut(k * 2), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.6, h = 50 * fade * (0.7 + 0.3 * Math.sin(f.t * 30 + i)); ctx.globalAlpha = fade * 0.85; ctx.fillStyle = i % 2 ? '#2a0f3a' : '#4a1650'; ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.quadraticCurveTo(x - 4, y - h * 0.6, x, y - h); ctx.quadraticCurveTo(x + 4, y - h * 0.6, x + 9, y); ctx.fill(); }
          }
        } });
        break;
      }
      /* 隕石：星光尾巴、地面準星、衝擊坑 */
      case 'meteor': {
        const alive = this.enemies.filter(inRange).sort((a, c) => dist(p.x, p.y, a.x, a.y) - dist(p.x, p.y, c.x, c.y));
        const ox = p.x, oy = p.y, fx0 = p.x + Math.cos(ang) * R * 0.45, fy0 = p.y + Math.sin(ang) * R * 0.45;
        const star = T.k === 'star';
        this.fx.push({ t: 0, dur: sk.hits * 0.11 + 0.6, draw: (ctx, f) => { const k = f.t / f.dur; ctx.globalCompositeOperation = 'lighter'; magicCircle(ctx, fx0, fy0 - 150, R * 0.5, T.c || T.a, f.t * 2, Math.sin(k * Math.PI) * 0.45, 5); } });
        for (let i = 0; i < sk.hits; i++) {
          const e = alive.length ? alive[i % alive.length] : null;
          const jx = rand(-18, 18), jy = rand(-18, 18);
          let tx = e ? e.x + jx : fx0 + rand(-R * 0.5, R * 0.5), ty = e ? e.y + jy : fy0 + rand(-R * 0.45, R * 0.45);
          const start = i * 0.11, fall = 0.35;
          this.fx.push({ t: 0, dur: start + fall + 0.45, hitDone: false, update(f) {
            if (e && !e.dead && f.t < start + fall * 0.6 && dist(ox, oy, e.x, e.y) - e.r <= R) { tx = e.x + jx; ty = e.y + jy; }
            if (f.t > start && f.t < start + fall && Math.random() < 0.8) { const kk = (f.t - start) / fall; b.pfx(star ? 'star' : 'ember', lerp(tx - 140, tx, kk) + rand(-6, 6), lerp(ty - 420, ty, kk) + rand(-6, 6), { vx: rand(-20, 20), vy: rand(-40, 0), life: 0.35, color: pick([T.a, T.b, T.c]), size: rand(1.5, 3), vr: 5 }); }
            if (!f.hitDone && f.t >= start + fall) {
              f.hitDone = true; b.hitCircle(tx, ty, 78, per, { ...O, kb: 70 }); SFX.boom(); b.shake = Math.max(b.shake, 9); b.dust(tx, ty, 6);
              b.themeBurst(T, tx, ty - 6, 12, 260, { up: 60, kind: star ? 'star' : 'ember' });
              for (let j = 0; j < 4; j++) b.pfx('rock', tx, ty, { vx: rand(-140, 140), vy: rand(-220, -100), grav: 700, life: 0.7, color: '#7a6a5a', size: rand(2, 3.5), vr: rand(-10, 10) });
            }
          }, draw(ctx, f) {
            if (f.t < start) return;
            ctx.globalCompositeOperation = 'lighter';
            if (f.t < start + fall) {
              const k = (f.t - start) / fall, mx = lerp(tx - 140, tx, k), my = lerp(ty - 420, ty, k);
              const rr = 78 * (1.3 - k * 0.3), ra = f.t * 5; ctx.globalAlpha = 0.5 + k * 0.5; ctx.strokeStyle = T.a; ctx.lineWidth = 2;
              ctx.beginPath(); for (let q = 0; q < 4; q++) { const a1 = ra + (q * Math.PI) / 2; ctx.moveTo(tx + Math.cos(a1) * rr, ty + Math.sin(a1) * rr * 0.5); ctx.ellipse(tx, ty, rr, rr * 0.5, 0, a1, a1 + 0.9); } ctx.stroke();
              ctx.globalAlpha = 0.22 * k; ctx.fillStyle = T.a; ctx.beginPath(); ctx.ellipse(tx, ty, 78 * k, 40 * k, 0, 0, TAU); ctx.fill();
              ctx.lineCap = 'round'; ctx.strokeStyle = T.a;
              ctx.globalAlpha = 0.35; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(mx + 56, my - 160); ctx.lineTo(mx, my); ctx.stroke();
              ctx.globalAlpha = 0.8; ctx.strokeStyle = T.b; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(mx + 30, my - 86); ctx.lineTo(mx, my); ctx.stroke();
              glow(ctx, mx, my, 26, T.a, 1); glow(ctx, mx, my, 11, '#ffffff', 1);
              if (star) { ctx.fillStyle = '#ffffff'; star5(ctx, mx, my, 10, 4, f.t * 10); ctx.fill(); }
            } else {
              const k = (f.t - start - fall) / 0.45, fade = 1 - k;
              glow(ctx, tx, ty - 8, 70 * (0.6 + k * 0.5), T.a, fade * 0.9); glow(ctx, tx, ty - 8, 34 * fade + 5, '#ffffff', fade);
              shockRing(ctx, tx, ty, 90 * easeOut(k * 1.5), 7 * fade, T.b, fade);
              ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.3 * fade; ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.ellipse(tx, ty, 50, 26, 0, 0, TAU); ctx.fill();
            }
          } });
        }
        break;
      }
      /* 光束：三層能量柱、螺旋紋、能量環、端點閃光 */
      case 'beam': {
        const dur = 0.85, L = R, w = 58;
        const ox = p.x, oy = p.y - 14, x2 = ox + Math.cos(ang) * L, y2 = oy + Math.sin(ang) * L;
        this.fx.push({ t: 0, dur, tick: 0, update(f) {
          const want = Math.floor((f.t / dur) * sk.hits) + 1;
          while (f.tick < want && f.tick < sk.hits) { f.tick++; b.hitLine(ox, oy, x2, y2, w, per, { ...O, kb: 50 }); if (!ghost) SFX.hit(false); }
          for (let i = 0; i < 2; i++) { const k = Math.random(); b.pfx(T.k === 'ice' ? 'shard' : 'glow', lerp(ox, x2, k) + rand(-12, 12), lerp(oy, y2, k) + rand(-12, 12), { vx: Math.cos(ang) * 200 + rand(-40, 40), vy: Math.sin(ang) * 200 + rand(-60, 0), life: 0.4, color: pick([T.a, T.b]), size: rand(2, 3.5), vr: 8 }); }
        }, draw(ctx, f) {
          const k = f.t / dur, wk = Math.sin(Math.min(1, k * 1.15) * Math.PI) * w * (1 + 0.06 * Math.sin(f.t * 60));
          ctx.save(); ctx.translate(ox, oy); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter';
          const go = ctx.createLinearGradient(0, -wk, 0, wk); go.addColorStop(0, colA(T.a, 0)); go.addColorStop(0.5, colA(T.a, 0.8)); go.addColorStop(1, colA(T.a, 0));
          ctx.fillStyle = go; ctx.globalAlpha = 0.85; ctx.fillRect(0, -wk, L, wk * 2);
          if (T.dark) { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.9; ctx.fillStyle = '#1a0820'; ctx.fillRect(0, -wk * 0.22, L, wk * 0.44); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ff6a3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -wk * 0.24); ctx.lineTo(L, -wk * 0.24); ctx.moveTo(0, wk * 0.24); ctx.lineTo(L, wk * 0.24); ctx.stroke(); }
          else { ctx.globalAlpha = 0.95; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -wk * 0.2); for (let x = 0; x <= L; x += 24) ctx.lineTo(x, -wk * 0.2 - Math.sin(x * 0.09 - f.t * 50) * 2.2); ctx.lineTo(L, wk * 0.2); for (let x = L; x >= 0; x -= 24) ctx.lineTo(x, wk * 0.2 + Math.sin(x * 0.09 - f.t * 50 + 1) * 2.2); ctx.closePath(); ctx.fill(); }
          ctx.strokeStyle = T.b; ctx.lineWidth = 2; ctx.globalAlpha = 0.8;
          for (const s of [-1, 1]) { ctx.beginPath(); for (let x = 0; x <= L; x += 15) { const y = s * wk * 0.55 * Math.sin(x * 0.045 - f.t * 32); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
          ctx.globalAlpha = 0.7; ctx.lineWidth = 2.5; for (let i = 0; i < 4; i++) { const xx = (f.t * 700 + (i * L) / 4) % L; ctx.beginPath(); ctx.ellipse(xx, 0, 4, wk * 0.75, 0, 0, TAU); ctx.stroke(); }
          glow(ctx, 0, 0, wk * 1.3 + 10, T.a, 1); glow(ctx, 0, 0, wk * 0.6 + 4, '#ffffff', 1); glow(ctx, L, 0, wk * 1.1, T.b, 0.9);
          ctx.restore();
        } });
        break;
      }
      /* 突進：角色殘影、刀光／螺旋／爪痕 */
      case 'dash': {
        const L = R, dashT = 0.28;
        const sx = p.x, sy = p.y;
        const ex = clamp(p.x + Math.cos(ang) * L, 26, this.W - 26), ey = clamp(p.y + Math.sin(ang) * L, 26, this.H - 26);
        const extra = sk.hits - 1, style = ch.cls;
        const marks = Array.from({ length: Math.max(1, extra) }, (_, i) => ({ k: (i + 0.5) / Math.max(1, extra), a: ang + Math.PI / 2 + rand(-0.6, 0.6) }));
        this.fx.push({ t: 0, dur: dashT + extra * 0.07 + 0.3, set: new Set(), tick: 0, ghosts: [], gt: 0, update(f, dt) {
          for (const g of f.ghosts) g.life -= dt;
          if (f.t <= dashT) {
            const k = easeOut(f.t / dashT); p.x = lerp(sx, ex, k); p.y = lerp(sy, ey, k);
            b.hitCircle(p.x, p.y - 10, 46, per, { ...O, kb: 120, set: f.set });
            f.gt -= dt; if (f.gt <= 0) { f.gt = 0.035; f.ghosts.push({ x: p.x, y: p.y, life: 0.28 }); if (f.ghosts.length > 8) f.ghosts.shift(); }
            if (Math.random() < 0.9) b.pfx('glow', p.x + rand(-10, 10), p.y - 12 + rand(-12, 12), { vx: -Math.cos(ang) * 120, vy: -Math.sin(ang) * 120, life: 0.3, color: pick([T.a, T.b]), size: rand(2, 3.5) });
          } else {
            const want = Math.min(extra, Math.floor((f.t - dashT) / 0.07) + 1);
            while (f.tick < want) {
              f.tick++; b.hitLine(sx, sy - 10, ex, ey - 10, 60, per, { ...O, kb: 40 }); SFX.slash();
              const mk = marks[f.tick - 1] || marks[0]; const mx = lerp(sx, ex, mk.k), my = lerp(sy, ey, mk.k) - 10;
              b.pfx('glow', mx, my, { size: 14, life: 0.2, color: T.a }); b.themeBurst(T, mx, my, 4, 160, { kind: T.p === 'spark' ? 'spark' : T.p });
            }
          }
        }, draw(ctx, f) {
          ctx.lineCap = 'round';
          for (const g of f.ghosts) { if (g.life <= 0) continue; ctx.save(); ctx.globalAlpha = (g.life / 0.28) * 0.5; drawChibi(ctx, ch, g.x, g.y, { face: ang, t: b.time, lite: true, noShadow: true, noWeapon: true, cloak: T.a }); ctx.restore(); }
          ctx.globalCompositeOperation = 'lighter';
          if (f.t < dashT) {
            const g = ctx.createLinearGradient(sx, sy, p.x, p.y); g.addColorStop(0, colA(T.a, 0)); g.addColorStop(1, colA(T.b, 0.9));
            ctx.strokeStyle = g; ctx.lineWidth = 22; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(sx, sy - 12); ctx.lineTo(p.x, p.y - 12); ctx.stroke();
            ctx.lineWidth = 5; ctx.globalAlpha = 1; ctx.stroke();
            return;
          }
          const k = (f.t - dashT) / (f.dur - dashT), fade = 1 - k;
          ctx.globalAlpha = fade * 0.5; ctx.strokeStyle = T.a; ctx.lineWidth = 26 * fade + 2; ctx.beginPath(); ctx.moveTo(sx, sy - 10); ctx.lineTo(ex, ey - 10); ctx.stroke();
          ctx.globalAlpha = fade; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6 * fade + 1; ctx.stroke();
          if (style === 'lance') {
            ctx.strokeStyle = T.b; ctx.lineWidth = 2.2;
            for (let i = 0; i < 6; i++) { const t2 = (i + 0.5) / 6, mx = lerp(sx, ex, t2), my = lerp(sy, ey, t2) - 10, rr = 16 * (1 + k) * (0.6 + 0.4 * Math.sin(i + f.t * 20)); ctx.globalAlpha = fade * 0.8; ctx.save(); ctx.translate(mx, my); ctx.rotate(ang); ctx.beginPath(); ctx.ellipse(0, 0, 4, rr, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
          } else if (style === 'fist') {
            ctx.strokeStyle = T.b; ctx.lineWidth = 3.5 * fade + 0.5;
            for (let i = 0; i < Math.min(f.tick, marks.length); i++) { const mk = marks[i], mx = lerp(sx, ex, mk.k), my = lerp(sy, ey, mk.k) - 10; for (let j = -1; j <= 1; j++) { const ox2 = Math.cos(mk.a + Math.PI / 2) * j * 7, oy2 = Math.sin(mk.a + Math.PI / 2) * j * 7; ctx.globalAlpha = fade; ctx.beginPath(); ctx.moveTo(mx + ox2 - Math.cos(mk.a) * 20, my + oy2 - Math.sin(mk.a) * 20); ctx.lineTo(mx + ox2 + Math.cos(mk.a) * 20, my + oy2 + Math.sin(mk.a) * 20); ctx.stroke(); } }
          } else {
            for (let i = 0; i < Math.min(f.tick, marks.length); i++) {
              const mk = marks[i], mx = lerp(sx, ex, mk.k), my = lerp(sy, ey, mk.k) - 10, Ls = 30 * (0.6 + 0.4 * easeOut(k * 3));
              ctx.globalAlpha = fade; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3.5;
              ctx.beginPath(); ctx.moveTo(mx - Math.cos(mk.a) * Ls, my - Math.sin(mk.a) * Ls); ctx.lineTo(mx + Math.cos(mk.a) * Ls, my + Math.sin(mk.a) * Ls); ctx.stroke();
              ctx.strokeStyle = T.a; ctx.lineWidth = 10; ctx.globalAlpha = fade * 0.4; ctx.stroke();
            }
          }
        } });
        SFX.whoosh();
        lockOverride = dashT + extra * 0.07 + 0.12;
        break;
      }
      /* 震地：地裂、三重衝擊波、碎石同塵土 */
      case 'quake': {
        const cracks = Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * TAU + rand(-0.2, 0.2), pts = []; let r = 0; while (r < 210) { r += rand(22, 38); pts.push([Math.cos(a + rand(-0.18, 0.18)) * r, Math.sin(a + rand(-0.18, 0.18)) * r * 0.75]); } return pts; });
        const cx0 = p.x, cy0 = p.y;
        this.fx.push({ t: 0, dur: 1.1, draw: (ctx, f) => {
          const k = f.t / f.dur, grow = easeOut(Math.min(1, f.t / 0.35)), fade = k < 0.6 ? 1 : (1 - k) / 0.4;
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.globalAlpha = fade * 0.7; ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 3;
          for (const pts of cracks) { ctx.beginPath(); ctx.moveTo(cx0, cy0); const n = Math.max(1, Math.floor(pts.length * grow)); for (let i = 0; i < n; i++) ctx.lineTo(cx0 + pts[i][0], cy0 + pts[i][1]); ctx.stroke(); }
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fade * 0.8; ctx.strokeStyle = T.a; ctx.lineWidth = 1.4;
          for (const pts of cracks) { ctx.beginPath(); ctx.moveTo(cx0, cy0); const n = Math.max(1, Math.floor(pts.length * grow)); for (let i = 0; i < n; i++) ctx.lineTo(cx0 + pts[i][0], cy0 + pts[i][1]); ctx.stroke(); }
          if (T.k === 'gold') { for (let i = 0; i < 3; i++) { const kk = clamp((f.t - i * 0.1) / 0.5, 0, 1); if (kk <= 0 || kk >= 1) continue; ctx.globalAlpha = (1 - kk) * 0.9; ctx.strokeStyle = '#fff3b0'; ctx.lineWidth = 5 * (1 - kk) + 1; ctx.beginPath(); ctx.arc(cx0 + Math.cos(ang) * 10, cy0 - 20 + Math.sin(ang) * 10, 30 + kk * 120, ang - 0.7, ang + 0.7); ctx.stroke(); } }
        } });
        for (let i = 0; i < 3; i++) {
          const start = i * 0.16, dur = 0.45;
          this.fx.push({ t: 0, dur: start + dur, set: new Set(), update(f) {
            if (f.t < start) return;
            const Rr = 230 * easeOut((f.t - start) / dur);
            if (!ghost) for (const e of b.enemies) {
              if (e.dead || e.spawnT > 0 || f.set.has(e.id)) continue;
              if (dist(p.x, p.y, e.x, e.y) - e.r <= Rr) { f.set.add(e.id); b.dealDamage(e, per, { ...O, kb: 160 }); }
            }
            if (!f.boomed) {
              f.boomed = true; SFX.boom(); b.shake = Math.max(b.shake, 10); b.dust(p.x, p.y, 10);
              for (let j = 0; j < 10; j++) { const a = rand(0, TAU), r = rand(20, 70); b.pfx('rock', p.x + Math.cos(a) * r, p.y + Math.sin(a) * r * 0.7, { vx: Math.cos(a) * rand(60, 160), vy: rand(-300, -140), grav: 800, life: 0.9, color: pick(['#8a7a6a', '#6b5a4a', '#a89880']), size: rand(2.5, 4.5), vr: rand(-12, 12) }); }
              b.themeBurst(T, p.x, p.y - 10, 10, 280, { kind: T.p === 'spark' ? 'glow' : T.p });
            }
          }, draw(ctx, f) {
            if (f.t < start) return;
            const k = (f.t - start) / dur, Rr = 230 * easeOut(k), fade = 1 - k;
            ctx.globalCompositeOperation = 'lighter';
            shockRing(ctx, p.x, p.y, Rr, 14 * fade + 2, T.a, fade * 0.9, 0.8);
            shockRing(ctx, p.x, p.y, Rr * 0.92, 3, '#ffffff', fade, 0.8);
            if (i === 0) glow(ctx, p.x, p.y - 10, 90 * (1 - k * 0.3), T.a, fade * 0.7);
          } });
        }
        break;
      }
      /* 追蹤彈幕：彗星尾巴魔彈＋背後魔法陣 */
      case 'barrage': {
        const alive = this.enemies.filter(inRange);
        this.fx.push({ t: 0, dur: sk.hits * 0.05 + 0.35, draw: (ctx, f) => { const k = f.t / f.dur; ctx.globalCompositeOperation = 'lighter'; magicCircle(ctx, p.x, p.y, 44, T.a, f.t * 6, Math.sin(k * Math.PI) * 0.9, 5); glow(ctx, p.x, p.y - 18, 26, T.a, Math.sin(k * Math.PI) * 0.7); } });
        for (let i = 0; i < sk.hits; i++) {
          setTimeoutGame(this, i * 0.05, () => {
            const target = alive.length ? alive[i % alive.length] : null;
            const a = ang + (target ? rand(-1.4, 1.4) : rand(-0.45, 0.45));
            b.projs.push({ kind: 'bolt', x: p.x, y: p.y - 18, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, r: 8, life: 1.8, mult: per, target, homing: target ? 7 : 0, maxD: R + 60, traveled: 0, hit: new Set(), o: O, color: col, theme: T, sp: false, ghost });
            b.pfx('glow', p.x + Math.cos(a) * 14, p.y - 18 + Math.sin(a) * 14, { size: 9, life: 0.15, color: T.b });
            SFX.magic();
          });
        }
        break;
      }
      /* 治癒：雙重魔法陣、光柱、羽毛／花瓣、十字光 */
      case 'heal': {
        if (!ghost) {
          if (this.net) { this.netEmit('hl', Math.round(sk.mult * 100)); this.receiveHeal(sk.mult, null); }
          else {
            let revived = 0;
            this.members.forEach((mm) => { const r = this.applyHeal(mm, sk.mult); if (r === 'revive') revived++; });
            this.floatText(p.x, p.y - 70, `全隊回復 ${Math.round(sk.mult * 100)}%`, '#8dffb5', 18, true);
            if (revived) this.floatText(p.x, p.y - 92, `${revived} 名隊友復活！`, '#fff27a', 16, true);
          }
        }
        const hc = '#8dffb5', fall = T.k === 'flower' ? 'petal' : T.k === 'holy' || T.k === 'star' ? 'feather' : 'glow';
        this.fx.push({ t: 0, dur: 1.3, draw(ctx, f) {
          const k = f.t / f.dur, open = easeOutBack(Math.min(1, f.t / 0.3)), fade = k < 0.7 ? 1 : (1 - k) / 0.3;
          ctx.globalCompositeOperation = 'lighter';
          magicCircle(ctx, p.x, p.y, 112 * open, hc, f.t * 1.4, fade * 0.95, 6);
          magicCircle(ctx, p.x, p.y, 70 * open, T.c || '#fff27a', -f.t * 2.2, fade * 0.8, 5);
          glow(ctx, p.x, p.y - 10, 90, hc, fade * 0.35);
          for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + f.t * 1.4, px = p.x + Math.cos(a) * 112 * open, py = p.y + Math.sin(a) * 112 * open * 0.55; lightPillar(ctx, px, py, 14, 120 * easeOut(Math.min(1, f.t / 0.45)), i % 2 ? hc : '#fff27a', fade * 0.55); }
          lightPillar(ctx, p.x, p.y, 46, 220 * easeOut(Math.min(1, f.t / 0.3)), '#ffffff', fade * 0.5);
          if (k < 0.35) shockRing(ctx, p.x, p.y, 130 * easeOut(k / 0.35), 6, '#ffffff', 1 - k / 0.35, 0.55);
        }, update(f) {
          if (Math.random() < 0.9) b.pfx(fall, p.x + rand(-110, 110), p.y - rand(120, 200), { vy: rand(30, 70), vx: rand(-20, 20), life: rand(1, 1.6), color: pick([hc, '#fff27a', T.a, '#ffffff']), size: rand(2, 3.5), vr: rand(-3, 3), sway: 40, drag: 0.6 });
          if (Math.random() < 0.6) b.pfx('cross', p.x + rand(-90, 90), p.y + rand(-40, 30), { vy: rand(-90, -50), life: 0.8, color: pick([hc, '#d9ffe6']), size: rand(2.5, 4), drag: 0.5 });
        } });
        SFX.heal();
        break;
      }
      /* 槍雨：天空魔法陣、發光長槍／冰柱、落地衝擊 */
      case 'rain': {
        const alive = this.enemies.filter(inRange), ice = T.k === 'ice', cx0 = p.x, cy0 = p.y;
        this.fx.push({ t: 0, dur: sk.hits * 0.07 + 0.55, draw: (ctx, f) => { const k = f.t / f.dur; ctx.globalCompositeOperation = 'lighter'; magicCircle(ctx, cx0, cy0, R * 0.95, T.a, f.t * 1.5, Math.sin(k * Math.PI) * 0.55, 8); } });
        for (let i = 0; i < sk.hits; i++) {
          const e = alive.length && i % 2 === 0 ? alive[(i / 2) % alive.length | 0] : null;
          const tx = e ? e.x + rand(-14, 14) : p.x + rand(-R, R) * 0.85, ty = e ? e.y + rand(-14, 14) : p.y + rand(-R, R) * 0.7;
          const start = i * 0.07, fall = 0.22;
          this.fx.push({ t: 0, dur: start + fall + (ice ? 0.55 : 0.32), done: false, update(f) {
            if (!f.done && f.t >= start + fall) {
              f.done = true; b.hitCircle(tx, ty, 58, per, { ...O, kb: 60 }); SFX.stab(); b.dust(tx, ty, 3);
              b.pfx('glow', tx, ty - 6, { size: 18, life: 0.2, color: T.a });
              for (let j = 0; j < 5; j++) b.pfx(ice ? 'snow' : 'spark', tx, ty - 4, { vx: rand(-160, 160), vy: rand(-200, -60), life: 0.4, color: T.b, size: rand(2, 3) });
            }
            if (ice && !f.shat && f.t >= start + fall + 0.38) { f.shat = true; for (let j = 0; j < 6; j++) b.pfx('shard', tx, ty - 14, { vx: rand(-120, 120), vy: rand(-160, -40), grav: 500, life: 0.6, color: pick(['#bfeaff', '#ffffff', '#8fd0ff']), size: rand(2, 3.5), vr: rand(-10, 10) }); }
          }, draw(ctx, f) {
            if (f.t < start) return;
            if (f.t < start + fall) {
              const k = (f.t - start) / fall, yy = lerp(ty - 360, ty, easeIn(k));
              ctx.globalAlpha = 0.3 * k; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(tx, ty, 14 * k, 5 * k, 0, 0, TAU); ctx.fill();
              ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = T.a; ctx.lineCap = 'round'; ctx.globalAlpha = 0.3; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(tx, yy - 80); ctx.lineTo(tx, yy); ctx.stroke(); ctx.globalAlpha = 0.7; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx, yy - 50); ctx.lineTo(tx, yy); ctx.stroke();
              ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
              if (ch.cls === 'bow') { ctx.strokeStyle = OL; ctx.lineWidth = 2.8; ctx.beginPath(); ctx.moveTo(tx, yy - 34); ctx.lineTo(tx, yy); ctx.stroke(); ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 1.4; ctx.stroke(); ctx.fillStyle = '#dfe6f2'; poly(ctx, [[tx - 3.5, yy - 2], [tx, yy + 7], [tx + 3.5, yy - 2]]); ctx.fill(); olS(ctx, 0.6); ctx.fillStyle = ch.accent; poly(ctx, [[tx, yy - 34], [tx - 3, yy - 30], [tx - 3, yy - 26], [tx, yy - 29], [tx + 3, yy - 26], [tx + 3, yy - 30]]); ctx.fill(); }
              else if (ice) { ctx.fillStyle = lgrad(ctx, tx - 5, yy - 30, tx + 5, yy, ['#ffffff', '#9fe3ff', '#4ea8ff']); poly(ctx, [[tx - 5, yy - 30], [tx + 5, yy - 30], [tx, yy + 6]]); ctx.fill(); olS(ctx, 0.8); }
              else { ctx.strokeStyle = '#e8eef8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx, yy - 42); ctx.lineTo(tx, yy - 6); ctx.stroke(); ctx.fillStyle = col; poly(ctx, [[tx - 5, yy - 8], [tx, yy + 8], [tx + 5, yy - 8]]); ctx.fill(); olS(ctx, 0.7); }
              glow(ctx, tx, yy, 10, T.b, 0.9);
            } else {
              const k = (f.t - start - fall) / (ice ? 0.55 : 0.32), fade = 1 - k;
              ctx.globalCompositeOperation = 'lighter'; shockRing(ctx, tx, ty, 58 * easeOut(k * 1.6), 4 * fade, T.a, fade, 0.4);
              ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = ice ? Math.min(1, (1 - k) * 2) : fade;
              if (ice && k < 0.72) { ctx.fillStyle = lgrad(ctx, tx - 6, ty - 26, tx + 6, ty, ['#ffffff', '#9fe3ff', '#4ea8ff']); poly(ctx, [[tx - 6, ty + 2], [tx - 2, ty - 28], [tx + 3, ty - 20], [tx + 7, ty + 2]]); ctx.fill(); olS(ctx, 0.8); }
              else if (!ice) { ctx.strokeStyle = ch.cls === 'bow' ? '#e8dcc0' : '#e8eef8'; ctx.lineWidth = ch.cls === 'bow' ? 1.6 : 3; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + 2, ty - (ch.cls === 'bow' ? 26 : 36)); ctx.stroke(); }
            }
          } });
        }
        break;
      }
      /* 百裂拳：拳影、速度線、衝擊星，最後一記重拳 */
      case 'flurry': {
        const dur = 0.62;
        this.fx.push({ t: 0, dur: dur + 0.2, tick: 0, update(f, dt) {
          const want = Math.floor((Math.min(f.t, dur) / dur) * sk.hits) + 1;
          while (f.tick < want && f.tick < sk.hits) {
            f.tick++; const n = b.hitCone(p.x, p.y - 10, ang, 78, 1.9, per, { ...O, kb: 20 });
            SFX.punch();
            const a = ang + rand(-0.65, 0.65), r = rand(24, 70), fx2 = p.x + Math.cos(a) * r, fy2 = p.y - 12 + Math.sin(a) * r;
            b.pfx('fistfx', fx2, fy2, { size: rand(10, 15), life: 0.13, color: pick([T.a, '#ffe08a']), rot: ang });
            if (n) b.hitstop = Math.max(b.hitstop, 0.012);
            if (f.tick === sk.hits) { const bx = p.x + Math.cos(ang) * 60, by = p.y - 12 + Math.sin(ang) * 60; b.pfx('fistfx', bx, by, { size: 30, life: 0.3, color: '#ffe08a', rot: ang }); b.themeBurst(T, bx, by, 16, 300, { kind: 'glow' }); b.shake = Math.max(b.shake, ghost ? 0 : 8); }
          }
          if (!ghost && f.t < dur) { p.x = clamp(p.x + Math.cos(ang) * 20 * dt, 26, b.W - 26); p.y = clamp(p.y + Math.sin(ang) * 20 * dt, 26, b.H - 26); }
        }, draw(ctx, f) {
          if (f.t > dur) return;
          const fade = Math.min(1, (dur - f.t) * 6);
          ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
          glow(ctx, p.x + Math.cos(ang) * 40, p.y - 12 + Math.sin(ang) * 40, 50, T.a, 0.35 * fade);
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6;
          for (let i = 0; i < 8; i++) { const a = ang + rand(-0.8, 0.8), r0 = rand(20, 40), r1 = r0 + rand(30, 60); ctx.globalAlpha = rand(0.3, 0.8) * fade; ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a) * r0, p.y - 12 + Math.sin(a) * r0); ctx.lineTo(p.x + Math.cos(a) * r1, p.y - 12 + Math.sin(a) * r1); ctx.stroke(); }
        } });
        break;
      }
      /* 扇形貫穿箭（S 技）／後躍連射（爆發技） */
      case 'volley': case 'backshot': {
        const n = sk.hits, back = sk.kind === 'backshot', spread = back ? 0.7 : 0.85;
        const fire = () => {
          for (let i = 0; i < n; i++) {
            const a = ang + (n > 1 ? (i / (n - 1) - 0.5) * spread : 0);
            b.projs.push({ kind: 'parrow', x: p.x + Math.cos(a) * 14, y: p.y - 16 + Math.sin(a) * 14, vx: Math.cos(a) * 640, vy: Math.sin(a) * 640, ang: a, r: 9, life: 1.2, mult: per, target: null, homing: 0, maxD: R + 50, traveled: 0, hit: new Set(), o: O, color: col, theme: T, sp: false, pierce: true, big: true, ghost });
          }
          b.pfx('glow', p.x + Math.cos(ang) * 16, p.y - 16 + Math.sin(ang) * 16, { size: 16, life: 0.2, color: T.a });
          for (let i = 0; i < 8; i++) { const a = ang + rand(-0.6, 0.6); b.pfx('spark', p.x + Math.cos(a) * 20, p.y - 16 + Math.sin(a) * 20, { vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, life: 0.25, color: pick([T.a, T.b]) }); }
          SFX.arrow(); SFX.whoosh();
        };
        if (back) {
          const sx = p.x, sy = p.y, ba = ang + Math.PI, ex = clamp(p.x + Math.cos(ba) * 90, 26, this.W - 26), ey = clamp(p.y + Math.sin(ba) * 90, 26, this.H - 26);
          this.fx.push({ t: 0, dur: 0.24, fired: false, update(f) {
            const k = easeOut(Math.min(1, f.t / 0.2));
            if (!ghost) { p.x = lerp(sx, ex, k); p.y = lerp(sy, ey, k); p.face = ang; }
            if (!f.fired && f.t >= 0.04) { f.fired = true; fire(); }
          }, draw(ctx, f) { const k = f.t / f.dur; ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = T.a; ctx.globalAlpha = (1 - k) * 0.6; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx, sy - 12); ctx.lineTo(p.x, p.y - 12); ctx.stroke(); } });
          lockOverride = 0.3;
        } else fire();
        break;
      }
      /* 狙擊：瞄準光線 → 巨大貫穿光箭 */
      case 'snipe': {
        const L = R, w = 42, ox = p.x, oy = p.y - 16, x2 = ox + Math.cos(ang) * L, y2 = oy + Math.sin(ang) * L, aimT = 0.24;
        this.fx.push({ t: 0, dur: 0.9, fired: false, update(f) {
          if (f.t < aimT) { if (Math.random() < 0.9) { const a = rand(0, TAU), r = rand(18, 36); b.pfx('glow', ox + Math.cos(ang) * 14 + Math.cos(a) * r, oy + Math.sin(ang) * 14 + Math.sin(a) * r, { vx: -Math.cos(a) * r * 5, vy: -Math.sin(a) * r * 5, life: 0.18, color: T.a, size: 2.4, drag: 1 }); } return; }
          if (!f.fired) {
            f.fired = true; SFX.boom(); SFX.arrow(); if (!ghost) { b.shake = Math.max(b.shake, 9); b.zoomPunch = Math.max(b.zoomPunch, 0.05); }
            for (let i = 0; i < sk.hits; i++) b.hitLine(ox, oy, x2, y2, w, per, { ...O, kb: 220, breaker: true });
            for (const e of b.enemies) { if (e.dead || e.spawnT > 0) continue; const tt = clamp(((e.x - ox) * (x2 - ox) + (e.y - oy) * (y2 - oy)) / (L * L), 0, 1); if (dist(ox + (x2 - ox) * tt, oy + (y2 - oy) * tt, e.x, e.y) <= w / 2 + e.r) { b.pfx('glow', e.x, e.y - e.r, { size: 24, life: 0.3, color: T.b }); b.themeBurst(T, e.x, e.y - e.r, 6, 220); } }
            if (!ghost) b.shake = Math.max(b.shake, 8);
          }
        }, draw(ctx, f) {
          ctx.lineCap = 'round'; ctx.globalCompositeOperation = 'lighter';
          if (f.t < aimT) {
            const k = f.t / aimT; ctx.globalAlpha = 0.3 + 0.5 * k * (0.6 + 0.4 * Math.sin(f.t * 80)); ctx.strokeStyle = T.a; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x2, y2); ctx.stroke();
            glow(ctx, ox + Math.cos(ang) * 14, oy + Math.sin(ang) * 14, 10 + k * 20, T.a, 1); magicCircle(ctx, ox + Math.cos(ang) * 22, oy + Math.sin(ang) * 22, 18 + k * 10, T.c || T.a, f.t * 10, 0.9, 6);
            return;
          }
          const k = (f.t - aimT) / (f.dur - aimT), fade = 1 - k, head = easeOut(Math.min(1, k * 6));
          const hx = lerp(ox, x2, head), hy = lerp(oy, y2, head);
          ctx.globalAlpha = fade * 0.55; ctx.strokeStyle = T.a; ctx.lineWidth = 30 * fade + 4; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(hx, hy); ctx.stroke();
          ctx.globalAlpha = fade; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 7 * fade + 1.5; ctx.stroke();
          ctx.save(); ctx.translate(ox, oy); ctx.rotate(ang); ctx.strokeStyle = T.b; ctx.lineWidth = 2;
          for (let i = 0; i < 5; i++) { const xx = L * (0.15 + i * 0.18) * head, rr = (10 + i * 2) * (1 + k * 1.5); ctx.globalAlpha = fade * 0.8; ctx.beginPath(); ctx.ellipse(xx, 0, 3 + k * 4, rr, 0, 0, TAU); ctx.stroke(); }
          ctx.restore();
          glow(ctx, hx, hy, 30 * fade + 8, T.b, fade); glow(ctx, ox, oy, 26 * fade, T.a, fade);
        } });
        break;
      }
      /* 地圖炮：向天射出流星箭，天空魔法陣降下光之箭雨，打中全地圖所有敵人 */
      case 'mapcannon': {
        const n = sk.hits, start = 0.55, gap = 0.17;
        const camX = () => b.cam.x + b.viewW / 2, camY = () => b.cam.y + b.viewH * 0.42;
        const drop = (x, y, onHit) => {
          b.fx.push({ t: 0, dur: 0.42, done: false, update(f) { if (!f.done && f.t >= 0.16) { f.done = true; if (onHit) onHit(); b.pfx('glow', x, y - 4, { size: 16, life: 0.22, color: T.a }); for (let j = 0; j < 4; j++) b.pfx('spark', x, y - 4, { vx: rand(-180, 180), vy: rand(-220, -60), life: 0.35, color: pick([T.a, T.b, T.c]) }); } },
            draw(ctx, f) {
              ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
              if (f.t < 0.16) { const k = f.t / 0.16, x0 = x + 70, y0 = y - 320, mx = lerp(x0, x, easeIn(k)), my = lerp(y0, y, easeIn(k)); ctx.strokeStyle = T.a; ctx.globalAlpha = 0.45; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(mx + 22, my - 100); ctx.lineTo(mx, my); ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = 1; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx + 10, my - 46); ctx.lineTo(mx, my); ctx.stroke(); glow(ctx, mx, my, 12, T.b, 1); }
              else { const k = (f.t - 0.16) / 0.26, fade = 1 - k; shockRing(ctx, x, y, 40 * easeOut(k * 1.4), 4 * fade, T.a, fade, 0.5); glow(ctx, x, y - 6, 34 * fade + 4, T.a, fade * 0.9); }
            } });
        };
        this.fx.push({ t: 0, dur: start + n * gap + 0.7, wave: 0, update(f) {
          if (f.t < 0.3 && Math.random() < 0.9) b.pfx('glow', p.x + rand(-6, 6), p.y - 30 - f.t * 900, { vy: 200, life: 0.25, color: pick([T.a, T.b]), size: 3 });
          while (f.wave < n && f.t >= start + f.wave * gap) {
            f.wave++;
            for (const e of b.enemies) { if (e.dead || e.spawnT > 0) continue; drop(e.x + rand(-8, 8), e.y + rand(-6, 6), () => { if (!e.dead) b.dealDamage(e, per, { ...O, kb: 40 }); }); }
            for (let j = 0; j < 5; j++) drop(b.cam.x + rand(20, b.viewW - 20), b.cam.y + rand(70, b.viewH - 90), null);
            SFX.stab(); if (!ghost) b.shake = Math.max(b.shake, 5);
          }
          if (f.wave >= n && !f.fin && f.t >= start + n * gap + 0.1) { f.fin = true; if (!ghost) { b.flash = { t: 0, dur: 0.3, col: '200,240,255', a: 0.35 }; b.shake = Math.max(b.shake, 10); } SFX.boom(); }
        }, draw(ctx, f) {
          const k = f.t / f.dur, cx = camX(), cy = camY(), open = easeOutBack(clamp((f.t - 0.25) / 0.35, 0, 1)), fade = k < 0.8 ? 1 : (1 - k) / 0.2;
          ctx.globalAlpha = 0.28 * fade * Math.min(1, f.t / 0.3); ctx.fillStyle = '#060a20'; ctx.fillRect(b.cam.x - 40, b.cam.y - 40, b.viewW + 80, b.viewH + 80);
          ctx.globalCompositeOperation = 'lighter';
          if (f.t < 0.35) { const kk = f.t / 0.35; ctx.strokeStyle = T.b; ctx.lineCap = 'round'; ctx.globalAlpha = 1 - kk * 0.5; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(p.x, p.y - 30 - kk * 380); ctx.lineTo(p.x, p.y - 30 - kk * 380 + 60); ctx.stroke(); glow(ctx, p.x, p.y - 30 - kk * 380, 20, T.a, 1); }
          if (open > 0) {
            magicCircle(ctx, cx, cy, b.viewW * 0.62 * open, T.a, f.t * 0.9, fade * 0.75, 8);
            magicCircle(ctx, cx, cy, b.viewW * 0.36 * open, T.c || T.b, -f.t * 1.6, fade * 0.7, 5);
            glow(ctx, cx, cy, b.viewW * 0.35, T.a, fade * 0.3);
          }
        } });
        lockOverride = 0.6;
        break;
      }
      default: break;
    }
    if (sk.kind !== 'heal') this.ring(p.x, p.y - 14, ccol, 90, 0.35);
    if (!ghost) {
      const tm = SKILL_TIMING[sk.kind] || { lock: 0.4, inv: 0.8 };
      p.skillT = lockOverride ?? tm.lock;
      p.inv = Math.max(p.inv, tm.inv ?? p.skillT + 0.1);
    }
  },
});
