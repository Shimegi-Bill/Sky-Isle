// 本機測試用：以 BroadcastChannel 模擬 claude.use("room")（延遲 40–110ms、5% 掉包、合併送出）
(function () {
  const PEER = Math.random().toString(36).slice(2, 10);
  const LAT = () => 40 + Math.random() * 70;
  const rooms = {};
  function makeRoom(name) {
    if (rooms[name]) return rooms[name];
    const ch = new BroadcastChannel('mockroom:' + name);
    const mine = {}; const others = new Map(); const peerL = new Set(); const topicL = new Map();
    let snapshot = Object.freeze([]), queued = false, dirty = false, closed = false;
    const build = () => {
      const arr = [Object.freeze({ peer: PEER, by: null, isMe: true, sameTab: true, kind: 'viewer', guest: false, presence: Object.freeze(JSON.parse(JSON.stringify(mine))), updatedAt: Date.now() })];
      for (const [peer, o] of others) arr.push(Object.freeze({ peer, by: null, isMe: false, sameTab: false, kind: 'viewer', guest: false, presence: o.presence, updatedAt: o.updatedAt }));
      snapshot = Object.freeze(arr);
    };
    const notify = () => {
      if (queued) return; queued = true;
      requestAnimationFrame(() => { queued = false; build(); const chg = { peers: snapshot, joined: [], left: [], updated: snapshot }; peerL.forEach((fn) => { try { fn(chg); } catch (e) { console.error(e); } }); });
    };
    const send = (kind) => { if (!closed) ch.postMessage({ kind, peer: PEER, presence: mine }); };
    const t1 = setInterval(() => { if (dirty) { dirty = false; send('p'); } }, 33);
    const t2 = setInterval(() => {
      send('ka'); const now = Date.now();
      for (const [peer, o] of others) if (now - o.lastSeen > 3000) { others.delete(peer); notify(); }
    }, 1000);
    ch.onmessage = (ev) => {
      const m = ev.data;
      setTimeout(() => {
        if (closed) return;
        if (m.kind === 'bye') { if (others.delete(m.peer)) notify(); return; }
        if (m.kind === 'emit') { (topicL.get(m.topic) || []).forEach((fn) => fn({ topic: m.topic, data: m.data, peer: m.peer, by: null, isMe: false, sameTab: false, kind: 'viewer', guest: false })); return; }
        if (m.kind === 'p' && Math.random() < 0.05) return;
        const pres = Object.freeze(JSON.parse(JSON.stringify(m.presence)));
        const o = others.get(m.peer);
        if (!o) { others.set(m.peer, { presence: pres, updatedAt: Date.now(), lastSeen: Date.now() }); notify(); send('p'); }
        else { o.lastSeen = Date.now(); if (JSON.stringify(o.presence) !== JSON.stringify(pres)) { o.presence = pres; o.updatedAt = Date.now(); notify(); } }
      }, LAT());
    };
    window.addEventListener('beforeunload', () => send('bye'));
    const api = {
      name,
      presence(patch) {
        for (const k in patch) { if (patch[k] === null) delete mine[k]; else mine[k] = patch[k]; }
        const s = JSON.stringify(mine);
        if (new TextEncoder().encode(s).length > 4096) { console.error('presence too big ' + s.length); return Promise.reject({ code: 'invalid_argument', message: 'presence over 4 KiB: ' + s.length }); }
        dirty = true; notify(); return Promise.resolve();
      },
      peers() { return snapshot; },
      onPeers(fn) { peerL.add(fn); setTimeout(() => { build(); fn({ peers: snapshot, joined: snapshot, left: [], updated: [] }); }, 0); return () => peerL.delete(fn); },
      connected() { return true; },
      onConnection(fn) { setTimeout(() => fn(true), 0); return () => {}; },
      emit(topic, data) { ch.postMessage({ kind: 'emit', topic, data, peer: PEER }); return Promise.resolve(); },
      on(topic, fn) { if (!topicL.has(topic)) topicL.set(topic, []); topicL.get(topic).push(fn); return () => {}; },
      leave() { send('bye'); closed = true; clearInterval(t1); clearInterval(t2); ch.close(); peerL.clear(); delete rooms[name]; return Promise.resolve(); },
      join(n) { return Promise.resolve(makeRoom(n)); },
    };
    rooms[name] = api; build(); send('p');
    return api;
  }
  const lobby = makeRoom('lobby');
  window.claude = { use: (n) => new Promise((res) => setTimeout(() => res(n === 'room' ? lobby : null), 200)) };
  window.__mockPeer = PEER;
})();
