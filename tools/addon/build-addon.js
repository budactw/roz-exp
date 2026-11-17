// 用法：node build-addon.js <抄錄 JSON 目錄> <輸出 addon-data.js>
const fs = require('fs'), path = require('path');
const [dir, outPath] = process.argv.slice(2);
const J = f => { const p = path.join(dir, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; };
const norm = s => s.replace(/\s+/g, '');
const BASIC = { STR: 'STR', AGI: 'AGI', VIT: 'VIT', INT: 'INT', DEX: 'DEX', LUK: 'LUK', ATK: 'ATK', MATK: 'MATK', HIT: 'HIT', FLEE: 'FLEE', CRI: 'CRI', DEF: 'DEF', MDEF: 'MDEF',
  MaxHP: 'MHP', 'MaxHP(%)': 'MHPp', MaxSP: 'MSP', 'MaxSP(%)': 'MSPp', 'ATK(%)': 'ATKp', 'MATK(%)': 'MATKp', ASPD: 'aspdFlat', '攻擊速度增加(%)': 'aspdP',
  '暴擊傷害增加(%)': 'crit', '遠距離攻擊增加(%)': 'ranged', '治癒量增加(%)': 'heal', '受到治癒量增加': 'healRecv', '受到治癒量增加(%)': 'healRecv',
  '變動詠唱時間減少': 'vct', '變動詠唱減少(%)': 'vct', '變動詠唱時間減少(%)': 'vct', 'HP自然恢復速度增加(%)': 'hpRegen', 'SP自然恢復速度增加(%)': 'spRegen',
  '對一般敵人造成的物理傷害增加(%)': 'normal', '對一般敵人造成的魔法傷害增加(%)': 'normalM' };
// 名稱 → [效果鍵, 正負]；鍵以 _c: 開頭表示技能／條件加成
function keyOf(raw) {
  const n = norm(raw);
  if (BASIC[n]) return [BASIC[n], 1];
  if (n === '技能使用時，SP消耗量減少(%)' || n === '技能使用時,SP消耗量減少(%)') return ['spCost', -1];
  let m;
  if ((m = n.match(/^從(.+?)敵人受到的(物理|魔法)傷害減少(\(%\))?$/))) return [`_c:受${m[1]}敵人的${m[2]}傷害`, -1];
  if ((m = n.match(/^對(.+?)的抗性增加(\(%\))?$/))) return [`_c:${m[1].replace('無型', '無形').replace('龍族', '龍族')}抗性`, 1];
  let lab = n.replace(/\(%\)$/, '').replace(/增加$/, '').replace('造成的', '的').replace('無型怪物', '無形怪物').replace('龍型怪物', '龍族怪物').replace('毒性對象', '毒屬性對象');
  return [`_c:${lab}`, 1];
}
const range = s => { const m = norm(s).match(/^(\d+)(?:~(\d+))?$/); return m ? [+m[1], +(m[2] || m[1])] : null; };
// 一個能力池 → { name, lines: [{ name, note, opts: [[顯示名稱, 鍵, 正負, 最小, 最大]] }] }
function pool(p, name) {
  return { name, lines: p.lines.map(l => {
    const seen = new Set();
    return { name: l.line || '附加能力', note: l.note || '', opts: l.options.filter(o => { const k = norm(o.name); if (seen.has(k)) return false; seen.add(k); return true; })
      .map(o => { const r = range(o.range); if (!r) { console.warn('數值？', o.name, o.range); return null; } const [k, sg] = keyOf(o.name); return [norm(o.name).replace(/\(%\)$/, '%'), k, sg, r[0], r[1]]; }).filter(Boolean) };
  }) };
}
const out = [];
const push = (label, test, pools) => out.push({ label, test, pools });
const star = J('out_star.json');
if (star) {
  const phy = star.pools.find(p => /物理/.test(p.variant)), mag = star.pools.find(p => /魔法/.test(p.variant));
  const tP = Object.entries(star.targets).find(([k]) => /物理/.test(k))[1], tM = Object.entries(star.targets).find(([k]) => /魔法/.test(k))[1];
  push('二級★武器（物理魔晶石）', `it => ${JSON.stringify(tP)}.includes(it.n)`, [pool(phy, '物理魔晶石')]);
  push('二級★武器（魔法魔晶石）', `it => ${JSON.stringify(tM)}.includes(it.n)`, [pool(mag, '魔法魔晶石')]);
}
const ph = J('out_phys.json'), mg = J('out_magic.json');
if (ph && mg) push('勇者改造許可執照', `it => ${JSON.stringify(ph.targets)}.includes(it.n)`, [pool(ph.pools[0], '物理改造許可執照'), pool(mg.pools[0], '魔法改造許可執照')]);
const lava = J('out_lava.json'); if (lava) push('熔岩精華', `it => ${JSON.stringify(lava.targets)}.includes(it.n)`, [pool(lava.pools[0], '熔岩精華')]);
const dr = J('out_dragon.json'); if (dr) push('漩渦的天龍神力', `it => ${JSON.stringify(dr.targets)}.includes(it.n)`, [pool(dr.pools[0], '漩渦的天龍神力')]);
const fw = J('out_fw.json'); if (fw) push('巨神蟒的卷軸', `it => /^巨神蟒蛇皮（/.test(it.n)`, fw.pools.map(p => pool(p, /魔法/.test(p.title) ? '巨神蟒的卷軸（魔法）' : '巨神蟒的卷軸（物理）')));
const drop = J('out_drop.json'); if (drop) fs.writeFileSync(path.join(dir, 'drop-pools.json'), JSON.stringify(drop.pools.map(p => ({ applies: p.applies, pool: pool(p, p.applies) })), null, 1));

const js = `// 由 tools/addon/build-addon.js 產生：官方「遊戲指南 → 附加能力系統」各公告的附加能力池（逐項抄錄）
// GEAR_ADDON：[{ label, test(it), pools: [{ name, lines: [{ name, note, opts: [[名稱, 效果鍵, 正負, 最小, 最大]] }] }] }]
// 效果鍵以「_c:」開頭的是技能／條件加成
const GEAR_ADDON = [
${out.map(c => `  { label: ${JSON.stringify(c.label)}, test: ${c.test}, pools: ${JSON.stringify(c.pools)} },`).join('\n')}
];
`;
fs.writeFileSync(outPath, js);
console.log('categories', out.length, 'bytes', js.length);
