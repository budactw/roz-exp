// RO樂園 配裝模擬器資料（副本裝備）
// 來源：RO補給站 https://ro-zero-site.pages.dev/instances（副本裝備能力，該站標示核對日 2026-10-17）
// 欄位：n 名稱、s 部位（armor 鎧甲／garment 披肩／shoes 鞋子／accR 右飾品／accL 左飾品／acc 左右皆可）、
//       lv 需求等級、def 防禦欄位、ref 可精煉、b 基本能力、r { 精煉門檻: 能力 }（精煉 +N 以上生效）
//       能力裡的 _lv: [每 N 級, {能力}] 表示 BaseLv 每 N 級給一次
// 說明文字裡的「DEF+」推測已含在防禦欄位（例：各階鎧甲防禦扣掉 DEF+ 都是 26），所以不另外加。
const GEAR_STAT = [
  ['STR', 'STR'], ['AGI', 'AGI'], ['VIT', 'VIT'], ['INT', 'INT'], ['DEX', 'DEX'], ['LUK', 'LUK'],
  ['ATK', 'ATK'], ['MATK', 'MATK'], ['MATKp', 'MATK', '%'],
  ['MHP', 'MHP'], ['MSP', 'MSP'], ['DEF', '裝備防禦'], ['MDEF', 'MDEF'], ['FLEE', 'FLEE'],
  ['aspd', '攻擊後延遲', '%', -1], ['vct', '變動詠唱', '%', -1], ['fct', '固定詠唱', '%', -1],
  ['crit', '暴擊傷害', '%'], ['ranged', '遠距離物理傷害', '%'], ['critAtk', '必殺攻擊傷害', '%'], ['fwMagic', '火、水屬性魔法傷害', '%'],
  ['heal', '治癒術恢復量', '%'], ['neutral', '無屬性抗性', '%'], ['hpRec', 'HP 恢復量', '%'], ['spRec', 'SP 恢復力', '%'],
];
const GEAR_SLOTS = [
  ['armor', '鎧甲', ['armor']], ['garment', '披肩', ['garment']], ['shoes', '鞋子', ['shoes']],
  ['accR', '飾品（右）', ['accR', 'acc']], ['accL', '飾品（左）', ['accL', 'acc']],
];

const GEAR_DB = [
  // ===== 60 等：飾品製作（獸人的記憶／普隆德拉-地下水道材料）=====
  { n: '受到詛咒的翡翠耳環', g: '飾品製作', s: 'accR', lv: 50, def: 3, ref: true, b: { DEX: 2, AGI: 2 }, r: { 7: { DEX: 2, AGI: 2 }, 9: { _lv: [25, { aspd: 2 }] } } },
  { n: '晶瑩光芒的白寶石耳環', g: '飾品製作', s: 'accR', lv: 50, def: 3, ref: true, b: { INT: 2, VIT: 2 }, r: { 7: { INT: 2, VIT: 2 }, 9: { _lv: [25, { vct: 2 }] } } },
  { n: '藍色誓詞戒指', g: '飾品製作', s: 'accL', lv: 50, def: 3, ref: true, b: { INT: 2, DEX: 2 }, r: { 7: { INT: 2, DEX: 2 }, 9: { _lv: [20, { fwMagic: 1 }] } } },
  { n: '紅色盟誓戒指', g: '飾品製作', s: 'accL', lv: 50, def: 3, ref: true, b: { LUK: 2, AGI: 2 }, r: { 7: { LUK: 2, AGI: 2 }, 9: { _lv: [20, { critAtk: 1 }] } } },

  // ===== 60 等：征伐隊 =====
  { n: '征伐隊盔甲', g: '征伐隊', s: 'armor', lv: 60, def: 46, ref: true, b: { MHP: 300, MSP: 20, MDEF: 5 } },
  { n: '征伐隊肩飾', g: '征伐隊', s: 'garment', lv: 60, def: 12, ref: true, b: { neutral: 7, FLEE: 10 } },
  { n: '征伐隊軍靴', g: '征伐隊', s: 'shoes', lv: 60, def: 12, ref: true, b: { hpRec: 5, spRec: 3 } },
  { n: '征伐隊戒指', g: '征伐隊', s: 'acc', lv: 60, def: 0, b: { STR: 2, INT: 2 } },

  // ===== 70 等：遠征隊 =====
  { n: '遠征隊鎧甲', g: '遠征隊', s: 'armor', lv: 70, def: 56, ref: true, b: { MHP: 500, MSP: 30, MDEF: 5 }, r: { 3: { DEF: 10, MHP: 50 } } },
  { n: '遠征隊外袍', g: '遠征隊', s: 'armor', lv: 70, def: 51, ref: true, b: { MHP: 400, MSP: 50, MDEF: 5 }, r: { 3: { DEF: 5, MSP: 10 } } },
  { n: '遠征隊斗篷', g: '遠征隊', s: 'garment', lv: 70, def: 14, ref: true, b: { neutral: 8, FLEE: 15 }, r: { 3: { FLEE: 3 } } },
  { n: '遠征隊圍巾', g: '遠征隊', s: 'garment', lv: 70, def: 13, ref: true, b: { neutral: 9, FLEE: 12 }, r: { 3: { neutral: 1 } } },
  { n: '遠征隊長靴', g: '遠征隊', s: 'shoes', lv: 70, def: 16, ref: true, b: { hpRec: 15, spRec: 5 }, r: { 3: { AGI: 1 } } },
  { n: '遠征隊鞋子', g: '遠征隊', s: 'shoes', lv: 70, def: 14, ref: true, b: { hpRec: 10, spRec: 7 }, r: { 3: { VIT: 1 } } },
  { n: '遠征隊戒指', g: '遠征隊', s: 'acc', lv: 70, def: 0, b: { STR: 3 } },
  { n: '遠征隊魔法戒指', g: '遠征隊', s: 'acc', lv: 70, def: 0, b: { INT: 3 } },

  // ===== 80 等：殲滅隊 =====
  { n: '殲滅隊鎧甲', g: '殲滅隊', s: 'armor', lv: 80, def: 66, ref: true, b: { STR: 1, AGI: 1, MHP: 700, MSP: 50, MDEF: 5 }, r: { 5: { DEF: 15, MHP: 100 } } },
  { n: '殲滅隊風衣', g: '殲滅隊', s: 'armor', lv: 80, def: 63, ref: true, b: { DEX: 1, AGI: 1, MHP: 500, MSP: 60, MDEF: 5 }, r: { 5: { DEF: 15, MSP: 20 } } },
  { n: '殲滅隊外袍', g: '殲滅隊', s: 'armor', lv: 80, def: 61, ref: true, b: { INT: 1, DEX: 1, MHP: 500, MSP: 70, MDEF: 5 }, r: { 5: { DEF: 10, MSP: 20 } } },
  { n: '殲滅隊制服', g: '殲滅隊', s: 'armor', lv: 80, def: 59, ref: true, b: { INT: 1, VIT: 1, MHP: 600, MSP: 60, MDEF: 5 }, r: { 5: { DEF: 10, MHP: 100 } } },
  { n: '殲滅隊斗篷', g: '殲滅隊', s: 'garment', lv: 80, def: 16, ref: true, b: { aspd: 5, FLEE: 15 }, r: { 5: { AGI: 1 } } },
  { n: '殲滅隊偵查斗篷', g: '殲滅隊', s: 'garment', lv: 80, def: 15, ref: true, b: { aspd: 3, FLEE: 20 }, r: { 5: { aspd: 2 } } },
  { n: '殲滅隊圍巾', g: '殲滅隊', s: 'garment', lv: 80, def: 14, ref: true, b: { vct: 3, FLEE: 16 }, r: { 5: { vct: 4 } } },
  { n: '殲滅隊披肩', g: '殲滅隊', s: 'garment', lv: 80, def: 13, ref: true, b: { vct: 5, FLEE: 12 }, r: { 5: { neutral: 3 } } },
  { n: '殲滅隊重靴', g: '殲滅隊', s: 'shoes', lv: 80, def: 20, ref: true, b: { hpRec: 18, spRec: 5 }, r: { 5: { STR: 2 } } },
  { n: '殲滅隊長靴', g: '殲滅隊', s: 'shoes', lv: 80, def: 18, ref: true, b: { hpRec: 15, spRec: 7 }, r: { 5: { DEX: 2 } } },
  { n: '殲滅隊鞋子', g: '殲滅隊', s: 'shoes', lv: 80, def: 16, ref: true, b: { hpRec: 12, spRec: 10 }, r: { 5: { INT: 2 } } },
  { n: '殲滅隊魔法鞋子', g: '殲滅隊', s: 'shoes', lv: 80, def: 15, ref: true, b: { hpRec: 15, spRec: 7 }, r: { 5: { heal: 2 } } },
  { n: '殲滅隊戒指', g: '殲滅隊', s: 'acc', lv: 80, def: 0, b: { STR: 3, AGI: 1 } },
  { n: '殲滅隊手套', g: '殲滅隊', s: 'acc', lv: 80, def: 0, b: { DEX: 3, AGI: 1 } },
  { n: '殲滅隊魔法戒指', g: '殲滅隊', s: 'acc', lv: 80, def: 0, b: { INT: 3, DEX: 1 } },
  { n: '殲滅隊項鍊', g: '殲滅隊', s: 'acc', lv: 80, def: 0, b: { INT: 3, VIT: 1 } },

  // ===== 90 等：征服者 =====
  { n: '征服者鎧甲', g: '征服者', s: 'armor', lv: 90, def: 76, ref: true, b: { STR: 2, AGI: 2, MHP: 900, MSP: 60, MDEF: 5 }, r: { 5: { DEF: 20, MHP: 100 }, 7: { AGI: 2 } } },
  { n: '征服者風衣', g: '征服者', s: 'armor', lv: 90, def: 71, ref: true, b: { DEX: 2, AGI: 2, MHP: 700, MSP: 80, MDEF: 5 }, r: { 5: { DEF: 20, MSP: 20 }, 7: { DEX: 2 } } },
  { n: '征服者外袍', g: '征服者', s: 'armor', lv: 90, def: 66, ref: true, b: { INT: 2, DEX: 2, MHP: 600, MSP: 90, MDEF: 5 }, r: { 5: { DEF: 15, MSP: 20 }, 7: { DEX: 2 } } },
  { n: '征服者制服', g: '征服者', s: 'armor', lv: 90, def: 65, ref: true, b: { INT: 2, VIT: 2, MHP: 800, MSP: 70, MDEF: 5 }, r: { 5: { DEF: 15, MHP: 100 }, 7: { VIT: 2 } } },
  { n: '征服者斗篷', g: '征服者', s: 'garment', lv: 90, def: 16, ref: true, b: { aspd: 7, FLEE: 18 }, r: { 5: { AGI: 1 }, 7: { crit: 4 } } },
  { n: '征服者偵查斗篷', g: '征服者', s: 'garment', lv: 90, def: 18, ref: true, b: { aspd: 5, FLEE: 25 }, r: { 5: { aspd: 2 }, 7: { ranged: 3 } } },
  { n: '征服者圍巾', g: '征服者', s: 'garment', lv: 90, def: 16, ref: true, b: { vct: 5, FLEE: 16 }, r: { 5: { vct: 4 }, 7: { vct: 3 } } },
  { n: '征服者披肩', g: '征服者', s: 'garment', lv: 90, def: 15, ref: true, b: { vct: 7, FLEE: 12 }, r: { 5: { neutral: 3 }, 7: { neutral: 4 } } },
  { n: '征服者重靴', g: '征服者', s: 'shoes', lv: 90, def: 24, ref: true, b: { hpRec: 20, spRec: 7 }, r: { 5: { STR: 2 }, 7: { MHP: 200 } } },
  { n: '征服者長靴', g: '征服者', s: 'shoes', lv: 90, def: 22, ref: true, b: { hpRec: 18, spRec: 9 }, r: { 5: { DEX: 2 }, 7: { FLEE: 20 } } },
  { n: '征服者鞋子', g: '征服者', s: 'shoes', lv: 90, def: 18, ref: true, b: { hpRec: 15, spRec: 12 }, r: { 5: { INT: 2 }, 7: { MATK: 20 } } },
  { n: '征服者魔法鞋子', g: '征服者', s: 'shoes', lv: 90, def: 17, ref: true, b: { hpRec: 17, spRec: 10 }, r: { 5: { heal: 2 }, 7: { heal: 4 } } },
  { n: '征服者戒指', g: '征服者', s: 'acc', lv: 90, def: 0, b: { STR: 3, AGI: 2 } },
  { n: '征服者手套', g: '征服者', s: 'acc', lv: 90, def: 0, b: { DEX: 3, AGI: 2 } },
  { n: '征服者魔法戒指', g: '征服者', s: 'acc', lv: 90, def: 0, b: { INT: 3, DEX: 2 } },
  { n: '征服者項鍊', g: '征服者', s: 'acc', lv: 90, def: 0, b: { INT: 3, VIT: 2 } },

  // ===== 110 等：征服者轉生（全部 1 洞、全職業；飾品可精煉）=====
  { n: '征服者轉生鎧甲', g: '征服者轉生', s: 'armor', lv: 110, def: 76, ref: true, b: { STR: 2, AGI: 2, MHP: 900, MSP: 60, MDEF: 5 }, r: { 5: { DEF: 20, MHP: 100 }, 7: { AGI: 2 } } },
  { n: '征服者轉生風衣', g: '征服者轉生', s: 'armor', lv: 110, def: 71, ref: true, b: { DEX: 2, AGI: 2, MHP: 700, MSP: 80, MDEF: 5 }, r: { 5: { DEF: 20, MSP: 20 }, 7: { DEX: 2 } } },
  { n: '征服者轉生外袍', g: '征服者轉生', s: 'armor', lv: 110, def: 66, ref: true, b: { INT: 2, DEX: 2, MHP: 600, MSP: 90, MDEF: 5 }, r: { 5: { DEF: 15, MSP: 20 }, 7: { DEX: 2 } } },
  { n: '征服者轉生制服', g: '征服者轉生', s: 'armor', lv: 110, def: 65, ref: true, b: { INT: 2, VIT: 2, MHP: 800, MSP: 70, MDEF: 5 }, r: { 5: { DEF: 15, MHP: 100 }, 7: { VIT: 2 } } },
  { n: '征服者轉生斗篷', g: '征服者轉生', s: 'garment', lv: 110, def: 20, ref: true, b: { aspd: 7, FLEE: 18 }, r: { 5: { AGI: 1 }, 7: { crit: 4 } } },
  { n: '征服者轉生偵查斗篷', g: '征服者轉生', s: 'garment', lv: 110, def: 18, ref: true, b: { aspd: 5, FLEE: 25 }, r: { 5: { aspd: 2 }, 7: { ranged: 3 } } },
  { n: '征服者轉生圍巾', g: '征服者轉生', s: 'garment', lv: 110, def: 16, ref: true, b: { vct: 5, FLEE: 16 }, r: { 5: { vct: 4 }, 7: { vct: 3 } } },
  { n: '征服者轉生披肩', g: '征服者轉生', s: 'garment', lv: 110, def: 15, ref: true, b: { vct: 7, FLEE: 12 }, r: { 5: { neutral: 3 }, 7: { neutral: 4 } } },
  { n: '征服者轉生重靴', g: '征服者轉生', s: 'shoes', lv: 110, def: 24, ref: true, b: { hpRec: 20, spRec: 7 }, r: { 5: { STR: 2 }, 7: { ATK: 20 } } },
  { n: '征服者轉生長靴', g: '征服者轉生', s: 'shoes', lv: 110, def: 22, ref: true, b: { hpRec: 18, spRec: 9 }, r: { 5: { DEX: 2 }, 7: { FLEE: 20 } } },
  { n: '征服者轉生鞋子', g: '征服者轉生', s: 'shoes', lv: 110, def: 18, ref: true, b: { hpRec: 15, spRec: 12 }, r: { 5: { INT: 2 }, 7: { MATK: 20 } } },
  { n: '征服者轉生魔法鞋子', g: '征服者轉生', s: 'shoes', lv: 110, def: 17, ref: true, b: { hpRec: 17, spRec: 10 }, r: { 5: { heal: 2 }, 7: { heal: 4 } } },
  { n: '征服者轉生戒指', g: '征服者轉生', s: 'acc', lv: 110, def: 0, ref: true, b: { STR: 3, AGI: 2 } },
  { n: '征服者轉生手套', g: '征服者轉生', s: 'acc', lv: 110, def: 0, ref: true, b: { DEX: 3, AGI: 2 } },
  { n: '征服者轉生魔法戒指', g: '征服者轉生', s: 'acc', lv: 110, def: 0, ref: true, b: { INT: 2, DEX: 1 } },
  { n: '征服者轉生項鍊', g: '征服者轉生', s: 'acc', lv: 110, def: 0, ref: true, b: { INT: 3, VIT: 2 } },
];

// 套裝：4 件同時裝備給 b；4 件精煉總和達到 sum[0] 再給 sum[1]
const GEAR_SETS = [];
(() => {
  const S = (g, label, names, b, sumN, sumB) => GEAR_SETS.push({ g, label, items: names.map(x => g + x), b, sum: [sumN, sumB] });
  S('征伐隊', '征伐隊', ['盔甲', '肩飾', '軍靴', '戒指'], { ATK: 15, MATK: 15 }, 17, { aspd: 3, vct: 5 });
  S('遠征隊', '遠征隊（物理）', ['鎧甲', '斗篷', '長靴', '戒指'], { ATK: 20 }, 21, { aspd: 5, fct: 5 });
  S('遠征隊', '遠征隊（魔法）', ['外袍', '圍巾', '鞋子', '魔法戒指'], { MATK: 20 }, 21, { vct: 5, fct: 5 });
  for (const [g, atk, n, s] of [['殲滅隊', 25, 25, 2], ['征服者', 30, 27, 4], ['征服者轉生', 30, 27, 4]]) {
    const big = g === '殲滅隊' ? { a: 5, r: 7, v: 7, f: 10 } : { a: 10, r: 10, v: 10, f: 15 };
    S(g, g + '（近戰）', ['鎧甲', '斗篷', '重靴', '戒指'], { ATK: atk }, n, { aspd: big.a, crit: s, fct: big.f });
    S(g, g + '（遠距）', ['風衣', '偵查斗篷', '長靴', '手套'], { ATK: atk }, n, { aspd: big.r, ranged: s, fct: big.f });
    S(g, g + '（魔法）', ['外袍', '圍巾', '鞋子', '魔法戒指'], { MATK: atk }, n, { MATKp: s, vct: big.v, fct: big.f });
    S(g, g + '（治癒）', ['制服', '披肩', '魔法鞋子', '項鍊'], { MATK: atk }, n, { heal: s, vct: big.v, fct: big.f });
  }
})();
