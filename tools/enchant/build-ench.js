// 用法：node build-ench.js <抄錄 JSON 目錄> <gear-data.js> <輸出 enchant-data.js>
const fs = require('fs'), path = require('path');
const [dir, gearPath, outPath] = process.argv.slice(2);
global.window = global;
eval(fs.readFileSync(gearPath, 'utf8') + ';global.gearParseText=gearParseText;');
const J = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const norm = s => s.replace(/\s+/g, '');
const STATS = ['STR', 'AGI', 'VIT', 'INT', 'DEX', 'LUK'];

// 單一片段 → 效果（解析不了回傳 null）
function frag(t) {
  t = norm(t).replace(/[。．.]$/, '').replace(/^攻擊速度增加[（(]攻擊後延遲(-|減少)?(\d+)%[。]?[）)]$/, '攻擊後延遲-$2%')
    .replace(/^攻擊速度增加[（(]攻擊後延遲減少[）)](\d+)%$/, '攻擊後延遲-$1%')
    .replace(/^攻擊速度增加[（(]攻擊後延遲減少(\d+)%[）)]$/, '攻擊後延遲-$1%').replace(/再\+/, '+');
  let m;
  if ((m = t.match(/^(STR|AGI|VIT|INT|DEX|LUK|HIT|FLEE|CRI|DEF|MDEF|ATK|MATK)\+(\d+)$/))) return { [m[1]]: +m[2] };
  if ((m = t.match(/^(ATK|MATK)\+(\d+)%$/))) return { [m[1] + 'p']: +m[2] };
  if ((m = t.match(/^M?HP\+?(\d+)(%?)$/))) return { [m[2] ? 'MHPp' : 'MHP']: +m[1] };
  if ((m = t.match(/^M?SP\+?(\d+)(%?)$/))) return { [m[2] ? 'MSPp' : 'MSP']: +m[1] };
  if ((m = t.match(/^(AllState|全能力)\+(\d+)$/i))) return Object.fromEntries(STATS.map(s => [s, +m[2]]));
  if ((m = t.match(/^攻擊後延遲-(\d+)%$/))) return { aspd: +m[1] };
  if ((m = t.match(/^ASPD\+(\d+)$/))) return { aspdFlat: +m[1] };
  if ((m = t.match(/^變動詠唱-(\d+)%$/))) return { vct: +m[1] };
  if ((m = t.match(/^固定詠唱-(\d+)%$/))) return { fct: +m[1] };
  if ((m = t.match(/^[暴爆]擊傷害\+(\d+)%$/))) return { crit: +m[1] };
  if ((m = t.match(/^遠距離(武器)?物理傷害\+(\d+)%$/))) return { ranged: +m[2] };
  if ((m = t.match(/^近距離(武器)?物理傷害\+(\d+)%$/))) return { melee: +m[2] };
  if ((m = t.match(/^治癒量\+(\d+)%$/))) return { heal: +m[1] };
  return null;
}
const merge = (a, b) => { for (const [k, v] of Object.entries(b)) { if (k === '_c') { a._c = a._c || {}; for (const [x, y] of Object.entries(v)) a._c[x] = (a._c[x] || 0) + y; } else if (k === '_t') a._t = a._t ? a._t + '；' + v : v; else if (k === '_pr' || k === '_job') a[k] = [...(a[k] || []), ...v]; else a[k] = (a[k] || 0) + v; } return a; };
// 一句話 → 效果；全部片段都能解析才算，否則交給 gearParseText（技能傷害等）或列文字
function sentence(s) {
  s = s.trim().replace(/[。]$/, ''); if (!s) return {};
  // 鎧甲每精煉 +N：依鎧甲精煉值計算
  let m = norm(s).match(/^(鎧甲|盔甲)(的)?(每精煉\+?(\d+)|精煉每\+(\d+))時?，(.+)$/);
  if (m) { const e = sentence(m[6]); if (!e._t) return { _pr: [[+(m[4] || m[5]), e]] }; }
  // 職業限定：「當裝備職業為商人系列時，…」「商人系列裝備時，…」→ 交給配裝頁的 _job（選了職業才加總）
  m = norm(s).match(/^(?:當)?(?:裝備職業為)?([^，]+?系列)(?:裝備)?時，(.+)$/);
  if (m) { const e = sentence(m[2]); if (!e._t) return { _job: [[m[1], e]] }; }
  if (/每|時|當|機率|觸發|施放|使用/.test(s)) return { _t: s };
  const parts = norm(s).split(/[，,]/).filter(Boolean);
  // 每段先試基本能力，再試技能／條件加成（例如「雷鳴術傷害+40%」）；有一段不行就整句列文字
  const fs_ = parts.map(p => { const sl = p.match(/^((?:STR|AGI|VIT|INT|DEX|LUK)(?:、(?:STR|AGI|VIT|INT|DEX|LUK))+)\+(\d+)$/); if (sl) return Object.fromEntries(sl[1].split('、').map(x => [x, +sl[2]])); const sub = p.split('、'); const f = sub.map(frag); if (f.every(Boolean)) return f.reduce(merge, {}); const c = /\d%?、/.test(p) ? null : gearParseText(p); return c ? { _c: c } : null; });
  if (fs_.every(Boolean)) return fs_.reduce(merge, {});
  return { _t: s };
}
function effOf(desc) {
  const e = {};
  for (const s of desc.replace(/。\s*([）)])/g, '$1').replace(/，\s\/\s/g, '，').split(/\s\/\s|。/)) merge(e, sentence(s));
  return e;
}

const OPT = {};   // 名稱 → 效果
const add = o => { const n = norm(o.name); const e = effOf(o.desc); if (OPT[n] && JSON.stringify(OPT[n]) !== JSON.stringify(e)) console.warn('衝突', n); OPT[n] = e; return n; };
const names = t => t.options.map(add);
const slotsOf = st => [...st].filter(c => '二三四'.includes(c)).map(c => c + '洞');
const PART = { 披肩部位: 'garment', 鞋子部位: 'shoes', 鎧甲部位: 'armor' };

// MD 副本裝備：+0~8 全部位一張表，+9 依部位多出選項
function md(file, label, groupTest) {
  const j = J(file);
  const base = j.tables.find(t => /0~8/.test(t.title));
  const baseN = names(base);
  const slotNames = slotsOf(base.stage).sort((a, b) => '四三二'.indexOf(a[0]) - '四三二'.indexOf(b[0]));
  const slots = slotNames.map(sn => {
    const parts = { armor: [[0, baseN]], garment: [[0, baseN]], shoes: [[0, baseN]], acc: [[0, baseN]] };
    for (const t of j.tables) {
      if (t === base || !t.options.length || !slotsOf(t.stage).includes(sn)) continue;
      const p = PART[t.part]; if (!p) continue;
      const extra = names(t).filter(n => !baseN.includes(n));
      if (extra.length) parts[p] = [[0, baseN], [9, extra]];
    }
    return { name: sn, parts };
  });
  return { label, test: groupTest, slots };
}
const out = [];
// 60MD（自抄）
const m60 = J('out_md60.json');
const b60 = names(m60.tables[0]);
const ess60 = m60.tables[3].essences.map(add);
out.push({ label: '征伐隊', test: "it => it.g === '征伐隊'", slots: [{ name: '四洞', parts: { armor: [[0, b60], [9, ['HP300', 'HP400', ...ess60]]], garment: [[0, b60], [9, ['HP300', 'HP400']]], shoes: [[0, b60], [9, ['HP300', 'HP400']]], acc: [[0, b60]] } }] });
out.push(md('out_md70.json', '遠征隊', "it => it.g === '遠征隊'"));
out.push(md('out_md80.json', '殲滅隊', "it => it.g === '殲滅隊'"));
out.push(md('out_md90.json', '征服者', "it => it.g === '征服者'"));
// 毀葛紀念品
const hg = J('out_hg.json');
for (const t of hg.tables) {
  const items = t.part.split('、'); const n = names(t);
  out.push({ label: '毀葛紀念品', test: `it => ${JSON.stringify(items)}.includes(it.n)`, slots: slotsOf(t.stage).sort((a, b) => '四三二'.indexOf(a[0]) - '四三二'.indexOf(b[0])).map(sn => ({ name: sn, parts: { all: [[0, n]] } })) });
}
// 奧丁防具：三、四洞共通；二洞精煉 +9 起多專屬
const od = J('out_od.json');
const odBase = names(od.tables[0]);
for (const [items, tabs] of [[od.tables[1].part.split('、'), [od.tables[1], od.tables[2]]], [od.tables[3].part.split('、'), [od.tables[3], od.tables[4]]]]) {
  const ex = [...new Set(tabs.flatMap(names))].filter(n => !odBase.includes(n));
  out.push({ label: '奧丁防具', test: `it => ${JSON.stringify(items)}.includes(it.n)`, slots: [
    { name: '四洞', parts: { all: [[0, odBase]] } }, { name: '三洞', parts: { all: [[0, odBase]] } }, { name: '二洞', parts: { all: [[0, odBase], [9, ex]] } }] });
}
// 征服者轉生：三、四洞（+9 多 HP300／400），二洞職業精髓
const cq = J('out_cq.json');
const cqA = names(cq.tables[0]), cqB = names(cq.tables[1]).filter(n => !cqA.includes(n)), cqC = names(cq.tables[2]);
out.push({ label: '征服者轉生', test: `it => it.g === '征服者轉生' && it.s === 'armor'`, slots: [
  { name: '四洞', parts: { all: [[0, cqA], [9, cqB]] } }, { name: '三洞', parts: { all: [[0, cqA], [9, cqB]] } }, { name: '二洞', parts: { all: [[0, cqC]] } }] });

// 波利村紅蘿蔔／大蔥（公告 217651，蔬果附魔師）：四洞
const veg = ['STR+1', 'INT+1', 'DEX+1', 'AGI+1', 'VIT+1', 'LUK+1', 'HP+100', 'HP+200', 'SP+50', 'SP+25', 'SP+10'].map(n => add({ name: n, desc: n }));
out.push({ label: '波利村', test: `it => ['波利村紅蘿蔔', '波利村大蔥'].includes(it.n)`, slots: [{ name: '四洞', parts: { all: [[0, veg]] } }] });

// 中級公會員（城戰）：台服道具「增幅／抗性：技能 1Lv」；效果與可附魔裝備參考韓服 2018/05/09「[던전] 길드던전」(seq=22)
// 武器：增幅＝該技能傷害 +7%；鎧甲（外袍、外套、鎧甲）：抗性＝受該技能傷害 -15%；四洞、三洞，可重複
const GUILD_SK = ['暴風雪', '隕石術', '怒雷強擊', '十字驅魔攻擊', '黑暗瞬間', '螺旋擊刺', '強酸火煙瓶投擲', '連刺攻擊', '怪物互擊', '水球術', '音速投擲', '連續盾擊', '迴旋盾擊', '聖十字攻擊', '獵鷹突擊', '閃電衝擊', '阿修羅霸凰拳', '浸透勁', '奧義箭亂舞', '二連矢', '銳利射擊', '念力連擊', '重力原野'];
const gAmp = GUILD_SK.map(k => { const n = `增幅：${k}1Lv`; OPT[n] = { _c: { [`${k}傷害`]: 7 } }; return n; });
const gRes = GUILD_SK.map(k => { const n = `抗性：${k}1Lv`; OPT[n] = { _c: { [`受${k}的傷害`]: -15 } }; return n; });
out.push({ label: '中級公會員', test: `it => it.g === '城戰' && it.n.startsWith('中級公會員') && (it.s === 'weapon' || it.s === 'armor')`, slots: ['四洞', '三洞'].map(name => ({ name, parts: { weapon: [[0, gAmp]], armor: [[0, gRes]] } })) });

const js = `// 由 tools/enchant/build-ench.js 產生：官方「遊戲指南 → 附魔系統」各專屬附魔公告的表格逐項抄錄
// GEAR_ENCH：[{ label, test(it), slots: [{ name, parts: { armor|garment|shoes|acc|all: [[最低精煉, [選項…]], …] } }] }]
// ENCH_OPT：選項 → 效果；_pr: [[N, 效果], …] 表示「鎧甲每精煉 +N」，依該件精煉值計算
const ENCH_OPT = ${JSON.stringify(OPT)};
const enchEff = n => ENCH_OPT[n] || { _t: n };
const GEAR_ENCH = [
${out.map(c => `  { label: ${JSON.stringify(c.label)}, test: ${c.test}, slots: ${JSON.stringify(c.slots)} },`).join('\n')}
];
`;
fs.writeFileSync(outPath, js);
console.log('options', Object.keys(OPT).length, 'categories', out.length, 'bytes', js.length);
