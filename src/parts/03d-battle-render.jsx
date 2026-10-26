
/* ---------- 03d 戰鬥繪圖 ---------- */
Object.assign(Battle.prototype, {
  render(ctx, dpr) {
    const W = this.cssW, H = this.cssH, p = this.p, t = this.time;
    const z = this.zoom * (1 + this.zoomPunch);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const T = THEMES[this.theme];
    ctx.fillStyle = T.edge; ctx.fillRect(0, 0, W, H);
    if (!this.pattern) this.pattern = makeGroundPattern(ctx, this.theme);
    const sx = this.shake > 0.3 ? rand(-this.shake, this.shake) : 0, sy = this.shake > 0.3 ? rand(-this.shake, this.shake) : 0;
    ctx.save();
    // 以畫面中心縮放（技能鏡頭推近）
    ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-this.viewW / 2, -this.viewH / 2);
    ctx.translate(-this.cam.x + sx, -this.cam.y + sy);
    ctx.fillStyle = this.pattern; ctx.fillRect(0, 0, this.W, this.H);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 10; ctx.strokeRect(-5, -5, this.W + 10, this.H + 10);
    const vx0 = this.cam.x - 80, vy0 = this.cam.y - 100, vx1 = this.cam.x + this.viewW + 80, vy1 = this.cam.y + this.viewH + 100;
    const tall = (k) => k === 'pillar' || k === 'torch' || k === 'bush' || k === 'cactus' || k === 'snowpine' || k === 'column' || k === 'statue' || k === 'mushroom' || k === 'purpleflame';
    for (const d of this.decor) if (!tall(d.k) && d.x > vx0 && d.x < vx1 && d.y > vy0 && d.y < vy1) drawDecor(ctx, d, t);
    for (const tl of this.teles) this.drawTele(ctx, tl);
    if (this.net) this.drawReviveCircles(ctx, t);
    this.drawAim(ctx, t);
    for (const e of this.enemies) if (e.spawnT > 0) {
      const k = 1 - e.spawnT / e.spawnMax;
      ctx.save(); ctx.translate(e.x, e.y); ctx.scale(1, 0.5); ctx.rotate(t * 3);
      ctx.strokeStyle = `rgba(190,120,255,${0.4 + k * 0.6})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, e.r * 1.8 * easeOut(k * 1.5), 0, TAU); ctx.stroke();
      star5(ctx, 0, 0, e.r * 1.6 * easeOut(k * 1.5), e.r * 0.7); ctx.stroke(); ctx.restore();
    }
    const list = [];
    for (const d of this.decor) if (tall(d.k) && d.x > vx0 && d.x < vx1 && d.y > vy0 && d.y < vy1 + 60) list.push({ y: d.y, f: () => drawDecor(ctx, d, t) });
    if (this.theme === 'grass') list.push({ y: 110, f: () => drawWindmill(ctx, 150, 110, t) }, { y: 140, f: () => drawWindmill(ctx, 700, 140, t + 1) });
    for (const e of this.enemies) if (!e.dead && e.spawnT <= 0) list.push({ y: e.y, f: () => this.drawEnemy(ctx, e, t) });
    const m = this.cur();
    for (const g of p.trail) list.push({ y: g.y - 0.1, f: () => { ctx.save(); ctx.globalAlpha = (g.life / 0.3) * 0.45; drawChibi(ctx, m.char, g.x, g.y, { face: g.face, t, noShadow: true, cloak: '#9fe9ff', lite: true, noWeapon: true }); ctx.restore(); } });
    for (const r of this.remotes.values()) {
      const ch = CHAR_BY_ID[r.c]; if (!ch) continue;
      for (const g of r.trail) list.push({ y: g.y - 0.1, f: () => { ctx.save(); ctx.globalAlpha = (g.life / 0.3) * 0.35; drawChibi(ctx, ch, g.x, g.y, { face: g.face, t, noShadow: true, cloak: '#9fe9ff', lite: true, noWeapon: true }); ctx.restore(); } });
      list.push({ y: r.y, f: () => this.drawRemote(ctx, r, ch, t) });
    }
    if (!m.dead || this.over || this.net) list.push({ y: p.y, f: () => this.drawPlayer(ctx, t) });
    list.sort((a, c) => a.y - c.y).forEach((o) => o.f());
    for (const pr of this.projs) this.drawProj(ctx, pr);
    ctx.globalAlpha = 1;
    for (const a of this.eprojs) this.drawEProj(ctx, a, t);
    for (const f of this.fx) if (f.draw) { ctx.save(); f.draw(ctx, f); ctx.restore(); }
    this.drawParticles(ctx);
    if (this.net) this.drawOverheads(ctx, t);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const tx of this.texts) {
      const k = tx.life / tx.max, sc = k > 0.82 ? 1 + (k - 0.82) * 3.5 : 1;
      ctx.globalAlpha = Math.min(1, k * 2.5) * (tx.alpha ?? 1);
      ctx.font = `${Math.round(tx.size * sc)}px ${/^[\d]+$/.test(tx.text) || /^[A-Z !+]+$/.test(tx.text) ? FONT_NUM : FONT_UI}`;
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(20,16,40,0.85)'; ctx.strokeText(tx.text, tx.x, tx.y); ctx.fillStyle = tx.color; ctx.fillText(tx.text, tx.x, tx.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    if (this.net) this.drawOffscreen(ctx, W, H, t);
    this.drawVignette(ctx, W, H);
    this.drawHud(ctx, W, H);
    if (this.cutin) this.drawCutin(ctx, W, H);
    if (this.remoteCutin) this.drawRemoteCutin(ctx, W, H);
    if (this.flash) { const k = 1 - this.flash.t / this.flash.dur; ctx.fillStyle = `rgba(${this.flash.col},${k * (this.flash.a ?? 0.55)})`; ctx.fillRect(0, 0, W, H); }
  },
  drawVignette(ctx, W, H) {
    const m = this.cur();
    let a = 0;
    if (m.dying > 0) a = 0.5 + 0.2 * Math.sin(this.time * 18);
    else if (!m.dead && m.hp / m.st.hp < 0.3) a = 0.2 + 0.1 * Math.sin(this.time * 6);
    if (a <= 0) return;
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.max(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.8);
    g.addColorStop(0, 'rgba(255,0,30,0)'); g.addColorStop(1, `rgba(200,0,30,${a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
  drawTele(ctx, tl) {
    if (tl.t < 0) return;
    const k = clamp(tl.t / tl.dur, 0, 1), pulse = 0.5 + 0.5 * Math.sin(this.time * 18);
    const base = tl.purple ? [190, 90, 255] : tl.ice ? [90, 190, 255] : tl.light ? [255, 170, 40] : [255, 60, 50];
    const rgba = (a) => `rgba(${base[0]},${base[1]},${base[2]},${a})`;
    ctx.save();
    if (tl.kind === 'circle') {
      ctx.fillStyle = rgba(0.18 + pulse * 0.08); ctx.beginPath(); ctx.ellipse(tl.x, tl.y, tl.r, tl.r * 0.8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = rgba(0.38); ctx.beginPath(); ctx.ellipse(tl.x, tl.y, tl.r * k, tl.r * 0.8 * k, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = rgba(0.95); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(tl.x, tl.y, tl.r, tl.r * 0.8, 0, 0, TAU); ctx.stroke();
      if (k > 0.75) { ctx.strokeStyle = `rgba(255,255,255,${(k - 0.75) * 3})`; ctx.lineWidth = 2; ctx.stroke(); }
      if (tl.purple) {
        ctx.setLineDash([10, 8]); ctx.lineDashOffset = -this.time * 60; ctx.strokeStyle = 'rgba(255,230,255,0.9)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(tl.x, tl.y, tl.r + 6, (tl.r + 6) * 0.8, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = `20px ${FONT_NUM}`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe6ff'; ctx.fillText('!!', tl.x, tl.y - tl.r * 0.8 - 8);
      }
    } else if (tl.kind === 'ring') {
      // 環形：中間安全，外圈會中
      const ri = tl.ri || 0, ro = tl.r, rk = ri + (ro - ri) * k;
      const donut = (r1, r2) => { ctx.beginPath(); ctx.ellipse(tl.x, tl.y, r2, r2 * 0.8, 0, 0, TAU); ctx.ellipse(tl.x, tl.y, r1, r1 * 0.8, 0, 0, TAU); };
      ctx.fillStyle = rgba(0.18 + pulse * 0.08); donut(ri, ro); ctx.fill('evenodd');
      ctx.fillStyle = rgba(0.38); donut(ri, rk); ctx.fill('evenodd');
      ctx.strokeStyle = rgba(0.95); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(tl.x, tl.y, ro, ro * 0.8, 0, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(tl.x, tl.y, ri, ri * 0.8, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(160,255,190,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(tl.x, tl.y, ri - 6, (ri - 6) * 0.8, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    } else if (tl.kind === 'fan') {
      ctx.fillStyle = rgba(0.2 + pulse * 0.08); ctx.beginPath(); ctx.moveTo(tl.x, tl.y); ctx.arc(tl.x, tl.y, tl.r, tl.ang - tl.arc / 2, tl.ang + tl.arc / 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = rgba(0.38); ctx.beginPath(); ctx.moveTo(tl.x, tl.y); ctx.arc(tl.x, tl.y, tl.r * k, tl.ang - tl.arc / 2, tl.ang + tl.arc / 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = rgba(0.95); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tl.x, tl.y); ctx.arc(tl.x, tl.y, tl.r, tl.ang - tl.arc / 2, tl.ang + tl.arc / 2); ctx.closePath(); ctx.stroke();
    } else if (tl.kind === 'line') {
      ctx.translate(tl.x, tl.y); ctx.rotate(tl.ang);
      if (tl.visualOnly) {
        // 只係方向提示（衝鋒／擲斧路線）：箭咀
        ctx.fillStyle = rgba(0.12 + pulse * 0.08); ctx.fillRect(0, -tl.w / 2, tl.len, tl.w);
        ctx.strokeStyle = rgba(0.8); ctx.lineWidth = 3;
        for (let x = 30 + ((this.time * 160) % 40); x < tl.len; x += 40) { ctx.beginPath(); ctx.moveTo(x - 10, -tl.w * 0.3); ctx.lineTo(x, 0); ctx.lineTo(x - 10, tl.w * 0.3); ctx.stroke(); }
      } else {
        ctx.fillStyle = rgba(0.2 + pulse * 0.1); ctx.fillRect(0, -tl.w / 2, tl.len, tl.w);
        ctx.fillStyle = rgba(0.38); ctx.fillRect(0, -tl.w / 2, tl.len * k, tl.w);
        ctx.strokeStyle = rgba(0.9); ctx.lineWidth = 2; ctx.strokeRect(0, -tl.w / 2, tl.len, tl.w);
      }
    }
    ctx.restore();
  },
  // 攻擊範圍：蓄力時顯示所選技能的範圍圈同鎖定目標；平時喺普攻目標腳下畫細圈
  drawAim(ctx, t) {
    const m = this.cur(), p = this.p;
    if (m.dead || m.dying > 0 || this.over) return;
    const col = CLS[m.char.cls].color, sr = this.selRange();
    const reticle = (e, c, a) => {
      ctx.save(); ctx.translate(e.x, e.y); ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = 2.5;
      const R = e.r + 10, rot = t * 2.5;
      for (let i = 0; i < 4; i++) { const a0 = rot + (i * Math.PI) / 2; ctx.beginPath(); ctx.ellipse(0, 0, R, R * 0.6, 0, a0 - 0.35, a0 + 0.35); ctx.stroke(); }
      ctx.restore();
    };
    if (sr) {
      if (sr.r === Infinity) {
        // 地圖炮：全地圖敵人都會被鎖定
        for (const e of this.enemies) if (!e.dead && e.spawnT <= 0) reticle(e, '#ffe27a', 0.95);
        return;
      }
      if (sr.r > 0) {
        ctx.save(); ctx.translate(p.x, p.y);
        ctx.globalAlpha = sr.sk ? 0.13 : 0.06; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, sr.r, 0, TAU); ctx.fill();
        ctx.globalAlpha = sr.sk ? 0.9 : 0.45; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([9, 7]); ctx.lineDashOffset = -t * 30; ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
      }
      if (sr.sk && sr.self) return;
      if (sr.sk && sr.sk.kind === 'heal') return;
      const tgt = this.nearestEnemy(p.x, p.y, sr.r);
      if (tgt) reticle(tgt, sr.sk ? '#ffffff' : col, sr.sk ? 0.95 : 0.6);
      else if (sr.sk) {
        // 範圍內冇敵人：顯示會向邊個方向放
        const L = Math.min(sr.r, 80);
        ctx.save(); ctx.translate(p.x, p.y - 10); ctx.rotate(p.face); ctx.globalAlpha = 0.75; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(L, 0); ctx.moveTo(L - 10, -8); ctx.lineTo(L, 0); ctx.lineTo(L - 10, 8); ctx.stroke(); ctx.restore();
      }
      return;
    }
    if (p.state === 'idle' || p.state === 'move' || p.state === 'attack') {
      const tgt = this.nearestEnemy(p.x, p.y, this.atkAim(m.char.cls, false));
      if (tgt) reticle(tgt, '#ffffff', 0.35);
    }
  },
  drawEProj(ctx, a, t) {
    ctx.save(); ctx.translate(a.x, a.y);
    if (a.kind === 'orb') {
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 14); g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#d7c2ff'); g.addColorStop(1, 'rgba(140,90,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,90,90,0.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 9 + Math.sin(t * 14) * 1.5, 0, TAU); ctx.stroke();
    } else if (a.kind === 'axe') {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 18, 14, 5, 0, 0, TAU); ctx.fill();
      ctx.rotate(a.spin);
      ctx.strokeStyle = 'rgba(255,90,60,0.35)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU * 0.6); ctx.stroke();
      ctx.fillStyle = '#5a3a22'; ctx.fillRect(-2.5, -20, 5, 40);
      ctx.fillStyle = '#c9ced8'; ctx.beginPath(); ctx.moveTo(2, -18); ctx.quadraticCurveTo(22, -16, 18, 2); ctx.lineTo(2, -2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.stroke();
    } else if (a.kind === 'spore') {
      const k = Math.min(1, a.life / 0.5), s = 1 + Math.sin(t * 6 + a.age * 3) * 0.1;
      ctx.globalAlpha = k; ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, 0, 16 * s, '#b25aff', 0.6); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#9a4ad8'; for (let i = 0; i < 3; i++) { const an = t * 2 + i * 2.1; ctx.beginPath(); ctx.arc(Math.cos(an) * 3.5, Math.sin(an) * 3, 5 * s, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#e2c4ff'; ctx.beginPath(); ctx.arc(-1.5, -1.5, 2, 0, TAU); ctx.fill();
    } else if (a.kind === 'bomb') {
      const k = clamp(a.age / a.T, 0, 1), h = Math.sin(k * Math.PI) * 60;
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, 14, 7 * (0.6 + k * 0.4), 3, 0, 0, TAU); ctx.fill();
      ctx.translate(0, -h); ctx.rotate(t * 8);
      ctx.fillStyle = '#2a2433'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill(); olS(ctx, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(-2.4, -2.4, 2, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#c9a14a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -7); ctx.quadraticCurveTo(3, -11, 1, -13); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter'; glow(ctx, 1, -13, 7 + Math.sin(t * 40) * 2, '#ffb347', 1);
    } else if (a.kind === 'snowball') {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 16, 14, 5, 0, 0, TAU); ctx.fill();
      ctx.rotate(a.age * 8);
      ctx.fillStyle = lgrad(ctx, -10, -10, 10, 10, ['#ffffff', '#dceeff', '#9fc4e8']); ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.fill(); olS(ctx, 1.2);
      ctx.fillStyle = 'rgba(160,200,240,0.7)'; ctx.beginPath(); ctx.arc(4, 3, 3, 0, TAU); ctx.arc(-5, 4, 2, 0, TAU); ctx.fill();
    } else if (a.kind === 'fire') {
      ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, 0, 22, '#ff6a2a', 0.95); glow(ctx, 0, 0, 10, '#ffe08a', 1);
      ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = 'rgba(255,90,90,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 11 + Math.sin(t * 14) * 1.5, 0, TAU); ctx.stroke();
    } else if (a.kind === 'goo') {
      const col = SLIME_COL[this.theme] || '#5fd38d';
      ctx.fillStyle = col; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.ellipse(0, 0, 8, 6.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(-2.5, -2, 2, 0, TAU); ctx.fill();
    } else {
      ctx.rotate(a.ang);
      ctx.strokeStyle = 'rgba(255,90,90,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(4, 0); ctx.stroke();
      ctx.strokeStyle = '#d9c9a8'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(6, 0); ctx.stroke();
      ctx.fillStyle = '#e8eef8'; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(3, -3.5); ctx.lineTo(3, 3.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff6b6b'; ctx.fillRect(-17, -2.5, 4, 5);
    }
    ctx.restore();
  },
  drawEnemy(ctx, e, t) {
    if (e.elite) {
      ctx.save(); ctx.globalAlpha = 0.3 + 0.15 * Math.sin(t * 8 + e.id); ctx.fillStyle = '#ff7a3a';
      ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r * 1.6, e.r * 0.6, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.8; ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    }
    ctx.save();
    if (e.hitT > 0) { const k = e.hitT / 0.12; ctx.translate(e.x, e.y); ctx.scale(1 + 0.14 * k, 1 - 0.12 * k); ctx.translate(-e.x, -e.y); }
    // 精英（史萊姆本身按半徑放大，其他放大 1.2 倍）
    if (e.elite && e.type !== 'slime') { ctx.translate(e.x, e.y); ctx.scale(1.2, 1.2); ctx.translate(-e.x, -e.y); }
    if (e.boss && (e.state === 'cast' || e.state === 'charge' || e.state === 'leap')) {
      ctx.save(); ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 20); ctx.fillStyle = e.state === 'cast' ? '#ff3b2f' : '#ffb347';
      ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r * 1.4, e.r * 0.55, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    if (e.type === 'slime') drawSlime(ctx, e, t);
    else if (e.type === 'skel') {
      drawSkeleton(ctx, e, t);
      if (e.state === 'aim') {
        ctx.save(); ctx.strokeStyle = `rgba(255,70,70,${0.3 + 0.5 * Math.min(1, e.t / 0.5)})`; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(e.x, e.y - 18); ctx.lineTo(e.x + Math.cos(e.aimAng) * 460, e.y - 18 + Math.sin(e.aimAng) * 460); ctx.stroke(); ctx.restore();
      }
    } else if (e.type === 'knight') drawKnight(ctx, e, t);
    else if (e.type === 'wisp') drawWisp(ctx, e, t);
    else if (e.type === 'wolf') drawWolf(ctx, e, t);
    else if (e.type === 'shroom') drawShroom(ctx, e, t);
    else if (e.type === 'garg') drawGarg(ctx, e, t);
    else if (e.type === 'imp') drawImp(ctx, e, t);
    else if (e.type === 'yeti') drawYeti(ctx, e, t);
    else if (e.type === 'dragon') drawDragon(ctx, e, t);
    else drawMinotaur(ctx, e, t);
    if (e.stun > 0.2 && !e.boss) {
      ctx.fillStyle = '#ffe14d';
      for (let i = 0; i < 3; i++) { const a = t * 6 + (i * TAU) / 3; star5(ctx, e.x + Math.cos(a) * 12, e.y - e.r * 2.6 - (e.z || 0) + Math.sin(a) * 4, 3.5, 1.4); ctx.fill(); }
    }
    ctx.restore();
    if (!e.boss && (e.hp < e.maxHp || e.elite)) {
      const w = e.elite ? 44 : 34, x = e.x - w / 2, y = e.y + 8;
      ctx.fillStyle = 'rgba(10,10,30,0.7)'; ctx.fillRect(x - 1, y - 1, w + 2, 5);
      ctx.fillStyle = e.elite ? '#ff9b3a' : '#ff5d6c'; ctx.fillRect(x, y, w * Math.max(0, e.hp / e.maxHp), 3);
      if (e.elite) {
        ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 1; ctx.strokeRect(x - 1.5, y - 1.5, w + 3, 6);
        ctx.font = `10px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd36b'; ctx.fillText('精英', e.x, y + 15);
      }
    }
  },
  drawPlayer(ctx, t) {
    const p = this.p, m = this.cur(), c = m.char, cls = c.cls;
    if (m.dead) { this.drawDown(ctx, p.x, p.y, c, t, this.net ? this.net.nick : null); return; }
    if (p.state === 'charge') {
      const col = CLS[cls].color, k = Math.min(1, p.chargeT / 0.2);
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, 0.45); ctx.rotate(t * 4);
      ctx.strokeStyle = col; ctx.globalAlpha = 0.9; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 26 * easeOutBack(k), 0, TAU); ctx.stroke();
      ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(0, 0, 34 * easeOutBack(k), 0, TAU); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.25; const lg = ctx.createLinearGradient(p.x, p.y, p.x, p.y - 60); lg.addColorStop(0, col); lg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = lg; ctx.fillRect(p.x - 18, p.y - 60, 36, 60); ctx.restore();
      if (cls === 'lance') {
        ctx.save(); ctx.globalAlpha = 0.35 + (p.shieldFlash > 0 ? 0.4 : 0) + 0.1 * Math.sin(t * 10);
        const g = ctx.createRadialGradient(p.x, p.y - 18, 4, p.x, p.y - 18, 36); g.addColorStop(0, 'rgba(120,255,170,0.1)'); g.addColorStop(1, 'rgba(80,230,140,0.85)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(p.x, p.y - 18, 32, 36, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#b6ffd2'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      }
    }
    if (p.swordBuff > 0) { ctx.save(); ctx.globalAlpha = 0.3 + 0.15 * Math.sin(t * 12); ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.ellipse(p.x, p.y - 16, 22, 26, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    if (cls === 'fist' && this.combo.n >= 20) { ctx.save(); ctx.globalAlpha = 0.25 + 0.1 * Math.sin(t * 20); ctx.strokeStyle = '#ffc04d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(p.x, p.y - 16, 20, 26, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    if (p.state === 'skill') { ctx.save(); ctx.globalAlpha = 0.4; ctx.strokeStyle = CLS[cls].color; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(p.x, p.y, 24 + Math.sin(t * 30) * 3, 9, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    let swing = 0, wAng;
    if (p.state === 'attack' && p.atkDef) {
      const k = clamp(p.atkT / p.atkDef.dur, 0, 1);
      if (cls === 'sword') { const dir = p.atkStep % 2 ? -1 : 1; wAng = p.face - (p.atkDef.arc / 2) * dir + p.atkDef.arc * dir * easeOut(k * 2); }
      else wAng = p.face;
      if (cls === 'fist') swing = Math.sin(k * Math.PI) * 2;
      if (cls === 'bow') swing = Math.sin(Math.min(1, k * 1.6) * Math.PI);
      if (cls === 'lance') swing = 0;
    } else if (p.state === 'skill' || p.state === 'charge') wAng = p.face - 0.4;
    const blink = (p.inv > 0 && p.state !== 'roll' && p.state !== 'skill') || p.mercy > 0 ? (Math.floor(t * 20) % 2 ? 0.45 : 1) : 1;
    ctx.save(); ctx.globalAlpha = blink;
    if (p.state === 'dying') {
      ctx.translate(p.x, p.y); ctx.rotate(0.35); ctx.translate(-p.x, -p.y);
      drawChibi(ctx, c, p.x, p.y + 4, { face: p.face, t, scale: 0.92 });
    } else if (p.state === 'roll' && cls !== 'mage') {
      const yo = -Math.sin((1 - p.rollT / 0.3) * Math.PI) * 6;
      ctx.translate(p.x, p.y - 14 + yo); ctx.rotate((1 - p.rollT / 0.3) * TAU * (Math.cos(p.rollDir) >= 0 ? 1 : -1)); ctx.translate(-p.x, -(p.y - 14));
      drawChibi(ctx, c, p.x, p.y + 4, { face: p.face, t, scale: 0.9, noShadow: true, noWeapon: true });
    } else {
      const glow = p.state === 'skill' ? 1 : p.state === 'charge' ? Math.min(1, p.chargeT / 0.3) : p.swordBuff > 0 ? 0.7 : 0;
      const shout = p.state === 'skill' || (p.state === 'attack' && p.atkDef && (p.atkDef.charged || p.atkDef.kb));
      drawChibi(ctx, c, p.x, p.y, { face: p.face, t, moving: p.state === 'move', weaponAng: wAng, swing, glow, shout, awakened: m.awakened, pose: p.state === 'skill' && cls === 'mage' ? 'cast' : null, cloak: m.awakened ? '#ffe9a8' : null });
    }
    ctx.restore();
    if (p.swapFlash > 0) { ctx.save(); ctx.globalAlpha = p.swapFlash / 0.4; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(p.x, p.y - 18, 20, 26, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    if (p.saveFlash > 0) { ctx.save(); ctx.globalAlpha = p.saveFlash; ctx.strokeStyle = '#fff27a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(p.x, p.y - 18, 26 + (1 - p.saveFlash) * 30, 32 + (1 - p.saveFlash) * 30, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    if (m.dying > 0) this.drawDyingRing(ctx, p.x, p.y, m.dying / this.graceTotal());
    const ringCol = this.net ? SLOT_COLORS[this.net.slot] || CLS[cls].color : CLS[cls].color;
    ctx.save(); ctx.strokeStyle = ringCol; ctx.globalAlpha = 0.85; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(p.x, p.y, 16, 6, 0, 0, TAU); ctx.stroke();
    ctx.fillStyle = ringCol; ctx.beginPath(); ctx.moveTo(p.x + Math.cos(p.face) * 22, p.y + Math.sin(p.face) * 8.5); ctx.lineTo(p.x + Math.cos(p.face + 0.35) * 15, p.y + Math.sin(p.face + 0.35) * 6); ctx.lineTo(p.x + Math.cos(p.face - 0.35) * 15, p.y + Math.sin(p.face - 0.35) * 6); ctx.closePath(); ctx.fill(); ctx.restore();
  },
  drawDyingRing(ctx, x, y, k) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,60,80,0.35)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y - 22, 30, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#ff3b55'; ctx.beginPath(); ctx.arc(x, y - 22, 30, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(k, 0, 1)); ctx.stroke();
    ctx.font = `12px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(30,0,10,0.9)'; ctx.fillStyle = '#ffd0d6';
    ctx.strokeText('瀕死', x, y - 60); ctx.fillText('瀕死', x, y - 60);
    ctx.restore();
  },
  drawDown(ctx, x, y, c, t, label) {
    ctx.save(); ctx.globalAlpha = 0.55;
    ctx.translate(x, y); ctx.rotate(Math.PI / 2 * 0.9); ctx.translate(-x, -y);
    drawChibi(ctx, c, x, y, { face: Math.PI / 2, t: 0, noShadow: true, noWeapon: true });
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.6 + 0.3 * Math.sin(t * 3);
    ctx.fillStyle = '#c7cff0'; ctx.font = `11px ${FONT_UI}`; ctx.textAlign = 'center';
    ctx.fillText(label ? `${label}・等待救援` : '倒下', x, y - 30);
    ctx.restore();
  },
  drawRemote(ctx, r, ch, t) {
    const col = SLOT_COLORS[r.slot] || '#ffffff';
    if (r.d) { this.drawDown(ctx, r.x, r.y, ch, t, r.nick); return; }
    if (r.s === 'charge') {
      ctx.save(); ctx.translate(r.x, r.y); ctx.scale(1, 0.45); ctx.rotate(t * 4); ctx.strokeStyle = CLS[ch.cls].color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.stroke(); ctx.restore();
      if (ch.cls === 'lance') { ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#5fe39a'; ctx.beginPath(); ctx.ellipse(r.x, r.y - 18, 30, 34, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    }
    let wAng, swing = 0;
    if (r.atkDef && r.atkAnimT != null && r.atkAnimT < r.atkDef.dur) {
      const k = clamp(r.atkAnimT / r.atkDef.dur, 0, 1);
      if (ch.cls === 'sword') { const dir = r.atkStep % 2 ? -1 : 1; wAng = r.face - (r.atkDef.arc / 2) * dir + r.atkDef.arc * dir * easeOut(k * 2); }
      else wAng = r.face;
      if (ch.cls === 'fist') swing = Math.sin(k * Math.PI) * 2;
      if (ch.cls === 'bow') swing = Math.sin(Math.min(1, k * 1.6) * Math.PI);
    } else if (r.s === 'skill' || r.s === 'charge') wAng = r.face - 0.4;
    ctx.save();
    if (r.s === 'dying') { ctx.translate(r.x, r.y); ctx.rotate(0.35); ctx.translate(-r.x, -r.y); }
    if (r.s === 'roll' && ch.cls !== 'mage') { ctx.globalAlpha = 0.85; }
    drawChibi(ctx, ch, r.x, r.y, { face: r.face, t: t + r.slot, moving: r.s === 'move', weaponAng: wAng, swing, glow: r.s === 'skill' ? 1 : r.s === 'charge' ? 0.8 : r.sb ? 0.7 : 0, shout: r.s === 'skill', awakened: r.aw, pose: r.s === 'skill' && ch.cls === 'mage' ? 'cast' : null, cloak: r.aw ? '#ffe9a8' : null });
    ctx.restore();
    if (r.dy > 0) this.drawDyingRing(ctx, r.x, r.y, r.dy / (this.graceTotal() * 100));
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = 0.85; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(r.x, r.y, 16, 6, 0, 0, TAU); ctx.stroke(); ctx.restore();
  },
  /* ---------- 協力：救援圈（地面層） ---------- */
  drawReviveCircles(ctx, t) {
    const m = this.cur(), p = this.p, meAlive = !m.dead && !(m.dying > 0);
    const one = (x, y, k, active, col, mine) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.6);
      ctx.globalAlpha = 1; ctx.fillStyle = active ? 'rgba(141,255,181,0.24)' : 'rgba(141,255,181,0.09)';
      ctx.beginPath(); ctx.arc(0, 0, REVIVE_R, 0, TAU); ctx.fill();
      ctx.setLineDash([9, 7]); ctx.lineDashOffset = -t * 24; ctx.strokeStyle = active ? '#b6ffd2' : 'rgba(141,255,181,0.75)'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(0, 0, REVIVE_R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      if (k > 0) { ctx.strokeStyle = '#8dffb5'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, REVIVE_R, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(k, 0, 1)); ctx.stroke(); }
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, REVIVE_R + 6, 0, TAU); ctx.globalAlpha = 0.5; ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `12px ${FONT_UI}`; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(10,20,20,0.9)'; ctx.fillStyle = '#b6ffd2';
      const txt = active ? `救援中 ${Math.max(0, REVIVE_T * (1 - k)).toFixed(1)} 秒` : mine ? '等隊友企入圈救你' : '企入圈 5 秒救隊友';
      ctx.strokeText(txt, x, y + REVIVE_R * 0.6 + 12); ctx.fillText(txt, x, y + REVIVE_R * 0.6 + 12);
      ctx.restore();
    };
    if (m.dead && !this.over) one(p.x, p.y, this.rvT / REVIVE_T, !!this.rvIn, SLOT_COLORS[this.net.slot] || '#fff', true);
    for (const r of this.remotes.values()) {
      if (!r.d) continue;
      const inside = meAlive && Math.hypot(p.x - r.x, (p.y - r.y) / 0.6) <= REVIVE_R + 6;
      one(r.x, r.y, (r.rv || 0) / 100, inside || (r.rv || 0) > 0, SLOT_COLORS[r.slot] || '#fff', false);
    }
  },
  /* ---------- 協力：頭頂顏色三角形＋HP／SP 條 ---------- */
  drawOverheads(ctx, t) {
    const m = this.cur(), list = [];
    if (!m.dead) list.push({ x: this.p.x, y: this.p.y, col: SLOT_COLORS[this.net.slot] || '#fff', hp: m.hp / m.st.hp, sp: m.sp / m.st.sp, nick: null, dy: m.dying > 0, slot: this.net.slot });
    for (const r of this.remotes.values()) if (!r.d) list.push({ x: r.x, y: r.y, col: SLOT_COLORS[r.slot] || '#fff', hp: r.hp / (r.mh || 1), sp: r.sp / (r.ms || 1), nick: r.nick, dy: r.dy > 0, slot: r.slot });
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const o of list) {
      const w = 36, x = o.x - w / 2, y = o.y - 66, hp = clamp(o.hp, 0, 1), sp = clamp(o.sp, 0, 1);
      ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(10,10,30,0.78)'; rrect(ctx, x - 2, y - 2, w + 4, 11, 3); ctx.fill();
      ctx.fillStyle = o.dy ? '#ff3b55' : hp > 0.5 ? '#6ee07f' : hp > 0.25 ? '#ffd23f' : '#ff5d6c'; ctx.fillRect(x, y, w * hp, 4);
      ctx.fillStyle = sp >= 1 ? `rgba(170,240,255,${0.75 + 0.25 * Math.sin(t * 10)})` : '#4fa8ff'; ctx.fillRect(x, y + 5, w * sp, 2.6);
      const ty = y - 4 + Math.sin(t * 4 + o.slot) * 1.3;
      ctx.fillStyle = o.col; ctx.strokeStyle = 'rgba(10,10,30,0.92)'; ctx.lineWidth = 1.8; poly(ctx, [[o.x - 7, ty - 9], [o.x + 7, ty - 9], [o.x, ty]]); ctx.fill(); ctx.stroke();
      if (o.nick) { ctx.font = `11px ${FONT_UI}`; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(10,10,30,0.9)'; ctx.strokeText(o.nick, o.x, ty - 16); ctx.fillStyle = o.col; ctx.fillText(o.nick, o.x, ty - 16); }
    }
    ctx.restore();
  },
  /* ---------- 協力：隊友喺畫面外時，邊緣顯示同色箭嘴 ---------- */
  drawOffscreen(ctx, W, H, t) {
    const z = this.zoom * (1 + this.zoomPunch), top = 52 + (this.safeTop || 0), bot = H - 92, left = 18, right = W - 18;
    for (const r of this.remotes.values()) {
      const sx = W / 2 + (r.x - this.cam.x - this.viewW / 2) * z, sy = H / 2 + (r.y - 24 - this.cam.y - this.viewH / 2) * z;
      if (sx >= left - 6 && sx <= right + 6 && sy >= top - 20 && sy <= bot + 20) continue;
      const cx = W / 2, cy = (top + bot) / 2, dx = sx - cx, dy = sy - cy;
      const kx = Math.abs(dx) > 0.01 ? ((dx > 0 ? right : left) - cx) / dx : Infinity, ky = Math.abs(dy) > 0.01 ? ((dy > 0 ? bot : top) - cy) / dy : Infinity, k = Math.min(kx, ky);
      const ex = cx + dx * k, ey = cy + dy * k, a = Math.atan2(dy, dx), col = SLOT_COLORS[r.slot] || '#fff';
      ctx.save(); ctx.translate(ex, ey);
      if (r.d) { ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 8); ctx.strokeStyle = '#8dffb5'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 17, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
      ctx.rotate(a); ctx.fillStyle = col; ctx.strokeStyle = 'rgba(10,10,30,0.92)'; ctx.lineWidth = 2.2;
      poly(ctx, [[13, 0], [-8, -10], [-4, 0], [-8, 10]]); ctx.fill(); ctx.stroke();
      ctx.restore();
      const lx = ex - Math.cos(a) * 26, ly = ey - Math.sin(a) * 22;
      ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `11px ${FONT_UI}`; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(10,10,30,0.9)';
      const txt = r.d ? `${r.nick}倒下` : r.nick; ctx.strokeText(txt, lx, ly); ctx.fillStyle = r.d ? '#8dffb5' : col; ctx.fillText(txt, lx, ly);
      ctx.restore();
    }
  },
  drawHud(ctx, W, H) {
    const m = this.cur();
    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.save(); ctx.translate(0, this.safeTop || 0);
    ctx.font = `13px ${FONT_UI}`; ctx.textAlign = 'left';
    const pw = Math.ceil(ctx.measureText(this.stage.name).width) + 94;
    ctx.fillStyle = 'rgba(10,14,34,0.55)'; rrect(ctx, 10, 10, pw, 26, 13); ctx.fill();
    ctx.fillStyle = '#ffe7a8'; ctx.fillText(`${this.stage.name}`, 20, 23.5);
    ctx.font = `13px ${FONT_NUM}`; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'right'; ctx.fillText(`WAVE ${Math.max(1, this.wave + 1)}/${this.stage.waves.length}`, 10 + pw - 10, 24);
    if (this.net) { ctx.textAlign = 'left'; ctx.font = `11px ${FONT_UI}`; ctx.fillStyle = 'rgba(10,14,34,0.55)'; rrect(ctx, 16 + pw, 10, 62, 26, 13); ctx.fill(); ctx.fillStyle = '#9dff9a'; ctx.fillText(`協力 ${this.remotes.size + 1}人`, 24 + pw, 23.5); }
    const boss = this.bossRef && !this.bossRef.dead && this.bossRef.spawnT <= 0 ? this.bossRef : null;
    if (boss) {
      const bw = W - 40, bx = 20, by = 48;
      ctx.fillStyle = 'rgba(10,8,24,0.75)'; rrect(ctx, bx - 4, by - 4, bw + 8, 22, 6); ctx.fill();
      const k = Math.max(0, boss.hp / boss.maxHp);
      boss.hpShow = boss.hpShow == null ? k : Math.max(k, boss.hpShow - 0.004);
      ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.5; ctx.fillRect(bx, by, bw * boss.hpShow, 14); ctx.globalAlpha = 1;
      const g = ctx.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, '#ff3b4e'); g.addColorStop(1, '#ff9a4d');
      ctx.fillStyle = g; ctx.fillRect(bx, by, bw * k, 14);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, 14);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(bx + bw * 0.5 - 1, by, 2, 14);
      ctx.font = `12px ${FONT_UI}`; ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.fillText(`${boss.name}${boss.enraged ? '（狂暴）' : ''}`, bx + 4, by + 26);
      ctx.textAlign = 'right'; ctx.font = `12px ${FONT_NUM}`; ctx.fillText(`${fmt(Math.max(0, boss.hp))} / ${fmt(boss.maxHp)}`, bx + bw, by + 26);
    }
    if (this.combo.n >= 2) {
      const a = Math.min(1, this.combo.t * 2);
      ctx.globalAlpha = a; ctx.textAlign = 'right';
      const y = boss ? 106 : 70;
      const pop = this.combo.t > 2.45 ? 1 + (this.combo.t - 2.45) * 2 : 1;
      ctx.save(); ctx.translate(W - 14, y); ctx.scale(pop, pop);
      ctx.font = `30px ${FONT_NUM}`; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(30,10,40,0.8)';
      ctx.strokeText(`${this.combo.n}`, 0, 0); ctx.fillStyle = this.combo.n >= 50 ? '#ff9ef0' : '#ffe14d'; ctx.fillText(`${this.combo.n}`, 0, 0);
      ctx.restore();
      ctx.font = `13px ${FONT_NUM}`; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(30,10,40,0.8)'; ctx.strokeText('COMBO', W - 14, y + 22); ctx.fillStyle = '#ffffff'; ctx.fillText('COMBO', W - 14, y + 22);
      if (m.char.cls === 'fist') { const mul = 1 + (Math.min(this.combo.n, 50) / 50) * 0.6; ctx.font = `12px ${FONT_UI}`; ctx.fillStyle = '#ffc04d'; ctx.strokeText(`拳速 ×${mul.toFixed(2)}`, W - 14, y + 40); ctx.fillText(`拳速 ×${mul.toFixed(2)}`, W - 14, y + 40); }
      ctx.globalAlpha = 1;
    }
    if (this.milestone) {
      const k = this.milestone.t / 1.3, sc = k < 0.15 ? 0.6 + (k / 0.15) * 0.6 : 1.2 - Math.min(0.2, (k - 0.15));
      ctx.save(); ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1; ctx.translate(W / 2, H * 0.24); ctx.scale(sc, sc); ctx.textAlign = 'center';
      ctx.font = `30px ${FONT_NUM}`; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(40,10,50,0.9)';
      const label = this.milestone.n >= 100 ? 'AMAZING!' : this.milestone.n >= 50 ? 'EXCELLENT!' : 'GREAT!';
      ctx.strokeText(label, 0, 0); ctx.fillStyle = '#fff27a'; ctx.fillText(label, 0, 0);
      ctx.font = `15px ${FONT_NUM}`; ctx.strokeText(`${this.milestone.n} COMBO`, 0, 26); ctx.fillStyle = '#ffffff'; ctx.fillText(`${this.milestone.n} COMBO`, 0, 26);
      ctx.restore();
    }
    ctx.restore();
    const bx = 14, bw = W - 28, by = H - 52;
    ctx.fillStyle = 'rgba(10,14,34,0.62)'; rrect(ctx, bx - 6, by - 22, bw + 12, 66, 12); ctx.fill();
    ctx.textAlign = 'left'; ctx.font = `13px ${FONT_UI}`; ctx.fillStyle = CLS[m.char.cls].color;
    ctx.fillText(`${CLS[m.char.cls].name}`, bx, by - 9);
    ctx.fillStyle = '#ffffff'; ctx.fillText(`${m.char.name}`, bx + 50, by - 9);
    ctx.font = `12px ${FONT_NUM}`; ctx.textAlign = 'right'; ctx.fillStyle = m.dying > 0 ? '#ff8a9a' : '#d6def5'; ctx.fillText(m.dying > 0 ? 'DANGER' : `HP ${Math.ceil(m.hp)}/${m.st.hp}`, bx + bw, by - 9);
    const hpK = clamp(m.hp / m.st.hp, 0, 1);
    m.hpShow = m.hpShow == null ? hpK : hpK > m.hpShow ? hpK : Math.max(hpK, m.hpShow - 0.006);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; rrect(ctx, bx, by, bw, 10, 5); ctx.fill();
    if (m.hpShow > hpK) { ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.6; rrect(ctx, bx, by, Math.max(10, bw * m.hpShow), 10, 5); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.fillStyle = hpK > 0.5 ? '#6ee07f' : hpK > 0.25 ? '#ffd23f' : '#ff5d6c'; if (hpK > 0) { rrect(ctx, bx, by, Math.max(10, bw * hpK), 10, 5); ctx.fill(); }
    const spK = clamp(m.sp / m.st.sp, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; rrect(ctx, bx, by + 15, bw, 9, 4.5); ctx.fill();
    const sg = ctx.createLinearGradient(bx, 0, bx + bw, 0); sg.addColorStop(0, '#3f8cff'); sg.addColorStop(1, '#7fe3ff');
    ctx.fillStyle = spK >= 1 ? `rgba(160,240,255,${0.8 + 0.2 * Math.sin(this.time * 10)})` : sg; rrect(ctx, bx, by + 15, Math.max(9, bw * spK), 9, 4.5); ctx.fill();
    [m.char.s1.sp, m.char.s2.sp, SPECIAL[m.char.cls].sp].forEach((cost) => {
      const x = bx + bw * Math.min(1, cost / m.st.sp);
      ctx.fillStyle = m.sp >= cost ? '#ffe14d' : 'rgba(255,255,255,0.45)'; ctx.fillRect(x - 1, by + 13, 2, 13);
    });
    ctx.font = `11px ${FONT_NUM}`; ctx.textAlign = 'left'; ctx.fillStyle = '#bfe9ff'; ctx.fillText(`SP ${Math.floor(m.sp)}/${m.st.sp}`, bx, by + 35);
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = `11px ${FONT_UI}`;
    ctx.fillText(`普攻命中 SP +${m.st.spr}`, bx + bw, by + 35);
    if (this.hintT > 0 && !this.inp.down && !this.cutin) {
      ctx.globalAlpha = Math.min(1, this.hintT); ctx.textAlign = 'center'; ctx.font = `13px ${FONT_UI}`;
      const lines = ['點一下：攻擊　按住拖曳：移動', '快速一掃：翻滾迴避', '長按蓄力 → 滑向 ←S1　S2→　↑爆發技', '或者直接撳左邊技能掣（按住睇範圍）'];
      const hy = H - 170;
      ctx.fillStyle = 'rgba(10,14,34,0.6)'; rrect(ctx, W / 2 - 150, hy - 14, 300, 86, 12); ctx.fill();
      ctx.fillStyle = '#ffffff'; lines.forEach((l, i) => ctx.fillText(l, W / 2, hy + i * 20 + 4));
      ctx.globalAlpha = 1;
    }
    if (this.inp.down) this.drawPuni(ctx, W, H);
    if (this.banner) {
      const b = this.banner, k = b.t / b.dur, a = k < 0.15 ? k / 0.15 : k > 0.8 ? (1 - k) / 0.2 : 1;
      const y = H * 0.36;
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(10,8,24,0.55)'; ctx.fillRect(0, y - 40, W, 80);
      ctx.fillStyle = b.color; ctx.fillRect(0, y - 40, W, 2); ctx.fillRect(0, y + 38, W, 2);
      ctx.textAlign = 'center'; ctx.font = `${b.text.length > 6 ? 30 : 38}px ${/^[A-Z !\d]+$/.test(b.text) ? FONT_NUM : FONT_UI}`;
      const sc = k < 0.15 ? 1.4 - (k / 0.15) * 0.4 : 1;
      ctx.save(); ctx.translate(W / 2, y - 6); ctx.scale(sc, sc);
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(20,10,30,0.9)'; ctx.strokeText(b.text, 0, 0); ctx.fillStyle = b.color; ctx.fillText(b.text, 0, 0);
      ctx.restore();
      ctx.font = `14px ${FONT_UI}`; ctx.fillStyle = '#ffffff'; ctx.fillText(b.sub || '', W / 2, y + 24);
      ctx.globalAlpha = 1;
    }
    if (this.net && m.dead && !this.over) {
      const my = 130 + (this.safeTop || 0);
      ctx.textAlign = 'center'; ctx.font = `13px ${FONT_UI}`; ctx.fillStyle = 'rgba(10,14,34,0.78)'; rrect(ctx, W / 2 - 150, my - 22, 300, 44, 14); ctx.fill();
      ctx.fillStyle = '#ffd0d6'; ctx.fillText('你已倒下：隊友企入綠色救援圈 5 秒', W / 2, my - 8); ctx.fillText('或者用治癒技能，就可以救返你', W / 2, my + 10);
    }
    ctx.restore();
  },
  drawPuni(ctx, W, H) {
    const inp = this.inp, m = this.cur();
    const charge = inp.state === 'charge';
    const bx = inp.sx, by = inp.sy;
    let kx = inp.cx, ky = inp.cy;
    const d = dist(bx, by, kx, ky), maxR = charge ? 90 : 72;
    if (d > maxR) { kx = bx + ((kx - bx) / d) * maxR; ky = by + ((ky - by) / d) * maxR; }
    const dd = Math.min(d, maxR);
    const rb = 30 - Math.min(dd / maxR, 1) * 8, rk = 24;
    const col = charge ? CLS[m.char.cls].color : '#ffffff';
    const now = performance.now();
    ctx.save();
    if (charge) {
      const pop = easeOutBack(Math.min(1, (now - inp.chargeAt) / 110));
      ctx.globalAlpha = 0.35 + 0.15 * Math.sin(this.time * 12); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(bx, by, 44 * pop, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(bx, by, rb + 8, 0, TAU); ctx.fill(); ctx.stroke();
    if (dd > 4) {
      const a = Math.atan2(ky - by, kx - bx), nx = Math.cos(a + Math.PI / 2), ny = Math.sin(a + Math.PI / 2);
      const mx = (bx + kx) / 2, my = (by + ky) / 2, pinch = ((rb + rk) / 2) * (1 - Math.min(dd / 110, 0.72));
      ctx.beginPath();
      ctx.moveTo(bx + nx * rb, by + ny * rb);
      ctx.quadraticCurveTo(mx + nx * pinch, my + ny * pinch, kx + nx * rk * 0.85, ky + ny * rk * 0.85);
      ctx.lineTo(kx - nx * rk * 0.85, ky - ny * rk * 0.85);
      ctx.quadraticCurveTo(mx - nx * pinch, my - ny * pinch, bx - nx * rb, by - ny * rb);
      ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,0.32)'; ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(bx, by, rb, 0, TAU); ctx.fill();
    const kg = ctx.createRadialGradient(kx - 6, ky - 6, 2, kx, ky, rk);
    kg.addColorStop(0, 'rgba(255,255,255,0.95)'); kg.addColorStop(1, charge ? col : 'rgba(255,255,255,0.55)');
    ctx.fillStyle = kg; ctx.beginPath(); ctx.ellipse(kx, ky, rk * (1 + dd / 400), rk * (1 - dd / 500), Math.atan2(ky - by, kx - bx), 0, TAU); ctx.fill();
    if (charge) {
      const sel = inp.sel;
      const appear = easeOutBack(Math.min(1, (now - inp.chargeAt) / 110));
      const items = [
        { k: 's1', dx: -78, dy: -66, label: 'S1', sk: m.char.s1 },
        { k: 'sp', dx: 0, dy: -108, label: '爆', sk: SPECIAL[m.char.cls] },
        { k: 's2', dx: 78, dy: -66, label: 'S2', sk: m.char.s2 },
      ];
      let oy = 0; if (by - 108 - 34 < 8) oy = 8 - (by - 108 - 34);
      if (sel && sel !== 'cancel') {
        const it = items.find((q) => q.k === sel);
        ctx.strokeStyle = 'rgba(255,225,77,0.7)'; ctx.lineWidth = 3; ctx.setLineDash([4, 6]);
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(clamp(bx + it.dx, 36, W - 36), by + it.dy + oy); ctx.stroke(); ctx.setLineDash([]);
      }
      for (const it of items) {
        const tx = clamp(bx + it.dx, 36, W - 36), ty = by + it.dy + oy;
        const x = lerp(bx, tx, appear), y = lerp(by, ty, appear);
        const can = m.sp >= it.sk.sp, on = sel === it.k;
        const selPop = on ? easeOutBack(Math.min(1, (now - (inp.selAt || 0)) / 100)) : 0;
        const r = (24 + selPop * 7) * Math.min(1, appear);
        ctx.globalAlpha = can ? 1 : 0.55;
        if (on) { ctx.fillStyle = 'rgba(255,225,77,0.35)'; ctx.beginPath(); ctx.arc(x, y, r + 10, 0, TAU); ctx.fill(); }
        const g = ctx.createRadialGradient(x - 6, y - 8, 2, x, y, Math.max(1, r));
        g.addColorStop(0, can ? '#ffffff' : '#9aa3b8'); g.addColorStop(1, can ? CLS[m.char.cls].color : '#4a5068');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, Math.max(1, r), 0, TAU); ctx.fill();
        ctx.strokeStyle = on ? '#ffe14d' : 'rgba(255,255,255,0.8)'; ctx.lineWidth = on ? 3 : 2; ctx.stroke();
        if (can && m.sp >= it.sk.sp) { ctx.strokeStyle = `rgba(255,255,255,${0.3 + 0.3 * Math.sin(this.time * 8)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r + 4, 0, TAU); ctx.stroke(); }
        ctx.textAlign = 'center'; ctx.fillStyle = '#1a1530'; ctx.font = `${on ? 17 : 14}px ${FONT_NUM}`; ctx.fillText(it.label, x, y - 2);
        ctx.font = `10px ${FONT_NUM}`; ctx.fillText(`SP${it.sk.sp}`, x, y + 11);
        ctx.font = `11px ${FONT_UI}`; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(10,10,30,0.85)';
        const ny2 = it.k === 'sp' ? y - r - 9 : y + r + 11;
        ctx.strokeText(it.sk.name, x, ny2); ctx.fillStyle = '#ffffff'; ctx.fillText(it.sk.name, x, ny2);
      }
      ctx.globalAlpha = 1;
      ctx.font = `11px ${FONT_UI}`; ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.textAlign = 'center';
      ctx.fillText(sel === 'cancel' ? '放開＝取消' : m.char.cls === 'lance' ? '護盾展開中・原地放開＝蓄力攻擊' : '原地放開＝蓄力攻擊', bx, by + 56);
    }
    ctx.restore();
  },
  drawCutin(ctx, W, H) {
    const c = this.cutin, m = c.m, ch = m.char;
    const inK = easeOut(Math.min(1, c.t / 0.12)), outK = c.t > c.dur - 0.16 ? easeIn((c.t - (c.dur - 0.16)) / 0.16) : 0;
    ctx.save();
    if (c.compact) {
      // 協力模式：唔阻擋畫面的頂部橫幅
      const bh = 64, y0 = 76 + (this.safeTop || 0);
      ctx.translate((1 - inK) * W - outK * W, 0);
      ctx.beginPath(); ctx.moveTo(0, y0 + 10); ctx.lineTo(W, y0); ctx.lineTo(W, y0 + bh); ctx.lineTo(0, y0 + bh + 10); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, CLS[ch.cls].color); g.addColorStop(0.6, shade(ch.outfit, -0.3)); g.addColorStop(1, 'rgba(13,15,36,0.9)');
      ctx.fillStyle = g; ctx.globalAlpha = 0.92; ctx.fill(); ctx.globalAlpha = 1;
      ctx.save(); ctx.clip();
      const img = portraitImage(ch, m.awakened);
      if (img.complete && img.naturalWidth) ctx.drawImage(img, 4 - c.t * 10, y0 - 24, 140, 140);
      ctx.restore();
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.font = `22px ${FONT_UI}`; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(20,10,30,0.9)'; ctx.strokeText(c.sk.name, W - 14, y0 + bh / 2 + 2); ctx.fillStyle = '#ffffff'; ctx.fillText(c.sk.name, W - 14, y0 + bh / 2 + 2);
      ctx.restore(); return;
    }
    const dim = c.t < 0.35 ? 0.45 : 0.45 * Math.max(0, 1 - (c.t - 0.35) / 0.3);
    ctx.fillStyle = `rgba(6,8,22,${dim * (1 - outK)})`; ctx.fillRect(0, 0, W, H);
    // 放射速度線
    ctx.save(); ctx.globalAlpha = (1 - outK) * 0.5; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    for (let i = 0; i < 26; i++) { const a = (i / 26) * TAU + c.t, r0 = Math.max(W, H) * (0.45 + ((i * 37) % 10) / 40); ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, H * 0.42 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * (r0 + 140), H * 0.42 + Math.sin(a) * (r0 + 140)); ctx.stroke(); }
    ctx.restore();
    const bandH = Math.min(180, H * 0.27), cy = H * 0.42;
    ctx.translate((1 - inK) * W - outK * W, 0);
    ctx.beginPath(); ctx.moveTo(-30, cy - bandH / 2 + 26); ctx.lineTo(W + 30, cy - bandH / 2 - 26); ctx.lineTo(W + 30, cy + bandH / 2 - 26); ctx.lineTo(-30, cy + bandH / 2 + 26); ctx.closePath();
    const g = ctx.createLinearGradient(0, cy - bandH, W, cy + bandH);
    g.addColorStop(0, CLS[ch.cls].color); g.addColorStop(0.55, shade(ch.outfit, -0.3)); g.addColorStop(1, '#0d0f24');
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
    for (let i = 0; i < 18; i++) {
      const yy = cy - bandH / 2 - 26 + ((i * 37) % (bandH + 52)), xx = W - ((i * 113 + c.t * 1800) % (W + 260));
      ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + 80 + (i % 3) * 30, yy - 10); ctx.stroke();
    }
    const img = portraitImage(ch, m.awakened);
    const size = bandH * 2.0;
    if (img.complete && img.naturalWidth) ctx.drawImage(img, -c.t * 30, cy - size * 0.36, size, size);
    ctx.restore();
    ctx.strokeStyle = '#ffe17a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-30, cy - bandH / 2 + 26); ctx.lineTo(W + 30, cy - bandH / 2 - 26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-30, cy + bandH / 2 + 26); ctx.lineTo(W + 30, cy + bandH / 2 - 26); ctx.stroke();
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    const tag = c.which === 's1' ? 'SKILL 1' : c.which === 's2' ? 'SKILL 2' : 'BURST';
    ctx.font = `14px ${FONT_NUM}`; ctx.fillStyle = '#ffe17a'; ctx.fillText(tag, W - 18, cy - 34);
    const nameSize = c.sk.name.length > 5 ? 26 : 32;
    const ns = 1 + Math.max(0, 0.25 - c.t) * 1.2;
    ctx.save(); ctx.translate(W - 18, cy + 2); ctx.scale(ns, ns);
    ctx.font = `${nameSize}px ${FONT_UI}`; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(20,10,30,0.9)';
    ctx.strokeText(c.sk.name, 0, 0); ctx.fillStyle = '#ffffff'; ctx.fillText(c.sk.name, 0, 0);
    ctx.restore();
    ctx.font = `13px ${FONT_UI}`; ctx.fillStyle = '#e6ebff'; ctx.fillText(`${ch.title}　${ch.name}`, W - 18, cy + 34);
    ctx.restore();
  },
  drawRemoteCutin(ctx, W) {
    const c = this.remoteCutin, k = c.t / c.dur;
    const x = k < 0.12 ? lerp(-220, 10, easeOut(k / 0.12)) : k > 0.85 ? lerp(10, -220, easeIn((k - 0.85) / 0.15)) : 10;
    const y = 148 + (this.safeTop || 0);
    ctx.save();
    ctx.fillStyle = 'rgba(10,14,34,0.8)'; rrect(ctx, x, y, 210, 44, 12); ctx.fill();
    ctx.strokeStyle = SLOT_COLORS[c.slot] || '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    const img = portraitImage(c.ch, c.aw);
    if (img.complete && img.naturalWidth) { ctx.save(); rrect(ctx, x + 4, y + 4, 36, 36, 8); ctx.clip(); ctx.drawImage(img, x + 2, y + 2, 40, 40); ctx.restore(); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = `11px ${FONT_UI}`; ctx.fillStyle = SLOT_COLORS[c.slot] || '#ffffff'; ctx.fillText(c.nick, x + 48, y + 14);
    ctx.font = `14px ${FONT_UI}`; ctx.fillStyle = '#ffffff'; ctx.fillText(c.sk.name, x + 48, y + 31);
    ctx.restore();
  },
});
