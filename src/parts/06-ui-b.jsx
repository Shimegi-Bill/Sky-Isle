
/* ---------- 飛行島 ---------- */
const MINE_MAX = 10, TRAIN_MAX = 10;
const MINE_RATE = (lv) => 300 * lv;          // 每分鐘產金
const MINE_CAP = (lv) => 18000 * lv;         // 最多存 60 分鐘
const mineCost = (lv) => ({ gold: 5000 * lv, souls: 3000 * lv });
const trainCost = (lv) => ({ gold: 8000 * (lv + 1), souls: lv === 0 ? 0 : 5000 * lv });
const mineStock = (town, now) => Math.min(MINE_CAP(town.mine), Math.floor(((now - town.mineAt) / 60000) * MINE_RATE(town.mine)));
const BUILDINGS = [
  { k: 'mine', name: '金礦', x: 50, y: 36 },
  { k: 'sword', name: '劍士訓練所', x: 19, y: 56 },
  { k: 'fist', name: '拳師訓練所', x: 81, y: 56 },
  { k: 'bow', name: '射手訓練所', x: 50, y: 62 },
  { k: 'lance', name: '槍兵訓練所', x: 27, y: 83 },
  { k: 'mage', name: '魔導士訓練所', x: 73, y: 83 },
];
function BuildingArt({ k, lv }) {
  if (k === 'mine') return (
    <svg viewBox="0 0 80 64" width="76" height="61" aria-hidden="true">
      <ellipse cx="40" cy="58" rx="34" ry="6" fill="rgba(0,0,0,.25)" />
      <path d="M8 56 Q14 14 40 10 Q66 14 72 56 Z" fill="#8a6a4a" /><path d="M24 56 Q26 30 40 28 Q54 30 56 56 Z" fill="#2a1a10" />
      <rect x="22" y="26" width="36" height="5" fill="#6b4a2e" /><rect x="24" y="28" width="4" height="28" fill="#6b4a2e" /><rect x="52" y="28" width="4" height="28" fill="#6b4a2e" />
      <path d="M30 50 h20 l-3 7 h-14 z" fill="#5a5f6e" />{[34, 40, 46].map((x) => <circle key={x} cx={x} cy="49" r="3.4" fill="#f3c55b" stroke="#a8700f" />)}
      {lv >= 5 && <path d="M60 14 l3 5 5 1 -4 3 1 5 -5 -3 -5 3 1 -5 -4 -3 5 -1z" fill="#ffe066" />}
    </svg>
  );
  if (lv === 0) return (
    <svg viewBox="0 0 80 64" width="76" height="61" aria-hidden="true">
      <ellipse cx="40" cy="58" rx="30" ry="6" fill="rgba(0,0,0,.2)" /><rect x="14" y="40" width="52" height="16" rx="3" fill="none" stroke="#c7cff0" strokeDasharray="4 4" strokeWidth="2" />
      <path d="M40 22v14M33 29h14" stroke="#c7cff0" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
  const col = CLS[k].color;
  return (
    <svg viewBox="0 0 80 64" width="76" height="61" aria-hidden="true">
      <ellipse cx="40" cy="58" rx="32" ry="6" fill="rgba(0,0,0,.25)" />
      <rect x="14" y="30" width="52" height="26" fill="#efe4cf" /><rect x="34" y="40" width="12" height="16" rx="5" fill="#6b4a2e" />
      <rect x="19" y="36" width="9" height="8" fill="#7fd6ff" /><rect x="52" y="36" width="9" height="8" fill="#7fd6ff" />
      <path d="M8 32 L40 8 L72 32 Z" fill={col} /><path d="M8 32 L40 8 L72 32" stroke="rgba(0,0,0,.25)" strokeWidth="2" fill="none" />
      <circle cx="40" cy="22" r="6" fill="#fff" /><text x="40" y="25.5" textAnchor="middle" fontSize="9" fill="#1a1530" style={{ fontFamily: FONT_UI }}>{CLS[k].attr}</text>
    </svg>
  );
}
function TownPage({ save, update, toast }) {
  const [sel, setSel] = useState('mine');
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const town = save.town, stock = mineStock(town, now);
  const collect = () => {
    if (stock <= 0) { SFX.error(); toast('金礦還沒有產出'); return; }
    update((s) => { s.gold += stock; s.town.mineAt = Date.now(); });
    SFX.coin(); toast(`收取金幣 +${fmt(stock)}`);
  };
  const upMine = () => {
    if (town.mine >= MINE_MAX) { SFX.error(); toast('金礦已達最高等級'); return; }
    const k = mineCost(town.mine);
    if (save.gold < k.gold || save.souls < k.souls) { SFX.error(); toast('金幣或魂不足'); return; }
    update((s) => { s.gold -= k.gold - stock; s.souls -= k.souls; s.town.mine += 1; s.town.mineAt = Date.now(); });
    SFX.levelUp(); toast(`金礦升到 Lv.${town.mine + 1}${stock ? `（順便收取 ${fmt(stock)}）` : ''}`);
  };
  const upTrain = (cls) => {
    const lv = town.training[cls];
    if (lv >= TRAIN_MAX) { SFX.error(); toast('已達最高等級'); return; }
    const k = trainCost(lv);
    if (save.gold < k.gold || save.souls < k.souls) { SFX.error(); toast('金幣或魂不足'); return; }
    update((s) => { s.gold -= k.gold; s.souls -= k.souls; s.town.training[cls] += 1; });
    SFX.levelUp(); toast(lv === 0 ? `${CLS[cls].name}訓練所建造完成！` : `${CLS[cls].name}訓練所升到 Lv.${lv + 1}`);
  };
  const b = BUILDINGS.find((x) => x.k === sel);
  const lvOf = (k) => (k === 'mine' ? town.mine : town.training[k]);
  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="relative w-full aspect-square max-h-[380px] rounded-2xl overflow-hidden border border-[#2c3770]" style={{ background: 'linear-gradient(180deg,#2b5fb8 0%,#79c1ff 60%,#cdeeff 100%)' }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <ellipse cx="18" cy="14" rx="12" ry="3.5" fill="rgba(255,255,255,.7)" /><ellipse cx="82" cy="20" rx="10" ry="3" fill="rgba(255,255,255,.6)" />
          <path d="M6 58 Q50 104 94 58 Q86 92 50 100 Q14 92 6 58 Z" fill="#6b4f36" />
          <path d="M16 70 Q50 98 84 70 L80 80 Q50 100 20 80 Z" fill="#5a412c" opacity=".7" />
          <ellipse cx="50" cy="60" rx="46" ry="34" fill="#5fae4f" /><ellipse cx="50" cy="58" rx="42" ry="30" fill="#6fc05c" />
          <path d="M50 42 L20 56 M50 42 L80 56 M50 42 L50 62 M50 62 L28 82 M50 62 L72 82" stroke="#e8d8a8" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 si-bob">
          {BUILDINGS.map((bd) => {
            const lv = lvOf(bd.k);
            return (
              <button key={bd.k} className={`si-btn absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center ${sel === bd.k ? 'drop-shadow-[0_0_8px_rgba(255,225,122,0.9)]' : ''}`} style={{ left: `${bd.x}%`, top: `${bd.y}%` }} onClick={() => { SFX.click(); setSel(bd.k); }} aria-label={bd.name}>
                <BuildingArt k={bd.k} lv={lv} />
                <span className={`-mt-1 text-[10px] px-1.5 rounded-full whitespace-nowrap ${sel === bd.k ? 'bg-[#f3c55b] text-[#2a1a05]' : 'bg-[#0b1026]/80 text-white'}`}>{bd.k === 'mine' ? '金礦' : CLS[bd.k].name}{lv ? ` Lv.${lv}` : '（未建）'}</span>
              </button>
            );
          })}
          {stock > 0 && <div className="absolute left-1/2 -translate-x-1/2 top-[18%] text-[11px] bg-[#f3c55b] text-[#2a1a05] rounded-full px-2 py-0.5 si-pulse whitespace-nowrap flex items-center gap-1">{Ico.coin(12)}<span className="si-num">{fmt(stock)}</span></div>}
        </div>
      </div>
      <div className="si-panel rounded-2xl p-3 flex flex-col gap-2">
        {sel === 'mine' ? (
          <>
            <div className="flex items-center gap-2"><span className="text-[16px] font-bold">金礦</span><span className="si-num text-[13px] text-[#9aa6cf]">Lv.{town.mine}/{MINE_MAX}</span></div>
            <div className="text-[12px] text-[#c7cff0]">每分鐘產出 <b className="si-num text-[#f3c55b]">{fmt(MINE_RATE(town.mine))}</b> 金幣，最多累積 {fmt(MINE_CAP(town.mine))}。</div>
            <div className="h-2.5 rounded-full bg-[#0b1026] overflow-hidden"><div className="h-full bg-gradient-to-r from-[#d99a2b] to-[#ffe9a3]" style={{ width: `${(stock / MINE_CAP(town.mine)) * 100}%` }} /></div>
            <div className="grid grid-cols-2 gap-2">
              <button className="si-btn si-gold rounded-xl h-11 font-bold text-[14px] flex items-center justify-center gap-1" onClick={collect}>{Ico.coin()}收取 {fmt(stock)}</button>
              <button className="si-btn si-sky rounded-xl h-11 font-bold text-[13px] leading-tight disabled:opacity-40" disabled={town.mine >= MINE_MAX} onClick={upMine}>{town.mine >= MINE_MAX ? '已滿級' : <>升級<br /><span className="text-[11px] font-normal">金 {fmt(mineCost(town.mine).gold)}・魂 {fmt(mineCost(town.mine).souls)}</span></>}</button>
            </div>
          </>
        ) : (
          (() => {
            const lv = town.training[sel], k = trainCost(lv);
            return (
              <>
                <div className="flex items-center gap-2"><span className="text-[16px] font-bold" style={{ color: CLS[sel].color }}>{CLS[sel].name}訓練所</span><span className="si-num text-[13px] text-[#9aa6cf]">Lv.{lv}/{TRAIN_MAX}</span></div>
                <div className="text-[12px] text-[#c7cff0]">所有{CLS[sel].name}角色攻擊力永久 <b className="text-[#8dffb5]">+{lv * TRAIN_PCT}%</b>{lv < TRAIN_MAX && <>（下一級 +{(lv + 1) * TRAIN_PCT}%）</>}</div>
                <div className="flex -space-x-2">{CHARS.filter((c) => c.cls === sel && save.roster[c.id]).map((c) => <Portrait key={c.id} c={c} awakened={save.roster[c.id].awakened} size={32} className="rounded-full ring-2 ring-[#141a3a]" />)}</div>
                <button className="si-btn si-gold rounded-xl h-11 font-bold text-[14px] disabled:opacity-40" disabled={lv >= TRAIN_MAX} onClick={() => upTrain(sel)}>
                  {lv >= TRAIN_MAX ? '已滿級' : `${lv === 0 ? '建造' : '升級'}・金 ${fmt(k.gold)}${k.souls ? `・魂 ${fmt(k.souls)}` : ''}`}
                </button>
              </>
            );
          })()
        )}
      </div>
    </div>
  );
}

/* ---------- 抽蛋頁 ---------- */
function GachaPage({ save, onPull, lastStamp }) {
  const nextStamp = save.stamp + 1;
  const guaranteeNext = nextStamp === 5 || nextStamp === 10;
  const featured = CHARS.filter((c) => c.r === 4);
  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="relative rounded-2xl overflow-hidden border border-[#f3c55b]/50" style={{ background: 'linear-gradient(160deg,#3d9cf0 0%,#7cc3ff 45%,#2b2370 100%)' }}>
        <div className="absolute inset-0 opacity-30 si-shine" style={{ backgroundImage: 'linear-gradient(110deg,transparent 30%,rgba(255,255,255,.6) 50%,transparent 70%)' }} />
        <div className="relative p-3 flex flex-col gap-2">
          <div className="text-[12px] text-white/85">精選 4★ 角色</div>
          <div className="text-[24px] font-bold leading-none text-white" style={{ textShadow: '0 2px 0 #2b2370' }}>星翼祭典 召喚</div>
          <div className="text-[12px] text-white/90">角色會從飛船跳傘降落。紫金斗篷代表 4★ 確定，金斗篷落地時有機會被閃電昇格！</div>
          <div className="flex gap-1.5 mt-1">
            {featured.map((c) => (
              <div key={c.id} className="flex-1 min-w-0 flex flex-col items-center">
                <Portrait c={c} size={56} className="rounded-xl ring-2 ring-[#ffd76a] w-full h-auto" />
                <span className="text-[10px] text-white mt-0.5 truncate w-full text-center">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="si-panel rounded-2xl p-3">
        <div className="flex items-center gap-2 mb-2"><span className="text-[14px] font-bold whitespace-nowrap shrink-0">印章卡</span><span className="text-[11px] text-[#9aa6cf] min-w-0">每次 11 連抽蓋 1 個章，第 5、10 個章必定有 4★</span><span className="ml-auto si-num text-[13px]">{save.stamp}/10</span></div>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 10 }, (_, i) => {
            const n = i + 1, stamped = n <= save.stamp, special = n === 5 || n === 10;
            return (
              <div key={n} className={`relative aspect-square rounded-xl flex items-center justify-center border ${special ? 'border-[#ffd76a] bg-[#2a2350]' : 'border-[#2c3770] bg-[#0b1026]'}`}>
                <span className={`si-num text-[13px] ${special ? 'text-[#ffd76a]' : 'text-[#5a6290]'}`}>{n}</span>
                {special && !stamped && <span className="absolute bottom-0.5 text-[9px] text-[#ffd76a] leading-none">4★確定</span>}
                {stamped && <span className={`absolute inset-1 rounded-full border-[3px] border-[#ff5d6c] text-[#ff5d6c] flex items-center justify-center text-[12px] font-bold ${n === lastStamp ? 'si-stamp' : ''}`} style={{ transform: 'rotate(-12deg)' }}>{special ? '4★' : '印'}</span>}
              </div>
            );
          })}
        </div>
        {save.stampCards > 0 && <div className="text-[11px] text-[#9aa6cf] mt-2">已完成印章卡 {save.stampCards} 張</div>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button className="si-btn si-sky rounded-2xl py-3 flex flex-col items-center gap-0.5" onClick={() => onPull(1)}>
          <span className="text-[15px] font-bold">單抽</span>
          <span className="flex items-center gap-1 text-[13px]">{Ico.gem(14)}<span className="si-num">{COST_SINGLE}</span></span>
        </button>
        <button className="si-btn si-gold relative rounded-2xl py-3 flex flex-col items-center gap-0.5" onClick={() => onPull(11)}>
          {guaranteeNext && <span className="absolute -top-2 right-2 text-[10px] bg-[#ff5d6c] text-white rounded-full px-2 py-0.5 si-pulse">4★確定</span>}
          <span className="text-[15px] font-bold">10+1 連抽</span>
          <span className="flex items-center gap-1 text-[13px]">{Ico.gem(14)}<span className="si-num">{COST_ELEVEN}</span></span>
        </button>
      </div>

      <div className="si-panel rounded-2xl p-3 flex flex-col gap-2 text-[12px]">
        <div className="flex items-center justify-between"><span className="text-[13px] font-bold">出現機率</span><span className="text-[#9aa6cf]">持有 {Object.keys(save.roster).length}/{CHARS.length} 名</span></div>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-xl bg-[#0b1026] py-1.5"><Stars r={4} /><div className="si-num text-[15px]">10%</div></div>
          <div className="rounded-xl bg-[#0b1026] py-1.5"><Stars r={3} /><div className="si-num text-[15px]">40%</div></div>
          <div className="rounded-xl bg-[#0b1026] py-1.5"><Stars r={2} /><div className="si-num text-[15px]">50%</div></div>
        </div>
        <div className="text-[#9aa6cf] leading-relaxed">重覆角色會轉化成限界突破素材：2★ → 虹之碎片、3★ → 虹之結晶、4★ → 虹之星。</div>
        <div className="flex gap-3">{RAINBOW.map((r) => <span key={r.k} className="flex items-center gap-1"><RainbowDot k={r.k} />{r.name} <span className="si-num">{save.rainbow[r.k]}</span></span>)}</div>
      </div>
    </div>
  );
}

function GachaSummary({ data, onClose }) {
  const { results, guaranteed } = data;
  return (
    <div className="absolute inset-0 z-50 bg-[#070a18]/92 flex flex-col px-3 si-fade" style={{ paddingTop: 'calc(12px + var(--sat, 0px))', paddingBottom: 'calc(12px + var(--sab, 0px))' }}>
      <div className="text-center text-[18px] font-bold text-[#ffe17a] mt-2">召喚結果</div>
      {guaranteed && <div className="text-center text-[12px] text-[#ff9fb0]">印章卡保底發動：必定 4★</div>}
      <div className={`flex-1 min-h-0 si-scroll mt-3 grid ${results.length === 1 ? 'grid-cols-1 place-items-center' : 'grid-cols-4'} gap-2 content-start`}>
        {results.map((r, i) => {
          const c = CHAR_BY_ID[r.id];
          return (
            <div key={i} className={`si-pop flex flex-col items-center gap-0.5 rounded-xl p-1.5 ${r.r === 4 ? 'bg-gradient-to-b from-[#5a3a0a] to-[#2a1a05] ring-1 ring-[#ffd76a]' : 'bg-[#151c3d]'}`} style={{ animationDelay: `${i * 40}ms` }}>
              <Portrait c={c} size={results.length === 1 ? 140 : 62} className="rounded-lg" />
              <Stars r={r.r} className="text-[11px] leading-none" />
              <div className="text-[12px] leading-tight truncate w-full text-center">{c.name}</div>
              {r.dup ? <span className="text-[10px] text-[#9fe6ff] flex items-center gap-0.5"><RainbowDot k={r.convert} size={11} />{RAINBOW.find((x) => x.k === r.convert).name}</span> : <span className="si-num text-[10px] text-[#ff8fb0]">NEW</span>}
              {r.promote && <span className="text-[9px] text-[#ffe066]">閃電昇格</span>}
            </div>
          );
        })}
      </div>
      <button className="si-btn si-gold rounded-xl h-12 font-bold text-[15px] mt-3 shrink-0" onClick={() => { SFX.click(); onClose(); }}>確定</button>
    </div>
  );
}

/* ============================================================
 * 10. 存檔與主程式
 * ============================================================ */
const SAVE_KEY = 'skyisle_save_v1';
const newProg = () => ({ nodes: [], lb: 0, awakened: false });
function newSave() {
  return {
    gems: 1000, gold: 200000, souls: 150000,
    runes: { red: 30, blue: 30, yellow: 30, green: 30, white: 30, purple: 30 },
    rainbow: { shard: 2, crystal: 1, star: 0 },
    roster: { c11: newProg(), c12: newProg(), c13: newProg(), c09: newProg() },
    party: ['c11', 'c12', 'c13', 'c09'],
    town: { mine: 1, mineAt: Date.now() - 5 * 60000, training: { sword: 0, fist: 0, lance: 0, mage: 0, bow: 0 } },
    stamp: 0, stampCards: 0, cleared: {},
  };
}
function loadSave() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw) {
      const s = JSON.parse(raw), d = newSave();
      const o = { ...d, ...s, runes: { ...d.runes, ...(s.runes || {}) }, rainbow: { ...d.rainbow, ...(s.rainbow || {}) },
        town: { ...d.town, ...(s.town || {}), training: { ...d.town.training, ...(s.town?.training || {}) } }, cleared: s.cleared || {} };
      o.roster = Object.fromEntries(Object.entries(s.roster || {}).filter(([id]) => CHAR_BY_ID[id]).map(([id, p]) => [id, { ...newProg(), ...p, nodes: (p.nodes || []).filter((n) => SOUL_NODE[n]) }]));
      if (Object.keys(o.roster).length < 4) o.roster = { ...d.roster, ...o.roster };
      const ok = Array.isArray(s.party) && s.party.length === 4 && new Set(s.party).size === 4 && s.party.every((id) => o.roster[id]);
      o.party = ok ? s.party : Object.keys(o.roster).slice(0, 4);
      return o;
    }
  } catch (e) { /* 存檔不可用時使用新存檔 */ }
  return newSave();
}

export default function SkyIsle() {
  const [save, setSave] = useState(loadSave);
  const [tab, setTab] = useState('adventure');
  const [battle, setBattle] = useState(null);
  const [charId, setCharId] = useState(null);
  const [boardId, setBoardId] = useState(null);
  const [gacha, setGacha] = useState(null);
  const [summary, setSummary] = useState(null);
  const [lastStamp, setLastStamp] = useState(0);
  const [toastMsg, setToastMsg] = useState(null);
  const [menu, setMenu] = useState(false);
  const [stageSel, setStageSel] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [coopOpen, setCoopOpen] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [box, setBox] = useState({ w: 360, h: 640 });
  const outerRef = useRef(null), toastT = useRef(null);

  const update = useCallback((fn) => setSave((s) => { const n = JSON.parse(JSON.stringify(s)); fn(n); return n; }), []);
  const toast = useCallback((m) => { setToastMsg(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToastMsg(null), 1900); }, []);

  useEffect(() => { try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* 忽略 */ } }, [save]);
  // 禁止選字、右鍵選單、拖曳圖片同縮放
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    const sel = (e) => { const t = e.target; if (t && t.closest && t.closest('input,textarea')) return; e.preventDefault(); };
    const multi = (e) => { if (e.touches && e.touches.length > 1) e.preventDefault(); };
    const wheel = (e) => { if (e.ctrlKey) e.preventDefault(); };
    const keys = (e) => { if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0', '_'].includes(e.key)) e.preventDefault(); };
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('selectstart', sel);
    document.addEventListener('dragstart', prevent);
    ['gesturestart', 'gesturechange', 'gestureend'].forEach((n) => document.addEventListener(n, prevent));
    document.addEventListener('touchmove', multi, { passive: false });
    document.addEventListener('dblclick', prevent);
    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('keydown', keys);
    return () => {
      document.removeEventListener('contextmenu', prevent); document.removeEventListener('selectstart', sel); document.removeEventListener('dragstart', prevent);
      ['gesturestart', 'gesturechange', 'gestureend'].forEach((n) => document.removeEventListener(n, prevent));
      document.removeEventListener('touchmove', multi); document.removeEventListener('dblclick', prevent);
      window.removeEventListener('wheel', wheel); window.removeEventListener('keydown', keys);
    };
  }, []);
  useEffect(() => {
    const el = outerRef.current;
    const fit = () => {
      const r = el.getBoundingClientRect();
      // 手機直向：填滿整個畫面；桌面／闊螢幕：維持 9:16 置中
      if (r.width < 700 && r.height / Math.max(1, r.width) > 1.35) { setBox({ w: Math.floor(r.width), h: Math.floor(r.height), fill: true }); return; }
      let w = r.width, h = (w * 16) / 9; if (h > r.height) { h = r.height; w = (h * 9) / 16; }
      setBox({ w: Math.floor(w), h: Math.floor(h), fill: false });
    };
    fit(); const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const startBattle = (stage) => {
    const party = save.party.map((id) => { const c = CHAR_BY_ID[id], pr = save.roster[id]; return { char: c, prog: pr, stats: computeStats(c, pr, save.town) }; });
    setBattle({ stage, party, firstClear: !save.cleared[stage.id], key: Date.now() });
  };
  const startCoopBattle = ({ stage, charId, net }) => {
    const c = CHAR_BY_ID[charId] || CHAR_BY_ID[save.party[0]], pr = save.roster[c.id];
    setBattle({ stage, party: [{ char: c, prog: pr, stats: computeStats(c, pr, save.town) }], firstClear: !save.cleared[stage.id], key: Date.now(), net });
  };
  const onWin = (rw) => {
    const sid = battle.stage.id;
    update((s) => {
      s.gold += rw.gold; s.souls += rw.souls; s.gems += rw.gems; s.cleared[sid] = true;
      Object.entries(rw.runes).forEach(([k, v]) => { s.runes[k] = (s.runes[k] || 0) + v; });
    });
  };
  const pull = (count) => {
    SFX.unlock();
    const cost = count === 1 ? COST_SINGLE : COST_ELEVEN;
    if (save.gems < cost) { SFX.error(); toast('寶石不足，首次通關關卡可以獲得寶石'); return; }
    const eleven = count === 11;
    const newStamp = eleven ? save.stamp + 1 : save.stamp;
    const guaranteed = eleven && (newStamp === 5 || newStamp === 10);
    const owned = new Set(Object.keys(save.roster));
    const results = rollGacha(count, guaranteed).map((r) => { const dup = owned.has(r.id); owned.add(r.id); return { ...r, dup, convert: dup ? RAINBOW_FOR_RARITY(r.r) : null }; });
    update((s) => {
      s.gems -= cost;
      results.forEach((r) => { if (r.dup) s.rainbow[r.convert] += 1; else s.roster[r.id] = newProg(); });
      if (eleven) { if (newStamp >= 10) { s.stamp = 0; s.stampCards += 1; } else s.stamp = newStamp; }
    });
    if (eleven) { setLastStamp(newStamp >= 10 ? 0 : newStamp); if (newStamp >= 10) setTimeout(() => toast('印章卡集滿，已換上新卡'), 300); }
    SFX.click();
    setGacha({ results, guaranteed });
  };
  const toggleMute = () => { const m = !muted; SFX.setMuted(m); setMutedState(m); if (!m) SFX.click(); };
  // 全螢幕（Android／電腦／iPad 支援；iPhone 要用「加入主畫面」）
  const fsSupported = typeof document !== 'undefined' && !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  const [isFs, setIsFs] = useState(false);
  useEffect(() => {
    const on = () => setIsFs(!!(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener('fullscreenchange', on); document.addEventListener('webkitfullscreenchange', on);
    return () => { document.removeEventListener('fullscreenchange', on); document.removeEventListener('webkitfullscreenchange', on); };
  }, []);
  const toggleFs = () => {
    SFX.unlock(); SFX.click();
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) { const ex = document.exitFullscreen || document.webkitExitFullscreen; if (ex) ex.call(document); return; }
      const de = document.documentElement, req = de.requestFullscreen || de.webkitRequestFullscreen;
      const pr = req ? req.call(de, { navigationUI: 'hide' }) : null;
      if (!req) toast('呢個瀏覽器唔支援全螢幕');
      else if (pr && pr.catch) pr.catch(() => toast('呢個畫面唔俾開全螢幕'));
    } catch (e) { toast('呢個瀏覽器唔支援全螢幕'); }
  };
  const isIOS = typeof navigator !== 'undefined' && (/iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const standalone = typeof window !== 'undefined' && (window.navigator.standalone === true || (window.matchMedia && (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches)));
  // 戰鬥或抽蛋時收起底層介面，避免 iPhone 上層疊錯亂、誤按到下面嘅按鈕
  const hideBase = !!battle || !!gacha;
  const TABS = [['adventure', '冒險', Ico.sword], ['party', '隊伍/星盤', Ico.party], ['town', '飛行島', Ico.island], ['gacha', '抽蛋', Ico.gacha]];

  return (
    <div ref={outerRef} className="si-root relative w-full h-full flex items-center justify-center overflow-hidden">
      <style>{UI_CSS}</style>
      <div className={`relative overflow-hidden bg-[#0b1026] flex flex-col ${box.fill ? '' : 'rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#2c3770]'}`} style={box.fill ? { position: 'absolute', inset: 0 } : { width: box.w, height: box.h }}>
        {/* 頂部資源列 */}
        <div className="shrink-0 flex items-center gap-1.5 px-2 bg-[#141c44] border-b border-[#34407e]" style={{ paddingTop: 'var(--sat, 0px)', height: 'calc(52px + var(--sat, 0px))', visibility: hideBase ? 'hidden' : 'visible' }}>
          {[[Ico.gem(16), save.gems], [Ico.coin(16), save.gold], [Ico.soul(16), save.souls]].map(([ic, v], i) => (
            <div key={i} className="flex-1 min-w-0 h-8 rounded-full bg-[#222c5e] border border-[#4a58a0] flex items-center gap-1 pl-1.5 pr-2">
              {ic}<span className="si-num text-[14px] text-white truncate">{fmtShort(v)}</span>
            </div>
          ))}
          {fsSupported && !standalone && !IN_CLAUDE && (
            <button className="si-btn shrink-0 w-8 h-8 rounded-full bg-[#222c5e] flex items-center justify-center text-white" onClick={toggleFs} aria-label={isFs ? '離開全螢幕' : '全螢幕'}>
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">{isFs ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}</svg>
            </button>
          )}
          <button className="si-btn shrink-0 w-8 h-8 rounded-full bg-[#222c5e] flex items-center justify-center text-white" onClick={() => { SFX.unlock(); SFX.click(); setMenu(true); }} aria-label="設定">
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><circle cx="5" cy="12" r="2.2" /><circle cx="12" cy="12" r="2.2" /><circle cx="19" cy="12" r="2.2" /></svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 si-scroll relative" style={{ visibility: hideBase ? 'hidden' : 'visible' }}>
          {tab === 'adventure' && (
            <>
              <div className="relative h-[104px] overflow-hidden" style={{ background: 'linear-gradient(180deg,#2b5fb8 0%,#79c1ff 100%)' }}>
                <svg viewBox="0 0 360 104" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden="true">
                  <ellipse cx="60" cy="24" rx="40" ry="10" fill="rgba(255,255,255,.55)" /><ellipse cx="300" cy="34" rx="34" ry="8" fill="rgba(255,255,255,.45)" />
                  <g className="si-bob"><path d="M232 70 Q276 102 320 70 Q308 94 276 98 Q244 94 232 70 Z" fill="#6b4f36" /><ellipse cx="276" cy="70" rx="44" ry="12" fill="#6fc05c" /><path d="M262 66 l10 -22 10 22 z" fill="#efe4cf" /><path d="M258 48 l14 -10 14 10z" fill="#c94a4a" /></g>
                </svg>
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <div className="text-[30px] font-bold leading-none text-white" style={{ textShadow: '0 3px 0 #1d3f8a' }}>星翼浮島</div>
                  <div className="si-num text-[12px] text-white/90 mt-1 tracking-[0.2em]">SKY ISLE</div>
                </div>
              </div>
              <AdventurePage save={save} onPick={setStageSel} goParty={() => setTab('party')} openCoop={() => setCoopOpen(true)} />
            </>
          )}
          {tab === 'party' && <PartyPage save={save} openChar={setCharId} />}
          {tab === 'town' && <TownPage save={save} update={update} toast={toast} />}
          {tab === 'gacha' && <GachaPage save={save} onPull={pull} lastStamp={lastStamp} />}
        </div>

        {/* 底部導航 */}
        <nav className="shrink-0 grid grid-cols-4 bg-[#141c44] border-t border-[#34407e]" style={{ paddingBottom: 'var(--sab, 0px)', height: 'calc(60px + var(--sab, 0px))', visibility: hideBase ? 'hidden' : 'visible' }}>
          {TABS.map(([k, n, ic]) => (
            <button key={k} className={`si-btn flex flex-col items-center justify-center gap-0.5 ${tab === k ? 'text-[#ffe17a]' : 'text-[#8d98c4]'}`} onClick={() => { SFX.unlock(); SFX.click(); setTab(k); }} aria-current={tab === k ? 'page' : undefined}>
              {ic()}<span className="text-[11px]">{n}</span>
            </button>
          ))}
        </nav>

        {stageSel && !battle && <StageInfo stage={stageSel} save={save} onClose={() => setStageSel(null)} onStart={(st) => { setStageSel(null); startBattle(st); }} />}
        {charId && <CharDetail id={charId} save={save} update={update} toast={toast} onClose={() => setCharId(null)} openBoard={setBoardId} />}
        {boardId && <SoulBoardView id={boardId} save={save} update={update} toast={toast} onClose={() => setBoardId(null)} />}
        {coopOpen && <CoopSheet save={save} inBattle={!!battle} onStartBattle={startCoopBattle} onClose={() => setCoopOpen(false)} toast={toast} />}
        {battle && <BattleScreen key={battle.key} stage={battle.stage} party={battle.party} firstClear={battle.firstClear} gems={save.gems} net={battle.net}
          onWin={onWin} onSpendGems={(n) => update((s) => { s.gems -= n; })} onExit={() => setBattle(null)} />}
        {gacha && <GachaShow results={gacha.results} onDone={() => { setSummary(gacha); setGacha(null); }} />}
        {summary && <GachaSummary data={summary} onClose={() => setSummary(null)} />}

        {menu && (
          <div className="absolute inset-0 z-50 bg-[#070a18]/80 flex items-center justify-center p-6 si-fade" onClick={() => { setMenu(false); setConfirmReset(false); }}>
            <div className="si-panel rounded-2xl w-full max-w-[290px] p-4 flex flex-col gap-2.5 si-pop" onClick={(e) => e.stopPropagation()}>
              <div className="text-[16px] font-bold">設定</div>
              <button className="si-btn rounded-xl h-11 bg-[#1d2650] flex items-center justify-center gap-2 text-[14px]" onClick={toggleMute}>{Ico.sound(!muted)}{muted ? '音效：關' : '音效：開'}</button>
              {fsSupported && !standalone && <button className="si-btn rounded-xl h-11 bg-[#1d2650] text-[14px]" onClick={toggleFs}>{isFs ? '離開全螢幕' : '全螢幕'}</button>}
              {!standalone && (isIOS || !fsSupported) && (
                <div className="text-[11.5px] leading-relaxed text-[#c7cff0] bg-[#0b1026] rounded-xl p-2.5">
                  {IN_CLAUDE
                    ? '喺 Claude 入面冇辦法開全螢幕。想全螢幕玩，可以將 index.html 放上 GitHub Pages，再用 Safari 打開，按「分享」→「加入主畫面」，之後由主畫面圖示「星翼浮島」開就係全螢幕。'
                    : 'iPhone 全螢幕玩法：用 Safari 打開呢個網址，按「分享」→「加入主畫面」，之後由主畫面圖示「星翼浮島」開啟就係全螢幕。'}
                </div>
              )}
              {!confirmReset ? (
                <button className="si-btn rounded-xl h-11 bg-[#3a1c2c] text-[#ffb3c0] text-[14px]" onClick={() => setConfirmReset(true)}>重置存檔</button>
              ) : (
                <div className="rounded-xl bg-[#3a1c2c] p-3 flex flex-col gap-2">
                  <div className="text-[13px] text-[#ffd0d8]">所有角色、星盤和資源會回到初始狀態。</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="si-btn rounded-lg h-9 bg-[#1d2650] text-[13px]" onClick={() => setConfirmReset(false)}>取消</button>
                    <button className="si-btn rounded-lg h-9 bg-[#ff5d6c] text-white text-[13px] font-bold" onClick={() => { setSave(newSave()); setConfirmReset(false); setMenu(false); setTab('adventure'); toast('已重置存檔'); }}>確定重置</button>
                  </div>
                </div>
              )}
              <div className="text-[11px] text-[#9aa6cf] leading-relaxed">進度自動儲存在這部裝置的瀏覽器內。</div>
              <div className="flex items-center gap-2 text-[11px] text-[#9aa6cf]">
                <span>版本 <span className="si-num text-[#c7cff0]">{(typeof window !== 'undefined' && window.__SKY_VER) || '—'}</span></span>
                {typeof window !== 'undefined' && window.__skyCheckUpdate && (
                  <button className="si-btn ml-auto rounded-full h-7 px-3 bg-[#1d2650] text-[#c7cff0] text-[12px]" onClick={() => { SFX.click(); toast('檢查緊有冇新版本…'); window.__skyCheckUpdate((r) => toast(r === 'update' ? '搵到新版本，即刻更新！' : r === 'latest' ? '已經係最新版本' : '暫時連唔到 GitHub，遲啲再試')); }}>檢查更新</button>
                )}
              </div>
              <button className="si-btn si-gold rounded-xl h-10 font-bold text-[14px]" onClick={() => setMenu(false)}>關閉</button>
            </div>
          </div>
        )}

        {toastMsg && <div role="status" style={{ top: 'calc(60px + var(--sat, 0px))' }} className="absolute left-1/2 -translate-x-1/2 z-[60] max-w-[90%] text-center text-[13px] bg-[#0b1026]/95 border border-[#f3c55b]/60 text-[#ffe9a3] rounded-full px-4 py-1.5 si-pop pointer-events-none">{toastMsg}</div>}
      </div>
    </div>
  );
}
