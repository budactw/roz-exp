// 用法：node build-cards.js <items.json> <gear-data.js> <輸出 card-data.js>
// items.json：從客戶端 iteminfo_new.lub 讀出的 { 編號: { n, s, d } }（見 README）；說明「系列：卡片」的就是卡片
const fs = require('fs');
const [itemsPath, gearPath, outPath] = process.argv.slice(2);
global.window = global;
eval(fs.readFileSync(gearPath, 'utf8') + ';global.gearParseText=gearParseText;');
const { norm, merge, sentence, partial } = require('../lib/effparse')(gearParseText);
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
// 一般／Boss／MVP：card-class.py 產生的 card-class.json（{ 編號: 1 Boss／2 MVP }）
const CLS = JSON.parse(fs.readFileSync(require('path').join(__dirname, 'card-class.json'), 'utf8'));

// 可插的部位 → 配裝的部位代號
const POS = { 武器: 'weapon', 盾牌: 'shield', 頭具: 'head', 頭盔: 'head', 鎧甲: 'armor', 盔甲: 'armor', 披肩: 'garment', 鞋子: 'shoes', 靴子: 'shoes', 飾品: 'acc' };
const REF_POS = { 盾牌: 'shield', 防盾: 'shield', 鎧甲: 'armor', 盔甲: 'armor', 武器: 'weapon', 披肩: 'garment', 鞋子: 'shoes', 靴子: 'shoes', 頭盔: 'headTop' };
const IS_COMBO = l => !/魔物蛋|系列職業時/.test(l) && (/一起裝備|同時裝備|搭配/.test(l) || /^裝備[^，,]+?卡片時/.test(l));   // 套卡的那一行（寵物蛋、職業條件不算）
const clean = t => t.replace(/<NAVI>.*?<\/NAVI>|<ITEM>|<\/ITEM>|<INFO>.*?<\/INFO>/g, '');

// 一行說明 → 效果（先處理卡片常見寫法，其餘交給附魔的轉換規則）
function line(s) {
  s = s.trim().replace(/[。.]$/, '').replace(/系列(?:角色|職業)?裝備(?:時|狀態下)/g, '系列裝備時').replace(/(?<!完全)迴避率?(再)?\s*\+/g, 'FLEE$1+').replace(/,/g, '，').replace(/命中率?\s*\+/g, 'HIT+').replace(/(?:套裝效果|套組|若套裝)?裝備者(?:為|如果是)/g, '當裝備職業為').replace(/MAXHP|MaxHP/g, 'MHP').replace(/MAXSP|MaxSP/g, 'MSP').replace(/\s+/g, ' ');
  // 常見的不同寫法先統一
  s = s.replace(/精練/g, '精煉').replace(/遲延/g, '延遲').replace(/時，可使(?!用)/g, '時，').replace(/^可使(?!用)/, '').replace(/再\s*([+-])/g, '$1').replace(/[暴爆]擊攻擊時傷害/g, '暴擊傷害')
    .replace(/(^|，)MHP(?:和|、)MSP\+(\d+)%/, '$1MHP+$2%、MSP+$2%')
    .replace(/^搭配((?:「[^」]+」、?)+)系列職業時/, (_, j) => `當裝備職業為${j.replace(/[「」]/g, '')}系列時`).replace(/^HP與SP恢復力\+(\d+)%/, 'HP恢復力+$1%、SP恢復力+$1%').replace(/傷害，\+/g, '傷害+')
    .replace(/^減少攻擊速度[（(]攻擊後延遲\+(\d+)%[）)]/, '攻擊後延遲+$1%')
    .replace(/(恢復(?:力|率)|抗性|傷害|攻擊力|治癒量)\s*(?:增加|提升|上升)\s*(\d+)%/g, '$1+$2%').replace(/(恢復(?:力|率)|抗性|傷害|攻擊力)\s*(?:減少|降低)\s*(\d+)%/g, '$1-$2%')
    .replace(/^HP最大值減少(\d+)%/, 'MHP-$1%').replace(/^MHP、MSP增加(\d+)%/, 'MHP+$1%、MSP+$1%');
  // 「DEF+2精煉度為9以上時，MDEF+5」：前後拆開
  let m = norm(s).match(/^((?:STR|AGI|VIT|INT|DEX|LUK|DEF|MDEF|ATK|MATK|MHP|MSP|HIT|FLEE|CRI)[+-]\d+)(精煉.+)$/);
  if (m) return merge(line(m[1]), line(m[2]));
  // 精煉 +N 以下時（_rl）、+N 以上時（_rq）
  m = norm(s).match(/^(?:裝備的?|當)?精煉(?:值|度)?(?:為)?\+?(\d+)以下時，?(.+)$/);
  if (m) { const e = sentence(m[2]); if (!e._t) return { _rl: [[+m[1], e]] }; }
  m = norm(s).match(/^(?:裝備的?|披肩|鎧甲|盔甲|盾牌|鞋子|靴子|武器|頭盔)?精煉(?:值|度)?(?:為)?\+?(\d+)(?:以上)?時?，(.+)$/);
  if (m) { const e = sentence(m[2]); if (!e._t) return { _rq: [[+m[1], e]] }; }
  // 「基礎DEX每提升18時，VIT+1」→ _ps；「基礎AGI為90以上時，…」→ _if（都看純素質）
  m = norm(s).match(/^(?:自己的|自身)?基礎(STR|AGI|VIT|INT|DEX|LUK)(?:數值)?每(?:提升)?(\d+)(?:點)?時?，(.+)$/);
  if (m) { const e = sentence(m[3]); if (!e._t) return { _ps: [[m[1], +m[2], e]] }; }
  m = norm(s).match(/^(?:自己的|自身)?基礎(STR|AGI|VIT|INT|DEX|LUK)(?:數值)?為?(\d+)以上時，(.+)$/);
  if (m) { const e = sentence(m[3]); if (!e._t) return { _if: [[m[1], +m[2], e]] }; }
  // 「VIT依據精煉值提升」「根據精煉值來增加LUK和CRI(但CRI增加套用至+10)」：精煉每 +1 加 1（迪靡克、小青；對照 rAthena 的卡片效果）
  m = norm(s).match(/^(STR|AGI|VIT|INT|DEX|LUK|CRI)依據精煉值提升$/);
  if (m) return { _rr: [['', 1, { [m[1]]: 1 }, 0]] };
  m = norm(s).match(/^根據精煉值來增加(STR|AGI|VIT|INT|DEX|LUK|CRI)和(STR|AGI|VIT|INT|DEX|LUK|CRI)(?:[(（]但\2增加套用至\+(\d+)[)）])?$/);
  if (m) return { _rr: [['', 1, { [m[1]]: 1 }, 0], ['', 1, { [m[2]]: 1 }, m[3] ? +m[3] : 0]] };
  // 「搭配「廢柴魔物蛋Lv.1」或「太子魔物蛋Lv.1」時，…」：寵物戒指的寵物附魔 → _pet: [[[寵物 LvN…], 效果]]
  m = norm(s).match(/^搭配「(.+?)魔物蛋Lv\.?(\d)」(?:或「(.+?)魔物蛋Lv\.?(\d)」)?時，(.+)$/);
  if (m) { const pets = [`${m[1]} Lv${m[2]}`].concat(m[3] ? [`${m[3]} Lv${m[4]}`] : []), e = sentence(m[5]); if (!e._t) return { _pet: [[pets, e]] }; }
  // 「對魚貝型怪物進行攻擊時，CRI+7」
  m = norm(s).match(/^對(.+?型|無形)(?:怪物|魔物|敵人)?進行攻擊時，?CRI\+(\d+)$/);
  if (m) return { _c: { [`對${m[1]}怪物造成的CRI#`]: +m[2] } };
  // 「精煉每+1，…」「盾牌精煉度每提高1點，…」：依精煉值（沒寫部位＝插著的這件；最後的「精煉上限為+10」是最多算到幾）
  m = norm(s).match(/^(盾牌|防盾|鎧甲|盔甲|武器|披肩|鞋子|靴子|頭盔)?精煉(?:值|度)?每(?:提高)?\+?(\d+)(?:點)?時?，(.+?)(?:[(（]但.*?精煉上限為\+?(\d+)[)）])?$/);
  if (m) { const e = sentence(m[3]); if (!e._t) return { _rr: [[REF_POS[m[1]] || '', +m[2], e, m[4] ? +m[4] : 0]] }; }
  m = norm(s).match(/^每BaseLv\.?(\d+)(?:級)?，(.+)$/i);
  if (m) { const e = sentence(m[2]); if (!e._t) return { _lv: [+m[1], e] }; }
  // 「…，當盜賊系列裝備時，…」：前後拆開
  const k = s.search(/[，,]\s*(?=當|對[^，]+時)/); if (k > 0) return merge(line(s.slice(0, k)), line(s.slice(k + 1)));
  // 沒有條件的句子：能算的部分算、其他留文字
  if (!/時|當|每|機率|觸發|施放|使用|搭配|解除|卸除|復活|擊殺|擊敗|攻擊時/.test(s)) { const [pe, rest] = partial(s); if (Object.keys(pe).length) return rest ? merge(pe, { _t: rest }) : pe; }
  return sentence(s);
}
// 「武器為鈍器時，…」：接下來幾行（到下一個「武器為」為止）只在那種武器時算 → _wt: [[武器種類, 效果]]
function effOf(lines) {
  const e = {}; let wt = null, we = null;
  const flush = () => { if (wt) merge(e, Object.keys(we).length ? { _wt: [[wt, we]] } : {}); };
  for (let l of lines) {
    const m = norm(l).match(/^武器(?:為|是)(.+?)時，?(.*)$/);
    if (m) { flush(); wt = m[1]; we = {}; l = m[2]; }
    l = l.replace(/[，,]$/, ''); if (!l) continue;
    merge(wt ? we : e, line(l));
  }
  flush();
  // _wt 裡留下的文字搬回外面，加上條件
  for (const w of e._wt || []) if (w[1]._t) { merge(e, { _t: `武器為${w[0]}時：${w[1]._t}` }); delete w[1]._t; }
  return e;
}

const cards = {}, byName = {}, raw = [];
for (const [id, v] of Object.entries(items)) {
  const d = clean(v.d);
  if (!/系列\s*[:：]\s*卡片/.test(d)) continue;
  const pm = d.match(/裝備\s*[:：]\s*([^/\s]+)/), pos = pm && POS[pm[1].trim()];
  if (!pos) continue;   // 全欄位（附魔）、特效道具等不收
  const lines = d.split(' / ').flatMap(x => x.split(/。(?=\S)|(?<=[^\s，,。/])(?=(?:和|與|同時與|搭配)「?[^，,。]{1,20}?卡片」?(?:一起|同時)?裝備)/)).map(x => x.trim()).filter(x => x && x !== '_' && !/^(系列|裝備|重量)\s*[:：]/.test(x) && !/^\[.*\]$/.test(x));
  for (let j = lines.length - 2; j >= 0; j--) if (/時[，,]?$/.test(lines[j]) && !/^[(（]/.test(lines[j + 1]) && !IS_COMBO(lines[j + 1])) lines.splice(j, 2, lines[j].replace(/[，,]?$/, '，') + lines[j + 1]);
  raw.push({ id: +id, n: v.n.trim(), pos, lines });
  byName[v.n.replace(/\s/g, '')] = v.n.trim();   // 說明裡提到別的卡片時常常少了空格
}
// 套卡：「和 A、B 卡片一起裝備時」「同時與 A 卡片…一起裝備」「搭配「A卡片」時」之後的效果
const COMBO = /(?:和|與|同時與|同時裝備|搭配|^裝備|^)\s*「?([^，,。]+?)」?\s*(?:卡片)?\s*(?:一起裝備|同時裝備)?時/;
const sets = new Map();
for (const c of raw) {
  let i = c.lines.findIndex(IS_COMBO);
  const own = i < 0 ? c.lines : c.lines.slice(0, i);
  const e = effOf(own);
  if (i >= 0) {
    const l = c.lines[i], m = l.match(COMBO);
    const names = m ? m[1].split(/[、，,和與及]|卡片」?、?「?/).map(x => x.replace(/[「」\s]/g, '')).filter(Boolean).map(x => x.endsWith('卡片') ? x : x + '卡片') : [];
    const ok = names.length && names.every(n => byName[n]);
    names.forEach((n, j) => { names[j] = byName[n] || n; });
    for (let j = names.length - 1; j >= 0; j--) if (names[j] === c.n || names.indexOf(names[j]) < j) names.splice(j, 1);   // 「卡拉蟹、貝殼魔靈、海星卡片一起裝備」會列到自己
    const after = l.replace(/^.*?(?:一起裝備|同時裝備|搭配|^裝備)[^，,]*?時[，,]?/, '').replace(/^\s*(?:獲得以下的效果|套組效果)[。，,]?\s*/, '');
    const rest = [after, ...c.lines.slice(i + 1)].filter(Boolean);
    if (ok) {
      const key = [c.n, ...names].sort().join('|');
      if (!sets.has(key)) sets.set(key, { cards: [c.n, ...names].sort(), b: effOf(rest) });
    } else merge(e, { _t: c.lines.slice(i).join(' ') });
  }
  cards[c.id] = { n: c.n, p: c.pos, e, ...(CLS[c.id] ? { c: CLS[c.id] } : {}) };
}
// 只有文字（_t）的地方換回原句，比較好讀
const out = `// 由 tools/grf/build-cards.js 產生：卡片（取自樂園客戶端 iteminfo_new.lub，說明自動轉成效果；轉不了的留 _t 文字）
// CARDS[編號] = { n 名稱, p 部位（weapon／shield／head／armor／garment／shoes／acc）, e 效果, c 1 Boss／2 MVP（一般卡沒有）}；CARD_SETS = [{ cards: [名稱…], b 效果 }]
const CARDS = ${JSON.stringify(cards, null, 0)};
const CARD_SETS = ${JSON.stringify([...sets.values()], null, 0)};
`;
fs.writeFileSync(outPath, out);
const n = Object.keys(cards).length, txt = Object.values(cards).filter(c => c.e._t).length, none = Object.values(cards).filter(c => !Object.keys(c.e).some(k => k !== '_t')).length;
console.log('cards', n, 'sets', sets.size, '有文字效果', txt, '完全沒有可加總效果', none, 'bytes', out.length);
