// 打包：合併 parts → SkyIsle.jsx，編譯 Tailwind，esbuild 打包，輸出三個 HTML
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire('/opt/npm-tools/node_modules/');
const esbuild = require('esbuild');
const { compile } = await import('/opt/npm-tools/node_modules/tailwindcss/dist/lib.mjs');

const ROOT = '/home/claude/skyisle';
const partsDir = path.join(ROOT, 'src/parts');
const parts = fs.readdirSync(partsDir).filter((f) => f.endsWith('.jsx')).sort();
const src = parts.map((f) => fs.readFileSync(path.join(partsDir, f), 'utf8')).join('\n');
fs.writeFileSync(path.join(ROOT, 'src/SkyIsle.jsx'), src);

// Tailwind（v4 核心，掃描字串候選）
const twBase = '/opt/npm-tools/node_modules/tailwindcss/';
const tw = await compile('@import "tailwindcss";', {
  base: twBase,
  loadStylesheet: async (id) => {
    const p = id === 'tailwindcss' ? twBase + 'index.css' : twBase + id.replace(/^\.\//, '').replace(/^tailwindcss\//, '');
    return { content: fs.readFileSync(p, 'utf8'), base: twBase, path: p };
  },
});
const candidates = new Set(src.match(/[^\s"'`{}()<>,;]+(?:\([^\s"'`]*\))?[^\s"'`{}<>,;]*/g) || []);
// 補上含括號 / 逗號的任意值 class
for (const m of src.matchAll(/[\w:-]+-\[[^\]\s"'`]+\]/g)) candidates.add(m[0]);
let css = tw.build([...candidates]);
const cssMin = (await esbuild.transform(css, { loader: 'css', minify: true, target: ['chrome100', 'safari15', 'firefox100'] })).code;

async function bundle(external) {
  const r = await esbuild.build({
    entryPoints: [path.join(ROOT, 'build/main.jsx')], bundle: true, write: false, minify: true, format: 'iife',
    target: ['chrome100', 'safari15', 'firefox100'], jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment',
    define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'none',
    alias: external ? { react: path.join(ROOT, 'build/react-shim.js'), 'react-dom/client': path.join(ROOT, 'build/react-dom-shim.js') } : {},
    nodePaths: ['/opt/npm-tools/node_modules'],
  });
  return r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
}
const jsExt = await bundle(true);
const jsLocal = await bundle(false);

// 版本號（香港時間），用嚟顯示同自動檢查更新
const VER = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
const head = `<title>星翼浮島</title>
<script>window.__SKY_VER='${VER}';</script>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="單指彈力操控動作 RPG：四職業、跳傘召喚、星盤養成與飛行島。">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Huninn&family=Lilita+One&display=swap">
<style>
:root{color-scheme:dark;--page:#070a18;--ink:#f4efe2}
html{height:100%;box-sizing:border-box;background:var(--page);touch-action:pan-x pan-y;-webkit-text-size-adjust:100%}
*{-webkit-tap-highlight-color:transparent}
body{height:100%;margin:0;box-sizing:border-box;background:var(--page);color:var(--ink);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:0;overscroll-behavior:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
#root{height:100%}
::selection{background:transparent}
${cssMin}
</style>`;
const cdn = `<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>`;
const body = (js, withCdn) => `<div id="root"></div>\n${withCdn ? cdn + '\n' : ''}<script>${js}</script>`;

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
// 1) Artifact 版本（由平台包上 doctype / head）
fs.writeFileSync(path.join(ROOT, 'dist/skyisle.html'), `${head}\n${body(jsExt, true)}\n`);
// 2) 獨立版本（可放 GitHub Pages）
const b64 = (f) => fs.readFileSync(path.join(ROOT, 'dist/web', f)).toString('base64');
const pwa = `<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="星翼浮島">
<meta name="application-name" content="星翼浮島">
<meta name="theme-color" content="#070a18">
<link rel="apple-touch-icon" href="data:image/png;base64,${b64('icon-180.png')}">
<link rel="icon" type="image/png" href="data:image/png;base64,${b64('icon-64.png')}">
<link rel="manifest" href="manifest.webmanifest">
<style>
/* 獨立網頁：真正滿版。背景延伸到瀏海同底部橫條，按鈕由介面自己避開（--sat / --sab） */
:root{--sat:env(safe-area-inset-top,0px);--sab:env(safe-area-inset-bottom,0px)}
html,body{margin:0;height:100%;overflow:hidden;background:#0b1026;overscroll-behavior:none}
body{padding:0!important}
#root{position:absolute;top:0;left:0;width:100%;height:var(--app-h,100%)}
</style>
<script>
/* iPhone 主畫面 App：每次開啟、返回前景、轉向後，重新對齊畫面高度同觸控位置 */
(function () {
  var fix = function () {
    try {
      document.documentElement.style.setProperty('--app-h', window.innerHeight + 'px');
      if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
    } catch (e) { /* 略過 */ }
  };
  var burst = function () { fix(); [60, 250, 600, 1200].forEach(function (t) { setTimeout(fix, t); }); };
  burst();
  window.addEventListener('resize', fix);
  window.addEventListener('orientationchange', burst);
  window.addEventListener('pageshow', burst);
  window.addEventListener('load', burst);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) burst(); });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fix);
})();
/* 自動更新：開 App、返回前景、每 5 分鐘，用唔經快取嘅方式檢查 GitHub 上面有冇新版本；
   有就換去帶版本號嘅網址重新載入（避開 iPhone 主畫面 App 嘅舊快取）。戰鬥同協力房間入面唔會打斷。 */
(function () {
  var CUR = window.__SKY_VER;
  if (!CUR || location.protocol.indexOf('http') !== 0) return;
  var base = location.href.split('#')[0].split('?')[0], busy = false;
  var check = function (manual, cb) {
    if (busy || (document.hidden && !manual)) { if (cb) cb('busy'); return; }
    busy = true;
    fetch(base + '?vcheck=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (txt) {
      busy = false;
      var m = txt && txt.match(/__SKY_VER='([^']+)'/);
      if (!m || m[1] === CUR) { if (cb) cb('latest'); return; }
      var go = function () {
        try { var key = 'skyisle-upd-' + m[1], t = +sessionStorage.getItem(key) || 0; if (!manual && Date.now() - t < 120000) return; sessionStorage.setItem(key, String(Date.now())); } catch (e) { /* 略過 */ }
        location.replace(base + '?v=' + encodeURIComponent(m[1]));
      };
      if (cb) cb('update', m[1]);
      if (window.__skyBattle || window.__skyBusy) { window.__skyUpdatePending = go; return; }
      setTimeout(go, manual ? 300 : 900);
    }).catch(function () { busy = false; if (cb) cb('error'); });
  };
  window.__skyCheckUpdate = function (cb) { check(true, cb); };
  window.addEventListener('load', function () { setTimeout(function () { check(false); }, 1500); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(function () { check(false); }, 800); });
  setInterval(function () { check(false); }, 5 * 60 * 1000);
})();
</script>`;
const standaloneHead = head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '') + '\n' + pwa;
fs.writeFileSync(path.join(ROOT, 'dist/index.html'), `<!doctype html>\n<html lang="zh-Hant-HK">\n<head>\n<meta charset="utf-8">\n${standaloneHead}\n</head>\n<body>\n${body(jsExt, true)}\n</body>\n</html>\n`);
fs.writeFileSync(path.join(ROOT, 'dist/web/index.html'), fs.readFileSync(path.join(ROOT, 'dist/index.html')));
fs.writeFileSync(path.join(ROOT, 'dist/web/manifest.webmanifest'), JSON.stringify({
  name: '星翼浮島', short_name: '星翼浮島', description: '單指彈力操控動作 RPG', lang: 'zh-Hant-HK',
  start_url: './', scope: './', display: 'fullscreen', display_override: ['fullscreen', 'standalone'], orientation: 'portrait',
  background_color: '#070a18', theme_color: '#070a18',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2));
// 3) 本機測試版本（React 打包在內，不靠 CDN）
const mock = fs.readFileSync(path.join(ROOT, 'build/mock-room.js'), 'utf8');
fs.writeFileSync(path.join(ROOT, 'build/test.html'), `<!doctype html>\n<html lang="zh-Hant-HK">\n<head>\n<meta charset="utf-8">\n${head.replace(/<link[^>]+>\n/g, '')}\n</head>\n<body>\n<script>${mock}</script>\n${body(jsLocal, false)}\n</body>\n</html>\n`);
fs.writeFileSync(path.join(ROOT, 'build/test-mqtt.html'), `<!doctype html>\n<html lang="zh-Hant-HK">\n<head>\n<meta charset="utf-8">\n${head.replace(/<link[^>]+>\n/g, '')}\n</head>\n<body>\n${body(jsLocal, false)}\n</body>\n</html>\n`);
console.log('parts:', parts.join(', '), '| version', VER);
console.log('jsx lines:', src.split('\n').length, '| css KB:', (cssMin.length / 1024).toFixed(1), '| js KB:', (jsExt.length / 1024).toFixed(1));
