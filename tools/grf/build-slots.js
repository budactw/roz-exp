// 用法：node build-slots.js <items.json> <gear-data.js> <輸出 slot-data.js>
// items.json：從客戶端 System/iteminfo_new.lub 讀出的 { 編號: { n 名稱, s 洞數, d 說明 } }（見 README）
const fs = require('fs');
const [itemsPath, gearPath, outPath] = process.argv.slice(2);
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
eval(fs.readFileSync(gearPath, 'utf8') + ';global.GEAR_DB = GEAR_DB;');

// 配裝名稱和遊戲內名稱不同的（遊戲內名稱以客戶端為準）
const ALIAS = {
  '中級公會員昇龍拳套': '中級公會員昇龍拳套]', '雙龍戒指（左邊）': '雙龍戒指', '雙龍戒指（右邊）': '雙龍戒指',
};
const byName = {};
for (const o of Object.values(items)) (byName[o.n] = byName[o.n] || new Set()).add(o.s);
const out = {}, miss = [];
for (const it of GEAR_DB) {
  const s = byName[ALIAS[it.n] || it.n] || byName[it.n.replace(/（/g, '(').replace(/）/g, ')')];
  if (!s) { miss.push(it.n); continue; }
  const v = [...s].sort((a, b) => a - b);
  // 同名不同編號、洞數不同（例：鐵匠武器有一般版和多一洞的版本）→ 顯示範圍
  out[it.n] = v.length > 1 ? `${v[0]}～${v[v.length - 1]}` : v[0];
}
fs.writeFileSync(outPath, `// 由 tools/grf/build-slots.js 產生：裝備洞數，取自樂園客戶端 System/iteminfo_new.lub
const GEAR_HOLES = ${JSON.stringify(out)};
`);
console.log('slots', Object.keys(out).length, 'miss', miss.length, miss.join('、'));
