
/* ============================================================
 * 12. 獨立網頁版協力連線（Claude 以外，例如 GitHub Pages）
 *     用免費公共 MQTT 伺服器（WebSocket）轉送，介面同 Claude room 一樣：
 *     join(name) / presence(patch) / peers() / onPeers(fn) / leave()
 *     全隊要連同一個伺服器先見到對方。
 * ============================================================ */
const MQTT_PREFIX = 'skyisle-hk7q/v2';
const MQTT_BROKERS = (() => {
  const list = [
    { name: '伺服器 1', url: 'wss://broker.hivemq.com:8884/mqtt' },
    { name: '伺服器 2', url: 'wss://broker.emqx.io:8084/mqtt' },
    { name: '伺服器 3', url: 'wss://test.mosquitto.org:8081/mqtt' },
  ];
  try {
    const q = new URLSearchParams(window.location.search).get('mqtt');
    if (q && /^wss?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(q)) return [{ name: '本機測試', url: q }, ...list];
  } catch (e) { /* 略過 */ }
  return list;
})();
const _enc = new TextEncoder(), _dec = new TextDecoder();
const u8cat = (...parts) => { const n = parts.reduce((s, p) => s + p.length, 0), out = new Uint8Array(n); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; };
const mqStr = (s) => { const b = typeof s === 'string' ? _enc.encode(s) : s; return u8cat(Uint8Array.of(b.length >> 8, b.length & 255), b); };
const mqLen = (n) => { const out = []; do { let d = n % 128; n = Math.floor(n / 128); if (n > 0) d |= 128; out.push(d); } while (n > 0); return Uint8Array.from(out); };
const mqPacket = (first, body) => u8cat(Uint8Array.of(first), mqLen(body.length), body);

function createMqttHub(url, prefix) {
  const PEER = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);
  const raf = (f) => (typeof window.requestAnimationFrame === 'function' && !document.hidden ? window.requestAnimationFrame(f) : setTimeout(f, 30));
  let ws = null, conn = false, closed = false, buf = new Uint8Array(0), pid = 1, retry = 0, pingT = null, retryT = null, everConnected = false;
  const rooms = new Map(), connL = new Set();
  const setConn = (v) => { if (conn === v) return; conn = v; if (v) everConnected = true; connL.forEach((fn) => { try { fn(v); } catch (e) { /* 略過 */ } }); };
  const send = (bytes) => { if (ws && ws.readyState === 1) { try { ws.send(bytes); } catch (e) { /* 略過 */ } } };
  const publish = (topic, obj) => send(mqPacket(0x30, u8cat(mqStr(topic), _enc.encode(JSON.stringify(obj)))));
  const nextId = () => { pid = (pid % 65000) + 1; return Uint8Array.of(pid >> 8, pid & 255); };
  const subscribe = (filter) => send(mqPacket(0x82, u8cat(nextId(), mqStr(filter), Uint8Array.of(0))));
  const unsubscribe = (filter) => send(mqPacket(0xa2, u8cat(nextId(), mqStr(filter))));
  const byeTopic = `${prefix}/_bye/${PEER}`;

  function connect() {
    if (closed) return;
    try { ws = new WebSocket(url, ['mqtt']); } catch (e) { schedule(); return; }
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => {
      const flags = 0x02 | 0x04; // 清除連線 + 斷線遺言
      send(mqPacket(0x10, u8cat(mqStr('MQTT'), Uint8Array.of(4, flags, 0, 30), mqStr('sk' + PEER), mqStr(byeTopic), mqStr('{"bye":1}'))));
    };
    ws.onmessage = (ev) => onData(ev.data);
    ws.onclose = () => { setConn(false); clearInterval(pingT); pingT = null; ws = null; schedule(); };
    ws.onerror = () => { /* onclose 會處理 */ };
  }
  function schedule() { if (closed || retryT) return; const wait = Math.min(8000, 1000 * Math.pow(2, retry++)); retryT = setTimeout(() => { retryT = null; connect(); }, wait); }
  function onData(ab) {
    buf = buf.length ? u8cat(buf, new Uint8Array(ab)) : new Uint8Array(ab);
    while (buf.length >= 2) {
      let mul = 1, len = 0, i = 1, b;
      do { if (i >= buf.length) return; b = buf[i++]; len += (b & 127) * mul; mul *= 128; } while (b & 128);
      if (buf.length < i + len) return;
      const type = buf[0] >> 4, fl = buf[0] & 15, body = buf.slice(i, i + len);
      buf = buf.slice(i + len);
      if (type === 2) {
        if (body[1] === 0) {
          retry = 0; setConn(true);
          subscribe(`${prefix}/_bye/+`);
          rooms.forEach((r) => { subscribe(r.filter); r.dirty = true; });
          clearInterval(pingT); pingT = setInterval(() => send(Uint8Array.of(0xc0, 0)), 20000);
        } else { try { ws.close(); } catch (e) { /* 略過 */ } }
      } else if (type === 3) {
        const tl = (body[0] << 8) | body[1], qos = (fl >> 1) & 3;
        const topic = _dec.decode(body.subarray(2, 2 + tl));
        const payload = body.subarray(2 + tl + (qos ? 2 : 0));
        if (payload.length <= 12000) route(topic, payload);
      }
    }
  }
  function route(topic, payload) {
    if (!topic.startsWith(prefix + '/')) return;
    const rest = topic.slice(prefix.length + 1), cut = rest.lastIndexOf('/');
    if (cut < 0) return;
    const roomName = rest.slice(0, cut), peer = rest.slice(cut + 1);
    if (peer === PEER || !/^[a-z0-9]{1,16}$/.test(peer)) return;
    if (roomName === '_bye') { rooms.forEach((r) => r.remove(peer)); return; }
    const r = rooms.get(roomName); if (!r) return;
    let obj; try { obj = JSON.parse(_dec.decode(payload)); } catch (e) { return; }
    if (obj && typeof obj === 'object') r.receive(peer, obj);
  }
  function makeRoom(name) {
    const topic = `${prefix}/${name}/${PEER}`;
    const r = { name, filter: `${prefix}/${name}/+`, mine: {}, others: new Map(), peerL: new Set(), snapshot: Object.freeze([]), dirty: true, lastPub: 0, queued: false, emptySent: true };
    const build = () => {
      const arr = [Object.freeze({ peer: PEER, by: null, isMe: true, sameTab: true, kind: 'viewer', guest: false, presence: Object.freeze({ ...r.mine }), updatedAt: Date.now() })];
      for (const [peer, o] of r.others) arr.push(Object.freeze({ peer, by: null, isMe: false, sameTab: false, kind: 'viewer', guest: false, presence: o.presence, updatedAt: o.updatedAt }));
      r.snapshot = Object.freeze(arr);
    };
    r.notify = () => {
      if (r.queued) return; r.queued = true;
      raf(() => { r.queued = false; build(); const ch = { peers: r.snapshot, joined: [], left: [], updated: r.snapshot }; r.peerL.forEach((fn) => { try { fn(ch); } catch (e) { console.error(e); } }); });
    };
    r.pub = (now) => {
      if (!conn) return;
      if (!Object.keys(r.mine).length) { if (!r.emptySent) { publish(topic, { bye: 1 }); r.emptySent = true; } r.dirty = false; return; }
      publish(topic, { p: r.mine }); r.emptySent = false; r.lastPub = now; r.dirty = false;
    };
    r.tick = (now) => {
      if ((r.dirty && now - r.lastPub >= 66) || (Object.keys(r.mine).length && now - r.lastPub >= 1500)) r.pub(now);
      let changed = false;
      for (const [peer, o] of r.others) if (now - o.lastSeen > 5000) { r.others.delete(peer); changed = true; }
      if (changed) r.notify();
    };
    r.receive = (peer, obj) => {
      const now = Date.now();
      if (obj.bye) { if (r.others.delete(peer)) r.notify(); return; }
      if (!obj.p || typeof obj.p !== 'object' || Array.isArray(obj.p)) return;
      const raw = JSON.stringify(obj.p), o = r.others.get(peer);
      if (!o) { r.others.set(peer, { presence: Object.freeze(obj.p), raw, updatedAt: now, lastSeen: now }); r.dirty = true; r.notify(); }
      else { o.lastSeen = now; if (o.raw !== raw) { o.raw = raw; o.presence = Object.freeze(obj.p); o.updatedAt = now; r.notify(); } }
    };
    r.remove = (peer) => { if (r.others.delete(peer)) r.notify(); };
    r.api = Object.freeze({
      name,
      presence(patch) {
        const next = { ...r.mine };
        for (const k of Object.keys(patch || {})) { if (patch[k] === null) delete next[k]; else next[k] = patch[k]; }
        if (_enc.encode(JSON.stringify(next)).length > 6000) return Promise.reject({ code: 'invalid_argument', message: 'presence too large' });
        r.mine = next; r.dirty = true; r.notify(); return Promise.resolve();
      },
      peers: () => r.snapshot,
      onPeers(fn) { r.peerL.add(fn); setTimeout(() => { build(); try { fn({ peers: r.snapshot, joined: r.snapshot, left: [], updated: [] }); } catch (e) { console.error(e); } }, 0); return () => { r.peerL.delete(fn); }; },
      connected: () => conn,
      onConnection(fn) { connL.add(fn); setTimeout(() => fn(conn), 0); return () => connL.delete(fn); },
      emit: () => Promise.resolve(),
      on: () => () => {},
      join: (n) => hub.join(n),
      leave() {
        if (rooms.get(name) !== r) return Promise.resolve();
        if (conn) { publish(topic, { bye: 1 }); unsubscribe(r.filter); }
        rooms.delete(name); r.peerL.clear(); return Promise.resolve();
      },
    });
    build();
    return r;
  }
  const tickT = setInterval(() => { const now = Date.now(); rooms.forEach((r) => r.tick(now)); }, 33);
  const onHide = () => { if (conn) rooms.forEach((r) => { if (Object.keys(r.mine).length) publish(`${prefix}/${r.name}/${PEER}`, { bye: 1 }); }); };
  window.addEventListener('pagehide', onHide);
  const hub = {
    url, peer: PEER,
    connected: () => conn,
    everConnected: () => everConnected,
    onConnection(fn) { connL.add(fn); setTimeout(() => fn(conn), 0); return () => connL.delete(fn); },
    join(name) {
      if (!/^[a-z0-9][a-z0-9_.-]{0,47}$/.test(name)) return Promise.reject({ code: 'invalid_argument', message: 'bad room name' });
      let r = rooms.get(name);
      if (!r) { r = makeRoom(name); rooms.set(name, r); if (conn) subscribe(r.filter); }
      return Promise.resolve(r.api);
    },
    close() {
      closed = true; onHide(); clearInterval(tickT); clearInterval(pingT); clearTimeout(retryT);
      window.removeEventListener('pagehide', onHide);
      if (ws) { try { send(Uint8Array.of(0xe0, 0)); ws.close(); } catch (e) { /* 略過 */ } }
      rooms.clear(); connL.clear(); setConn(false);
    },
  };
  const lobbyR = makeRoom('lobby'); rooms.set('lobby', lobbyR);
  hub.lobby = lobbyR.api;
  connect();
  return hub;
}
let _mqttHub = null;
function getMqttHub(idx) {
  const b = MQTT_BROKERS[idx] || MQTT_BROKERS[0];
  if (_mqttHub && _mqttHub.url === b.url) return _mqttHub;
  if (_mqttHub) _mqttHub.close();
  _mqttHub = createMqttHub(b.url, MQTT_PREFIX);
  return _mqttHub;
}
