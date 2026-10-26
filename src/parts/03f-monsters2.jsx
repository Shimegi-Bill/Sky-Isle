
/* ---------- 03f 新怪物 AI：冰霜狼、毒蘑菇怪、石像鬼、炸彈小鬼、頭目冰霜巨人、深淵魔龍 ----------
 * 傷害一律經預警圈（teles）或投射物（eprojs），協力模式由房主同步，加入者自己判定受傷。 */
Object.assign(Battle.prototype, {
  /* ===== 冰霜狼：繞圈遊走、預警突進（精英三連撲）、冰霜吐息、嚎叫令狼群加速 ===== */
  aiWolf(e, dt, tg, dT, toT) {
    const haste = e.haste > 0 ? 1.35 : 1;
    if (e.haste > 0) e.haste -= dt;
    switch (e.state) {
      case 'idle': {
        const want = 125, tA = toT + (Math.PI / 2) * e.side;
        let mx, my;
        if (dT > want + 40) { mx = Math.cos(toT) * 0.9 + Math.cos(tA) * 0.3; my = Math.sin(toT) * 0.9 + Math.sin(tA) * 0.3; }
        else if (dT < want - 40) { mx = -Math.cos(toT) * 0.7 + Math.cos(tA) * 0.5; my = -Math.sin(toT) * 0.7 + Math.sin(tA) * 0.5; }
        else { mx = Math.cos(tA); my = Math.sin(tA); if (Math.random() < dt * 0.5) e.side *= -1; }
        const sp = 118 * haste * (e.elite ? 1.1 : 1);
        e.x += mx * sp * dt; e.y += my * sp * dt; e.face = toT;
        e.cd -= dt * haste; e.hwCD = (e.hwCD ?? 3) - dt;
        if (e.cd > 0 || !this.targetsCache.length) break;
        const pack = this.enemies.some((q) => q.type === 'wolf' && !q.dead && q !== e);
        if (pack && e.hwCD <= 0 && Math.random() < 0.3) this.wolfHowl(e);
        else if (dT < 135 && Math.random() < 0.45) this.wolfBreath(e, toT);
        else if (dT < 310) this.wolfPounce(e, tg, dT, e.elite ? 2 : this.lv >= 8 ? 1 : 0, false);
        else e.cd = 0.3;
        break;
      }
      case 'charge': {
        e.t += dt;
        const W0 = e.chWind, D = 0.2;
        if (e.t >= W0 && e.t < W0 + D) { const sp = e.chLen / D; e.x += Math.cos(e.chA) * sp * dt; e.y += Math.sin(e.chA) * sp * dt; if (Math.random() < 0.7) this.pfx('snow', e.x + rand(-6, 6), e.y - 8, { vx: rand(-30, 30), vy: rand(-50, -10), life: 0.4, color: '#bfe9ff', size: 2 }); }
        else if (e.t >= W0 + D) {
          if (e.chain > 0) this.wolfPounce(e, tg, dist(e.x, e.y, tg.x, tg.y), e.chain - 1, true);
          else { e.state = 'idle'; e.t = 0; e.cd = rand(1.1, 1.7) * (e.elite ? 0.75 : 1); }
        }
        break;
      }
      case 'cast': e.t += dt; if (e.t >= e.castDur) { e.state = 'idle'; e.cd = rand(1.0, 1.6) * (e.elite ? 0.8 : 1); } break;
      case 'roar': e.t += dt; if (e.t >= 0.8) { e.state = 'idle'; e.cd = 0.4; } break;
      default: e.state = 'idle';
    }
  },
  wolfPounce(e, tg, dT, chain, chained) {
    const L = this.leadPoint(tg, e, 600, 0.5), a = Math.atan2(L.y - e.y, L.x - e.x), len = clamp(dT + 40, 110, 240);
    e.state = 'charge'; e.t = 0; e.chA = a; e.face = a; e.chWind = chained ? 0.32 : e.elite ? 0.4 : 0.48; e.chLen = len; e.chain = chain;
    this.addTele({ kind: 'line', x: e.x, y: e.y, ang: a, len: len + 18, w: 34, dur: e.chWind + 0.08, dmg: e.atk * 1.1, owner: e, ice: true });
  },
  wolfBreath(e, toT) {
    e.state = 'cast'; e.t = 0; e.castDur = 0.85; e.face = toT;
    this.addTele({ kind: 'fan', x: e.x, y: e.y, ang: toT, r: 125, arc: 1.1, dur: 0.6, dmg: e.atk * 1.2, owner: e, ice: true });
    this.floatText(e.x, e.y - 40, '冰霜吐息', '#9fe3ff', 12);
  },
  wolfHowl(e) {
    e.state = 'roar'; e.t = 0; e.hwCD = 9;
    this.floatText(e.x, e.y - 42, '嚎叫！狼群加速', '#bfe9ff', 13); SFX.roar(); this.ring(e.x, e.y - 12, '#bfe9ff', 60, 0.5); this.ring(e.x, e.y - 12, '#ffffff', 110, 0.7);
    for (const q of this.enemies) if (!q.dead && q.type === 'wolf' && dist(q.x, q.y, e.x, e.y) < 340) { q.haste = 4; q.cd = Math.min(q.cd, 0.5); }
  },

  /* ===== 毒蘑菇怪：毒孢子環（會停留喺地上）、跳躍壓擊、死亡時孢子爆散 ===== */
  aiShroom(e, dt, tg, dT, toT) {
    switch (e.state) {
      case 'idle':
        if (dT > 90) { e.x += Math.cos(toT) * 42 * dt; e.y += Math.sin(toT) * 42 * dt; }
        e.face = toT; e.cd -= dt;
        if (e.cd <= 0 && this.targetsCache.length) { if (dT < 230 && dT > 50 && Math.random() < 0.45) this.shroomStomp(e, tg); else this.shroomSpores(e, toT); }
        break;
      case 'cast':
        e.t += dt;
        if (e.fireFn && e.t >= e.fireAt) { const f = e.fireFn; e.fireFn = null; f(); }
        if (e.t >= e.castDur) { e.state = 'idle'; e.cd = rand(1.6, 2.4) * (e.elite ? 0.75 : 1); }
        break;
      case 'leap': {
        e.t += dt;
        const C = 0.45, T = e.leapT;
        if (e.t >= C && e.t < T) { const k = (e.t - C) / (T - C); e.x = lerp(e.lx0, e.lx1, k); e.y = lerp(e.ly0, e.ly1, k); e.z = Math.sin(k * Math.PI) * 60; }
        else if (e.t >= T) {
          e.x = e.lx1; e.y = e.ly1; e.z = 0; e.state = 'idle'; e.cd = rand(1.2, 1.8); this.dust(e.x, e.y, 8);
          if (e.elite || this.lv >= 8) this.spawnEProj('spore', e.x, e.y - 10, rand(0, TAU), 150, e.atk * 0.6, 0, 5, TAU / 5);
        }
        break;
      }
      default: e.state = 'idle';
    }
  },
  shroomSpores(e, toT) {
    e.state = 'cast'; e.t = 0; e.castDur = 1.0; e.fireAt = 0.55;
    const n = e.elite ? 10 : 8, a0 = toT + rand(0, 0.4);
    e.fireFn = () => { if (e.dead) return; this.spawnEProj('spore', e.x, e.y - 18, a0, 175, e.atk * 0.75, 0, n, TAU / n); this.burst(e.x, e.y - 26, '#c98aff', 12, 140, 'dot'); SFX.magic(); };
    this.floatText(e.x, e.y - 52, '毒孢子', '#d58bff', 12);
  },
  shroomStomp(e, tg) {
    const L = this.leadPoint(tg, e, 380, 0.6), a = Math.atan2(L.y - e.y, L.x - e.x), d = Math.min(240, dist(e.x, e.y, L.x, L.y));
    e.state = 'leap'; e.t = 0; e.leapT = 1.05; e.lx0 = e.x; e.ly0 = e.y;
    e.lx1 = clamp(e.x + Math.cos(a) * d, 30, this.W - 30); e.ly1 = clamp(e.y + Math.sin(a) * d, 40, this.H - 30);
    this.addTele({ kind: 'circle', x: e.lx1, y: e.ly1, r: e.r * 3.3, dur: e.leapT, dmg: e.atk * 1.4, owner: e });
  },

  /* ===== 石像鬼：俯衝（追蹤後鎖定）、石化光線、半血石化防禦後震波 ===== */
  aiGarg(e, dt, tg, dT, toT) {
    const baseZ = 16;
    switch (e.state) {
      case 'idle': {
        e.z = lerp(e.z || 0, baseZ + Math.sin(this.time * 3 + e.id) * 3, Math.min(1, dt * 4));
        let mx = 0, my = 0;
        if (dT > 210) { mx = Math.cos(toT); my = Math.sin(toT); }
        else if (dT < 130) { mx = -Math.cos(toT); my = -Math.sin(toT); }
        else { const tA = toT + (Math.PI / 2) * e.side; mx = Math.cos(tA) * 0.7; my = Math.sin(tA) * 0.7; if (Math.random() < dt * 0.4) e.side *= -1; }
        e.x += mx * 75 * dt; e.y += my * 75 * dt; e.face = toT;
        if (!e.stoned && e.hp < e.maxHp * 0.45) { this.gargStone(e); break; }
        e.cd -= dt;
        if (e.cd <= 0 && this.targetsCache.length) { if (Math.random() < 0.5) this.gargDive(e, tg); else this.gargGaze(e, tg); }
        break;
      }
      case 'dive': {
        e.t += dt;
        const tl = e.diveTele || { x: e.x, y: e.y }, up = 0.45, T = e.diveT;
        if (e.t < up) e.z = lerp(baseZ, 72, easeOut(e.t / up));
        else if (e.t < T - 0.18) { e.z = 72; e.x = lerp(e.x, tl.x, Math.min(1, dt * 3)); e.y = lerp(e.y, tl.y, Math.min(1, dt * 3)); }
        else if (e.t < T) { const k = (e.t - (T - 0.18)) / 0.18; e.x = lerp(e.x, tl.x, k); e.y = lerp(e.y, tl.y, k); e.z = lerp(72, 0, k); }
        else { e.x = tl.x; e.y = tl.y; e.z = 0; this.dust(e.x, e.y, 8); e.state = 'cast'; e.t = 0; e.castDur = 0.6; e.diveTele = null; }
        break;
      }
      case 'cast': e.t += dt; if (e.z < baseZ) e.z = Math.min(baseZ, e.z + dt * 40); if (e.t >= e.castDur) { e.state = 'idle'; e.cd = rand(1.3, 2.0) * (e.elite ? 0.75 : 1); } break;
      case 'stone':
        e.t += dt; e.z = Math.max(0, (e.z || 0) - dt * 60);
        if (e.t >= 2.6) {
          e.state = 'cast'; e.t = 0; e.castDur = 0.8;
          this.addTele({ kind: 'ring', x: e.x, y: e.y, ri: 34, r: 135, dur: 0.55, dmg: e.atk * 1.25, owner: e });
          this.floatText(e.x, e.y - 48, '石化解除・震波', '#ffd0a0', 13); SFX.warn();
        }
        break;
      default: e.state = 'idle';
    }
  },
  gargDive(e, tg) {
    e.state = 'dive'; e.t = 0; e.diveT = e.elite ? 1.05 : 1.2;
    e.diveTele = this.addTele({ kind: 'circle', x: tg.x, y: tg.y, r: 60, dur: e.diveT, dmg: e.atk * 1.35, owner: e, track: tg.ref, lock: e.diveT - 0.42 });
    this.floatText(e.x, e.y - 50, '俯衝', '#ffb38a', 12); SFX.jump();
  },
  gargGaze(e, tg) {
    const L = this.leadPoint(tg, e, 700, 0.4), a = Math.atan2(L.y - e.y, L.x - e.x);
    e.state = 'cast'; e.t = 0; e.castDur = 1.0; e.face = a;
    this.addTele({ kind: 'line', x: e.x, y: e.y, ang: a, len: 330, w: 30, dur: 0.85, dmg: e.atk * 1.25, owner: e, purple: e.elite && this.lv >= 8 });
    this.floatText(e.x, e.y - 50, '石化光線', '#d0d4dc', 12);
  },
  gargStone(e) {
    e.stoned = true; e.state = 'stone'; e.t = 0;
    this.teles = this.teles.filter((t) => t.owner !== e);
    this.floatText(e.x, e.y - 48, '石化防禦', '#c9ced8', 14); SFX.guard();
  },

  /* ===== 炸彈小鬼：拋物線擲彈、近身瞬移、殘血自爆衝鋒 ===== */
  aiImp(e, dt, tg, dT, toT) {
    e.z = 4 + Math.sin(this.time * 6 + e.id) * 2;
    switch (e.state) {
      case 'idle': {
        let mx = 0, my = 0;
        if (dT < 150) { mx = -Math.cos(toT); my = -Math.sin(toT); }
        else if (dT > 240) { mx = Math.cos(toT); my = Math.sin(toT); }
        else { const tA = toT + (Math.PI / 2) * e.side; mx = Math.cos(tA) * 0.8; my = Math.sin(tA) * 0.8; if (Math.random() < dt * 0.6) e.side *= -1; }
        e.x += mx * 105 * dt; e.y += my * 105 * dt; e.face = toT;
        e.cd -= dt; e.blCD = (e.blCD ?? 2) - dt;
        if (!e.boomed && e.hp < e.maxHp * 0.35) { this.impKamikaze(e); break; }
        if (dT < 95 && e.blCD <= 0) { e.state = 'blink'; e.t = 0; e.blinked = false; e.blCD = 3; SFX.teleport(); break; }
        if (e.cd <= 0 && this.targetsCache.length && dT < 430) this.impBombs(e, tg);
        break;
      }
      case 'blink':
        e.t += dt;
        if (!e.blinked && e.t >= 0.25) {
          e.blinked = true; let bx = e.x, by = e.y;
          for (let k = 0; k < 12; k++) { const a = rand(0, TAU), r = rand(180, 240); bx = clamp(tg.x + Math.cos(a) * r, 50, this.W - 50); by = clamp(tg.y + Math.sin(a) * r, 60, this.H - 50); if (dist(bx, by, tg.x, tg.y) > 160) break; }
          this.burst(e.x, e.y - 14, '#ff8a5a', 12, 160, 'star'); e.x = bx; e.y = by; e.kbx = e.kby = 0; this.burst(e.x, e.y - 14, '#ffd08a', 12, 160, 'star');
        }
        if (e.t >= 0.5) { e.state = 'idle'; e.cd = Math.min(e.cd, 0.3); }
        break;
      case 'cast': e.t += dt; if (e.t >= e.castDur) { e.state = 'idle'; e.cd = rand(1.3, 2.0) * (e.elite ? 0.7 : 1); } break;
      case 'charge': {
        e.t += dt;
        if (!e.boomTele) {
          if (e.t < 1.0 && dT > 36) { e.x += Math.cos(toT) * 155 * dt; e.y += Math.sin(toT) * 155 * dt; e.face = toT; }
          else { e.boomTele = this.addTele({ kind: 'circle', x: e.x, y: e.y, r: 88, dur: 0.7, dmg: e.atk * 1.8 }); e.boomAt = this.time + 0.7; this.floatText(e.x, e.y - 40, '要爆炸啦！', '#ff6a4a', 14); SFX.warn(); }
        } else if (this.time >= e.boomAt) { e.hp = 0; this.killEnemy(e); }
        break;
      }
      default: e.state = 'idle';
    }
  },
  impBombs(e, tg) {
    e.state = 'cast'; e.t = 0; e.castDur = 0.7;
    const n = e.elite ? 3 : this.lv >= 8 ? 2 : 1, L = this.leadPoint(tg, e, 300, 1);
    for (let i = 0; i < n; i++) {
      const tx = clamp(L.x + (i ? rand(-75, 75) : 0), 30, this.W - 30), ty = clamp(L.y + (i ? rand(-60, 60) : 0), 40, this.H - 30);
      const T = 0.95 + i * 0.12, d = Math.max(1, dist(e.x, e.y, tx, ty)), a = Math.atan2(ty - e.y, tx - e.x);
      this.addTele({ kind: 'circle', x: tx, y: ty, r: 48, dur: T, dmg: e.atk * 1.2 });
      this.spawnEProj('bomb', e.x, e.y - 16, a, d / T, 0, T);
    }
    SFX.whoosh(); this.floatText(e.x, e.y - 40, '擲彈', '#ffb347', 12);
  },
  impKamikaze(e) {
    e.boomed = true; e.state = 'charge'; e.t = 0; e.boomTele = null;
    this.floatText(e.x, e.y - 44, '自爆衝鋒！', '#ff5d4d', 14); SFX.warn();
  },

  /* ===== 頭目：冰霜巨人 ===== */
  bossCommon(e, dt, names) {
    if (!e.enraged && e.hp < e.maxHp * 0.5 && (e.state === 'idle' || e.state === 'cast')) {
      e.enraged = true; e.state = 'roar'; e.t = 0; e.chain = null; e.z = 0; this.teles = this.teles.filter((t) => t.owner !== e);
      this.banner = { text: names.rage, sub: names.sub, t: 0, dur: 1.5, color: names.col }; SFX.roar(); this.shake = 14;
      return true;
    }
    if (e.state === 'idle') {
      if (!e.sum1 && e.hp < e.maxHp * names.s1) { e.sum1 = true; this.summonList(e, names.l1); return true; }
      if (!e.sum2 && e.hp < e.maxHp * names.s2) { e.sum2 = true; this.summonList(e, names.l2); return true; }
    }
    return false;
  },
  summonList(e, list) {
    e.state = 'roar'; e.t = 0; e.chain = null;
    this.floatText(e.x, e.y - e.r * 3, '召喚手下！', '#ff9b6b', 18); SFX.roar(); this.shake = Math.max(this.shake, 10);
    list.forEach((raw, i) => {
      const a = (i / list.length) * TAU + rand(-0.3, 0.3);
      const x = clamp(e.x + Math.cos(a) * 160, 50, this.W - 50), y = clamp(e.y + Math.sin(a) * 160, 60, this.H - 50);
      const m = this.makeEnemy(waveType(raw), this.uid++, x, y, waveElite(raw)); m.spawnT = 0.8 + i * 0.15; m.spawnMax = m.spawnT; this.enemies.push(m);
    });
  },
  pickW(e, W) {
    if (e.last && W[e.last]) W[e.last] *= 0.2;
    let sum = 0; for (const k in W) sum += W[k];
    let r = Math.random() * sum; for (const k in W) { r -= W[k]; if (r <= 0) return k; }
    return Object.keys(W)[0];
  },
  updateYeti(e, dt, d, toT, tg) {
    if (this.bossCommon(e, dt, { rage: '冰霜狂怒！', sub: '暴風雪即將來臨', col: '#7fd6ff', s1: 0.65, s2: 0.3, l1: ['wolf', 'wolf'], l2: ['wolf!', 'wolf', 'wolf'] })) return;
    const en = e.enraged, spd = en ? 105 : 85;
    switch (e.state) {
      case 'roar': e.t += dt; if (e.t > 0.9) { e.state = 'idle'; e.cd = 0.3; } break;
      case 'idle': {
        e.face = toT;
        if (d > 100) { e.x += Math.cos(toT) * spd * dt; e.y += Math.sin(toT) * spd * dt; }
        e.cd -= dt;
        if (e.cd <= 0 && this.targetsCache.length) {
          const W = d < 135 ? { punch: 3, stomp: 2, breath: 1.5, icicles: 1, blizzard: en ? 1.4 : 0 } : { icicles: 2.5, snowball: 2.5, leap: 1.5, breath: 1, blizzard: en ? 1 : 0 };
          const k = this.pickW(e, W); e.last = k; this.yetiAttack(e, k, toT, tg);
        }
        break;
      }
      case 'cast':
        e.t += dt;
        if (e.fireFn && e.t >= e.fireAt) { const f = e.fireFn; e.fireFn = null; f(); }
        if (e.t >= e.castDur) {
          if (e.chain && e.chain.length) { const nx = e.chain.shift(); this.yetiAttack(e, nx, Math.atan2(tg.y - e.y, tg.x - e.x), tg, true); }
          else { e.chain = null; e.state = 'idle'; e.cd = en ? rand(0.35, 0.65) : rand(0.65, 1.05); }
        }
        break;
      case 'leap': {
        e.t += dt;
        const C = 0.32, T = e.leapT, tl = e.leapTele, tx = tl ? tl.x : e.lx0, ty = tl ? tl.y : e.ly0;
        if (e.t < C) e.face = Math.atan2(ty - e.y, tx - e.x);
        else if (e.t < T) { const k = (e.t - C) / (T - C); e.x = lerp(e.lx0, tx, k); e.y = lerp(e.ly0, ty, k); e.z = Math.sin(k * Math.PI) * 100; }
        else {
          e.z = 0; e.x = tx; e.y = ty; e.leapTele = null; this.dust(e.x, e.y, 12);
          if (en) for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; this.addTele({ kind: 'circle', x: clamp(e.x + Math.cos(a) * 120, 30, this.W - 30), y: clamp(e.y + Math.sin(a) * 96, 40, this.H - 30), r: 40, dur: 0.6, dmg: e.atk * 1.1, owner: e, ice: true }); }
          e.state = 'cast'; e.t = 0; e.castDur = en ? 0.75 : 0.6;
        }
        break;
      }
      default: e.state = 'idle';
    }
  },
  yetiAttack(e, kind, toT, tg, chained = false) {
    e.t = 0; e.fireFn = null;
    const en = e.enraged;
    if (kind === 'punch') {
      const dur = chained ? 0.45 : 0.55; e.state = 'cast'; e.face = toT; e.castDur = dur + 0.25; e.pose = 'punch';
      if (!chained && en) e.chain = ['punch', 'stomp'];
      this.addTele({ kind: 'fan', x: e.x, y: e.y, ang: toT, r: 128, arc: 1.9, dur, dmg: e.atk, owner: e });
    } else if (kind === 'stomp') {
      e.state = 'cast'; e.castDur = 1.55; e.pose = 'stomp';
      this.addTele({ kind: 'circle', x: e.x, y: e.y, r: 130, dur: 0.85, dmg: e.atk * 1.3, owner: e, ice: true });
      this.addTele({ kind: 'ring', x: e.x, y: e.y, ri: 130, r: 285, t: -0.62, dur: 0.8, dmg: e.atk * 1.3, owner: e, ice: true });
      this.floatText(e.x, e.y - e.r * 2.8, '冰河震地', '#bfe9ff', 15); SFX.warn();
    } else if (kind === 'breath') {
      e.state = 'cast'; e.castDur = en ? 1.9 : 1.3; e.face = toT; e.pose = 'breath';
      this.addTele({ kind: 'fan', x: e.x, y: e.y, ang: toT, r: 235, arc: 1.3, dur: 1.0, dmg: e.atk * 1.25, owner: e, ice: true });
      if (en) { const s = Math.random() < 0.5 ? -1 : 1; this.addTele({ kind: 'fan', x: e.x, y: e.y, ang: toT + s * 1.0, r: 235, arc: 1.3, t: -0.65, dur: 0.8, dmg: e.atk * 1.25, owner: e, ice: true }); }
      this.floatText(e.x, e.y - e.r * 2.8, '冰封吐息', '#bfe9ff', 15); SFX.warn();
    } else if (kind === 'icicles') {
      e.state = 'cast'; e.castDur = 1.25; e.pose = 'stomp';
      const lines = en ? [toT - 0.45, toT, toT + 0.45] : [toT];
      lines.forEach((a) => { for (let i = 0; i < 6; i++) { const r = 55 + i * 48; this.addTele({ kind: 'circle', x: clamp(e.x + Math.cos(a) * r, 30, this.W - 30), y: clamp(e.y + Math.sin(a) * r, 40, this.H - 30), r: 40, t: -i * 0.09, dur: 0.62, dmg: e.atk * 1.15, owner: e, ice: true }); } });
      this.floatText(e.x, e.y - e.r * 2.8, '冰柱陣', '#bfe9ff', 15); SFX.warn();
    } else if (kind === 'snowball') {
      e.state = 'cast'; e.castDur = 0.95; e.fireAt = 0.45; e.face = toT; e.pose = 'throw';
      const n = en ? 5 : 3;
      e.fireFn = () => { if (e.dead) return; const a = Math.atan2(tg.y - e.y, tg.x - e.x); this.spawnEProj('snowball', e.x, e.y - e.r, a, 300, e.atk * 1.1, 0, n, 0.32); SFX.whoosh(); };
      this.floatText(e.x, e.y - e.r * 2.8, '雪崩滾石', '#e8f2ff', 15);
    } else if (kind === 'blizzard') {
      const dur = 1.3; e.state = 'cast'; e.castDur = dur + 0.3; e.pose = 'stomp';
      this.addTele({ kind: 'circle', x: e.x, y: e.y, r: 205, dur, dmg: e.atk * 1.7, owner: e, purple: true, follow: true });
      this.floatText(e.x, e.y - e.r * 3, '暴風雪', '#d58bff', 16, true); SFX.warn();
    } else if (kind === 'leap') {
      e.state = 'leap'; e.leapT = en ? 1.0 : 1.15; e.lx0 = e.x; e.ly0 = e.y;
      e.leapTele = this.addTele({ kind: 'circle', x: tg.x, y: tg.y, r: 108, dur: e.leapT, dmg: e.atk * 1.45, owner: e, track: tg.ref, lock: e.leapT - 0.42, ice: true });
      this.floatText(e.x, e.y - e.r * 2.8, '巨人跳躍', '#bfe9ff', 15); SFX.jump(); SFX.warn();
    }
  },

  /* ===== 最終頭目：深淵魔龍 ===== */
  updateDragon(e, dt, d, toT, tg) {
    if (e.state !== 'fly' && this.bossCommon(e, dt, { rage: '魔龍覺醒！', sub: '深淵之火燃燒一切', col: '#c06bff', s1: 0.7, s2: 0.3, l1: ['imp', 'imp', 'garg'], l2: ['garg!', 'imp!', 'garg'] })) return;
    const en = e.enraged, spd = en ? 100 : 80;
    switch (e.state) {
      case 'roar': e.t += dt; if (e.t > 1.0) { e.state = 'idle'; e.cd = 0.3; } break;
      case 'idle': {
        e.face = toT;
        if (d > 120) { e.x += Math.cos(toT) * spd * dt; e.y += Math.sin(toT) * spd * dt; }
        e.cd -= dt;
        if (e.cd <= 0 && this.targetsCache.length) {
          const W = d < 150 ? { claw: 3, tail: 2, breath: 2, dark: 1.2, fireballs: 1 } : { breath: 2, fireballs: 2.5, meteor: en ? 2 : 1.2, dark: 1.5, claw: 0.4 };
          const k = this.pickW(e, W); e.last = k; this.dragonAttack(e, k, toT, tg);
        }
        break;
      }
      case 'cast':
        e.t += dt;
        if (e.fireFn && e.t >= e.fireAt) { const f = e.fireFn; e.fireFn = null; f(); }
        if (e.t >= e.castDur) {
          if (e.chain && e.chain.length) { const nx = e.chain.shift(); this.dragonAttack(e, nx, Math.atan2(tg.y - e.y, tg.x - e.x), tg, true); }
          else { e.chain = null; e.state = 'idle'; e.cd = en ? rand(0.35, 0.6) : rand(0.6, 1.0); }
        }
        break;
      case 'fly': {
        e.t += dt;
        const T = e.flyDur;
        if (e.t < 0.6) e.z = lerp(0, 95, easeOut(e.t / 0.6));
        else if (e.t < T - 0.45) { e.z = 95 + Math.sin(e.t * 4) * 4; e.x = lerp(e.x, e.fx1, Math.min(1, dt * 1.5)); e.y = lerp(e.y, e.fy1, Math.min(1, dt * 1.5)); }
        else if (e.t < T) e.z = lerp(95, 0, easeIn((e.t - (T - 0.45)) / 0.45));
        else {
          e.z = 0; this.dust(e.x, e.y, 14); this.shake = Math.max(this.shake, 10);
          this.addTele({ kind: 'ring', x: e.x, y: e.y, ri: 40, r: 175, dur: 0.5, dmg: e.atk * 1.3, owner: e });
          e.state = 'cast'; e.t = 0; e.castDur = 0.8;
        }
        break;
      }
      default: e.state = 'idle';
    }
  },
  dragonAttack(e, kind, toT, tg, chained = false) {
    e.t = 0; e.fireFn = null; e.pose = kind;
    const en = e.enraged;
    if (kind === 'claw') {
      const dur = chained ? 0.45 : 0.52; e.state = 'cast'; e.face = toT; e.castDur = dur + 0.25;
      if (!chained) e.chain = en ? ['claw', 'tail'] : ['claw'];
      this.addTele({ kind: 'fan', x: e.x, y: e.y, ang: toT, r: chained ? 150 : 135, arc: 2.0, dur, dmg: e.atk, owner: e });
    } else if (kind === 'tail') {
      e.state = 'cast'; e.castDur = 0.95;
      this.addTele({ kind: 'ring', x: e.x, y: e.y, ri: 55, r: 205, dur: 0.65, dmg: e.atk * 1.2, owner: e });
      this.floatText(e.x, e.y - e.r * 2.6, '巨尾橫掃', '#ffb38a', 15);
    } else if (kind === 'breath') {
      const n = en ? 5 : 3; e.state = 'cast'; e.face = toT; e.castDur = 0.65 + n * 0.22 + 0.25;
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (let i = 0; i < n; i++) this.addTele({ kind: 'fan', x: e.x, y: e.y, ang: toT + dir * (i - (n - 1) / 2) * 0.55, r: 255, arc: 0.75, t: -i * 0.22, dur: 0.65, dmg: e.atk * 1.15, owner: e, follow: true });
      this.floatText(e.x, e.y - e.r * 2.6, '烈焰吐息', '#ff8a5a', 15); SFX.warn();
    } else if (kind === 'dark') {
      e.state = 'cast'; e.face = toT; e.castDur = 1.35;
      this.addTele({ kind: 'line', x: e.x, y: e.y, ang: toT, len: 450, w: 64, dur: 1.1, dmg: e.atk * 1.6, owner: e, purple: true });
      this.floatText(e.x, e.y - e.r * 2.8, '暗黑吐息', '#d58bff', 16, true); SFX.warn();
    } else if (kind === 'fireballs') {
      e.state = 'cast'; e.castDur = 0.95; e.fireAt = 0.5; e.face = toT;
      const n = en ? 5 : 3;
      e.fireFn = () => { if (e.dead) return; const a = Math.atan2(tg.y - e.y, tg.x - e.x); this.spawnEProj('fire', e.x, e.y - e.r * 1.5, a, 175, e.atk * 1.0, 1.3, n, 0.5); SFX.magic(); };
      this.floatText(e.x, e.y - e.r * 2.6, '獄炎火球', '#ff8a5a', 15);
    } else if (kind === 'meteor') {
      e.state = 'fly'; e.flyDur = 2.5; e.fx1 = clamp(tg.x, 80, this.W - 80); e.fy1 = clamp(tg.y - 120, 80, this.H - 80);
      const tgs = this.targetsCache.length ? this.targetsCache : [tg], n = en ? 13 : 9;
      for (let i = 0; i < n; i++) {
        const base = tgs[i % tgs.length], near = i < tgs.length;
        this.addTele({ kind: 'circle', x: clamp(base.x + (near ? 0 : rand(-200, 200)), 30, this.W - 30), y: clamp(base.y + (near ? 0 : rand(-170, 170)), 40, this.H - 30), r: 56, t: -0.55 - i * 0.11, dur: 0.9, dmg: e.atk * 1.3 });
      }
      this.floatText(e.x, e.y - e.r * 3, '隕石天降', '#ffb38a', 17, true); SFX.jump(); SFX.warn();
    }
  },
});
