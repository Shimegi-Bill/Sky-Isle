/*
 * 星翼浮島 SKY ISLE — 單指彈力操控動作 RPG（單一 React Component）
 * React 18+ / Tailwind CSS / HTML5 Canvas / Web Audio API
 * 角色、美術、名稱全部原創。
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/* ============================================================
 * 0. 小工具
 * ============================================================ */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeIn = (t) => Math.pow(clamp(t, 0, 1), 3);
const easeInOut = (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const fmt = (n) => Math.floor(n).toLocaleString('en-US');
const fmtShort = (n) => (n < 100000 ? fmt(n) : n < 1e8 ? `${(n / 1e4).toFixed(n < 1e6 ? 1 : 0)}萬` : `${(n / 1e8).toFixed(1)}億`);
const FONT_UI = '"Huninn","Chiron Hei HK","PingFang HK","PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif';
const FONT_NUM = '"Lilita One","Arial Black","Huninn",sans-serif';

/* ============================================================
 * 1. Web Audio 合成音效（無外部音檔）
 * ============================================================ */
const SFX = (() => {
  let ctx = null, master = null, noiseBuf = null, muted = false;
  const last = {};
  function ensure() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -14; comp.ratio.value = 6;
        master = ctx.createGain(); master.gain.value = muted ? 0 : 0.55;
        master.connect(comp); comp.connect(ctx.destination);
        const len = ctx.sampleRate * 1.5;
        noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { return null; }
    return ctx;
  }
  function gate(name, ms) {
    const now = performance.now();
    if (last[name] && now - last[name] < ms) return false;
    last[name] = now; return true;
  }
  function tone({ f = 440, f2 = null, type = 'sine', dur = 0.15, vol = 0.25, at = 0, attack = 0.005 }) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime + at;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise({ dur = 0.2, vol = 0.25, ftype = 'bandpass', f = 1200, f2 = null, q = 1, at = 0, attack = 0.005 }) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime + at;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const fl = ctx.createBiquadFilter(); fl.type = ftype; fl.Q.value = q;
    fl.frequency.setValueAtTime(f, t0);
    if (f2) fl.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(fl); fl.connect(g); g.connect(master);
    s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.05);
  }
  const api = {
    unlock: ensure,
    setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.55; },
    isMuted: () => muted,
    click() { if (!ensure()) return; tone({ f: 880, f2: 1320, type: 'triangle', dur: 0.07, vol: 0.12 }); },
    error() { if (!ensure()) return; tone({ f: 180, type: 'square', dur: 0.12, vol: 0.08 }); tone({ f: 140, type: 'square', dur: 0.14, vol: 0.08, at: 0.1 }); },
    slash() { if (!ensure() || !gate('slash', 40)) return; noise({ dur: 0.12, vol: 0.22, ftype: 'highpass', f: 2500, f2: 6000 }); },
    hit(heavy) {
      if (!ensure() || !gate('hit', 35)) return;
      noise({ dur: heavy ? 0.18 : 0.09, vol: heavy ? 0.42 : 0.3, ftype: 'bandpass', f: heavy ? 900 : 1800, q: 0.8 });
      tone({ f: heavy ? 120 : 190, f2: 50, type: 'sine', dur: heavy ? 0.2 : 0.1, vol: heavy ? 0.5 : 0.32 });
    },
    punch() { if (!ensure() || !gate('punch', 35)) return; tone({ f: 160, f2: 60, type: 'sine', dur: 0.09, vol: 0.4 }); noise({ dur: 0.05, vol: 0.2, f: 800 }); },
    stab() { if (!ensure() || !gate('stab', 40)) return; noise({ dur: 0.1, vol: 0.2, ftype: 'bandpass', f: 3200, f2: 1200, q: 2 }); },
    magic() { if (!ensure() || !gate('magic', 50)) return; tone({ f: 660, f2: 1320, type: 'triangle', dur: 0.16, vol: 0.13 }); tone({ f: 990, f2: 1980, type: 'sine', dur: 0.12, vol: 0.08, at: 0.03 }); },
    whoosh() { if (!ensure()) return; noise({ dur: 0.28, vol: 0.3, ftype: 'bandpass', f: 400, f2: 2600, q: 1.2, attack: 0.04 }); },
    teleport() { if (!ensure()) return; tone({ f: 1400, f2: 300, type: 'sine', dur: 0.18, vol: 0.15 }); tone({ f: 300, f2: 1600, type: 'triangle', dur: 0.18, vol: 0.12, at: 0.08 }); },
    charge() { if (!ensure()) return; tone({ f: 220, f2: 660, type: 'sawtooth', dur: 0.35, vol: 0.07, attack: 0.05 }); tone({ f: 880, type: 'sine', dur: 0.2, vol: 0.1, at: 0.3 }); },
    spFull() { if (!ensure() || !gate('spfull', 300)) return; tone({ f: 988, type: 'triangle', dur: 0.12, vol: 0.15 }); tone({ f: 1319, type: 'triangle', dur: 0.2, vol: 0.15, at: 0.09 }); },
    cutin() { if (!ensure()) return; noise({ dur: 0.35, vol: 0.25, ftype: 'bandpass', f: 600, f2: 4000, attack: 0.02 }); tone({ f: 523, type: 'square', dur: 0.1, vol: 0.06 }); tone({ f: 784, type: 'square', dur: 0.1, vol: 0.06, at: 0.07 }); tone({ f: 1047, type: 'square', dur: 0.25, vol: 0.07, at: 0.14 }); },
    skill() { if (!ensure()) return; tone({ f: 110, f2: 55, type: 'sawtooth', dur: 0.5, vol: 0.18 }); noise({ dur: 0.45, vol: 0.35, ftype: 'lowpass', f: 3000, f2: 200 }); tone({ f: 1760, f2: 880, type: 'sine', dur: 0.3, vol: 0.06 }); },
    boom() { if (!ensure() || !gate('boom', 60)) return; noise({ dur: 0.5, vol: 0.45, ftype: 'lowpass', f: 1400, f2: 90 }); tone({ f: 90, f2: 35, type: 'sine', dur: 0.4, vol: 0.5 }); },
    heal() { if (!ensure()) return; [523, 659, 784, 1047].forEach((f, i) => tone({ f, type: 'sine', dur: 0.4, vol: 0.12, at: i * 0.07 })); },
    guard() { if (!ensure() || !gate('guard', 60)) return; tone({ f: 600, f2: 400, type: 'square', dur: 0.08, vol: 0.1 }); noise({ dur: 0.08, vol: 0.15, f: 2500 }); },
    justGuard() { if (!ensure()) return; tone({ f: 1568, type: 'triangle', dur: 0.35, vol: 0.2 }); tone({ f: 2093, type: 'sine', dur: 0.45, vol: 0.14, at: 0.05 }); noise({ dur: 0.1, vol: 0.2, f: 5000 }); },
    hurt() { if (!ensure() || !gate('hurt', 80)) return; tone({ f: 300, f2: 120, type: 'square', dur: 0.14, vol: 0.12 }); noise({ dur: 0.12, vol: 0.25, f: 700 }); },
    enemyDie() { if (!ensure() || !gate('edie', 40)) return; noise({ dur: 0.3, vol: 0.25, ftype: 'lowpass', f: 2000, f2: 200 }); tone({ f: 400, f2: 80, type: 'triangle', dur: 0.3, vol: 0.15 }); },
    arrow() { if (!ensure() || !gate('arrow', 60)) return; noise({ dur: 0.12, vol: 0.12, ftype: 'highpass', f: 3000, f2: 1500 }); },
    warn() { if (!ensure() || !gate('warn', 150)) return; tone({ f: 880, type: 'square', dur: 0.08, vol: 0.06 }); tone({ f: 880, type: 'square', dur: 0.08, vol: 0.06, at: 0.13 }); },
    roar() { if (!ensure()) return; noise({ dur: 0.9, vol: 0.4, ftype: 'bandpass', f: 300, f2: 120, q: 0.7, attack: 0.08 }); tone({ f: 80, f2: 50, type: 'sawtooth', dur: 0.9, vol: 0.2, attack: 0.08 }); },
    slam() { api.boom(); },
    swap() { if (!ensure()) return; tone({ f: 700, f2: 1400, type: 'triangle', dur: 0.12, vol: 0.12 }); },
    coin() { if (!ensure() || !gate('coin', 50)) return; tone({ f: 1318, type: 'square', dur: 0.06, vol: 0.06 }); tone({ f: 1760, type: 'square', dur: 0.12, vol: 0.06, at: 0.06 }); },
    levelUp() { if (!ensure()) return; [659, 784, 988, 1319].forEach((f, i) => tone({ f, type: 'triangle', dur: 0.18, vol: 0.12, at: i * 0.06 })); },
    stamp() { if (!ensure()) return; tone({ f: 140, f2: 60, type: 'sine', dur: 0.2, vol: 0.4 }); noise({ dur: 0.1, vol: 0.2, f: 900 }); },
    engine() { if (!ensure()) return; tone({ f: 70, f2: 85, type: 'sawtooth', dur: 1.8, vol: 0.05, attack: 0.4 }); },
    jump() { if (!ensure() || !gate('jump', 60)) return; noise({ dur: 0.35, vol: 0.18, ftype: 'bandpass', f: 1800, f2: 400, attack: 0.02 }); },
    chute() { if (!ensure() || !gate('chute', 60)) return; noise({ dur: 0.12, vol: 0.18, ftype: 'lowpass', f: 900, f2: 300 }); tone({ f: 220, f2: 330, type: 'triangle', dur: 0.1, vol: 0.08 }); },
    land(r) {
      if (!ensure()) return;
      tone({ f: 160, f2: 70, type: 'sine', dur: 0.2, vol: 0.3 });
      const notes = r >= 4 ? [784, 988, 1175, 1568] : r === 3 ? [659, 880] : [523];
      notes.forEach((f, i) => tone({ f, type: 'triangle', dur: 0.25, vol: 0.1, at: 0.05 + i * 0.07 }));
    },
    thunder() {
      if (!ensure()) return;
      noise({ dur: 0.08, vol: 0.6, ftype: 'highpass', f: 2000 });
      noise({ dur: 1.4, vol: 0.55, ftype: 'lowpass', f: 1800, f2: 60, at: 0.04 });
      tone({ f: 60, f2: 30, type: 'sawtooth', dur: 1.0, vol: 0.25, at: 0.04 });
    },
    fanfare() {
      if (!ensure()) return;
      const seq = [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.32], [988, 0.5], [1047, 0.62], [1319, 0.75]];
      seq.forEach(([f, at]) => { tone({ f, type: 'square', dur: 0.22, vol: 0.07, at }); tone({ f: f / 2, type: 'triangle', dur: 0.25, vol: 0.08, at }); });
      tone({ f: 1568, type: 'triangle', dur: 0.8, vol: 0.1, at: 0.95 });
    },
    victory() {
      if (!ensure()) return;
      [[784, 0], [784, 0.12], [784, 0.24], [1047, 0.4]].forEach(([f, at]) => tone({ f, type: 'square', dur: 0.18, vol: 0.08, at }));
      tone({ f: 1319, type: 'triangle', dur: 0.6, vol: 0.12, at: 0.58 });
    },
    defeat() { if (!ensure()) return; [392, 349, 311, 262].forEach((f, i) => tone({ f, type: 'triangle', dur: 0.4, vol: 0.1, at: i * 0.22 })); },
    tick() { if (!ensure() || !gate('tick', 40)) return; tone({ f: 1760, type: 'square', dur: 0.03, vol: 0.05 }); },
    ready() { if (!ensure()) return; tone({ f: 660, f2: 1320, type: 'triangle', dur: 0.14, vol: 0.12 }); noise({ dur: 0.12, vol: 0.12, ftype: 'highpass', f: 4000 }); },
    danger() { if (!ensure() || !gate('danger', 220)) return; tone({ f: 70, f2: 50, type: 'sine', dur: 0.16, vol: 0.45 }); tone({ f: 70, f2: 50, type: 'sine', dur: 0.14, vol: 0.35, at: 0.17 }); },
    save() { if (!ensure()) return; [784, 1047, 1319, 1568, 2093].forEach((f, i) => tone({ f, type: 'triangle', dur: 0.3, vol: 0.12, at: i * 0.05 })); noise({ dur: 0.3, vol: 0.2, ftype: 'highpass', f: 3000 }); },
    soul() { if (!ensure() || !gate('soul', 60)) return; tone({ f: 1200, f2: 2000, type: 'sine', dur: 0.08, vol: 0.06 }); },
    milestone() { if (!ensure()) return; [988, 1319, 1760].forEach((f, i) => tone({ f, type: 'square', dur: 0.12, vol: 0.06, at: i * 0.06 })); },
    join() { if (!ensure()) return; tone({ f: 880, type: 'triangle', dur: 0.1, vol: 0.1 }); tone({ f: 1175, type: 'triangle', dur: 0.16, vol: 0.1, at: 0.08 }); },
  };
  return api;
})();
const haptic = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* 不支援震動 */ } };

/* ============================================================
 * 2. 遊戲資料：職業、角色、技能、怪物、關卡、符文
 * ============================================================ */
const CLS = {
  sword: { name: '劍士', attr: '斬', color: '#ff8a5c', spr: 3 },
  fist: { name: '拳師', attr: '打', color: '#ffc04d', spr: 2 },
  lance: { name: '槍兵', attr: '突', color: '#5fd38d', spr: 3 },
  mage: { name: '魔導士', attr: '魔', color: '#9b8cff', spr: 4 },
  bow: { name: '射手', attr: '射', color: '#4fc8ff', spr: 3 },
};
const CLS_KEYS = ['sword', 'fist', 'lance', 'mage', 'bow'];
const CLASS_BASE = {
  sword: { hp: 820, sp: 110, atk: 128, def: 76, crit: 6 },
  fist: { hp: 780, sp: 100, atk: 116, def: 70, crit: 8 },
  lance: { hp: 940, sp: 110, atk: 120, def: 98, crit: 5 },
  mage: { hp: 700, sp: 135, atk: 122, def: 60, crit: 5 },
  bow: { hp: 730, sp: 115, atk: 120, def: 62, crit: 9 },
};
const RARITY_MUL = { 2: 0.74, 3: 0.87, 4: 1, 5: 1.2 };

// 技能種類（kind）：wave 劍氣波 / whirl 旋風 / nova 爆炸 / meteor 隕石 / beam 光束 / dash 突進
// quake 震地 / barrage 追蹤彈幕 / heal 治癒復活 / rain 槍雨 / flurry 連打
const CHARS = [
  { id: 'c01', name: '艾琳', title: '蒼穹的劍姬', r: 4, cls: 'sword', hairStyle: 'long', hair: '#e6eeff', eye: '#3b82f6', skin: '#ffe3cf', outfit: '#2c4fa3', cloak: '#f1f5ff', accent: '#ffd76a',
    s1: { name: '蒼天斬月', kind: 'wave', sp: 34, mult: 9.5, hits: 3, desc: '放出三道貫穿劍氣' },
    s2: { name: '流星劍舞', kind: 'whirl', sp: 48, mult: 13, hits: 8, desc: '高速迴旋斬擊周圍所有敵人' } },
  { id: 'c02', name: '卡伊', title: '黑焰魔劍士', r: 4, cls: 'sword', hairStyle: 'spiky', hair: '#2a2433', eye: '#ff4d3a', skin: '#f6d8c3', outfit: '#3a2140', cloak: '#1b1622', accent: '#ff5a2e',
    s1: { name: '黑焰波動', kind: 'beam', sp: 36, mult: 10.5, hits: 6, desc: '直線貫穿的黑炎光束' },
    s2: { name: '煉獄爆炎', kind: 'nova', sp: 52, mult: 14.5, hits: 5, desc: '在敵人位置引發大爆炸' } },
  { id: 'c03', name: '雷歐', title: '金獅拳王', r: 4, cls: 'fist', hairStyle: 'spiky', hair: '#ffb52e', eye: '#a35a00', skin: '#f0c9a4', outfit: '#b5361f', cloak: '#ffcf4d', accent: '#ffffff',
    s1: { name: '獅吼震天', kind: 'quake', sp: 30, mult: 9, hits: 3, desc: '三重衝擊波向四周擴散' },
    s2: { name: '百獸亂舞', kind: 'dash', sp: 45, mult: 13, hits: 6, desc: '連續突進毆打直線上的敵人' } },
  { id: 'c04', name: '薇拉', title: '翠風槍騎', r: 4, cls: 'lance', hairStyle: 'pony', hair: '#4fc98a', eye: '#1f8a5b', skin: '#ffe6d3', outfit: '#1e5e48', cloak: '#d9f7e6', accent: '#fff17a',
    s1: { name: '天槍・颶風', kind: 'rain', sp: 35, mult: 10, hits: 10, desc: '召喚槍雨轟擊周圍' },
    s2: { name: '疾風突破', kind: 'dash', sp: 46, mult: 13, hits: 5, desc: '化作疾風貫穿敵陣' } },
  { id: 'c05', name: '露娜', title: '星詠魔導師', r: 4, cls: 'mage', hairStyle: 'twin', hair: '#c9b8ff', eye: '#7a4dff', skin: '#fff0e6', outfit: '#3b2a7a', cloak: '#26215c', accent: '#ffe27a',
    s1: { name: '聖光治癒陣', kind: 'heal', sp: 42, mult: 0.22, hits: 1, desc: '全隊回復 22% HP，並復活倒下隊友' },
    s2: { name: '星辰隕落', kind: 'meteor', sp: 55, mult: 14.5, hits: 8, desc: '召喚隕石雨轟炸敵人' } },
  { id: 'c06', name: '米亞', title: '麵包坊的劍士', r: 3, cls: 'sword', hairStyle: 'bob', hair: '#c9773e', eye: '#7a3b12', skin: '#ffe2cc', outfit: '#d9884a', cloak: '#fff4e0', accent: '#ff6b6b',
    s1: { name: '烤焦一閃', kind: 'wave', sp: 30, mult: 7, hits: 2, desc: '兩道灼熱劍氣' },
    s2: { name: '法棍旋風', kind: 'whirl', sp: 42, mult: 9, hits: 6, desc: '迴旋攻擊周圍敵人' } },
  { id: 'c07', name: '鐵山', title: '山寺武僧', r: 3, cls: 'fist', hairStyle: 'shaved', hair: '#3b2f2a', eye: '#3b2f2a', skin: '#e2b48c', outfit: '#d98a1f', cloak: '#8f3f1a', accent: '#ffe08a',
    s1: { name: '金剛掌', kind: 'nova', sp: 28, mult: 6.5, hits: 3, desc: '掌風在前方爆裂' },
    s2: { name: '崩山拳', kind: 'quake', sp: 40, mult: 9, hits: 3, desc: '捶地造成衝擊波' } },
  { id: 'c08', name: '蓮', title: '雪原槍兵', r: 3, cls: 'lance', hairStyle: 'short', hair: '#bfe6ff', eye: '#3a86c8', skin: '#fff1e8', outfit: '#3a6fa8', cloak: '#eaf6ff', accent: '#9fe3ff',
    s1: { name: '冰柱槍陣', kind: 'rain', sp: 30, mult: 7, hits: 7, desc: '冰槍從天而降' },
    s2: { name: '雪崩突刺', kind: 'beam', sp: 42, mult: 9, hits: 5, desc: '冰之直線貫穿' } },
  { id: 'c09', name: '茉莉', title: '花園魔女', r: 3, cls: 'mage', hairStyle: 'long', hair: '#ff9ec4', eye: '#c2306b', skin: '#fff0e6', outfit: '#4a8f4f', cloak: '#2f6b3a', accent: '#ffd1e3',
    s1: { name: '花語治癒', kind: 'heal', sp: 40, mult: 0.16, hits: 1, desc: '全隊回復 16% HP，並復活倒下隊友' },
    s2: { name: '薔薇荊棘', kind: 'nova', sp: 44, mult: 9, hits: 5, desc: '荊棘在敵人腳下爆發' } },
  { id: 'c10', name: '阿傑', title: '流浪劍客', r: 3, cls: 'sword', hairStyle: 'pony', hair: '#1d2433', eye: '#5a6b8c', skin: '#f3d2b8', outfit: '#4b5470', cloak: '#a33a3a', accent: '#e0e6f5',
    s1: { name: '燕返斬', kind: 'dash', sp: 30, mult: 7, hits: 3, desc: '一閃突進斬' },
    s2: { name: '風之刃', kind: 'wave', sp: 40, mult: 9, hits: 3, desc: '三道風刃' } },
  { id: 'c11', name: '小波', title: '新手劍士', r: 2, cls: 'sword', hairStyle: 'short', hair: '#7a5230', eye: '#4a3020', skin: '#ffe0c8', outfit: '#4f7cc4', cloak: '#c8d8f0', accent: '#ffe066',
    s1: { name: '迴旋斬', kind: 'whirl', sp: 26, mult: 5, hits: 4, desc: '轉一圈斬擊' },
    s2: { name: '全力一擊', kind: 'nova', sp: 36, mult: 6.5, hits: 2, desc: '用盡全力劈落' } },
  { id: 'c12', name: '阿福', title: '街頭拳手', r: 2, cls: 'fist', hairStyle: 'spiky', hair: '#2b2b2b', eye: '#2b2b2b', skin: '#f0c9a4', outfit: '#3f8f5a', cloak: '#f2f2f2', accent: '#ff4d4d',
    s1: { name: '連環踢', kind: 'dash', sp: 24, mult: 4.5, hits: 4, desc: '突進連環踢' },
    s2: { name: '爆裂拳', kind: 'nova', sp: 34, mult: 6, hits: 3, desc: '拳風爆炸' } },
  { id: 'c13', name: '葛蘭', title: '城門衛兵', r: 2, cls: 'lance', hairStyle: 'shaved', hair: '#8c6a4a', eye: '#4a3a2a', skin: '#efc9a8', outfit: '#7a7f8c', cloak: '#3d5a8c', accent: '#d0d4dc',
    s1: { name: '長槍橫掃', kind: 'whirl', sp: 25, mult: 5, hits: 3, desc: '長槍掃蕩周圍' },
    s2: { name: '衝鋒突刺', kind: 'dash', sp: 35, mult: 6.5, hits: 3, desc: '直線衝鋒' } },
  { id: 'c14', name: '皮皮', title: '見習魔法使', r: 2, cls: 'mage', hairStyle: 'bob', hair: '#ffcf5a', eye: '#3a7bd5', skin: '#ffeede', outfit: '#d9534f', cloak: '#5b3a8c', accent: '#ffe9a8',
    s1: { name: '小小治癒', kind: 'heal', sp: 36, mult: 0.1, hits: 1, desc: '全隊回復 10% HP，並復活倒下隊友' },
    s2: { name: '火球術', kind: 'barrage', sp: 36, mult: 6.5, hits: 5, desc: '連發追蹤火球' } },
  { id: 'c15', name: '希爾薇', title: '天穹的魔弓手', r: 4, cls: 'bow', hairStyle: 'pony', hair: '#f6e2a8', eye: '#22a874', skin: '#ffe6d6', outfit: '#2f6b5e', cloak: '#e8f6ee', accent: '#ffd76a',
    s1: { name: '破空狙擊', kind: 'snipe', sp: 38, mult: 12, hits: 1, desc: '瞄準後射出貫穿一直線的巨大光箭' },
    s2: { name: '天穹流星炮', kind: 'mapcannon', sp: 62, mult: 13, hits: 5, desc: '向天射出流星箭，光之箭雨轟炸全地圖所有敵人' } },
  { id: 'c16', name: '隼', title: '疾風獵人', r: 3, cls: 'bow', hairStyle: 'short', hair: '#5a3a22', eye: '#c27a2a', skin: '#f3d2b8', outfit: '#6b5a3a', cloak: '#3f5a3a', accent: '#e8c64a',
    s1: { name: '疾風五連箭', kind: 'volley', sp: 30, mult: 7.5, hits: 5, desc: '扇形射出五支貫穿箭' },
    s2: { name: '獵人箭雨', kind: 'rain', sp: 42, mult: 9, hits: 9, desc: '箭雨覆蓋周圍敵人' } },
  { id: 'c17', name: '小葵', title: '見習弓手', r: 2, cls: 'bow', hairStyle: 'bob', hair: '#ff9a5a', eye: '#7a3b12', skin: '#ffe2cc', outfit: '#e86a6a', cloak: '#fff4e0', accent: '#ffe066',
    s1: { name: '散射箭', kind: 'volley', sp: 24, mult: 4.5, hits: 3, desc: '扇形射出三支箭' },
    s2: { name: '全力一箭', kind: 'snipe', sp: 34, mult: 6.5, hits: 1, desc: '蓄力射出貫穿一直線的箭' } },
];
const CHAR_BY_ID = Object.fromEntries(CHARS.map((c) => [c.id, c]));

// 上滑：職業特殊動作 / 爆發技
const SPECIAL = {
  sword: { name: '閃光突進', kind: 'dash', sp: 18, mult: 3, hits: 3, desc: '高速突進斬' },
  fist: { name: '百裂拳', kind: 'flurry', sp: 18, mult: 3.5, hits: 12, desc: '前方超高速連打' },
  lance: { name: '螺旋衝鋒', kind: 'dash', sp: 18, mult: 3.5, hits: 4, desc: '旋轉長槍直線衝鋒' },
  mage: { name: '魔力暴走', kind: 'barrage', sp: 20, mult: 3.5, hits: 8, desc: '八發追蹤魔彈' },
  bow: { name: '後躍連射', kind: 'backshot', sp: 18, mult: 3.2, hits: 5, desc: '向後跳開，同時扇形連射' },
};

const ENEMY = {
  slime: { name: '史萊姆', hp: 860, atk: 112, def: 28, r: 16, spd: 72, res: { 魔: 1.5 }, gold: 120, souls: 80 },
  skel: { name: '骷髏弓手', hp: 1150, atk: 125, def: 38, r: 15, spd: 78, res: { 打: 1.5, 突: 0.5, 射: 0.7 }, gold: 180, souls: 120 },
  boss: { name: '牛頭人', hp: 9800, atk: 225, def: 64, r: 36, spd: 82, res: {}, gold: 2500, souls: 1800, boss: true },
  knight: { name: '骷髏劍士', hp: 1700, atk: 150, def: 60, r: 17, spd: 70, res: { 打: 1.5, 斬: 0.7, 射: 0.7 }, gold: 260, souls: 170 },
  wisp: { name: '幽靈術士', hp: 1250, atk: 140, def: 26, r: 15, spd: 64, res: { 突: 1.5, 魔: 0.5, 射: 1.3 }, gold: 240, souls: 160 },
  wolf: { name: '冰霜狼', hp: 1150, atk: 135, def: 34, r: 15, spd: 120, res: { 斬: 1.3, 射: 1.3, 魔: 0.7 }, gold: 260, souls: 170 },
  shroom: { name: '毒蘑菇怪', hp: 2100, atk: 128, def: 40, r: 18, spd: 40, res: { 斬: 1.5, 打: 0.7 }, gold: 280, souls: 190 },
  garg: { name: '石像鬼', hp: 1650, atk: 148, def: 72, r: 16, spd: 80, res: { 打: 1.5, 射: 1.4, 斬: 0.6 }, gold: 320, souls: 210 },
  imp: { name: '炸彈小鬼', hp: 950, atk: 158, def: 24, r: 13, spd: 110, res: { 魔: 1.4, 射: 1.3, 打: 0.8 }, gold: 260, souls: 180 },
  yeti: { name: '冰霜巨人', hp: 8000, atk: 230, def: 70, r: 34, spd: 80, res: { 魔: 1.3, 打: 0.8 }, gold: 4500, souls: 3200, boss: true },
  dragon: { name: '深淵魔龍', hp: 9500, atk: 240, def: 78, r: 40, spd: 85, res: { 射: 1.2, 斬: 0.85 }, gold: 9000, souls: 7000, boss: true },
};

const STAGES = [
  { id: 'st1', name: '風車草原', diff: '初級', lv: 1, theme: 'grass',
    waves: [['slime', 'slime', 'slime'], ['slime', 'slime', 'slime', 'slime', 'slime'], ['slime', 'slime', 'slime', 'slime', 'slime!']],
    reward: { gold: 3000, souls: 2000, runes: 3, gems: 25 } },
  { id: 'st2', name: '骸骨峽谷', diff: '中級', lv: 2, theme: 'canyon',
    waves: [['slime', 'slime', 'skel', 'skel'], ['knight', 'skel', 'skel', 'slime', 'slime'], ['knight', 'knight', 'skel', 'skel', 'skel'], ['knight!', 'skel', 'skel', 'slime!']],
    reward: { gold: 5000, souls: 3500, runes: 5, gems: 25 } },
  { id: 'st3', name: '牛角神殿', diff: '上級', lv: 3, theme: 'temple',
    waves: [['wisp', 'skel', 'skel', 'slime', 'slime'], ['knight', 'knight', 'wisp', 'skel', 'skel'], ['wisp!', 'knight!', 'skel', 'wisp'], ['boss']],
    reward: { gold: 9000, souls: 6000, runes: 8, gems: 50 } },
  { id: 'st4', name: '狂暴牛魔王', diff: '高難度', lv: 5, theme: 'lava',
    waves: [['knight', 'knight', 'skel', 'skel', 'wisp'], ['wisp!', 'knight!', 'skel!', 'skel', 'slime!'], ['boss', 'wisp', 'skel']],
    reward: { gold: 20000, souls: 15000, runes: 15, gems: 100 } },
  { id: 'st5', name: '冰封雪原', diff: '極難', lv: 6, theme: 'snow',
    waves: [['wolf', 'wolf', 'wolf', 'skel'], ['wolf!', 'knight', 'knight', 'wisp', 'wolf'], ['wolf', 'wolf', 'skel!', 'knight!', 'wisp'], ['yeti', 'wolf', 'wolf']],
    reward: { gold: 30000, souls: 22000, runes: 18, gems: 120 } },
  { id: 'st6', name: '毒霧森林', diff: '極難', lv: 7, theme: 'swamp',
    waves: [['shroom', 'shroom', 'wolf', 'slime!'], ['shroom!', 'wisp', 'wisp', 'wolf', 'wolf'], ['imp', 'imp', 'shroom', 'knight!', 'skel'], ['shroom!', 'shroom!', 'wisp!', 'wolf!', 'imp']],
    reward: { gold: 38000, souls: 28000, runes: 20, gems: 120 } },
  { id: 'st7', name: '天空遺跡', diff: '地獄', lv: 8, theme: 'sky',
    waves: [['garg', 'garg', 'imp', 'imp'], ['garg!', 'knight', 'knight!', 'imp', 'wisp'], ['imp!', 'imp!', 'garg', 'garg', 'wolf!'], ['boss', 'garg', 'imp']],
    reward: { gold: 50000, souls: 36000, runes: 24, gems: 150 } },
  { id: 'st8', name: '深淵魔城', diff: '終焉', lv: 9, theme: 'abyss',
    waves: [['imp', 'garg', 'knight!', 'wisp!', 'shroom'], ['wolf!', 'garg!', 'imp!', 'skel!', 'knight'], ['yeti', 'imp', 'garg'], ['dragon']],
    reward: { gold: 80000, souls: 60000, runes: 30, gems: 200 } },
];

const RUNES = [
  { k: 'red', name: '炎', color: '#ff5a4e' },
  { k: 'blue', name: '水', color: '#4ea8ff' },
  { k: 'yellow', name: '雷', color: '#ffd23f' },
  { k: 'green', name: '樹', color: '#57d17a' },
  { k: 'white', name: '光', color: '#f2f2ff' },
  { k: 'purple', name: '闇', color: '#b066ff' },
];
const RUNE_BY_K = Object.fromEntries(RUNES.map((r) => [r.k, r]));
const RAINBOW = [
  { k: 'shard', name: '虹之碎片', r: 2, color: '#ffb3d9' },
  { k: 'crystal', name: '虹之結晶', r: 3, color: '#9fe6ff' },
  { k: 'star', name: '虹之星', r: 4, color: '#ffe066' },
];
const RAINBOW_FOR_RARITY = (r) => (r <= 2 ? 'shard' : r === 3 ? 'crystal' : 'star');

/* ============================================================
 * 3. 星盤（Soul Board）：36 格放射狀節點，點滿 Lv.100
 * ============================================================ */
const NODE_TYPES = {
  atk: { name: '攻擊', rune: 'red', vals: [7, 10, 13], unit: '' },
  def: { name: '防禦', rune: 'blue', vals: [6, 9, 12], unit: '' },
  sp: { name: 'SP', rune: 'yellow', vals: [3, 4, 6], unit: '' },
  hp: { name: 'HP', rune: 'green', vals: [45, 65, 90], unit: '' },
  skill: { name: '技能強化', rune: 'white', vals: [4, 5, 7], unit: '%' },
  crit: { name: '會心', rune: 'purple', vals: [0.8, 1.2, 1.5], unit: '%' },
};
const SOUL_BOARD = (() => {
  const nodes = [];
  const r1 = ['atk', 'hp', 'sp', 'def', 'crit', 'skill'];
  const r2 = ['atk', 'hp', 'def', 'sp', 'atk', 'crit', 'hp', 'skill', 'atk', 'def', 'sp', 'hp'];
  const r3 = ['hp', 'atk', 'def', 'atk', 'sp', 'crit', 'hp', 'skill', 'atk', 'def', 'hp', 'atk', 'crit', 'sp', 'skill', 'hp', 'atk', 'def'];
  r1.forEach((t, i) => nodes.push({ id: `a${i}`, ring: 0, ang: (i * 60 - 90) * Math.PI / 180, type: t, req: null }));
  r2.forEach((t, j) => nodes.push({ id: `b${j}`, ring: 1, ang: (j * 30 - 90) * Math.PI / 180, type: t, req: `a${Math.floor(j / 2)}` }));
  r3.forEach((t, m) => nodes.push({ id: `c${m}`, ring: 2, ang: (m * 20 - 90) * Math.PI / 180, type: t, req: `b${Math.round((m * 20) / 30) % 12}` }));
  return nodes;
})();
const SOUL_NODE = Object.fromEntries(SOUL_BOARD.map((n) => [n.id, n]));
const NODE_COST = { gold: [400, 1200, 3000], souls: [250, 800, 2000], rune: [1, 2, 3] };
const RARITY_COST_MUL = { 2: 0.5, 3: 0.75, 4: 1, 5: 1 };
function nodeCost(node, rarity) {
  const m = RARITY_COST_MUL[rarity] || 1;
  return { gold: Math.round(NODE_COST.gold[node.ring] * m), souls: Math.round(NODE_COST.souls[node.ring] * m), rune: NODE_TYPES[node.type].rune, runes: NODE_COST.rune[node.ring] };
}
const charLevel = (prog) => 1 + Math.round((99 * (prog?.nodes?.length || 0)) / SOUL_BOARD.length);
const LB_MAX = 4;
const LB_PCT = 5;      // 每次限界突破全能力 +5%
const TRAIN_PCT = 2;   // 訓練所每級攻擊 +2%
const AWAKEN_COST = { gold: 30000, souls: 20000, runesEach: 5 };

/* ============================================================
 * 4. 能力值計算（星盤 + 限界突破 + 友情覺醒 + 訓練所）
 * ============================================================ */
function computeStats(char, prog, town) {
  const b = CLASS_BASE[char.cls];
  const rar = prog?.awakened ? 5 : char.r;
  const rm = RARITY_MUL[rar];
  let hp = b.hp * rm, sp = b.sp * (0.9 + rm * 0.1), atk = b.atk * rm, def = b.def * rm, crit = b.crit, skill = 0;
  (prog?.nodes || []).forEach((id) => {
    const n = SOUL_NODE[id]; if (!n) return;
    const v = NODE_TYPES[n.type].vals[n.ring];
    if (n.type === 'hp') hp += v; else if (n.type === 'atk') atk += v; else if (n.type === 'def') def += v;
    else if (n.type === 'sp') sp += v; else if (n.type === 'crit') crit += v; else if (n.type === 'skill') skill += v;
  });
  const lb = prog?.lb || 0;
  const lbMul = 1 + lb * (LB_PCT / 100);
  hp *= lbMul; atk *= lbMul; def *= lbMul; sp += lb * 4;
  const trainLv = town?.training?.[char.cls] || 0;
  const trainBonus = trainLv * TRAIN_PCT;
  atk *= 1 + trainBonus / 100;
  return {
    hp: Math.round(hp), sp: Math.round(sp), atk: Math.round(atk), def: Math.round(def),
    crit: Math.round(crit * 10) / 10, skill, spr: CLS[char.cls].spr + lb, lv: charLevel(prog), rarity: rar, lb, trainBonus,
  };
}

/* ============================================================
 * 5. 原創角色立繪（程式生成 SVG）
 * ============================================================ */
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt >= 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  else { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}
const RARITY_BG = {
  2: ['#5a3d2b', '#a8714a'], 3: ['#3a4a66', '#a9bdd9'], 4: ['#6b4a12', '#ffd76a'], 5: ['#4a2a7a', '#ff9ef0'],
};
const _portraitCache = {};
function portraitURL(c, awakened = false, noBg = false) {
  const k = c.id + (awakened ? 'A' : '') + (noBg ? 'n' : '');
  if (!_portraitCache[k]) _portraitCache[k] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(portraitSVG(c, { awakened, noBg }));
  return _portraitCache[k];
}
const _imgCache = {};
function portraitImage(c, awakened = false) {
  const k = c.id + (awakened ? 'A' : '');
  if (!_imgCache[k]) { const im = new Image(); im.src = portraitURL(c, awakened, true); _imgCache[k] = im; }
  return _imgCache[k];
}
