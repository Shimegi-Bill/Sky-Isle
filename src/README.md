# 星翼浮島 原始碼

呢個資料夾係星翼浮島嘅**原始 React／JSX 源碼**。repo 根目錄嘅 `index.html` 係由呢啲源碼打包出嚟嘅成品（GitHub Pages 用嗰個）。

- 對應版本：`20261017-2238`（同根目錄 `index.html` 一樣）
- 遊戲本身唔需要呢個資料夾都行到；呢度係俾以後改遊戲用

## 資料夾
| 位置 | 內容 |
|---|---|
| `parts/` | 17 個 JSX 檔，按檔名次序合併成一個 `SkyIsle.jsx` |
| `build/build.mjs` | 打包腳本：合併 parts → 編譯 Tailwind CSS → esbuild 打包 → 輸出 HTML |
| `build/main.jsx` | 入口：`createRoot(...).render(<SkyIsle />)` |
| `build/react-shim.js`、`build/react-dom-shim.js` | 打包時將 `react` 指去 CDN 載入嘅 `window.React`／`window.ReactDOM` |
| `build/icon.svg` | 主畫面圖示原圖 |
| `build/mock-room.js` | 本機測試用：模擬協力房間（打包 `build/test.html` 時用） |

## parts 每個檔做咩
| 檔案 | 內容 |
|---|---|
| `01-core.jsx` | 職業（CLS）、角色（CHARS）、敵人（ENEMY）、關卡（STAGES）、數值 |
| `01b-portrait.jsx` | 角色立繪（SVG） |
| `02-draw.jsx` | 關卡主題、地面、裝飾物 |
| `02a-chibi.jsx` | 戰鬥 Q 版角色、武器、配件 |
| `02b-monsters.jsx`、`02c-monsters2.jsx` | 怪物造型（舊 6 種、新 6 種） |
| `03-battle.jsx` | `Battle` 類別：常數、技能範圍（SKILL_RANGE）、普攻（ATK_DEF）、傷害 |
| `03b-battle-world.jsx` | 投射物、敵人更新、協力救援圈（updateRevive） |
| `03c-battle-net.jsx` | 協力同步（房主管敵人） |
| `03d-battle-render.jsx` | 畫面繪製、頭頂 HP/SP、畫面外隊友箭嘴 |
| `03e-skillfx.jsx` | 技能特效、`runSkill` |
| `03f-monsters2.jsx` | 新怪物 AI、雪怪同魔龍頭目招式 |
| `04-gacha.jsx` | 抽蛋 |
| `05-ui-a.jsx` | 戰鬥畫面、左邊三粒技能掣、世界地圖、關卡資訊 |
| `06-ui-b.jsx` | 主畫面 App、分頁、設定（版本號、檢查更新） |
| `07-coop.jsx` | 協力房間介面 |
| `08-mqtt.jsx` | 協力用嘅公共 MQTT 伺服器連線 |

## 點樣打包（俾 AI／開發者）
1. 準備資料夾結構（`build.mjs` 預設咗呢個結構）：
   - `<項目>/src/parts/` ← 呢度嘅 `parts/`
   - `<項目>/build/` ← 呢度嘅 `build/`
   - `<項目>/dist/web/` ← repo 根目錄嘅 `icon-64.png`、`icon-180.png`、`icon-192.png`、`icon-512.png`（打包時會讀）
2. 改 `build.mjs` 頂部：
   - `ROOT` 改做 `<項目>` 嘅路徑
   - `/opt/npm-tools/node_modules/` 改做裝咗 `esbuild` 同 `tailwindcss`（v4）嘅 `node_modules` 位置
3. 行 `node build/build.mjs`
4. 輸出：
   - `dist/web/index.html` ← 上載去 GitHub 根目錄嘅就係呢個（同 icon、manifest 放同一層）
   - `dist/skyisle.html` ← Claude artifact 版本
   - `build/test.html`、`build/test-mqtt.html` ← 本機測試用
- 每次打包會自動用香港時間做新版本號（`window.__SKY_VER`）。主畫面 App 會比對版本號自動更新，所以**一定要用新打包嘅 index.html**，唔好人手改舊檔。
