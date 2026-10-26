
/* ============================================================
 * 7. 戰鬥引擎（Canvas + requestAnimationFrame）
 *    03 核心／輸入／傷害／技能　03b 怪物與迴圈　03c 協力同步　03d 繪圖
 * ============================================================ */
const VIEW_W = 350;           // 畫面固定顯示 350 個世界單位寬
const TAP_MS = 200;           // 點擊判定時間
const MOVE_PX = 15;           // 拖曳判定距離
const CHARGE_MS = 250;        // 長按蓄力時間（愈短出技能選單愈快）
const REVIVE_R = 54;          // 協力：救援圈半徑
const REVIVE_T = 5;           // 協力：企喺救援圈內幾多秒先救返
const ROLL_IFRAME = 0.34;     // 翻滾無敵時間
const GRACE = 0.5;            // 瀕死緩衝：HP 歸零後 0.5 秒內被治癒即可得救
const NET_GRACE = 0.3;        // 協力模式額外補償網絡延遲
const MERCY = 0.28;           // 受傷後短暫無敵

const ST_NAME = ['idle', 'move', 'attack', 'roll', 'charge', 'skill', 'hurt', 'dying', 'down'];
const ST_CODE = Object.fromEntries(ST_NAME.map((n, i) => [n, i]));
// 新增種類／狀態一律加喺尾，協力同步用索引
const E_TYPES = ['slime', 'skel', 'boss', 'knight', 'wisp', 'wolf', 'shroom', 'garg', 'imp', 'yeti', 'dragon'];
const E_ST = ['idle', 'hop', 'aim', 'cast', 'charge', 'roar', 'leap', 'guard', 'blink', 'dive', 'stone', 'fly'];
const SLOT_COLORS = ['#ffe17a', '#7fd6ff', '#ff8fb0', '#9dff9a'];
// lock：角色多久後可再行動；inv：無敵維持多久
const SKILL_TIMING = {
  snipe: { lock: 0.55, inv: 0.65 }, volley: { lock: 0.3, inv: 0.45 }, backshot: { lock: 0.3, inv: 0.5 }, mapcannon: { lock: 0.6, inv: 1.0 },
  wave: { lock: 0.3, inv: 0.45 }, whirl: { lock: 0.95, inv: 0.95 }, nova: { lock: 0.36, inv: 0.6 }, meteor: { lock: 0.4, inv: 0.8 },
  beam: { lock: 0.85, inv: 0.85 }, dash: { lock: null, inv: null }, quake: { lock: 0.45, inv: 0.7 }, barrage: { lock: 0.28, inv: 0.5 },
  heal: { lock: 0.32, inv: 0.6 }, rain: { lock: 0.36, inv: 0.7 }, flurry: { lock: 0.66, inv: 0.68 },
};
// 攻擊範圍（鎖定距離）：敵人喺範圍內先會自動轉向、突進或追蹤；範圍外就照角色面向出招
const SKILL_RANGE = { wave: 300, whirl: 125, nova: 220, meteor: 250, beam: 330, dash: 250, quake: 230, barrage: 260, heal: 0, rain: 200, flurry: 105, snipe: 400, volley: 260, backshot: 260, mapcannon: Infinity };
const ATK_AIM = { sword: 118, fist: 100, lance: 150, mage: 250, bow: 270 };
const skillRange = (sk, cls) => (sk.kind === 'dash' && cls === 'lance' ? 290 : SKILL_RANGE[sk.kind] ?? 200);
const rangeLabel = (r) => (r === Infinity ? '全圖' : r <= 0 ? '全隊' : r < 140 ? '近' : r < 240 ? '中' : '遠');

const ATK_DEF = {
  sword: { melee: true, steps: [
    { dur: 0.3, hit: 0.11, range: 64, arc: 2.3, mult: 1.0, lunge: 26 },
    { dur: 0.3, hit: 0.11, range: 64, arc: 2.3, mult: 1.1, lunge: 26 },
    { dur: 0.42, hit: 0.16, range: 76, arc: 3.0, mult: 1.7, lunge: 38, kb: 1 },
  ], charge: { dur: 0.5, hit: 0.16, range: 92, arc: 3.8, mult: 2.0, lunge: 30, kb: 1, charged: true } },
  fist: { melee: true, steps: [
    { dur: 0.17, hit: 0.06, range: 48, arc: 1.7, mult: 0.55, lunge: 20 },
    { dur: 0.17, hit: 0.06, range: 48, arc: 1.7, mult: 0.55, lunge: 20 },
    { dur: 0.19, hit: 0.07, range: 50, arc: 1.7, mult: 0.65, lunge: 22 },
    { dur: 0.19, hit: 0.07, range: 50, arc: 1.7, mult: 0.7, lunge: 22 },
    { dur: 0.3, hit: 0.12, range: 58, arc: 2.2, mult: 1.3, lunge: 34, kb: 1 },
  ], charge: { dur: 0.42, hit: 0.16, range: 66, arc: 1.8, mult: 2.2, lunge: 80, kb: 1, charged: true } },
  lance: { melee: true, steps: [
    { dur: 0.32, hit: 0.13, range: 92, arc: 0.8, mult: 1.1, lunge: 30 },
    { dur: 0.32, hit: 0.13, range: 92, arc: 0.8, mult: 1.2, lunge: 30 },
    { dur: 0.45, hit: 0.18, range: 112, arc: 1.0, mult: 1.9, lunge: 46, kb: 1 },
  ], charge: { dur: 0.5, hit: 0.18, range: 140, arc: 0.7, mult: 2.4, lunge: 40, kb: 1, charged: true } },
  mage: { melee: false, steps: [
    { dur: 0.3, hit: 0.12, mult: 0.72, bolts: 1 },
    { dur: 0.3, hit: 0.12, mult: 0.72, bolts: 1 },
    { dur: 0.48, hit: 0.18, mult: 0.52, bolts: 3 },
  ], charge: { dur: 0.45, hit: 0.15, mult: 1.9, bolts: 1, big: true, charged: true } },
  // 射手：箭矢射程遠、速度快；第三段扇形三連箭；蓄力一箭可以貫穿
  bow: { melee: false, steps: [
    { dur: 0.26, hit: 0.1, mult: 0.8, arrows: 1 },
    { dur: 0.26, hit: 0.1, mult: 0.8, arrows: 1 },
    { dur: 0.42, hit: 0.18, mult: 0.55, arrows: 3 },
  ], charge: { dur: 0.5, hit: 0.2, mult: 2.3, arrows: 1, big: true, pierce: true, charged: true } },
};

function enemyStats(type, lv, n = 1, elite = false) {
  const d = ENEMY[type];
  const hpMul = (1 + (lv - 1) * 0.6) * (1 + 0.6 * (n - 1)), atkMul = 1 + (lv - 1) * 0.5;
  const hard = d.boss && lv >= 5 ? 1.3 : 1;
  const eh = elite ? 1.8 : 1, ea = elite ? 1.2 : 1;
  return { hp: Math.round(d.hp * hpMul * hard * eh), atk: Math.round(d.atk * atkMul * hard * ea), def: Math.round(d.def * (1 + (lv - 1) * 0.2) * (elite ? 1.15 : 1)), r: Math.round(d.r * (elite ? 1.22 : 1)) };
}
// 關卡波次寫法：'slime!' = 精英
const waveType = (s) => String(s).replace('!', '');
const waveElite = (s) => String(s).endsWith('!');
const SLIME_COL = { grass: '#5fd38d', canyon: '#ff9f5a', temple: '#6fb8ff', lava: '#ff6b6b', snow: '#9fd8ff', swamp: '#8ad04a', sky: '#ffd36b', abyss: '#b06bff' };
const ENEMY_COL = { skel: '#efe6cf', boss: '#a0603a', knight: '#d9d2c0', wisp: '#9b7bff', wolf: '#cfe6ff', shroom: '#a05ad8', garg: '#8a8f9e', imp: '#e04a3a', yeti: '#e8f2ff', dragon: '#6a3a9a' };
// 怪物投射物：箭、追蹤魔彈、回力飛斧、黏液
const EP_KINDS = ['arrow', 'orb', 'axe', 'goo', 'spore', 'bomb', 'snowball', 'fire'];
const TELE_KINDS = ['circle', 'fan', 'line', 'ring'];
const EP_HIT_R = { arrow: 16, orb: 15, axe: 26, goo: 13, spore: 14, bomb: 0, snowball: 22, fire: 16 };
function makeEProj(kind, x, y, ang, spd, dmg, extra) {
  const a = { kind, x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, ang, dmg, life: 2.2, age: 0, hitDone: false };
  if (kind === 'orb') { a.life = 3.4; a.hom = extra || 1.4; }
  else if (kind === 'axe') { a.ox = x; a.oy = y; a.D = extra || 320; a.T = (a.D / spd) * 1.25; a.life = a.T * 2 + 0.2; a.spin = 0; a.ph = 0; }
  else if (kind === 'goo') a.life = 1.5;
  else if (kind === 'spore') a.life = 2.8;
  else if (kind === 'bomb') { a.T = extra || 1; a.life = a.T; }
  else if (kind === 'snowball') a.life = 2.4;
  else if (kind === 'fire') { a.life = 3.2; a.hom = extra || 1.2; }
  return a;
}
// 預警圈判定（圓形同環形按畫面上的橢圓計，睇到幾大就打幾大）
function teleHits(t, x, y) {
  const pad = 8, dx = x - t.x, dy = y - t.y;
  if (t.kind === 'circle' || t.kind === 'ring') {
    const de = Math.hypot(dx, dy / 0.8);
    return t.kind === 'circle' ? de <= t.r + pad : de >= t.ri - pad && de <= t.r + pad;
  }
  if (t.kind === 'fan') { const dd = Math.hypot(dx, dy); return dd <= t.r + pad && (Math.abs(angDiff(t.ang, Math.atan2(dy, dx))) <= t.arc / 2 || dd < 30); }
  if (t.kind === 'line') {
    const ux = Math.cos(t.ang), uy = Math.sin(t.ang), along = dx * ux + dy * uy;
    if (along < -pad || along > t.len + pad) return false;
    return Math.abs(-dx * uy + dy * ux) <= t.w / 2 + pad;
  }
  return false;
}
const easeOutBack = (t) => { t = clamp(t, 0, 1); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

class Battle {
  constructor({ stage, party, onEnd, onHud, net }) {
    this.stage = stage; this.lv = stage.lv; this.theme = stage.theme;
    this.W = 840; this.H = 1240;
    this.onEnd = onEnd; this.onHud = onHud;
    this.net = net ? { role: net.role, bid: net.bid, hostPeer: net.hostPeer, nick: net.nick || '我', slot: net.slot || 0, n: net.n || 1, seq: 0, out: [], hostSeen: false, players: net.players || [], grace: net.grace ?? NET_GRACE } : null;
    this.coopN = this.net ? this.net.n : 1;
    this.remotes = new Map();
    this.members = party.map((m) => ({ char: m.char, awakened: !!m.prog?.awakened, st: m.stats, hp: m.stats.hp, sp: Math.round(m.stats.sp * 0.1), dead: false, dying: 0 }));
    this.active = 0;
    const sx = this.W / 2 + (this.net ? (this.net.slot - 1.5) * 46 : 0);
    this.p = this.newPlayer(sx, this.H - 300);
    this.enemies = []; this.projs = []; this.eprojs = []; this.fx = []; this.parts = []; this.texts = []; this.teles = [];
    this.inp = { down: false, state: 'none', sx: 0, sy: 0, ox: 0, oy: 0, cx: 0, cy: 0, t0: 0, hist: [], sel: null, noTap: false, chargeAt: 0 };
    this.keys = {};
    this.time = 0; this.shake = 0; this.hitstop = 0; this.slowT = 0; this.zoomPunch = 0; this.flash = null;
    this.cam = { x: this.p.x - VIEW_W / 2, y: this.p.y - 400 };
    this.viewW = VIEW_W; this.viewH = 700; this.zoom = 1; this.cssW = 400; this.cssH = 700;
    this.combo = { n: 0, t: 0, max: 0 }; this.nextMilestone = 30; this.milestone = null;
    this.wave = -1; this.waveDelay = this.net ? 1.6 : 0.9; this.banner = null; this.cutin = null; this.pendingCast = null; this.remoteCutin = null;
    this.over = null; this.overT = 0; this.ended = false; this.endReason = null; this.allDeadT = 0;
    this.loot = { gold: 0, souls: 0, runes: {}, kills: 0 };
    this.buffAtk = 0; this.buffT = 0;
    this.switchCD = 0; this.pendingSwitch = -1;
    this.paused = false;
    this.decor = genDecor(this.theme, this.W, this.H);
    this.pattern = null; this.uid = 1; this.hudT = 0; this.hintT = 5; this.atkCount = 0;
    this.safeTop = 0; this.bossRef = null; this.predKilled = new Map(); this.firedTeles = new Set(); this.dangerT = 0; this.stepT = 0;
    this.pv = { x: 0, y: 0, lx: this.p.x, ly: this.p.y }; // 玩家移動速度（怪物預判用）
    this.lockTgt = null; this.btnSel = null; this.rvT = 0;
  }
  get isHost() { return !!this.net && this.net.role === 'host'; }
  get isClient() { return !!this.net && this.net.role === 'client'; }
  newPlayer(x, y) {
    return { x, y, face: -Math.PI / 2, state: 'idle', walkT: 0, atkStep: 0, atkT: 0, atkDef: null, atkHit: false, atkQueued: false,
      comboWin: 0, lunge: 0, rollT: 0, rollDir: 0, rollCD: 0, inv: 0, mercy: 0, hurtT: 0, kbx: 0, kby: 0, skillT: 0,
      trail: [], trailT: 0, swordBuff: 0, jg: 0, chargeT: 0, shieldFlash: 0, swapFlash: 0, saveFlash: 0 };
  }
  cur() { return this.members[this.active]; }
  graceTotal() { return GRACE + (this.net ? this.net.grace : 0); }
  resize(w, h) { this.cssW = w; this.cssH = h; this.zoom = w / VIEW_W; this.viewW = VIEW_W; this.viewH = h / this.zoom; }
  netEmit(type, ...args) {
    if (!this.net) return;
    this.net.seq++; this.net.out.push([this.net.seq, type, ...args]);
    if (this.net.out.length > 40) this.net.out.shift();
  }

  /* ---------- 輸入：PuniCon ---------- */
  canAct() { const m = this.cur(); return !this.paused && !this.over && !m.dead && !(m.dying > 0); }
  pointerDown(x, y) {
    if (!this.canAct()) return;
    const now = performance.now(), inp = this.inp;
    Object.assign(inp, { down: true, state: 'press', sx: x, sy: y, ox: x, oy: y, cx: x, cy: y, t0: now, hist: [{ x, y, t: now }], sel: null, noTap: false });
    if (this.cur().char.cls === 'lance') this.p.jg = 0.22;
  }
  pointerMove(x, y) {
    const inp = this.inp; if (!inp.down) return;
    const now = performance.now();
    inp.cx = x; inp.cy = y; inp.hist.push({ x, y, t: now });
    while (inp.hist.length > 2 && now - inp.hist[0].t > 160) inp.hist.shift();
    const d = dist(inp.sx, inp.sy, x, y);
    if (inp.state === 'press' && dist(inp.ox, inp.oy, x, y) > MOVE_PX) inp.state = 'drag';
    if (inp.state === 'drag' && d > 72) { const k = (d - 72) / d; inp.sx += (x - inp.sx) * k; inp.sy += (y - inp.sy) * k; }
    if (inp.state === 'charge') {
      const sel = this.skillDirSel(x - inp.sx, y - inp.sy);
      if (sel !== inp.sel) { inp.sel = sel; inp.selAt = now; if (sel && sel !== 'cancel') { SFX.tick(); haptic(8); } }
    }
  }
  pointerUp(x, y) {
    const inp = this.inp; if (!inp.down) return;
    const now = performance.now();
    if (x != null) { inp.cx = x; inp.cy = y; }
    inp.down = false;
    const st = inp.state; inp.state = 'none';
    if (!this.canAct()) { if (this.p.state === 'charge') this.p.state = 'idle'; return; }
    if (st === 'charge') {
      if (this.p.state === 'charge') this.p.state = 'idle';
      const sel = this.skillDirSel(inp.cx - inp.sx, inp.cy - inp.sy);
      if (sel === 'cancel') return;
      if (sel) this.trySkill(sel); else this.chargeRelease();
      return;
    }
    let old = inp.hist[0];
    for (const h of inp.hist) { if (now - h.t <= 90) { old = h; break; } }
    const dt = Math.max(16, now - old.t);
    const vx = (inp.cx - old.x) / dt, vy = (inp.cy - old.y) / dt;
    const speed = Math.hypot(vx, vy), moved = dist(old.x, old.y, inp.cx, inp.cy);
    if (speed > 0.55 && moved > 22) { this.roll(vx, vy); return; }
    if (st === 'press' && !inp.noTap && now - inp.t0 < TAP_MS) this.attack();
  }
  skillDirSel(vx, vy) {
    const d = Math.hypot(vx, vy);
    if (d < 30) return null;
    if (vy > 0 && Math.abs(vx) < vy * 0.75) return 'cancel';
    if (vy < 0 && Math.abs(vx) < -vy) return 'sp';
    return vx < 0 ? 's1' : 's2';
  }
  setKey(k, down) { this.keys[k] = down; }

  /* ---------- 行動 ---------- */
  nearestEnemy(x, y, maxD = 9999) {
    let best = null, bd = maxD;
    for (const e of this.enemies) { if (e.dead || e.spawnT > 0) continue; const d = dist(x, y, e.x, e.y) - e.r; if (d < bd) { bd = d; best = e; } }
    return best;
  }
  atkAim(cls, charged) { return ATK_AIM[cls] * (charged ? 1.15 : 1); }
  // 目前選中技能（蓄力時）的範圍，用嚟畫範圍圈
  selRange() {
    const m = this.cur();
    // 左邊技能掣按住時顯示範圍
    const sel = this.inp.state === 'charge' ? this.inp.sel : this.btnSel;
    if (this.inp.state !== 'charge' && !this.btnSel) return null;
    if (sel === 's1' || sel === 's2' || sel === 'sp') {
      const sk = sel === 'sp' ? SPECIAL[m.char.cls] : m.char[sel];
      return { r: skillRange(sk, m.char.cls), sk, self: sk.kind === 'whirl' || sk.kind === 'quake' || sk.kind === 'heal' };
    }
    return { r: this.atkAim(m.char.cls, true), sk: null, self: false };
  }
  attack() {
    const p = this.p; if (!this.canAct()) return;
    if (p.state === 'attack' || p.state === 'skill' || p.state === 'roll' || p.state === 'hurt') { p.atkQueued = true; return; }
    if (p.state !== 'idle' && p.state !== 'move') return;
    const steps = ATK_DEF[this.cur().char.cls].steps;
    this.startAttackStep(p.comboWin > 0 ? (p.atkStep + 1) % steps.length : 0);
  }
  startAttackStep(step, custom) {
    const m = this.cur(), cls = m.char.cls, p = this.p, def = ATK_DEF[cls];
    const d = custom || def.steps[step % def.steps.length];
    p.state = 'attack'; p.atkStep = custom ? def.steps.length - 1 : step % def.steps.length;
    p.atkT = 0; p.atkHit = false; p.atkDef = d; p.atkQueued = false;
    p.lunge = d.lunge || 0; this.atkCount++;
    // 只會鎖定攻擊範圍內的敵人；範圍外就向面向方向揮空
    const tgt = this.nearestEnemy(p.x, p.y, this.atkAim(cls, !!d.charged));
    if (tgt) {
      p.face = Math.atan2(tgt.y - p.y, tgt.x - p.x);
      if (def.melee) {
        const gap = dist(p.x, p.y, tgt.x, tgt.y) - tgt.r - d.range * 0.6;
        p.lunge = gap > 0 ? Math.min(gap, (d.lunge || 0) + 46) : 4;
      }
    }
    p.atkTgt = tgt;
    if (cls === 'sword') SFX.slash(); else if (cls === 'lance') SFX.stab();
  }
  chargeRelease() {
    const cls = this.cur().char.cls;
    this.startAttackStep(0, ATK_DEF[cls].charge);
    this.floatText(this.p.x, this.p.y - 50, '蓄力攻擊', '#ffe88a', 15);
  }
  roll(vx, vy) {
    const p = this.p, m = this.cur();
    if (!this.canAct() || p.rollCD > 0) return;
    if (!['idle', 'move', 'attack', 'charge'].includes(p.state)) return;
    const a = Math.atan2(vy, vx);
    p.face = a; p.rollDir = a; p.inv = Math.max(p.inv, ROLL_IFRAME); p.rollCD = 0.12; p.atkQueued = false;
    this.dust(p.x, p.y, 6);
    if (m.char.cls === 'mage') {
      const ox = p.x, oy = p.y;
      p.x = clamp(p.x + Math.cos(a) * 125, 26, this.W - 26); p.y = clamp(p.y + Math.sin(a) * 125, 26, this.H - 26);
      p.state = 'roll'; p.rollT = 0.16;
      this.burst(ox, oy - 16, '#b9a8ff', 16, 140, 'star'); this.burst(p.x, p.y - 16, '#e9e2ff', 18, 160, 'star');
      this.fx.push({ t: 0, dur: 0.3, draw: (ctx, f) => { ctx.strokeStyle = `rgba(200,180,255,${1 - f.t / f.dur})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox, oy - 16); ctx.lineTo(p.x, p.y - 16); ctx.stroke(); } });
      SFX.teleport();
    } else {
      p.state = 'roll'; p.rollT = 0.3; p.trail = [];
      SFX.whoosh();
    }
  }
  trySkill(which) {
    const m = this.cur(), p = this.p;
    if (!this.canAct()) return false;
    const sk = which === 'sp' ? SPECIAL[m.char.cls] : m.char[which];
    if (m.sp < sk.sp) { this.floatText(p.x, p.y - 56, 'SP 不足', '#9fb3d9', 16); SFX.error(); return false; }
    m.sp -= sk.sp;
    p.state = 'skill'; p.skillT = 99; p.atkQueued = false; p.inv = Math.max(p.inv, 0.45);
    const tgt = this.nearestEnemy(p.x, p.y, skillRange(sk, m.char.cls));
    if (tgt) p.face = Math.atan2(tgt.y - p.y, tgt.x - p.x);
    const coop = !!this.net;
    // 技能即時發動：單人模式加入極短慢鏡，Cut-in 同步播放，不再凍結畫面
    this.cutin = { t: 0, dur: coop ? 0.8 : which === 'sp' ? 0.6 : 0.8, m, sk, which, compact: coop };
    this.pendingCast = { t: coop ? 0 : 0.03, m, sk, which };
    if (!coop) this.slowT = which === 'sp' ? 0.16 : 0.3;
    this.flash = { t: 0, dur: 0.16, col: '255,255,255' };
    this.zoomPunch = 0.1;
    this.ring(p.x, p.y - 14, CLS[m.char.cls].color, 80, 0.3);
    this.burst(p.x, p.y - 18, CLS[m.char.cls].color, 18, 260, 'star');
    SFX.cutin(); haptic(25);
    if (this.pendingCast.t <= 0) { const c = this.pendingCast; this.pendingCast = null; this.runSkill(c.m, c.sk, c.which); }
    return true;
  }
  switchTo(i) {
    const p = this.p;
    if (this.net) return false;
    if (i === this.active || !this.members[i] || this.members[i].dead) return false;
    if (this.over || this.paused || p.state === 'skill' || this.cur().dying > 0) return false;
    if (this.switchCD > 0 && !this.cur().dead) return false;
    this.active = i; this.switchCD = 0.8; this.pendingSwitch = -1;
    p.state = 'idle'; p.atkQueued = false; p.comboWin = 0; p.inv = Math.max(p.inv, 0.35); p.swapFlash = 0.4; p.swordBuff = 0;
    if (this.inp.state === 'charge') { this.inp.state = 'press'; this.inp.t0 = performance.now(); this.inp.noTap = true; }
    this.burst(p.x, p.y - 18, CLS[this.cur().char.cls].color, 22, 180, 'star');
    this.floatText(p.x, p.y - 60, `${this.cur().char.name}`, '#ffffff', 16);
    SFX.swap();
    return true;
  }
  gainSp(n, m = this.cur(), from) {
    if (m.dead) return;
    const was = m.sp >= m.st.sp;
    m.sp = Math.min(m.st.sp, m.sp + n);
    if (from && Math.random() < 0.7) this.parts.push({ x: from.x, y: from.y - from.r, vx: rand(-80, 80), vy: rand(-140, -60), life: 0.7, max: 0.7, color: '#7fe3ff', size: 3, kind: 'orb', home: 'sp' });
    if (!was && m.sp >= m.st.sp && m === this.cur()) { SFX.spFull(); this.floatText(this.p.x, this.p.y - 64, 'SP MAX', '#7fe3ff', 15); this.ring(this.p.x, this.p.y - 14, '#7fe3ff', 40, 0.3); }
  }
  applyHeal(mm, pct) {
    const amt = Math.round(mm.st.hp * pct);
    if (mm.dead) { mm.dead = false; mm.hp = Math.max(amt, Math.round(mm.st.hp * 0.08)); return 'revive'; }
    if (mm.dying > 0) { mm.dying = 0; mm.hp = Math.max(1, amt); return 'save'; }
    mm.hp = Math.min(mm.st.hp, mm.hp + amt); return 'heal';
  }
  // 收到治癒（協力：任何隊友施放；單人：自己隊伍）
  receiveHeal(pct, fromNick) {
    const m = this.cur(), p = this.p;
    const res = this.applyHeal(m, pct);
    if (res === 'save') {
      p.state = 'idle'; p.inv = Math.max(p.inv, 1.0); p.mercy = 0.5; p.saveFlash = 1;
      this.floatText(p.x, p.y - 78, '千鈞一髮！', '#fff27a', 24, true);
      if (fromNick) this.floatText(p.x, p.y - 52, `${fromNick} 救了你`, '#8dffb5', 14, true);
      this.ring(p.x, p.y - 16, '#fff27a', 110, 0.6); this.burst(p.x, p.y - 20, '#fff27a', 30, 260, 'star');
      this.flash = { t: 0, dur: 0.3, col: '255,240,160' }; this.slowT = this.net ? 0 : 0.25;
      SFX.save(); haptic(60);
    } else if (res === 'revive') {
      p.state = 'idle'; p.inv = Math.max(p.inv, 1.5); p.mercy = 0;
      this.floatText(p.x, p.y - 70, '復活！', '#8dffb5', 20, true);
      this.ring(p.x, p.y - 16, '#8dffb5', 100, 0.6); SFX.heal();
    } else {
      this.floatText(p.x, p.y - 64, `+${Math.round(m.st.hp * pct)}`, '#8dffb5', 16, true);
    }
    if (this.net && fromNick && res === 'heal') this.floatText(p.x, p.y - 82, `${fromNick} 的治癒`, '#c8ffd9', 12, true);
    return res;
  }

  /* ---------- 傷害 ---------- */
  dealDamage(e, mult, o = {}) {
    if (o.ghost || e.dead || e.spawnT > 0) return 0;
    const m = o.m || this.cur(), st = m.st, attr = CLS[m.char.cls].attr;
    let atk = st.atk * (1 + this.buffAtk);
    if (!o.skill && this.p.swordBuff > 0 && m === this.cur()) atk *= 1.5;
    let dmg = atk * mult * (o.skill ? 1 + st.skill / 100 : 1);
    const res = ENEMY[e.type].res[attr] ?? 1;
    dmg *= res;
    dmg *= 100 / (100 + e.def);
    const crit = Math.random() * 100 < st.crit;
    if (crit) dmg *= 1.5;
    const ang = o.ang ?? Math.atan2(e.y - this.p.y, e.x - this.p.x);
    // 骷髏劍士：舉盾時正面攻擊大減；蓄力攻擊可以破防
    let brk = 0;
    if (e.type === 'knight' && e.state === 'guard' && Math.abs(angDiff(ang, e.face + Math.PI)) < 1.15) {
      if (o.breaker) { brk = 1; this.floatText(e.x, e.y - e.r * 3, '破防！', '#ffe14d', 16); SFX.justGuard(); }
      else {
        dmg *= o.skill ? 0.55 : 0.22;
        if (!e.blockFx || this.time - e.blockFx > 0.25) { e.blockFx = this.time; this.floatText(e.x, e.y - e.r * 2.8, 'GUARD', '#9fd7ff', 13); SFX.guard(); this.ring(e.x + Math.cos(e.face) * 14, e.y - 16 + Math.sin(e.face) * 14, '#bfe6ff', 22, 0.2); }
      }
    }
    // 石像鬼石化：傷害大減
    if (e.state === 'stone') { dmg *= 0.15; if (!e.blockFx || this.time - e.blockFx > 0.3) { e.blockFx = this.time; this.floatText(e.x, e.y - e.r * 2.8, 'STONE', '#c9ced8', 13); SFX.guard(); } }
    dmg = Math.max(1, Math.round(dmg * rand(0.94, 1.06)));
    const kb = o.kb ?? 80, rc = res > 1 ? 1 : res < 1 ? -1 : 0;
    if (this.net) this.netEmit('h', e.id, dmg, crit ? 1 : 0, Math.round(ang * 100), Math.round(kb), rc, brk);
    this.showDmg(e, dmg, crit, rc, false, o.color);
    if (this.isClient) {
      e.hp -= dmg; e.flash = 0.1; e.hitT = 0.12;
      if (!e.boss) { e.x += Math.cos(ang) * kb * 0.12; e.y += Math.sin(ang) * kb * 0.12; }
      if (brk) e.state = 'idle';
      if (e.hp <= 0) { e.dead = true; this.predKilled.set(e.id, this.time); this.deathFx(e); }
    } else { if (brk) this.guardBreak(e); this.applyHit(e, dmg, ang, kb); }
    this.combo.n++; this.combo.t = 2.6; this.combo.max = Math.max(this.combo.max, this.combo.n);
    if (this.combo.n >= this.nextMilestone) {
      this.milestone = { n: this.nextMilestone, t: 0 }; SFX.milestone();
      this.nextMilestone = this.nextMilestone < 50 ? 50 : this.nextMilestone + 50;
    }
    if (crit) this.hitstop = Math.max(this.hitstop, this.net ? 0.02 : 0.035);
    return dmg;
  }
  applyHit(e, dmg, ang, kb) {
    if (e.dead) return;
    e.hp -= dmg; e.flash = 0.1; e.hitT = 0.12;
    if (!e.boss) {
      // 劍士／精英比較重，擊退少；出招中（飛撲、揮斬、詠唱）有霸體，唔會被打斷
      const heavy = e.type === 'knight' || e.type === 'shroom' || e.type === 'garg' || e.elite;
      const armored = e.state === 'leap' || e.state === 'cast' || e.state === 'charge' || e.state === 'blink' || e.state === 'dive' || e.state === 'stone';
      const km = e.state === 'stone' ? 0 : armored ? 0.15 : heavy ? 0.35 : 1;
      e.kbx += Math.cos(ang) * kb * km; e.kby += Math.sin(ang) * kb * km;
      if (!armored && (!heavy || kb > 100)) e.stun = Math.max(e.stun, kb > 100 ? 0.35 : 0.12);
    }
    if (e.hp <= 0) this.killEnemy(e);
  }
  guardBreak(e) {
    e.state = 'idle'; e.t = 0; e.stun = 0.9; e.cd = Math.max(e.cd, 1.2);
    this.ring(e.x, e.y - 16, '#ffe14d', 40, 0.3); this.burst(e.x, e.y - 18, '#cfe6ff', 12, 200, 'spark');
  }
  showDmg(e, dmg, crit, rc, remote, color) {
    const col = crit ? '#ffe14d' : rc > 0 ? '#ffa94d' : rc < 0 ? '#a9b3c6' : '#ffffff';
    this.texts.push({ x: e.x + rand(-10, 10), y: e.y - e.r * 1.6 - rand(0, 12), vx: rand(-30, 30), text: String(dmg), color: col, size: (crit ? 22 : 16) * (remote ? 0.8 : 1), life: 0.9, max: 0.9, vy: -70, alpha: remote ? 0.75 : 1 });
    if (crit && !remote) this.floatText(e.x, e.y - e.r * 2.5, 'CRITICAL', '#ffe14d', 11, true);
    else if (rc > 0 && Math.random() < 0.5) this.floatText(e.x, e.y - e.r * 2.4, 'WEAK!', '#ff9f43', 12, true);
    else if (rc < 0 && Math.random() < 0.5) this.floatText(e.x, e.y - e.r * 2.4, 'RESIST', '#a9b3c6', 12, true);
    this.burst(e.x, e.y - e.r * 0.8, color || (crit ? '#ffe14d' : '#ffffff'), crit ? 10 : 6, 200, 'spark');
    this.hitFx(e.x + rand(-4, 4), e.y - e.r * 0.8 + rand(-4, 4), color || (crit ? '#ffe14d' : '#ffffff'), crit);
    this.parts.push({ x: e.x, y: e.y - e.r * 0.8, vx: 0, vy: 0, life: 0.16, max: 0.16, color: crit ? '#ffe14d' : '#ffffff', size: e.r * 0.9, kind: 'ring' });
    const a = rand(0, Math.PI);
    this.parts.push({ x: e.x, y: e.y - e.r * 0.8, vx: Math.cos(a), vy: Math.sin(a), life: 0.12, max: 0.12, color: '#ffffff', size: e.r * 1.6, kind: 'streak' });
  }
  hitCircle(x, y, r, mult, o = {}) {
    if (o.ghost) return 0;
    let n = 0;
    for (const e of this.enemies) {
      if (e.dead || e.spawnT > 0) continue;
      if (o.set && o.set.has(e.id)) continue;
      if (dist(x, y, e.x, e.y) <= r + e.r) {
        if (o.pull && !e.boss && !this.isClient) { const a = Math.atan2(y - e.y, x - e.x); e.x += Math.cos(a) * 8; e.y += Math.sin(a) * 8; }
        this.dealDamage(e, mult, { ...o, ang: Math.atan2(e.y - y, e.x - x) }); n++;
        if (o.set) o.set.add(e.id);
      }
    }
    return n;
  }
  hitLine(x1, y1, x2, y2, w, mult, o = {}) {
    if (o.ghost) return 0;
    let n = 0;
    const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1;
    for (const e of this.enemies) {
      if (e.dead || e.spawnT > 0) continue;
      const t = clamp(((e.x - x1) * dx + (e.y - y1) * dy) / L2, 0, 1);
      if (dist(x1 + dx * t, y1 + dy * t, e.x, e.y) <= w / 2 + e.r) { this.dealDamage(e, mult, { ...o, ang: Math.atan2(dy, dx) }); n++; }
    }
    return n;
  }
  hitCone(x, y, ang, r, arc, mult, o = {}) {
    if (o.ghost) return 0;
    let n = 0;
    for (const e of this.enemies) {
      if (e.dead || e.spawnT > 0) continue;
      const d = dist(x, y, e.x, e.y) - e.r;
      if (d > r) continue;
      const a = Math.atan2(e.y - y, e.x - x);
      if (Math.abs(angDiff(ang, a)) <= arc / 2 || d < 12) { this.dealDamage(e, mult, { ...o, ang: a }); n++; }
    }
    return n;
  }
  addKillLoot(type, boss) {
    const lvm = 1 + (this.lv - 1) * 0.5, d = ENEMY[type];
    this.loot.gold += Math.round(d.gold * lvm); this.loot.souls += Math.round(d.souls * lvm); this.loot.kills++;
    if (Math.random() < (boss ? 1 : 0.3)) {
      for (let i = 0; i < (boss ? 4 : 1); i++) { const r = pick(RUNES).k; this.loot.runes[r] = (this.loot.runes[r] || 0) + 1; }
    }
  }
  killEnemy(e) {
    if (e.dead && e.lootDone) return;
    e.dead = true; e.lootDone = true;
    this.addKillLoot(e.type, e.boss);
    if (e.type === 'shroom' && !this.isClient && !this.over) { this.spawnEProj('spore', e.x, e.y - 14, rand(0, TAU), 150, e.atk * 0.6, 0, 6, TAU / 6); this.floatText(e.x, e.y - 40, '孢子爆散', '#d58bff', 12); }
    if (this.net) this.netEmit('k', e.id, E_TYPES.indexOf(e.type));
    this.deathFx(e);
    this.hitstop = Math.max(this.hitstop, this.net ? 0.02 : 0.04);
  }
  deathFx(e) {
    if (e.fxDone) return; e.fxDone = true;
    this.burst(e.x, e.y - e.r * 0.8, e.color || '#ffffff', e.boss ? 60 : 22, e.boss ? 360 : 220, 'dot');
    this.burst(e.x, e.y - e.r * 0.8, '#ffd84d', e.boss ? 20 : 5, 160, 'coin');
    this.parts.push({ x: e.x, y: e.y - e.r * 0.8, vx: 0, vy: 0, life: 0.35, max: 0.35, color: '#ffffff', size: e.r * 2, kind: 'ring' });
    for (let i = 0; i < (e.boss ? 10 : 3); i++) this.parts.push({ x: e.x + rand(-10, 10), y: e.y - e.r, vx: rand(-160, 160), vy: rand(-220, -80), life: 1.4, max: 1.4, color: '#c9a8ff', size: 3.5, kind: 'orb', home: 'soul', delay: 0.25 + i * 0.04 });
    SFX.enemyDie(); SFX.coin();
    if (e.boss) { this.shake = 18; this.hitstop = this.net ? 0.05 : 0.25; SFX.boom(); this.teles = []; this.flash = { t: 0, dur: 0.4, col: '255,255,255' }; }
  }
  hurtPlayer(dmg, src, o = {}) {
    const p = this.p, m = this.cur();
    if (m.dead || m.dying > 0 || this.over) return;
    const unb = !!o.unblockable;
    let shielded = false;
    if (!unb) {
      if (p.inv > 0 || p.state === 'skill' || p.mercy > 0) {
        if (p.state === 'roll') this.floatText(p.x, p.y - 50, 'MISS', '#bfe9ff', 13, true);
        return;
      }
      if (m.char.cls === 'lance' && this.inp.down && p.jg > 0) {
        const add = Math.round(m.st.sp * 0.25);
        this.gainSp(add);
        p.jg = 0; p.mercy = 0.5; p.shieldFlash = 0.5;
        this.floatText(p.x, p.y - 64, 'JUST GUARD!', '#7dffb0', 22, true);
        this.floatText(p.x, p.y - 42, `SP +${add}`, '#7fe3ff', 14, true);
        this.ring(p.x, p.y - 16, '#7dffb0', 70, 0.4); this.flash = { t: 0, dur: 0.12, col: '170,255,200' };
        this.hitstop = 0.08; SFX.justGuard(); haptic(20);
        return;
      }
      if (m.char.cls === 'lance' && p.state === 'charge') { shielded = true; dmg *= 0.3; p.shieldFlash = 0.25; SFX.guard(); }
    }
    dmg = Math.max(1, Math.round(dmg * (100 / (100 + m.st.def)) * rand(0.9, 1.1)));
    m.hp -= dmg;
    this.floatText(p.x + rand(-6, 6), p.y - 46, String(dmg), unb ? '#d58bff' : '#ff5d6c', 18, true);
    this.burst(p.x, p.y - 18, unb ? '#c06bff' : '#ff6b6b', 10, 180, 'spark');
    this.shake = Math.max(this.shake, unb ? 12 : 6);
    this.flash = { t: 0, dur: 0.15, col: unb ? '190,90,255' : '255,60,60', a: 0.25 };
    if (!shielded) { SFX.hurt(); haptic(35); }
    if (m.hp <= 0) {
      // 瀕死緩衝：0.5 秒內被治癒即可得救
      m.hp = 0; m.dying = this.graceTotal(); p.state = 'dying'; p.atkQueued = false;
      if (this.inp.down) { this.inp.state = 'press'; this.inp.noTap = true; }
      this.floatText(p.x, p.y - 70, '瀕死！', '#ff5d6c', 20, true); SFX.danger();
      return;
    }
    if (!shielded) {
      const a = src ? Math.atan2(p.y - src.y, p.x - src.x) : p.face + Math.PI;
      const kb = o.kb ?? 160;
      p.state = 'hurt'; p.hurtT = 0.28; p.kbx = Math.cos(a) * kb * 2.2; p.kby = Math.sin(a) * kb * 2.2;
      p.mercy = MERCY; p.atkQueued = false;
      if (this.inp.down && (this.inp.state === 'charge' || this.inp.state === 'press')) { this.inp.state = 'press'; this.inp.t0 = performance.now(); this.inp.noTap = true; }
    }
  }
  memberDown() {
    const m = this.cur(), p = this.p;
    m.dead = true; m.dying = 0; m.hp = 0; p.state = 'down';
    this.floatText(p.x, p.y - 60, `${m.char.name} 倒下`, '#ff8a8a', 16, true);
    this.burst(p.x, p.y - 18, '#ffffff', 26, 220, 'dot');
    if (this.net) { this.floatText(p.x, p.y - 82, '等待隊友治癒復活', '#c7cff0', 13, true); return; }
    const next = this.members.findIndex((mm) => !mm.dead);
    if (next >= 0) this.pendingSwitch = 0.8; else this.lose();
  }
  reviveAll() {
    this.members.forEach((m) => { m.dead = false; m.dying = 0; m.hp = m.st.hp; m.sp = Math.max(m.sp, Math.round(m.st.sp * 0.5)); });
    this.over = null; this.overT = 0; this.ended = false; this.banner = null;
    this.active = 0; Object.assign(this.p, { state: 'idle', inv: 2.5, mercy: 0 });
    this.teles = []; this.eprojs = [];
    this.ring(this.p.x, this.p.y - 16, '#8dffb5', 120, 0.6); SFX.heal();
  }

}
function setTimeoutGame(b, t, fn) { (b.timers || (b.timers = [])).push({ t, fn, done: false }); }
