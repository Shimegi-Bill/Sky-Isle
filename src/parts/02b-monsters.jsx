
/* ============================================================
 * 6b. 怪物（精緻版）
 * ============================================================ */
function drawCrown(ctx, x, y, w) {
  const h = w * 0.6;
  ctx.fillStyle = lgrad(ctx, 0, y - h, 0, y + 2, ['#fff3b0', '#f2b632', '#b8781a']);
  ctx.beginPath(); ctx.moveTo(x - w / 2, y + 1); ctx.lineTo(x - w / 2, y - h * 0.55); ctx.lineTo(x - w / 4, y - h * 0.2); ctx.lineTo(x, y - h); ctx.lineTo(x + w / 4, y - h * 0.2); ctx.lineTo(x + w / 2, y - h * 0.55); ctx.lineTo(x + w / 2, y + 1); ctx.closePath(); ctx.fill(); olS(ctx, 0.8);
  ctx.fillStyle = '#e8384f'; ctx.beginPath(); ctx.arc(x, y - h * 0.15, w * 0.1, 0, TAU); ctx.fill();
  ctx.fillStyle = '#3fb8ff'; ctx.beginPath(); ctx.arc(x - w * 0.3, y - h * 0.05, w * 0.07, 0, TAU); ctx.arc(x + w * 0.3, y - h * 0.05, w * 0.07, 0, TAU); ctx.fill();
}

/* ---------- 史萊姆：按場景變化（草原嫩芽／峽谷岩殼／神殿水晶／火山熔岩） ---------- */
function drawSlime(ctx, e, t) {
  const crouch = e.state === 'leap' && e.t < 0.42;
  const sq = crouch ? 0.72 + Math.sin(t * 40) * 0.03 : e.state === 'hop' ? 1 + Math.sin((e.t / e.hopDur) * Math.PI) * 0.18 : e.state === 'leap' ? 1.15 : 1 + Math.sin(t * 5 + e.id) * 0.05;
  const z = e.z || 0, r = e.r, col = e.color || '#5fd38d', flash = e.flash > 0;
  const theme = Object.keys(SLIME_COL).find((k) => SLIME_COL[k] === col) || 'grass';
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(e.x, e.y, r * 1.05 * (1 - z / 70), r * 0.4, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(e.x, e.y - z); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const w = r * 1.12 * (2 - sq), h = r * 1.62 * sq, wob = Math.sin(t * 6 + e.id) * r * 0.06;
  const body = () => { ctx.beginPath(); ctx.moveTo(-w, 0); ctx.bezierCurveTo(-w * 1.02, -h * 0.58, -w * 0.62 + wob, -h, wob, -h); ctx.bezierCurveTo(w * 0.62 + wob, -h, w * 1.02, -h * 0.58, w, 0); ctx.quadraticCurveTo(0, h * 0.1, -w, 0); ctx.closePath(); };
  // 熔岩史萊姆背後火星
  if (theme === 'lava' && !flash) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { const k = (t * 0.9 + i / 3 + e.id * 0.13) % 1; ctx.globalAlpha = (1 - k) * 0.8; ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.arc(Math.sin(i * 2.3 + t) * w * 0.6, -h * 0.6 - k * r * 1.8, 1.6 * (1 - k) + 0.6, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  const g = ctx.createRadialGradient(-w * 0.35, -h * 0.75, 1, 0, -h * 0.45, r * 1.5);
  g.addColorStop(0, shade(col, 0.6)); g.addColorStop(0.45, col); g.addColorStop(1, shade(col, -0.35));
  ctx.fillStyle = flash ? '#ffffff' : g; body(); ctx.fill();
  ctx.strokeStyle = shade(col, -0.55); ctx.lineWidth = 1.3; ctx.stroke();
  if (!flash) {
    ctx.save(); body(); ctx.clip();
    // 內核同氣泡
    ctx.globalAlpha = 0.28; ctx.fillStyle = shade(col, 0.7); ctx.beginPath(); ctx.ellipse(w * 0.15, -h * 0.35, w * 0.45, h * 0.3, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.55; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) { const k = (t * 0.35 + i * 0.33 + e.id * 0.07) % 1; ctx.beginPath(); ctx.arc(Math.sin(i * 1.9) * w * 0.5, -h * (0.1 + k * 0.7), 1 + i * 0.5, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1;
    if (theme === 'lava') {
      ctx.fillStyle = 'rgba(60,20,20,0.55)'; [[-0.5, -0.55, 0.32], [0.4, -0.75, 0.26], [0.1, -0.25, 0.3]].forEach(([px, py, pr]) => { ctx.beginPath(); ctx.ellipse(px * w, py * h, pr * w, pr * h * 0.6, 0.3, 0, TAU); ctx.fill(); });
      ctx.strokeStyle = `rgba(255,${200 + 40 * Math.sin(t * 6) | 0},90,0.9)`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-w * 0.7, -h * 0.4); ctx.lineTo(-w * 0.3, -h * 0.5); ctx.lineTo(0, -h * 0.35); ctx.lineTo(w * 0.4, -h * 0.45); ctx.stroke();
    } else if (theme === 'canyon') {
      ctx.fillStyle = 'rgba(120,60,20,0.35)'; [[-0.55, -0.4], [0.45, -0.3], [-0.1, -0.8], [0.3, -0.7]].forEach(([px, py]) => { ctx.beginPath(); ctx.arc(px * w, py * h, r * 0.12, 0, TAU); ctx.fill(); });
    } else if (theme === 'temple') {
      ctx.globalAlpha = 0.35; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-w * 0.6, -h * 0.2); ctx.lineTo(-w * 0.2, -h * 0.6); ctx.lineTo(w * 0.3, -h * 0.4); ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.restore();
    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.ellipse(-w * 0.42, -h * 0.72, w * 0.18, h * 0.1, -0.6, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(-w * 0.18, -h * 0.86, 1.3, 0, TAU); ctx.fill();
  }
  // 頭頂裝飾
  const topY = -h;
  if (theme === 'grass') {
    const sw = Math.sin(t * 4 + e.id) * 0.25;
    ctx.save(); ctx.translate(wob, topY + 1); ctx.rotate(sw);
    ctx.strokeStyle = '#3f8a3a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -4); ctx.stroke();
    ctx.fillStyle = '#7fd66a'; ctx.beginPath(); ctx.ellipse(-3, -5, 3.5, 1.7, 0.5, 0, TAU); ctx.fill(); olS(ctx, 0.6); ctx.beginPath(); ctx.ellipse(3, -5.5, 3.5, 1.7, -0.5, 0, TAU); ctx.fill(); olS(ctx, 0.6);
    ctx.restore();
  } else if (theme === 'canyon') {
    ctx.fillStyle = lgrad(ctx, 0, topY - 7, 0, topY + 2, ['#d9b98a', '#8a6a48']);
    poly(ctx, [[wob - 6, topY + 2.5], [wob - 4, topY - 4], [wob - 1, topY + 1]]); ctx.fill(); olS(ctx, 0.7);
    poly(ctx, [[wob + 0.5, topY + 1.5], [wob + 3, topY - 6.5], [wob + 6, topY + 2.5]]); ctx.fill(); olS(ctx, 0.7);
  } else if (theme === 'temple') {
    const fy = topY - 7 + Math.sin(t * 3 + e.id) * 1.5;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5; const cg = ctx.createRadialGradient(wob, fy, 0, wob, fy, 8); cg.addColorStop(0, '#bfe9ff'); cg.addColorStop(1, 'rgba(100,180,255,0)'); ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(wob, fy, 8, 0, TAU); ctx.fill(); ctx.restore();
    ctx.fillStyle = lgrad(ctx, wob - 3, fy - 5, wob + 3, fy + 5, ['#ffffff', '#8fd0ff', '#3a7bd5']); poly(ctx, [[wob, fy - 5.5], [wob + 3.2, fy], [wob, fy + 5.5], [wob - 3.2, fy]]); ctx.fill(); olS(ctx, 0.7);
  } else if (theme === 'lava') {
    ctx.fillStyle = '#3a2420'; poly(ctx, [[wob - 5, topY + 2], [wob - 2, topY - 3], [wob + 1, topY + 1], [wob + 4, topY - 2], [wob + 6, topY + 3]]); ctx.fill(); olS(ctx, 0.6);
  }
  // 臉
  const fy0 = -h * 0.48, ex = r * 0.34 + wob * 0.5;
  if (crouch) {
    ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.ellipse(-ex + wob * 0.5, fy0, 2.4, 2, 0, 0, TAU); ctx.ellipse(ex + wob * 0.5, fy0, 2.4, 2, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#1b2433'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-ex - 3, fy0 - 4.5); ctx.lineTo(-ex + 2.5, fy0 - 2.5); ctx.moveTo(ex + 3, fy0 - 4.5); ctx.lineTo(ex - 2.5, fy0 - 2.5); ctx.stroke();
    ctx.fillStyle = '#5a1020'; ctx.beginPath(); ctx.ellipse(wob * 0.5, fy0 + 5, 3, 2, 0, 0, TAU); ctx.fill();
  } else {
    for (const sx of [-1, 1]) {
      const x0 = sx * ex + wob * 0.5;
      ctx.fillStyle = '#1b2433'; ctx.beginPath(); ctx.ellipse(x0, fy0, 2.4, 3.4, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x0 - 0.7, fy0 - 1.3, 1, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(x0 + 0.8, fy0 + 1.2, 0.5, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,110,140,0.4)'; ctx.beginPath(); ctx.ellipse(-ex - 3.2 + wob * 0.5, fy0 + 3.6, 2.2, 1.2, 0, 0, TAU); ctx.ellipse(ex + 3.2 + wob * 0.5, fy0 + 3.6, 2.2, 1.2, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#1b2433'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-2 + wob * 0.5, fy0 + 3.5); ctx.quadraticCurveTo(-1 + wob * 0.5, fy0 + 4.8, wob * 0.5, fy0 + 3.6); ctx.quadraticCurveTo(1 + wob * 0.5, fy0 + 4.8, 2 + wob * 0.5, fy0 + 3.5); ctx.stroke();
  }
  if (e.elite) drawCrown(ctx, wob, topY - (theme === 'temple' ? 12 : 4), 13);
  ctx.restore();
}

/* ---------- 骷髏弓手：破爛兜帽、箭筒、反曲弓 ---------- */
function drawSkeleton(ctx, e, t) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(e.x, e.y, 12, 5, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(e.x, e.y - (e.z || 0)); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const flip = Math.cos(e.state === 'aim' ? e.aimAng : e.face) < 0 ? -1 : 1, aim = e.state === 'aim', flash = e.flash > 0;
  const bob = Math.sin(t * 6 + e.id) * 1;
  const bone = flash ? '#ffffff' : '#efe8d6', boneD = '#b8ad94', cloth = flash ? '#ffffff' : '#4a3b5c';
  ctx.scale(flip, 1);
  // 箭筒（背後）
  ctx.save(); ctx.translate(-6, -24 - bob); ctx.rotate(-0.35);
  ctx.fillStyle = '#6b4a2e'; rrect(ctx, -3, -2, 6, 15, 2); ctx.fill(); olS(ctx, 0.8);
  for (let i = 0; i < 3; i++) { ctx.strokeStyle = '#d9c9a8'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-1.5 + i * 1.5, -2); ctx.lineTo(-1.5 + i * 1.5, -6); ctx.stroke(); ctx.fillStyle = '#e04a4a'; poly(ctx, [[-2.5 + i * 1.5, -6], [-1.5 + i * 1.5, -9], [-0.5 + i * 1.5, -6]]); ctx.fill(); }
  ctx.restore();
  // 腿骨
  ctx.strokeStyle = OL; ctx.lineWidth = 4.4; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-2.5, -10); ctx.moveTo(4, 0); ctx.lineTo(2.5, -10); ctx.stroke();
  ctx.strokeStyle = bone; ctx.lineWidth = 2.6; ctx.stroke();
  ctx.fillStyle = '#3a2c44'; rrect(ctx, -6, -2, 4.5, 2.6, 1); ctx.fill(); rrect(ctx, 1.8, -2, 4.5, 2.6, 1); ctx.fill();
  // 破爛斗篷
  const fl = Math.sin(t * 5 + e.id) * 1.2;
  ctx.fillStyle = lgrad(ctx, 0, -30, 0, -6, [shade('#4a3b5c', 0.15), cloth, shade('#4a3b5c', -0.3)]);
  ctx.beginPath(); ctx.moveTo(-6, -27 - bob); ctx.quadraticCurveTo(-10, -18, -9 + fl, -8); ctx.lineTo(-7 + fl, -11); ctx.lineTo(-5 + fl, -6.5); ctx.lineTo(-3, -10); ctx.lineTo(-1, -7); ctx.lineTo(0, -12); ctx.lineTo(-1, -27 - bob); ctx.closePath(); ctx.fill(); olS(ctx, 0.8);
  // 肋骨
  ctx.strokeStyle = OL; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(0.5, -10); ctx.lineTo(0.5, -25 - bob); ctx.stroke(); ctx.strokeStyle = bone; ctx.lineWidth = 2; ctx.stroke();
  for (let i = 0; i < 3; i++) { const yy = -14.5 - i * 3.4 - bob; ctx.strokeStyle = OL; ctx.lineWidth = 2.8; ctx.beginPath(); ctx.moveTo(-4.5, yy + 0.8); ctx.quadraticCurveTo(0.5, yy - 1.5, 5.5, yy + 0.8); ctx.stroke(); ctx.strokeStyle = bone; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.fillStyle = bone; ctx.beginPath(); ctx.ellipse(0.5, -10, 4, 1.8, 0, 0, TAU); ctx.fill(); olS(ctx, 0.7);
  // 頭骨＋兜帽
  const hy = -32 - bob, jaw = aim ? 0 : Math.max(0, Math.sin(t * 9 + e.id)) * 1.2;
  ctx.fillStyle = bone; ctx.beginPath(); ctx.arc(1, hy, 7.6, 0, TAU); ctx.fill(); olS(ctx);
  ctx.fillStyle = boneD; rrect(ctx, -2.5, hy + 4 + jaw, 8, 3.6, 1.2); ctx.fill(); olS(ctx, 0.7);
  ctx.strokeStyle = OL; ctx.lineWidth = 0.6; ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.moveTo(-1 + i * 1.8, hy + 4 + jaw); ctx.lineTo(-1 + i * 1.8, hy + 7 + jaw); } ctx.stroke();
  ctx.fillStyle = lgrad(ctx, 0, hy - 12, 0, hy + 4, [shade('#4a3b5c', 0.2), cloth]);
  ctx.beginPath(); ctx.moveTo(-9, hy + 5); ctx.quadraticCurveTo(-11, hy - 9, -2, hy - 11.5); ctx.quadraticCurveTo(4, hy - 13, 9, hy - 6); ctx.quadraticCurveTo(5, hy - 8, 3, hy - 5.5); ctx.quadraticCurveTo(-4, hy - 7, -5, hy + 1); ctx.lineTo(-6, hy + 6); ctx.closePath(); ctx.fill(); olS(ctx, 0.8);
  // 眼窩發光
  const ec = aim ? '#ff3b3b' : '#ffb347';
  ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.ellipse(0.5, hy + 0.5, 2.3, 2.6, 0, 0, TAU); ctx.ellipse(5.6, hy + 0.5, 2, 2.4, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = ec; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(0.8, hy + 0.8, 1.1, 0, TAU); ctx.arc(5.8, hy + 0.8, 1, 0, TAU); ctx.fill();
  ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(0.8, hy + 0.8, 3.2, 0, TAU); ctx.arc(5.8, hy + 0.8, 3, 0, TAU); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#1a1020'; poly(ctx, [[3, hy + 2.6], [2.2, hy + 4], [3.8, hy + 4]]); ctx.fill();
  // 弓（朝瞄準方向）
  const ba = aim ? e.aimAng : e.face, lang = flip > 0 ? ba : Math.PI - ba;
  ctx.save(); ctx.translate(1, -19 - bob); ctx.rotate(lang);
  const pull = aim ? Math.min(1, e.t / Math.max(0.2, (e.aimDur || 0.6) - 0.1)) * 7 : 0;
  // 手臂
  ctx.strokeStyle = OL; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(8, 0); ctx.moveTo(-2, 2); ctx.lineTo(12 - pull, 0.5); ctx.stroke();
  ctx.strokeStyle = bone; ctx.lineWidth = 1.7; ctx.stroke();
  ctx.strokeStyle = OL; ctx.lineWidth = 3.8; ctx.beginPath(); ctx.moveTo(10, -12); ctx.quadraticCurveTo(14, -10, 13, -5); ctx.quadraticCurveTo(10, 0, 13, 5); ctx.quadraticCurveTo(14, 10, 10, 12); ctx.stroke();
  ctx.strokeStyle = '#7a4a22'; ctx.lineWidth = 2.3; ctx.stroke();
  ctx.fillStyle = bone; ctx.beginPath(); ctx.arc(10, -12, 1.4, 0, TAU); ctx.arc(10, 12, 1.4, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(10, -12); ctx.lineTo(12.5 - pull, 0); ctx.lineTo(10, 12); ctx.stroke();
  if (aim) {
    ctx.strokeStyle = '#d9c9a8'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(12.5 - pull, 0); ctx.lineTo(31 - pull, 0); ctx.stroke();
    ctx.fillStyle = '#ff5d4d'; poly(ctx, [[34 - pull, 0], [30 - pull, -2.2], [30 - pull, 2.2]]); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.4 + 0.4 * (pull / 7); ctx.fillStyle = '#ff6a4a'; ctx.beginPath(); ctx.arc(32 - pull, 0, 4 + pull * 0.3, 0, TAU); ctx.fill(); ctx.restore();
  }
  ctx.restore();
  if (e.elite) drawCrown(ctx, 0, hy - 11, 10);
  ctx.restore();
}

/* ---------- 骷髏劍士：角盔、紅羽、鳶盾、闊劍 ---------- */
function drawKnight(ctx, e, t) {
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(e.x, e.y, 14, 5.5, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(e.x, e.y); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const flip = Math.cos(e.face) < 0 ? -1 : 1, guard = e.state === 'guard', cast = e.state === 'cast', thrust = e.state === 'charge', flash = e.flash > 0;
  const bob = guard ? Math.sin(t * 7 + e.id) * 1 : 0;
  const bone = flash ? '#ffffff' : '#efe8d6';
  const steel = (a, b, c2) => (flash ? '#ffffff' : lgrad(ctx, 0, a, 0, b, c2 || ['#c9d2e4', '#7d889f', '#4d5568']));
  ctx.scale(flip, 1);
  // 披風
  const fl = Math.sin(t * 5 + e.id) * 1.5;
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, -28, 0, 0, ['#8a2a3a', '#5b1a28']);
  ctx.beginPath(); ctx.moveTo(-6, -27 - bob); ctx.quadraticCurveTo(-15, -15, -12 + fl, -1); ctx.lineTo(-9 + fl, -4); ctx.lineTo(-6.5 + fl, 0); ctx.lineTo(-4, -4); ctx.lineTo(2, -3); ctx.lineTo(3, -26 - bob); ctx.closePath(); ctx.fill(); olS(ctx, 0.8);
  // 腿
  ctx.strokeStyle = OL; ctx.lineWidth = 4.6; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-2, -10); ctx.moveTo(4, 0); ctx.lineTo(2, -10); ctx.stroke();
  ctx.strokeStyle = bone; ctx.lineWidth = 2.8; ctx.stroke();
  ctx.fillStyle = steel(-4, 0); rrect(ctx, -6.5, -3.5, 5, 3.8, 1.2); ctx.fill(); olS(ctx, 0.7); rrect(ctx, 1.5, -3.5, 5, 3.8, 1.2); ctx.fill(); olS(ctx, 0.7);
  // 胸甲
  ctx.fillStyle = steel(-27, -9); rrect(ctx, -7.5, -27 - bob, 15, 17, 4.5); ctx.fill(); olS(ctx);
  if (!flash) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-5.5, -25 - bob, 2.4, 12);
    ctx.fillStyle = '#e8dcc0'; ctx.beginPath(); ctx.arc(1, -20 - bob, 2.6, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a1f2f'; ctx.beginPath(); ctx.arc(0, -20.3 - bob, 0.8, 0, TAU); ctx.arc(2, -20.3 - bob, 0.8, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4a3020'; ctx.fillRect(-7.5, -12.5 - bob, 15, 2.2); ctx.fillStyle = '#c9a14a'; ctx.fillRect(-1.2, -13 - bob, 2.4, 3.2);
  }
  // 肩甲（尖刺）
  ctx.fillStyle = steel(-30, -22); ctx.beginPath(); ctx.ellipse(6.5, -25.5 - bob, 4.6, 3.4, 0.2, 0, TAU); ctx.fill(); olS(ctx, 0.8);
  ctx.fillStyle = '#d9dee8'; poly(ctx, [[5, -28 - bob], [7.5, -33 - bob], [9, -27.5 - bob]]); ctx.fill(); olS(ctx, 0.6);
  // 頭骨＋角盔
  const hy = -34 - bob;
  ctx.fillStyle = bone; ctx.beginPath(); ctx.arc(1.5, hy + 1, 7.4, 0, TAU); ctx.fill(); olS(ctx);
  ctx.fillStyle = steel(hy - 10, hy + 2); ctx.beginPath(); ctx.arc(1.5, hy - 0.5, 8.8, Math.PI * 0.95, Math.PI * 2.05); ctx.lineTo(10, hy + 3); ctx.lineTo(7, hy + 1); ctx.lineTo(-3, hy + 1); ctx.lineTo(-7, hy + 3.5); ctx.closePath(); ctx.fill(); olS(ctx);
  // 角
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, hy - 14, 0, hy - 4, ['#2a2433', '#e8dcc0']);
  ctx.beginPath(); ctx.moveTo(-5, hy - 6); ctx.quadraticCurveTo(-13, hy - 8, -12, hy - 16); ctx.quadraticCurveTo(-9, hy - 10, -3, hy - 8.5); ctx.closePath(); ctx.fill(); olS(ctx, 0.7);
  ctx.beginPath(); ctx.moveTo(7, hy - 7); ctx.quadraticCurveTo(14, hy - 9, 13.5, hy - 17); ctx.quadraticCurveTo(11, hy - 11, 5, hy - 9.5); ctx.closePath(); ctx.fill(); olS(ctx, 0.7);
  // 紅羽
  const pw = Math.sin(t * 6 + e.id) * 1.2;
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, hy - 18, 0, hy - 8, ['#ff6a5a', '#a8222a']);
  ctx.beginPath(); ctx.moveTo(1, hy - 8.5); ctx.quadraticCurveTo(-3, hy - 17, -12 + pw, hy - 15); ctx.quadraticCurveTo(-7, hy - 12, -9 + pw, hy - 9); ctx.quadraticCurveTo(-4, hy - 10, 1, hy - 7); ctx.closePath(); ctx.fill(); olS(ctx, 0.7);
  // 面罩縫＋眼光
  ctx.fillStyle = '#1a1020'; rrect(ctx, -2.5, hy - 1.5, 10, 3.6, 1.5); ctx.fill();
  const ec = cast || thrust ? '#ff4d4d' : '#7fd6ff';
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = ec; ctx.globalAlpha = 0.95; ctx.beginPath(); ctx.arc(0, hy + 0.3, 1.1, 0, TAU); ctx.arc(5, hy + 0.3, 1.1, 0, TAU); ctx.fill();
  ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.ellipse(2.5, hy + 0.3, 6.5, 2.8, 0, 0, TAU); ctx.fill(); ctx.restore();
  ctx.strokeStyle = bone; ctx.lineWidth = 0.8; ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.moveTo(-0.5 + i * 2, hy + 5.5); ctx.lineTo(-0.5 + i * 2, hy + 7.5); } ctx.stroke();
  // 劍
  const swing = cast ? -2.3 + Math.min(1, e.t / Math.max(0.3, e.castDur || 0.7)) * 0.5 : thrust ? 0 : -0.9;
  ctx.save(); ctx.translate(guard ? -4 : 6, -18 - bob); ctx.rotate(swing);
  if ((cast || thrust) && !flash) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 + 0.2 * Math.sin(t * 20);
    const sg = ctx.createLinearGradient(0, 0, 0, -32); sg.addColorStop(0, 'rgba(255,80,60,0)'); sg.addColorStop(1, 'rgba(255,90,60,0.9)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(0, -18, 6, 16, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  ctx.strokeStyle = OL; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(0, -3); ctx.stroke(); ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2.2; ctx.stroke();
  ctx.fillStyle = '#c9a14a'; rrect(ctx, -5, -4, 10, 2.8, 1); ctx.fill(); olS(ctx, 0.7);
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, -3, 0, 3, 0, ['#ffffff', '#c9d2e4', '#8a96ae']);
  poly(ctx, [[-2.6, -4], [2.6, -4], [2, -26], [0, -31], [-2, -26]]); ctx.fill(); olS(ctx, 0.8);
  ctx.strokeStyle = 'rgba(80,90,120,0.6)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, -26); ctx.stroke();
  ctx.restore();
  // 鳶盾
  ctx.save();
  if (guard) ctx.translate(9, -19 - bob); else ctx.translate(-8, -13);
  const sh = guard ? 1 : 0.85; ctx.scale(sh, sh);
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, -6, -12, 6, 12, ['#5a7ab8', '#2d4a80']);
  ctx.beginPath(); ctx.moveTo(-6.5, -11); ctx.quadraticCurveTo(0, -13, 6.5, -11); ctx.lineTo(6, 1); ctx.quadraticCurveTo(4, 9, 0, 13); ctx.quadraticCurveTo(-4, 9, -6, 1); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = OL; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = '#d9b44a'; ctx.lineWidth = 1.6; ctx.stroke();
  if (!flash) { ctx.fillStyle = '#e8dcc0'; ctx.beginPath(); ctx.arc(0, -2, 3, 0, TAU); ctx.fill(); ctx.fillRect(-1.8, 0, 3.6, 2.6); ctx.fillStyle = '#2a1f2f'; ctx.beginPath(); ctx.arc(-1.1, -2.2, 0.9, 0, TAU); ctx.arc(1.1, -2.2, 0.9, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-4, 4); ctx.lineTo(4, 8); ctx.moveTo(4, 4); ctx.lineTo(-4, 8); ctx.stroke(); }
  ctx.restore();
  if (guard) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.22 + 0.1 * Math.sin(t * 6); ctx.strokeStyle = '#9fd7ff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(4, -19, 18, -1.1, 1.1); ctx.stroke(); ctx.restore(); }
  if (e.elite) drawCrown(ctx, 1.5, hy - 9, 10);
  ctx.restore();
}

/* ---------- 幽靈術士：瓷面具、幽靈觸手、浮空符文 ---------- */
function drawWisp(ctx, e, t) {
  const z = e.z || 12, blink = e.state === 'blink', cast = e.state === 'cast', flash = e.flash > 0;
  let alpha = 1;
  if (blink) alpha = e.t < 0.3 ? 1 - e.t / 0.3 : (e.t - 0.3) / 0.3;
  ctx.fillStyle = `rgba(0,0,0,${0.22 * alpha})`; ctx.beginPath(); ctx.ellipse(e.x, e.y, 11, 4, 0, 0, TAU); ctx.fill();
  // 詠唱魔法陣
  if (cast && !flash) {
    ctx.save(); ctx.translate(e.x, e.y); ctx.scale(1, 0.42); ctx.rotate(t * 2); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.7 * alpha;
    ctx.strokeStyle = '#b28cff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.stroke();
    star5(ctx, 0, 0, 21, 8); ctx.stroke();
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; ctx.fillStyle = '#e2d4ff'; ctx.fillRect(Math.cos(a) * 19 - 1, Math.sin(a) * 19 - 1, 2, 2); }
    ctx.restore();
  }
  ctx.save(); ctx.globalAlpha = clamp(alpha, 0, 1); ctx.translate(e.x, e.y - z); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (blink) ctx.scale(1 + (1 - alpha) * 0.4, 1 - (1 - alpha) * 0.3);
  const flip = Math.cos(e.face) < 0 ? -1 : 1; ctx.scale(flip, 1);
  const robe = flash ? '#ffffff' : '#3b2a6b', trim = '#b28cff';
  // 浮空符文（背後半圈）
  const rune = (front) => {
    for (let i = 0; i < 3; i++) {
      const a = t * 1.8 + (i * TAU) / 3, depth = Math.sin(a);
      if ((depth > 0) !== front) continue;
      const rx = Math.cos(a) * 17, ry = -20 + depth * 5;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.55 + depth * 0.25;
      ctx.strokeStyle = '#d8c4ff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(rx, ry, 3.2, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx - 1.6, ry - 1.4); ctx.lineTo(rx + 1.6, ry - 1.4); ctx.lineTo(rx, ry + 1.8); ctx.closePath(); ctx.stroke();
      ctx.restore();
    }
  };
  rune(false);
  // 幽靈觸手拖尾
  const g = ctx.createLinearGradient(0, -36, 0, 8); g.addColorStop(0, flash ? '#ffffff' : '#4a3888'); g.addColorStop(0.6, flash ? '#ffffff' : robe); g.addColorStop(1, 'rgba(59,42,107,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -38); ctx.bezierCurveTo(12, -37, 14, -24, 12, -14);
  for (let i = 0; i <= 5; i++) { const x = 12 - i * 4.8, y = 3 + Math.sin(t * 7 + i * 1.3 + e.id) * 3 + (i % 2) * 3; ctx.quadraticCurveTo(x + 2.4, y - 6, x, y); }
  ctx.bezierCurveTo(-14, -24, -12, -37, 0, -38); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(30,20,46,0.6)'; ctx.lineWidth = 0.9; ctx.stroke();
  ctx.strokeStyle = trim; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-11, -18); ctx.quadraticCurveTo(0, -12, 11, -18); ctx.stroke();
  ctx.fillStyle = trim; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * 5, -15 + Math.abs(i), 1, 0, TAU); ctx.fill(); }
  // 幽靈手
  const hr = cast ? -6 : 0, hb = Math.sin(t * 3 + e.id) * 1.5;
  [[-13, -18 + hb + hr * 0.5], [13, -20 - hb + hr]].forEach(([hx, hy2], i) => {
    ctx.fillStyle = flash ? '#ffffff' : 'rgba(200,180,255,0.85)'; ctx.beginPath(); ctx.ellipse(hx, hy2, 2.8, 3.4, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(200,180,255,0.85)'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = -1; k <= 1; k++) { ctx.moveTo(hx + k * 1.4, hy2 - 2.5); ctx.lineTo(hx + k * 2.2, hy2 - 5.5); } ctx.stroke();
    if (i === 1 || cast) {
      const k = cast ? 1 + Math.sin(t * 20) * 0.25 : 0.65;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const og = ctx.createRadialGradient(hx, hy2 - 6, 0, hx, hy2 - 6, 9 * k); og.addColorStop(0, '#ffffff'); og.addColorStop(0.35, '#d0b4ff'); og.addColorStop(1, 'rgba(155,123,255,0)');
      ctx.fillStyle = og; ctx.beginPath(); ctx.arc(hx, hy2 - 6, 9 * k, 0, TAU); ctx.fill(); ctx.restore();
    }
  });
  // 兜帽
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, -46, 0, -26, ['#5a46a0', robe]);
  ctx.beginPath(); ctx.moveTo(-2, -47); ctx.quadraticCurveTo(10, -44, 10, -29); ctx.quadraticCurveTo(0, -24, -10, -29); ctx.quadraticCurveTo(-11, -40, -2, -47); ctx.closePath(); ctx.fill(); olS(ctx, 0.8);
  ctx.fillStyle = '#0d0820'; ctx.beginPath(); ctx.ellipse(1, -32, 7, 6, 0, 0, TAU); ctx.fill();
  // 瓷面具
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, -38, 0, -26, ['#ffffff', '#d9d4e8']);
  ctx.beginPath(); ctx.moveTo(-3.5, -37); ctx.quadraticCurveTo(6, -38.5, 7, -33); ctx.quadraticCurveTo(7, -27, 1.5, -25.5); ctx.quadraticCurveTo(-3.5, -27, -4, -32); ctx.closePath(); ctx.fill(); olS(ctx, 0.7);
  ctx.strokeStyle = '#9b5bd8'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-0.5, -29.5); ctx.lineTo(-1.5, -26.8); ctx.moveTo(4.5, -29.5); ctx.lineTo(5, -27); ctx.stroke();
  ctx.fillStyle = '#1a0f2e'; ctx.beginPath(); ctx.ellipse(-0.3, -32.5, 1.7, 1.1, -0.3, 0, TAU); ctx.ellipse(4.3, -32.5, 1.7, 1.1, 0.3, 0, TAU); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = cast ? '#ff6bd5' : '#c9b2ff'; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(-0.3, -32.5, 0.9, 0, TAU); ctx.arc(4.3, -32.5, 0.9, 0, TAU); ctx.fill();
  ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(-0.3, -32.5, 3, 0, TAU); ctx.arc(4.3, -32.5, 3, 0, TAU); ctx.fill(); ctx.restore();
  rune(true);
  if (e.elite) drawCrown(ctx, -1, -46, 10);
  ctx.restore();
}

/* ---------- 頭目：牛頭人（雙刃巨斧、鼻環、肩甲、狂暴熔岩紋） ---------- */
function drawMinotaur(ctx, e, t) {
  const R = e.r, z = e.z || 0, zs = Math.max(0.4, 1 - z / 160), flash = e.flash > 0, en = e.enraged;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(e.x, e.y, R * 1.05 * zs, R * 0.4 * zs, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(e.x, e.y - z); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const flip = Math.cos(e.face) < 0 ? -1 : 1;
  const cast = e.state === 'cast', charge = e.state === 'charge', leap = e.state === 'leap', roar = e.state === 'roar';
  const bob = Math.sin(t * (en ? 9 : 5)) * 1.5;
  // 狂暴火焰氣場
  if (en && !flash) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const px = (i - 3) * R * 0.32, hgt = R * (1.4 + 0.5 * Math.sin(t * 8 + i * 1.9)), a = 0.22 + 0.12 * Math.sin(t * 11 + i);
      const fg = ctx.createLinearGradient(0, 0, 0, -hgt); fg.addColorStop(0, `rgba(255,90,30,${a})`); fg.addColorStop(1, 'rgba(255,40,20,0)');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(px - R * 0.3, 0); ctx.quadraticCurveTo(px - R * 0.15, -hgt * 0.6, px + Math.sin(t * 6 + i) * 6, -hgt); ctx.quadraticCurveTo(px + R * 0.15, -hgt * 0.6, px + R * 0.3, 0); ctx.fill();
    }
    ctx.restore();
  }
  ctx.scale(flip, 1);
  if (charge && e.t >= (e.chWind || 0.7)) ctx.rotate(0.16);
  if (roar) ctx.translate(Math.sin(t * 60) * 1.2, 0);
  const crouch = leap && e.t < 0.32 ? 1 : cast && e.t < 0.15 ? 0.5 : 0;
  const by = -bob + crouch * 4;
  const furBase = en ? '#8a3a2a' : '#7a4f33';
  const fur = flash ? '#ffffff' : furBase, furD = flash ? '#ffffff' : shade(furBase, -0.35), furL = flash ? '#ffffff' : shade(furBase, 0.28);
  const F = (y0, y1) => (flash ? '#ffffff' : lgrad(ctx, 0, y0, 0, y1, [furL, fur, furD]));
  // 後臂
  ctx.strokeStyle = OL; ctx.lineWidth = R * 0.34; ctx.beginPath(); ctx.moveTo(-R * 0.62, -R * 1.5 + by); ctx.quadraticCurveTo(-R * 0.95, -R * 1.2 + by, -R * 0.82, -R * 0.92 + by); ctx.stroke();
  ctx.strokeStyle = furD; ctx.lineWidth = R * 0.27; ctx.stroke();
  ctx.fillStyle = furD; ctx.beginPath(); ctx.arc(-R * 0.82, -R * 0.88 + by, R * 0.17, 0, TAU); ctx.fill(); olS(ctx);
  // 腿＋蹄
  for (const [lx, ph] of [[-R * 0.36, 0], [R * 0.3, Math.PI]]) {
    const st = e.state === 'idle' ? Math.sin(t * 6 + ph) * 2 : 0;
    ctx.fillStyle = F(-R * 0.6, 0); rrect(ctx, lx - R * 0.19, -R * 0.62 + st * 0.3, R * 0.38, R * 0.55, R * 0.14); ctx.fill(); olS(ctx);
    ctx.fillStyle = flash ? '#ffffff' : '#2a1d18'; rrect(ctx, lx - R * 0.21, -R * 0.14, R * 0.42, R * 0.16, R * 0.05); ctx.fill(); olS(ctx, 0.8);
    ctx.strokeStyle = '#5a4a40'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(lx, -R * 0.14); ctx.lineTo(lx, 0); ctx.stroke();
  }
  // 腰布
  const cw = Math.sin(t * 4) * 1.5;
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, -R * 0.8, 0, -R * 0.2, ['#c8302a', '#7a1414']);
  ctx.beginPath(); ctx.moveTo(-R * 0.3, -R * 0.78 + by); ctx.lineTo(R * 0.36, -R * 0.78 + by); ctx.lineTo(R * 0.28 + cw, -R * 0.22); ctx.lineTo(R * 0.04 + cw, -R * 0.3); ctx.lineTo(-R * 0.22 + cw, -R * 0.2); ctx.closePath(); ctx.fill(); olS(ctx, 0.9);
  // 軀幹
  ctx.fillStyle = F(-R * 1.75 + by, -R * 0.7 + by);
  ctx.beginPath(); ctx.moveTo(-R * 0.58, -R * 0.78 + by); ctx.bezierCurveTo(-R * 0.95, -R * 1.05 + by, -R * 0.98, -R * 1.55 + by, -R * 0.62, -R * 1.72 + by);
  ctx.quadraticCurveTo(0, -R * 1.92 + by, R * 0.72, -R * 1.7 + by); ctx.bezierCurveTo(R * 1.02, -R * 1.5 + by, R * 0.95, -R * 1.02 + by, R * 0.62, -R * 0.78 + by); ctx.closePath(); ctx.fill(); olS(ctx, 1.1);
  if (!flash) {
    // 胸毛同肌肉線
    ctx.fillStyle = shade(furBase, 0.42); ctx.beginPath(); ctx.ellipse(R * 0.08, -R * 1.18 + by, R * 0.42, R * 0.38, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = furD; ctx.lineWidth = 1.1; ctx.beginPath();
    ctx.moveTo(-R * 0.3, -R * 1.42 + by); ctx.quadraticCurveTo(-R * 0.05, -R * 1.3 + by, R * 0.06, -R * 1.42 + by); ctx.quadraticCurveTo(R * 0.2, -R * 1.3 + by, R * 0.46, -R * 1.42 + by);
    ctx.moveTo(R * 0.08, -R * 1.25 + by); ctx.lineTo(R * 0.08, -R * 0.88 + by); ctx.moveTo(-R * 0.1, -R * 1.1 + by); ctx.lineTo(R * 0.26, -R * 1.1 + by); ctx.moveTo(-R * 0.08, -R * 0.97 + by); ctx.lineTo(R * 0.24, -R * 0.97 + by);
    ctx.stroke();
    // 皮帶斜揹
    ctx.strokeStyle = OL; ctx.lineWidth = R * 0.16; ctx.beginPath(); ctx.moveTo(-R * 0.62, -R * 1.62 + by); ctx.lineTo(R * 0.6, -R * 0.86 + by); ctx.stroke();
    ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = R * 0.11; ctx.stroke();
    ctx.fillStyle = '#c9ced8'; for (let i = 0; i < 4; i++) { const k = 0.15 + i * 0.22; ctx.beginPath(); ctx.arc(lerp(-R * 0.62, R * 0.6, k), lerp(-R * 1.62, -R * 0.86, k) + by, 1.3, 0, TAU); ctx.fill(); }
    // 狂暴熔岩紋
    if (en) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,${150 + 60 * Math.sin(t * 7) | 0},60,0.95)`; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-R * 0.55, -R * 1.25 + by); ctx.lineTo(-R * 0.35, -R * 1.12 + by); ctx.lineTo(-R * 0.42, -R * 0.95 + by); ctx.moveTo(R * 0.55, -R * 1.35 + by); ctx.lineTo(R * 0.4, -R * 1.2 + by); ctx.lineTo(R * 0.5, -R * 1.05 + by); ctx.stroke(); ctx.restore();
    }
  }
  // 腰帶＋骷髏扣
  ctx.fillStyle = flash ? '#ffffff' : '#3a2418'; rrect(ctx, -R * 0.62, -R * 0.86 + by, R * 1.24, R * 0.16, 2); ctx.fill(); olS(ctx, 0.9);
  if (!flash) { ctx.fillStyle = '#e8dcc0'; ctx.beginPath(); ctx.arc(R * 0.05, -R * 0.78 + by, R * 0.12, 0, TAU); ctx.fill(); olS(ctx, 0.7); ctx.fillStyle = '#2a1f2f'; ctx.beginPath(); ctx.arc(R * 0.01, -R * 0.8 + by, 1.2, 0, TAU); ctx.arc(R * 0.09, -R * 0.8 + by, 1.2, 0, TAU); ctx.fill(); }
  // 頭
  const hx = R * 0.24, hyy = -R * 1.95 + by + (charge ? R * 0.12 : 0) + (roar ? -R * 0.05 : 0);
  // 耳
  ctx.fillStyle = furD; ctx.beginPath(); ctx.ellipse(hx - R * 0.48, hyy - R * 0.02, R * 0.16, R * 0.07, 0.4, 0, TAU); ctx.fill(); olS(ctx, 0.8); ctx.beginPath(); ctx.ellipse(hx + R * 0.5, hyy - R * 0.06, R * 0.15, R * 0.07, -0.4, 0, TAU); ctx.fill(); olS(ctx, 0.8);
  // 角
  const horn = (sx) => {
    ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, hyy - R * 0.75, 0, hyy - R * 0.1, ['#5a4a3a', '#d9caa8', '#f4ecd6']);
    ctx.beginPath(); const bx = hx + sx * R * 0.26;
    ctx.moveTo(bx - sx * R * 0.04, hyy - R * 0.22); ctx.bezierCurveTo(bx + sx * R * 0.55, hyy - R * 0.3, bx + sx * R * 0.72, hyy - R * 0.6, bx + sx * R * 0.5, hyy - R * 0.82);
    ctx.bezierCurveTo(bx + sx * R * 0.55, hyy - R * 0.58, bx + sx * R * 0.35, hyy - R * 0.42, bx + sx * R * 0.04, hyy - R * 0.38); ctx.closePath(); ctx.fill(); olS(ctx, 0.9);
    if (!flash) { ctx.strokeStyle = 'rgba(120,100,70,0.6)'; ctx.lineWidth = 0.8; ctx.beginPath(); for (let i = 1; i <= 3; i++) { const k = i / 4; ctx.moveTo(bx + sx * R * (0.1 + k * 0.45), hyy - R * (0.24 + k * 0.2)); ctx.lineTo(bx + sx * R * (0.14 + k * 0.42), hyy - R * (0.38 + k * 0.18)); } ctx.stroke(); }
  };
  horn(-1); horn(1);
  ctx.fillStyle = F(hyy - R * 0.45, hyy + R * 0.35); ctx.beginPath(); ctx.ellipse(hx, hyy, R * 0.46, R * 0.4, 0, 0, TAU); ctx.fill(); olS(ctx, 1);
  // 額毛
  if (!flash) { ctx.fillStyle = furD; ctx.beginPath(); ctx.moveTo(hx - R * 0.3, hyy - R * 0.22); ctx.lineTo(hx - R * 0.15, hyy - R * 0.42); ctx.lineTo(hx - R * 0.02, hyy - R * 0.25); ctx.lineTo(hx + R * 0.12, hyy - R * 0.44); ctx.lineTo(hx + R * 0.22, hyy - R * 0.24); ctx.lineTo(hx + R * 0.34, hyy - R * 0.36); ctx.lineTo(hx + R * 0.36, hyy - R * 0.16); ctx.closePath(); ctx.fill(); }
  // 口鼻
  const mx = hx + R * 0.2, my = hyy + R * 0.2;
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, my - R * 0.15, 0, my + R * 0.18, ['#e8c9a4', '#b8906a']); ctx.beginPath(); ctx.ellipse(mx, my, R * 0.26, R * 0.18, 0, 0, TAU); ctx.fill(); olS(ctx, 0.9);
  ctx.fillStyle = '#4a2a1a'; ctx.beginPath(); ctx.ellipse(mx - R * 0.09, my - R * 0.02, R * 0.045, R * 0.06, 0.3, 0, TAU); ctx.ellipse(mx + R * 0.1, my - R * 0.02, R * 0.045, R * 0.06, -0.3, 0, TAU); ctx.fill();
  if (roar || (cast && e.t > (e.castDur || 1) * 0.6)) { ctx.fillStyle = '#5a1018'; ctx.beginPath(); ctx.ellipse(mx, my + R * 0.16, R * 0.15, R * 0.09, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffffff'; poly(ctx, [[mx - R * 0.1, my + R * 0.1], [mx - R * 0.07, my + R * 0.16], [mx - R * 0.04, my + R * 0.1]]); ctx.fill(); poly(ctx, [[mx + R * 0.04, my + R * 0.1], [mx + R * 0.07, my + R * 0.16], [mx + R * 0.1, my + R * 0.1]]); ctx.fill(); }
  ctx.strokeStyle = OL; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.arc(mx, my + R * 0.1, R * 0.08, 0.1, Math.PI - 0.1); ctx.stroke();
  ctx.strokeStyle = flash ? '#ffffff' : '#ffd84d'; ctx.lineWidth = 1.8; ctx.stroke();
  // 眼＋眉
  const eyeCol = en || cast || roar ? '#ff3b2f' : '#ffcf3b';
  ctx.fillStyle = '#1a0a08'; ctx.beginPath(); ctx.ellipse(hx - R * 0.08, hyy - R * 0.05, R * 0.075, R * 0.055, 0, 0, TAU); ctx.ellipse(hx + R * 0.24, hyy - R * 0.07, R * 0.075, R * 0.055, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = eyeCol; ctx.globalAlpha = 0.95;
  ctx.beginPath(); ctx.arc(hx - R * 0.07, hyy - R * 0.05, R * 0.04, 0, TAU); ctx.arc(hx + R * 0.25, hyy - R * 0.07, R * 0.04, 0, TAU); ctx.fill();
  ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(hx - R * 0.07, hyy - R * 0.05, R * 0.13, 0, TAU); ctx.arc(hx + R * 0.25, hyy - R * 0.07, R * 0.13, 0, TAU); ctx.fill(); ctx.restore();
  ctx.strokeStyle = OL; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx - R * 0.2, hyy - R * 0.18); ctx.lineTo(hx + R * 0.02, hyy - R * 0.1); ctx.moveTo(hx + R * 0.36, hyy - R * 0.2); ctx.lineTo(hx + R * 0.15, hyy - R * 0.12); ctx.stroke();
  // 鼻孔噴氣
  if (!flash && (en || roar || (t * 0.7 + e.id) % 2.2 < 0.4)) {
    for (let i = 0; i < 2; i++) { const k = ((t * 1.6 + i * 0.5) % 1); ctx.fillStyle = `rgba(230,230,240,${0.4 * (1 - k)})`; ctx.beginPath(); ctx.arc(mx + R * 0.3 + k * R * 0.35, my - R * 0.02 + k * R * 0.1, R * (0.05 + k * 0.1), 0, TAU); ctx.fill(); }
  }
  // 肩甲（前肩）
  ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, -R * 1.85 + by, 0, -R * 1.35 + by, ['#e2e6ee', '#8a93a8', '#4d5568']);
  ctx.beginPath(); ctx.ellipse(R * 0.7, -R * 1.58 + by, R * 0.3, R * 0.22, 0.3, 0, TAU); ctx.fill(); olS(ctx, 0.9);
  ctx.fillStyle = flash ? '#ffffff' : '#d9dee8'; for (let i = 0; i < 3; i++) { const sx = R * (0.52 + i * 0.16); poly(ctx, [[sx - R * 0.06, -R * 1.72 + by + i * 2], [sx, -R * 1.98 + by + i * 3], [sx + R * 0.06, -R * 1.7 + by + i * 2]]); ctx.fill(); olS(ctx, 0.6); }
  // 巨斧
  const ck = cast ? Math.min(1, e.t / Math.max(0.3, e.castDur || 1)) : 0;
  let axeA = -2.25 + Math.sin(t * 2) * 0.08;
  if (cast) axeA = ck < 0.82 ? -2.25 - easeOut(ck / 0.82) * 1.0 : lerp(-3.25, -0.5, easeIn((ck - 0.82) / 0.18));
  else if (charge) axeA = -1.2; else if (leap) axeA = e.t < 0.32 ? -3.2 : -0.6; else if (roar) axeA = -3.0;
  ctx.save(); ctx.translate(R * 0.85, -R * 1.1 + by); ctx.rotate(axeA);
  const HL = R * 1.55;
  ctx.strokeStyle = OL; ctx.lineWidth = 6.2; ctx.beginPath(); ctx.moveTo(0, -R * 0.25); ctx.lineTo(0, HL); ctx.stroke();
  ctx.strokeStyle = flash ? '#ffffff' : '#5a3a22'; ctx.lineWidth = 4.2; ctx.stroke();
  ctx.strokeStyle = '#c9a14a'; ctx.lineWidth = 4.4; ctx.beginPath(); ctx.moveTo(0, HL * 0.35); ctx.lineTo(0, HL * 0.4); ctx.moveTo(0, HL * 0.78); ctx.lineTo(0, HL * 0.82); ctx.stroke();
  // 雙刃
  const blade = (sx) => {
    ctx.fillStyle = flash ? '#ffffff' : lgrad(ctx, 0, HL - R * 0.4, sx * R * 0.6, HL + R * 0.2, ['#f4f6fa', '#b8c0d0', '#6e7890']);
    ctx.beginPath(); ctx.moveTo(sx * 2, HL - R * 0.3); ctx.quadraticCurveTo(sx * R * 0.35, HL - R * 0.42, sx * R * 0.58, HL - R * 0.55);
    ctx.quadraticCurveTo(sx * R * 0.42, HL - R * 0.05, sx * R * 0.6, HL + R * 0.32); ctx.quadraticCurveTo(sx * R * 0.3, HL + R * 0.18, sx * 2, HL + R * 0.12); ctx.closePath(); ctx.fill(); olS(ctx, 1);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx * R * 0.56, HL - R * 0.48); ctx.quadraticCurveTo(sx * R * 0.42, HL - R * 0.05, sx * R * 0.56, HL + R * 0.26); ctx.stroke();
  };
  blade(1); blade(-1);
  ctx.fillStyle = flash ? '#ffffff' : '#4d5568'; ctx.beginPath(); ctx.arc(0, HL - R * 0.08, R * 0.1, 0, TAU); ctx.fill(); olS(ctx, 0.8);
  if (!flash && (en || cast)) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = en ? 0.75 : 0.45 + 0.4 * ck;
    ctx.strokeStyle = en ? '#ff7a3a' : '#ffd08a'; ctx.lineWidth = 1.2;
    ctx.beginPath(); for (let i = 0; i < 3; i++) { const yy = HL - R * 0.25 + i * R * 0.17; ctx.moveTo(R * 0.18, yy); ctx.lineTo(R * 0.3, yy + 2); ctx.lineTo(R * 0.22, yy + 4); ctx.moveTo(-R * 0.18, yy); ctx.lineTo(-R * 0.3, yy + 2); } ctx.stroke();
    const ag = ctx.createRadialGradient(0, HL, 0, 0, HL, R * 0.8); ag.addColorStop(0, en ? 'rgba(255,90,40,0.5)' : 'rgba(255,220,150,0.4)'); ag.addColorStop(1, 'rgba(255,80,40,0)'); ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(0, HL, R * 0.8, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  // 前臂＋拳（握斧）
  ctx.strokeStyle = OL; ctx.lineWidth = R * 0.36; ctx.beginPath(); ctx.moveTo(R * 0.66, -R * 1.5 + by); ctx.lineTo(R * 0.85, -R * 1.12 + by); ctx.stroke();
  ctx.strokeStyle = fur; ctx.lineWidth = R * 0.28; ctx.stroke();
  ctx.fillStyle = fur; ctx.beginPath(); ctx.arc(R * 0.85, -R * 1.1 + by, R * 0.17, 0, TAU); ctx.fill(); olS(ctx);
  ctx.fillStyle = flash ? '#ffffff' : '#3a2418'; rrect(ctx, R * 0.66, -R * 1.34 + by, R * 0.3, R * 0.1, 2); ctx.fill();
  ctx.restore();
}
