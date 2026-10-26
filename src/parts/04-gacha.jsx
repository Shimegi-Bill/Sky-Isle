
/* ============================================================
 * 8. 抽蛋（飛船跳傘演出）
 * ============================================================ */
const COST_SINGLE = 25, COST_ELEVEN = 250;
const GACHA_RATES = { 4: 0.1, 3: 0.4, 2: 0.5 };
// 「金斗篷落地閃電昇格」與「4★ 總機率 10%」無法同時以金斗篷 15% 成立，
// 所以保留 10% 總機率，4★ 之中有 PROMO_SHARE 比例以金斗篷昇格方式登場。
const PROMO_SHARE = 0.4;
function rollRarity() { const r = Math.random(); return r < GACHA_RATES[4] ? 4 : r < GACHA_RATES[4] + GACHA_RATES[3] ? 3 : 2; }
function rollGacha(count, guarantee4) {
  const rs = Array.from({ length: count }, rollRarity);
  if (guarantee4 && !rs.includes(4)) rs[rs.length - 1] = 4;
  return rs.map((r) => {
    const c = pick(CHARS.filter((x) => x.r === r));
    const cloak = r === 4 ? (Math.random() < PROMO_SHARE ? 'gold' : 'purple') : 'gold';
    return { id: c.id, r, cloak, promote: r === 4 && cloak === 'gold' };
  });
}

const PED_COL = { 2: ['#8a5530', '#d08a52'], 3: ['#7d8aa3', '#e6edf7'], 4: ['#b8860b', '#ffe066'] };

function GachaShow({ results, onDone }) {
  const cvRef = useRef(null), wrapRef = useRef(null), stRef = useRef(null);
  const doneRef = useRef(onDone); doneRef.current = onDone;
  const finishedRef = useRef(false);
  const finish = () => { if (finishedRef.current) return; finishedRef.current = true; if (stRef.current) stRef.current.phase = 'end'; doneRef.current && doneRef.current(); };
  const finishRef = useRef(finish); finishRef.current = finish;
  const [prompt, setPrompt] = useState('點擊畫面可快轉');

  useEffect(() => {
    const cv = cvRef.current, ctx = cv.getContext('2d');
    let W = 360, H = 640, dpr = 1;
    const resize = () => {
      const r = wrapRef.current.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrapRef.current);
    const wrapEl = wrapRef.current, tBlock = (e) => { if (e.cancelable) e.preventDefault(); };
    ['touchstart', 'touchmove', 'touchend'].forEach((nm) => wrapEl.addEventListener(nm, tBlock, { passive: false }));
    const n = results.length, multi = n > 1;
    const gap = multi ? 0.14 : 0, T_SKY = 2.0, T_JUMP_END = T_SKY + (n - 1) * gap + 1.8;
    const landGap = multi ? 0.2 : 0;
    const T_LAND_END = T_JUMP_END + 0.25 + (n - 1) * landGap + 0.9 + 0.3 + 1.3;
    const imgs = results.map((r) => { const im = new Image(); im.src = portraitURL(CHAR_BY_ID[r.id], false, false); return im; });
    const rows = n === 1 ? [[0]] : [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10]];
    const S = {
      t: 0, phase: 'sky', flash: 0, shakeT: 0, introIdx: 0, introT: 0, bolts: [], parts: [],
      intros: results.map((r, i) => (r.r === 4 ? i : -1)).filter((i) => i >= 0),
      clouds: Array.from({ length: 12 }, () => ({ x: rand(-0.2, 1.2), y: rand(0, 1.4), s: rand(0.6, 1.5), v: rand(0.02, 0.06) })),
      j: results.map((r, i) => ({ ...r, kind: r.cloak, dx: (i - (n - 1) / 2) * 0.05 + rand(-0.02, 0.02), sway: rand(0, TAU), f: {} })),
    };
    stRef.current = S;
    S.skipTo = (t) => { S.t = Math.max(S.t, t); };
    S.T = { T_SKY, T_JUMP_END, T_LAND_END };
    SFX.engine();

    const pedPos = (i) => {
      if (n === 1) return { x: W / 2, y: H * 0.64, s: 1 };
      const ri = rows.findIndex((row) => row.includes(i)), row = rows[ri], ci = row.indexOf(i);
      const cols = row.length, spanW = Math.min(W - 40, 340);
      return { x: W / 2 + (ci - (cols - 1) / 2) * (spanW / 4), y: H * (0.42 + ri * 0.16), s: 0.5 };
    };
    const drawSky = (camY) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#3d9cf0'); g.addColorStop(0.7, '#9fd8ff'); g.addColorStop(1, '#dff3ff');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const sg = ctx.createRadialGradient(W * 0.82, H * 0.12, 4, W * 0.82, H * 0.12, 120);
      sg.addColorStop(0, 'rgba(255,255,230,0.95)'); sg.addColorStop(1, 'rgba(255,255,230,0)');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
      for (const c of S.clouds) {
        const x = ((c.x - S.t * c.v) % 1.4 + 1.4) % 1.4 - 0.2, y = ((c.y - camY * c.s * 0.6) % 1.4 + 1.4) % 1.4 - 0.2;
        ctx.fillStyle = `rgba(255,255,255,${0.55 + c.s * 0.2})`;
        const cx = x * W, cy = y * H, s = 26 * c.s;
        ctx.beginPath(); ctx.arc(cx, cy, s, 0, TAU); ctx.arc(cx + s, cy + 4, s * 0.8, 0, TAU); ctx.arc(cx - s, cy + 6, s * 0.7, 0, TAU); ctx.arc(cx + s * 0.3, cy - s * 0.5, s * 0.75, 0, TAU); ctx.fill();
      }
    };
    const drawShip = (x, y) => {
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = '#6b4a2e'; rrect(ctx, -34, 36, 68, 22, 6); ctx.fill();
      ctx.fillStyle = '#ffe9a8'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-22 + i * 15, 46, 4, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = '#4a3220'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-30, 36); ctx.lineTo(-40, 22); ctx.moveTo(30, 36); ctx.lineTo(40, 22); ctx.stroke();
      ctx.fillStyle = '#c94a4a'; ctx.beginPath(); ctx.moveTo(-82, -2); ctx.lineTo(-104, -26); ctx.lineTo(-96, 0); ctx.lineTo(-104, 24); ctx.closePath(); ctx.fill();
      const eg = ctx.createLinearGradient(0, -40, 0, 34); eg.addColorStop(0, '#ffffff'); eg.addColorStop(1, '#c9d6ea');
      ctx.fillStyle = eg; ctx.beginPath(); ctx.ellipse(0, 0, 92, 34, 0, 0, TAU); ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = '#e85d5d'; for (let i = -3; i <= 3; i += 2) ctx.fillRect(i * 22 - 8, -40, 16, 80);
      ctx.restore();
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 92, 34, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#ffd76a'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.fill();
      ctx.fillStyle = '#c94a4a'; star5(ctx, 0, 0, 9, 4); ctx.fill();
      ctx.save(); ctx.translate(-40, 47); ctx.scale(Math.cos(S.t * 40) * 0.9, 1); ctx.fillStyle = 'rgba(80,60,40,0.7)'; ctx.fillRect(-2, -12, 4, 24); ctx.restore();
      ctx.restore();
    };
    const drawChute = (x, y, kind, t2) => {
      const purple = kind === 'purple' || kind === 'rainbow';
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - 26, y - 62); ctx.lineTo(x - 8, y - 30); ctx.moveTo(x + 26, y - 62); ctx.lineTo(x + 8, y - 30); ctx.moveTo(x, y - 66); ctx.lineTo(x, y - 40); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(x, y - 60, 30, Math.PI, 0); ctx.quadraticCurveTo(x, y - 70, x - 30, y - 60); ctx.closePath(); ctx.clip();
      for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#ffffff' : purple ? '#8b4dff' : '#ffb13b'; ctx.fillRect(x - 30 + i * 10, y - 92, 10, 34); }
      ctx.restore();
    };
    const lightning = (x, y) => {
      const pts = [[x + rand(-40, 40), -10]];
      const segs = 9;
      for (let i = 1; i <= segs; i++) pts.push([lerp(pts[0][0], x, i / segs) + (i < segs ? rand(-22, 22) : 0), lerp(-10, y, i / segs)]);
      S.bolts.push({ pts, life: 0.35 });
      S.flash = 1; S.shakeT = 0.4; SFX.thunder();
    };
    const sparkle = (x, y, col, k = 24) => { for (let i = 0; i < k; i++) { const a = rand(0, TAU), s = rand(40, 220); S.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: rand(0.5, 1.1), max: 1.1, col, size: rand(2, 4.5) }); } };

    const step = (dt) => {
      if (S.phase === 'intro') { S.introT += dt; return; }
      S.t += dt;
      if (S.flash > 0) S.flash -= dt * 2.5;
      if (S.shakeT > 0) S.shakeT -= dt;
      for (const b of S.bolts) b.life -= dt; S.bolts = S.bolts.filter((b) => b.life > 0);
      for (const q of S.parts) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 160 * dt; } S.parts = S.parts.filter((q) => q.life > 0);
      // 事件
      S.j.forEach((jp, i) => {
        const tj = T_SKY + i * gap;
        if (!jp.f.jump && S.t >= tj) { jp.f.jump = true; SFX.jump(); }
        if (!jp.f.chute && S.t >= tj + 0.4) { jp.f.chute = true; SFX.chute(); }
        const ls = T_JUMP_END + 0.25 + i * landGap;
        if (jp.promote && !jp.f.bolt && S.t >= ls + 0.72) { jp.f.bolt = true; const pp = pedPos(i); jp.kind = 'rainbow'; lightning(pp.x, pp.y - 70 * (n === 1 ? 1.5 : 0.8)); }
        if (!jp.f.land && S.t >= ls + 0.9) {
          jp.f.land = true; const pp = pedPos(i);
          if (!multi || i % 3 === 0 || jp.r === 4) SFX.land(jp.r);
          sparkle(pp.x, pp.y - 20, jp.r === 4 ? '#ffe066' : jp.r === 3 ? '#e6edf7' : '#e0a070', jp.r === 4 ? 40 : 14);
          if (jp.r === 4 && !S.fanfared) { S.fanfared = true; setTimeout(() => SFX.fanfare(), 250); }
        }
      });
      if (S.t >= T_LAND_END && S.phase !== 'intro') {
        if (S.intros.length) { S.phase = 'intro'; S.introIdx = 0; S.introT = 0; SFX.levelUp(); setPrompt('點擊繼續'); }
        else finishRef.current();
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const t = S.t;
      const shake = S.shakeT > 0 ? S.shakeT * 18 : 0;
      ctx.save(); ctx.translate(rand(-shake, shake), rand(-shake, shake));
      if (S.phase === 'intro') { drawIntro(); ctx.restore(); return; }
      if (t < T_JUMP_END) {
        const camY = t < T_SKY ? 0 : (t - T_SKY) * 0.35;
        drawSky(camY);
        const shipX = lerp(-140, W * 0.5, easeOut(Math.min(1, t / 1.8))), shipY = H * 0.22 + Math.sin(t * 2) * 4 - Math.max(0, t - T_SKY) * 70;
        drawShip(shipX, shipY);
        S.j.forEach((jp, i) => {
          const tj = T_SKY + i * gap; if (t < tj) return;
          const tau = t - tj;
          let y = shipY + 50 + (t - T_SKY) * 70, x = shipX + jp.dx * W * 1.6 * Math.min(1, tau * 1.2);
          if (tau < 0.4) y += 0.5 * 900 * tau * tau; else y += 72 + (tau - 0.4) * 34;
          x += Math.sin(t * 2 + jp.sway) * 10;
          const sc = multi ? 0.9 : 1.6;
          if (tau >= 0.4) { ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); drawChute(0, 0, jp.kind, t); ctx.restore(); }
          drawCloaked(ctx, x, y, sc, jp.kind, t + i);
        });
        if (t >= T_SKY - 0.2 && t < T_SKY + 0.6) { ctx.fillStyle = '#fff'; ctx.font = `18px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.globalAlpha = 1 - Math.abs(t - T_SKY - 0.2) / 0.4; ctx.fillText('跳下來了！', W / 2, H * 0.12); ctx.globalAlpha = 1; }
      } else {
        drawStage();
        S.j.forEach((jp, i) => drawLander(jp, i));
      }
      for (const b of S.bolts) {
        ctx.globalAlpha = b.life / 0.35;
        ctx.strokeStyle = '#d6b8ff'; ctx.lineWidth = 12; ctx.lineJoin = 'round'; ctx.beginPath(); b.pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.stroke(); ctx.globalAlpha = 1;
      }
      for (const q of S.parts) { ctx.globalAlpha = Math.max(0, q.life / q.max); ctx.fillStyle = q.col; star5(ctx, q.x, q.y, q.size * 1.5, q.size * 0.6); ctx.fill(); }
      ctx.globalAlpha = 1;
      if (S.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, S.flash)})`; ctx.fillRect(-20, -20, W + 40, H + 40); }
      ctx.restore();
    };
    const drawStage = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#2b5fb8'); g.addColorStop(0.45, '#7cc3ff'); g.addColorStop(1, '#cfeeff');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      [[0.15, 0.18, 1], [0.8, 0.26, 0.8], [0.5, 0.1, 0.6]].forEach(([x, y, s]) => { ctx.beginPath(); ctx.ellipse(x * W, y * H, 60 * s, 18 * s, 0, 0, TAU); ctx.fill(); });
      // 浮島舞台
      const cy = n === 1 ? H * 0.7 : H * 0.62, rx = W * 0.62, ry = n === 1 ? H * 0.14 : H * 0.26;
      ctx.fillStyle = '#5b4632'; ctx.beginPath(); ctx.moveTo(W / 2 - rx, cy); ctx.quadraticCurveTo(W / 2, cy + ry * 2.4, W / 2 + rx, cy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5fae4f'; ctx.beginPath(); ctx.ellipse(W / 2, cy, rx, ry, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#3f8a3a'; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.ellipse(W / 2, cy - ry * 0.2, rx * 0.8, ry * 0.6, 0, 0, TAU); ctx.fill();
    };
    const drawLander = (jp, i) => {
      const t = S.t, pp = pedPos(i), ls = T_JUMP_END + 0.25 + i * landGap;
      const sc = n === 1 ? 1 : 0.62;
      const pr = 56 * sc, landed = t >= ls + 0.9, revealT = t - (ls + 0.9 + 0.2), revealed = revealT >= 0;
      // 底座
      const [c1, c2] = revealed ? PED_COL[jp.r] : ['#6c6f7a', '#a3a7b3'];
      ctx.fillStyle = c1; ctx.beginPath(); ctx.ellipse(pp.x, pp.y + 8 * sc, pr, pr * 0.36, 0, 0, TAU); ctx.fill();
      ctx.fillRect(pp.x - pr, pp.y - 2 * sc, pr * 2, 10 * sc);
      const tg = ctx.createRadialGradient(pp.x - pr * 0.3, pp.y - 6, 2, pp.x, pp.y, pr);
      tg.addColorStop(0, '#ffffff'); tg.addColorStop(0.35, c2); tg.addColorStop(1, c1);
      ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(pp.x, pp.y - 2 * sc, pr, pr * 0.36, 0, 0, TAU); ctx.fill();
      if (revealed) {
        ctx.globalAlpha = Math.min(1, revealT * 3) * (0.5 + 0.3 * Math.sin(t * 6));
        ctx.strokeStyle = c2; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(pp.x, pp.y - 2 * sc, pr + 6, (pr + 6) * 0.36, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
      }
      if (revealed && jp.r === 4) {
        const k = Math.min(1, revealT * 2);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const bw = pr * 0.9;
        const hue = (t * 140 + i * 40) % 360;
        const lg = ctx.createLinearGradient(pp.x - bw, 0, pp.x + bw, 0);
        lg.addColorStop(0, `hsla(${hue},100%,70%,0)`); lg.addColorStop(0.5, `hsla(${(hue + 60) % 360},100%,75%,${0.55 * k})`); lg.addColorStop(1, `hsla(${(hue + 120) % 360},100%,70%,0)`);
        ctx.fillStyle = lg; ctx.fillRect(pp.x - bw, 0, bw * 2, pp.y);
        ctx.restore();
      }
      // 角色
      if (t < ls) return;
      const k = Math.min(1, (t - ls) / 0.9);
      const y = lerp(-80, pp.y - 2 * sc, easeOut(k));
      const cs = n === 1 ? 1.9 : 0.95;
      if (!revealed) {
        if (k < 0.92) { ctx.save(); ctx.translate(pp.x, y); ctx.scale(cs * 0.85, cs * 0.85); drawChute(0, 0, jp.kind, t); ctx.restore(); }
        drawCloaked(ctx, pp.x, y, cs * 0.85, jp.kind, t + i);
        if (jp.f.bolt && t < ls + 1.6) { ctx.font = `${n === 1 ? 30 : 18}px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#3a1466'; ctx.strokeText('昇格！', pp.x, y - 90 * cs * 0.5); ctx.fillStyle = '#ffe066'; ctx.fillText('昇格！', pp.x, y - 90 * cs * 0.5); }
        return;
      }
      const c = CHAR_BY_ID[jp.id];
      const pop = Math.min(1, revealT * 4);
      ctx.save(); ctx.globalAlpha = pop;
      drawChibi(ctx, c, pp.x, pp.y - 2 * sc, { face: Math.PI / 2, t, scale: cs * (0.8 + 0.2 * easeOut(pop)) });
      ctx.restore();
      if (revealT < 0.4) { ctx.globalAlpha = 1 - revealT / 0.4; ctx.fillStyle = jp.r === 4 ? '#fff6c2' : '#ffffff'; ctx.beginPath(); ctx.arc(pp.x, pp.y - 30 * cs, 34 * cs * (1 + revealT * 2), 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
      ctx.textAlign = 'center';
      ctx.font = `${n === 1 ? 22 : 12}px ${FONT_UI}`; ctx.fillStyle = jp.r === 4 ? '#ffe066' : jp.r === 3 ? '#f2f6ff' : '#ffd0a8';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(20,20,40,0.75)';
      const stars = '★'.repeat(jp.r);
      ctx.strokeText(stars, pp.x, pp.y + pr * 0.36 + (n === 1 ? 24 : 12)); ctx.fillText(stars, pp.x, pp.y + pr * 0.36 + (n === 1 ? 24 : 12));
      if (n === 1) {
        ctx.font = `20px ${FONT_UI}`; ctx.fillStyle = '#ffffff'; ctx.strokeText(`${c.title}　${c.name}`, pp.x, pp.y + 76); ctx.fillText(`${c.title}　${c.name}`, pp.x, pp.y + 76);
      }
      if (n > 1) { if (!jp.dup) { ctx.font = `10px ${FONT_NUM}`; ctx.fillStyle = '#ff6b8a'; ctx.strokeText('NEW', pp.x + 24, pp.y - 56); ctx.fillText('NEW', pp.x + 24, pp.y - 56); } return; }
      const tag = jp.dup ? `→${RAINBOW.find((r) => r.k === jp.convert).name}` : 'NEW';
      ctx.font = `${n === 1 ? 15 : 10}px ${jp.dup ? FONT_UI : FONT_NUM}`; ctx.fillStyle = jp.dup ? '#9fe6ff' : '#ff6b8a';
      const ty = pp.y - (n === 1 ? 130 : 66);
      ctx.strokeText(tag, pp.x, ty); ctx.fillText(tag, pp.x, ty);
    };
    const drawIntro = () => {
      const i = S.intros[S.introIdx], jp = results[i], c = CHAR_BY_ID[jp.id], k = Math.min(1, S.introT / 0.5);
      const g = ctx.createRadialGradient(W / 2, H * 0.4, 10, W / 2, H * 0.4, H * 0.8);
      g.addColorStop(0, '#fff3b0'); g.addColorStop(0.35, '#e0a020'); g.addColorStop(1, '#2a1650');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(W / 2, H * 0.4); ctx.rotate(S.introT * 0.3);
      for (let r = 0; r < 16; r++) { ctx.rotate(TAU / 16); ctx.fillStyle = r % 2 ? 'rgba(255,255,255,0.12)' : 'rgba(255,220,120,0.12)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-40, -H); ctx.lineTo(40, -H); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      const size = Math.min(W * 0.95, H * 0.55);
      const im = imgs[i];
      ctx.save(); ctx.globalAlpha = k;
      const x = W / 2 - size / 2 + (1 - easeOut(k)) * 120, y = H * 0.1;
      ctx.beginPath(); ctx.arc(W / 2, y + size / 2, size / 2, 0, TAU); ctx.clip();
      if (im.complete && im.naturalWidth) ctx.drawImage(im, x, y, size, size);
      ctx.restore();
      ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 4; ctx.globalAlpha = k; ctx.beginPath(); ctx.arc(W / 2, H * 0.1 + size / 2, size / 2, 0, TAU); ctx.stroke();
      const by = H * 0.1 + size + 30;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `26px ${FONT_UI}`; ctx.fillStyle = '#ffe066'; ctx.lineWidth = 5; ctx.strokeStyle = '#3a1466';
      ctx.strokeText('★★★★', W / 2, by); ctx.fillText('★★★★', W / 2, by);
      ctx.font = `16px ${FONT_UI}`; ctx.fillStyle = '#fff'; ctx.strokeText(c.title, W / 2, by + 30); ctx.fillText(c.title, W / 2, by + 30);
      ctx.font = `40px ${FONT_UI}`; ctx.strokeText(c.name, W / 2, by + 70); ctx.fillText(c.name, W / 2, by + 70);
      ctx.font = `14px ${FONT_UI}`; ctx.fillStyle = CLS[c.cls].color; ctx.strokeText(`${CLS[c.cls].name}（${CLS[c.cls].attr}屬性）`, W / 2, by + 104); ctx.fillText(`${CLS[c.cls].name}（${CLS[c.cls].attr}屬性）`, W / 2, by + 104);
      ctx.font = `15px ${jp.dup ? FONT_UI : FONT_NUM}`; ctx.fillStyle = jp.dup ? '#9fe6ff' : '#ff8fb0';
      const tag = jp.dup ? '已擁有 → 虹之星 +1' : 'NEW!';
      ctx.strokeText(tag, W / 2, by + 132); ctx.fillText(tag, W / 2, by + 132);
      ctx.globalAlpha = 1;
    };
    let raf, last = performance.now();
    const loop = (now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; step(dt); if (S.phase !== 'end') { draw(); raf = requestAnimationFrame(loop); } };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); ['touchstart', 'touchmove', 'touchend'].forEach((nm) => wrapEl.removeEventListener(nm, tBlock)); };
  }, []);

  const tap = () => {
    const S = stRef.current; if (!S) return;
    SFX.click();
    if (S.phase === 'intro') {
      if (S.introT < 0.4) return;
      S.introIdx++; S.introT = 0;
      if (S.introIdx >= S.intros.length) finish(); else SFX.levelUp();
      return;
    }
    const { T_SKY, T_JUMP_END, T_LAND_END } = S.T;
    if (S.t < T_JUMP_END - 0.3) {
      S.t = T_JUMP_END;
      S.j.forEach((jp) => { jp.f.jump = jp.f.chute = true; });
    } else if (S.t < T_LAND_END - 1.2) {
      const target = T_LAND_END - 1.2;
      S.j.forEach((jp) => { if (jp.promote && !jp.f.bolt) { jp.kind = 'rainbow'; jp.f.bolt = true; S.flash = 0.8; SFX.thunder(); } jp.f.land = true; });
      if (!S.fanfared && S.j.some((jp) => jp.r === 4)) { S.fanfared = true; SFX.fanfare(); }
      S.t = target;
    }
  };
  return (
    <div ref={wrapRef} className="absolute inset-0 z-40 select-none" style={{ touchAction: 'none' }} onPointerDown={tap}>
      <canvas ref={cvRef} className="block w-full h-full" />
      <div className="absolute left-0 right-0 flex items-center justify-between px-4 pointer-events-none" style={{ bottom: 'calc(16px + var(--sab, 0px))' }}>
        <span className="text-[12px] text-white/90 bg-black/30 rounded-full px-3 py-1">{prompt}</span>
        <button className="pointer-events-auto text-[13px] font-bold text-[#1a1530] bg-white/90 rounded-full px-4 py-1.5 active:scale-95" onPointerDown={(e) => { e.stopPropagation(); SFX.click(); finish(); }}>略過</button>
      </div>
    </div>
  );
}
