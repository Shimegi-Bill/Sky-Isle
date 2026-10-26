
/* ---------- 03b 怪物 AI、投射物、預警圈、主迴圈 ---------- */
Object.assign(Battle.prototype, {
  makeEnemy(type, id, x, y, elite = false) {
    const d = ENEMY[type], s = enemyStats(type, this.lv, this.coopN, elite);
    return { id, type, boss: !!d.boss, elite: !!elite, x, y, tx: x, ty: y, kbx: 0, kby: 0, r: s.r, hp: s.hp, maxHp: s.hp, atk: s.atk, def: s.def,
      state: type === 'knight' ? 'guard' : 'idle', t: 0, cd: rand(0.8, 1.5), face: Math.PI / 2, z: 0, tz: 0, flash: 0, hitT: 0, stun: 0, contactCD: 0,
      spawnT: 0, spawnMax: 0.7, enraged: false, hopDur: 0.45, castDur: 1.2, aimAng: 0, side: id % 2 ? 1 : -1, bsCD: 0, blCD: 0, chain: null,
      color: type === 'slime' ? SLIME_COL[this.theme] : ENEMY_COL[type] || '#efe6cf', name: d.name };
  },
  spawnWave(list) {
    const tg = this.aiTargets();
    const c = tg.length ? { x: tg.reduce((a, t) => a + t.x, 0) / tg.length, y: tg.reduce((a, t) => a + t.y, 0) / tg.length } : this.p;
    list.forEach((raw, i) => {
      const type = waveType(raw), elite = waveElite(raw);
      let x = c.x, y = c.y;
      if (ENEMY[type].boss) { x = this.W / 2; y = clamp(c.y - 300, 160, this.H - 160); if (dist(x, y, c.x, c.y) < 220) y = clamp(c.y + 300, 160, this.H - 160); }
      else {
        for (let k = 0; k < 20; k++) {
          const a = rand(0, TAU), r = rand(170, 330);
          x = clamp(c.x + Math.cos(a) * r, 50, this.W - 50); y = clamp(c.y + Math.sin(a) * r, 60, this.H - 50);
          if (dist(x, y, c.x, c.y) > 150) break;
        }
      }
      const e = this.makeEnemy(type, this.uid++, x, y, elite);
      e.spawnT = 0.7 + i * 0.12; e.spawnMax = e.spawnT;
      this.enemies.push(e);
      if (e.boss) this.bossRef = e;
    });
    this.waveBanner(this.wave);
  },
  waveBanner(w) {
    const list = this.stage.waves[w] || [];
    const bt = list.map(waveType).find((t) => ENEMY[t] && ENEMY[t].boss);
    if (bt) { this.banner = { text: 'WARNING', sub: `頭目「${ENEMY[bt].name}」出現`, t: 0, dur: 2.0, color: '#ff4d5e' }; SFX.roar(); this.shake = 10; }
    else this.banner = { text: `WAVE ${w + 1}`, sub: list.some(waveElite) ? `共 ${this.stage.waves.length} 波・精英出現` : `共 ${this.stage.waves.length} 波`, t: 0, dur: 1.3, color: list.some(waveElite) ? '#ffb86b' : '#ffe17a' };
  },
  aiTargets() {
    const out = [], m = this.cur();
    if (!m.dead) out.push({ x: this.p.x, y: this.p.y, vx: this.pv.x, vy: this.pv.y, ref: this.p, local: true, dying: m.dying > 0 });
    for (const r of this.remotes.values()) if (!r.d) out.push({ x: r.x, y: r.y, vx: r.vx || 0, vy: r.vy || 0, ref: r, local: false, dying: r.dy > 0 });
    return out;
  },
  nearestTarget(e) {
    let best = null, bd = 1e9;
    for (const t of this.targetsCache || []) { const d = dist(e.x, e.y, t.x, t.y) + (t.dying ? 220 : 0); if (d < bd) { bd = d; best = t; } }
    return best || { x: this.p.x, y: this.p.y, vx: 0, vy: 0, ref: this.p, local: true };
  },
  // 預判：按目標移動速度推算落點
  leadPoint(tg, from, speed, k = 1) {
    const t = Math.min(1.1, dist(from.x, from.y, tg.x, tg.y) / speed) * k;
    return { x: clamp(tg.x + (tg.vx || 0) * t, 30, this.W - 30), y: clamp(tg.y + (tg.vy || 0) * t, 40, this.H - 30) };
  },
  addTele(o) { const t = { id: this.uid++, t: 0, ...o }; this.teles.push(t); return t; },
  spawnEProj(kind, x, y, ang, spd, dmg, extra = 0, n = 1, spread = 0) {
    for (let i = 0; i < n; i++) this.eprojs.push(makeEProj(kind, x, y, ang + (i - (n - 1) / 2) * spread, spd, dmg, extra));
    if (this.net) this.netEmit('ar', Math.round(x), Math.round(y), Math.round(ang * 100), Math.round(dmg), EP_KINDS.indexOf(kind), Math.round(spd), Math.round(extra * 100), n, Math.round(spread * 100));
  },
  localAlive() { const m = this.cur(); return !m.dead && !(m.dying > 0); },
  updateEnemies(dt) {
    const p = this.p, alive = this.localAlive();
    this.targetsCache = this.aiTargets();
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.flash -= dt; e.contactCD -= dt; e.hitT -= dt;
      if (e.spawnT > 0) { e.spawnT -= dt; continue; }
      e.x += e.kbx * dt; e.y += e.kby * dt; e.kbx *= Math.pow(0.02, dt); e.kby *= Math.pow(0.02, dt);
      if (e.stun > 0) { e.stun -= dt; if (!e.boss) { if (e.state === 'aim' || e.state === 'hop') { e.state = 'idle'; e.z = 0; } continue; } }
      const tg = this.nearestTarget(e);
      const dT = dist(e.x, e.y, tg.x, tg.y), toT = Math.atan2(tg.y - e.y, tg.x - e.x);
      if (e.type === 'slime') this.aiSlime(e, dt, tg, dT, toT);
      else if (e.type === 'skel') this.aiSkel(e, dt, tg, dT, toT);
      else if (e.type === 'knight') this.aiKnight(e, dt, tg, dT, toT);
      else if (e.type === 'wisp') this.aiWisp(e, dt, tg, dT, toT);
      else if (e.type === 'wolf') this.aiWolf(e, dt, tg, dT, toT);
      else if (e.type === 'shroom') this.aiShroom(e, dt, tg, dT, toT);
      else if (e.type === 'garg') this.aiGarg(e, dt, tg, dT, toT);
      else if (e.type === 'imp') this.aiImp(e, dt, tg, dT, toT);
      else if (e.type === 'yeti') this.updateYeti(e, dt, dT, toT, tg);
      else if (e.type === 'dragon') this.updateDragon(e, dt, dT, toT, tg);
      else if (e.type === 'boss') this.updateBoss(e, dt, dT, toT, tg);
      if (e.type === 'slime' && alive && e.state !== 'leap' && e.z < 12 && e.contactCD <= 0 && dist(e.x, e.y, p.x, p.y) < e.r + 13) { this.hurtPlayer(e.atk, e, { kb: 140 }); e.contactCD = 0.9; }
      e.x = clamp(e.x, 30, this.W - 30); e.y = clamp(e.y, 40, this.H - 30);
    }
    const al = this.enemies.filter((e) => !e.dead && e.spawnT <= 0 && (e.z || 0) < 20);
    for (let i = 0; i < al.length; i++) for (let j = i + 1; j < al.length; j++) {
      const a = al[i], c = al[j], dd = dist(a.x, a.y, c.x, c.y), mn = a.r + c.r;
      if (dd < mn && dd > 0.01) { const push = (mn - dd) / 2, ux = (c.x - a.x) / dd, uy = (c.y - a.y) / dd; if (!a.boss) { a.x -= ux * push; a.y -= uy * push; } if (!c.boss) { c.x += ux * push; c.y += uy * push; } }
    }
    this.enemies = this.enemies.filter((e) => !e.dead);
  },

  /* ---------- 史萊姆：跳動撞擊＋預警飛撲（精英落地噴黏液） ---------- */
  aiSlime(e, dt, tg, dT, toT) {
    const fast = (this.lv >= 3 ? 1.15 : 1) * (e.elite ? 1.1 : 1);
    if (e.state === 'idle') {
      e.cd -= dt;
      if (e.cd <= 0) {
        const pounce = e.elite ? 0.55 : 0.2 + this.lv * 0.06;
        if (dT < 240 && dT > 45 && Math.random() < pounce) this.slimePounce(e, tg);
        else { e.state = 'hop'; e.t = 0; e.hopA = toT + rand(-0.35, 0.35); e.face = e.hopA; }
      }
    } else if (e.state === 'hop') {
      e.t += dt; e.z = Math.sin((e.t / e.hopDur) * Math.PI) * 18;
      e.x += Math.cos(e.hopA) * 175 * fast * dt; e.y += Math.sin(e.hopA) * 175 * fast * dt;
      if (e.t >= e.hopDur) { e.state = 'idle'; e.z = 0; e.cd = rand(0.35, 0.8) * (e.elite ? 0.8 : 1); this.dust(e.x, e.y, 2); }
    } else if (e.state === 'leap') {
      e.t += dt;
      const C = 0.42, T = e.leapT;
      if (e.t >= C && e.t < T) { const k = (e.t - C) / (T - C); e.x = lerp(e.lx0, e.lx1, k); e.y = lerp(e.ly0, e.ly1, k); e.z = Math.sin(k * Math.PI) * 48; }
      else if (e.t >= T) {
        e.x = e.lx1; e.y = e.ly1; e.z = 0; e.state = 'idle'; e.cd = rand(0.7, 1.2);
        this.dust(e.x, e.y, 6);
        if (e.elite) this.spawnEProj('goo', e.x, e.y - 8, rand(0, TAU), 210, e.atk * 0.8, 0, 6, TAU / 6);
      }
    }
  },
  slimePounce(e, tg) {
    const L = this.leadPoint(tg, e, 380, 0.6);
    const a = Math.atan2(L.y - e.y, L.x - e.x), d = Math.min(260, dist(e.x, e.y, L.x, L.y));
    e.state = 'leap'; e.t = 0; e.leapT = e.elite ? 0.85 : 0.95; e.face = a;
    e.lx0 = e.x; e.ly0 = e.y; e.lx1 = clamp(e.x + Math.cos(a) * d, 30, this.W - 30); e.ly1 = clamp(e.y + Math.sin(a) * d, 40, this.H - 30);
    this.addTele({ kind: 'circle', x: e.lx1, y: e.ly1, r: e.r * 2.7, dur: e.leapT, dmg: e.atk * 1.35, owner: e, light: true });
  },

  /* ---------- 骷髏弓手：預判射擊、散射、箭雨、近身後跳快射 ---------- */
  aiSkel(e, dt, tg, dT, toT) {
    if (e.state === 'idle') {
      let mx = 0, my = 0;
      if (dT < 170) { mx = -Math.cos(toT); my = -Math.sin(toT); }
      else if (dT > 290) { mx = Math.cos(toT); my = Math.sin(toT); }
      else { const tA = toT + (Math.PI / 2) * e.side; mx = Math.cos(tA) * 0.6; my = Math.sin(tA) * 0.6; if (Math.random() < dt * 0.35) e.side *= -1; }
      e.x += mx * 90 * dt; e.y += my * 90 * dt; e.face = toT;
      e.cd -= dt; e.bsCD -= dt;
      if (dT < 105 && e.bsCD <= 0 && this.lv >= 2) { e.state = 'hop'; e.t = 0; e.hopA = toT + Math.PI + rand(-0.6, 0.6); e.bsCD = 2.4; return; }
      if (e.cd <= 0 && dT < 470 && this.targetsCache.length) {
        const r = Math.random();
        if (this.lv >= 2 && r < (e.elite ? 0.32 : 0.22)) this.skelVolley(e, tg);
        else { e.state = 'aim'; e.t = 0; e.aimAng = toT; e.aimDur = 0.62; e.shot = this.lv >= 3 && r > 0.78 ? 5 : r > 0.55 ? 3 : 1; e.second = false; }
      }
    } else if (e.state === 'hop') {
      // 後跳拉開距離，然後即刻快射
      e.t += dt; const k = e.t / 0.28;
      e.x += Math.cos(e.hopA) * 330 * (1 - k) * dt; e.y += Math.sin(e.hopA) * 330 * (1 - k) * dt; e.z = Math.sin(Math.min(1, k) * Math.PI) * 10;
      if (e.t >= 0.28) { e.z = 0; e.state = 'aim'; e.t = 0; e.aimAng = toT; e.aimDur = 0.36; e.shot = 1; e.second = false; this.dust(e.x, e.y, 3); }
    } else if (e.state === 'aim') {
      e.t += dt;
      if (e.t < e.aimDur - 0.18) { const L = this.leadPoint(tg, e, 440, e.elite ? 1 : 0.7); e.aimAng = Math.atan2(L.y - e.y, L.x - e.x); }
      if (e.t >= e.aimDur) {
        const x = e.x + Math.cos(e.aimAng) * 16, y = e.y - 18 + Math.sin(e.aimAng) * 16;
        this.spawnEProj('arrow', x, y, e.aimAng, 440, e.atk, 0, e.shot, e.shot === 5 ? 0.2 : 0.18);
        SFX.arrow();
        if (e.elite && !e.second) { e.second = true; e.t = e.aimDur - 0.24; }
        else { e.state = 'idle'; e.cd = rand(1.2, 1.8) * (e.elite ? 0.8 : 1); }
      }
    } else if (e.state === 'cast') {
      e.t += dt; if (e.t >= e.castDur) { e.state = 'idle'; e.cd = rand(1.3, 1.9); }
    }
  },
  skelVolley(e, tg) {
    e.state = 'cast'; e.t = 0; e.castDur = 0.75; e.face = Math.atan2(tg.y - e.y, tg.x - e.x);
    const n = e.elite ? 4 : 3, L = this.leadPoint(tg, e, 500, 1);
    for (let i = 0; i < n; i++) {
      const x = i === 0 ? L.x : clamp(L.x + rand(-95, 95), 30, this.W - 30), y = i === 0 ? L.y : clamp(L.y + rand(-80, 80), 40, this.H - 30);
      this.addTele({ kind: 'circle', x, y, r: 48, t: -i * 0.2, dur: 0.95, dmg: e.atk * 1.1, light: true });
    }
    this.floatText(e.x, e.y - 50, '箭雨', '#ffc04d', 13); SFX.warn();
  },

  /* ---------- 骷髏劍士：舉盾前進（正面減傷）、揮斬、二連斬、突刺、迴旋斬 ---------- */
  aiKnight(e, dt, tg, dT, toT) {
    const lv = this.lv, strong = lv >= 3 || e.elite;
    switch (e.state) {
      case 'idle': // 出招後硬直：放低盾牌，係反擊時機
        e.t += dt; if (e.t >= (e.recT || 0.8)) { e.state = 'guard'; e.t = 0; }
        break;
      case 'guard': {
        const turn = e.elite ? 3.6 : 2.8;
        e.face += clamp(angDiff(e.face, toT), -turn * dt, turn * dt);
        const facing = Math.abs(angDiff(e.face, toT));
        const spd = (e.elite ? 80 : 68) * (lv >= 3 ? 1.1 : 1) * (facing > 1.2 ? 0.4 : 1);
        if (dT > 72) { e.x += Math.cos(e.face) * spd * dt; e.y += Math.sin(e.face) * spd * dt; }
        e.cd -= dt;
        if (e.cd > 0) break;
        if (dT < 92 && facing > 1.5 && strong) this.knightSpin(e);
        else if (dT < 100 && facing < 0.9) {
          if (strong && Math.random() < 0.25) this.knightSpin(e);
          else this.knightSlash(e, lv >= 2 && Math.random() < 0.5);
        } else if (dT >= 100 && dT < 250 && facing < 0.6 && Math.random() < 0.7) this.knightThrust(e, tg, dT);
        else e.cd = 0.3;
        break;
      }
      case 'cast':
        e.t += dt; if (e.t >= e.castDur) { e.state = 'idle'; e.t = 0; e.recT = e.elite ? 0.6 : 0.85; e.cd = rand(0.9, 1.5) * (e.elite ? 0.8 : 1); }
        break;
      case 'charge': {
        e.t += dt;
        const W0 = e.chWind, D = 0.24;
        if (e.t >= W0 && e.t < W0 + D) { const sp = e.chLen / D; e.x += Math.cos(e.chA) * sp * dt; e.y += Math.sin(e.chA) * sp * dt; if (Math.random() < 0.6) this.dust(e.x, e.y, 1); }
        else if (e.t >= W0 + D) { e.state = 'idle'; e.t = 0; e.recT = e.elite ? 0.75 : 1.0; e.cd = rand(1.0, 1.6); }
        break;
      }
      default: e.state = 'guard';
    }
  },
  knightSlash(e, double) {
    e.state = 'cast'; e.t = 0;
    const fast = e.elite ? 0.47 : 0.55;
    this.addTele({ kind: 'fan', x: e.x, y: e.y, ang: e.face, r: 92, arc: 2.0, dur: fast, dmg: e.atk, owner: e });
    if (double) { this.addTele({ kind: 'fan', x: e.x, y: e.y, ang: e.face, r: 104, arc: 2.3, t: -fast + 0.05, dur: 0.42, dmg: e.atk * 1.1, owner: e }); e.castDur = fast + 0.55; }
    else e.castDur = fast + 0.15;
  },
  knightSpin(e) {
    e.state = 'cast'; e.t = 0; e.castDur = 0.85;
    this.addTele({ kind: 'circle', x: e.x, y: e.y, r: 82, dur: 0.68, dmg: e.atk * 1.2, owner: e, follow: true });
    this.floatText(e.x, e.y - 52, '迴旋斬', '#ff9b8a', 13);
  },
  knightThrust(e, tg, dT) {
    const L = this.leadPoint(tg, e, 520, 0.6), a = Math.atan2(L.y - e.y, L.x - e.x), len = clamp(dT + 40, 130, 250);
    e.state = 'charge'; e.t = 0; e.chA = a; e.face = a; e.chWind = e.elite ? 0.48 : 0.56; e.chLen = len;
    this.addTele({ kind: 'line', x: e.x, y: e.y, ang: a, len: len + 20, w: 46, dur: e.chWind + 0.1, dmg: e.atk * 1.25, owner: e });
  },

  /* ---------- 幽靈術士：保持距離、近身瞬移、追蹤魔彈、連環爆破、紫色詛咒 ---------- */
  aiWisp(e, dt, tg, dT, toT) {
    e.z = 12 + Math.sin(this.time * 3 + e.id) * 4;
    switch (e.state) {
      case 'idle': {
        let mx = 0, my = 0;
        if (dT < 200) { mx = -Math.cos(toT); my = -Math.sin(toT); }
        else if (dT > 300) { mx = Math.cos(toT); my = Math.sin(toT); }
        else { const tA = toT + (Math.PI / 2) * e.side; mx = Math.cos(tA) * 0.7; my = Math.sin(tA) * 0.7; if (Math.random() < dt * 0.4) e.side *= -1; }
        e.x += mx * 64 * dt; e.y += my * 64 * dt; e.face = toT;
        e.cd -= dt; e.blCD -= dt;
        if (dT < 115 && e.blCD <= 0) { e.state = 'blink'; e.t = 0; e.blinked = false; e.blCD = e.elite ? 2.2 : 3.0; SFX.teleport(); break; }
        if (e.cd <= 0 && dT < 480 && this.targetsCache.length) {
          const r = Math.random(), curse = this.lv >= 3 || e.elite;
          if (curse && r < 0.22) this.wispCurse(e, tg);
          else if (r < 0.6) this.wispBombs(e, tg);
          else this.wispOrbs(e, toT);
        }
        break;
      }
      case 'blink':
        e.t += dt;
        if (!e.blinked && e.t >= 0.3) {
          e.blinked = true;
          let bx = e.x, by = e.y;
          for (let k = 0; k < 12; k++) {
            const a = rand(0, TAU), r = rand(230, 290);
            bx = clamp(tg.x + Math.cos(a) * r, 50, this.W - 50); by = clamp(tg.y + Math.sin(a) * r, 60, this.H - 50);
            if (dist(bx, by, tg.x, tg.y) > 200) break;
          }
          this.burst(e.x, e.y - 20, '#b28cff', 14, 160, 'star'); e.x = bx; e.y = by; e.kbx = e.kby = 0; this.burst(e.x, e.y - 20, '#e2d4ff', 14, 160, 'star');
        }
        if (e.t >= 0.6) { e.state = 'idle'; e.cd = Math.min(e.cd, 0.4); }
        break;
      case 'cast':
        e.t += dt;
        if (e.fireFn && e.t >= e.fireAt) { const f = e.fireFn; e.fireFn = null; f(); }
        if (e.t >= e.castDur) { e.state = 'idle'; e.cd = rand(1.5, 2.3) * (e.elite ? 0.72 : 1); }
        break;
      default: e.state = 'idle';
    }
  },
  wispOrbs(e, toT) {
    e.state = 'cast'; e.t = 0; e.castDur = 0.8; e.fireAt = 0.45;
    const n = e.elite ? 5 : 3;
    e.fireFn = () => { if (e.dead) return; this.spawnEProj('orb', e.x, e.y - 24, toT, 150, e.atk, e.elite ? 1.8 : 1.4, n, 0.5); SFX.magic(); };
  },
  wispBombs(e, tg) {
    e.state = 'cast'; e.t = 0; e.castDur = 0.9; e.fireFn = null;
    const n = e.elite ? 4 : 3, L = this.leadPoint(tg, e, 400, 1);
    const vx = tg.vx || 0, vy = tg.vy || 0, moving = Math.hypot(vx, vy) > 30, a0 = moving ? Math.atan2(vy, vx) : rand(0, TAU);
    for (let i = 0; i < n; i++) {
      // 玩家移動中：沿住移動方向一路炸過去；企定：先炸腳下再圍住佢炸
      let x = L.x, y = L.y;
      if (i > 0) {
        if (moving) { x = L.x + Math.cos(a0) * 78 * i; y = L.y + Math.sin(a0) * 78 * i; }
        else { const a = a0 + ((i - 1) * TAU) / (n - 1); x = tg.x + Math.cos(a) * 80; y = tg.y + Math.sin(a) * 80; }
      }
      this.addTele({ kind: 'circle', x: clamp(x, 30, this.W - 30), y: clamp(y, 40, this.H - 30), r: 54, t: -i * 0.3, dur: 0.85, dmg: e.atk * 1.15 });
    }
    SFX.warn();
  },
  wispCurse(e, tg) {
    e.state = 'cast'; e.t = 0; e.castDur = 1.1; e.fireFn = null;
    this.addTele({ kind: 'circle', x: tg.x, y: tg.y, r: 66, dur: 1.15, dmg: e.atk * 1.4, owner: e, purple: true, track: tg.ref, lock: 0.6 });
    this.floatText(e.x, e.y - 56, '詛咒', '#d58bff', 14); SFX.warn();
  },

  /* ---------- 頭目：牛頭人 ---------- */
  updateBoss(e, dt, d, toT, tg) {
    if (!e.enraged && e.hp < e.maxHp * 0.5 && (e.state === 'idle' || e.state === 'cast')) {
      e.enraged = true; e.state = 'roar'; e.t = 0; e.chain = null; e.z = 0; this.teles = this.teles.filter((t) => t.owner !== e);
      this.banner = { text: '狂暴化！', sub: '攻擊變得更猛烈', t: 0, dur: 1.5, color: '#ff4d5e' }; SFX.roar(); this.shake = 14;
    }
    if (e.state === 'idle') {
      if (!e.sum1 && e.hp < e.maxHp * 0.72) { e.sum1 = true; this.bossSummon(e, 0); return; }
      if (!e.sum2 && e.hp < e.maxHp * 0.3) { e.sum2 = true; this.bossSummon(e, 1); return; }
    }
    const spd = e.enraged ? 125 : 95;
    switch (e.state) {
      case 'roar': e.t += dt; if (e.t > 0.9) { e.state = 'idle'; e.cd = 0.3; } break;
      case 'idle': {
        e.face = toT;
        if (d > 90) { e.x += Math.cos(toT) * spd * dt; e.y += Math.sin(toT) * spd * dt; }
        e.cd -= dt;
        if (e.cd <= 0 && this.targetsCache.length) { const k = this.bossPick(e, d); e.last = k; this.bossAttack(e, k, toT, tg); }
        break;
      }
      case 'cast':
        e.t += dt;
        if (e.t >= e.castDur) {
          if (e.chain && e.chain.length) { const nx = e.chain.shift(); this.bossAttack(e, nx, Math.atan2(tg.y - e.y, tg.x - e.x), tg, true); }
          else { e.chain = null; e.state = 'idle'; e.cd = e.enraged ? rand(0.3, 0.6) : rand(0.6, 1.0); }
        }
        break;
      case 'charge': {
        e.t += dt;
        const W0 = e.chWind;
        if (e.t < W0) { e.face = e.chA; break; }
        if (e.t < W0 + 0.6) {
          const sp = e.enraged ? 720 : 660;
          e.x += Math.cos(e.chA) * sp * dt; e.y += Math.sin(e.chA) * sp * dt;
          if (Math.random() < 0.6) this.parts.push({ x: e.x + rand(-20, 20), y: e.y, vx: rand(-30, 30), vy: rand(-40, -10), life: 0.5, max: 0.5, color: '#b89a7a', size: rand(4, 8), kind: 'smoke' });
          if (!e.chHit && this.localAlive() && dist(e.x, e.y, this.p.x, this.p.y) < e.r + 16) { e.chHit = true; this.hurtPlayer(e.atk * 1.2, e, { kb: 260 }); }
        } else if (e.chargesLeft > 0) { e.chargesLeft--; this.bossAttack(e, 'charge', Math.atan2(tg.y - e.y, tg.x - e.x), tg, true); }
        else { e.state = 'idle'; e.cd = e.enraged ? 0.5 : 0.9; }
        break;
      }
      case 'leap': {
        e.t += dt;
        const C = 0.32, T = e.leapT, tl = e.leapTele, tx = tl ? tl.x : e.lx0, ty = tl ? tl.y : e.ly0;
        if (e.t < C) e.face = Math.atan2(ty - e.y, tx - e.x);
        else if (e.t < T) { const k = (e.t - C) / (T - C); e.x = lerp(e.lx0, tx, k); e.y = lerp(e.ly0, ty, k); e.z = Math.sin(k * Math.PI) * 110; }
        else {
          e.z = 0; e.x = tx; e.y = ty; e.leapTele = null; this.dust(e.x, e.y, 12);
          if (e.enraged) this.addTele({ kind: 'ring', x: e.x, y: e.y, ri: 110, r: 235, dur: 0.6, dmg: e.atk * 1.2, owner: e });
          e.state = 'cast'; e.t = 0; e.castDur = e.enraged ? 0.75 : 0.6;
        }
        break;
      }
      default: e.state = 'idle';
    }
  },
  bossPick(e, d) {
    const en = e.enraged, lv = this.lv;
    const W = d < 125
      ? { swing: 3, combo: 2.5, purple: 1.4, slam: 1, quake: lv >= 3 ? 2 : 0.6, fissure: en ? 1.6 : 0.5 }
      : { slam: 2, charge: 2, leap: lv >= 3 ? 2.4 : 1, axe: 2, purple: 0.8, fissure: en ? 1.7 : 0.7, quake: 0.5 };
    if (e.last && W[e.last]) W[e.last] *= 0.2;
    let sum = 0; for (const k in W) sum += W[k];
    let r = Math.random() * sum;
    for (const k in W) { r -= W[k]; if (r <= 0) return k; }
    return 'slam';
  },
  bossAttack(e, kind, toT, tg, chained = false) {
    e.t = 0;
    const en = e.enraged, d = dist(e.x, e.y, tg.x, tg.y);
    if (kind === 'swing' || kind === 'combo') {
      e.state = 'cast'; e.face = toT;
      const dur = chained ? 0.42 : kind === 'combo' ? 0.48 : 0.55;
      e.castDur = dur + 0.22;
      if (kind === 'combo') e.chain = en ? ['swing', 'slam'] : ['slam'];
      this.addTele({ kind: 'fan', x: e.x, y: e.y, ang: toT, r: 128, arc: 2.2, dur, dmg: e.atk, owner: e });
    } else if (kind === 'slam') {
      e.state = 'cast'; e.castDur = 1.2;
      const pts = [[tg.x, tg.y]];
      const extra = (en ? 3 : 1) + (this.lv >= 5 ? 1 : 0);
      for (let i = 0; i < extra; i++) pts.push([clamp(tg.x + rand(-170, 170), 40, this.W - 40), clamp(tg.y + rand(-170, 170), 40, this.H - 40)]);
      pts.forEach(([x, y], i) => this.addTele({ kind: 'circle', x, y, r: 95, t: -i * 0.12, dur: 0.95, dmg: e.atk * 1.3, owner: e }));
      SFX.warn();
    } else if (kind === 'purple') {
      const dur = en ? 1.2 : 1.4;
      e.state = 'cast'; e.castDur = dur + 0.3;
      if (en) e.chain = ['fissure'];
      this.addTele({ kind: 'circle', x: e.x, y: e.y, r: en ? 195 : 168, dur, dmg: e.atk * 1.8, owner: e, purple: true, follow: true });
      this.floatText(e.x, e.y - e.r * 2.8, '無敵貫通', '#d58bff', 16, true);
      SFX.warn();
    } else if (kind === 'charge') {
      e.state = 'charge'; e.chA = toT; e.chHit = false; e.chWind = chained ? 0.45 : 0.7;
      if (!chained) e.chargesLeft = en ? 2 : 0;
      this.addTele({ kind: 'line', x: e.x, y: e.y, ang: toT, len: 420, w: 70, dur: e.chWind, dmg: 0, owner: e, visualOnly: true });
      SFX.warn();
    } else if (kind === 'leap') {
      e.state = 'leap'; e.leapT = en ? 1.0 : 1.15; e.lx0 = e.x; e.ly0 = e.y;
      e.leapTele = this.addTele({ kind: 'circle', x: tg.x, y: tg.y, r: 108, dur: e.leapT, dmg: e.atk * 1.5, owner: e, track: tg.ref, lock: e.leapT - 0.42 });
      this.floatText(e.x, e.y - e.r * 2.8, '跳躍重擊', '#ffb38a', 15); SFX.jump(); SFX.warn();
    } else if (kind === 'quake') {
      // 先內圈後外圈：先走出去，再走返入嚟
      e.state = 'cast'; e.castDur = 1.55;
      this.addTele({ kind: 'circle', x: e.x, y: e.y, r: 130, dur: 0.85, dmg: e.atk * 1.3, owner: e });
      this.addTele({ kind: 'ring', x: e.x, y: e.y, ri: 130, r: 285, t: -0.62, dur: 0.8, dmg: e.atk * 1.3, owner: e });
      this.floatText(e.x, e.y - e.r * 2.8, '大地震擊', '#ffb38a', 15); SFX.warn();
    } else if (kind === 'fissure') {
      const n = en ? 8 : 6;
      e.state = 'cast'; e.castDur = en ? 1.55 : 1.05;
      for (let i = 0; i < n; i++) this.addTele({ kind: 'line', x: e.x, y: e.y, ang: toT + (i * TAU) / n, len: 400, w: 42, dur: 0.95, dmg: e.atk * 1.15, owner: e });
      if (en) for (let i = 0; i < n; i++) this.addTele({ kind: 'line', x: e.x, y: e.y, ang: toT + ((i + 0.5) * TAU) / n, len: 400, w: 42, t: -0.6, dur: 0.8, dmg: e.atk * 1.15, owner: e });
      this.floatText(e.x, e.y - e.r * 2.8, '裂地斬', '#ffb38a', 15); SFX.warn();
    } else if (kind === 'axe') {
      e.state = 'cast'; e.castDur = 0.85; e.face = toT;
      const D = clamp(d + 90, 220, 400), n = en ? 2 : 1, angs = n > 1 ? [toT - 0.3, toT + 0.3] : [toT];
      angs.forEach((a) => this.addTele({ kind: 'line', x: e.x, y: e.y, ang: a, len: D, w: 44, dur: 0.4, dmg: 0, owner: e, visualOnly: true }));
      setTimeoutGame(this, 0.4, () => { if (e.dead || this.over) return; angs.forEach((a) => this.spawnEProj('axe', e.x, e.y - 14, a, 470, e.atk * 1.1, D)); SFX.whoosh(); });
    }
  },
  bossSummon(e, n) {
    e.state = 'roar'; e.t = 0; e.chain = null;
    this.floatText(e.x, e.y - e.r * 3, '召喚手下！', '#ff9b6b', 18); SFX.roar(); this.shake = Math.max(this.shake, 10);
    const list = this.lv >= 5 ? (n ? ['knight', 'wisp', 'skel!'] : ['knight', 'skel', 'wisp']) : this.lv >= 3 ? (n ? ['knight', 'wisp'] : ['skel', 'skel', 'slime']) : ['slime', 'slime', 'skel'];
    list.forEach((raw, i) => {
      const a = (i / list.length) * TAU + rand(-0.3, 0.3);
      const x = clamp(e.x + Math.cos(a) * 150, 50, this.W - 50), y = clamp(e.y + Math.sin(a) * 150, 60, this.H - 50);
      const m = this.makeEnemy(waveType(raw), this.uid++, x, y, waveElite(raw)); m.spawnT = 0.8 + i * 0.15; m.spawnMax = m.spawnT; this.enemies.push(m);
    });
  },
  // 協力（加入者）：怪物係房主同步過嚟的影子，本地只做插值同自己受傷判定
  updatePuppets(dt) {
    const p = this.p, alive = this.localAlive();
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.flash -= dt; e.contactCD -= dt; e.hitT -= dt; e.t += dt;
      if (e.spawnT > 0) e.spawnT -= dt;
      const k = e.state === 'charge' || e.state === 'leap' ? 22 : 11;
      e.x += (e.tx - e.x) * Math.min(1, dt * k); e.y += (e.ty - e.y) * Math.min(1, dt * k);
      e.z += (e.tz - e.z) * Math.min(1, dt * 20);
      if (e.spawnT > 0 || !alive) continue;
      const dP = dist(e.x, e.y, p.x, p.y);
      if (e.type === 'slime' && e.state !== 'leap' && dP < e.r + 13 && e.contactCD <= 0 && e.z < 12) { this.hurtPlayer(e.atk, e, { kb: 140 }); e.contactCD = 0.9; }
      if (e.type === 'boss') {
        if (e.state === 'charge' && !e.chHitLocal && dP < e.r + 16) { e.chHitLocal = true; this.hurtPlayer(e.atk * 1.2, e, { kb: 260 }); }
        if (e.state !== 'charge') e.chHitLocal = false;
        if (e.state === 'charge' && Math.random() < 0.5) this.parts.push({ x: e.x + rand(-20, 20), y: e.y, vx: rand(-30, 30), vy: rand(-40, -10), life: 0.5, max: 0.5, color: '#b89a7a', size: rand(4, 8), kind: 'smoke' });
      }
    }
    this.enemies = this.enemies.filter((e) => !e.dead);
  },
  updateTeles(dt) {
    const p = this.p;
    for (const t of this.teles) {
      t.t += dt;
      if (t.follow && t.owner && !t.owner.dead) { t.x = t.owner.x; t.y = t.owner.y; }
      if (t.track && t.t < (t.lock || 0)) { t.x = t.track.x; t.y = t.track.y; }
      if (t.t >= t.dur && !t.fired) {
        t.fired = true; this.firedTeles.add(t.id);
        if (t.visualOnly) continue;
        if (this.localAlive() && teleHits(t, p.x, p.y)) this.hurtPlayer(t.dmg, t, { unblockable: !!t.purple, kb: t.light ? 120 : 240 });
        this.teleFireFx(t);
      }
    }
    this.teles = this.teles.filter((t) => !t.fired && !(t.owner && t.owner.dead));
  },
  teleFireFx(t) {
    const col = t.purple ? '#c06bff' : t.ice ? '#9fe3ff' : t.light ? '#ffc04d' : '#ff5d4d';
    if (t.ice) for (let i = 0; i < 6; i++) this.pfx('snow', t.x + rand(-t.r * 0.5, t.r * 0.5), t.y + rand(-10, 10), { vx: rand(-80, 80), vy: rand(-140, -40), life: 0.6, color: '#bfe9ff', size: 2.5, vr: 4 });
    if (t.kind === 'line') {
      for (let i = 1; i <= 4; i++) { const k = i / 4, x = t.x + Math.cos(t.ang) * t.len * k, y = t.y + Math.sin(t.ang) * t.len * k; this.burst(x, y, '#ffb38a', 4, 200, 'dot'); this.dust(x, y, 2); }
      this.shake = Math.max(this.shake, 6);
    } else if (t.kind === 'ring') {
      this.ring(t.x, t.y, col, t.r, 0.45); this.ring(t.x, t.y, '#ffd0b0', t.ri, 0.35);
      for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU, rr = (t.r + t.ri) / 2; this.dust(t.x + Math.cos(a) * rr, t.y + Math.sin(a) * rr * 0.8, 2); }
      this.shake = Math.max(this.shake, 10);
    } else {
      this.ring(t.x, t.y, col, t.r, 0.45);
      this.burst(t.x, t.y, t.purple ? '#d9a3ff' : t.light ? '#ffe0a0' : '#ffb38a', t.purple ? 40 : t.light ? 10 : 24, t.light ? 200 : 300, t.light ? 'spark' : 'dot');
      this.dust(t.x, t.y, t.purple ? 10 : t.light ? 3 : 6);
      this.shake = Math.max(this.shake, t.purple ? 16 : t.light ? 3 : 9);
    }
    if (t.light) SFX.stab(); else SFX.boom();
  },
  updateProjs(dt) {
    const p = this.p;
    for (const pr of this.projs) {
      pr.life -= dt;
      if (pr.kind === 'bolt' || pr.kind === 'parrow') {
        // 目標死咗或者冇鎖定：直線飛，唔會再自動搵新目標
        if (pr.target && pr.target.dead) pr.target = null;
        if (pr.target && pr.homing) {
          const want = Math.atan2(pr.target.y - pr.target.r * 0.8 - pr.y, pr.target.x - pr.x);
          const cur = Math.atan2(pr.vy, pr.vx), sp = pr.kind === 'parrow' ? Math.hypot(pr.vx, pr.vy) : Math.min(Math.hypot(pr.vx, pr.vy) + 500 * dt, 620);
          const na = cur + clamp(angDiff(cur, want), -pr.homing * dt, pr.homing * dt);
          pr.vx = Math.cos(na) * sp; pr.vy = Math.sin(na) * sp; pr.ang = na;
        }
        if (pr.kind === 'bolt' && Math.random() < 0.6) this.parts.push({ x: pr.x, y: pr.y, vx: 0, vy: 0, life: 0.25, max: 0.25, color: pr.color, size: pr.r * 0.6, kind: 'dot' });
      }
      pr.x += pr.vx * dt; pr.y += pr.vy * dt;
      if (pr.maxD) {
        pr.traveled += Math.hypot(pr.vx, pr.vy) * dt;
        if (pr.traveled > pr.maxD) { pr.life = 0; this.burst(pr.x, pr.y, pr.color, 5, 90, 'star'); continue; }
      }
      for (const e of this.enemies) {
        if (e.dead || e.spawnT > 0 || pr.hit.has(e.id)) continue;
        if (dist(pr.x, pr.y, e.x, e.y - e.r * 0.6) <= pr.r + e.r) {
          pr.hit.add(e.id);
          if (!pr.ghost) {
            this.dealDamage(e, pr.mult, { ...(pr.o || {}), ang: Math.atan2(pr.vy, pr.vx), kb: pr.kind === 'wave' ? 120 : 70 });
            if (pr.sp) { this.gainSp(this.cur().st.spr, this.cur(), e); SFX.hit(false); }
          }
          if (pr.kind === 'bolt' || (pr.kind === 'parrow' && !pr.pierce)) { pr.life = 0; this.burst(pr.x, pr.y, pr.color, pr.kind === 'bolt' ? 8 : 4, 160, pr.kind === 'bolt' ? 'star' : 'spark'); break; }
        }
      }
      if (pr.x < -50 || pr.y < -50 || pr.x > this.W + 50 || pr.y > this.H + 50) pr.life = 0;
    }
    this.projs = this.projs.filter((pr) => pr.life > 0);
    const alive = this.localAlive(), tgs = this.targetsCache || [];
    for (const a of this.eprojs) {
      a.life -= dt; a.age += dt;
      if (a.kind === 'axe') {
        // 回力飛斧：飛出去再飛返嚟，來回各判定一次
        const k = a.age / a.T, s = k < 1 ? easeOut(k) : 1 - easeIn(k - 1), ph = k < 1 ? 0 : 1;
        if (ph !== a.ph) { a.ph = ph; a.hitDone = false; }
        a.x = a.ox + Math.cos(a.ang) * a.D * s; a.y = a.oy + Math.sin(a.ang) * a.D * s; a.spin += dt * 20;
        if (k >= 2) a.life = 0;
      } else {
        if ((a.kind === 'orb' || a.kind === 'fire') && a.age > 0.25) {
          let best = null, bd = 1e9;
          for (const t of tgs) { if (t.dying) continue; const d = dist(a.x, a.y, t.x, t.y - 14); if (d < bd) { bd = d; best = t; } }
          if (best) { const want = Math.atan2(best.y - 14 - a.y, best.x - a.x), cur = Math.atan2(a.vy, a.vx), sp = Math.hypot(a.vx, a.vy), na = cur + clamp(angDiff(cur, want), -a.hom * dt, a.hom * dt); a.vx = Math.cos(na) * sp; a.vy = Math.sin(na) * sp; }
          if (Math.random() < 0.5) this.parts.push({ x: a.x, y: a.y, vx: 0, vy: 0, life: 0.3, max: 0.3, color: a.kind === 'fire' ? '#ff8a3a' : '#b28cff', size: 3, kind: a.kind === 'fire' ? 'ember' : 'dot' });
        } else if (a.kind === 'goo') { const f = Math.pow(0.3, dt); a.vx *= f; a.vy *= f; }
        else if (a.kind === 'spore') { const f = Math.pow(0.22, dt); a.vx *= f; a.vy *= f; }
        a.x += a.vx * dt; a.y += a.vy * dt;
      }
      if (alive && !a.hitDone && a.dmg > 0 && dist(a.x, a.y, p.x, p.y - 14) < (EP_HIT_R[a.kind] || 16)) {
        if (a.kind === 'axe') a.hitDone = true; else a.life = 0;
        this.hurtPlayer(a.dmg, { x: a.x - a.vx, y: a.y - a.vy }, { kb: a.kind === 'axe' || a.kind === 'snowball' ? 200 : 100 });
      }
      if (a.x < -40 || a.y < -40 || a.x > this.W + 40 || a.y > this.H + 40) a.life = 0;
    }
    this.eprojs = this.eprojs.filter((a) => a.life > 0);
  },

  /* ---------- 特效輔助 ---------- */
  burst(x, y, color, n, spd, kind = 'dot') {
    for (let i = 0; i < n; i++) {
      if (this.parts.length > 480) break;
      const a = rand(0, TAU), s = rand(spd * 0.3, spd);
      this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (kind === 'coin' ? 120 : 0), life: rand(0.3, 0.7), max: 0.7, color, size: kind === 'coin' ? 4 : rand(2, 4.5), kind, grav: kind === 'coin' ? 500 : 0 });
    }
  },
  dust(x, y, n) {
    const col = { grass: '#d8e8b0', canyon: '#e8cfa0', temple: '#d6d9e2', lava: '#8a6a60', snow: '#ffffff', swamp: '#7a8a5a', sky: '#eef3fa', abyss: '#5a4a6a' }[this.theme] || '#d8d8d8';
    for (let i = 0; i < n; i++) { if (this.parts.length > 480) break; this.parts.push({ x: x + rand(-8, 8), y: y + rand(-3, 3), vx: rand(-60, 60), vy: rand(-30, -5), life: rand(0.3, 0.55), max: 0.55, color: col, size: rand(3, 6), kind: 'smoke' }); }
  },
  ring(x, y, color, r, dur) { this.fx.push({ t: 0, dur, draw: (ctx, f) => { const k = f.t / f.dur; ctx.globalAlpha = 1 - k; ctx.strokeStyle = color; ctx.lineWidth = 6 * (1 - k) + 1; ctx.beginPath(); ctx.ellipse(x, y, r * easeOut(k), r * 0.75 * easeOut(k), 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; } }); },
  floatText(x, y, text, color, size = 16) { this.texts.push({ x, y, vx: 0, text, color, size, life: 0.9, max: 0.9, vy: -55, alpha: 1 }); },
  doAttackHit(d) {
    const m = this.cur(), cls = m.char.cls, p = this.p;
    if (ATK_DEF[cls].melee) {
      let first = null;
      const before = this.combo.n;
      const n = this.hitCone(p.x, p.y, p.face, d.range, d.arc, d.mult, { kb: d.kb ? 240 : 80, breaker: !!d.charged });
      if (n > 0) first = this.nearestEnemy(p.x, p.y, d.range + 40);
      this.slashFx(d, p, cls, p.atkStep, p.swordBuff > 0);
      if (n > 0) { this.gainSp(m.st.spr, m, first); if (cls === 'fist') SFX.punch(); SFX.hit(!!d.kb); this.hitstop = Math.max(this.hitstop, d.kb ? (this.net ? 0.03 : 0.05) : 0.02); if (d.kb) { this.shake = Math.max(this.shake, 4); this.zoomPunch = Math.max(this.zoomPunch, 0.03); } }
      else if (cls === 'fist') SFX.punch();
      void before;
    } else if (cls === 'bow') {
      // 箭矢：速度快、射程遠；單箭會輕微追蹤鎖定目標，蓄力箭貫穿
      const n = d.arrows || 1, aim = this.atkAim('bow', !!d.charged), tgt = p.atkTgt && !p.atkTgt.dead ? p.atkTgt : null;
      for (let i = 0; i < n; i++) {
        const a = p.face + (i - (n - 1) / 2) * 0.16;
        this.projs.push({ kind: 'parrow', x: p.x + Math.cos(a) * 14, y: p.y - 16 + Math.sin(a) * 14, vx: Math.cos(a) * 580, vy: Math.sin(a) * 580, ang: a, r: d.big ? 10 : 6, life: 1.2, mult: d.mult, target: n === 1 ? tgt : null, homing: n === 1 && tgt ? 3.5 : 0, maxD: aim + 30, traveled: 0, hit: new Set(), color: d.big ? '#fff1a6' : m.char.accent, sp: true, pierce: !!d.pierce, big: !!d.big, o: { breaker: !!d.charged } });
      }
      if (this.net) this.netEmit('b', Math.round(p.x), Math.round(p.y), Math.round(p.face * 100), d.big ? 1 : 0, n, 1);
      SFX.arrow();
    } else {
      // 魔彈：只追蹤射程內鎖定的敵人，飛到射程盡頭就消散
      const n = d.bolts || 1, aim = this.atkAim('mage', !!d.charged), tgt = p.atkTgt && !p.atkTgt.dead ? p.atkTgt : null;
      for (let i = 0; i < n; i++) {
        const a = p.face + (i - (n - 1) / 2) * 0.35;
        this.projs.push({ kind: 'bolt', x: p.x + Math.cos(a) * 16, y: p.y - 20 + Math.sin(a) * 16, vx: Math.cos(a) * 340, vy: Math.sin(a) * 340, r: d.big ? 13 : 6.5, life: 1.6, mult: d.mult, target: tgt, homing: tgt ? 6 : 0, maxD: aim + 40, traveled: 0, hit: new Set(), color: d.big ? '#fff1a6' : m.char.accent, sp: true, o: { breaker: !!d.charged } });
      }
      if (this.net) this.netEmit('b', Math.round(p.x), Math.round(p.y), Math.round(p.face * 100), d.big ? 1 : 0, n);
      SFX.magic();
    }
    if (d.charged && cls === 'sword') { p.swordBuff = 5; this.floatText(p.x, p.y - 74, '劍氣強化 普攻+50%', '#ffd36b', 14); }
  },

  /* ---------- 主更新 ---------- */
  update(dtReal) {
    if (this.paused) return;
    const dt = Math.min(dtReal, 1 / 30);
    // 自動畫質：持續掉幀就減少粒子同特效層數
    this.dtAvg = this.dtAvg == null ? dt : lerp(this.dtAvg, Math.min(dtReal, 0.1), 0.05);
    if (!this.lowFx) { if (this.dtAvg > 0.027) { this.slowFrames = (this.slowFrames || 0) + dt; if (this.slowFrames > 1.2) this.lowFx = true; } else this.slowFrames = 0; }
    this.hudT -= dt;
    if (this.hudT <= 0) { this.hudT = 0.1; this.emitHud(); }
    this.updateTexts(dt);
    if (this.cutin) { this.cutin.t += dt; if (this.cutin.t >= this.cutin.dur) this.cutin = null; }
    if (this.remoteCutin) { this.remoteCutin.t += dt; if (this.remoteCutin.t >= this.remoteCutin.dur) this.remoteCutin = null; }
    if (this.pendingCast) { this.pendingCast.t -= dt; if (this.pendingCast.t <= 0) { const c = this.pendingCast; this.pendingCast = null; this.runSkill(c.m, c.sk, c.which); } }
    if (this.flash) { this.flash.t += dt; if (this.flash.t >= this.flash.dur) this.flash = null; }
    if (this.milestone) { this.milestone.t += dt; if (this.milestone.t > 1.3) this.milestone = null; }
    this.zoomPunch *= Math.pow(0.003, dt);
    if (this.banner) { this.banner.t += dt; if (this.banner.t >= this.banner.dur) this.banner = null; }
    if (this.net) this.netTick(dt);
    if (this.hitstop > 0) { this.hitstop -= dt; this.updateParticles(dt * 0.2); return; }
    // 慢鏡：一開始最慢，之後平滑回復正常速度
    let ws = 1;
    if (this.slowT > 0) {
      if (this.slowT > (this.slowMax || 0)) this.slowMax = this.slowT;
      this.slowT -= dt; const k = clamp(this.slowT / this.slowMax, 0, 1);
      ws = 1 - 0.78 * Math.pow(k, 0.6);
      if (this.slowT <= 0) this.slowMax = 0;
    }
    const wdt = dt * ws;
    this.time += wdt; this.hintT -= dt;
    const inp = this.inp, p = this.p, now = performance.now();
    if (inp.down && inp.state === 'press' && !inp.noTap && now - inp.t0 >= CHARGE_MS && this.canAct()
      && (p.state === 'idle' || p.state === 'move' || (p.state === 'attack' && p.atkHit))) {
      inp.state = 'charge'; p.state = 'charge'; p.chargeT = 0; inp.sel = null; inp.chargeAt = now; p.atkQueued = false;
      SFX.ready(); haptic(12); this.ring(p.x, p.y, CLS[this.cur().char.cls].color, 46, 0.25);
    }
    if (inp.down && inp.state === 'press' && inp.noTap && now - inp.t0 >= CHARGE_MS && this.canAct() && (p.state === 'idle' || p.state === 'move')) {
      inp.noTap = false; inp.t0 = now - CHARGE_MS;
    }
    if (p.state === 'charge' && inp.state !== 'charge') p.state = 'idle';
    this.updatePlayer(wdt);
    if (wdt > 0) {
      // 玩家移動速度（平滑），俾怪物預判用；翻滾太快會令預判失準，所以設上限
      const k = Math.min(1, wdt * 8), mx = 170;
      this.pv.x += (clamp((p.x - this.pv.lx) / wdt, -mx, mx) - this.pv.x) * k; this.pv.y += (clamp((p.y - this.pv.ly) / wdt, -mx, mx) - this.pv.y) * k;
    }
    this.pv.lx = p.x; this.pv.ly = p.y;
    if (this.isClient) { this.targetsCache = this.aiTargets(); this.updatePuppets(wdt); } else this.updateEnemies(wdt);
    this.updateProjs(wdt);
    this.updateTeles(wdt);
    for (const f of this.fx) { f.t += wdt; f.update && f.update(f, wdt); }
    this.fx = this.fx.filter((f) => f.t < f.dur);
    if (this.timers) { for (const tm of this.timers) { tm.t -= wdt; if (tm.t <= 0 && !tm.done) { tm.done = true; tm.fn(); } } this.timers = this.timers.filter((tm) => !tm.done); }
    this.updateParticles(wdt);
    this.updateWaves(dt);
    if (this.combo.t > 0) { this.combo.t -= wdt; if (this.combo.t <= 0) { this.combo.n = 0; this.nextMilestone = 30; } }
    if (this.buffT > 0) { this.buffT -= wdt; if (this.buffT <= 0) this.buffAtk = 0; }
    this.switchCD -= dt;
    if (this.pendingSwitch > 0) { this.pendingSwitch -= dt; if (this.pendingSwitch <= 0) { const n = this.members.findIndex((mm) => !mm.dead); if (n >= 0) { this.active = n; Object.assign(p, { state: 'idle', inv: 1.2, mercy: 0 }); this.switchCD = 0; this.floatText(p.x, p.y - 60, `${this.cur().char.name} 上場`, '#ffffff', 16); SFX.swap(); } } }
    this.members.forEach((mm, i) => { if (i !== this.active && !mm.dead) mm.sp = Math.min(mm.st.sp, mm.sp + 0.5 * wdt); });
    if (this.net) this.updateRevive(wdt);
    // 鏡頭（自己倒下時跟隨隊友）
    let fx0 = p.x, fy0 = p.y;
    if (this.cur().dead && this.net) { const r = [...this.remotes.values()].find((q) => !q.d); if (r) { fx0 = r.x; fy0 = r.y; } }
    const tx = clamp(fx0 - this.viewW / 2, 0, Math.max(0, this.W - this.viewW));
    const ty = clamp(fy0 - this.viewH * 0.55, 0, Math.max(0, this.H - this.viewH));
    this.cam.x = lerp(this.cam.x, tx, 1 - Math.pow(0.0015, dt));
    this.cam.y = lerp(this.cam.y, ty, 1 - Math.pow(0.0015, dt));
    this.shake *= Math.pow(0.004, dt);
  },
  updatePlayer(dt) {
    const p = this.p, m = this.cur(), cls = m.char.cls, inp = this.inp;
    p.inv -= dt; p.mercy -= dt; p.rollCD -= dt; p.jg -= dt; p.comboWin -= dt; p.swordBuff -= dt; p.shieldFlash -= dt; p.swapFlash -= dt; p.saveFlash -= dt * 1.5;
    for (const g of p.trail) g.life -= dt;
    p.trail = p.trail.filter((g) => g.life > 0);
    if (m.dead) { p.state = 'down'; return; }
    if (m.dying > 0) {
      p.state = 'dying'; m.dying -= dt; this.dangerT -= dt;
      if (this.dangerT <= 0) { this.dangerT = 0.25; SFX.danger(); }
      if (Math.random() < 0.5) this.parts.push({ x: p.x + rand(-12, 12), y: p.y - rand(4, 30), vx: 0, vy: -40, life: 0.4, max: 0.4, color: '#ff5d6c', size: 2.5, kind: 'dot' });
      if (m.dying <= 0) this.memberDown();
      return;
    }
    if (p.state === 'down' || p.state === 'dying') p.state = 'idle';
    const cmb = Math.min(this.combo.n, 50) / 50;
    const atkSpd = cls === 'fist' ? 1 + cmb * 0.6 : 1;
    const moveSpd = 150 * (cls === 'fist' ? 1 + cmb * 0.35 : 1);
    let mvx = 0, mvy = 0, want = false;
    if (inp.down && inp.state === 'drag') { const dx = inp.cx - inp.sx, dy = inp.cy - inp.sy, d = Math.hypot(dx, dy); if (d > 2) { mvx = dx / d; mvy = dy / d; want = true; } }
    const K = this.keys; const kx = (K.right ? 1 : 0) - (K.left ? 1 : 0), ky = (K.down ? 1 : 0) - (K.up ? 1 : 0);
    if (kx || ky) { const d = Math.hypot(kx, ky); mvx = kx / d; mvy = ky / d; want = true; }
    switch (p.state) {
      case 'idle': case 'move':
        if (want) {
          p.x += mvx * moveSpd * dt; p.y += mvy * moveSpd * dt; p.face = Math.atan2(mvy, mvx); p.state = 'move'; p.walkT += dt;
          this.stepT -= dt; if (this.stepT <= 0) { this.stepT = 0.17; this.dust(p.x, p.y, 1); }
        } else p.state = 'idle';
        break;
      case 'attack': {
        const d = p.atkDef;
        if (want && p.atkT > d.hit + 0.05) { p.state = 'move'; p.atkQueued = false; p.comboWin = 0.3; break; }
        p.atkT += dt * atkSpd;
        if (p.atkT < d.hit && p.lunge > 0) { const step = Math.min(p.lunge, (p.lunge / Math.max(0.01, d.hit - p.atkT + dt)) * dt * atkSpd); p.x += Math.cos(p.face) * step; p.y += Math.sin(p.face) * step; p.lunge -= step; }
        if (!p.atkHit && p.atkT >= d.hit) { p.atkHit = true; this.doAttackHit(d); }
        if (p.atkT >= d.dur) {
          const steps = ATK_DEF[cls].steps;
          if (p.atkQueued && !d.charged) this.startAttackStep(p.atkStep + 1);
          else { p.state = 'idle'; p.comboWin = d.charged || p.atkStep >= steps.length - 1 ? 0 : 0.45; }
        }
        break;
      }
      case 'roll':
        p.rollT -= dt;
        if (cls !== 'mage') {
          const sp = 470 * (0.45 + (0.55 * Math.max(0, p.rollT)) / 0.3);
          p.x += Math.cos(p.rollDir) * sp * dt; p.y += Math.sin(p.rollDir) * sp * dt;
          p.trailT -= dt; if (p.trailT <= 0) { p.trailT = 0.035; p.trail.push({ x: p.x, y: p.y, face: p.face, life: 0.28 }); }
        }
        if (p.rollT <= 0) { p.state = 'idle'; this.dust(p.x, p.y, 3); if (p.atkQueued) { p.atkQueued = false; this.attack(); } }
        break;
      case 'charge':
        p.chargeT += dt;
        if (Math.random() < 0.5) this.parts.push({ x: p.x + rand(-16, 16), y: p.y + rand(-3, 3), vx: 0, vy: rand(-90, -40), life: 0.5, max: 0.5, color: CLS[cls].color, size: rand(1.5, 3), kind: 'dot' });
        break;
      case 'skill':
        p.skillT -= dt;
        if (p.skillT <= 0) { p.state = 'idle'; if (p.atkQueued) { p.atkQueued = false; this.attack(); } }
        break;
      case 'hurt':
        p.hurtT -= dt; p.x += p.kbx * dt; p.y += p.kby * dt; p.kbx *= Math.pow(0.001, dt); p.kby *= Math.pow(0.001, dt);
        if (p.hurtT <= 0) { p.state = 'idle'; if (p.atkQueued) { p.atkQueued = false; this.attack(); } }
        break;
      default: break;
    }
    if (p.state !== 'roll' && p.state !== 'skill') {
      for (const e of this.enemies) {
        if (e.dead || e.spawnT > 0 || (e.z || 0) > 20) continue;
        const d = dist(p.x, p.y, e.x, e.y), mn = e.r + 10;
        if (d < mn && d > 0.01) { const k = (mn - d) / d; p.x += (p.x - e.x) * k; p.y += (p.y - e.y) * k; }
      }
    }
    p.x = clamp(p.x, 24, this.W - 24); p.y = clamp(p.y, 30, this.H - 24);
  },
  // 協力：倒下後地上出現救援圈，有未倒下的隊友企喺圈內累積 5 秒就復活（由倒下嗰位玩家自己判定）
  updateRevive(dt) {
    const m = this.cur(), p = this.p;
    if (!m.dead || this.over) { this.rvT = 0; this.rvIn = false; return; }
    let inside = false;
    for (const r of this.remotes.values()) if (!r.d && !(r.dy > 0) && Math.hypot(r.x - p.x, (r.y - p.y) / 0.6) <= REVIVE_R + 6) { inside = true; break; }
    this.rvIn = inside;
    this.rvT = inside ? this.rvT + dt : Math.max(0, this.rvT - dt * 0.5);
    if (inside && Math.random() < 0.5) this.pfx('glow', p.x + rand(-REVIVE_R, REVIVE_R) * 0.8, p.y + rand(-12, 12), { vy: rand(-90, -40), life: 0.6, color: '#8dffb5', size: 2.5, drag: 0.5 });
    if (this.rvT >= REVIVE_T) {
      this.rvT = 0; m.dead = false; m.dying = 0; m.hp = Math.round(m.st.hp * 0.35); m.sp = Math.max(m.sp, Math.round(m.st.sp * 0.2));
      Object.assign(p, { state: 'idle', inv: 2, mercy: 0 });
      this.floatText(p.x, p.y - 70, '隊友救援成功！', '#8dffb5', 20, true); this.ring(p.x, p.y - 16, '#8dffb5', 110, 0.6); this.burst(p.x, p.y - 20, '#8dffb5', 26, 240, 'star');
      SFX.heal(); haptic(40);
    }
  },
  updateParticles(dt) {
    const p = this.p;
    for (const q of this.parts) {
      if (q.delay > 0 && q.kind !== 'orb') { q.delay -= dt; continue; }
      q.life -= dt;
      if (q.vr) q.rot += q.vr * dt;
      if (q.sway) q.x += Math.sin(q.life * 5 + q.seed) * q.sway * dt;
      if (q.kind === 'orb') {
        if (q.delay > 0) { q.delay -= dt; q.vx *= Math.pow(0.05, dt); q.vy += 260 * dt; }
        else {
          const tx = p.x, ty = p.y - 18, a = Math.atan2(ty - q.y, tx - q.x), sp = 520;
          q.vx = lerp(q.vx, Math.cos(a) * sp, Math.min(1, dt * 8)); q.vy = lerp(q.vy, Math.sin(a) * sp, Math.min(1, dt * 8));
          if (dist(q.x, q.y, tx, ty) < 14) { q.life = 0; if (q.home === 'soul') SFX.soul(); }
        }
      }
      q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.grav) q.vy += q.grav * dt;
      const dr = q.drag != null ? q.drag : q.grav ? null : 0.08;
      if (dr != null && q.kind !== 'orb') { const f = Math.pow(dr, dt); q.vx *= f; q.vy *= f; }
    }
    this.parts = this.parts.filter((q) => q.life > 0);
  },
  updateTexts(dt) { for (const t of this.texts) { t.life -= dt; t.y += t.vy * dt; t.x += (t.vx || 0) * dt; t.vy *= Math.pow(0.15, dt); } this.texts = this.texts.filter((t) => t.life > 0); },
  updateWaves(dt) {
    if (this.over) {
      this.overT += dt;
      if (!this.ended && this.overT > (this.over === 'win' ? 2.6 : 2.0)) { this.ended = true; this.onEnd && this.onEnd(this.result()); }
      return;
    }
    if (this.isClient) return;
    if (this.isHost) {
      const allDead = this.cur().dead && [...this.remotes.values()].every((r) => r.d);
      if (allDead) { this.allDeadT += dt; if (this.allDeadT > 1.2) { this.lose(); return; } } else this.allDeadT = 0;
    }
    const alive = this.enemies.some((e) => !e.dead);
    if (this.wave >= 0 && alive) return;
    if (this.waveDelay > 0) { this.waveDelay -= dt; return; }
    const next = this.wave + 1;
    if (next >= this.stage.waves.length) { this.win(); return; }
    this.wave = next; this.waveDelay = 1.1;
    this.spawnWave(this.stage.waves[next]);
  },
  win() {
    if (this.over) return;
    this.over = 'win'; this.overT = 0; this.teles = []; this.eprojs = [];
    this.banner = { text: 'STAGE CLEAR', sub: this.stage.name, t: 0, dur: 2.6, color: '#ffe17a' };
    SFX.victory();
  },
  lose(reason) {
    if (this.over) return;
    this.over = 'lose'; this.overT = 0; this.endReason = reason || null;
    this.banner = { text: reason === 'host' ? '房主離開了' : '全員倒下', sub: reason === 'host' ? '戰鬥中止' : '冒險失敗', t: 0, dur: 2.2, color: '#ff6b7a' };
    SFX.defeat();
  },
  result() { return { win: this.over === 'win', loot: this.loot, maxCombo: this.combo.max, time: this.time, stage: this.stage, reason: this.endReason }; },
  emitHud() {
    if (!this.onHud) return;
    const team = [];
    if (this.net) {
      const m = this.cur();
      team.push({ me: true, nick: this.net.nick, c: m.char.id, aw: m.awakened, hp: Math.max(0, Math.round(m.hp)), mh: m.st.hp, sp: Math.floor(m.sp), ms: m.st.sp, d: m.dead, dy: m.dying > 0, slot: this.net.slot, rv: m.dead ? this.rvT / REVIVE_T : 0 });
      for (const r of this.remotes.values()) team.push({ me: false, nick: r.nick, c: r.c, aw: r.aw, hp: r.hp, mh: r.mh, sp: r.sp, ms: r.ms, d: r.d, dy: r.dy > 0, slot: r.slot, rv: (r.rv || 0) / 100 });
      team.sort((a, b) => a.slot - b.slot);
    }
    this.onHud({ active: this.active, switchCD: Math.max(0, this.switchCD), team, members: this.members.map((m) => ({ hp: Math.max(0, Math.round(m.hp)), maxHp: m.st.hp, sp: Math.floor(m.sp), maxSp: m.st.sp, dead: m.dead, dying: m.dying > 0 })) });
  },
});
