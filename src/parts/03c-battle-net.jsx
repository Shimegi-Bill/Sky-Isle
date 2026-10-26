
/* ---------- 03c 協力模式同步 ----------
 * 傳輸只用 room presence（每位玩家一個物件，平台約每秒 30 次合併送出，可能掉包）：
 *   pl：自己角色的即時狀態
 *   ev：最近 24 個事件 [序號, 類型, ...]，收方只處理序號更新的，掉一兩次更新都唔會漏
 *   w ：（只有房主）怪物、預警圈、波次、勝負
 * 房主決定怪物；每位玩家自己判定「自己有冇被打中」，翻滾、Just Guard 手感唔受延遲影響。
 */
const NICK_BAD = new RegExp('[' + [[0, 31], [127, 159], [0x200b, 0x200f], [0x2028, 0x202e], [0x2066, 0x2069]].map(([a, b]) => `${String.fromCharCode(a)}-${String.fromCharCode(b)}`).join('') + ']', 'g');
const cleanNick = (s) => String(s || '').replace(NICK_BAD, '').trim().slice(0, 10);
Object.assign(Battle.prototype, {
  netOut() {
    const p = this.p, m = this.cur(), net = this.net;
    const pl = { b: net.bid, c: m.char.id, aw: m.awakened ? 1 : 0, x: Math.round(p.x), y: Math.round(p.y), f: Math.round(p.face * 100),
      s: ST_CODE[p.state] ?? 0, as: p.state === 'attack' && p.atkDef ? (p.atkDef.charged ? 9 : p.atkStep) : -1, ak: this.atkCount,
      hp: Math.max(0, Math.ceil(m.hp)), mh: m.st.hp, sp: Math.floor(m.sp), ms: m.st.sp, d: m.dead ? 1 : 0,
      dy: m.dying > 0 ? Math.max(1, Math.round(m.dying * 100)) : 0, sb: p.swordBuff > 0 ? 1 : 0, rv: m.dead ? Math.round((this.rvT / REVIVE_T) * 100) : 0 };
    const out = { pl, ev: net.out.slice(-24) };
    if (this.isHost) out.w = this.netWorld();
    let s = JSON.stringify(out);
    while (s.length > 3500 && out.ev.length > 4) { out.ev = out.ev.slice(Math.floor(out.ev.length / 2)); s = JSON.stringify(out); }
    if (s.length > 3500 && out.w) { out.w.tl = out.w.tl.slice(0, 4); out.w.en = out.w.en.slice(0, 10); }
    return out;
  },
  netWorld() {
    return {
      b: this.net.bid, wv: this.wave, ov: this.over || 0, k: this.loot.kills,
      en: this.enemies.filter((e) => !e.dead).map((e) => {
        const st = e.state === 'charge' && e.t < (e.chWind ?? 0.7) ? 'cast' : e.state;
        return [e.id, E_TYPES.indexOf(e.type), Math.round(e.x), Math.round(e.y), Math.max(0, Math.round(e.hp)), Math.round(e.maxHp),
          Math.max(0, E_ST.indexOf(st)), Math.round((e.state === 'aim' ? e.aimAng : e.face) * 100), Math.round(e.z || 0), (e.enraged ? 1 : 0) | (e.spawnT > 0 ? 2 : 0) | (e.elite ? 4 : 0)];
      }),
      // 預警圈：kind 0 圓 1 扇 2 直線 3 環；aw = 扇形角度／直線闊度／環內半徑；style 1 紫色 2 輕攻擊
      tl: this.teles.filter((t) => !t.fired && t.t >= 0).map((t) => [t.id, TELE_KINDS.indexOf(t.kind), Math.round(t.x), Math.round(t.y),
        Math.round(t.kind === 'line' ? t.len : t.r || 0), Math.round((t.ang || 0) * 100), t.kind === 'fan' ? Math.round(t.arc * 100) : t.kind === 'ring' ? Math.round(t.ri) : Math.round(t.w || 0),
        Math.round(t.t * 100), Math.round(t.dur * 100), t.purple ? 1 : t.light ? 2 : t.ice ? 3 : 0, t.visualOnly ? 1 : 0, Math.round(t.dmg || 0)]),
    };
  },
  netPeers(peers) {
    if (!this.net || this.ended) return;
    const net = this.net, seen = new Set();
    let hostHere = false;
    for (const pr of peers) {
      if (pr.peer === net.hostPeer) hostHere = true;
      if (pr.sameTab) continue;
      const pres = pr.presence || {}, pl = pres.pl;
      if (!pl || typeof pl !== 'object' || pl.b !== net.bid || !CHAR_BY_ID[pl.c]) continue;
      seen.add(pr.peer);
      const lob = pres.lob && typeof pres.lob === 'object' ? pres.lob : {};
      const nick = cleanNick(lob.nick) || '隊友';
      const st = ST_NAME[pl.s] || 'idle';
      let r = this.remotes.get(pr.peer);
      if (!r) {
        const slot = net.players.indexOf(pr.peer);
        r = { peer: pr.peer, nick, slot: slot >= 0 ? slot : 3, c: pl.c, aw: !!pl.aw, x: +pl.x || 0, y: +pl.y || 0, tx: +pl.x || 0, ty: +pl.y || 0,
          face: (+pl.f || 0) / 100, tf: (+pl.f || 0) / 100, s: st, as: -1, ak: pl.ak, hp: +pl.hp || 0, mh: +pl.mh || 1, sp: 0, ms: 1, d: !!pl.d, dy: 0, sb: 0, lastSeq: 0, trail: [], walkT: 0 };
        this.remotes.set(pr.peer, r);
      }
      const evs = Array.isArray(pres.ev) ? pres.ev : [];
      for (const ev of evs) {
        if (!Array.isArray(ev) || !(ev[0] > r.lastSeq)) continue;
        r.lastSeq = ev[0];
        try { this.netEvent(r, ev); } catch (err) { /* 忽略異常事件 */ }
      }
      if (pl.ak !== r.ak) { r.ak = pl.ak; if (st === 'attack') { r.tf = (+pl.f || 0) / 100; this.remoteSlash(r, pl.as); } }
      const hp = +pl.hp || 0, d = !!pl.d, dy = +pl.dy || 0;
      if (hp < r.hp && !d && !r.d) this.texts.push({ x: r.x + rand(-6, 6), y: r.y - 46, vx: 0, text: String(r.hp - hp), color: '#ff8a96', size: 13, life: 0.7, max: 0.7, vy: -50, alpha: 0.8 });
      if (dy > 0 && !(r.dy > 0)) { this.floatText(r.x, r.y - 72, `${nick} 瀕死！快治癒`, '#ff5d6c', 15); SFX.danger(); }
      if (r.d && !d) { this.floatText(r.x, r.y - 72, `${nick} 復活`, '#8dffb5', 15); this.ring(r.x, r.y - 16, '#8dffb5', 80, 0.5); }
      else if (r.dy > 0 && !dy && !d) { this.floatText(r.x, r.y - 72, `${nick} 千鈞一髮得救！`, '#fff27a', 15); this.ring(r.x, r.y - 16, '#fff27a', 90, 0.5); }
      if (!r.d && d) this.floatText(r.x, r.y - 60, `${nick} 倒下`, '#ff8a8a', 14);
      // 估算隊友移動速度（怪物預判用）
      const nx = +pl.x || 0, ny = +pl.y || 0, now = performance.now();
      if (nx !== r.tx || ny !== r.ty) {
        const dts = (now - (r.lastT || now)) / 1000;
        if (dts > 0.02 && dts < 0.5) { r.vx = lerp(r.vx || 0, clamp((nx - r.tx) / dts, -170, 170), 0.5); r.vy = lerp(r.vy || 0, clamp((ny - r.ty) / dts, -170, 170), 0.5); }
        r.lastT = now;
      } else if (now - (r.lastT || now) > 150) { r.vx = (r.vx || 0) * 0.5; r.vy = (r.vy || 0) * 0.5; }
      Object.assign(r, { nick, c: pl.c, aw: !!pl.aw, tx: +pl.x || 0, ty: +pl.y || 0, tf: (+pl.f || 0) / 100, s: st, as: pl.as, hp, mh: +pl.mh || 1, sp: +pl.sp || 0, ms: +pl.ms || 1, d, dy, sb: pl.sb ? 1 : 0, rv: clamp(+pl.rv || 0, 0, 100) });
      if (this.isClient && pr.peer === net.hostPeer && pres.w && pres.w.b === net.bid) this.netWorldIn(pres.w);
    }
    for (const [peer, r] of this.remotes) if (!seen.has(peer)) { this.remotes.delete(peer); this.floatText(r.x, r.y - 60, `${r.nick} 離開了`, '#c7cff0', 14); }
    if (this.isClient && net.hostSeen && !hostHere && !this.over) this.lose('host');
  },
  netEvent(r, e) {
    const t = e[1], fromHost = r.peer === this.net.hostPeer;
    if (t === 'h') {
      const en = this.enemies.find((q) => q.id === e[2]);
      if (!en || en.dead) return;
      const dmg = Math.max(0, Math.min(999999, +e[3] || 0));
      this.showDmg(en, dmg, !!e[4], +e[7] || 0, true);
      if (this.isHost) { if (e[8] && en.type === 'knight' && en.state === 'guard') this.guardBreak(en); this.applyHit(en, dmg, (+e[5] || 0) / 100, Math.min(300, +e[6] || 80)); }
    } else if (t === 'k') {
      if (!this.isClient || !fromHost) return;
      const type = E_TYPES[e[3]] || 'slime';
      this.addKillLoot(type, type === 'boss');
      const en = this.enemies.find((q) => q.id === e[2]);
      if (en && !en.dead) { en.dead = true; this.deathFx(en); }
    } else if (t === 'ar') {
      if (!this.isClient || !fromHost) return;
      const a = (+e[4] || 0) / 100, kind = EP_KINDS[+e[6] || 0] || 'arrow', spd = clamp(+e[7] || 400, 50, 900), extra = (+e[8] || 0) / 100;
      const n = clamp(+e[9] || 1, 1, 8), spread = (+e[10] || 0) / 100;
      for (let i = 0; i < n; i++) this.eprojs.push(makeEProj(kind, +e[2], +e[3], a + (i - (n - 1) / 2) * spread, spd, +e[5] || 50, extra));
      if (kind === 'arrow') SFX.arrow(); else if (kind === 'orb') SFX.magic(); else if (kind === 'axe') SFX.whoosh();
    } else if (t === 'sk') {
      const ch = CHAR_BY_ID[r.c]; if (!ch) return;
      const which = e[2], sk = which === 'sp' ? SPECIAL[ch.cls] : which === 's1' || which === 's2' ? ch[which] : null;
      if (!sk) return;
      const ang = (+e[5] || 0) / 100;
      const actor = sk.kind === 'dash' ? { x: +e[3], y: +e[4], face: ang, trail: r.trail } : r;
      if (actor === r) { r.x = +e[3]; r.y = +e[4]; }
      this.runSkill({ char: ch, awakened: r.aw }, sk, which, actor, true, ang, e[6] == null ? null : +e[6]);
      this.remoteCutin = { t: 0, dur: 1.2, nick: r.nick, ch, aw: r.aw, sk, which, slot: r.slot };
    } else if (t === 'hl') {
      if (this.over) return;
      this.receiveHeal(clamp((+e[2] || 0) / 100, 0, 1), r.nick);
    } else if (t === 'b' && e[7] === 1) {
      const n = clamp(+e[6] || 1, 1, 3), a0 = (+e[4] || 0) / 100, ch = CHAR_BY_ID[r.c];
      for (let i = 0; i < n; i++) {
        const a = a0 + (i - (n - 1) / 2) * 0.16;
        this.projs.push({ kind: 'parrow', x: +e[2] + Math.cos(a) * 14, y: +e[3] - 16 + Math.sin(a) * 14, vx: Math.cos(a) * 580, vy: Math.sin(a) * 580, ang: a, r: e[5] ? 10 : 6, life: 1.2, mult: 0, target: null, homing: 0, maxD: ATK_AIM.bow * (e[5] ? 1.15 : 1) + 30, traveled: 0, hit: new Set(), color: e[5] ? '#fff1a6' : ch?.accent || '#ffffff', sp: false, pierce: !!e[5], big: !!e[5], ghost: true });
      }
    } else if (t === 'b') {
      const n = clamp(+e[6] || 1, 1, 3), a0 = (+e[4] || 0) / 100, ch = CHAR_BY_ID[r.c];
      for (let i = 0; i < n; i++) {
        const a = a0 + (i - (n - 1) / 2) * 0.35;
        this.projs.push({ kind: 'bolt', x: +e[2] + Math.cos(a) * 16, y: +e[3] - 20 + Math.sin(a) * 16, vx: Math.cos(a) * 340, vy: Math.sin(a) * 340, r: e[5] ? 13 : 6.5, life: 1.6, mult: 0, target: null, homing: 0, maxD: ATK_AIM.mage * (e[5] ? 1.15 : 1) + 40, traveled: 0, hit: new Set(), color: e[5] ? '#fff1a6' : ch?.accent || '#ffffff', sp: false, ghost: true });
      }
    }
  },
  remoteSlash(r, as) {
    const ch = CHAR_BY_ID[r.c]; if (!ch) return;
    const def = ATK_DEF[ch.cls];
    const d = as === 9 ? def.charge : def.steps[clamp(+as || 0, 0, def.steps.length - 1)];
    r.face = r.tf; r.atkAnimT = 0; r.atkDef = d; r.atkStep = as === 9 ? 0 : +as || 0;
    if (def.melee) this.slashFx(d, r, ch.cls, r.atkStep, !!r.sb);
  },
  netWorldIn(w) {
    if (!w || !Array.isArray(w.en)) return;
    this.net.hostSeen = true;
    if (typeof w.wv === 'number' && w.wv !== this.wave && w.wv >= 0) { this.wave = w.wv; this.waveBanner(w.wv); }
    const ids = new Set();
    for (const a of w.en) {
      if (!Array.isArray(a)) continue;
      const [id, ti, x, y, hp, mhp, si, f, z, fl] = a;
      const type = E_TYPES[ti]; if (!type) continue;
      ids.add(id);
      const pk = this.predKilled.get(id);
      if (pk != null) { if (this.time - pk < 2.5) continue; this.predKilled.delete(id); }
      let e = this.enemies.find((q) => q.id === id);
      if (!e) {
        e = this.makeEnemy(type, id, x, y, !!(fl & 4)); e.hp = hp;
        if (fl & 2) { e.spawnT = 0.6; e.spawnMax = 0.7; }
        this.enemies.push(e); if (e.boss) this.bossRef = e;
      }
      e.tx = x; e.ty = y; e.hp = Math.min(e.hp, hp); e.maxHp = mhp;
      const st = E_ST[si] || 'idle';
      if (st !== e.state) { e.state = st; e.t = 0; if (st === 'cast') e.castDur = 1.0; }
      e.face = (f || 0) / 100; if (st === 'aim') e.aimAng = e.face;
      e.tz = z || 0;
      const enr = !!(fl & 1);
      if (enr && !e.enraged && e.boss) { this.banner = { text: '狂暴化！', sub: '攻擊變得更猛烈', t: 0, dur: 1.5, color: '#ff4d5e' }; SFX.roar(); this.shake = 14; }
      e.enraged = enr;
      if (!(fl & 2)) e.spawnT = 0;
      if (dist(e.x, e.y, x, y) > 160) { e.x = x; e.y = y; }
    }
    for (const e of this.enemies) if (!e.dead && !ids.has(e.id)) { e.dead = true; this.deathFx(e); }
    this.enemies = this.enemies.filter((e) => !e.dead);
    const tids = new Set();
    for (const a of Array.isArray(w.tl) ? w.tl : []) {
      if (!Array.isArray(a)) continue;
      const [id, k, x, y, r, an, aw, t, dur, pu, vo, dmg] = a;
      tids.add(id);
      let tl = this.teles.find((q) => q.id === id);
      if (!tl) {
        if (this.firedTeles.has(id)) continue;
        tl = { id, kind: TELE_KINDS[k] || 'circle', x, y, r, len: r, ri: aw, ang: (an || 0) / 100, arc: (aw || 0) / 100, w: aw, t: (t || 0) / 100, dur: (dur || 100) / 100, purple: pu === 1, light: pu === 2, ice: pu === 3, visualOnly: !!vo, dmg: dmg || 0 };
        this.teles.push(tl); if (pu === 1 || (tl.kind === 'circle' && !tl.light)) SFX.warn();
      } else if (!tl.fired) { tl.x = x; tl.y = y; }
    }
    this.teles = this.teles.filter((tl) => tids.has(tl.id) || tl.t >= tl.dur - 0.45);
    if (w.ov && !this.over) { if (w.ov === 'win') this.win(); else this.lose(); }
  },
  netTick(dt) {
    for (const r of this.remotes.values()) {
      if (dist(r.x, r.y, r.tx, r.ty) > 200) { r.x = r.tx; r.y = r.ty; }
      else { const k = Math.min(1, dt * 14); r.x += (r.tx - r.x) * k; r.y += (r.ty - r.y) * k; }
      r.face += angDiff(r.face, r.tf) * Math.min(1, dt * 18);
      r.walkT += dt;
      for (const g of r.trail) g.life -= dt;
      r.trail = r.trail.filter((g) => g.life > 0);
      if (r.s === 'roll') { r.trT = (r.trT || 0) - dt; if (r.trT <= 0) { r.trT = 0.04; r.trail.push({ x: r.x, y: r.y, face: r.face, life: 0.28 }); } }
      if (r.atkAnimT != null) r.atkAnimT += dt;
    }
  },
});
