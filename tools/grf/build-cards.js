// 用法：node build-cards.js <items.json> <gear-data.js> <輸出 card-data.js>
// items.json：從客戶端 iteminfo_new.lub 讀出的 { 編號: { n, s, d } }（見 README）；說明「系列：卡片」的就是卡片
const fs = require('fs');
const [itemsPath, gearPath, outPath] = process.argv.slice(2);
global.window = global;
eval(fs.readFileSync(gearPath, 'utf8') + ';global.gearParseText=gearParseText;');
const { norm, merge, sentence } = require('../lib/effparse')(gearParseText);
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

// 可插的部位 → 配裝的部位代號
const POS = { 武器: 'weapon', 盾牌: 'shield', 頭具: 'head', 頭盔: 'head', 鎧甲: 'armor', 盔甲: 'armor', 披肩: 'garment', 鞋子: 'shoes', 靴子: 'shoes', 飾品: 'acc' };
const clean = t => t.replace(/<NAVI>.*?<\/NAVI>|<ITEM>|<\/ITEM>|<INFO>.*?<\/INFO>/g, '');

// 一行說明 → 效果（先處理卡片常見寫法，其餘交給附魔的轉換規則）
function line(s) {
  s = s.trim().replace(/[。.]$/, '').replace(/系列(?:角色|職業)?裝備(?:時|狀態下)/g, '系列裝備時').replace(/(?<!完全)迴避率?(再)?\s*\+/g, 'FLEE$1+').replace(/,/g, '，').replace(/命中率?\s*\+/g, 'HIT+').replace(/(?:套裝效果|套組|若套裝)?裝備者(?:為|如果是)/g, '當裝備職業為').replace(/MAXHP|MaxHP/g, 'MHP').replace(/MAXSP|MaxSP/g, 'MSP').replace(/\s+/g, ' ');
  let m = norm(s).match(/^(?:裝備的?)?精煉(?:值|度)?(?:為)?\+?(\d+)以上時，?(.+)$/);
  if (m) { const e = sentence(m[2]); if (!e._t) return { _rq: [[+m[1], e]] }; }
  m = norm(s).match(/^每BaseLv\.?(\d+)(?:級)?，(.+)$/i);
  if (m) { const e = sentence(m[2]); if (!e._t) return { _lv: [+m[1], e] }; }
  // 「…，當盜賊系列裝備時，…」：前後拆開
  const k = s.search(/[，,]\s*當/); if (k > 0) return merge(line(s.slice(0, k)), line(s.slice(k + 1)));
  return sentence(s);
}
const effOf = lines => lines.reduce((e, l) => merge(e, line(l)), {});

const cards = {}, byName = {}, raw = [];
for (const [id, v] of Object.entries(items)) {
  const d = clean(v.d);
  if (!/系列\s*[:：]\s*卡片/.test(d)) continue;
  const pm = d.match(/裝備\s*[:：]\s*([^/\s]+)/), pos = pm && POS[pm[1].trim()];
  if (!pos) continue;   // 全欄位（附魔）、特效道具等不收
  const lines = d.split(' / ').flatMap(x => x.split(/。(?=\S)/)).map(x => x.trim()).filter(x => x && x !== '_' && !/^(系列|裝備|重量)\s*[:：]/.test(x) && !/^\[.*\]$/.test(x));
  raw.push({ id: +id, n: v.n.trim(), pos, lines });
  byName[v.n.trim()] = +id;
}
// 套卡：「和 A、B 卡片一起裝備時」「同時與 A 卡片…一起裝備」「搭配「A卡片」時」之後的效果
const COMBO = /(?:和|與|同時與|同時裝備|搭配)\s*「?(.+?)」?\s*(?:卡片)?\s*(?:一起裝備|同時裝備|時)/;
const sets = new Map();
for (const c of raw) {
  let i = c.lines.findIndex(l => /一起裝備|同時裝備|搭配/.test(l));
  const own = i < 0 ? c.lines : c.lines.slice(0, i);
  const e = effOf(own);
  if (i >= 0) {
    const l = c.lines[i], m = l.match(COMBO);
    const names = m ? m[1].split(/[、，,和與及]|卡片」?、?「?/).map(x => x.replace(/[「」\s]/g, '')).filter(Boolean).map(x => x.endsWith('卡片') ? x : x + '卡片') : [];
    const ok = names.length && names.every(n => byName[n]);
    const after = l.replace(/^.*?(?:一起裝備|同時裝備|搭配)[^，,]*?時[，,]?/, '').replace(/^\s*(?:獲得以下的效果|套組效果)[。，,]?\s*/, '');
    const rest = [after, ...c.lines.slice(i + 1)].filter(Boolean);
    if (ok) {
      const key = [c.n, ...names].sort().join('|');
      if (!sets.has(key)) sets.set(key, { cards: [c.n, ...names].sort(), b: effOf(rest) });
    } else merge(e, { _t: c.lines.slice(i).join(' ') });
  }
  cards[c.id] = { n: c.n, p: c.pos, e };
}
// 只有文字（_t）的地方換回原句，比較好讀
const out = `// 由 tools/grf/build-cards.js 產生：卡片（取自樂園客戶端 iteminfo_new.lub，說明自動轉成效果；轉不了的留 _t 文字）
// CARDS[編號] = { n 名稱, p 部位（weapon／shield／head／armor／garment／shoes／acc）, e 效果 }；CARD_SETS = [{ cards: [名稱…], b 效果 }]
const CARDS = ${JSON.stringify(cards, null, 0)};
const CARD_SETS = ${JSON.stringify([...sets.values()], null, 0)};
`;
fs.writeFileSync(outPath, out);
const n = Object.keys(cards).length, txt = Object.values(cards).filter(c => c.e._t).length, none = Object.values(cards).filter(c => !Object.keys(c.e).some(k => k !== '_t')).length;
console.log('cards', n, 'sets', sets.size, '有文字效果', txt, '完全沒有可加總效果', none, 'bytes', out.length);
