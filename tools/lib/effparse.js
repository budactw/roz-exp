// 遊戲說明文字 → 配裝效果（附魔、卡片共用）。用法：const P = require('../lib/effparse')(gearParseText);
module.exports = function (gearParseText) {
const norm = s => s.replace(/\s+/g, '');
const STATS = ['STR', 'AGI', 'VIT', 'INT', 'DEX', 'LUK'];

// 技能名稱統一（和配裝資料、服飾附魔石用同一個名稱，技能等級欄位才會合併成一格）
const SKILL_ALIAS = { '操控樂器／練習舞蹈': '練習舞蹈／操控樂器', '飛刀修煉': '飛刀修練', '忍者修練': '忍術修練', '所有化學武器保護': '全體化學保護' };
const skillName = n => { n = n.replace(/技能$/, '').replace(/、/g, '／'); return SKILL_ALIAS[n] || n; };
// 單一片段 → 效果（解析不了回傳 null）
function frag(t) {
  t = norm(t).replace(/[。．.]$/, '').replace(/^攻擊速度增加[（(]攻擊後延遲(-|減少)?(\d+)%[。]?[）)]$/, '攻擊後延遲-$2%')
    .replace(/^攻擊速度(增加)?[（(]攻擊後延遲減少[）)](\d+)%$/, '攻擊後延遲-$2%')
    .replace(/^攻擊速度增加[（(]攻擊後延遲減少(\d+)%[）)]$/, '攻擊後延遲-$1%').replace(/再\+/, '+');
  let m;
  if ((m = t.match(/^(STR|AGI|VIT|INT|DEX|LUK|HIT|FLEE|CRI|DEF|MDEF|ATK|MATK)([+-])(\d+)$/))) return { [m[1]]: (m[2] === '-' ? -1 : 1) * m[3] };
  if ((m = t.match(/^(ATK|MATK)\+(\d+)%$/))) return { [m[1] + 'p']: +m[2] };
  if ((m = t.match(/^M?HP\+?(\d+)(%?)$/))) return { [m[2] ? 'MHPp' : 'MHP']: +m[1] };
  if ((m = t.match(/^M?SP\+?(\d+)(%?)$/))) return { [m[2] ? 'MSPp' : 'MSP']: +m[1] };
  if ((m = t.match(/^(AllState|全能力)\+(\d+)$/i))) return Object.fromEntries(STATS.map(s => [s, +m[2]]));
  if ((m = t.match(/^攻擊後延遲-(\d+)%$/))) return { aspd: +m[1] };
  if ((m = t.match(/^ASPD\+(\d+)$/))) return { aspdFlat: +m[1] };
  if ((m = t.match(/^變動詠唱-(\d+)%$/))) return { vct: +m[1] };
  if ((m = t.match(/^變動詠唱\+(\d+)%$/))) return { vct: -m[1] };
  if ((m = t.match(/^固定詠唱-(\d+)%$/))) return { fct: +m[1] };
  if ((m = t.match(/^[暴爆]擊傷害\+(\d+)%$/))) return { crit: +m[1] };
  if ((m = t.match(/^遠距離(武器)?物理傷害\+(\d+)%$/))) return { ranged: +m[2] };
  if ((m = t.match(/^近距離(武器)?物理傷害\+(\d+)%$/))) return { melee: +m[2] };
  if ((m = t.match(/^治癒量\+(\d+)%$/))) return { heal: +m[1] };
  if ((m = t.match(/^SP恢復力\+(\d+)%$/))) return { spRec: +m[1] };
  if ((m = t.match(/^(H|S)P自然恢復(?:速度|力)\+(\d+)%$/))) return { [m[1] === 'H' ? 'hpRegen' : 'spRegen']: +m[2] };
  if ((m = t.match(/^(?:無視|忽視)一般(?:階級)?敵人的?防禦力?(\d+)%$/))) return { _c: { '忽視一般階級敵人的防禦力': +m[1] } };
  // 指定技能的 SP 消耗：「潛擊SP消耗-15%」「怒爆SP消耗-10」
  if ((m = t.match(/^(.+?)SP消耗(?:量)?([+-]\d+)(%?)$/))) return { _c: { [`${m[1]} SP 消耗量${m[3] ? '' : '#'}`]: +m[2] } };
  return null;
}
const merge = (a, b) => { for (const [k, v] of Object.entries(b)) { if (k === '_c') { a._c = a._c || {}; for (const [x, y] of Object.entries(v)) a._c[x] = (a._c[x] || 0) + y; } else if (k === '_t') a._t = a._t ? a._t + '；' + v : v; else if (k === '_pr' || k === '_job' || k === '_sl' || k === '_rq') a[k] = [...(a[k] || []), ...v]; else if (k === '_lv') a[k] = v; else a[k] = (a[k] || 0) + v; } return a; };
// 一句話 → 效果；全部片段都能解析才算，否則交給 gearParseText（技能傷害等）或列文字
// 一句裡能算的部分算、不能算的留文字：回傳 [效果, 剩下的文字]
function partial(text) {
  const eff = {}, rest = [];
  for (const p of norm(text).split(/[，,]/).filter(Boolean)) {
    const subs = p.split(/(?<=%|\d)、/);   // 「傷害+20%、變動詠唱-20%」拆開；「火箭術、冰箭術傷害」不拆
    for (const x of subs) { const e = sentence(x); if (e._t) rest.push(x); else merge(eff, e); }
  }
  return [eff, rest.join('，')];
}
function sentence(s) {
  s = s.trim().replace(/[。]$/, '').replace(/\]$/, '').replace(/時，時，/g, '時，').replace(/提高(\d+)%/g, '+$1%').replace(/額外\+/g, '+').replace(/連鎖全身掌/g, '連環全身掌').replace(/傷害提\+/g, '傷害+'); if (!s || s === ']') return {};
  // 鎧甲每精煉 +N：依鎧甲精煉值計算
  let m = norm(s).match(/^(鎧甲|盔甲)(的)?(每精煉\+?(\d+)|精煉(?:值)?每\+(\d+))時?，(.+)$/);
  if (m) { const e = sentence(m[6]); if (!e._t) return { _pr: [[+(m[4] || m[5]), e]] }; }
  // 職業限定：「當裝備職業為商人系列時，…」「商人系列裝備時，…」→ 交給配裝頁的 _job（選了職業才加總）
  m = norm(s).match(/^(?:當)?(?:裝備職業為)?([^，]+?系列)(?:裝備)?時，(.+)$/);
  if (m) { const e = sentence(m[2]); if (!e._t) return { _job: [[m[1], e]] };
    const [pe, rest] = partial(m[2]); if (Object.keys(pe).length) return rest ? { _job: [[m[1], pe]], _t: `${m[1]}裝備時，${rest}` } : { _job: [[m[1], pe]] }; }
  // 技能等級：「進化之書每Lv1，MATK+5」「騎兵修練技能等級每+1時，CRI+3」「狂擊每+2級，…」→ 配裝頁依使用者填的技能等級計算（_sl）
  m = norm(s).match(/^([^，；]+?)(?:技能技能等級|技能等級|等級總和)?每(?:\+|Lv\.?)(\d+)級?時?，(.+)$/);
  if (m && !/精煉/.test(m[1])) { const e = sentence(m[3]); if (!e._t) return { _sl: [[skillName(m[1]), +m[2], e]] }; }
  if (/每|時|當|機率|觸發|施放|使用/.test(s)) return { _t: s };
  const parts = norm(s).split(/[，,]/).filter(Boolean);
  // 每段先試基本能力，再試技能／條件加成（例如「雷鳴術傷害+40%」）；有一段不行就整句列文字
  const fs_ = parts.map(p => { const sl = p.match(/^((?:STR|AGI|VIT|INT|DEX|LUK)(?:、(?:STR|AGI|VIT|INT|DEX|LUK))+)\+(\d+)$/); if (sl) return Object.fromEntries(sl[1].split('、').map(x => [x, +sl[2]])); const whole = frag(p); if (whole) return whole; const sub = p.split('、'); const f = sub.map(frag); if (f.every(Boolean)) return f.reduce(merge, {}); const c = /\d%?、/.test(p) ? null : gearParseText(p); return c ? { _c: c } : null; });
  if (fs_.every(Boolean)) return fs_.reduce(merge, {});
  return { _t: s };
}
  return { norm, frag, merge, partial, sentence, skillName };
};
