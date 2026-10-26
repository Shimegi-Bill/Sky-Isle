
/* ============================================================
 * 11. 協力模式大廳（room capability：開房／加入／準備／開始）
 * ============================================================ */
const ROOM_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const genCode = () => Array.from({ length: 4 }, () => ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]).join('');
const NICK_KEY = 'skyisle_nick';
function loadNick() { try { return cleanNick(window.localStorage.getItem(NICK_KEY)); } catch (e) { return ''; } }
function saveNick(n) { try { window.localStorage.setItem(NICK_KEY, n); } catch (e) { /* 略過 */ } }
const SERVER_KEY = 'skyisle_server';
function loadServer() { try { const v = +window.localStorage.getItem(SERVER_KEY); return v >= 0 && v < MQTT_BROKERS.length ? v : 0; } catch (e) { return 0; } }
const IN_CLAUDE = typeof window !== 'undefined' && !!window.claude && typeof window.claude.use === 'function';

function CoopSheet({ save, inBattle, onStartBattle, onClose, toast }) {
  const [cap, setCap] = useState({ status: 'connecting', room: null });
  const [nick, setNick] = useState(() => loadNick() || `玩家${Math.floor(Math.random() * 900 + 100)}`);
  const [charId, setCharId] = useState(save.party[0]);
  const [stageId, setStageId] = useState(STAGES[0].id);
  const [lobbyPeers, setLobbyPeers] = useState([]);
  const [named, setNamed] = useState(null);
  const [code, setCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [peers, setPeers] = useState([]);
  const [ready, setReady] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [joinedAt, setJoinedAt] = useState(0);
  const [serverIdx, setServerIdx] = useState(loadServer);
  const startedRef = useRef(null), hostRef = useRef(null), namedRef = useRef(null);
  namedRef.current = named;

  // 協力房間打開期間唔好自動更新（會甩線）
  useEffect(() => {
    window.__skyBusy = (window.__skyBusy || 0) + 1;
    return () => {
      window.__skyBusy = Math.max(0, (window.__skyBusy || 1) - 1);
      if (!window.__skyBusy && window.__skyUpdatePending) setTimeout(() => { if (!window.__skyBattle && !window.__skyBusy && window.__skyUpdatePending) window.__skyUpdatePending(); }, 1500);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    if (IN_CLAUDE) {
      window.claude.use('room').then((r) => { if (alive) setCap(r ? { status: 'ok', room: r, mode: 'claude' } : { status: 'unavailable', room: null, mode: 'claude' }); }, () => { if (alive) setCap({ status: 'unavailable', room: null, mode: 'claude' }); });
      return () => { alive = false; };
    }
    // 獨立網頁：經公共 MQTT 伺服器連線
    const hub = getMqttHub(serverIdx);
    setCap({ status: hub.connected() ? 'ok' : 'connecting', room: hub.lobby, mode: 'mqtt' });
    const un = hub.onConnection((c) => { if (alive) setCap((prev) => ({ ...prev, room: hub.lobby, mode: 'mqtt', status: c ? 'ok' : hub.everConnected() ? 'reconnecting' : prev.status === 'failed' ? 'failed' : 'connecting' })); });
    const t = setTimeout(() => { if (alive && !hub.connected()) setCap((prev) => ({ ...prev, status: 'failed' })); }, 9000);
    return () => { alive = false; un(); clearTimeout(t); };
  }, [serverIdx]);
  useEffect(() => {
    const r = cap.room; if (!r) return undefined;
    return r.onPeers((ch) => setLobbyPeers(ch.peers), () => setCap((prev) => ({ ...prev, status: 'unavailable', room: null })));
  }, [cap.room]);
  const switchServer = async (i) => {
    if (i === serverIdx) return;
    SFX.click(); await leave(); setLobbyPeers([]);
    try { window.localStorage.setItem(SERVER_KEY, String(i)); } catch (e) { /* 略過 */ }
    setServerIdx(i);
  };
  const online = cap.status === 'ok' || (cap.mode === 'mqtt' && cap.status === 'reconnecting');

  const resetRoom = () => { setNamed(null); setCode(''); setIsHost(false); setPeers([]); setReady(false); startedRef.current = null; };
  const leave = async () => {
    const nr = namedRef.current; resetRoom();
    if (nr) { try { await nr.presence({ lob: null, gm: null }); } catch (e) { /* 略過 */ } try { await nr.leave(); } catch (e) { /* 略過 */ } }
    if (cap.room) cap.room.presence({ open: null }).catch(() => {});
  };
  useEffect(() => () => { const nr = namedRef.current; if (nr) { nr.presence({ lob: null, gm: null }).catch(() => {}); nr.leave().catch(() => {}); } }, []);

  useEffect(() => {
    if (!named) return undefined;
    let t = null, last = 0, latest = named.peers();
    setPeers(latest);
    const un = named.onPeers((ch) => {
      latest = ch.peers;
      const flush = () => { t = null; last = Date.now(); setPeers(latest); };
      if (Date.now() - last > 180) flush(); else if (!t) t = setTimeout(flush, 180);
    }, () => { toast('連線中斷，已離開房間'); resetRoom(); });
    return () => { un(); if (t) clearTimeout(t); };
  }, [named]);

  const me = peers.find((p) => p.sameTab);
  const myPeer = me ? me.peer : null;
  const members = peers.filter((p) => p.presence && p.presence.lob && p.presence.lob.code === code)
    .sort((a, b) => (b.presence.lob.host ? 1 : 0) - (a.presence.lob.host ? 1 : 0) || (+a.presence.lob.j || 0) - (+b.presence.lob.j || 0) || (a.peer < b.peer ? -1 : 1));
  const host = members.find((p) => p.presence.lob.host) || null;
  hostRef.current = host;
  const roomStage = STAGES.find((s) => s.id === (isHost ? stageId : host?.presence.lob.st)) || STAGES[0];
  const others = members.filter((p) => !p.sameTab);
  const allReady = others.slice(0, 3).every((p) => p.presence.lob.rdy);

  // 自己在房間內的資料
  useEffect(() => {
    if (!named) return;
    const pr = save.roster[charId];
    named.presence({ lob: { code, host: isHost, j: joinedAt, nick: cleanNick(nick) || '玩家', c: charId, aw: pr && pr.awakened ? 1 : 0, lv: charLevel(pr), rdy: isHost ? true : ready, ph: inBattle ? 'battle' : 'wait', st: isHost ? stageId : null } }).catch(() => {});
  }, [named, nick, charId, ready, stageId, inBattle, isHost, code, joinedAt]);
  // 房主在大廳公開房間
  useEffect(() => {
    if (!cap.room) return;
    if (named && isHost) cap.room.presence({ open: { code, st: stageId, n: members.length, nick: cleanNick(nick) || '玩家', ph: inBattle ? 'battle' : 'wait' } }).catch(() => {});
    else cap.room.presence({ open: null }).catch(() => {});
  }, [cap.room, named, isHost, code, stageId, members.length, nick, inBattle]);
  // 加入者：找房主、檢查滿員
  useEffect(() => {
    if (!named || isHost) return undefined;
    if (host) {
      const idx = members.findIndex((p) => p.sameTab);
      if (idx >= 4) { toast('房間已滿（最多 4 人）'); leave(); }
      return undefined;
    }
    const t = setTimeout(() => { if (!hostRef.current && namedRef.current === named) { toast('搵唔到呢個房間，請檢查房號'); leave(); } }, 4500);
    return () => clearTimeout(t);
  }, [named, isHost, !!host, members.length]);
  // 加入者：房主開始戰鬥
  useEffect(() => {
    if (!named || isHost || !host || !myPeer) return;
    const gm = host.presence.gm;
    if (gm && typeof gm === 'object' && gm.bid && gm.bid !== startedRef.current && Array.isArray(gm.pl) && gm.pl.includes(myPeer)) {
      startedRef.current = gm.bid;
      launch(gm.bid, gm.pl.slice(0, 4), gm.st, false, host.peer);
    }
  }, [peers]);
  // 戰鬥結束返回房間後，加入者要再按準備
  useEffect(() => { if (!inBattle) setReady(false); }, [inBattle]);

  const launch = (bid, pl, st, asHost, hostPeer) => {
    const stage = STAGES.find((s) => s.id === st) || STAGES[0];
    onStartBattle({ stage, charId, net: { room: named, role: asHost ? 'host' : 'client', hostPeer, bid, players: pl, nick: cleanNick(nick) || '玩家', slot: Math.max(0, pl.indexOf(myPeer)), n: pl.length, grace: cap.mode === 'mqtt' ? 0.5 : NET_GRACE } });
  };
  const create = async () => {
    if (!cap.room || busy) return;
    setBusy(true);
    try {
      const c = genCode();
      const nr = await cap.room.join(`coop-${c.toLowerCase()}`);
      setCode(c); setIsHost(true); setJoinedAt(Date.now()); setNamed(nr); SFX.join();
    } catch (e) { SFX.error(); toast(e && e.code === 'not_permitted' ? '你的帳戶未能開協力房間' : '開房失敗，請稍後再試'); }
    setBusy(false);
  };
  const join = async (raw) => {
    const c = String(raw || joinCode).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (c.length !== 4) { SFX.error(); toast('請輸入 4 位房號'); return; }
    if (!cap.room || busy) return;
    setBusy(true);
    try {
      const nr = await cap.room.join(`coop-${c.toLowerCase()}`);
      setCode(c); setIsHost(false); setReady(false); setJoinedAt(Date.now()); setNamed(nr); SFX.join();
    } catch (e) { SFX.error(); toast('加入失敗，請稍後再試'); }
    setBusy(false);
  };
  const start = () => {
    if (!named || !myPeer) return;
    const pl = members.slice(0, 4).map((p) => p.peer);
    if (!pl.includes(myPeer)) return;
    if (!allReady) { SFX.error(); toast('等所有隊友按「準備」'); return; }
    const bid = (Date.now() % 1000000000) + Math.floor(Math.random() * 997);
    startedRef.current = bid;
    named.presence({ gm: { bid, st: stageId, pl, at: Date.now() } }).catch(() => {});
    SFX.ready();
    launch(bid, pl, stageId, true, myPeer);
  };
  const copyCode = () => {
    try { navigator.clipboard.writeText(code).then(() => toast('已複製房號'), () => toast(`房號：${code}`)); } catch (e) { toast(`房號：${code}`); }
  };
  const openRooms = lobbyPeers.filter((p) => !p.sameTab && p.presence && p.presence.open && typeof p.presence.open.code === 'string' && /^[A-Z0-9]{4}$/.test(p.presence.open.code)).map((p) => ({ ...p.presence.open, peer: p.peer }));
  const roster = Object.keys(save.roster).sort((a, b) => CHAR_BY_ID[b].r - CHAR_BY_ID[a].r || a.localeCompare(b));

  return (
    <Sheet title="協力模式" onClose={() => { leave(); onClose(); }}>
      <div className="p-3 flex flex-col gap-3">
        {cap.mode === 'mqtt' && (
          <div className="si-panel rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold">連線伺服器</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${cap.status === 'ok' ? 'bg-[#9dff9a] text-[#0b1026]' : cap.status === 'failed' ? 'bg-[#ff6b81] text-white' : 'bg-[#1d2650] text-[#c7cff0] si-pulse'}`}>
                {cap.status === 'ok' ? '已連線' : cap.status === 'failed' ? '連唔到' : cap.status === 'reconnecting' ? '重新連線中…' : '連線中…'}
              </span>
            </div>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${MQTT_BROKERS.length}, minmax(0, 1fr))` }}>
              {MQTT_BROKERS.map((b, i) => (
                <button key={b.url} disabled={inBattle} className={`si-btn rounded-xl h-9 text-[13px] border ${i === serverIdx ? 'bg-[#7fd6ff] text-[#0b1d3a] border-transparent font-bold' : 'bg-[#0b1026] border-[#2c3770]'}`} onClick={() => switchServer(i)}>{b.name}</button>
              ))}
            </div>
            <div className="text-[11px] leading-relaxed text-[#9aa6cf]">
              全隊要揀同一個伺服器先見到對方。呢啲係免費公共伺服器，唔保證一定連得到，連唔到就轉第二個試試。名稱唔好用真名，因為公共伺服器上其他人都可能收到遊戲資料。
            </div>
          </div>
        )}
        {cap.status === 'unavailable' && (
          <div className="si-panel rounded-2xl p-4 text-[13px] leading-relaxed text-[#d6dcf5]">
            <div className="text-[15px] font-bold text-[#ff9fb0] mb-1">而家連唔到協力伺服器</div>
            協力模式要喺 Claude 入面打開呢個遊戲，並且登入帳戶先用得。想同朋友一齊玩，要由擁有者喺分享選單邀請朋友，朋友登入後打開同一個連結就可以入房。
          </div>
        )}
        {cap.status === 'connecting' && cap.mode !== 'mqtt' && <div className="si-panel rounded-2xl p-4 text-[13px] text-[#c7cff0] si-pulse">連接協力伺服器中…</div>}

        <div className="si-panel rounded-2xl p-3 flex flex-col gap-2">
          <label htmlFor="coop-nick" className="text-[12px] text-[#9aa6cf]">你的名稱（隊友會見到）</label>
          <input id="coop-nick" value={nick} maxLength={10} onChange={(e) => { const v = cleanNick(e.target.value); setNick(v); saveNick(v); }}
            className="h-10 rounded-xl bg-[#0b1026] border border-[#2c3770] px-3 text-[15px] text-[#f4efe2] outline-none focus:border-[#9dff9a]" />
          <div className="text-[12px] text-[#9aa6cf] mt-1">出戰角色（協力每人帶 1 名角色）</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {roster.map((id) => {
              const c = CHAR_BY_ID[id], pr = save.roster[id], on = id === charId;
              return (
                <button key={id} disabled={inBattle} className={`si-btn shrink-0 flex flex-col items-center gap-0.5 rounded-xl p-1 ${on ? 'bg-[#9dff9a] text-[#0b1026]' : 'bg-[#0b1026]'}`} onClick={() => { SFX.click(); setCharId(id); }} aria-pressed={on} aria-label={`選擇 ${c.name}`}>
                  <Portrait c={c} awakened={pr.awakened} size={46} className="rounded-lg" />
                  <span className="text-[11px] leading-none">{c.name}</span>
                  <span className="text-[9px] leading-none" style={{ color: on ? '#0b1026' : CLS[c.cls].color }}>{CLS[c.cls].name} Lv{charLevel(pr)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {online && !named && (
          <>
            <div className="si-panel rounded-2xl p-3 flex flex-col gap-2">
              <button disabled={busy} className="si-btn rounded-xl h-12 font-bold text-[16px] bg-[#9dff9a] text-[#0b1026] disabled:opacity-50" onClick={create}>開新房間</button>
              <div className="flex gap-2">
                <input id="coop-code" value={joinCode} maxLength={4} placeholder="輸入房號" autoCapitalize="characters" autoComplete="off"
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  className="flex-1 min-w-0 h-11 rounded-xl bg-[#0b1026] border border-[#2c3770] px-3 si-num text-[18px] tracking-[0.3em] text-[#f4efe2] outline-none focus:border-[#7fd6ff] uppercase" />
                <button disabled={busy} className="si-btn si-sky rounded-xl h-11 px-5 font-bold text-[15px] shrink-0 disabled:opacity-50" onClick={() => join()}>加入</button>
              </div>
            </div>
            <div className="si-panel rounded-2xl p-3 flex flex-col gap-2">
              <div className="text-[14px] font-bold">公開中的房間</div>
              {openRooms.length === 0 ? <div className="text-[12px] text-[#9aa6cf]">暫時未有人開房。你可以開新房間，再將房號話俾朋友知。</div> : openRooms.map((o) => {
                const st = STAGES.find((s) => s.id === o.st);
                return (
                  <div key={o.peer} className="flex items-center gap-2 rounded-xl bg-[#0b1026] p-2">
                    <span className="si-num text-[18px] text-[#9dff9a] w-14 shrink-0">{o.code}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] truncate">{cleanNick(o.nick) || '玩家'} 的房間</div>
                      <div className="text-[11px] text-[#9aa6cf]">{st ? `${st.name}・${st.diff}` : '—'}・{Math.min(4, +o.n || 1)}/4 人{o.ph === 'battle' ? '・戰鬥中' : ''}</div>
                    </div>
                    <button disabled={busy || o.ph === 'battle' || (+o.n || 1) >= 4} className="si-btn shrink-0 rounded-full h-8 px-4 text-[13px] font-bold bg-[#7fd6ff] text-[#0b1d3a] disabled:opacity-40" onClick={() => join(o.code)}>加入</button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {named && (
          <div className="si-panel rounded-2xl p-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-[#9aa6cf]">房號（話俾隊友知）{cap.mode === 'mqtt' && <span className="text-[#7fd6ff]">・{(MQTT_BROKERS[serverIdx] || MQTT_BROKERS[0]).name}</span>}</div>
                <div className="si-num text-[34px] leading-none tracking-[0.18em] text-[#9dff9a]">{code}</div>
              </div>
              <button className="si-btn rounded-full h-9 px-4 text-[13px] bg-[#1d2650] border border-[#2c3770] shrink-0" onClick={copyCode}>複製</button>
            </div>
            {isHost ? (
              <div className="flex flex-col gap-1.5">
                <div className="text-[12px] text-[#9aa6cf]">選擇關卡（人數越多怪物越硬）</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {STAGES.map((st) => (
                    <button key={st.id} disabled={inBattle} className={`si-btn rounded-xl px-2 py-1.5 text-left border ${stageId === st.id ? 'bg-[#f3c55b] text-[#2a1a05] border-transparent' : 'bg-[#0b1026] border-[#2c3770]'}`} onClick={() => { SFX.click(); setStageId(st.id); }}>
                      <div className="text-[13px] font-bold leading-tight">{st.name}</div>
                      <div className="text-[10px] opacity-80">{st.diff}・Lv.{st.lv}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#0b1026] px-3 py-2 text-[13px]">關卡：<b className="text-[#ffe17a]">{roomStage.name}</b>・{roomStage.diff}{!host && <span className="text-[#9aa6cf]">（等待房主…）</span>}</div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((i) => {
                const pr = members[i];
                if (!pr) return <div key={i} className="rounded-xl border border-dashed border-[#2c3770] h-[74px] flex items-center justify-center text-[12px] text-[#5a6290]">等待加入</div>;
                const l = pr.presence.lob, c = CHAR_BY_ID[l.c];
                return (
                  <div key={pr.peer} className="rounded-xl bg-[#0b1026] p-2 flex items-center gap-2" style={{ boxShadow: `inset 0 0 0 2px ${SLOT_COLORS[i]}` }}>
                    {c ? <Portrait c={c} awakened={!!l.aw} size={44} className="rounded-lg shrink-0" /> : <div className="w-11 h-11 rounded-lg bg-[#1d2650]" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] truncate" style={{ color: SLOT_COLORS[i] }}>{cleanNick(l.nick) || '玩家'}{pr.sameTab ? '（你）' : ''}</div>
                      <div className="text-[10px] text-[#9aa6cf] truncate">{c ? `${c.name}・${CLS[c.cls].name}` : '—'} Lv{Math.min(100, +l.lv || 1)}</div>
                      <div className={`text-[10px] font-bold ${l.host ? 'text-[#ffe17a]' : l.rdy ? 'text-[#9dff9a]' : 'text-[#ff9fb0]'}`}>{l.host ? '房主' : l.ph === 'battle' ? '戰鬥中' : l.rdy ? '已準備' : '未準備'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-[11px] leading-relaxed text-[#c7cff0] bg-[#0b1026] rounded-xl p-2.5">
              隊友 HP 歸零時會出現紅色倒數圈（約 0.5 秒）。喺倒數完之前放治癒技能，就可以即時救返佢；倒下之後亦可以用治癒技能復活。
            </div>
            {isHost ? (
              <button disabled={inBattle} className="si-btn si-gold rounded-xl h-12 font-bold text-[16px] disabled:opacity-50" onClick={start}>
                {others.length === 0 ? '一個人開始' : allReady ? `開始戰鬥（${Math.min(4, members.length)} 人）` : '等待隊友準備…'}
              </button>
            ) : (
              <button disabled={inBattle || !host} className={`si-btn rounded-xl h-12 font-bold text-[16px] disabled:opacity-50 ${ready ? 'bg-[#1d2650] text-[#9dff9a] border border-[#9dff9a]' : 'bg-[#9dff9a] text-[#0b1026]'}`} onClick={() => { SFX.click(); setReady(!ready); }}>
                {ready ? '已準備（等待房主開始）' : '準備'}
              </button>
            )}
            <button className="si-btn rounded-xl h-10 bg-[#3a1c2c] text-[#ffb3c0] text-[14px]" onClick={() => { SFX.click(); leave(); }}>離開房間</button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
