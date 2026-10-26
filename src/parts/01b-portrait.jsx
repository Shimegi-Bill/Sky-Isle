
/* ============================================================
 * 5b. 原創角色立繪（精緻版 SVG）：漸層、動漫眼、髮絲、專屬配件同武器
 * ============================================================ */
function portraitSVG(c, opts = {}) {
  const L = (typeof LOOKS !== 'undefined' && LOOKS[c.id]) || {};
  const rar = opts.awakened ? 5 : c.r;
  const [bg1, bg2] = RARITY_BG[rar];
  const id = c.id + (opts.awakened ? 'a' : '') + (opts.noBg ? 'n' : '');
  const H = c.hair, Hd = shade(H, -0.3), Hdd = shade(H, -0.5), Hl = shade(H, 0.45);
  const sk = c.skin, OUT = c.outfit, CL = c.cloak, AC = c.accent;
  const O = '#2a1d38', ST = `stroke="${O}" stroke-width="2" stroke-linejoin="round"`, ST1 = `stroke="${O}" stroke-width="1.4" stroke-linejoin="round"`;
  const g = (n) => `url(#${n}${id})`;
  const defs = `<defs>
    <radialGradient id="bg${id}" cx="50%" cy="40%" r="72%"><stop offset="0" stop-color="${bg2}"/><stop offset="1" stop-color="${bg1}"/></radialGradient>
    <linearGradient id="hg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${Hl}"/><stop offset="0.4" stop-color="${H}"/><stop offset="1" stop-color="${Hd}"/></linearGradient>
    <linearGradient id="hb${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${Hd}"/><stop offset="1" stop-color="${Hdd}"/></linearGradient>
    <radialGradient id="sk${id}" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="${shade(sk, 0.3)}"/><stop offset="0.7" stop-color="${sk}"/><stop offset="1" stop-color="${shade(sk, -0.1)}"/></radialGradient>
    <linearGradient id="of${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(OUT, 0.22)}"/><stop offset="0.5" stop-color="${OUT}"/><stop offset="1" stop-color="${shade(OUT, -0.35)}"/></linearGradient>
    <linearGradient id="cl${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(CL, 0.18)}"/><stop offset="1" stop-color="${shade(CL, -0.3)}"/></linearGradient>
    <linearGradient id="ir${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c.eye, -0.55)}"/><stop offset="0.5" stop-color="${c.eye}"/><stop offset="1" stop-color="${shade(c.eye, 0.55)}"/></linearGradient>
    <linearGradient id="mt${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#c9d3e6"/><stop offset="1" stop-color="#7d8aa8"/></linearGradient>
    <linearGradient id="gd${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset="0.5" stop-color="#f2b632"/><stop offset="1" stop-color="#a8710c"/></linearGradient>
    <radialGradient id="gl${id}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="0.4" stop-color="${AC}" stop-opacity="0.6"/><stop offset="1" stop-color="${AC}" stop-opacity="0"/></radialGradient>
  </defs>`;
  const spark = (x, y, r, col = '#fff', op = 0.9) => `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${col}" opacity="${op}"/>`;
  // ---------- 背景 ----------
  let bg = '';
  if (!opts.noBg) {
    bg = `<rect width="200" height="200" fill="${g('bg')}"/>`;
    if (c.cls === 'mage') bg += `<g fill="none" stroke="#fff" opacity="0.28" stroke-width="1.6"><circle cx="100" cy="96" r="84"/><circle cx="100" cy="96" r="70"/>${[-Math.PI / 2, Math.PI / 2].map((a0) => `<path d="${[0, 1, 2].map((i) => { const a = a0 + (i * 2 * Math.PI) / 3; return `${i ? 'L' : 'M'}${(100 + Math.cos(a) * 70).toFixed(1)} ${(96 + Math.sin(a) * 70).toFixed(1)}`; }).join('')}Z"/>`).join('')}</g>`;
    else if (c.cls === 'fist') bg += `<g fill="#fff" opacity="0.2">${Array.from({ length: 16 }, (_, i) => { const a = i * 0.3927, a2 = a + 0.1; return `<path d="M100 96L${(100 + Math.cos(a) * 170).toFixed(1)} ${(96 + Math.sin(a) * 170).toFixed(1)}L${(100 + Math.cos(a2) * 170).toFixed(1)} ${(96 + Math.sin(a2) * 170).toFixed(1)}Z"/>`; }).join('')}</g><circle cx="100" cy="96" r="60" fill="none" stroke="#fff" stroke-width="10" opacity="0.12"/>`;
    else if (c.cls === 'lance') bg += `<g fill="none" stroke="#fff" stroke-linecap="round" opacity="0.3"><path d="M-10 150Q60 110 210 128" stroke-width="7"/><path d="M-10 60Q90 30 210 74" stroke-width="4"/><path d="M20 186Q110 160 210 172" stroke-width="3"/></g>`;
    else bg += `<g fill="#fff" opacity="0.22">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M100 92L${(100 + Math.cos(i * 0.785) * 170).toFixed(1)} ${(92 + Math.sin(i * 0.785) * 170).toFixed(1)}L${(100 + Math.cos(i * 0.785 + 0.22) * 170).toFixed(1)} ${(92 + Math.sin(i * 0.785 + 0.22) * 170).toFixed(1)}Z"/>`).join('')}</g>`;
    bg += [[22, 30, 5], [178, 44, 4], [168, 150, 5], [30, 140, 3.5], [150, 18, 3], [46, 70, 2.5]].map(([x, y, r]) => spark(x, y, r, '#fff', 0.75)).join('');
    bg += `<rect y="150" width="200" height="50" fill="#000" opacity="0.12"/>`;
  }
  const aw = opts.awakened ? `<ellipse cx="100" cy="40" rx="44" ry="10" fill="none" stroke="#fff3a8" stroke-width="4" opacity="0.85"/><ellipse cx="100" cy="40" rx="44" ry="10" fill="none" stroke="#ffd34d" stroke-width="1.5"/>${[[28, 46, 7], [172, 56, 6], [162, 164, 7], [34, 156, 6], [100, 14, 5]].map(([x, y, r]) => spark(x, y, r, '#fff6a8', 0.95)).join('')}` : '';
  // ---------- 武器（背後） ----------
  const wk = typeof weaponKind === 'function' ? weaponKind(c) : '';
  let weapon = '', fistsFront = '';
  switch (wk) {
    case 'sky': weapon = `<g transform="rotate(30 152 118)"><path d="M146 20L152 8L158 20L158 100L146 100Z" fill="${g('mt')}" ${ST}/><path d="M152 18L152 98" stroke="#4f7dd8" stroke-width="2.5"/><path d="M152 100Q140 96 128 106Q144 104 150 112Q160 104 176 106Q164 96 152 100Z" fill="${g('gd')}" ${ST1}/><circle cx="152" cy="104" r="4" fill="#3b82f6" ${ST1}/><rect x="148" y="108" width="8" height="26" rx="3" fill="#2b3f7a" ${ST1}/></g>`; break;
    case 'dark': weapon = `<g transform="rotate(30 152 118)"><path d="M146 22L152 6L159 22L156 40L160 58L155 78L159 100L145 100L148 78L144 58L148 40Z" fill="#2a1f33" ${ST}/><path d="M152 8L158 22L155 40L159 58L154 78L158 98" stroke="#ff4a2e" stroke-width="2.2" fill="none"/><path d="M152 100L136 92L144 106L152 112L160 106L168 92Z" fill="#7a1420" ${ST1}/><rect x="148" y="108" width="8" height="26" rx="3" fill="#1b1622" ${ST1}/></g>`; break;
    case 'baguette': weapon = `<g transform="rotate(32 152 118)"><rect x="142" y="18" width="20" height="96" rx="10" fill="#d98a3e" ${ST}/><rect x="146" y="22" width="6" height="86" rx="3" fill="#f5bf73" opacity="0.8"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M145 ${34 + i * 16}L159 ${44 + i * 16}" stroke="#ffe3ae" stroke-width="3" stroke-linecap="round"/>`).join('')}<rect x="144" y="112" width="16" height="22" rx="4" fill="#f4efe4" ${ST1}/></g>`; break;
    case 'katana': weapon = `<g transform="rotate(26 152 118)"><path d="M149 108Q146 60 156 6Q160 60 156 108Z" fill="${g('mt')}" ${ST}/><path d="M154 104Q152 60 157 14" stroke="#fff" stroke-width="1.2" fill="none"/><ellipse cx="152.5" cy="110" rx="11" ry="4" fill="#c9a14a" ${ST1}/><rect x="148.5" y="113" width="8" height="28" rx="2" fill="#2a2433" ${ST1}/><path d="M149 118L156 124M156 118L149 124M149 128L156 134M156 128L149 134" stroke="#d9c9a8" stroke-width="1.2"/></g>`; break;
    case 'rookie': weapon = `<g transform="rotate(28 150 120)"><path d="M145 44L150 34L155 44L155 102L145 102Z" fill="${g('mt')}" ${ST}/><rect x="134" y="100" width="32" height="8" rx="3" fill="#8a6a48" ${ST1}/><rect x="146" y="107" width="8" height="22" fill="#7a5230" ${ST1}/></g>`; break;
    case 'wind': weapon = `<g transform="rotate(-22 60 110)"><rect x="56" y="34" width="8" height="170" rx="4" fill="#cdeedd" ${ST}/><rect x="54" y="30" width="12" height="8" rx="2" fill="#fff17a" ${ST1}/><path d="M60 -4Q74 14 60 32Q46 14 60 -4Z" fill="#9ff0c4" ${ST}/><path d="M60 0L60 30M60 14L66 8M60 14L54 8" stroke="#1e5e48" stroke-width="1.2"/><path d="M64 38Q80 50 76 68M58 38Q46 54 52 72" stroke="#5fe0a0" stroke-width="3" fill="none" stroke-linecap="round"/></g>`; break;
    case 'ice': weapon = `<g transform="rotate(-22 60 110)"><rect x="56" y="36" width="8" height="170" rx="4" fill="#cfe6fb" ${ST}/><circle cx="60" cy="36" r="6" fill="#eaf6ff" ${ST1}/><path d="M60 -8L70 14L60 32L50 14Z" fill="#b9ecff" ${ST}/><path d="M60 -6L60 30M50 14L60 18L70 14" stroke="#fff" stroke-width="1.2" fill="none"/><path d="M52 22L42 8L50 24ZM68 22L78 8L70 24Z" fill="#d9f4ff" ${ST1}/></g>`; break;
    case 'halberd': weapon = `<g transform="rotate(-22 60 110)"><rect x="56" y="30" width="8" height="176" rx="3" fill="#8a6a48" ${ST}/><path d="M60 -6L66 30L54 30Z" fill="${g('mt')}" ${ST1}/><path d="M64 22Q92 18 94 46Q80 36 64 44Z" fill="${g('mt')}" ${ST}/><path d="M56 30L44 40L56 40Z" fill="#b8c0d0" ${ST1}/><rect x="54" y="60" width="12" height="5" fill="#d0d4dc"/></g>`; break;
    case 'star': weapon = `<g transform="rotate(-18 52 120)"><rect x="48" y="66" width="8" height="140" rx="4" fill="#5a3e30" ${ST}/><rect x="46" y="84" width="12" height="5" fill="#ffe27a"/><rect x="46" y="120" width="12" height="5" fill="#ffe27a"/><circle cx="52" cy="50" r="26" fill="${g('gl')}"/><path d="M40 30A20 20 0 1 0 70 64A16 16 0 1 1 40 30Z" fill="${g('gd')}" ${ST}/><path d="M52 40L55 48L63 48L57 53L59 61L52 56L45 61L47 53L41 48L49 48Z" fill="#fffbe0" ${ST1}/></g>`; break;
    case 'flower': weapon = `<g transform="rotate(-16 52 120)"><path d="M50 206Q44 140 54 70" stroke="${O}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M50 206Q44 140 54 70" stroke="#7a5530" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="40" cy="104" rx="12" ry="5" transform="rotate(30 40 104)" fill="#5fbf62" ${ST1}/><ellipse cx="64" cy="90" rx="12" ry="5" transform="rotate(-30 64 90)" fill="#5fbf62" ${ST1}/>${[0, 1, 2, 3, 4, 5].map((i) => { const a = i * 1.047; return `<ellipse cx="${(54 + Math.cos(a) * 11).toFixed(1)}" cy="${(56 + Math.sin(a) * 11).toFixed(1)}" rx="11" ry="7" transform="rotate(${(a * 57.3).toFixed(0)} ${(54 + Math.cos(a) * 11).toFixed(1)} ${(56 + Math.sin(a) * 11).toFixed(1)})" fill="${i % 2 ? '#ff7fb0' : '#ff9ec4'}" ${ST1}/>`; }).join('')}<circle cx="54" cy="56" r="9" fill="#ffd1e3" ${ST1}/><circle cx="54" cy="56" r="4" fill="#ffe066"/></g>`; break;
    case 'wand': weapon = `<g transform="rotate(-20 52 130)"><rect x="49" y="70" width="6" height="80" rx="3" fill="#fff" ${ST1}/>${[0, 1, 2, 3, 4].map((i) => `<rect x="49" y="${78 + i * 14}" width="6" height="5" fill="#e2453c"/>`).join('')}<path d="M52 36L58 52L75 52L61 62L66 78L52 68L38 78L43 62L29 52L46 52Z" fill="${g('gd')}" ${ST}/><circle cx="48" cy="52" r="3" fill="#fff"/><path d="M55 72Q72 84 66 100" stroke="#ff7fb0" stroke-width="3" fill="none" stroke-linecap="round"/></g>`; break;
    case 'skybow': case 'huntbow': case 'shortbow': {
      const big = wk === 'skybow', col = big ? '#fff3c4' : wk === 'huntbow' ? '#8a5a2b' : '#b07a48';
      weapon = `<g transform="rotate(-24 50 110)"><path d="M30 10Q80 60 46 110Q80 160 30 210" stroke="${O}" stroke-width="${big ? 11 : 9}" fill="none" stroke-linecap="round"/><path d="M30 10Q80 60 46 110Q80 160 30 210" stroke="${col}" stroke-width="${big ? 7 : 5.5}" fill="none" stroke-linecap="round"/><path d="M30 10L30 210" stroke="${big ? '#bff4ff' : '#fff'}" stroke-width="${big ? 2.4 : 1.6}" opacity="0.9"/>${big ? `<path d="M30 10Q10 0 4 14Q16 12 24 22ZM30 210Q10 220 4 206Q16 208 24 198Z" fill="#fff" ${ST1}/><circle cx="58" cy="110" r="6" fill="#22a874" ${ST1}/>` : ''}<rect x="44" y="100" width="12" height="20" rx="3" fill="#5a3a22" ${ST1}/></g>`;
      break;
    }
    case 'lion': fistsFront = `<g ${ST}><rect x="30" y="160" width="40" height="38" rx="14" fill="${g('gd')}"/><rect x="132" y="166" width="40" height="38" rx="14" fill="${g('gd')}"/></g><path d="M36 162L42 150L48 162M52 160L58 148L64 160M138 168L144 156L150 168M154 166L160 154L166 166" fill="#fff6c4" ${ST1}/><circle cx="50" cy="180" r="6" fill="#e33" ${ST1}/><circle cx="152" cy="186" r="6" fill="#e33" ${ST1}/>`; break;
    case 'wraps': fistsFront = `<g ${ST}><circle cx="48" cy="182" r="20" fill="${sk}"/><circle cx="154" cy="186" r="20" fill="${sk}"/></g><path d="M32 172L60 196M40 164L66 186M138 176L166 200M146 168L172 190" stroke="#f4efe4" stroke-width="5"/>`; break;
    case 'tape': fistsFront = `<g ${ST}><circle cx="48" cy="180" r="20" fill="#d6302a"/><circle cx="154" cy="184" r="20" fill="#d6302a"/><rect x="22" y="170" width="10" height="24" rx="3" fill="#fff"/><rect x="170" y="174" width="10" height="24" rx="3" fill="#fff"/></g><circle cx="54" cy="172" r="5" fill="#fff" opacity="0.5"/><circle cx="160" cy="176" r="5" fill="#fff" opacity="0.5"/>`; break;
    default: break;
  }
  // ---------- 背後頭髮／配件 ----------
  let back = '';
  if (L.back === 'kasa') back += `<ellipse cx="62" cy="150" rx="44" ry="36" fill="#d9b56a" ${ST}/><path d="M62 150L22 140M62 150L40 120M62 150L72 114M62 150L104 140M62 150L96 178M62 150L28 170" stroke="#9a7330" stroke-width="1.2" opacity="0.6"/>`;
  if (L.back === 'quiver') back += `<g transform="rotate(24 150 120)"><rect x="140" y="92" width="22" height="80" rx="8" fill="#7a4f2e" ${ST}/><rect x="140" y="104" width="22" height="6" fill="${AC}"/>${[0, 1, 2].map((i) => `<path d="M${145 + i * 6} 92L${145 + i * 6} 70" stroke="#e8dcc0" stroke-width="2"/><path d="M${142 + i * 6} 72L${145 + i * 6} 58L${148 + i * 6} 72Z" fill="${i === 1 ? AC : '#fff'}" ${ST1}/>`).join('')}</g>`;
  if (L.back === 'pack') back += `<rect x="128" y="138" width="40" height="50" rx="10" fill="#8a5e36" ${ST}/>`;
  if (L.mane) back += `<path d="${Array.from({ length: 19 }, (_, i) => { const a = Math.PI * 0.72 + (i / 18) * Math.PI * 1.56, r = i % 2 ? 50 : 70; return `${i ? 'L' : 'M'}${(100 + Math.cos(a) * r).toFixed(1)} ${(96 + Math.sin(a) * r * 0.95).toFixed(1)}`; }).join('')}Z" fill="${g('hb')}" ${ST}/>`;
  if (c.hairStyle === 'long') back += `<path d="M54 84Q40 140 50 198L72 192L84 200L100 194L116 200L128 192L150 198Q160 140 146 84Q100 56 54 84Z" fill="${g('hb')}" ${ST}/><path d="M62 120Q60 160 66 190M138 120Q140 160 134 190" stroke="${Hdd}" stroke-width="1.5" fill="none" opacity="0.6"/>`;
  if (c.hairStyle === 'twin') back += `<path d="M48 66Q20 90 26 150Q30 176 42 190Q44 160 56 140Q64 110 62 76Z" fill="${g('hb')}" ${ST}/><path d="M152 66Q180 90 174 150Q170 176 158 190Q156 160 144 140Q136 110 138 76Z" fill="${g('hb')}" ${ST}/>`;
  if (c.hairStyle === 'pony') back += `<path d="M126 56Q182 56 178 120Q176 160 160 178Q166 140 150 110Q140 90 132 72Z" fill="${g('hb')}" ${ST}/>`;
  if (c.hairStyle === 'bob') back += `<path d="M52 120Q44 60 100 50Q156 60 148 120L150 136L50 136Z" fill="${g('hb')}" ${ST}/>`;
  // ---------- 身體 ----------
  let body = `<path d="M60 200Q56 168 70 150L130 150Q144 168 140 200Z" fill="${g('cl')}" ${ST}/>`;
  body += `<path d="M20 200Q26 152 100 142Q174 152 180 200Z" fill="${g('of')}" ${ST}/>`;
  body += `<path d="M20 200Q24 166 54 152Q50 176 56 200Z" fill="${g('cl')}" ${ST1}/><path d="M180 200Q176 166 146 152Q150 176 144 200Z" fill="${g('cl')}" ${ST1}/>`;
  body += `<path d="M88 124L112 124L114 146Q100 154 86 146Z" fill="${shade(sk, -0.12)}" ${ST1}/><path d="M88 132Q100 140 112 132L112 126L88 126Z" fill="${shade(sk, -0.28)}" opacity="0.5"/>`;
  body += `<path d="M78 146L100 172L122 146L112 144L100 158L88 144Z" fill="${L.collar || AC}" ${ST1}/>`;
  if (L.capeStars) body += [[34, 182], [44, 166], [160, 176], [168, 190], [152, 162]].map(([x, y]) => spark(x, y, 4, '#ffe27a', 0.9)).join('');
  if (L.apron) body += `<path d="M78 158L122 158L126 200L74 200Z" fill="#fffaf0" ${ST1}/><rect x="90" y="174" width="20" height="12" rx="3" fill="none" stroke="#e2a87a" stroke-width="1.6"/>`;
  if (L.tabard) body += `<path d="M80 154L120 154L118 200L82 200Z" fill="#3d5a8c" ${ST1}/><circle cx="100" cy="180" r="10" fill="#e8c64a" ${ST1}/><path d="M100 173L102 178L107 178L103 181L105 186L100 183L95 186L97 181L93 178L98 178Z" fill="#3d5a8c"/>`;
  if (L.sash) body += `<path d="M58 150L72 146L150 200L128 200Z" fill="${L.sash}" ${ST1}/>`;
  if (L.belt === 'champ') body += `<circle cx="100" cy="184" r="12" fill="${g('gd')}" ${ST1}/><circle cx="100" cy="184" r="5" fill="#e33"/>`;
  if (L.shoulder) {
    const sf = L.shoulder === 'silver' ? g('mt') : L.shoulder === 'spike' ? '#2a2433' : '#7fd6a6';
    body += `<ellipse cx="44" cy="164" rx="26" ry="18" transform="rotate(-18 44 164)" fill="${sf}" ${ST}/><ellipse cx="156" cy="164" rx="26" ry="18" transform="rotate(18 156 164)" fill="${sf}" ${ST}/>`;
    if (L.shoulder === 'silver') body += `<path d="M28 156Q44 146 60 152M140 152Q156 146 172 156" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.8"/><circle cx="44" cy="164" r="4" fill="#3b82f6"/><circle cx="156" cy="164" r="4" fill="#3b82f6"/>`;
    if (L.shoulder === 'spike') body += `<path d="M30 154L22 134L42 150ZM48 148L48 126L60 148ZM170 154L178 134L158 150ZM152 148L152 126L140 148Z" fill="#b8323a" ${ST1}/>`;
  }
  if (L.scarf) body += `<path d="M70 138Q100 152 130 138L134 150Q100 166 66 150Z" fill="${L.scarf}" ${ST}/><path d="M74 148Q60 170 48 196L66 198Q72 176 86 154Z" fill="${shade(L.scarf, -0.15)}" ${ST1}/>`;
  if (L.fur) body += `<g fill="#f4f8ff" ${ST1}>${[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => `<circle cx="${100 + i * 9}" cy="${146 + Math.abs(i) * 1.2}" r="8"/>`).join('')}</g>`;
  if (L.beads) body += [...Array(11)].map((_, i) => { const a = Math.PI * (0.12 + (i / 10) * 0.76); return `<circle cx="${(100 + Math.cos(a) * 34).toFixed(1)}" cy="${(140 + Math.sin(a) * 30).toFixed(1)}" r="${i === 5 ? 7 : 5}" fill="${i === 5 ? '#c9a14a' : '#6b3a1f'}" ${ST1}/>`; }).join('');
  if (L.vine) body += `<path d="M72 150Q90 164 100 156Q112 148 128 160" stroke="#5fbf62" stroke-width="3" fill="none"/><circle cx="100" cy="156" r="5" fill="#ff9ec4" ${ST1}/><circle cx="122" cy="156" r="4" fill="#fff3a8"/>`;
  // ---------- 臉 ----------
  let face = `<path d="M61 90Q60 126 100 140Q140 126 139 90Q138 54 100 54Q62 54 61 90Z" fill="${g('sk')}" ${ST}/>`;
  face += `<path d="M64 86Q100 104 136 86L136 96Q100 112 64 96Z" fill="${shade(sk, -0.18)}" opacity="0.35"/>`;
  face += `<ellipse cx="76" cy="118" rx="9" ry="5" fill="#ff8aa0" opacity="0.4"/><ellipse cx="124" cy="118" rx="9" ry="5" fill="#ff8aa0" opacity="0.4"/><path d="M70 117L73 114M75 118L78 115M121 118L124 115M126 117L129 114" stroke="#ff6a88" stroke-width="1.2" opacity="0.6"/>`;
  face += `<path d="M100 110L98.5 114.5L101 115" stroke="${shade(sk, -0.35)}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  const eye = (cx, dir) => {
    if (L.eyes === 'calm') return `<path d="M${cx - 10} ${104}Q${cx} ${112} ${cx + 10} ${104}" stroke="#2a1a2e" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M${cx + dir * 10} 104L${cx + dir * 13} 101" stroke="#2a1a2e" stroke-width="2" stroke-linecap="round"/>`;
    let s = `<ellipse cx="${cx}" cy="104" rx="9.5" ry="11.5" fill="#fff"/>`;
    if (L.eyeGlow) s += `<circle cx="${cx}" cy="106" r="12" fill="${L.eyeGlow}" opacity="0.25"/>`;
    s += `<ellipse cx="${cx + dir * 0.5}" cy="106" rx="7.8" ry="9.8" fill="${g('ir')}"/><ellipse cx="${cx + dir * 0.5}" cy="107" rx="3.8" ry="5.4" fill="${shade(c.eye, -0.7)}"/>`;
    s += `<ellipse cx="${cx + dir * 0.5}" cy="111" rx="5" ry="2.4" fill="${shade(c.eye, 0.6)}" opacity="0.55"/>`;
    s += `<circle cx="${cx - 3}" cy="101" r="3.2" fill="#fff"/><circle cx="${cx + 3.5}" cy="110" r="1.6" fill="#fff"/>${spark(cx + 3, 99, 2.4, '#fff', 0.9)}`;
    s += `<path d="M${cx - 11} 100Q${cx} 88 ${cx + 11} 99L${cx + dir * 13} ${dir > 0 ? 96 : 96}" stroke="#2a1a2e" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="M${cx - 7} 116.5Q${cx} 118.5 ${cx + 7} 116.5" stroke="#6a4a5a" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
    return s;
  };
  face += eye(83, -1) + eye(117, 1);
  face += `<path d="M73 86Q83 81 93 85" stroke="${Hdd}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M107 85Q117 81 127 86" stroke="${Hdd}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  if (c.id === 'c02') face += `<path d="M93 124Q100 126 108 121" stroke="#9a4a46" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  else if (c.id === 'c03' || c.id === 'c12') face += `<path d="M91 121Q100 131 109 121Z" fill="#8a2a3a" ${ST1}/><path d="M93 121.5L95 125L97 122" fill="#fff"/>`;
  else face += `<path d="M94 122Q100 127 106 122" stroke="#b5544f" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  if (L.glasses) face += `<g fill="none" stroke="#6b4a2e" stroke-width="2.4"><circle cx="83" cy="105" r="14"/><circle cx="117" cy="105" r="14"/><path d="M97 104L103 104M69 102L62 98M131 102L138 98"/></g><path d="M74 98L80 94M108 98L114 94" stroke="#fff" stroke-width="2" opacity="0.7"/>`;
  // ---------- 前髮 ----------
  let front = '';
  switch (c.hairStyle) {
    case 'spiky': front = `<path d="M58 100L48 76L62 78L54 54L74 64L74 40L92 56L100 32L110 54L126 38L130 60L148 54L140 76L152 78L142 100Q136 84 128 80L126 92Q118 76 110 78L106 90Q100 74 92 80L88 92Q80 78 72 82L70 94Q64 88 58 100Z" fill="${g('hg')}" ${ST}/><path d="M92 58L88 80M110 56L112 76M76 66L76 84" stroke="${Hd}" stroke-width="1.6" fill="none"/>`; break;
    case 'shaved': front = `<path d="M62 86Q60 54 100 52Q140 54 138 86Q122 70 100 70Q78 70 62 86Z" fill="${g('hg')}" ${ST1} opacity="0.92"/>${[...Array(14)].map((_, i) => `<circle cx="${70 + (i % 7) * 10}" cy="${62 + Math.floor(i / 7) * 6}" r="0.9" fill="${Hdd}" opacity="0.5"/>`).join('')}`; break;
    case 'bob': front = `<path d="M50 132Q42 58 100 48Q158 58 150 132Q146 136 140 132Q142 106 134 92L132 82Q118 90 100 88Q82 90 68 82L66 92Q58 106 60 132Q54 136 50 132Z" fill="${g('hg')}" ${ST}/><path d="M76 60Q72 80 70 96M124 60Q128 80 130 96M100 52L100 84" stroke="${Hd}" stroke-width="1.6" fill="none"/>`; break;
    default: front = `<path d="M55 110Q48 58 100 48Q152 58 145 110Q141 92 134 84L131 99Q125 80 116 76L112 93Q106 74 98 72L92 91Q86 74 78 78L74 97Q68 82 62 87Z" fill="${g('hg')}" ${ST}/><path d="M57 86Q48 122 56 150Q62 130 66 100Z" fill="${g('hg')}" ${ST1}/><path d="M143 86Q152 120 146 144Q140 126 135 100Z" fill="${g('hg')}" ${ST1}/><path d="M100 52Q96 64 93 88M84 58Q80 70 77 92M118 56Q121 70 123 88" stroke="${Hd}" stroke-width="1.6" fill="none"/>`;
  }
  if (c.hairStyle !== 'shaved') front += `<path d="M72 68Q86 58 99 58M108 58Q121 60 129 69" stroke="${Hl}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.65"/>`;
  if (c.hairStyle === 'twin') front += `<circle cx="54" cy="70" r="9" fill="${AC}" ${ST1}/><circle cx="146" cy="70" r="9" fill="${AC}" ${ST1}/>`;
  // ---------- 頭飾 ----------
  let top = '';
  switch (L.head) {
    case 'tiara': top = `<path d="M66 70Q100 50 134 70" stroke="${O}" stroke-width="7" fill="none"/><path d="M66 70Q100 50 134 70" stroke="#ffd76a" stroke-width="4" fill="none"/><path d="M100 48L108 60L100 72L92 60Z" fill="#3b82f6" ${ST1}/><path d="M98 54L100 50L102 54" stroke="#cfe4ff" stroke-width="1.4" fill="none"/>${[-1, 1].map((sx) => `<path d="M${100 + sx * 40} 72Q${100 + sx * 56} 46 ${100 + sx * 76} 48Q${100 + sx * 64} 58 ${100 + sx * 72} 64Q${100 + sx * 58} 66 ${100 + sx * 66} 76Q${100 + sx * 52} 76 ${100 + sx * 40} 80Z" fill="#fff" ${ST1}/>`).join('')}`; break;
    case 'witch': top = `<ellipse cx="100" cy="64" rx="68" ry="16" transform="rotate(-4 100 64)" fill="${shade(L.hatCol, -0.15)}" ${ST}/><path d="M64 62C70 32 88 12 132 2C112 18 116 40 136 62Z" fill="${shade(L.hatCol, 0.1)}" ${ST}/><path d="M64 60Q100 70 136 60L134 50Q100 60 66 50Z" fill="${L.hatBand}" ${ST1}/>`;
      if (L.charm === 'star') top += `<path d="M132 4L136 22" stroke="#ffe27a" stroke-width="1.6"/><path d="M137 18L140 26L148 26L142 31L144 39L137 34L130 39L132 31L126 26L134 26Z" fill="${g('gd')}" ${ST1}/><path d="M108 40A8 8 0 1 0 118 50A6 6 0 1 1 108 40Z" fill="#fff6c9"/>`;
      if (L.charm === 'flower') top += [[96, 56, '#ff9ec4'], [112, 54, '#fff3a8'], [82, 56, '#ffffff']].map(([x, y, col]) => `<g>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${(x + Math.cos(i * 1.257) * 5).toFixed(1)}" cy="${(y + Math.sin(i * 1.257) * 5).toFixed(1)}" r="4" fill="${col}" ${ST1}/>`).join('')}<circle cx="${x}" cy="${y}" r="3" fill="#ffcf3a"/></g>`).join('') + `<ellipse cx="126" cy="56" rx="8" ry="3.5" transform="rotate(-20 126 56)" fill="#5fbf62" ${ST1}/>`;
      break;
    case 'bighat': top = `<ellipse cx="100" cy="66" rx="78" ry="20" transform="rotate(5 100 66)" fill="${shade(L.hatCol, -0.15)}" ${ST}/><path d="M60 64C58 30 96 14 128 22C150 28 156 46 150 60C142 50 136 50 132 56Q138 62 140 66Z" fill="${shade(L.hatCol, 0.1)}" ${ST}/><path d="M60 62Q100 74 140 64L138 54Q100 62 62 52Z" fill="${L.hatBand}" ${ST1}/><rect x="78" y="30" width="16" height="16" rx="2" transform="rotate(-10 86 38)" fill="#d9534f" ${ST1}/>`; break;
    case 'feather': top = `<path d="M136 80Q160 50 150 20Q138 50 130 78Z" fill="#f4fff8" ${ST1}/><path d="M150 20Q156 34 152 44Q144 34 150 20Z" fill="#5fe0a0"/><circle cx="134" cy="80" r="5" fill="#fff17a" ${ST1}/>`; break;
    case 'lionband': case 'band': {
      const col = L.head === 'band' ? (L.bandCol || '#3b6fd1') : '#c8302a';
      top = `<path d="M60 76Q36 70 22 84L28 92Q42 82 60 84Z" fill="${shade(col, -0.15)}" ${ST1}/><path d="M60 80Q40 90 30 108L38 112Q46 96 62 88Z" fill="${shade(col, -0.15)}" ${ST1}/><path d="M58 74Q100 58 142 74L142 84Q100 70 58 84Z" fill="${col}" ${ST}/>`;
      if (L.head === 'lionband') top += `<ellipse cx="100" cy="72" rx="12" ry="9" fill="${g('gd')}" ${ST1}/><circle cx="100" cy="72" r="3.5" fill="#e33"/>`;
      break;
    }
    case 'kerchief': top = `<path d="M54 92Q50 50 100 46Q150 50 146 92Q122 70 100 70Q76 70 54 92Z" fill="#e2453c" ${ST}/>${[[74, 62], [92, 54], [112, 56], [130, 66], [100, 64], [84, 70], [118, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#fff"/>`).join('')}<path d="M56 86L36 92L46 104Z" fill="#c93a32" ${ST1}/><path d="M56 88L42 110L52 112Z" fill="#c93a32" ${ST1}/>`; break;
    case 'circlet': top = `<path d="M62 76Q100 56 138 76" stroke="${O}" stroke-width="7" fill="none"/><path d="M62 76Q100 56 138 76" stroke="#4fae5a" stroke-width="4" fill="none"/>${[-1, 1].map((sx) => [0, 1, 2].map((i) => `<ellipse cx="${100 + sx * (24 + i * 11)}" cy="${68 + i * 3}" rx="8" ry="4" transform="rotate(${sx * (20 + i * 15)} ${100 + sx * (24 + i * 11)} ${68 + i * 3})" fill="${i % 2 ? '#7fd66a' : '#4fae5a'}" ${ST1}/>`).join('')).join('')}<circle cx="100" cy="64" r="6" fill="${g('gd')}" ${ST1}/><circle cx="100" cy="64" r="3" fill="#22a874"/>`; break;
    case 'feathercap': top = `<path d="M54 86Q52 46 104 42Q144 46 148 82Q100 66 54 86Z" fill="#3f6b3a" ${ST}/><path d="M56 80Q30 70 18 86Q38 90 58 88Z" fill="#2f5a2e" ${ST1}/><path d="M60 78Q100 64 146 76" stroke="#c9a14a" stroke-width="3" fill="none"/><path d="M84 48Q70 14 40 4Q66 30 76 52Z" fill="#e2453c" ${ST1}/><path d="M78 46Q62 22 46 10" stroke="#fff" stroke-width="1.2" opacity="0.6" fill="none"/>`; break;
    case 'snowpin': top = `<g transform="translate(138 76)" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M-10 0L10 0M-5 -8.7L5 8.7M-5 8.7L5 -8.7"/><circle r="3" fill="#9fe3ff" stroke="none"/></g>`; break;
    case 'cap': top = `<path d="M58 80Q56 44 100 42Q144 44 142 80Q100 66 58 80Z" fill="${L.capCol}" ${ST}/><path d="M60 78Q40 76 30 86Q46 88 62 86Z" fill="${shade(L.capCol, -0.2)}" ${ST1}/><circle cx="100" cy="43" r="4" fill="#fff" ${ST1}/><path d="M100 46Q108 58 104 72" stroke="#fff" stroke-width="1.6" opacity="0.6" fill="none"/>`; break;
    case 'helm': top = `<path d="M64 72Q64 34 100 32Q136 34 136 72Z" fill="${g('mt')}" ${ST}/><ellipse cx="100" cy="72" rx="56" ry="11" fill="${g('mt')}" ${ST}/><path d="M100 34L100 70" stroke="${O}" stroke-width="1.6"/><path d="M76 50Q84 40 96 38" stroke="#fff" stroke-width="3" fill="none" opacity="0.8"/>${[-2, -1, 0, 1, 2].map((i) => `<circle cx="${100 + i * 20}" cy="73" r="2" fill="#5a6278"/>`).join('')}`; break;
    default: break;
  }
  if (L.aura === 'dark') back = `<g opacity="0.55">${[30, 60, 140, 170].map((x, i) => `<path d="M${x - 14} 200Q${x - 8} 150 ${x + (i % 2 ? 6 : -6)} ${120 - i * 6}Q${x + 8} 150 ${x + 14} 200Z" fill="${i % 2 ? '#2a0f3a' : '#4a1650'}"/>`).join('')}</g>` + back;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${defs}${bg}${aw}${weapon}${back}${body}${face}${front}${top}${fistsFront}</svg>`;
}
