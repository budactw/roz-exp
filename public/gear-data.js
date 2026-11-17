// RO樂園 配裝模擬器資料（副本裝備）
// 來源：RO補給站 https://ro-zero-site.pages.dev/instances（副本裝備能力，該站標示核對日 2026-10-17）
//       星級武防：https://ro-zero-site.pages.dev/star-equipment；驚駭森靈巢穴：twROZ 2026/11/17 解檔（Divine Pride）
// 欄位：n 名稱、g 分類、s 部位（weapon 武器／weaponL 左手武器／shield 盾／headLow 頭下／armor 鎧甲／garment 披肩／shoes 鞋子／
//       accR 右飾品／accL 左飾品／acc 左右皆可）、lv 需求等級、def 防禦欄位、w 武器攻擊、wl 武器等級、type 武器種類、j 職業、ref 可精煉、
//       b 基本能力、r { 精煉門檻: 能力 }（+N 以上生效，逐條累加）、p2 每精煉 2 給一次、p11 +11 起每 +2 給一次（+11、+13…）、
//       t 文字效果（不列入加總）、w2 搭配效果 [{ with: [裝備], b, sum: [精煉總和, 能力] }]
//       能力裡的 _lv: [每 N 級, {能力}]＝BaseLv 每 N 級；_ps: [[素質, 每 N 點, {能力}], …]＝純素質每 N 點；_t: '文字'＝只顯示不加總
// 說明文字裡的「DEF+」推測已含在防禦欄位（例：各階鎧甲防禦扣掉 DEF+ 都是 26），所以不另外加。
const GEAR_STAT = [
  ['STR', 'STR'], ['AGI', 'AGI'], ['VIT', 'VIT'], ['INT', 'INT'], ['DEX', 'DEX'], ['LUK', 'LUK'],
  ['wATK', '武器攻擊'], ['refATK', '武器精煉攻擊'], ['ATK', 'ATK'], ['ATKp', 'ATK', '%'], ['MATK', 'MATK'], ['MATKp', 'MATK', '%'],
  ['MHP', 'MHP'], ['MHPp', 'MHP', '%'], ['MSP', 'MSP'], ['MSPp', 'MSP', '%'], ['DEF', '裝備防禦'], ['MDEF', 'MDEF'],
  ['HIT', 'HIT'], ['FLEE', 'FLEE'], ['CRI', 'CRI'],
  ['aspd', '攻擊後延遲', '%', -1], ['aspdP', '攻擊速度', '%'], ['aspdFlat', 'ASPD'], ['vct', '變動詠唱', '%', -1], ['fct', '固定詠唱', '%', -1],
  ['crit', '暴擊傷害', '%'], ['melee', '近距離物理傷害', '%'], ['ranged', '遠距離物理傷害', '%'],
  ['sizeAll', '對所有體型物理傷害', '%'], ['sizeAllM', '對所有體型魔法傷害', '%'], ['normal', '對一般敵人物理傷害', '%'], ['normalM', '對一般敵人魔法傷害', '%'],
  ['magicAll', '全屬性魔法傷害', '%'], ['fwMagic', '火、水屬性魔法傷害', '%'], ['critAtk', '必殺攻擊傷害', '%'],
  ['heal', '治癒術恢復量', '%'], ['healRecv', '受治癒量', '%'], ['spCost', 'SP 消耗量', '%'], ['neutral', '無屬性抗性', '%'],
  ['hpRec', 'HP 恢復量', '%'], ['spRec', 'SP 恢復力', '%'], ['hpRegen', 'HP 自然恢復速度', '%'], ['spRegen', 'SP 自然恢復速度', '%'],
];
// 部位：[key, 名稱, 可放的種類]
const GEAR_SLOTS = [
  ['weapon', '武器', ['weapon']], ['shield', '左手', ['shield', 'weaponL']], ['headLow', '頭飾（下）', ['headLow']],
  ['armor', '鎧甲', ['armor']], ['garment', '披肩', ['garment']], ['shoes', '鞋子', ['shoes']],
  ['accR', '飾品（右）', ['accR', 'acc']], ['accL', '飾品（左）', ['accL', 'acc']],
];
// 武器精煉 ATK：每 +1 / +16 以上每 +1 再加（依武器等級，官方精煉系統；過度精煉的浮動值不計）
const WEAPON_REFINE = { 1: [2, 16], 2: [3, 32], 3: [5, 54], 4: [8, 87] };

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

// ===== 星級武防（★／★★ 武器為二級武器）=====
(() => {
  const W = (n, type, w, lv, j, b, more) => GEAR_DB.push({ n, g: n.startsWith('★★') ? '★★ 武器' : '★ 武器', s: 'weapon', type, w, wl: 2, lv, j, ref: true, b, ...more });
  // ★★ 武器
  W('★★格林機槍-意', '格林機槍', 140, 10, '神槍手系列', { ATK: 70, MATK: 70, spCost: 100 }, { p2: { ATK: 7, MATK: 7, spCost: -20 }, r: { 7: { ATKp: 7, MATKp: 7 }, 9: { ranged: 15, fwMagic: 20 }, 11: { spCost: -20 } },
    t: ['遠距離普通攻擊時機率施放火箭術 Lv10、冰箭術 Lv10，並對自己施放心神凝聚 Lv5', '習得格林狂熱、魔術彈 Lv 總和 11：CRI+20、暴擊傷害+10%'] });
  W('★★霰彈槍-鎮', '霰彈槍', 210, 10, '神槍手系列', { ATK: 30, HIT: -60 }, { p2: { ATK: 5, ranged: 2, HIT: 12 }, r: { 7: { DEF: 50, vct: 8 }, 9: { DEF: 100, vct: 12 }, 11: { HIT: 12 } },
    t: ['使用彈片四射時再施放全面破壞 Lv1', '習得彈片四射、火力全開 Lv 總和 20：火力全開傷害+20%'] });
  W('★★來福槍-鷹', '來福槍', 150, 24, '神槍手系列', { ATK: 60, aspd: -30 }, { p2: { ATK: 5, ATKp: 2, aspd: 6 }, r: { 7: { FLEE: 20 }, 9: { ranged: 15 }, 11: { aspd: 6 } },
    t: ['使用百步穿楊時再施放拋戈卸甲 Lv5、霹靂彈 Lv5', '習得百步穿楊、拋戈卸甲、霹靂彈 Lv 總和 20：百步穿楊變動詠唱-50%、傷害+20%'] });
  W('★★賀勒拳套-氣', '拳套', 130, 12, '武道家系列', { ATK: 80, MDEF: -20, MSPp: -20 }, { p2: { ATK: 5, ranged: 2 }, r: { 7: { spCost: -15, ATKp: 2 }, 9: { spCost: -25, ATKp: 6 } }, p11: { MDEF: 4, MSPp: 6 },
    t: ['習得彈指神通 Lv5：攻擊時機率 3 秒內每秒恢復 SP 6'] });
  W('★★賀勒拳套-鬥', '拳套', 130, 12, '武道家系列', { ATK: 80, MDEF: -20, MSPp: -30 }, { p2: { ATK: 5, melee: 5 }, r: { 7: { aspd: 15 }, 9: { aspd: 20, aspdFlat: 2 } }, p11: { MDEF: 4, MSPp: 6 },
    t: ['習得六合拳、連環全身掌、猛龍誇強 Lv 達 20：近距離普通攻擊機率施放霸氣 Lv5'] });
  W('★★圓柄馬刀-域', '單手劍', 125, 14, '鍊金術師系列', { ATK: 25, HIT: -90 }, { p2: { DEF: 20, MDEF: 2 }, r: { 7: { FLEE: 10, MHP: 300 }, 9: { FLEE: 20, MHP: 450, MHPp: 6 } }, p11: { HIT: 18 },
    t: ['習得藥水投擲 Lv5：受到物理攻擊時機率 3 秒內每秒恢復 HP 150'] });
  W('★★圓柄馬刀-限', '單手劍', 125, 14, '鍊金術師系列', { ATK: 45, DEF: -60 }, { p2: { ATK: 5, ranged: 2 }, r: { 7: { HIT: 20, vct: 8 }, 9: { HIT: 35, vct: 12 } }, p11: { DEF: 12 },
    t: ['習得投擲火煙瓶 Lv10：施放強酸火煙瓶投擲時機率觸發火煙瓶'] });
  W('★★十字弓-鳴', '弓', 125, 18, '流氓系列', { MATK: 120, MHP: -500, FLEE: -60 }, { p2: { MATK: 5 }, r: { 7: { aspd: 15 }, 9: { aspd: 20, aspdFlat: 2 } }, p11: { MHP: 100, FLEE: 12 } });
  W('★★十字弓-靈', '弓', 125, 18, '獵人系列', { ATK: 40, CRI: -60 }, { p2: { LUK: 10 }, r: { 7: { aspd: 15 }, 9: { aspd: 20, aspdFlat: 2 } }, p11: { CRI: 12 },
    t: ['習得閃電衝擊 Lv5：遠距離普通攻擊機率施放閃電衝擊 Lv5'] });
  W('★★破刃長戟-貫', '單手矛', 150, 18, '十字軍系列', { ATK: 60, CRI: -90 }, { p2: { ATK: 5, melee: 2 }, r: { 7: { HIT: 20, MHP: 250 }, 9: { HIT: 35, MHP: 400, MHPp: 6 } }, p11: { CRI: 18 },
    t: ['習得連續盾擊 Lv5：變動詠唱-5%'] });
  W('★★破刃長戟-祝', '單手矛', 150, 18, '十字軍系列', { MATK: 40, CRI: -90 }, { p2: { MATKp: 2 }, r: { 7: { vct: 10, MATK: 30 }, 9: { vct: 15, MATK: 50 } }, p11: { CRI: 18 },
    t: ['習得聖十字審判 Lv10：MATK+100、施放後 3 秒內每秒恢復 HP 2500', '習得神之威壓 Lv5：MATK+8%'] });
  W('★★雙手劍-牙', '雙手劍', 210, 18, '騎士系列', { ATK: 60, HIT: -150, FLEE: -90, MHPp: -10 }, { p2: { ATK: 5, melee: 3 }, r: { 7: { CRI: 15, aspd: 25, crit: 20 }, 9: { CRI: 25, aspdFlat: 2, crit: 40 } }, p11: { HIT: 30, FLEE: 18, MHPp: 2 },
    t: ['習得雙手劍攻擊速度增加、雙劍格擋、雙手劍使用熟練度 Lv 達 30：習得二刀連擊 Lv7'] });
  W('★★雙手劍-疾', '雙手劍', 210, 18, '騎士系列', { ATK: 40, HIT: -100, FLEE: -40 }, { p2: { ATK: 5, melee: 2 }, r: { 7: { CRI: 10, aspd: 10, crit: 10 }, 9: { CRI: 20, aspd: 15, crit: 30 } }, p11: { HIT: 20, FLEE: 8 },
    t: ['習得雙手劍攻擊速度增加、雙劍格擋、雙手劍使用熟練度 Lv 達 30：習得二刀連擊 Lv5'] });
  const bard = (n, type, w, lv, j, a) => W(n, type, w, lv, j, a ? { ATK: 50, FLEE: -80, DEF: -40 } : { ATK: 50, FLEE: -40, DEF: -80 }, a
    ? { p2: { ATK: 5, ranged: 3 }, r: { 7: { MDEF: 10, MHPp: 2 }, 9: { MDEF: 15, MHPp: 3 } }, p11: { FLEE: 16, DEF: 8 }, t: ['受物理傷害時機率對敵人施放奧義箭亂舞 Lv1（依習得最高等級）'] }
    : { p2: { ATK: 5, ranged: 2 }, r: { 7: { aspd: 10, MHP: 200 }, 9: { aspd: 15, MHP: 300 } }, p11: { FLEE: 8, DEF: 16 }, t: ['近距離普通攻擊時機率施放奧義箭亂舞 Lv1（依習得最高等級）'] });
  bard('★★魯特琴-響', '樂器', 125, 14, '吟遊詩人系列', true);
  bard('★★魯特琴-歌', '樂器', 125, 14, '吟遊詩人系列', false);
  bard('★★鋼鐵鞭子-散', '鞭子', 115, 16, '舞孃系列', true);
  bard('★★鋼鐵鞭子-纏', '鞭子', 115, 16, '舞孃系列', false);
  W('★★橡木魔杖-游', '單手杖', 25, 12, '巫師系列', { MATK: 170, spCost: 60, MHP: -1000 }, { p2: { MATKp: 1, MSPp: 2, FLEE: 5 }, r: { 7: { spCost: -10, vct: 3 }, 9: { spCost: -20, vct: 7 } }, p11: { spCost: -12, MHP: 200 },
    t: ['習得吸魂術 Lv10：固定詠唱-15%'] });
  W('★★橡木魔杖-迴', '單手杖', 25, 12, '巫師系列', { MATK: 140, spCost: 120, vct: -50 }, { p2: { INT: 1, magicAll: 2 }, r: { 7: { spCost: -5, vct: 5 }, 9: { spCost: -10, vct: 10 } }, p11: { spCost: -12, vct: 5 },
    t: ['習得暴風雪、隕石術、怒雷強擊、重力原野、霜凍之術 Lv 總和 45：MATK+12%'] });
  W('★★拳刃-滅', '拳刃', 155, 18, '刺客系列', { ATK: 60, HIT: -200, ranged: -100 }, { p2: { ATK: 6, melee: 3 }, r: { 7: { CRI: 8, aspd: 11, crit: 5 }, 9: { CRI: 16, aspd: 22, crit: 10 } }, p11: { HIT: 20, ranged: 10 },
    t: ['習得學習修練、高階拳刃修練、致命塗毒 Lv 總和 20：可使用二刀連擊 Lv1'] });
  W('★★拳刃-死', '拳刃', 155, 18, '刺客系列', { ATK: 60, HIT: -100, ranged: -40 }, { p2: { ATK: 5, melee: 2 }, r: { 7: { CRI: 7, aspd: 14, FLEE: 5 }, 9: { CRI: 14, aspd: 28, FLEE: 10 } }, p11: { HIT: 20, ranged: 8 },
    t: ['習得學習修練、高階拳刃修練、致命塗毒 Lv 總和 20：可使用二刀連擊 Lv1'] });
  GEAR_DB.push({ n: '★★改良型手臂護腕-月', g: '★★ 武器', s: 'shield', type: '盾牌', def: 45, lv: 50, j: '忍者', ref: true, b: { MDEF: 5, MATK: 10, INT: 5, FLEE: -120 },
    p2: { MATK: 5, _t: '對地／火／風／水屬性敵人魔法傷害+2%' }, r: { 7: { _t: '對地／火／風／水屬性敵人魔法傷害再+5%' }, 9: { MATKp: 5, magicAll: 7 } }, p11: { FLEE: 24 },
    t: ['習得忍術修練、金蟬脫殼 Lv 合計 15：忍術系列技能 SP 消耗-50%'] });
  GEAR_DB.push({ n: '★★改良型手臂護腕-日', g: '★★ 武器', s: 'shield', type: '盾牌', def: 45, lv: 50, j: '忍者', ref: true, b: { MDEF: 5, ATK: 10, STR: 5, FLEE: -120 },
    p2: { ATK: 5, _t: '對地／火／風／水屬性敵人物理傷害+2%' }, r: { 7: { _t: '對地／火／風／水屬性敵人物理傷害再+5%' }, 9: { ATKp: 5, ranged: 7 } }, p11: { FLEE: 24 },
    t: ['習得忍術修練、飛刀修練、投擲飛鏢、投擲飛刀、投擲風魔飛鏢 Lv 合計 40：投擲系列技能 SP 消耗-50%'] });
  // ★ 武器
  const S3 = (a, b, c) => ({ r: { 3: a, 7: b, 9: c } });
  W('★格林機槍', '格林機槍', 120, 10, '神槍手系列', { ATK: 20, MATK: 20, spCost: 20 }, S3({ ATK: 3, MATK: 3 }, { ATK: 5, MATK: 5 }, { ATKp: 3, MATKp: 3, ranged: 5 }));
  W('★霰彈槍', '霰彈槍', 190, 10, '神槍手系列', { ATK: 10, HIT: -40 }, S3({ ATK: 5, ranged: 2 }, { DEF: 20, vct: 3 }, { DEF: 30, vct: 5 }));
  W('★來福槍', '來福槍', 130, 10, '神槍手系列', { ATK: 20, aspd: -10 }, S3({ ATK: 5, ATKp: 1 }, { FLEE: 15 }, { ranged: 5 }));
  W('★橡木魔杖', '單手杖', 25, 12, '初學者／魔法師系列／服事系列', { MATK: 125, spCost: 20 }, S3({ spCost: -1, heal: 1 }, { spCost: -3, heal: 3 }, { spCost: -6, heal: 6 }));
  W('★鏈錘', '鈍器', 140, 14, '劍士／商人／服事系列', { ATK: 18, DEF: -90 }, S3({ DEF: 10, aspdP: 3 }, { DEF: 20, aspdP: 7 }, { DEF: 35, aspdP: 15 }));
  W('★雙刃短劍', '短劍', 143, 12, '初學者／劍士／弓箭手／盜賊／魔法師／商人', { ATK: 20, MATK: 60, FLEE: -50 }, S3({ FLEE: 3, CRI: 3 }, { FLEE: 7, CRI: 7 }, { FLEE: 10, CRI: 15 }));
  W('★鋼斧', '雙手斧', 215, 16, '劍士／商人系列', { ATK: 30, DEF: -90 }, S3({ DEF: 10, CRI: 3 }, { DEF: 20, CRI: 7 }, { DEF: 35, CRI: 15 }));
  W('★十字弓', '弓', 125, 18, '盜賊／弓箭手系列', { ATK: 20, MATK: 100, MHP: -350 }, S3({ MHP: 25, LUK: 3 }, { MHP: 75, LUK: 7 }, { MHP: 100, LUK: 20 }));
  W('★亞爾特劍', '雙手劍', 190, 18, '劍士系列', { ATK: 20, MDEF: -20 }, S3({ MDEF: 1, HIT: 10 }, { MDEF: 3, HIT: 15 }, { MDEF: 6, HIT: 20 }));
  W('★思麥斯鐵錘', '鈍器', 100, 14, '商人系列', { ATK: 20, HIT: 60 }, S3({ HIT: 3, INT: 1, DEX: 1 }, { HIT: 7, INT: 1, DEX: 1, LUK: 1 }, { HIT: 10, INT: 1, DEX: 2, LUK: 2 }));
  W('★克羅伊特弓', '弓', 125, 18, '弓箭手系列', { ATK: 20, spCost: 50 }, S3({ spCost: -3, INT: 3, FLEE: 3 }, { spCost: -7, INT: 7, FLEE: 7 }, { spCost: -20, INT: 20, FLEE: 15 }));
  W('★圓柄馬刀', '單手劍', 125, 14, '劍士／商人／盜賊系列', { ATK: 25, CRI: -30 }, S3({ HIT: 10, MHP: 100 }, { HIT: 15, MHP: 150 }, { HIT: 20, MHP: 200, MHPp: 3 }));
  W('★雙手劍', '雙手劍', 190, 18, '劍士系列', { ATK: 20, HIT: -30, FLEE: -60 }, S3({ CRI: 3, aspdP: 3 }, { CRI: 5, aspdP: 7 }, { CRI: 7, aspdP: 15 }));
  W('★書', '書', 85, 14, '魔法師／服事系列', { MATK: 125, vct: -30, _t: '攻擊距離 3 格' }, S3({ vct: 3, aspdP: 3 }, { vct: 7, aspdP: 7 }, { vct: 10, aspdP: 15, aspdFlat: 2 }));
  W('★魯特琴', '樂器', 125, 14, '吟遊詩人系列', { ATK: 20, HIT: -60, DEF: -40 }, S3({ vct: 2, MHP: 75 }, { vct: 2, MHP: 125 }, { vct: 6, MHP: 200 }));
  W('★鋼鐵鞭子', '鞭子', 115, 16, '舞孃系列', { ATK: 20, HIT: -40, DEF: -60 }, S3({ vct: 2, MHP: 75 }, { vct: 2, MHP: 125 }, { vct: 6, MHP: 200 }));
  W('★賀勒拳套', '拳套', 120, 12, '武道家系列', { ATK: 60, MDEF: -20, MHP: -300 }, S3({ aspdP: 5, spCost: -5 }, { aspdP: 10, spCost: -10 }, { aspdP: 20, spCost: -25 }));
  W('★彎刃長矛', '雙手矛', 160, 18, '劍士系列', { ATK: 40, VIT: -10 }, S3({ vct: 2, HIT: 5 }, { vct: 2, HIT: 10 }, { vct: 6, HIT: 30 }));
  W('★破刃長戟', '單手矛', 150, 18, '十字軍系列', { ATK: 30, CRI: -40 }, S3({ vct: 2, MATK: 20 }, { vct: 4, MATK: 40 }, { vct: 9, MATK: 90 }));
  W('★拳刃', '拳刃', 155, 18, '刺客系列', { ATK: 30, HIT: -70 }, S3({ CRI: 2, aspdP: 5 }, { CRI: 3, aspdP: 10 }, { CRI: 5, aspdP: 15 }));
  // ★ 防具（說明裡的基本 DEF+ 視為已含在防禦欄位）
  const A = (n, s, def, b, more) => GEAR_DB.push({ n, g: '★ 防具', s, def, lv: 1, ref: true, b, ...more });
  A('★輕便鞋', 'shoes', 15, { MHP: 100, spRegen: 5 }, S3({ MHP: 200, spRegen: 5 }, { MHP: 350, spRegen: 10 }, { MHPp: 8, healRecv: 10 }));
  A('★戰士長靴', 'shoes', 25, { MHP: 100, hpRegen: 5 }, S3({ MHP: 200, hpRegen: 5 }, { MHP: 350, hpRegen: 10 }, { MHPp: 8, healRecv: 10 }));
  A('★披肩', 'garment', 16, { MHP: 100, spRegen: 20 }, S3({ MHP: 200, MSPp: 1 }, { MHP: 250, MSPp: 2 }, { MHP: 450, MSPp: 4 }));
  A('★連帽披肩', 'garment', 8, { MHP: 100, hpRegen: 20 }, S3({ MHP: 200, MHPp: 1 }, { MHP: 250, MHPp: 2 }, { MHP: 450, MHPp: 4 }));
  A('★皮製外套', 'armor', 50, { MHP: 250, MSP: 20, FLEE: 5 }, { p2: { MHP: 100 }, ...S3({ MHP: 50, FLEE: 3 }, { MHP: 150, FLEE: 5 }, { MHP: 350, FLEE: 12 }) });
  A('★長大衣', 'armor', 60, { MHP: 150, MSP: 50, MDEF: 5 }, { p2: { MHP: 200, MDEF: 2 }, ...S3({ MHP: 100, MSP: 20 }, { MHP: 200, MSP: 25 }, { MHP: 400, MSP: 35, MSPp: 5 }) });
  A('★鋼鐵鎖子甲', 'armor', 75, { MHP: 300, MDEF: 2 }, { p2: { MHP: 200, DEF: 5 }, ...S3({ MHP: 200, DEF: 30 }, { MHP: 450, DEF: 40 }, { MHP: 1000, MHPp: 7, DEF: 70 }) });
})();

// ===== 驚駭森靈巢穴（twROZ 2026/11/17）=====
(() => {
  const G = '驚駭森靈巢穴', BREATH = '巨神蟒的氣息';
  const W = (n, type, w, wl, lv, j, b, more) => GEAR_DB.push({ n, g: G, s: 'weapon', type, w, wl, lv, j, ref: true, b, ...more });
  W('驚駭森靈皇后的殘肢(R)', '短劍', 150, 4, 110, '刺客系列', {}, { t: ['黑暗瞬間每 Lv：ATK+2', '黑暗瞬間傷害+5%'], r: { 7: { ATKp: 5, aspd: 10 }, 9: { _t: '黑暗瞬間傷害+10%' } },
    w2: [{ with: [BREATH, '巨神蟒蛇皮（刺客）'], b: { _t: '每 Base Lv 20，黑暗瞬間傷害+5%' } }] });
  GEAR_DB.push({ n: '驚駭森靈皇后的殘肢(L)', g: G, s: 'weaponL', type: '短劍（左手）', w: 75, wl: 2, lv: 110, j: '刺客系列', ref: true, b: {},
    t: ['黑暗瞬間每 Lv：ATK+2', '黑暗瞬間傷害+5%'], r: { 7: { ATKp: 5, aspd: 10 }, 9: { _t: '黑暗瞬間傷害+10%' } },
    w2: [{ with: ['驚駭森靈皇后的殘肢(R)'], b: { ATKp: 3, aspd: 7 }, sum: [18, { _t: '黑暗瞬間傷害+10%' }] }] });
  W('驚駭森靈的殘肢', '短劍', 110, 3, 90, '初學者／劍士／弓箭手／盜賊／魔法師／商人／忍者系列', { ATK: 20, melee: 5 }, { r: { 7: { MATK: 50, aspd: 10 }, 9: { melee: 10 } } });
  W('驚駭森靈皇后的犬齒', '拳刃', 232, 4, 110, '刺客系列', {}, { t: ['拳刃修練每 Lv：暴擊傷害+1%', '音速投擲傷害+30%'], r: { 7: { ATKp: 5, aspd: 10 }, 9: { CRI: 5, crit: 5 } },
    w2: [{ with: [BREATH, '巨神蟒蛇皮（刺客）'], b: { _t: '觸發二刀連擊 Lv1（依習得最高等級）' } }] });
  W('驚駭森靈皇后的角', '雙手矛', 270, 4, 110, '騎士系列', {}, { t: ['螺旋擊刺每 Lv：ATK+6', '螺旋擊刺傷害+30%'], r: { 7: { STR: 3, aspd: 10 }, 9: { ATKp: 5, HIT: 20 } },
    w2: [{ with: [BREATH, '巨神蟒蛇皮（騎士）'], b: { _t: '每 Base Lv 10，螺旋擊刺傷害+5%' } }] });
  W('驚駭森靈皇后的尖刺', '單手矛', 175, 4, 110, '十字軍系列', {}, { t: ['聖十字攻擊每 Lv：ATK+3', '聖十字攻擊傷害+30%'], r: { 7: { STR: 3, aspd: 10 }, 9: { ATKp: 5, HIT: 20 } },
    w2: [{ with: [BREATH, '巨神蟒蛇皮（十字軍）'], b: { _t: '每 Base Lv 10，聖十字攻擊傷害+5%' } }] });
  W('驚駭森靈皇后的尾骨', '雙手劍', 272, 4, 110, '騎士系列', {}, { t: ['怪物互擊每 Lv：ATK+3', '怪物互擊傷害+30%'], r: { 7: { STR: 3, aspd: 10 }, 9: { ATKp: 5, HIT: 20 } },
    w2: [{ with: [BREATH, '巨神蟒蛇皮（騎士）'], b: { _t: '每 Base Lv 10，怪物互擊傷害+5%' } }] });
  GEAR_DB.push({ n: BREATH, g: G, s: 'headLow', def: 2, lv: 110, b: { _t: '火屬性魔法傷害+1%' } });
  GEAR_DB.push({ n: '巨神蟒蛇皮', g: G, s: 'garment', def: 48, lv: 110, b: { MDEF: 10 }, t: ['不可精煉；放進次元的箱子可變成職業版'] });
  // 職業版巨神蟒蛇皮：防禦 38、1 洞；每精煉 2：ATK+10（魔法職 MATK+10）、MHP+100、MSP+10；搭配巨神蟒的氣息：MHP+10%、MSP+5%
  const C = (job, b, p3, r7, r9, ps, magic) => GEAR_DB.push({ n: `巨神蟒蛇皮（${job}）`, g: G, s: 'garment', def: 38, lv: 110, j: job + '系列', ref: true,
    b: { ...b, _ps: ps }, p2: { [magic ? 'MATK' : 'ATK']: 10, MHP: 100, MSP: 10 }, p3, r: { 7: r7, 9: r9 }, w2: [{ with: [BREATH], b: { MHPp: 10, MSPp: 5 } }] });
  const N9 = { normal: 10 }, M9 = { normalM: 10 };
  const sATK = ['STR', 30, { ATK: 6 }], sAGI = ['AGI', 30, { aspd: 3 }], sLUK = ['LUK', 30, { crit: 3 }], sVIT = ['VIT', 30, { MHP: 200 }],
    sINT = ['INT', 30, { MATK: 6 }], sDEX = ['DEX', 30, { ranged: 3 }], sDEXc = ['DEX', 30, { vct: 3 }];
  C('騎士', { ATK: 10 }, { aspd: 2, ranged: 1 }, { sizeAll: 5 }, N9, [sATK, sAGI, sLUK]);
  C('十字軍', { ATK: 10 }, { aspd: 2, ranged: 1 }, { MHPp: 5, VIT: 5 }, N9, [sATK, sINT, sVIT]);
  C('鐵匠', { ATK: 10 }, { aspd: 2, melee: 1 }, { sizeAll: 5, crit: 7 }, N9, [sATK, sAGI, sLUK]);
  C('鍊金術師', { MSP: 70 }, { aspd: 2, melee: 1 }, { sizeAll: 5 }, N9, [sATK, sVIT, sAGI]);
  C('刺客', { CRI: 5 }, { aspd: 2, melee: 1 }, { crit: 7 }, N9, [sATK, sAGI, sLUK]);
  C('流氓', { ATK: 10 }, { aspd: 2, melee: 1 }, { sizeAll: 5 }, N9, [sATK, sAGI, sDEX]);
  C('武道家', { ATK: 10 }, { aspd: 2, melee: 1 }, { MSPp: 5 }, N9, [sATK, sVIT, sAGI]);
  C('巫師', { vct: 5 }, { MATKp: 1 }, { sizeAllM: 5 }, M9, [sINT, sVIT, sDEXc], true);
  C('賢者', { vct: 5 }, { MATKp: 1 }, { sizeAllM: 5, MHP: 300 }, M9, [sINT, sVIT, sDEXc], true);
  C('祭司', { vct: 5 }, { MATKp: 1 }, { sizeAllM: 5, MHP: 300 }, M9, [sINT, sVIT, ['AGI', 30, { _t: '聖屬性魔法傷害+3%' }]], true);
  C('獵人', { ATK: 10 }, { ranged: 1 }, { _t: '弓攻擊力+10%' }, N9, [sATK, sAGI, sDEX]);
  C('吟遊詩人', { ATK: 10 }, { ranged: 1 }, { sizeAll: 5 }, N9, [sATK, sAGI, sDEX]);
  C('舞孃', { ATK: 10 }, { ranged: 1 }, { sizeAll: 5 }, N9, [sATK, sAGI, sDEX]);
  C('忍者', { MHP: 300 }, { MATKp: 1, ranged: 1 }, { sizeAll: 5, sizeAllM: 5 }, { normal: 10, normalM: 10 }, [sATK, sINT, sVIT]);
  C('神槍手', { ATK: 10 }, { ranged: 1 }, { sizeAll: 5 }, N9, [sATK, sAGI, sDEX]);
})();
