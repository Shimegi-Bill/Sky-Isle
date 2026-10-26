
/* ============================================================
 * 9. 介面元件
 * ============================================================ */
const UI_CSS = `
.si-root{font-family:${FONT_UI};color:#f4efe2;-webkit-tap-highlight-color:transparent;touch-action:pan-x pan-y;}
.si-root,.si-root *{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-user-drag:none;}
.si-root input{-webkit-user-select:text;user-select:text;}
.si-num{font-family:${FONT_NUM};letter-spacing:.02em;font-variant-numeric:tabular-nums;}
.si-scroll{overflow-y:auto;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:#2c3770 transparent;}
.si-scroll::-webkit-scrollbar{width:4px}.si-scroll::-webkit-scrollbar-thumb{background:#2c3770;border-radius:4px}
.si-btn{transition:transform .08s ease, filter .15s ease;}
.si-btn:active{transform:scale(.95)}
.si-btn:focus-visible,.si-root button:focus-visible{outline:2px solid #7fd6ff;outline-offset:2px}
.si-gold{background:linear-gradient(180deg,#ffe9a3 0%,#f3c55b 45%,#d99a2b 100%);color:#2a1a05;box-shadow:inset 0 -3px 0 rgba(120,70,0,.35),0 2px 0 rgba(0,0,0,.35)}
.si-sky{background:linear-gradient(180deg,#bfeaff 0%,#6cc4f5 50%,#3f8fd6 100%);color:#0b1d3a;box-shadow:inset 0 -3px 0 rgba(10,50,110,.35),0 2px 0 rgba(0,0,0,.35)}
.si-panel{background:linear-gradient(180deg,#1a2249 0%,#141a3a 100%);border:1px solid #2c3770}
.si-pop{animation:si-pop .28s cubic-bezier(.2,1.4,.4,1) both}
@keyframes si-pop{from{transform:scale(.85);opacity:0}to{transform:none;opacity:1}}
.si-fade{animation:si-fade .25s ease both}@keyframes si-fade{from{opacity:0}to{opacity:1}}
.si-pulse{animation:si-pulse 1.2s ease-in-out infinite}@keyframes si-pulse{0%,100%{opacity:.55}50%{opacity:1}}
.si-bob{animation:si-bob 3s ease-in-out infinite}.si-spin{animation:si-spin 4s linear infinite}@keyframes si-spin{to{transform:rotate(360deg)}}@keyframes si-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.si-shine{background-size:200% 100%;animation:si-shine 2.4s linear infinite}@keyframes si-shine{from{background-position:200% 0}to{background-position:-200% 0}}
.si-stamp{animation:si-stamp .35s cubic-bezier(.2,1.6,.4,1) both}@keyframes si-stamp{from{transform:scale(2.2) rotate(-25deg);opacity:0}to{transform:rotate(-12deg);opacity:1}}
@media (prefers-reduced-motion: reduce){.si-spin,.si-pop,.si-fade,.si-pulse,.si-bob,.si-shine,.si-stamp{animation:none!important}}
`;

const Ico = {
  gem: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9z" fill="#7fe3ff" /><path d="M6 3l3 6h6l3-6M2 9h20M9 9l3 12 3-12" stroke="#2a7fb8" strokeWidth="1.3" fill="none" /></svg>,
  coin: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#f3c55b" stroke="#a8700f" strokeWidth="1.6" /><path d="M12 6v12M9 9h5a2 2 0 010 4h-4a2 2 0 000 4h5" stroke="#a8700f" strokeWidth="1.6" fill="none" /></svg>,
  soul: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c3 4 7 6 7 12a7 7 0 01-14 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4 1-6 2-9z" fill="#b48cff" stroke="#6a3fc4" strokeWidth="1.4" /><circle cx="12" cy="15" r="3" fill="#efe4ff" /></svg>,
  sword: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 4h6v6L9 21l-3-3L17 7" /><path d="M4 15l5 5M3 21l3-3" /></svg>,
  party: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" opacity=".55" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>,
  island: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 12h18l-5 7H8z" /><path d="M8 12V8l3-3 3 3v4M16 12V9h3v3" /></svg>,
  gacha: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="12" cy="7" rx="8" ry="4" /><path d="M5 9l5 6M19 9l-5 6" /><circle cx="12" cy="18" r="3" /></svg>,
  pause: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5" /><rect x="14" y="4" width="4" height="16" rx="1.5" /></svg>,
  sound: (on, s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />{on ? <path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" /> : <path d="M16 9l5 6M21 9l-5 6" />}</svg>,
  back: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 5l-7 7 7 7" /></svg>,
};
const RuneDot = ({ k, size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true"><path d="M6 0.6l5 5.4-5 5.4-5-5.4z" fill={RUNE_BY_K[k].color} stroke="rgba(0,0,0,.4)" strokeWidth=".8" /></svg>
);
const RainbowDot = ({ k, size = 14 }) => {
  const r = RAINBOW.find((x) => x.k === k);
  return <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true"><defs><linearGradient id={`rb${k}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff7eb3" /><stop offset=".5" stopColor={r.color} /><stop offset="1" stopColor="#7fd6ff" /></linearGradient></defs>{k === 'star' ? <path d="M7 .8l1.8 4 4.4.4-3.3 2.9 1 4.3L7 10.2l-3.9 2.2 1-4.3L.8 5.2l4.4-.4z" fill={`url(#rb${k})`} stroke="#fff" strokeWidth=".6" /> : k === 'crystal' ? <path d="M7 .8l4.5 4-4.5 8.4L2.5 4.8z" fill={`url(#rb${k})`} stroke="#fff" strokeWidth=".6" /> : <path d="M3 2l8 2-3 8-6-4z" fill={`url(#rb${k})`} stroke="#fff" strokeWidth=".6" />}</svg>;
};
const Stars = ({ r, className = '' }) => <span className={`tracking-[-0.1em] ${r >= 5 ? 'text-[#ff9ef0]' : r === 4 ? 'text-[#ffd76a]' : r === 3 ? 'text-[#dfe7f5]' : 'text-[#d9925a]'} ${className}`}>{'★'.repeat(r)}</span>;
const Portrait = ({ c, awakened, size = 56, className = '' }) => (
  <img src={portraitURL(c, awakened)} width={size} height={size} alt={c.name} draggable={false} className={`block select-none ${className}`} style={{ width: size, height: size }} />
);
const RARITY_RING = { 2: 'ring-[#b9763f]', 3: 'ring-[#c9d4e6]', 4: 'ring-[#ffd76a]', 5: 'ring-[#ff9ef0]' };

function Sheet({ title, onClose, children, footer }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-[#0b1026] si-fade">
      <div className="flex items-center gap-2 px-3 shrink-0 border-b border-[#34407e] bg-[#141c44]" style={{ paddingTop: 'var(--sat, 0px)', height: 'calc(52px + var(--sat, 0px))' }}>
        <button className="si-btn w-9 h-9 flex items-center justify-center rounded-full bg-[#1d2650] text-[#f4efe2]" onClick={() => { SFX.click(); onClose(); }} aria-label="返回">{Ico.back()}</button>
        <div className="text-[16px] font-bold truncate">{title}</div>
      </div>
      <div className="flex-1 min-h-0 si-scroll">{children}</div>
      {footer}
    </div>
  );
}

function readSafeInsets() {
  try {
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;left:0;top:0;width:1px;visibility:hidden;pointer-events:none;height:var(--sat,0px)';
    document.body.appendChild(d); const top = d.getBoundingClientRect().height;
    d.style.height = 'var(--sab,0px)'; const bottom = d.getBoundingClientRect().height; d.remove();
    return { top, bottom };
  } catch (e) { return { top: 0, bottom: 0 }; }
}
/* ---------- 戰鬥畫面 ---------- */
/* ---------- 戰鬥左邊技能掣：按住顯示範圍，喺掣上放手先發動，滑走放手＝取消 ---------- */
function SkillButtons({ engRef, ch, sp, dead }) {
  const act = useRef(null);
  const [held, setHeld] = useState(null);
  if (!ch) return null;
  const col = CLS[ch.cls].color;
  const list = [['sp', '爆', SPECIAL[ch.cls]], ['s2', 'S2', ch.s2], ['s1', 'S1', ch.s1]];
  const clearSel = () => { const eng = engRef.current; if (eng) eng.btnSel = null; act.current = null; setHeld(null); };
  const down = (k) => (e) => {
    if (act.current || dead) return;
    e.preventDefault(); e.stopPropagation(); SFX.unlock();
    const eng = engRef.current; if (!eng || eng.over || eng.paused) return;
    act.current = { k, id: e.pointerId, el: e.currentTarget };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) { /* 略過 */ }
    eng.btnSel = k; setHeld(k); SFX.tick(); haptic(8);
  };
  const up = (e) => {
    const a = act.current; if (!a || a.id !== e.pointerId) return;
    const r = a.el.getBoundingClientRect(), inside = e.clientX >= r.left - 14 && e.clientX <= r.right + 14 && e.clientY >= r.top - 14 && e.clientY <= r.bottom + 14;
    clearSel();
    const eng = engRef.current; if (inside && eng) eng.trySkill(a.k);
  };
  const cancel = (e) => { const a = act.current; if (a && a.id === e.pointerId) clearSel(); };
  return (
    <div className="absolute left-2 z-10 flex flex-col gap-2" style={{ bottom: 88, opacity: dead ? 0.35 : 1 }}>
      {list.map(([k, tag, sk]) => {
        const kk = clamp(sp / sk.sp, 0, 1), ready = kk >= 1, on = held === k, C = 2 * Math.PI * 26;
        return (
          <button key={k} aria-label={`${tag} ${sk.name}`} className="relative w-[60px] h-[60px] rounded-full select-none"
            style={{ touchAction: 'none', WebkitTouchCallout: 'none', transform: on ? 'scale(1.1)' : 'none', transition: 'transform .08s' }}
            onPointerDown={down(k)} onPointerUp={up} onPointerCancel={cancel} onLostPointerCapture={cancel} onContextMenu={(e) => e.preventDefault()}>
            <svg viewBox="0 0 60 60" className="absolute inset-0 w-full h-full" aria-hidden="true">
              <defs><radialGradient id={`sb${k}`} cx="40%" cy="35%" r="70%"><stop offset="0" stopColor={ready ? '#ffffff' : '#7a83a0'} /><stop offset="1" stopColor={ready ? col : '#2a3150'} /></radialGradient></defs>
              <circle cx="30" cy="30" r="26" fill={`url(#sb${k})`} opacity={ready ? 0.95 : 0.75} stroke="rgba(10,14,34,0.9)" strokeWidth="2" />
              <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="4" />
              <circle cx="30" cy="30" r="26" fill="none" stroke={ready ? '#ffe14d' : '#5fb8ff'} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${C * kk} ${C}`} transform="rotate(-90 30 30)" />
              {on && <circle cx="30" cy="30" r="29" fill="none" stroke="#ffffff" strokeWidth="2" />}
            </svg>
            <span className="absolute -top-1 -left-1 si-num text-[11px] leading-none px-1.5 py-1 rounded-full border border-[#0b1026]" style={{ background: ready ? '#ffe14d' : '#5a6290', color: '#1a1530' }}>{tag}</span>
            <span className={`absolute inset-x-0 top-[17px] text-center font-bold leading-tight ${ready ? 'text-[#1a1530]' : 'text-[#c7cff0]'}`} style={{ fontSize: sk.name.length > 4 ? 9 : 10.5 }}>{sk.name}</span>
            <span className={`absolute inset-x-0 bottom-[11px] text-center si-num text-[10px] ${ready ? 'text-[#1a1530]' : 'text-[#9fc8ff]'}`}>SP{sk.sp}</span>
          </button>
        );
      })}
    </div>
  );
}

function BattleScreen({ stage, party, gems, onWin, onSpendGems, onExit, firstClear, net }) {
  const wrapRef = useRef(null), cvRef = useRef(null), engRef = useRef(null);
  const [hud, setHud] = useState(null);
  const [paused, setPaused] = useState(false);
  const [end, setEnd] = useState(null);
  const [reward, setReward] = useState(null);
  const [muted, setMuted] = useState(SFX.isMuted());
  const coop = !!net;

  useEffect(() => {
    const eng = new Battle({ stage, party, onHud: setHud, onEnd: (r) => setEnd(r), net: net ? { role: net.role, bid: net.bid, hostPeer: net.hostPeer, nick: net.nick, slot: net.slot, n: net.n, players: net.players, grace: net.grace } : null });
    engRef.current = eng;
    const cv = cvRef.current, ctx = cv.getContext('2d');
    let dpr = 1;
    const resize = () => {
      const r = wrapRef.current.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr));
      eng.resize(r.width, r.height);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrapRef.current);
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    let pid = null;
    const down = (e) => { if (pid !== null) return; pid = e.pointerId; try { cv.setPointerCapture(e.pointerId); } catch (_) { /* 略過 */ } SFX.unlock(); const [x, y] = pos(e); eng.pointerDown(x, y); e.preventDefault(); };
    const move = (e) => { if (e.pointerId !== pid) return; const [x, y] = pos(e); eng.pointerMove(x, y); e.preventDefault(); };
    const up = (e) => { if (e.pointerId !== pid) return; pid = null; const [x, y] = pos(e); eng.pointerUp(x, y); };
    const cancel = (e) => { if (e.pointerId !== pid) return; pid = null; eng.pointerUp(); };
    const tpos = (t) => { const r = cv.getBoundingClientRect(); return [t.clientX - r.left, t.clientY - r.top]; };
    let tid = null, mouseDown = false;
    const tStart = (e) => { if (tid !== null) return; const t = e.changedTouches[0]; tid = t.identifier; SFX.unlock(); eng.pointerDown(...tpos(t)); e.preventDefault(); };
    const tMove = (e) => { for (const t of e.changedTouches) if (t.identifier === tid) eng.pointerMove(...tpos(t)); e.preventDefault(); };
    const tEnd = (e) => { for (const t of e.changedTouches) if (t.identifier === tid) { tid = null; eng.pointerUp(...tpos(t)); } };
    const mDown = (e) => { mouseDown = true; SFX.unlock(); eng.pointerDown(...tpos(e)); };
    const mMove = (e) => { if (mouseDown) eng.pointerMove(...tpos(e)); };
    const mUp = (e) => { if (!mouseDown) return; mouseDown = false; eng.pointerUp(...tpos(e)); };
    const usePointer = !!window.PointerEvent;
    // iPhone：阻止長按／連按時出現放大鏡、選字同選單
    const tBlock = (e) => { if (e.cancelable) e.preventDefault(); };
    if (usePointer) {
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', cancel);
      ['touchstart', 'touchmove', 'touchend'].forEach((n) => cv.addEventListener(n, tBlock, { passive: false }));
    } else {
      cv.addEventListener('touchstart', tStart, { passive: false }); cv.addEventListener('touchmove', tMove, { passive: false });
      cv.addEventListener('touchend', tEnd); cv.addEventListener('touchcancel', tEnd);
      cv.addEventListener('mousedown', mDown); window.addEventListener('mousemove', mMove); window.addEventListener('mouseup', mUp);
    }
    const KEYMAP = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down' };
    const kd = (e) => {
      if (e.repeat || (e.target && e.target.closest && e.target.closest('input'))) return;
      const k = KEYMAP[e.key]; if (k) { eng.setKey(k, true); e.preventDefault(); return; }
      const key = e.key.toLowerCase();
      if (key === 'j' || key === ' ') { SFX.unlock(); eng.attack(); e.preventDefault(); }
      else if (key === 'k') { const K = eng.keys; const vx = (K.right ? 1 : 0) - (K.left ? 1 : 0), vy = (K.down ? 1 : 0) - (K.up ? 1 : 0); eng.roll(vx || Math.cos(eng.p.face), vy || Math.sin(eng.p.face)); }
      else if (key === 'u') eng.trySkill('s1'); else if (key === 'i') eng.trySkill('sp'); else if (key === 'o') eng.trySkill('s2');
      else if (key === 'l') eng.chargeRelease();
      else if (['1', '2', '3', '4'].includes(key)) eng.switchTo(Number(key) - 1);
    };
    const ku = (e) => { const k = KEYMAP[e.key]; if (k) eng.setKey(k, false); };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    // 協力：收聽隊友，定時送出自己的狀態
    let unPeers = null, sendT = null;
    if (net && net.room) {
      try { eng.netPeers(net.room.peers()); } catch (e) { /* 略過 */ }
      unPeers = net.room.onPeers((ch) => eng.netPeers(ch.peers));
      sendT = setInterval(() => { if (!eng.ended) net.room.presence(eng.netOut()).catch(() => {}); }, 50);
    }
    let raf, last = performance.now();
    const loop = (now) => {
      const dt = (now - last) / 1000; last = now;
      eng.update(dt); eng.render(ctx, dpr);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const vis = () => { if (document.hidden && !eng.over && !net) { eng.paused = true; setPaused(true); } };
    document.addEventListener('visibilitychange', vis);
    window.__skyBattle = eng; window.__skyChars = CHARS;
    eng.safeTop = readSafeInsets().top;
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', cancel);
      ['touchstart', 'touchmove', 'touchend'].forEach((n) => cv.removeEventListener(n, tBlock));
      cv.removeEventListener('touchstart', tStart); cv.removeEventListener('touchmove', tMove); cv.removeEventListener('touchend', tEnd); cv.removeEventListener('touchcancel', tEnd);
      cv.removeEventListener('mousedown', mDown); window.removeEventListener('mousemove', mMove); window.removeEventListener('mouseup', mUp);
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
      document.removeEventListener('visibilitychange', vis);
      if (unPeers) unPeers();
      if (sendT) clearInterval(sendT);
      if (net && net.room) net.room.presence({ pl: null, ev: null, w: null }).catch(() => {});
      if (window.__skyBattle === eng) {
        window.__skyBattle = null;
        // 戰鬥期間搵到新版本：返到主畫面先更新
        if (window.__skyUpdatePending) setTimeout(() => { if (!window.__skyBattle && !window.__skyBusy && window.__skyUpdatePending) window.__skyUpdatePending(); }, 1500);
      }
    };
  }, []);

  useEffect(() => {
    if (!end || !end.win || reward) return;
    const runes = { ...end.loot.runes };
    for (let i = 0; i < stage.reward.runes; i++) { const k = pick(RUNES).k; runes[k] = (runes[k] || 0) + 1; }
    const rw = { gold: end.loot.gold + stage.reward.gold, souls: end.loot.souls + stage.reward.souls, runes, gems: firstClear ? stage.reward.gems : 0, combo: end.maxCombo, time: end.time, kills: end.loot.kills };
    setReward(rw); onWin(rw);
  }, [end]);

  const setPause = (v) => {
    const e = engRef.current; if (!e || e.over) return;
    if (!coop) { e.paused = v; if (v) e.pointerUp(); }
    setPaused(v); SFX.click();
  };
  const swap = (i) => { const e = engRef.current; if (e && e.switchTo(i)) SFX.unlock(); };
  const revive = () => { if (gems < 50) return; onSpendGems(50); engRef.current.reviveAll(); setEnd(null); };
  const exitLabel = coop ? '返回房間' : '返回';

  return (
    <div className="absolute inset-0 z-[38] flex flex-col bg-black select-none">
      <div ref={wrapRef} className="relative flex-1 min-h-0">
        <canvas ref={cvRef} className="absolute inset-0 w-full h-full block" style={{ touchAction: 'none' }} />
        {(() => {
          const ai = coop ? 0 : hud?.active ?? 0, h = hud?.members?.[ai], ch = party[ai]?.char;
          return <SkillButtons engRef={engRef} ch={ch} sp={h ? h.sp : 0} dead={!h || h.dead || h.dying || !!end} />;
        })()}
        <button aria-label="暫停" style={{ top: 'calc(10px + var(--sat, 0px))' }} className="si-btn absolute right-2.5 w-10 h-10 rounded-full bg-[#0b1026]/70 border border-white/20 flex items-center justify-center text-white" onClick={() => setPause(true)}>{Ico.pause()}</button>
      </div>
      {!coop ? (
        <div className="shrink-0 bg-[#0b1026] border-t border-[#2c3770] grid grid-cols-4 gap-1.5 px-2 pt-2" style={{ height: 'calc(84px + var(--sab, 0px))', paddingBottom: 'calc(8px + var(--sab, 0px))' }}>
          {party.map((m, i) => {
            const h = hud?.members?.[i];
            const act = hud?.active === i, dead = h?.dead, dying = h?.dying;
            const hpK = h ? h.hp / h.maxHp : 1, spK = h ? h.sp / h.maxSp : 0;
            return (
              <button key={m.char.id} onClick={() => swap(i)} disabled={dead} aria-label={`換成 ${m.char.name}`}
                className={`si-btn relative rounded-xl overflow-hidden flex flex-col items-stretch ${act ? 'ring-2 ring-[#ffe17a] bg-[#25306a]' : 'bg-[#151c3d]'} ${dead ? 'opacity-45 grayscale' : ''}`}>
                <div className="relative flex-1 min-h-0 flex items-center justify-center">
                  <Portrait c={m.char} awakened={m.prog?.awakened} size={46} className="rounded-lg" />
                  <span className="absolute top-0.5 left-1 text-[10px] font-bold" style={{ color: CLS[m.char.cls].color }}>{CLS[m.char.cls].attr}</span>
                  {spK >= 1 && !dead && <span className="absolute top-0.5 right-1 text-[9px] si-num text-[#7fe3ff] si-pulse">SP MAX</span>}
                  {dying && <span className="absolute inset-0 flex items-center justify-center text-[11px] text-white font-bold bg-[#ff3b55]/50 si-pulse">瀕死</span>}
                  {dead && <span className="absolute inset-0 flex items-center justify-center text-[11px] text-white font-bold bg-black/40">倒下</span>}
                </div>
                <div className="h-[4px] bg-black/50"><div className="h-full bg-[#6ee07f]" style={{ width: `${Math.max(0, hpK) * 100}%` }} /></div>
                <div className="h-[4px] bg-black/50"><div className="h-full bg-[#5fb8ff]" style={{ width: `${Math.min(1, spK) * 100}%` }} /></div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="shrink-0 bg-[#0b1026] border-t border-[#2c3770] grid grid-cols-4 gap-1.5 px-2 pt-2" style={{ height: 'calc(84px + var(--sab, 0px))', paddingBottom: 'calc(8px + var(--sab, 0px))' }}>
          {[0, 1, 2, 3].map((i) => {
            const t = hud?.team?.[i];
            if (!t) return <div key={i} className="rounded-xl border border-dashed border-[#2c3770] flex items-center justify-center text-[11px] text-[#5a6290]">空位</div>;
            const c = CHAR_BY_ID[t.c], hpK = t.mh ? t.hp / t.mh : 0, spK = t.ms ? t.sp / t.ms : 0, col = SLOT_COLORS[t.slot] || '#fff';
            return (
              <div key={i} className="relative rounded-xl overflow-hidden flex flex-col" style={{ boxShadow: `inset 0 0 0 2px ${col}`, background: `linear-gradient(180deg, ${col}55 0%, ${t.me ? '#25306a' : '#151c3d'} 45%)` }}>
                <div className={`relative flex-1 min-h-0 flex items-center justify-center ${t.d ? 'opacity-50 grayscale' : ''}`}>
                  <span className="absolute top-0.5 left-1 w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `7px solid ${col}` }} />
                  {c && <Portrait c={c} awakened={t.aw} size={38} className="rounded-lg" />}
                  {c && <span className="absolute top-0.5 right-1 text-[9px] font-bold" style={{ color: CLS[c.cls].color }}>{CLS[c.cls].attr}</span>}
                  {t.dy && <span className="absolute inset-0 flex items-center justify-center text-[11px] text-white font-bold bg-[#ff3b55]/55 si-pulse">瀕死</span>}
                </div>
                {t.d && <span className="absolute inset-x-0 top-0 bottom-[22px] flex items-center justify-center text-[10px] text-white font-bold bg-black/45 leading-tight text-center whitespace-pre-line">{t.rv > 0 ? `救援中\n${Math.round(t.rv * 100)}%` : '倒下'}</span>}
                <div className="text-[10px] text-center truncate px-1 leading-tight font-bold" style={{ color: col }}>{t.me ? '你' : t.nick}</div>
                <div className="h-[4px] bg-black/50"><div className={`h-full ${t.dy ? 'bg-[#ff3b55]' : 'bg-[#6ee07f]'}`} style={{ width: `${clamp(hpK, 0, 1) * 100}%` }} /></div>
                <div className="h-[3px] bg-black/50"><div className="h-full bg-[#5fb8ff]" style={{ width: `${clamp(spK, 0, 1) * 100}%` }} /></div>
              </div>
            );
          })}
        </div>
      )}

      {paused && !end && (
        <div className="absolute inset-0 z-30 bg-[#070a18]/80 flex items-center justify-center p-6 si-fade">
          <div className="si-panel rounded-2xl w-full max-w-[300px] p-5 flex flex-col gap-3 si-pop">
            <div className="text-center text-[20px] font-bold text-[#ffe17a]">{coop ? '選單' : '暫停'}</div>
            {coop && <div className="text-center text-[12px] text-[#ff9fb0]">協力戰鬥唔會暫停，隊友仍在作戰</div>}
            <div className="text-[12px] leading-relaxed text-[#c7cff0] bg-[#0b1026] rounded-xl p-3">
              點一下＝攻擊（命中回復 SP）<br />按住拖曳＝移動<br />快速一掃＝翻滾（短暫無敵）<br />長按 0.25 秒＝蓄力，再滑 ←S1 / S2→ / ↑爆發技<br />左邊技能掣：按住睇範圍，放手發動，滑走放手取消<br />{coop ? '隊友瀕死時放治癒可以即時救返；倒下後企入佢嘅救援圈 5 秒就救返' : '點下方頭像＝即時換人'}
            </div>
            <button className="si-btn si-gold rounded-xl h-11 font-bold text-[15px]" onClick={() => setPause(false)}>{coop ? '返回戰鬥' : '繼續戰鬥'}</button>
            <button className="si-btn rounded-xl h-10 bg-[#1d2650] text-[14px] flex items-center justify-center gap-2" onClick={() => { const m = !muted; SFX.setMuted(m); setMuted(m); }}>{Ico.sound(!muted)}{muted ? '音效：關' : '音效：開'}</button>
            <button className="si-btn rounded-xl h-10 bg-[#3a1c2c] text-[#ffb3c0] text-[14px]" onClick={() => { SFX.click(); onExit(); }}>{coop ? '離開戰鬥（不獲得獎勵）' : '撤退（不獲得獎勵）'}</button>
          </div>
        </div>
      )}

      {end && end.win && reward && (
        <div className="absolute inset-0 z-30 bg-[#070a18]/85 flex items-center justify-center p-5 si-fade">
          <div className="si-panel rounded-2xl w-full max-w-[320px] p-5 flex flex-col gap-3 si-pop">
            <div className="text-center si-num text-[30px] text-[#ffe17a] leading-none">STAGE CLEAR</div>
            <div className="text-center text-[13px] text-[#c7cff0]">{stage.name}・{stage.diff}{coop ? `・協力 ${net.n} 人` : ''}</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#0b1026] rounded-xl py-2"><div className="text-[11px] text-[#9aa6cf]">最大連擊</div><div className="si-num text-[20px]">{reward.combo}</div></div>
              <div className="bg-[#0b1026] rounded-xl py-2"><div className="text-[11px] text-[#9aa6cf]">擊倒</div><div className="si-num text-[20px]">{reward.kills}</div></div>
              <div className="bg-[#0b1026] rounded-xl py-2"><div className="text-[11px] text-[#9aa6cf]">用時</div><div className="si-num text-[20px]">{Math.floor(reward.time)}s</div></div>
            </div>
            <div className="bg-[#0b1026] rounded-xl p-3 flex flex-col gap-2 text-[14px]">
              <div className="flex items-center justify-between"><span className="flex items-center gap-1.5">{Ico.coin()}金幣</span><span className="si-num">+{fmt(reward.gold)}</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-1.5">{Ico.soul()}魂</span><span className="si-num">+{fmt(reward.souls)}</span></div>
              <div className="flex items-center justify-between gap-2"><span className="shrink-0 whitespace-nowrap">符文</span><span className="flex flex-wrap justify-end gap-1.5">{RUNES.filter((r) => reward.runes[r.k]).map((r) => <span key={r.k} className="flex items-center gap-0.5 text-[13px]"><RuneDot k={r.k} />{r.name}×{reward.runes[r.k]}</span>)}</span></div>
              {reward.gems > 0 && <div className="flex items-center justify-between text-[#7fe3ff]"><span className="flex items-center gap-1.5">{Ico.gem()}首次通關</span><span className="si-num">+{reward.gems}</span></div>}
            </div>
            <button className="si-btn si-gold rounded-xl h-11 font-bold text-[15px]" onClick={() => { SFX.click(); onExit(); }}>{exitLabel}</button>
          </div>
        </div>
      )}

      {end && !end.win && (
        <div className="absolute inset-0 z-30 bg-[#12060c]/85 flex items-center justify-center p-6 si-fade">
          <div className="si-panel rounded-2xl w-full max-w-[300px] p-5 flex flex-col gap-3 si-pop">
            <div className="text-center text-[24px] font-bold text-[#ff8a9a]">{end.reason === 'host' ? '房主離開了' : '全員倒下'}</div>
            {coop ? (
              <div className="text-center text-[13px] text-[#c7cff0]">{end.reason === 'host' ? '戰鬥已中止，冇獎勵。' : '今次失手，回房間再試一次。'}</div>
            ) : (
              <>
                <div className="text-center text-[13px] text-[#c7cff0]">可以用寶石讓全隊滿血復活，繼續這場戰鬥。</div>
                <button disabled={gems < 50} className="si-btn si-sky rounded-xl h-11 font-bold text-[15px] disabled:opacity-40 flex items-center justify-center gap-1.5" onClick={revive}>{Ico.gem()} 50 寶石復活（持有 {fmt(gems)}）</button>
              </>
            )}
            <button className="si-btn rounded-xl h-10 bg-[#1d2650] text-[14px]" onClick={() => { SFX.click(); onExit(); }}>{coop ? '返回房間' : '放棄並返回'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- 冒險頁：浮島世界地圖選關 ---------- */
const DIFF_COL = { 初級: '#8dffb5', 中級: '#7fd6ff', 上級: '#ffd76a', 高難度: '#ff9b6b', 極難: '#ff6b81', 地獄: '#ff4d6a', 終焉: '#d58bff' };
function Landmark({ theme }) {
  switch (theme) {
    case 'grass': return <g><rect x="-4" y="-26" width="8" height="22" fill="#efe4cf" stroke="#2a1d38" strokeWidth="1.2" /><path d="M-6 -26 L0 -33 L6 -26 Z" fill="#c94a4a" stroke="#2a1d38" strokeWidth="1.2" /><g className="si-spin" style={{ transformOrigin: '0px -27px' }}>{[0, 90, 180, 270].map((a) => <rect key={a} x="-1.2" y="-41" width="2.4" height="14" fill="#fff" stroke="#8a6a48" strokeWidth="0.8" transform={`rotate(${a} 0 -27)`} />)}</g><circle cx="12" cy="-6" r="5" fill="#3d8a3a" /><circle cx="-12" cy="-5" r="4" fill="#4f9a3f" /></g>;
    case 'canyon': return <g><path d="M-14 -4 L-12 -24 L-4 -26 L-2 -4 Z" fill="#d98a4a" stroke="#2a1d38" strokeWidth="1.2" /><path d="M2 -4 L4 -18 L12 -19 L14 -4 Z" fill="#e8a060" stroke="#2a1d38" strokeWidth="1.2" /><path d="M-12 -18 L-4 -19" stroke="#a8603a" strokeWidth="1.2" /><path d="M-2 -7 L6 -5" stroke="#efe6cf" strokeWidth="2.2" strokeLinecap="round" /></g>;
    case 'temple': return <g><path d="M-16 -22 L0 -32 L16 -22 Z" fill="#c9cfdc" stroke="#2a1d38" strokeWidth="1.2" />{[-12, -4, 4, 12].map((x) => <rect key={x} x={x - 2} y="-22" width="4" height="17" fill="#e8ecf4" stroke="#2a1d38" strokeWidth="0.8" />)}<rect x="-17" y="-6" width="34" height="3" fill="#aab1c2" /><path d="M-6 -30 Q-10 -36 -12 -32 M6 -30 Q10 -36 12 -32" stroke="#e8dcc0" strokeWidth="2" fill="none" strokeLinecap="round" /></g>;
    case 'lava': return <g><path d="M-18 -3 L-5 -28 L5 -28 L18 -3 Z" fill="#4a3634" stroke="#2a1d38" strokeWidth="1.2" /><path d="M-5 -28 L5 -28 L3 -22 L-1 -18 L-3 -23 Z" fill="#ff6b3a" /><circle cx="0" cy="-32" r="5" fill="#ff8a3a" opacity="0.7" className="si-pulse" /><path d="M-1 -18 L-4 -8 M3 -22 L6 -10" stroke="#ff8a3a" strokeWidth="1.6" /></g>;
    case 'snow': return <g>{[[-8, 0], [7, 3]].map(([x, d]) => <g key={x}><rect x={x - 1.5} y={-8 + d} width="3" height="6" fill="#6b4a2e" /><path d={`M${x - 9} ${-8 + d} L${x} ${-30 + d} L${x + 9} ${-8 + d} Z`} fill="#2f6b4a" stroke="#2a1d38" strokeWidth="1" /><path d={`M${x - 6} ${-15 + d} L${x} ${-30 + d} L${x + 6} ${-15 + d} Q${x} ${-19 + d} ${x - 6} ${-15 + d} Z`} fill="#fff" /></g>)}<path d="M14 -4 L17 -14 L20 -4 Z" fill="#8fd8ff" /></g>;
    case 'swamp': return <g><rect x="-8" y="-20" width="5" height="16" fill="#efe2c8" stroke="#2a1d38" strokeWidth="1" /><path d="M-18 -19 Q-6 -36 6 -19 Z" fill="#a05ad8" stroke="#2a1d38" strokeWidth="1.2" /><circle cx="-10" cy="-25" r="2" fill="#fff" /><circle cx="-3" cy="-28" r="1.6" fill="#fff" /><rect x="8" y="-11" width="3.5" height="8" fill="#efe2c8" /><path d="M3 -10 Q10 -21 17 -10 Z" fill="#c96ad8" stroke="#2a1d38" strokeWidth="1" /><ellipse cx="2" cy="-3" rx="8" ry="2" fill="#8ad04a" opacity="0.6" /></g>;
    case 'sky': return <g><rect x="-14" y="-28" width="7" height="24" fill="#f4f7fc" stroke="#2a1d38" strokeWidth="1" /><path d="M-15 -28 L-11 -32 L-6 -28 Z" fill="#f4f7fc" stroke="#2a1d38" strokeWidth="1" /><rect x="2" y="-18" width="7" height="14" fill="#f4f7fc" stroke="#2a1d38" strokeWidth="1" /><path d="M1 -18 L4 -22 L7 -19 L10 -21 L10 -18 Z" fill="#f4f7fc" /><g className="si-bob"><circle cx="13" cy="-30" r="5" fill="#fff" /><circle cx="19" cy="-29" r="4" fill="#fff" /><circle cx="8" cy="-28" r="3.5" fill="#fff" /></g></g>;
    case 'abyss': return <g><path d="M-16 -4 L-16 -22 L-12 -22 L-12 -26 L-8 -26 L-8 -22 L-4 -22 L-4 -32 L0 -38 L4 -32 L4 -22 L8 -22 L8 -26 L12 -26 L12 -22 L16 -22 L16 -4 Z" fill="#2c2438" stroke="#b06bff" strokeWidth="1.2" /><rect x="-2" y="-28" width="4" height="5" fill="#d58bff" className="si-pulse" /><rect x="-12" y="-17" width="3" height="4" fill="#d58bff" /><rect x="9" y="-17" width="3" height="4" fill="#d58bff" /><path d="M-3 -4 Q0 -10 3 -4 Z" fill="#0c0912" /></g>;
    default: return null;
  }
}
function WorldMap({ save, onPick }) {
  const STEP = 124, H = STAGES.length * STEP + 74;
  const pts = STAGES.map((st, i) => ({ x: i % 2 ? 70 : 30, y: 92 + i * STEP }));
  const nextIdx = Math.max(0, STAGES.findIndex((st) => !save.cleared[st.id]));
  const allClear = STAGES.every((st) => save.cleared[st.id]);
  const nodeRef = useRef(null);
  useEffect(() => { if (nextIdx >= 2 && nodeRef.current) { try { nodeRef.current.scrollIntoView({ block: 'center' }); } catch (e) { /* 舊瀏覽器 */ } } }, []);
  const seg = (i) => { const a = pts[i], b = pts[i + 1], my = (a.y + b.y) / 2; return `M${a.x * 3.6} ${a.y} C${a.x * 3.6} ${my} ${b.x * 3.6} ${my} ${b.x * 3.6} ${b.y}`; };
  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#2c3770]" style={{ height: H, background: 'linear-gradient(180deg,#5aa0f0 0%,#8fc8ff 22%,#b8d8f4 40%,#8aa0c8 58%,#4a4a7a 76%,#1e1430 100%)' }}>
      <svg viewBox={`0 0 360 ${H}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
        {[[40, 30, 34], [300, 110, 28], [60, 300, 30], [310, 420, 36], [50, 560, 26], [280, 660, 30]].map(([x, y, r], i) => <g key={i} opacity={y < H * 0.6 ? 0.75 : 0.25}><ellipse cx={x} cy={y} rx={r} ry={r * 0.32} fill="#fff" /><ellipse cx={x + r * 0.4} cy={y - r * 0.18} rx={r * 0.55} ry={r * 0.3} fill="#fff" /></g>)}
        {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={(i * 137) % 360} cy={H * 0.62 + ((i * 89) % (H * 0.38))} r={i % 3 ? 0.9 : 1.6} fill="#fff" opacity="0.7" />)}
        {pts.slice(0, -1).map((_, i) => {
          const done = !!save.cleared[STAGES[i].id];
          return <g key={i}><path d={seg(i)} stroke="rgba(10,14,34,0.35)" strokeWidth="9" fill="none" strokeLinecap="round" /><path d={seg(i)} stroke={done ? '#ffe17a' : 'rgba(255,255,255,0.55)'} strokeWidth="3.5" fill="none" strokeDasharray={done ? '0' : '2 9'} strokeLinecap="round" /></g>;
        })}
      </svg>
      {STAGES.map((st, i) => {
        const T = THEMES[st.theme], cleared = !!save.cleared[st.id], next = i === nextIdx && !allClear;
        const boss = st.waves.flat().some((w) => ENEMY[waveType(w)] && ENEMY[waveType(w)].boss);
        return (
          <button key={st.id} ref={next ? nodeRef : null} className="si-btn absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${pts[i].x}%`, top: pts[i].y }}
            onClick={() => { SFX.unlock(); SFX.click(); onPick(st); }} aria-label={`第 ${i + 1} 關 ${st.name}`}>
            {next && <span className="absolute -top-7 left-1/2 -translate-x-1/2 si-bob text-[11px] font-bold si-num bg-[#ffe17a] text-[#2a1a05] rounded-full px-2 py-0.5 whitespace-nowrap shadow">NEXT ▼</span>}
            <svg viewBox="-50 -46 100 74" width="118" height="87" className={`${i % 3 === 1 ? 'si-bob' : ''} overflow-visible`} aria-hidden="true">
              {next && <ellipse cx="0" cy="0" rx="48" ry="16" fill="none" stroke="#ffe17a" strokeWidth="2.5" className="si-pulse" />}
              <path d="M-40 0 Q-30 26 0 28 Q30 26 40 0 Z" fill={shade(T.edge, -0.1)} stroke="#2a1d38" strokeWidth="1.4" />
              <path d="M-26 12 Q0 26 26 12 L18 20 Q0 28 -18 20 Z" fill={shade(T.edge, -0.35)} opacity="0.7" />
              <ellipse cx="0" cy="0" rx="42" ry="13" fill={T.base} stroke="#2a1d38" strokeWidth="1.4" />
              <ellipse cx="-6" cy="-2" rx="30" ry="8" fill={T.light} opacity="0.75" />
              <Landmark theme={st.theme} />
              {boss && <g transform="translate(30 -24)"><circle r="9" fill="#2a0f1a" stroke="#ff4d6a" strokeWidth="1.6" /><path d="M-4 -1 Q-4 -6 0 -6 Q4 -6 4 -1 L3 3 L-3 3 Z" fill="#efe6cf" /><circle cx="-1.6" cy="-1.5" r="1" fill="#2a0f1a" /><circle cx="1.6" cy="-1.5" r="1" fill="#2a0f1a" /></g>}
              {cleared && <g transform="translate(-32 -22)"><path d="M0 -8 L2.4 -2.4 L8 -2 L3.6 1.6 L5 7.2 L0 4 L-5 7.2 L-3.6 1.6 L-8 -2 L-2.4 -2.4 Z" fill="#ffe17a" stroke="#a8700f" strokeWidth="1" /></g>}
            </svg>
            <div className="-mt-1 flex items-center gap-1 rounded-full bg-[#0b1026]/85 border border-white/15 pl-1 pr-2 py-0.5 whitespace-nowrap">
              <span className="si-num text-[11px] w-5 h-5 rounded-full flex items-center justify-center text-[#0b1026]" style={{ background: DIFF_COL[st.diff] || '#ffe17a' }}>{i + 1}</span>
              <span className="text-[13px] font-bold text-white">{st.name}</span>
              <span className="si-num text-[10px] text-[#c7cff0]">Lv.{st.lv}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
function StageInfo({ stage: st, save, onClose, onStart }) {
  const cleared = !!save.cleared[st.id], idx = STAGES.indexOf(st);
  const enemies = [...new Set(st.waves.flat().map(waveType))], elites = st.waves.flat().some(waveElite);
  const T = THEMES[st.theme], dc = DIFF_COL[st.diff] || '#ffe17a';
  return (
    <div className="absolute inset-0 z-40 bg-[#070a18]/70 flex items-end si-fade" onClick={onClose}>
      <div className="w-full rounded-t-3xl overflow-hidden si-pop border-t border-[#34407e]" style={{ paddingBottom: 'var(--sab, 0px)', background: `linear-gradient(160deg, ${shade(T.dark, -0.35)} 0%, #141a3a 60%)` }} onClick={(e) => e.stopPropagation()}>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold text-[#1a0a14]" style={{ background: dc }}>{st.diff}</span>
            <span className="si-num text-[12px] text-[#c7cff0]">第 {idx + 1} 關・Lv.{st.lv}</span>
            <button className="si-btn ml-auto w-8 h-8 rounded-full bg-[#1d2650] flex items-center justify-center" onClick={onClose} aria-label="關閉">✕</button>
          </div>
          <div className="text-[22px] font-bold leading-tight">{st.name}</div>
          <div className="flex flex-col gap-1.5 text-[12px] text-[#c7cff0]">
            <div>{st.waves.length} 波{elites && <span className="ml-2 text-[11px] px-1.5 rounded bg-[#ff7a3a]/25 text-[#ffb86b]">精英出現</span>}</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {enemies.map((e) => <span key={e} className={`flex items-center gap-1 whitespace-nowrap ${ENEMY[e].boss ? 'text-[#ff9b9b] font-bold' : ''}`}><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: ENEMY_ICON[e] }} />{ENEMY[e].boss ? `頭目・${ENEMY[e].name}` : ENEMY[e].name}</span>)}
            </div>
          </div>
          <div className="rounded-xl bg-[#0b1026]/70 p-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
            <span className="flex items-center gap-1">{Ico.coin(14)}<span className="si-num">{fmt(st.reward.gold)}</span></span>
            <span className="flex items-center gap-1">{Ico.soul(14)}<span className="si-num">{fmt(st.reward.souls)}</span></span>
            <span className="flex items-center gap-1 whitespace-nowrap"><RuneDot k="purple" />符文 ×{st.reward.runes}+</span>
            {!cleared ? <span className="flex items-center gap-1 text-[#7fe3ff] whitespace-nowrap">{Ico.gem(14)}首通 +{st.reward.gems}</span> : <span className="text-[#8dffb5] whitespace-nowrap">已通關</span>}
          </div>
          <button className="si-btn si-gold rounded-full h-12 font-bold text-[17px]" onClick={() => { SFX.unlock(); SFX.click(); onStart(st); }}>出發</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 冒險頁 ---------- */
const ENEMY_ICON = { slime: '#5fd38d', skel: '#efe6cf', boss: '#a0603a', knight: '#8f9bb3', wisp: '#9b7bff', wolf: '#cfe6ff', shroom: '#a05ad8', garg: '#8a8f9e', imp: '#e04a3a', yeti: '#e8f2ff', dragon: '#8a4ac8' };
function AdventurePage({ save, onPick, goParty, openCoop }) {
  const party = save.party.map((id) => CHAR_BY_ID[id]);
  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="si-panel rounded-2xl p-3 flex items-center gap-3">
        <div className="flex -space-x-2">
          {party.map((c) => <Portrait key={c.id} c={c} awakened={save.roster[c.id]?.awakened} size={40} className={`rounded-full ring-2 ${RARITY_RING[save.roster[c.id]?.awakened ? 5 : c.r]}`} />)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-[#9aa6cf]">出擊隊伍</div>
          <div className="text-[14px] truncate">{party.map((c) => c.name).join('・')}</div>
        </div>
        <button className="si-btn text-[13px] px-3 h-8 rounded-full bg-[#1d2650] border border-[#2c3770]" onClick={() => { SFX.click(); goParty(); }}>編成</button>
      </div>

      <button className="si-btn relative rounded-2xl overflow-hidden border border-[#9dff9a]/50 p-3 flex items-center gap-3 text-left" style={{ background: 'linear-gradient(120deg,#1d4a3a 0%,#18214a 70%)' }} onClick={() => { SFX.unlock(); SFX.click(); openCoop(); }}>
        <div className="flex -space-x-1.5 shrink-0">{SLOT_COLORS.map((c, i) => <span key={i} className="w-6 h-6 rounded-full border-2 border-[#0b1026]" style={{ background: c }} />)}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[16px] font-bold text-[#9dff9a]">協力模式</div>
          <div className="text-[12px] text-[#c7cff0]">開房或加入房間，最多 4 人即時合作過關</div>
        </div>
        <span className="text-[13px] font-bold text-[#0b1026] bg-[#9dff9a] rounded-full px-3 h-8 flex items-center shrink-0">進入</span>
      </button>

      <WorldMap save={save} onPick={onPick} />

      <details className="si-panel rounded-2xl p-3 text-[13px] leading-relaxed text-[#d6dcf5]" open={!Object.keys(save.cleared).length}>
        <summary className="cursor-pointer font-bold text-[#ffe17a]">彈力操控教學</summary>
        <ul className="mt-2 flex flex-col gap-1.5">
          <li><b className="text-white">點一下</b>：自動鎖定最近敵人連續普攻，每次命中回復 SP。</li>
          <li><b className="text-white">按住拖曳</b>：角色向拖曳方向移動，操控球會跟住手指。</li>
          <li><b className="text-white">快速一掃後放開</b>：翻滾迴避，0.4 秒無敵並留下殘影；魔導士改為短距離瞬移。</li>
          <li><b className="text-white">長按 0.25 秒</b>：進入蓄力，手指上方出現三個技能圖示。向左滑放開＝S1、向右＝S2、向上＝職業爆發技；原地放開＝蓄力攻擊。</li>
          <li><b className="text-white">左邊技能掣</b>：直接撳 S1、S2、爆發技；按住時會顯示攻擊範圍，喺掣上放手先發動，滑走放手就取消。</li>
          <li><b className="text-white">協力救援</b>：隊友倒下後地上有綠色救援圈，企入圈內累積 5 秒就可以救返佢。每位玩家有自己顏色，頭頂三角形同箭嘴都係嗰個顏色。</li>
          <li><b className="text-white">點下方頭像</b>：即時換人，陣亡隊友可用魔導士 S1 復活。</li>
          <li><b className="text-white">瀕死緩衝</b>：HP 歸零後有約 0.5 秒紅圈倒數，倒數完先算倒下。協力時隊友喺呢段時間放治癒技能，就可以即時救返你。</li>
        </ul>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
          <div className="bg-[#0b1026] rounded-xl p-2"><b style={{ color: CLS.sword.color }}>劍士・斬</b>：攻速快，蓄力攻擊後 5 秒普攻 +50%。</div>
          <div className="bg-[#0b1026] rounded-xl p-2"><b style={{ color: CLS.fist.color }}>拳師・打</b>：連擊越多，攻速和移速越快。</div>
          <div className="bg-[#0b1026] rounded-xl p-2"><b style={{ color: CLS.lance.color }}>槍兵・突</b>：蓄力時展開護盾減傷 70%；按下瞬間被擊中觸發 Just Guard 回復 25% SP。</div>
          <div className="bg-[#0b1026] rounded-xl p-2"><b style={{ color: CLS.mage.color }}>魔導士・魔</b>：追蹤魔彈，翻滾改為瞬移，S1 全隊治癒並復活。</div>
          <div className="bg-[#0b1026] rounded-xl p-2 col-span-2"><b style={{ color: CLS.bow.color }}>射手・射</b>：射程最遠、會心率高，第三段扇形三連箭，蓄力箭可以貫穿成排敵人；石像鬼、小鬼等飛行怪怕射。</div>
        </div>
        <div className="mt-2 text-[12px] text-[#9aa6cf]">屬性相剋：史萊姆怕魔；骷髏弓手怕打、抗突。牛頭人的紅圈可以翻滾避開或用護盾擋，紫圈無視無敵和護盾，一定要走出範圍。冰霜狼怕斬、射；毒蘑菇怪怕斬，死後會爆出孢子；石像鬼怕打、射，石化時幾乎打唔入；炸彈小鬼殘血會衝埋嚟自爆，見到紅圈即刻走開。藍色預警圈係冰屬性攻擊。電腦可用 WASD 移動、J 攻擊、K 翻滾、U/O/I 放技能、1–4 換人。</div>
      </details>
    </div>
  );
}

/* ---------- 隊伍 / 角色 ---------- */
function PartyPage({ save, openChar }) {
  const [filter, setFilter] = useState('all');
  const ids = Object.keys(save.roster).filter((id) => filter === 'all' || CHAR_BY_ID[id].cls === filter)
    .sort((a, b) => { const A = CHAR_BY_ID[a], B = CHAR_BY_ID[b]; const ra = save.roster[a].awakened ? 5 : A.r, rb = save.roster[b].awakened ? 5 : B.r; return rb - ra || a.localeCompare(b); });
  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="si-panel rounded-2xl p-3">
        <div className="text-[13px] text-[#9aa6cf] mb-2">出擊隊伍（點角色可更換位置）</div>
        <div className="grid grid-cols-4 gap-2">
          {save.party.map((id, i) => {
            const c = CHAR_BY_ID[id], pr = save.roster[id], st = computeStats(c, pr, save.town);
            return (
              <button key={i} className="si-btn flex flex-col items-center gap-1 rounded-xl bg-[#0b1026] p-1.5" onClick={() => { SFX.click(); openChar(id); }}>
                <div className="relative">
                  <Portrait c={c} awakened={pr.awakened} size={60} className={`rounded-xl ring-2 ${RARITY_RING[st.rarity]}`} />
                  <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#f3c55b] text-[#2a1a05] text-[11px] si-num flex items-center justify-center">{i + 1}</span>
                </div>
                <Stars r={st.rarity} className="text-[11px] leading-none" />
                <div className="text-[12px] leading-tight truncate w-full text-center">{c.name}</div>
                <div className="si-num text-[11px] text-[#9aa6cf] leading-none">Lv.{st.lv}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-baseline justify-between"><span className="text-[14px] font-bold">角色一覽</span><span className="text-[12px] text-[#9aa6cf]">持有 {Object.keys(save.roster).length}/{CHARS.length}</span></div>
      <div className="flex gap-1.5 overflow-x-auto -mt-1">
        {[['all', '全部'], ...CLS_KEYS.map((k) => [k, CLS[k].name])].map(([k, n]) => (
          <button key={k} className={`si-btn shrink-0 h-8 px-3.5 rounded-full text-[13px] border ${filter === k ? 'bg-[#f3c55b] text-[#2a1a05] border-transparent font-bold' : 'bg-[#151c3d] border-[#2c3770]'}`} onClick={() => { SFX.click(); setFilter(k); }}>{n}</button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ids.map((id) => {
          const c = CHAR_BY_ID[id], pr = save.roster[id], st = computeStats(c, pr, save.town), inParty = save.party.indexOf(id);
          return (
            <button key={id} className="si-btn relative flex flex-col items-center gap-0.5 rounded-xl bg-[#151c3d] border border-[#2c3770] p-1.5" onClick={() => { SFX.click(); openChar(id); }}>
              <Portrait c={c} awakened={pr.awakened} size={58} className={`rounded-lg ring-2 ${RARITY_RING[st.rarity]}`} />
              <Stars r={st.rarity} className="text-[10px] leading-none mt-0.5" />
              <div className="text-[12px] leading-tight truncate w-full text-center">{c.name}</div>
              <div className="flex items-center gap-1 text-[10px] leading-none"><span style={{ color: CLS[c.cls].color }}>{CLS[c.cls].name}</span><span className="si-num text-[#9aa6cf]">Lv{st.lv}</span></div>
              {inParty >= 0 && <span className="absolute top-1 right-1 text-[9px] bg-[#f3c55b] text-[#2a1a05] rounded px-1 font-bold">隊{inParty + 1}</span>}
              {pr.lb > 0 && <span className="absolute top-1 left-1 text-[9px] bg-[#7fd6ff] text-[#0b1d3a] rounded px-1 si-num">+{pr.lb}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const statRow = (label, value, extra) => (
  <div className="flex items-center justify-between py-1.5 border-b border-[#2c3770]/60 last:border-0 text-[13px]"><span className="text-[#9aa6cf]">{label}</span><span className="si-num">{value}{extra && <span className="text-[#8dffb5] text-[11px] ml-1">{extra}</span>}</span></div>
);
function SkillCard({ tag, sk, cls }) {
  const isHeal = sk.kind === 'heal';
  return (
    <div className="rounded-xl bg-[#0b1026] p-2.5 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-[10px] si-num px-1.5 py-0.5 rounded" style={{ background: CLS[cls].color, color: '#1a1530' }}>{tag}</span>
        <span className="text-[14px] font-bold">{sk.name}</span>
        <span className="ml-auto si-num text-[12px] text-[#7fe3ff]">SP {sk.sp}</span>
      </div>
      <div className="text-[12px] text-[#c7cff0]">{sk.desc}</div>
      <div className="text-[11px] text-[#9aa6cf]">{isHeal ? `回復量 ${Math.round(sk.mult * 100)}%・可復活` : `傷害倍率 ${Math.round(sk.mult * 100)}%・${sk.hits} 段・範圍${rangeLabel(skillRange(sk, cls))}${skillRange(sk, cls) === Infinity ? '' : `（${skillRange(sk, cls)}）`}`}・施放期間無敵</div>
    </div>
  );
}

function CharDetail({ id, save, update, toast, onClose, openBoard }) {
  const c = CHAR_BY_ID[id], pr = save.roster[id], st = computeStats(c, pr, save.town);
  const tier = RAINBOW_FOR_RARITY(c.r), tierItem = RAINBOW.find((r) => r.k === tier);
  const canLB = pr.lb < LB_MAX && save.rainbow[tier] >= 1;
  const full = pr.nodes.length >= SOUL_BOARD.length;
  const canAwaken = c.r === 4 && !pr.awakened && full && save.gold >= AWAKEN_COST.gold && save.souls >= AWAKEN_COST.souls && RUNES.every((r) => save.runes[r.k] >= AWAKEN_COST.runesEach);
  const doLB = () => {
    if (!canLB) { SFX.error(); toast(pr.lb >= LB_MAX ? '已經突破到上限' : `需要 ${tierItem.name} ×1`); return; }
    update((s) => { s.rainbow[tier] -= 1; s.roster[id].lb += 1; });
    SFX.levelUp(); toast(`限界突破 +${pr.lb + 1}！全能力提升，SPR +1`);
  };
  const doAwaken = () => {
    if (!canAwaken) { SFX.error(); toast(!full ? '星盤全部解鎖（Lv.100）後才能覺醒' : '素材不足'); return; }
    update((s) => { s.gold -= AWAKEN_COST.gold; s.souls -= AWAKEN_COST.souls; RUNES.forEach((r) => { s.runes[r.k] -= AWAKEN_COST.runesEach; }); s.roster[id].awakened = true; });
    SFX.fanfare(); toast(`${c.name} 友情覺醒！升為 5★`);
  };
  const assign = (slot) => {
    update((s) => {
      const cur = s.party.indexOf(id);
      if (cur === slot) return;
      if (cur >= 0) { const tmp = s.party[slot]; s.party[slot] = id; s.party[cur] = tmp; }
      else s.party[slot] = id;
    });
    SFX.click(); toast(`${c.name} 編入第 ${slot + 1} 位`);
  };
  return (
    <Sheet title={`${c.title}　${c.name}`} onClose={onClose}>
      <div className="p-3 flex flex-col gap-3">
        <div className="si-panel rounded-2xl p-3 flex gap-3 items-center">
          <Portrait c={c} awakened={pr.awakened} size={112} className={`rounded-2xl ring-2 ${RARITY_RING[st.rarity]}`} />
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <Stars r={st.rarity} className="text-[18px] leading-none" />
            <div className="text-[20px] font-bold leading-tight">{c.name}{pr.awakened && <span className="ml-1.5 text-[11px] align-middle px-1.5 py-0.5 rounded bg-[#ff9ef0] text-[#3a1030]">覺醒</span>}</div>
            <div className="text-[12px] text-[#c7cff0]">{c.title}</div>
            <div className="text-[12px]"><span style={{ color: CLS[c.cls].color }}>{CLS[c.cls].name}</span>・{CLS[c.cls].attr}屬性</div>
            <div className="flex items-center gap-2"><span className="si-num text-[18px]">Lv.{st.lv}</span>
              <span className="flex gap-0.5" aria-label={`限界突破 ${pr.lb}/4`}>{Array.from({ length: LB_MAX }, (_, i) => <span key={i} className={`w-3 h-3 rotate-45 rounded-[2px] ${i < pr.lb ? 'bg-[#7fd6ff]' : 'bg-[#2c3770]'}`} />)}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="si-btn si-gold rounded-xl h-11 font-bold text-[14px]" onClick={() => { SFX.click(); openBoard(id); }}>星盤（{pr.nodes.length}/{SOUL_BOARD.length}）</button>
          <button className={`si-btn rounded-xl h-11 font-bold text-[13px] flex items-center justify-center gap-1 ${canLB ? 'si-sky' : 'bg-[#1d2650] text-[#9aa6cf]'}`} onClick={doLB}><RainbowDot k={tier} />限界突破 {pr.lb}/{LB_MAX}</button>
        </div>
        <div className="text-[11px] text-[#9aa6cf] -mt-1">限界突破消耗 {tierItem.name} ×1（持有 {save.rainbow[tier]}），每次全能力 +{LB_PCT}%、SP 上限 +4、SPR +1。</div>
        {c.r === 4 && (
          <div className="si-panel rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2"><span className="text-[14px] font-bold text-[#ff9ef0]">友情覺醒</span><span className="text-[11px] text-[#9aa6cf]">星盤 Lv.100 後升為 5★</span></div>
            {pr.awakened ? <div className="text-[13px] text-[#8dffb5]">已覺醒：基礎能力 ×1.2</div> : (
              <>
                <div className="text-[12px] text-[#c7cff0] flex flex-wrap gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1">{Ico.coin(13)}{fmt(AWAKEN_COST.gold)}</span><span className="flex items-center gap-1">{Ico.soul(13)}{fmt(AWAKEN_COST.souls)}</span>
                  <span className="flex items-center gap-1">各色符文 ×{AWAKEN_COST.runesEach}</span>
                </div>
                <button className={`si-btn rounded-xl h-10 font-bold text-[14px] ${canAwaken ? 'bg-gradient-to-r from-[#ff9ef0] to-[#ffe066] text-[#3a1030]' : 'bg-[#1d2650] text-[#9aa6cf]'}`} onClick={doAwaken}>{full ? '進行友情覺醒' : `星盤未滿（Lv.${st.lv}/100）`}</button>
              </>
            )}
          </div>
        )}
        <div className="si-panel rounded-2xl px-3 py-1.5">
          {statRow('HP', fmt(st.hp))}{statRow('SP', st.sp)}{statRow('攻擊', fmt(st.atk), st.trainBonus ? `訓練所 +${st.trainBonus}%` : null)}{statRow('防禦', fmt(st.def))}
          {statRow('會心率', `${st.crit}%`)}{statRow('SP 回復（SPR）', `+${st.spr} / 次`)}{statRow('技能強化', `+${st.skill}%`)}
        </div>
        <div className="flex flex-col gap-2">
          <SkillCard tag="S1 ←" sk={c.s1} cls={c.cls} />
          <SkillCard tag="S2 →" sk={c.s2} cls={c.cls} />
          <SkillCard tag="爆發 ↑" sk={SPECIAL[c.cls]} cls={c.cls} />
        </div>
        <div className="si-panel rounded-2xl p-3">
          <div className="text-[13px] text-[#9aa6cf] mb-2">編入隊伍位置</div>
          <div className="grid grid-cols-4 gap-2">
            {save.party.map((pid, i) => (
              <button key={i} className={`si-btn rounded-xl p-1 flex flex-col items-center gap-0.5 ${pid === id ? 'bg-[#f3c55b] text-[#2a1a05]' : 'bg-[#0b1026]'}`} onClick={() => assign(i)}>
                <Portrait c={CHAR_BY_ID[pid]} awakened={save.roster[pid]?.awakened} size={40} className="rounded-lg" />
                <span className="text-[11px]">第 {i + 1} 位</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}

function SoulBoardView({ id, save, update, toast, onClose }) {
  const c = CHAR_BY_ID[id], pr = save.roster[id], rarity = pr.awakened ? 5 : c.r;
  const [sel, setSel] = useState(null);
  const unlocked = new Set(pr.nodes);
  const avail = (n) => !unlocked.has(n.id) && (!n.req || unlocked.has(n.req));
  const afford = (n, s = save) => { const k = nodeCost(n, rarity); return s.gold >= k.gold && s.souls >= k.souls && s.runes[k.rune] >= k.runes; };
  const RR = [58, 106, 154];
  const pos = (n) => [Math.cos(n.ang) * RR[n.ring], Math.sin(n.ang) * RR[n.ring]];
  const unlock = (n) => {
    if (!avail(n)) { SFX.error(); toast(unlocked.has(n.id) ? '已解鎖' : '要先解鎖相連的內圈節點'); return; }
    if (!afford(n)) { SFX.error(); toast('素材不足'); return; }
    const k = nodeCost(n, rarity);
    update((s) => { s.gold -= k.gold; s.souls -= k.souls; s.runes[k.rune] -= k.runes; s.roster[id].nodes.push(n.id); });
    SFX.levelUp();
  };
  const unlockAll = () => {
    const sim = { gold: save.gold, souls: save.souls, runes: { ...save.runes } };
    const set = new Set(pr.nodes), plan = [];
    let progress = true;
    while (progress) {
      progress = false;
      for (const n of SOUL_BOARD) {
        if (set.has(n.id) || (n.req && !set.has(n.req))) continue;
        const k = nodeCost(n, rarity);
        if (sim.gold >= k.gold && sim.souls >= k.souls && sim.runes[k.rune] >= k.runes) {
          sim.gold -= k.gold; sim.souls -= k.souls; sim.runes[k.rune] -= k.runes; set.add(n.id); plan.push(n.id); progress = true;
        }
      }
    }
    if (!plan.length) { SFX.error(); toast('沒有可負擔的節點'); return; }
    update((s) => { s.gold = sim.gold; s.souls = sim.souls; s.runes = sim.runes; s.roster[id].nodes = [...s.roster[id].nodes, ...plan]; });
    SFX.levelUp(); toast(`解鎖了 ${plan.length} 格`);
  };
  const lv = charLevel(pr);
  const selNode = sel ? SOUL_NODE[sel] : null;
  const selCost = selNode ? nodeCost(selNode, rarity) : null;
  return (
    <Sheet title={`星盤・${c.name}`} onClose={onClose}
      footer={
        <div className="shrink-0 border-t border-[#2c3770] bg-[#10163a] px-3 pt-3 flex flex-col gap-2" style={{ paddingBottom: 'calc(12px + var(--sab, 0px))' }}>
          {selNode ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[15px] font-bold"><RuneDot k={NODE_TYPES[selNode.type].rune} size={14} />{NODE_TYPES[selNode.type].name} +{NODE_TYPES[selNode.type].vals[selNode.ring]}{NODE_TYPES[selNode.type].unit}<span className="text-[11px] text-[#9aa6cf] font-normal">第 {selNode.ring + 1} 圈</span></div>
                <div className="flex flex-wrap gap-x-3 text-[12px] mt-0.5">
                  <span className={`flex items-center gap-1 ${save.gold < selCost.gold ? 'text-[#ff8a9a]' : ''}`}>{Ico.coin(13)}{fmt(selCost.gold)}</span>
                  <span className={`flex items-center gap-1 ${save.souls < selCost.souls ? 'text-[#ff8a9a]' : ''}`}>{Ico.soul(13)}{fmt(selCost.souls)}</span>
                  <span className={`flex items-center gap-1 ${save.runes[selCost.rune] < selCost.runes ? 'text-[#ff8a9a]' : ''}`}><RuneDot k={selCost.rune} />{RUNE_BY_K[selCost.rune].name}之符文 ×{selCost.runes}（{save.runes[selCost.rune]}）</span>
                </div>
              </div>
              {unlocked.has(selNode.id) ? <span className="text-[13px] text-[#8dffb5] shrink-0">已解鎖</span>
                : <button className={`si-btn shrink-0 rounded-xl h-11 px-4 font-bold text-[14px] ${avail(selNode) && afford(selNode) ? 'si-gold' : 'bg-[#1d2650] text-[#9aa6cf]'}`} onClick={() => unlock(selNode)}>解鎖</button>}
            </div>
          ) : <div className="text-[13px] text-[#9aa6cf]">點選節點查看效果。由中心向外逐格解鎖，36 格全滿即達 Lv.100。</div>}
          <button className="si-btn rounded-xl h-9 bg-[#1d2650] text-[13px]" onClick={unlockAll}>一鍵解鎖可負擔的節點</button>
        </div>
      }>
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="si-num text-[22px]">Lv.{lv}</span>
          <div className="flex-1 h-2.5 rounded-full bg-[#0b1026] overflow-hidden"><div className="h-full bg-gradient-to-r from-[#f3c55b] to-[#ffe9a3]" style={{ width: `${(pr.nodes.length / SOUL_BOARD.length) * 100}%` }} /></div>
          <span className="si-num text-[13px] text-[#9aa6cf]">{pr.nodes.length}/{SOUL_BOARD.length}</span>
        </div>
        <div className="relative w-full max-w-[380px] mx-auto aspect-square">
          <svg viewBox="-180 -180 360 360" className="w-full h-full block" role="img" aria-label="星盤">
            <defs>
              <radialGradient id="sbbg"><stop offset="0" stopColor="#2a2f6a" /><stop offset="1" stopColor="#0b1026" /></radialGradient>
              <filter id="sbglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
            </defs>
            <circle r="176" fill="url(#sbbg)" />
            {RR.map((r) => <circle key={r} r={r} fill="none" stroke="#2c3770" strokeWidth="1" strokeDasharray="3 5" />)}
            {SOUL_BOARD.map((n) => {
              const [x, y] = pos(n), [px, py] = n.req ? pos(SOUL_NODE[n.req]) : [0, 0];
              const on = unlocked.has(n.id);
              return <line key={'l' + n.id} x1={px} y1={py} x2={x} y2={y} stroke={on ? '#f3c55b' : '#39427a'} strokeWidth={on ? 3 : 1.5} />;
            })}
            <circle r="26" fill="#141a3a" stroke="#f3c55b" strokeWidth="2" />
            <clipPath id="sbclip"><circle r="24" /></clipPath>
            <image href={portraitURL(c, pr.awakened)} x="-24" y="-24" width="48" height="48" clipPath="url(#sbclip)" />
            {SOUL_BOARD.map((n) => {
              const [x, y] = pos(n), on = unlocked.has(n.id), av = avail(n), col = RUNE_BY_K[NODE_TYPES[n.type].rune].color;
              const r = [12, 11, 10][n.ring];
              return (
                <g key={n.id} onClick={() => { SFX.click(); setSel(n.id); }} style={{ cursor: 'pointer' }}>
                  <circle cx={x} cy={y} r={r + 7} fill="transparent" />
                  {on && <circle cx={x} cy={y} r={r + 3} fill={col} opacity="0.5" filter="url(#sbglow)" />}
                  <circle cx={x} cy={y} r={r} fill={on ? col : '#1a2048'} stroke={sel === n.id ? '#ffffff' : av ? col : '#39427a'} strokeWidth={sel === n.id ? 3 : av ? 2.2 : 1.2} className={av && !on ? 'si-pulse' : ''} />
                  <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fill={on ? '#1a1530' : av ? col : '#5a6290'} style={{ fontFamily: FONT_UI, pointerEvents: 'none' }}>{({ atk: '攻', def: '防', sp: 'SP', hp: 'HP', skill: '技', crit: '會' })[n.type]}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="grid grid-cols-6 gap-1 text-center">
          {RUNES.map((r) => <div key={r.k} className="rounded-lg bg-[#151c3d] py-1 flex flex-col items-center"><RuneDot k={r.k} /><span className="si-num text-[12px]">{save.runes[r.k]}</span></div>)}
        </div>
      </div>
    </Sheet>
  );
}
