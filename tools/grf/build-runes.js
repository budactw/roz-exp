// 用法：node build-runes.js <rune-sets.json（build-runes.py 產生）> <gear-data.js> <輸出 rune-data.js>
// 「強化+N時，X再+Y」→ 強化到 +N 以上就加（強化等級的效果是一路累加上去的）
const fs = require('fs');
const [inPath, gearPath, outPath] = process.argv.slice(2);
global.window = global;
eval(fs.readFileSync(gearPath, 'utf8') + ';global.gearParseText=gearParseText;');
const { sentence } = require('../lib/effparse')(gearParseText);
const sets = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const one = s => {
  s = s.replace(/\s+/g, '').replace(/再\+?/g, '+').replace(/\+\+/g, '+')
    .replace(/^攻擊速度增加(?:[(（]攻擊後延遲減少[)）])?\+?(\d+)%$/, '攻擊後延遲-$1%');
  return sentence(s);
};
let bad = 0;
const out = sets.map(x => {
  const r = { id: x.id, t: x.tier, n: x.n, e: {}, up: [] };
  for (const l of x.lines) {
    const m = l.match(/^強化\+(\d+)時，(.+)$/);
    const e = one(m ? m[2] : l); if (e._t) bad++;
    if (m) r.up.push([+m[1], e]); else Object.assign(r.e, e);
  }
  return r;
});
fs.writeFileSync(outPath, `// 由 tools/grf/build-runes.py＋build-runes.js 產生：符文石碑（取自樂園客戶端 System\\Rune）。同時只能裝 1 組，效果看強化等級（+0～+15，累加）
// RUNE_SETS = [{ id, t 頁籤（1～4＝Ⅰ～Ⅳ）, n 名稱, e 基本效果, up: [[強化等級, 再加的效果], …] }]
const RUNE_SETS = ${JSON.stringify(out)};
`);
console.log('rune sets', out.length, '轉不了的', bad);
