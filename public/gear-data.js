// RO樂園 配裝模擬器資料（副本裝備）
// 來源：RO補給站 https://ro-zero-site.pages.dev/instances（副本裝備能力，該站標示核對日 2026-10-17）
//       星級武防：https://ro-zero-site.pages.dev/star-equipment；驚駭森靈巢穴：twROZ 2026/11/17 解檔（Divine Pride）
// 欄位：n 名稱、g 分類、s 部位（weapon 武器／weaponL 左手武器／shield 盾／headLow 頭下／armor 鎧甲／garment 披肩／shoes 鞋子／
//       accR 右飾品／accL 左飾品／acc 左右皆可）、lv 需求等級、def 防禦欄位、w 武器攻擊、wl 武器等級、type 武器種類、j 職業、ref 可精煉、
//       b 基本能力、r { 精煉門檻: 能力 }（+N 以上生效，逐條累加）、p2 每精煉 2 給一次、p11 +11 起每 +2 給一次（+11、+13…）、
//       occ 同時佔用的其他部位、t 文字效果（不列入加總）、w2 搭配效果 [{ with: [裝備], b, sum: [精煉總和, 能力] }]
//       能力裡的 _lv: [每 N 級, {能力}]＝BaseLv 每 N 級；_ps: [[素質, 每 N 點, {能力}], …]＝純素質每 N 點；_t: '文字'＝只顯示不加總
// 說明文字裡的「DEF+」推測已含在防禦欄位（例：各階鎧甲防禦扣掉 DEF+ 都是 26），所以不另外加。
const GEAR_STAT = [
  ['STR', 'STR'], ['AGI', 'AGI'], ['VIT', 'VIT'], ['INT', 'INT'], ['DEX', 'DEX'], ['LUK', 'LUK'],
  ['wATK', '武器本身攻擊（ATK）'], ['refATK', '武器精煉（ATK／MATK）'], ['ATK', 'ATK'], ['ATKp', 'ATK', '%'], ['MATK', 'MATK'], ['MATKp', 'MATK', '%'],
  ['MHP', 'MHP'], ['MHPp', 'MHP', '%'], ['MSP', 'MSP'], ['MSPp', 'MSP', '%'], ['DEF', '裝備防禦'], ['MDEF', 'MDEF'],
  ['HIT', 'HIT'], ['FLEE', 'FLEE'], ['CRI', 'CRI'],
  ['aspd', '攻擊後延遲', '%', -1], ['aspdP', '攻擊速度', '%'], ['aspdFlat', 'ASPD'], ['vct', '變動詠唱', '%', -1], ['fct', '固定詠唱', '%', -1],
  ['crit', '暴擊傷害', '%'], ['melee', '近距離物理傷害', '%'], ['ranged', '遠距離物理傷害', '%'],
  ['sizeAll', '對所有體型物理傷害', '%'], ['sizeAllM', '對所有體型魔法傷害', '%'], ['normal', '對一般敵人物理傷害', '%'], ['normalM', '對一般敵人魔法傷害', '%'],
  ['elemAll', '對全屬性敵人物理傷害', '%'], ['elemAllM', '對全屬性敵人魔法傷害', '%'],
  ['magicAll', '全屬性魔法傷害', '%'], ['fwMagic', '火、水屬性魔法傷害', '%'], ['critAtk', '必殺攻擊傷害', '%'],
  ['heal', '治癒術恢復量', '%'], ['healRecv', '受治癒量', '%'], ['spCost', 'SP 消耗量', '%'], ['neutral', '無屬性抗性', '%'],
  ['hpRec', 'HP 恢復量', '%'], ['spRec', 'SP 恢復力', '%'], ['hpRegen', 'HP 自然恢復速度', '%'], ['spRegen', 'SP 自然恢復速度', '%'],
];
// 部位：[key, 名稱, 可放的種類]
const GEAR_SLOTS = [
  ['weapon', '武器', ['weapon']], ['shield', '左手', ['shield', 'weaponL']],
  ['headTop', '頭飾（上）', ['headTop']], ['headMid', '頭飾（中）', ['headMid']], ['headLow', '頭飾（下）', ['headLow']],
  ['armor', '鎧甲', ['armor']], ['garment', '披肩', ['garment']], ['shoes', '鞋子', ['shoes']],
  ['accR', '飾品（右）', ['accR', 'acc']], ['accL', '飾品（左）', ['accL', 'acc']],
];
// 武器精煉 ATK：每 +1 / +16 以上每 +1 再加（依武器等級，官方精煉系統；過度精煉的浮動值不計）
const WEAPON_REFINE = { 1: [2, 16], 2: [3, 32], 3: [5, 54], 4: [8, 87] };
// 過度精煉：從 +N 起每 +1 隨機加 1～M（依武器等級，官方精煉系統）
const WEAPON_OVER = { 1: [8, 3], 2: [7, 5], 3: [6, 8], 4: [6, 14] };

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
  const W = (n, type, w, lv, j, b, more) => GEAR_DB.push({ n, g: n.startsWith('★★') ? '二星武器' : '一星武器', s: 'weapon', type, w, wl: 2, lv, j, ref: true, b, ...more });
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
  GEAR_DB.push({ n: '★★改良型手臂護腕-月', g: '二星武器', s: 'shield', type: '盾牌', def: 45, lv: 50, j: '忍者', ref: true, b: { MDEF: 5, MATK: 10, INT: 5, FLEE: -120 },
    p2: { MATK: 5, _t: '對地／火／風／水屬性敵人魔法傷害+2%' }, r: { 7: { _t: '對地／火／風／水屬性敵人魔法傷害再+5%' }, 9: { MATKp: 5, magicAll: 7 } }, p11: { FLEE: 24 },
    t: ['習得忍術修練、金蟬脫殼 Lv 合計 15：忍術系列技能 SP 消耗-50%'] });
  GEAR_DB.push({ n: '★★改良型手臂護腕-日', g: '二星武器', s: 'shield', type: '盾牌', def: 45, lv: 50, j: '忍者', ref: true, b: { MDEF: 5, ATK: 10, STR: 5, FLEE: -120 },
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
  const A = (n, s, def, b, more) => GEAR_DB.push({ n, g: '一星防具', s, def, lv: 1, ref: true, b, ...more });
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
  // 搭配效果改成套裝（可一鍵套用）；左右殘肢的精煉總和留在殘肢(L)
  for (const it of GEAR_DB) if (it.g === G && it.n !== '驚駭森靈皇后的殘肢(L)') delete it.w2;
  const JOBS15 = ['騎士', '十字軍', '鐵匠', '鍊金術師', '刺客', '流氓', '武道家', '巫師', '賢者', '祭司', '獵人', '吟遊詩人', '舞孃', '忍者', '神槍手'];
  for (const j of JOBS15) GEAR_SETS.push({ g: G, label: `驚駭森靈（${j}）`, items: [BREATH, `巨神蟒蛇皮（${j}）`], b: { MHPp: 10, MSPp: 5 } });
  const WS = (label, weapons, job, t) => GEAR_SETS.push({ g: G, label, items: [...weapons, BREATH, `巨神蟒蛇皮（${job}）`], b: Array.isArray(t) ? { _lv: [t[0], { _c: { [t[1]]: 5 } }] } : { _t: t } });
  WS('驚駭森靈（刺客・左右殘肢）', ['驚駭森靈皇后的殘肢(R)', '驚駭森靈皇后的殘肢(L)'], '刺客', [20, '黑暗瞬間傷害']);
  WS('驚駭森靈（刺客・犬齒）', ['驚駭森靈皇后的犬齒'], '刺客', '觸發二刀連擊 Lv1（依習得最高等級）');
  WS('驚駭森靈（騎士・角）', ['驚駭森靈皇后的角'], '騎士', [10, '螺旋擊刺傷害']);
  WS('驚駭森靈（騎士・尾骨）', ['驚駭森靈皇后的尾骨'], '騎士', [10, '怪物互擊傷害']);
  WS('驚駭森靈（十字軍・尖刺）', ['驚駭森靈皇后的尖刺'], '十字軍', [10, '聖十字攻擊傷害']);
})();

// ===== 特色裝備（王頭與各地製作裝備；RO補給站「特色裝備」）=====
(() => {
  const H = (n, area, s, def, lv, b, more) => GEAR_DB.push({ n, g: area, s, def, lv, ref: true, b, ...more });
  // 普隆德拉（佩布羅斯 paraml 23/185）
  H('藏鏡人帽', '普隆德拉', 'headTop', 2, 60, {}, { occ: ['headMid'], p2: { AGI: 1, LUK: 1 }, r: { 7: { aspd: 5 }, 9: { CRI: 5, aspd: 5 } } });
  H('卡利斯格騎士團頭盔', '普隆德拉', 'headTop', 10, 60, { CRI: 3 }, { r: { 7: { crit: 5 }, 9: { crit: 5 } } });
  H('愛麗絲假髮', '普隆德拉', 'headTop', 10, 60, {}, { p2: { heal: 3 }, r: { 7: { MHP: 150, MSP: 50 }, 9: { vct: 5 } } });
  H('艾爾帕蘭時鐘帽', '普隆德拉', 'headTop', 10, 60, {}, { p2: { _t: '對無形魔物的物理傷害+1%' }, r: { 7: { HIT: 15 }, 9: { MHP: 250 } } });
  H('神祕女巫帽', '普隆德拉', 'headTop', 10, 60, {}, { r: { 2: { MATKp: 1 }, 7: { MHP: 50, MSP: 100 }, 9: { vct: 5 } } });
  H('南瓜魂連帽披肩', '普隆德拉', 'headTop', 5, 60, {}, { p2: { _t: '對惡魔型魔物的物理傷害+1%' }, r: { 7: { HIT: 15 }, 9: { MHP: 250 } } });
  H('南瓜魂面具', '普隆德拉', 'headMid', 2, 60, { _t: '暗屬性攻擊抗性+2%' }, { occ: ['headLow'], ref: false });
  // 艾爾帕蘭（帽子商人 aldebaran 130/140）
  H('鐘塔守護者耳機', '艾爾帕蘭', 'headMid', 10, 60, { MATK: 20 }, { ref: false, t: ['與「鐘塔守護者卡片」同時裝備：變動詠唱-15%、移動速度增加'] });
  H('懷錶髮飾', '艾爾帕蘭', 'headMid', 10, 60, { ATK: 20 }, { ref: false, t: ['與「古鐘魔卡片」同時裝備：DEF+20、MSP+100', '與「鐘怪卡片」同時裝備：MHP+1000'] });
  // 崑崙（掃墨人 猛牛 gonryun 137/110）
  H('墨蛇君帽冕(魔攻)', '崑崙', 'headTop', 10, 90, { MATKp: 3, vct: 4 }, { p2: { MATK: 7 }, r: { 7: { magicAll: 5 }, 9: { MATKp: 7 } } });
  H('墨蛇君帽冕(武攻)', '崑崙', 'headTop', 10, 90, { ATKp: 5 }, { p2: { ATK: 10 }, r: { 7: { melee: 5, ranged: 5 }, 9: { ATKp: 10 } } });
  H('墨蛇君披巾(魔攻)', '崑崙', 'headLow', 0, 90, { INT: 2, MATK: 15 }, { ref: false, w2: [{ with: ['墨蛇君帽冕(魔攻)'], b: { vct: 6, magicAll: 5 } }] });
  H('墨蛇君披巾(武攻)', '崑崙', 'headLow', 0, 90, { STR: 2, ATK: 20 }, { ref: false, w2: [{ with: ['墨蛇君帽冕(武攻)'], b: { melee: 5, ranged: 5 } }] });
  // 洛陽（召天 louyang 186/54）
  H('懶洋洋白素貞娃娃-體魄', '洛陽', 'headTop', 10, 90, { hpRegen: 10 }, { p2: { hpRegen: 5 }, r: { 7: { hpRegen: 15 }, 9: { _t: '受到物理／魔法攻擊時，一定機率 10 秒內每秒恢復 HP 15' } } });
  H('懶洋洋白素貞娃娃-心智', '洛陽', 'headTop', 10, 90, { spRegen: 10 }, { p2: { spRegen: 5 }, r: { 7: { spRegen: 15 }, 9: { _t: '受到物理／魔法攻擊時，一定機率 10 秒內每秒恢復 SP 4' } } });
  H('小青的丸子頭飾', '洛陽', 'headTop', 0, 90, { AGI: 3, LUK: 3 }, { p1: { CRI: 1 } });
  // 哎喲泰雅（裁縫師大丸 ayothaya 201/190）
  H('古代王的帽子-禦擊', '哎喲泰雅', 'headTop', 15, 90, {}, { p2: { MHP: 100, MHPp: 1 }, r: { 7: { _t: '受到全體型敵人的物理傷害-5%' }, 9: { MHP: 1000, MHPp: 5, _t: '受到全體型敵人的物理傷害再-10%' } } });
  H('古代王的帽子-禦魔', '哎喲泰雅', 'headTop', 15, 90, {}, { p2: { MSP: 10, MSPp: 1 }, r: { 7: { _t: '受到全體型敵人的魔法傷害-5%' }, 9: { MSP: 100, MSPp: 5, _t: '受到全體型敵人的魔法傷害再-10%' } } });
  H('貓嘴', '哎喲泰雅', 'headLow', 3, 90, { FLEE: 5, aspd: 1 }, { ref: false, t: ['和貓眼一起裝備：攻擊後延遲-3%、完全迴避+5'] });
  // 天津（涂畢河 ama_in01 171/17；炙熱火爐：OBH-S amatsu 214/118）
  H('炙熱火爐', '天津', 'headMid', 0, 90, { heal: 10 }, { ref: false });
  H('無名將軍的戰盔-武兜', '天津', 'headTop', 10, 90, { aspd: 6 }, { p2: { CRI: 2, crit: 3 }, r: { 7: { sizeAll: 8 }, 9: { elemAll: 8 } } });
  H('無名將軍的戰盔-魔兜', '天津', 'headTop', 10, 90, { aspd: 6 }, { p2: { magicAll: 2 }, r: { 7: { sizeAllM: 8 }, 9: { elemAllM: 8 } } });
  // 優配擂斯（魯特杰 yuno_in04 186/124）
  H('愛的記憶', '優配擂斯', 'headMid', 25, 100, { MHP: 300, MSP: 30, MDEF: 7 }, { ref: false,
    w2: [{ with: ['貝思波核心01'], b: { heal: 10, MATK: 20 } }, { with: ['貝思波核心02'], b: { ATK: 20 } }, { with: ['貝思波核心03'], b: { aspdFlat: 1 } }, { with: ['貝思波核心04'], b: { HIT: 15 } }] });

  // 三級武器：地龍（洛陽）對無形／地屬性、陰陽（天津）對惡魔型／火屬性
  const W = (n, area, type, w, lv, j, b, t, more) => GEAR_DB.push({ n, g: area, s: 'weapon', type, w, wl: 3, lv, j, ref: true, b, t, ...more });
  const tri = (a, b, kind) => ({ t: [`對${a}、${b}的${kind}傷害 +5%`], r: { 7: { _t: `對${a}、${b}的${kind}傷害再 +5%` }, 9: { _t: `對${a}、${b}的${kind}傷害再 +10%` } } });
  const line = (area, a, b, list) => list.forEach(([n, type, w, lv, j, kind, extra]) => {
    const x = tri(a, b, kind || '物理');
    W(n, area, type, w, lv, j, { ...(extra || {}), ...(n.includes('左輪') ? {} : { spCost: -10 }) }, x.t, { r: x.r });
  });
  W('靈幻左輪手槍', '崑崙', '手槍', 130, 1, '神槍手系列', {}, ['對人類型魔物、暗屬性敵人的物理傷害 +5%', '人類型不含玩家'],
    { r: { 7: { _t: '對人類型魔物、暗屬性敵人的物理傷害再 +5%' }, 9: { _t: '對人類型魔物、暗屬性敵人的物理傷害再 +10%' } } });
  line('洛陽', '無形敵人', '地屬性敵人', [
    ['地龍巨劍', '雙手劍', 180, 90, '劍士系列'], ['地龍殺刀', '拳刃', 150, 90, '刺客系列'], ['地龍斧', '雙手斧', 180, 90, '商人系列'],
    ['地龍槍', '雙手矛', 180, 90, '劍士系列'], ['地龍弓', '弓', 130, 90, '弓箭手系列、流氓系列'], ['地龍劍', '單手劍', 130, 90, '劍士系列、商人系列'],
    ['地龍短刀', '短劍', 130, 90, '劍士系列、盜賊系列、商人系列'], ['地龍書', '書', 130, 90, '賢者系列、祭司系列', '物理／魔法', { MATK: 130 }],
    ['地龍杖', '單手杖', 40, 90, '初學者系列、魔法師系列、服事系列', '魔法', { MATK: 130 }], ['地龍拳套', '拳套', 130, 90, '武僧系列、祭司系列'],
    ['地龍弦', '樂器', 130, 90, '吟遊詩人系列'], ['地龍鞭', '鞭子', 130, 90, '舞孃系列'], ['地龍槌', '鈍器', 130, 90, '劍士系列、初學者系列、服事系列、商人系列'],
    ['地龍左輪手槍', '手槍', 130, 70, '神槍手系列'], ['地龍忍刀', '短劍', 130, 90, '忍者系列', '物理／魔法', { MATK: 70 }],
  ]);
  line('天津', '惡魔型魔物', '火屬性敵人', [
    ['陰陽巨劍', '雙手劍', 180, 90, '劍士系列'], ['陰陽長槍', '雙手矛', 180, 90, '劍士系列'], ['陰陽殺刀', '拳刃', 150, 90, '刺客系列'],
    ['陰陽斧', '雙手斧', 180, 90, '商人系列'], ['陰陽弓', '弓', 130, 90, '弓箭手系列、流氓系列'], ['陰陽拳套', '拳套', 130, 90, '武僧系列、祭司系列'],
    ['陰陽劍', '單手劍', 130, 90, '劍士系列、商人系列'], ['陰陽錘', '鈍器', 130, 90, '劍士系列、初學者系列、服事系列、商人系列'],
    ['陰陽杖', '單手杖', 40, 90, '初學者系列、魔法師系列、服事系列', '魔法', { MATK: 130 }], ['陰陽鞭', '鞭子', 130, 90, '舞孃系列'],
    ['陰陽書', '書', 130, 90, '賢者系列、祭司系列、拳聖系列', '物理／魔法', { MATK: 130 }], ['陰陽短刀', '短劍', 130, 90, '劍士系列、盜賊系列、商人系列'],
    ['陰陽忍刀', '短劍', 130, 90, '忍者系列', '物理／魔法', { MATK: 70 }], ['陰陽弦', '樂器', 130, 90, '吟遊詩人系列'], ['陰陽左輪手槍', '手槍', 130, 70, '神槍手系列'],
  ]);
  // 靈幻（崑崙）對人類型（玩家除外）／暗屬性、死靈 對植物型／風屬性：官方裝備道具查詢平台
  const set3 = (pre, sword2, extra) => [
    [pre + '劍', '單手劍', 130, 90, '劍士系列、商人系列'], [pre + (pre === '靈幻' ? '短刀' : '短劍'), '短劍', 130, 90, '劍士系列、商人系列、盜賊系列'],
    [pre + '書', '書', 130, 90, '賢者系列、祭司系列', '物理／魔法', { MATK: 130 }], [pre + '杖', '單手杖', 40, 90, '初學者系列、魔法師系列、服事系列', '魔法', { MATK: 130 }],
    [pre + '拳套', '拳套', 130, 90, '武僧系列、祭司系列'], [pre + '弦', '樂器', 130, 90, '吟遊詩人系列'], [pre + '鞭', '鞭子', 130, 90, '舞孃系列'],
    [pre + '錘', '鈍器', 130, 90, '初學者系列、劍士系列、商人系列、服事系列'], [pre + sword2, '雙手劍', 180, 90, '劍士系列'], [pre + '殺刀', '拳刃', 150, 90, '刺客系列'],
    [pre + '斧', '雙手斧', 180, 90, '商人系列'], [pre + '長槍', '雙手矛', 180, 90, '劍士系列'], [pre + '弓', '弓', 130, 90, '弓箭手系列、流氓系列'], extra];
  line('崑崙', '人類型魔物', '暗屬性敵人', set3('靈幻', '巨劍', ['靈幻忍刀', '短劍', 130, 90, '忍者系列', '物理／魔法', { MATK: 70 }]));
  GEAR_DB.filter(x => x.g === '崑崙' && x.n.startsWith('靈幻') && x.n !== '靈幻左輪手槍').forEach(x => x.t = [...x.t, '人類型不含玩家']);
  line('死靈', '植物型魔物', '風屬性敵人', set3('死靈', '大刀', ['死靈飛鏢', '風魔飛鏢', 130, 90, '忍者系列', '物理／魔法', { MATK: 70 }]));
})();

// ===== 盾牌、艾音布羅克庇佑飾品（RO補給站「優配地區／奧丁神殿／艾音布羅克」）=====
(() => {
  GEAR_DB.push({ n: '特殊合金鋼盾', g: '盾牌', s: 'shield', type: '盾牌', def: 75, lv: 90, ref: true, b: { _t: '受中型敵人的物理／魔法傷害-5%' },
    r: { 7: { aspd: 5 }, 9: { _t: '受中型敵人的物理／魔法傷害再-2%' } }, t: ['取得：優配地區掉落'] });
  // 上弦月圖騰護腕：官方毀葛公告寫「系列：飾品、防禦 1」，放在奧丁神殿飾品
  GEAR_DB.push({ n: '上弦月圖騰護腕', g: '奧丁神殿', s: 'acc', def: 1, lv: 100, j: '忍者系列', ref: true, b: { MATK: 3, vct: 3 },
    r: { 9: { MATK: 2, vct: 2 } }, t: ['奧丁神殿魔物掉落'] });
  const ALL3 = { STR: 3, AGI: 3, VIT: 3, INT: 3, DEX: 3, LUK: 3 };
  GEAR_DB.push({ n: '庇佑墜子R', g: '艾音布羅克', s: 'accR', def: 10, lv: 100, ref: true, b: { ATK: 5 } });
  GEAR_DB.push({ n: '庇佑墜子B', g: '艾音布羅克', s: 'accR', def: 10, lv: 100, ref: true, b: { MATK: 5 } });
  GEAR_DB.push({ n: '庇佑肩飾R', g: '艾音布羅克', s: 'accL', def: 10, lv: 100, ref: true, b: { MSP: 50 },
    w2: [{ with: ['庇佑墜子R'], b: { MHPp: 3, MSPp: 3 }, sums: [[14, { ATK: 30, MDEF: 10 }], [18, { aspd: 10 }], [20, { MHPp: 7, MSPp: 7, ...ALL3, _t: '受全體型敵人的物理傷害-3%' }]] }] });
  GEAR_DB.push({ n: '庇佑肩飾B', g: '艾音布羅克', s: 'accL', def: 10, lv: 100, ref: true, b: { MSP: 50 },
    t: ['原文精煉總和寫「庇佑墜子BR」，推測為庇佑墜子B 誤植'],
    w2: [{ with: ['庇佑墜子B'], b: { MHPp: 3, MSPp: 3 }, sums: [[14, { MATK: 30, MDEF: 10 }], [18, { vct: 10 }], [20, { MHPp: 7, MSPp: 7, ...ALL3, _t: '受全體型敵人的魔法傷害-3%' }]] }] });
})();

// ===== RO補給站其他分類：古城、優配、鐵匠、毀葛、深淵湖水、奧丁神殿、艾音布羅克武器、里希塔樂、熔岩、朱諾、沙漠 =====
// 能力裡的 _if: [[素質, 門檻, {能力}], …]＝基本（純）素質達門檻時生效
(() => {
  const A6 = n => ({ STR: n, AGI: n, VIT: n, INT: n, DEX: n, LUK: n });
  const P = (g, n, s, def, lv, b, more) => GEAR_DB.push({ n, g, s, def, lv, ref: true, b, ...more });
  const W = (g, n, type, w, wl, lv, j, b, more) => GEAR_DB.push({ n, g, s: 'weapon', type, w, wl, lv, j, ref: true, b, ...more });
  const T = s => ({ _t: s });

  // --- 古城 ---
  W('古城', '業火魔杖', '單手杖', 70, 3, 60, '魔法師系列、服事系列', { MSP: 100, MATK: 125, _t: '隕石術、火柱攻擊傷害+10%' }, { r: { 7: T('隕石術、火柱攻擊傷害再+5%'), 9: T('隕石術、火柱攻擊傷害再+5%') }, t: ['可用藍焰精華改造附加能力'] });
  W('古城', '寒冰魔杖', '單手杖', 70, 3, 60, '魔法師系列、服事系列', { MSP: 100, MATK: 125, _t: '暴風雪、霜凍之術、冰凍術傷害+10%' }, { r: { 7: T('暴風雪、霜凍之術、冰凍術傷害再+5%'), 9: T('暴風雪、霜凍之術、冰凍術傷害再+5%') }, t: ['可用藍焰精華改造附加能力'] });
  W('古城', '藍焰彩杖', '雙手杖', 45, 4, 60, '魔法師系列', { MSP: 150, INT: 5, MATK: 230, fwMagic: 5, _t: '魔法攻擊時，一定機率 7 秒內變動詠唱-30%' }, { r: { 7: { fwMagic: 10 }, 9: { fwMagic: 10, vct: 5 } } });

  // --- 優配地區 ---
  const VG = '優配地區';
  W(VG, '隕石鋼斧', '鈍器', 150, 3, 90, '服事系列', { melee: 5 }, { r: { 7: T('浸透勁傷害+7%'), 9: T('浸透勁傷害+13%') } });
  W(VG, '忍術神劍', '短劍', 70, 3, 90, '忍者系列', { MATK: 110, _t: '火、水、風屬性魔法傷害+5%' }, { r: { 7: T('火、水、風屬性魔法傷害+7%'), 9: T('火、水、風屬性魔法傷害+13%') } });
  W(VG, '漆黑風魔飛鏢', '風魔飛鏢', 130, 3, 90, '忍者系列', { ranged: 5 }, { r: { 7: T('投擲風魔飛鏢傷害+7%'), 9: T('投擲風魔飛鏢傷害+13%') } });
  W(VG, '尼普菲拳套', '拳套', 110, 3, 90, '武僧系列、祭司系列', { aspd: 5 }, { r: { 7: T('連環全身掌傷害+20%'), 9: T('猛龍誇強傷害+20%') } });
  W(VG, '霹靂波長槍', '單手矛', 135, 3, 90, '劍士系列', { melee: 5 }, { r: { 7: T('連刺攻擊傷害+7%'), 9: T('連刺攻擊傷害+13%') } });
  const core = (i, b, r7, r9, def) => P(VG, '貝思波核心0' + i, 'accR', def, 100, { MDEF: 3, ...b }, { r: { 7: r7, 9: r9 } });
  core(1, { INT: 2, MSPp: 3, MATK: 5 }, { spRec: 5, MATK: 3 }, { heal: 5, spRec: 5, MATK: 5 }, 0);
  core(2, { STR: 2, ATK: 5 }, { hpRec: 5, ATK: 3 }, { hpRec: 10, ATK: 5 }, 0);
  core(3, { AGI: 2, FLEE: 5 }, { healRecv: 2, FLEE: 5 }, { healRecv: 3, FLEE: 7 }, 0);
  core(4, { DEX: 2, HIT: 5 }, { HIT: 3 }, { HIT: 5 }, 0);
  const gear = (i, def, b, sumB) => P(VG, '貝思波齒輪0' + i, 'accL', def, 100, b, { w2: [{ with: ['貝思波核心0' + i], b: {}, sums: [[15, sumB]] }] });
  gear(1, 15, { INT: 2 }, { spRec: 15, vct: 10 });
  gear(2, 15, { STR: 2 }, { hpRec: 30, ATK: 20 });
  gear(3, 15, { AGI: 2 }, { FLEE: 20, aspd: 5, healRecv: 5 });
  gear(4, 15, { DEX: 1, LUK: 1 }, { HIT: 10, CRI: 3, crit: 7 });

  // --- 鐵匠武器（製作）---
  const FG = '鐵匠武器';
  const SW = '劍士系列、魔法師系列、弓箭手系列、商人系列、盜賊系列', SMT = '劍士系列、商人系列、盜賊系列';
  W(FG, '長柄短劍', '短劍', 105, 3, 24, SW, {}); W(FG, '大馬士革短劍', '短劍', 118, 3, 24, SW, {});
  W(FG, '騎兵之劍', '單手劍', 115, 3, 27, SMT, {}); W(FG, '海東劍', '單手劍', 120, 3, 27, SMT, { INT: 3 }); W(FG, '日本劍', '單手劍', 130, 3, 27, SMT, {});
  W(FG, '水紋之劍', '單手劍', 150, 3, 27, '騎士、十字軍', {}); W(FG, '雙手巨劍', '雙手劍', 160, 3, 33, '劍士系列', {}); W(FG, '十字巨劍', '雙手劍', 180, 3, 33, '騎士、十字軍', {});
  W(FG, '雙手斧', '雙手斧', 185, 3, 30, '劍士系列、商人系列', {});
  W(FG, '龍爪拳套', '拳套', 86, 3, 24, '服事系列', {}); W(FG, '鷹爪拳套', '拳套', 97, 3, 24, '服事系列', {}); W(FG, '昇龍拳套', '拳套', 115, 3, 24, '服事系列', {});
  const nrm = (a, b) => ({ 7: { normal: a }, 9: { normal: b } });
  W(FG, '黑斧大駒短劍', '短劍', 130, 3, 60, '劍士系列、初學者系列、盜賊系列、商人系列', { MATK: 30 }, { p2: { MATK: 12 }, r: { 7: { normal: 3, normalM: 3 }, 9: { normal: 7, normalM: 7 } } });
  W(FG, '炫亮長劍', '單手劍', 150, 3, 60, '劍士系列、商人系列', {}, { p2: { vct: 4 }, r: nrm(4, 8) });
  W(FG, '靛青劍', '雙手劍', 200, 3, 60, '劍士系列', {}, { p2: { HIT: 4 }, r: nrm(5, 10) });
  W(FG, '血腥拳套', '拳套', 130, 3, 60, '武僧系列、祭司系列', {}, { p2: { MSPp: 1 }, r: nrm(4, 8) });
  W(FG, '日落毀滅之斧', '單手斧', 165, 3, 60, '劍士系列、商人系列', {}, { p2: { CRI: 3 }, r: nrm(4, 8) });
  W(FG, '翡翠斧', '雙手斧', 210, 3, 60, '劍士系列、商人系列', {}, { p2: { aspd: 4 }, r: nrm(5, 10) });
  W(FG, '藍寶石權杖', '鈍器', 150, 3, 60, '服事系列、商人系列', {}, { p2: { HIT: 4 }, r: nrm(4, 8) });
  W(FG, '暮光長矛', '單手矛', 150, 3, 60, '劍士系列', {}, { p2: { CRI: 3 }, r: nrm(4, 8) });
  W(FG, '混沌長矛', '雙手矛', 190, 3, 60, '劍士系列', {}, { p2: { HIT: 4 }, r: nrm(5, 10) });

  // --- 毀葛 ---
  const HG = '毀葛';
  P(HG, '艾爾帕蘭時鐘帽（紅）', 'headTop', 15, 105, { _t: '對無形魔物的物理傷害+5%' }, { p1: { MHP: 50 }, r: { 7: { HIT: 20, _t: 'LUK 上升（數值未載明）' }, 9: { MHPp: 5, MHP: 750 } } });
  P(HG, '卡利斯格騎士團長頭盔', 'headTop', 10, 105, { CRI: 3, crit: 5 }, { r: { 7: { CRI: 7 }, 9: { aspdFlat: 1, crit: 7 } } });
  P(HG, '愛麗絲的時髦假髮', 'headTop', 10, 105, { heal: 5, vct: 3 }, { p1: { heal: 1 }, r: { 7: { MHP: 200, MSP: 75 }, 9: { vct: 5 } } });
  P(HG, '骷髏披風', 'headTop', 15, 105, { MHP: 250, _t: '對惡魔型魔物的物理傷害+5%' }, { p1: { ATK: 7 }, r: { 7: { HIT: 15 }, 9: T('對不死型魔物的物理傷害+5%') } });
  P(HG, '魔女南瓜帽', 'headTop', 10, 105, { MATKp: 5, INT: 5 }, { p1: { MATK: 7 }, r: { 7: { MHP: 300, MSP: 100 }, 9: { vct: 10 } } });
  P(HG, '黑光圍巾', 'headLow', 3, 105, { AGI: 1, HIT: 1 }, { ref: false, w2: [{ with: ['藏鏡人帽'], b: { ATK: 30, _t: '藏鏡人帽每精煉 2：HIT+1；+10 以上：暴擊傷害+7%' } }] });
  P(HG, '洛基面具', 'headMid', 5, 105, { MATK: 20, ATK: 20, _t: '對暗屬性攻擊抗性+2%、完全迴避+3' }, { occ: ['headLow'], ref: false });

  // --- 深淵湖水（天龍套）---
  const AG = '深淵湖水';
  P(AG, '天龍披風', 'garment', 23, 100, { MDEF: 2, healRecv: 15 }, { r: { 7: T('受龍族魔物的物理／魔法傷害-5%'), 9: T('受物理／魔法攻擊時，一定機率 3 秒內每秒恢復 HP 300') } });
  P(AG, '天龍戰靴', 'shoes', 28, 100, { MSP: 150, vct: 5 }, { r: { 7: { FLEE: 20 }, 9: { fct: 5 } } });
  P(AG, '天龍之戒', 'acc', 10, 100, A6(1));
  const dragon = (color, stat, b, r7, r9, setB, ps, sumB, proc) => {
    const n = color + '龍鎧甲';
    P(AG, n, 'armor', 80, 100, { [stat]: 2, MDEF: 4, ...b }, { r: { 7: r7, 9: r9 } });
    GEAR_SETS.push({ g: AG, label: color + '龍套裝', items: [n, '天龍戰靴', '天龍披風', '天龍之戒'], b: { MHP: 300, MSP: 30, ...setB, _ps: [ps], _t: proc }, sum: [27, { fct: 15, ...sumB }], sumItems: [n, '天龍戰靴', '天龍披風'] });
  };
  const PROC = (nm, a, b) => `受物理／魔法攻擊時一定機率觸發龍之${nm}：7 秒內${a}；基本屬性 90 以上時機率提高且${b}`;
  dragon('赤', 'STR', { MHP: 600, MSP: 40 }, { STR: 2 }, { ATK: 30 }, { CRI: 3 }, ['STR', 15, { ATK: 8 }], { aspd: 10 }, PROC('力量', 'ATK+5%', 'ATK+10%'));
  dragon('綠', 'AGI', { MHP: 500, MSP: 50 }, { AGI: 2 }, { aspd: 7 }, { crit: 7 }, ['AGI', 15, { HIT: 3 }], { aspd: 10 }, PROC('速度', '攻擊後延遲-5%', '攻擊後延遲再-10%'));
  dragon('金', 'VIT', { MHP: 600, MSP: 40 }, { VIT: 2 }, { MHPp: 10 }, { _t: '受全體型敵人的傷害-6%' }, ['VIT', 15, { DEF: 10, MDEF: 2 }], { aspd: 10 }, PROC('體力', '全屬性抗性+5%', '全屬性抗性再+10%'));
  dragon('紫', 'DEX', { MHP: 500, MSP: 50 }, { DEX: 2 }, { FLEE: 15 }, { critAtk: 7 }, ['DEX', 15, { ATK: 8 }], { aspd: 10 }, PROC('本領', '遠距離物理傷害+3%', '遠距離物理傷害再+4%'));
  dragon('藍', 'INT', { MHP: 400, MSP: 60 }, { INT: 2 }, { MATK: 30, heal: 10 }, { vct: 7 }, ['INT', 15, { MATK: 8, heal: 1 }], { vct: 10 }, PROC('智慧', 'MATK+3%', 'MATK 再+4%'));
  dragon('銀', 'LUK', { MHP: 500, MSP: 50 }, { LUK: 2 }, { ATK: 30 }, { crit: 15 }, ['LUK', 15, { CRI: 1 }], { aspd: 10 }, PROC('幸運', 'CRI+6', '暴擊傷害+10%'));

  // --- 奧丁神殿 ---
  const OG = '奧丁神殿';
  const NOVICE_NO = '劍士系列、魔法師系列、弓箭手系列、服事系列、商人系列、盜賊系列、忍者系列、神槍手系列';
  const valk = (n, lv) => P(OG, n, 'armor', 55, lv, A6(1), { j: NOVICE_NO, t: ['不可破壞', '魔法師／弓箭手／服事系列：沉默抗性+30%；劍士／盜賊／商人系列：昏迷抗性+30%；精煉每 +1 再+2%'] });
  valk('白銀巴基力盔甲', 100); valk('黃金巴基力盔甲', 100); valk('巴基力的鎧甲', 95);
  const robe = (pre, stat, mhp, p2, r9, sumB) => {
    const n = pre + '長袍';
    P(OG, n, 'armor', 65, 105, { MHP: mhp, MDEF: 8 }, { p2, p3: { [stat]: 2 }, r: { 9: r9 } });
    GEAR_SETS.push({ g: OG, label: n + '套裝', items: [n, '主教長靴', '主教斗篷', '主教魔戒'], b: { [stat]: 4, MHP: 300, MSP: 100, hpRec: 25, spRec: 15, _t: '物理／魔法攻擊時有機率恢復 SP' },
      sum: [27, { fct: 15, ...sumB }], sumItems: [n, '主教長靴', '主教斗篷'] });
  };
  robe('力量', 'STR', 800, { crit: 2 }, { ATK: 40 }, { aspd: 10, ATKp: 7 });
  robe('敏捷', 'AGI', 700, { aspd: 1 }, { HIT: 15 }, { aspd: 10, crit: 15 });
  robe('體質', 'VIT', 900, { DEF: 4, MDEF: 1 }, { MHPp: 10 }, { aspd: 10, _t: '受到全屬性敵人的傷害-6%' });
  robe('靈巧', 'DEX', 700, { ranged: 1, melee: 1 }, { FLEE: 20 }, { aspd: 10, CRI: 9 });
  robe('智慧', 'INT', 700, { vct: 1 }, { MATK: 40, heal: 15 }, { vct: 10, MATKp: 7, heal: 10 });
  robe('幸運', 'LUK', 800, { crit: 2 }, { CRI: 6 }, { aspd: 10, crit: 15 });
  P(OG, '主教斗篷', 'garment', 20, 105, { healRecv: 15, _t: '受到天使型、惡魔型魔物的物理／魔法傷害-1%' }, { r: { 3: { FLEE: 6 }, 9: { MSP: 300, fct: 5 } } });
  P(OG, '主教長靴', 'shoes', 25, 105, { MHP: 100, MSP: 30 }, { r: { 2: { HIT: 2 }, 3: { vct: 2, aspd: 2 }, 9: T('受到物理／魔法攻擊時，一定機率 2 秒內完全迴避+20') } });
  P(OG, '主教魔戒', 'acc', 0, 105, A6(1));
  // 雷吉麗芙的翅膀／英格麗之翼：官方公告為頭上、中，防禦 7
  P(OG, '雷吉麗芙的翅膀', 'headTop', 7, 100, { ...A6(1), ATK: 20 }, { occ: ['headMid'], p2: { ATK: 8 }, r: { 7: T('對天使型魔物的物理傷害+20%'), 9: { ATKp: 15 } },
    w2: [{ with: ['黃金巴基力盔甲'], b: T('對天使型魔物的物理傷害+15%') }], t: ['不可破壞'] });
  P(OG, '英格麗之翼', 'headTop', 7, 100, { ...A6(1), MATK: 20 }, { occ: ['headMid'], p2: { MATK: 7 }, r: { 7: T('對天使型魔物的魔法傷害+20%'), 9: { MATKp: 10 } },
    w2: [{ with: ['白銀巴基力盔甲'], b: T('對天使型魔物的魔法傷害+15%') }], t: ['不可破壞'] });
  P(OG, '巴基力的斗篷', 'garment', 10, 95, {}, { j: NOVICE_NO, t: ['不可破壞', '魔法師／弓箭手／服事系列：完全迴避+5；劍士／盜賊／商人系列：物理反射+5%；精煉時依職業追加'] });
  P(OG, '巴基力的長靴', 'shoes', 13, 95, { _t: '魔法師、弓箭手、服事系列：MHP + BaseLv×7；劍士、商人、盜賊系列：MSP + JobLv×3' }, { j: NOVICE_NO, t: ['不可破壞'] });
  P(OG, '龍之風衣', 'armor', 30, 95, { MDEF: 5, _t: '對龍族魔物的抗性+5%' }, { p2: { MDEF: 1, _t: '對龍族魔物的抗性+1%' } });
  P(OG, '霧中暗影', 'armor', 60, 100, { MHP: 400, MSP: 60 }, { j: '忍者系列', r: { 7: { MATK: 50 }, 9: { MATK: 50 } }, w2: [{ with: ['上弦月圖騰護腕'], b: { vct: 10 } }] });
  P(OG, '忍者鱗片鎧甲', 'armor', 90, 100, { MHP: 600, MSP: 40 }, { j: '忍者系列', r: { 7: { ATK: 50 }, 9: { DEF: 100 } }, w2: [{ with: ['野狼圖騰護腕'], b: { melee: 5 } }] });
  P(OG, '特殊忍服血櫻', 'armor', 70, 100, { MHP: 500, MSP: 50 }, { j: '忍者系列', r: { 7: { ATK: 50 }, 9: { ATK: 25 } }, w2: [{ with: ['狐狸圖騰護腕'], b: { ranged: 5 } }] });
  GEAR_DB.push({ n: '狐狸圖騰護腕', g: OG, s: 'acc', def: 1, lv: 100, j: '忍者系列', ref: true, b: { ATK: 5 }, r: { 9: { ATK: 15 } } });
  GEAR_DB.push({ n: '野狼圖騰護腕', g: OG, s: 'acc', def: 1, lv: 100, j: '忍者系列', ref: true, b: { MATK: 5 }, r: { 9: { MATK: 15 } } });
  const BOLT = '火箭術、冰箭術、雷擊術、地震術';
  P(OG, '四大元素魔靴', 'shoes', 10, 95, { _c: { [BOLT + '變動詠唱']: -3, [BOLT + '傷害']: 3 } }, { pf: [6, { _c: { [BOLT + '變動詠唱']: -1, [BOLT + '傷害']: 1 } }], t: ['不可破壞'] });
  W(OG, '靈魂之鈴', '鞭子', 130, 3, 95, '舞孃系列', { _t: '纏箭投擲傷害+7%' }, { r: { 7: T('纏箭投擲傷害再+13%'), 9: { ranged: 15 } } });
  W(OG, '響螺', '樂器', 130, 3, 95, '吟遊詩人系列', { _t: '樂器攻擊傷害+7%' }, { r: { 7: T('樂器攻擊傷害+13%'), 9: { ranged: 15 } } });
  W(OG, '怨恨', '雙手斧', 190, 3, 95, '商人系列', { ATKp: 5, CRI: 5 }, { r: { 7: { aspd: 10 }, 9: { crit: 10 } } });
  W(OG, '疾風之弓', '弓', 95, 3, 55, '弓箭手系列、流氓系列', { _t: '裝備風靈箭矢時：遠距離物理傷害+25%、MATK+50；物理攻擊時機率自動念咒風刃 Lv5', _if: [['INT', 40, { MATK: 50 }]] }, { t: ['不可破壞', 'INT 40 以上時風刃觸發機率提高'] });
  W(OG, '血腥弓', '弓', 170, 3, 95, '弓箭手系列、流氓系列', { CRI: 5 }, { r: { 7: { crit: 7 }, 9: { ranged: 15 } } });
  W(OG, '神聖十字之杖', '單手杖', 120, 4, 95, '服事系列', { MATK: 210, vct: 10 }, { pf: [6, { _c: { 聖屬性魔法傷害: 3, 十字驅魔攻擊傷害: 3 } }], t: ['聖屬性、不可破壞'] });
  W(OG, '風魔飛鏢之暴雨', '風魔飛鏢', 180, 4, 95, '忍者系列', { MATK: 260, MATKp: 5 }, { r: { 7: T('風刃傷害+20%'), 9: T('朔風傷害+20%') }, t: ['不可破壞'] });
  W(OG, '彎月短劍', '短劍', 50, 4, 95, '忍者系列', { MATK: 120, _if: [['INT', 90, { MATKp: 3 }]] }, { r: { 7: T('火炎花、冰閃槍、風刃傷害+15%'), 9: T('火、水、風屬性魔法傷害+10%') } });
  W(OG, '斬影短劍', '短劍', 150, 4, 95, '忍者系列', { _t: '隱身攻擊傷害+7%' }, { r: { 7: T('隱身攻擊傷害+13%'), 9: { melee: 15 } } });

  // --- 艾音布羅克武器（+7：BaseLv 每 10 級；+9：習得技能時）---
  const EG = '艾音布羅克';
  const E = (n, type, w, j, b, lv10, r9) => W(EG, n, type, w, 4, 100, j, b, { r: { 7: { _lv: [10, lv10] }, 9: { _t: r9 } } });
  E('砂輪斧', '單手斧', 150, '鍊金術師系列', { ATKp: 5, VIT: 3 }, { aspd: 1, vct: 1 }, '習得強酸火煙瓶投擲 Lv10：ATK+30、強酸火煙瓶投擲傷害+15%');
  E('庇佑拳套', '拳套', 225, '武僧系列', { ATKp: 5, STR: 3 }, { aspd: 1, HIT: 1 }, '習得伏虎拳 Lv5：ATK+30、伏虎拳傷害+30%');
  E('感測魔杖', '雙手杖', 130, '巫師系列', { spRec: 10, INT: 3, MATK: 200 }, { vct: 1, _t: '水、火、風屬性魔法傷害+1%' }, '習得魔力增幅 Lv10：MATK+5%、魔法攻擊時機率 5 秒內每秒恢復 SP 30');
  E('砂輪風魔飛鏢', '風魔飛鏢', 190, '忍者系列', { vct: 10, STR: 3 }, { ATK: 2, HIT: 2 }, '習得投擲風魔飛鏢 Lv5：ATK+7%、投擲風魔飛鏢傷害+30%');
  E('木柄橡膠鎚', '鈍器', 140, '祭司系列', { heal: 10, INT: 3, MATK: 160 }, { vct: 1, heal: 2 }, '習得冥想 Lv10：MATK+5%、受到全體型敵人的傷害-5%');
  E('霹靂十字弓', '弓', 130, '弓箭手系列', { aspdFlat: 1, AGI: 3 }, { aspd: 2, AGI: 1 }, '習得獵鷹突擊 Lv5：閃電衝擊傷害+60%，施放閃電衝擊時機率施放獵鷹突擊 Lv5');
  E('格擋槍矛', '雙手矛', 235, '騎士系列', { ATKp: 5, STR: 3 }, { aspd: 1, ATK: 2 }, '習得螺旋擊刺 Lv5：HIT+30、螺旋擊刺傷害+20%');
  E('焊接魔杖', '單手杖', 70, '賢者系列', { MATKp: 5, spCost: -5, MATK: 150 }, { vct: 1, aspd: 1 }, '習得雙倍投擲 Lv5：MATK+20，冰箭術、火箭術、雷擊術傷害+10%');
  E('庇佑鞭子', '鞭子', 180, '舞孃系列', { ATKp: 5, HIT: 5 }, { vct: 1, aspd: 1 }, '習得奧義箭亂舞 Lv10：遠距離攻擊傷害+10%、奧義箭亂舞傷害+20%');
  E('霹靂夾碎器', '拳刃', 212, '刺客系列', { ATKp: 5, FLEE: 10 }, { aspd: 1, ATK: 2 }, '習得黑暗瞬間 Lv10：HIT+20、黑暗瞬間傷害+20%');
  E('顫慄鉅斧', '雙手斧', 255, '鐵匠系列', { HIT: 15, VIT: 3 }, { ATK: 2, aspd: 1 }, '習得野蠻兇砍 Lv10：受全體型敵人傷害-7%、手推車終結技傷害+30%');
  E('庇佑指南', '書', 150, '祭司系列', { MATKp: 5, MSPp: 5 }, { heal: 2, spRec: 2 }, '習得治癒術 Lv10：變動詠唱-15%、MSP 再+5%');
  E('金屬探測器Mk47', '短劍', 130, '流氓系列', { ATKp: 5, DEX: 3 }, { aspd: 1, ATK: 2 }, '習得所有卸除 Lv5：HIT+20、潛擊傷害+20%');
  E('寶石探測器Mk47', '短劍', 70, '忍者系列', { vct: 10, INT: 3, MATK: 130 }, { MATK: 2, _t: '火屬性魔法傷害+1%' }, '習得爆炎龍 Lv5：MATK+5%、爆炎龍傷害+30%');
  E('蒸氣威壓', '單手矛', 150, '十字軍系列', { ATKp: 5, STR: 3 }, { ATK: 2, CRI: 1 }, '習得加農砲攻擊 Lv5：暴擊傷害+15%、加農砲攻擊傷害+20%');
  E('庇佑魯特琴', '樂器', 150, '吟遊詩人系列', { ATKp: 5, HIT: 5 }, { vct: 1, aspd: 1 }, '習得奧義箭亂舞 Lv10：遠距離攻擊傷害+10%、奧義箭亂舞傷害+20%');
  E('庇佑光劍', '單手劍', 150, '十字軍系列', { ATKp: 5, ATK: 25 }, { aspd: 1, HIT: 2 }, '習得連續盾擊 Lv5：連續盾擊傷害+20%，物理攻擊時機率 5 秒內每秒恢復 HP 500');

  // --- 里希塔樂鎮（4 級武器）---
  const LG = '里希塔樂鎮';
  W(LG, '女神之杖', '雙手杖', 30, 4, 105, '祭司系列', { MATK: 230, INT: 6, VIT: 2 }, { p1: { vct: 2, heal: 3 }, r: { 7: T('受到不死敵人傷害-15%、受到聖屬性敵人傷害+5%'), 9: T('受到惡魔種族傷害-15%、受到天使種族傷害+5%；受攻擊時機率施放光耀之堂 Lv1') }, t: ['聖屬性、不可破壞'] });
  W(LG, '低音吉他', '樂器', 145, 4, 105, '吟遊詩人', { _t: '近距離普攻機率對自己施放天使之賜福（依精煉度）' }, { p1: { _t: '奧義箭亂舞傷害+2%、SP 消耗+1%' }, r: { 7: T('奧義箭亂舞傷害再+10%、SP 消耗+5%'), 9: T('奧義箭亂舞冷卻-0.5 秒') } });
  W(LG, '克裡希納拳刃', '拳刃', 165, 4, 105, '刺客系列', { STR: 4, DEX: 3 }, { r: { 7: { HIT: 10, CRI: -5, _t: '無影之牙傷害+15%' }, 9: { HIT: 20, CRI: -10, _t: '黑暗瞬間傷害+15%；使用致命塗毒時另有加成（HP 每秒扣 1000，30 秒）' } } });
  W(LG, '克羅納斯魔杖', '雙手杖', 30, 4, 105, '魔法師系列', { MATK: 240, INT: 5, MSP: 300 }, { p1: { MATK: 5, spCost: 1 }, r: { 7: { MATKp: 5, spCost: 10 }, 9: T('魔法攻擊時機率 MATK+20%，SP 每秒扣 30，持續 7 秒') }, t: ['不可破壞'] });
  W(LG, '克羅琪聖杖', '單手杖', 30, 4, 105, '祭司系列', { MATK: 175, INT: 4 }, { p1: { heal: 2, MSP: -30 }, r: { 7: { vct: 10, _t: '施放治癒術時機率治癒量再+30%，30 秒' }, 9: { vct: 10, _t: '受到物理傷害時機率對敵人施放轉生術 Lv1' } }, t: ['聖屬性、不可破壞'] });
  W(LG, '貝伽勒巨斧', '單手斧', 140, 4, 105, '商人系列', { STR: 4, VIT: 3 }, { p1: { FLEE: -3, _t: '手推車終結技傷害+3%' }, r: { 7: { aspd: 10, _t: '對人類型、玩家傷害+10%' }, 9: { aspdFlat: 1, _t: '受到人類型敵人傷害-10%' } }, t: ['不可破壞'] });
  W(LG, '刺針短劍', '短劍', 120, 4, 105, '流氓系列', { DEX: 6, _t: '施放背刺時機率使敵人出血' }, { p1: { ATK: 3, HIT: 2 }, r: { 7: T('背刺傷害+10%、背刺 SP 消耗+10%'), 9: T('背刺傷害再+20%、背刺 SP 消耗再+20%') } });
  W(LG, '恰克蘭拳刃', '拳刃', 170, 4, 105, '刺客系列', { INT: 4, LUK: 3 }, { r: { 7: { CRI: 5, HIT: -15 }, 9: { CRI: 10, crit: 10, HIT: -30, _t: '施放致命塗毒時：心靈震波傷害+15%、暴擊傷害再+15%（HP 每秒扣 1000，30 秒）' } } });
  W(LG, '紅手提包', '鈍器', 50, 4, 105, '鍊金術師系列', { DEX: 6, _t: '復活生命體冷卻-10 秒' }, { p1: { HIT: 2, _t: '火煙瓶投擲傷害+3%、SP 消耗+3%' }, r: { 7: T('火煙瓶投擲傷害再+15%、SP 消耗+5%'), 9: T('火煙瓶投擲傷害再+25%、SP 消耗+15%') }, t: ['不可破壞'] });
  W(LG, '紅寶石劍', '單手劍', 160, 4, 105, '騎士系列', { STR: 4 }, { p1: { DEF: -10, _t: '怪物互擊傷害+1%' }, r: { 7: { DEF: -100, _t: '怪物互擊傷害再+10%' }, 9: { melee: 10, _t: '施放集中攻擊時：怪物互擊傷害再+40%、DEF-400，20 秒' } } });
  W(LG, '紅蘿蔔鞭', '鞭子', 145, 4, 105, '舞孃', { _t: '近距離普攻機率對自己施放加速術（依精煉度）' }, { p1: { _t: '奧義箭亂舞傷害+2%、SP 消耗+1%' }, r: { 7: T('奧義箭亂舞傷害再+10%、SP 消耗再+5%'), 9: T('奧義箭亂舞冷卻-0.5 秒') } });
  W(LG, '秘拳套閃光', '拳套', 120, 4, 36, '祭司、武僧系列', { aspd: 12 }, { r: { 9: { aspd: 18 } } });
  W(LG, '斬首之斧', '雙手斧', 215, 4, 44, '劍士、商人系列', { _t: '普攻玩家、人類種族時每次恢復 SP 1；擊殺時恢復 SP 20' }, { r: { 9: T('普攻人類種族時機率造成瀕死') } });
  W(LG, '智慧之錘', '鈍器', 130, 4, 105, '鍊金術師系列', { MATK: 90, STR: 6, ranged: 10 }, { p1: { _t: '對玩家、人類種族傷害+1%，受到其傷害+1%' }, r: { 7: T('強酸攻擊傷害+20%、SP 消耗+10%'), 9: T('強酸火煙瓶攻擊傷害+20%、SP 消耗+10%') }, t: ['不可破壞'] });
  W(LG, '聖十字審判', '鈍器', 140, 4, 40, '服事系列', { _t: '普攻機率對敵人施放轉生術 Lv3；普攻不死種族每次恢復 SP 1，擊殺恢復 SP 3' }, { r: { 9: T('轉生術觸發機率提高') }, t: ['聖屬性'] });
  W(LG, '獵鷹閃電弓', '弓', 140, 4, 105, '獵人系列', { AGI: 5, aspdFlat: 2 }, { p1: { aspd: 3, HIT: -5, _t: '閃電衝擊傷害+10%' }, r: { 7: T('遠距離普攻機率施放閃電衝擊'), 9: T('閃電衝擊觸發機率提高') } });
  W(LG, '魔力之矛', '單手矛', 100, 4, 48, '劍士系列', { _t: '忽視一般階級敵人防禦 30%；對無屬性敵人傷害+25%' }, { r: { 9: T('再忽視一般階級敵人防禦 70%') } });
  W(LG, '精裝之書', '書', 140, 4, 105, '賢者、祭司系列', { STR: 3, AGI: 2, aspd: 10 }, { p1: { crit: 4 }, r: { 7: { CRI: 10, HIT: -15 }, 9: { CRI: 20, HIT: -30 } }, t: ['不可破壞'] });
  W(LG, '魔法經典', '書', 60, 4, 105, '賢者系列', { MATK: 160, INT: 3 }, { p1: { FLEE: -3, _t: '火箭術、冰箭術、雷擊術傷害+2%' }, r: { 7: { aspd: 7 }, 9: T('火箭術、冰箭術、雷擊術傷害再+10%') }, t: ['不可破壞'] });
  W('其他', '雷擊經典', '書', 120, 3, 95, '魔法師系列', { MATK: 135, MATKp: 5 }, { r: { 7: T('火箭術、冰箭術、雷擊術傷害+10%'), 9: T('火箭術、冰箭術、雷擊術傷害再+10%') }, t: ['2 洞'] });
  GEAR_DB.push({ n: '無顱武士的手套', g: '其他', s: 'acc', def: 0, lv: 60, ref: true, b: { HIT: 1, DEX: 1 }, r: { 7: { DEX: 1 }, 9: { HIT: 1, ATKp: 2 } } });
  GEAR_DB.push({ n: '某個魔法師的手套', g: '其他', s: 'acc', def: 1, lv: 60, ref: true, b: { vct: 2, MATK: 2 }, r: { 7: { MATK: 2 }, 9: { vct: 1, _t: '火屬性魔法傷害+1%' } } });
  W(LG, '暴風雪法杖', '單手杖', 30, 4, 105, '魔法師系列', { MATK: 180, INT: 4, vct: 10 }, { p1: { _t: '水屬性魔法傷害+1%、火屬性魔法傷害-1%' }, r: { 7: T('暴風雪傷害+15%、火屬性魔法傷害-5%'), 10: T('暴風雪傷害再+30%、火屬性魔法傷害再-10%') }, t: ['不可破壞'] });

  // --- 熔岩皮革（3 件精煉總和 21）---
  const MG = '熔岩';
  P(MG, '熔岩皮革盔甲', 'armor', 50, 100, { MHP: 400, _t: '受火屬性敵人的所有傷害-5%' }, { r: { 7: { MHP: 150, healRecv: 5 }, 9: { MHP: 250, healRecv: 5 } } });
  P(MG, '熔岩皮革外套', 'armor', 25, 100, { MHP: 350, AGI: 3, DEX: 3 }, { r: { 7: { MHP: 125, HIT: 10, FLEE: 5, crit: 3 }, 9: { MHP: 125, HIT: 15, FLEE: 10, crit: 7 } } });
  P(MG, '熔岩皮革外袍', 'armor', 20, 100, { MHP: 300, MSP: 100, spRegen: 10, MDEF: 5, _t: '加速術、天使之賜福 SP 消耗-20%' }, { r: { 7: { MHP: 125, MSP: 50, spRegen: 10, heal: 5, MATK: 5 }, 9: { MHP: 125, MSP: 50, spRegen: 10, heal: 7, MATK: 5 } } });
  P(MG, '熔岩皮革斗篷', 'garment', 20, 100, { VIT: 2 });
  P(MG, '熔岩皮革圍巾', 'garment', 13, 100, { DEX: 2 });
  P(MG, '熔岩皮革連帽披肩', 'garment', 7, 100, { INT: 2 });
  P(MG, '熔岩皮革長靴', 'shoes', 15, 100, { MHP: 300, MSP: 50, hpRec: 50, _t: '受火屬性敵人的傷害-5%' }, { r: { 7: { MHP: 100, healRecv: 2 }, 9: { MHP: 150, healRecv: 3 } } });
  P(MG, '熔岩皮革鞋子', 'shoes', 10, 100, { MHP: 200, MSP: 75, aspd: 5, FLEE: 15, HIT: 10 }, { r: { 7: { MHP: 100, crit: 2 }, 9: { MHP: 150, crit: 3 } } });
  P(MG, '熔岩皮革輕便鞋', 'shoes', 5, 100, { MHP: 150, MSP: 125, spRegen: 20 }, { r: { 7: { MHP: 100, heal: 2, MATK: 4 }, 9: { MHP: 150, heal: 3, MATK: 3 } } });
  const lava = (label, items, sumB) => GEAR_SETS.push({ g: MG, label, items, b: {}, sum: [21, sumB] });
  lava('熔岩皮革（盔甲）', ['熔岩皮革盔甲', '熔岩皮革斗篷', '熔岩皮革長靴'], { healRecv: 10, _t: '水、風、地、火屬性抗性+5%' });
  lava('熔岩皮革（外套）', ['熔岩皮革外套', '熔岩皮革圍巾', '熔岩皮革鞋子'], { crit: 10, HIT: 10 });
  lava('熔岩皮革（外袍）', ['熔岩皮革外袍', '熔岩皮革連帽披肩', '熔岩皮革輕便鞋'], { vct: 10, heal: 5, _t: '水、風、地、火屬性魔法攻擊力+5%' });
  W(MG, '岩漿拳套', '拳套', 80, 3, 75, '服事系列', { _t: '攻擊時低機率對自己施放火屬性附加 Lv5' }, { t: ['3 洞'] });

  // --- 朱諾地區 ---
  const JG = '朱諾地區';
  // 以下依官方裝備道具查詢平台核對
  P(JG, '沙妖帽', 'headTop', 20, 90, { _t: '對無形、惡魔型魔物的物理傷害+7%' }, { r: { 7: { ATK: 15 }, 9: { ATK: 20 } } });
  P(JG, '七彩大嘴鳥髮飾', 'headTop', 15, 90, { _t: '對人類型、動物型魔物的魔法傷害+7%' }, { r: { 7: T('火屬性魔法傷害+3%'), 9: T('火屬性魔法傷害再+5%') } });
  W(JG, '業火錘', '鈍器', 135, 3, 90, '初學者系列、劍士系列、商人系列、服事系列', { melee: 5 }, { r: { 7: { melee: 5 }, 9: { melee: 10 } }, t: ['不可破壞'] });
  W(JG, '炙熱大駒短劍', '短劍', 115, 3, 90, '盜賊、流氓系列', { HIT: 5 }, { r: { 7: { melee: 10 }, 9: { melee: 10 } } });
  W(JG, '業火弓', '弓', 115, 3, 90, '弓箭手系列、流氓系列', { ATKp: 3 }, { r: { 7: T('弓攻擊力+10%'), 9: { ranged: 10 } } });
  W(JG, '燃燒夢魘', '雙手矛', 170, 3, 90, '劍士系列', { ATKp: 3 }, { r: { 7: { ranged: 10 }, 9: { ranged: 10 } } });
  W(JG, '淨化之杖', '單手杖', 60, 3, 90, '服事系列', { MATK: 150, _t: '聖屬性魔法傷害+7%' }, { r: { 7: T('聖屬性魔法傷害再+13%'), 9: T('十字驅魔攻擊傷害+20%') }, t: ['不可破壞'] });

  // --- 沙漠地區 ---
  const DG = '沙漠地區';
  const BOSS = '對部分副本首領';
  W(DG, '獸人切割斧', '雙手斧', 160, 3, 50, '劍士系列、商人系列', { HIT: 5, aspd: 10, _t: '金錢攻擊傷害+15%' }, { r: { 7: { HIT: 20, aspdFlat: 1, _t: `金錢攻擊傷害再+15%、${BOSS}的物理傷害+10%` }, 9: T(`金錢攻擊傷害再+20%、${BOSS}的物理傷害再+20%`) } });
  W(DG, '獸人弓', '弓', 100, 3, 50, '弓箭手系列、流氓系列', { _t: '二連矢傷害+5%、弓攻擊力+5%' }, { r: { 7: T(`二連矢傷害再+10%、弓攻擊力再+10%、${BOSS}的物理傷害+10%`), 9: T(`二連矢傷害再+20%、${BOSS}的物理傷害再+20%`) } });
  W(DG, '獸人劍', '單手劍', 120, 3, 50, '劍士系列', { MHP: 250, healRecv: 5, _t: '狂擊傷害+5%；挑釁 SP 消耗-50%' }, { r: { 7: { healRecv: 10, _t: `狂擊傷害再+10%、${BOSS}的物理傷害+10%` }, 9: T(`狂擊傷害再+20%、${BOSS}的物理傷害再+20%`) } });
  W(DG, '獸人鐵鎚', '鈍器', 70, 3, 50, '服事系列', { MATK: 105, MSPp: 10, spRegen: 5, _t: '自己使用的治癒術效率+5%' }, { r: { 7: { spRegen: 10, _t: `治癒術效率再+15%、${BOSS}的魔法傷害+10%` }, 9: { spRegen: 20, _t: `治癒術效率再+20%、${BOSS}的魔法傷害+20%` } } });
  W(DG, '獸人鐵錘', '鈍器', 100, 3, 50, '服事系列', { HIT: 5, aspd: 5, _t: '對不死屬性敵人的物理傷害+5%；天使之擊每 Lv 再+1%' }, { r: { 7: { aspdFlat: 1, _t: '對不死屬性敵人的物理傷害再+10%' }, 9: { aspdFlat: 1, _t: '對不死屬性敵人的物理傷害再+20%；天使之擊每 Lv 再+2%' } } });
  W(DG, '死靈棒', '單手杖', 50, 3, 50, '魔法師系列、服事系列', { MATK: 125, MSP: 100, spRegen: 10, _t: '火箭術傷害+5%' }, { r: { 7: { spRegen: 10, _t: `火箭術傷害再+10%、${BOSS}的魔法傷害+10%` }, 9: T(`火箭術傷害再+20%、${BOSS}的魔法傷害再+20%`) } });
  W(DG, '獸人短劍', '短劍', 90, 3, 50, '盜賊系列', { aspdFlat: 1, _t: `${BOSS}的物理傷害+5%；二刀連擊每 Lv：ATK+1` }, { r: { 7: { aspdFlat: 1, _t: `${BOSS}的物理傷害再+10%；二刀連擊每 Lv：ATK 再+2` }, 9: { aspdFlat: 1, _t: `${BOSS}的物理傷害再+20%；二刀連擊每 Lv：ATK 再+2` } } });
  W(DG, '沙晶手杖', '單手杖', 50, 3, 50, '魔法師系列、服事系列', { MATK: 125, MSP: 100, spRegen: 10, _t: '冰箭術傷害+5%' }, { r: { 7: { spRegen: 10, _t: `冰箭術傷害再+10%、${BOSS}的魔法傷害+10%` }, 9: T(`冰箭術傷害再+15%、${BOSS}的魔法傷害+20%`) } });
  P(DG, '沙漠皮鎧甲', 'armor', 25, 50, { MHP: 250, _t: '受到地屬性敵人的傷害-5%' }, { j: '劍士系列、商人系列', r: { 7: { MHP: 150, _t: `受到${BOSS.slice(1)}的傷害-5%` }, 9: { MHP: 250, _t: `受到地屬性敵人的傷害再-5%、受到${BOSS.slice(1)}的傷害再-10%` } } });
  P(DG, '沙漠皮外袍', 'armor', 10, 50, { MHP: 100, MSP: 75, spRec: 10, MDEF: 5, _t: '加速術、天使之賜福 SP 消耗-30%' }, { j: '魔法師系列、服事系列', r: { 7: { MHP: 150, MSP: 25, spRec: 10, _t: `受到${BOSS.slice(1)}的傷害-5%` }, 9: { MHP: 250, MSP: 25, spRec: 10, _t: `受到${BOSS.slice(1)}的傷害再-10%；加速術、天使之賜福 SP 消耗再-20%` } } });
  P(DG, '沙漠皮襯衫', 'armor', 15, 50, { MHP: 100, AGI: 3, DEX: 3 }, { j: '盜賊系列、弓箭手系列、神槍手系列', r: { 7: { MHP: 150, HIT: 5, FLEE: 5, _t: `受到${BOSS.slice(1)}的傷害-5%` }, 9: { MHP: 250, HIT: 10, FLEE: 5, _t: `受到${BOSS.slice(1)}的傷害再-10%` } } });
  P(DG, '沙漠皮長靴', 'shoes', 10, 50, { MHP: 250, MSP: 50, hpRec: 30, _t: '受到地屬性敵人的傷害-5%' }, { j: '盜賊系列、弓箭手系列', r: { 7: T(`受到${BOSS.slice(1)}的傷害-7%`) } });
  P(DG, '沙漠皮便鞋', 'shoes', 5, 50, { MHP: 150, MSP: 125, spRec: 20 }, { j: '魔法師系列、服事系列', r: { 7: T(`受到${BOSS.slice(1)}的傷害-7%`) } });
  P(DG, '沙漠皮短靴', 'shoes', 10, 50, { MHP: 200, MSP: 75, aspd: 5, FLEE: 15, HIT: 10 }, { j: '盜賊系列、弓箭手系列、神槍手系列', r: { 7: T(`受到${BOSS.slice(1)}的傷害-7%`) } });
})();

// 搭配效果的精煉總和統一成 sums: [[門檻, 能力], …]

// ===== 文字效果轉成可加總的「技能／條件加成」_c: { 名稱: 數值 }（名稱結尾 # 表示不是 %）=====
// 只轉沒有條件的簡單敘述（例：「浸透勁傷害+7%」「對無形敵人、地屬性敵人的物理傷害再 +5%」）；
// 有「習得、機率、搭配、時，、：」等條件的維持文字
const GEAR_COND_RE = /習得|機率|同時裝備|一起裝備|搭配|每 ?Lv|攻擊時|時，|時:|：|×|持續|恢復|使用|施放|冷卻|消耗|觸發|忽視|移動速度|距離|可使用|上述|[（(]|依|裝備/;
function gearParseText(t) {
  if (typeof t !== 'string' || GEAR_COND_RE.test(t)) return null;
  let rest = t.replace(/\s+/g, '').replace(/−/g, '-'), subj = '';
  const out = {};
  while (rest) {
    const m = rest.match(/^[、，,；;]?(.+?)([+\-])(\d+(?:\.\d+)?)(%?)(?=$|[、，,；;])/);
    if (!m) return null;
    let label = m[1].replace(/(額外)?再$/, '').replace(/額外$/, '');
    if (/^(傷害|變動詠唱|物理傷害|魔法傷害)$/.test(label) && subj) label = subj + label;
    const sm = label.match(/^(.*?)(變動詠唱|傷害)$/); if (sm && sm[1]) subj = sm[1].replace(/的?(物理|魔法|物理／魔法)?$/, '');
    const key = label + (m[4] ? '' : '#');
    out[key] = (out[key] || 0) + (m[2] === '-' ? -1 : 1) * +m[3];
    rest = rest.slice(m[0].length);
  }
  return Object.keys(out).length ? out : null;
}
function gearConvert(eff) {
  if (!eff || typeof eff !== 'object') return;
  if (eff._t) { const c = gearParseText(eff._t); if (c) { eff._c = { ...(eff._c || {}) }; for (const [k, v] of Object.entries(c)) eff._c[k] = (eff._c[k] || 0) + v; delete eff._t; } }
  if (eff._lv) gearConvert(eff._lv[1]);
  for (const k of ['_ps', '_if']) for (const x of eff[k] || []) gearConvert(x[2]);
}
for (const it of GEAR_DB) {
  gearConvert(it.b);
  for (const k of Object.keys(it)) if (/^p\d+$/.test(k)) gearConvert(it[k]);
  if (it.pf) gearConvert(it.pf[1]);
  for (const e of Object.values(it.r || {})) gearConvert(e);
  for (const c of it.w2 || []) { gearConvert(c.b); for (const x of c.sums || (c.sum ? [c.sum] : [])) gearConvert(x[1]); }
  // 永遠生效的文字（t）能解析的也併進基本能力
  if (it.t) it.t = it.t.filter(x => { const c = gearParseText(x); if (!c) return true; it.b = it.b || {}; it.b._c = { ...(it.b._c || {}) }; for (const [k, v] of Object.entries(c)) it.b._c[k] = (it.b._c[k] || 0) + v; return false; });
}
for (const st of GEAR_SETS) { gearConvert(st.b); if (st.sum) gearConvert(st.sum[1]); }


// ===== 其他魔物掉落 =====
// 銀月魔女的皮鞋：官方裝備道具查詢平台
GEAR_DB.push({ n: '銀月魔女的皮鞋', g: '尼芙菲姆', s: 'shoes', def: 10, lv: 60, ref: true, b: { FLEE: 15, CRI: 3 }, r: { 7: { HIT: 15 }, 9: { aspd: 7 } }, t: ['1 洞', '銀月魔女掉落'] });

// ===== 雷吉亞狩獵（官方裝備道具查詢平台）=====
(() => {
  const G = '雷吉亞';
  const A6 = n => ({ STR: n, AGI: n, VIT: n, INT: n, DEX: n, LUK: n });
  GEAR_DB.push({ n: '雷吉亞狩獵鎧甲', g: G, s: 'armor', def: 25, lv: 50, ref: true, b: { MHP: 500, MSP: 100, _c: { '對動物型、昆蟲型魔物的物理／魔法傷害': 7 } }, p3: { MHP: 50, MSP: 20 }, t: ['1 洞'] });
  GEAR_DB.push({ n: '雷吉亞狩獵斗篷', g: G, s: 'garment', def: 9, lv: 50, ref: true, b: { FLEE: 15, aspd: 5, _c: { '受動物型、昆蟲型魔物的物理／魔法傷害': -7 } }, p3: { vct: 2 }, t: ['1 洞'] });
  GEAR_DB.push({ n: '雷吉亞狩獵長靴', g: G, s: 'shoes', def: 5, lv: 50, ref: true, b: { aspd: 5 }, p3: { HIT: 2 }, t: ['1 洞'] });
  GEAR_DB.push({ n: '雷吉亞狩獵面具', g: G, s: 'headMid', def: 2, lv: 50, b: A6(-10), t: ['1 洞'] });
  const three = ['雷吉亞狩獵鎧甲', '雷吉亞狩獵斗篷', '雷吉亞狩獵長靴'];
  // each：三件「各自」精煉 +9 以上
  GEAR_SETS.push({ g: G, label: '雷吉亞狩獵（3 件）', items: three, b: { vct: 7, ATK: 20, MATK: 20, ranged: 7 }, each: [9, { vct: 5, aspd: 5, crit: 7 }] });
  GEAR_SETS.push({ g: G, label: '雷吉亞狩獵（含面具）', items: [...three, '雷吉亞狩獵面具'], b: A6(10) });
})();

// ===== 異世之靈（官方裝備道具查詢平台）：頭上／中、全職業、Lv1；精煉 +9 依職業生效（_job）=====
(() => {
  const G = '異世之靈';
  const I = (n, p2, r7, jobs) => GEAR_DB.push({ n: '異世之靈-' + n, g: G, s: 'headTop', def: 2, lv: 1, ref: true, occ: ['headMid'], b: {}, p2, r: { 7: r7, 9: { _job: jobs } } });
  I('白鳥', { AGI: 1, FLEE: 1 }, { STR: 3 }, [
    ['騎士系列', { melee: 5, _t: '雙劍格擋習得等級每 +1，FLEE+2' }],
    ['十字軍系列', { ranged: 5, CRI: 12, _c: { '加農砲攻擊傷害': 18 } }],
    ['鐵匠系列', { melee: 5, _t: '施放大地之擊時，一定機率 30 秒內 LUK+100' }]]);
  I('貓頭鷹', { LUK: 1, MHP: 50 }, { DEX: 3 }, [
    ['獵人系列', { ranged: 5, CRI: 12, _c: { '銳利射擊傷害': 18 } }],
    ['吟遊詩人／舞孃系列', { ranged: 5, vct: 6, _c: { '樂器攻擊／纏箭投擲傷害': 18 } }]]);
  I('天鵝', { INT: 1, spCost: -2 }, { VIT: 3 }, [
    ['巫師系列', { vct: 6, _c: { '風屬性魔法傷害': 5, '雷鳴術傷害': 18 } }],
    ['賢者系列', { vct: 6, _c: { '地屬性魔法傷害': 5, '崩裂術傷害': 18 } }],
    ['鍊金術師系列', { ranged: 5, _c: { '強酸火煙瓶投擲傷害': 18 } }]]);
  I('黑鷹', { STR: 1, MDEF: 1 }, { AGI: 3 }, [
    ['刺客系列', { melee: 5, _c: { '黑暗瞬間傷害': 18 } }],
    ['流氓系列', { ranged: 5, _c: { '三角射擊傷害': 18 } }]]);
  I('飛燕', { LUK: 1, DEF: 10 }, { INT: 3 }, [
    ['祭司系列', { vct: 6, _c: { '十字驅魔傷害': 18 } }],
    ['武道家系列', { melee: 5, aspdFlat: 1, _c: { '猛龍誇強傷害': 18 } }]]);
  I('粉色海洋', { VIT: 1, MHPp: 1 }, { ATK: 25 }, [
    ['騎士系列', { ranged: 5, _c: { '螺旋擊刺傷害': 18 }, _t: '受物理攻擊時，一定機率對自己施放加速術 Lv10' }],
    ['十字軍系列', { ranged: 5, _c: { '連續盾擊傷害': 18 }, _t: '受物理攻擊時，一定機率對自己施放霸體 Lv1（依習得等級）' }],
    ['鐵匠系列', { melee: 5, _c: { '手推車終結技傷害': 18 }, _t: '受物理攻擊時，一定機率對自己施放手推車加速 Lv1' }]]);
  I('綠色海洋', { LUK: 1, aspd: 1 }, { ATK: 25 }, [
    ['獵人系列', { AGI: 7, _c: { '閃電衝擊傷害': 18 }, _t: '普通攻擊時，一定機率施放閃電衝擊 Lv1（依習得等級，機率受基礎 LUK 影響，遠距離減半）' }],
    ['吟遊詩人／舞孃系列', { ranged: 5, aspd: 10, _t: '施放樂器攻擊／纏箭投擲時，一定機率施放陣痛之聲 Lv1' }]]);
  I('藍色海洋', { INT: 1, vct: 1 }, { ATK: 20, MATK: 20 }, [
    ['巫師系列', { _c: { '無屬性魔法傷害': 5, '重力原野傷害': 18 }, _t: '普通攻擊時，一定機率施放重力原野 Lv1（依習得等級）' }],
    ['賢者系列', { _c: { '風屬性魔法傷害': 5, '雷爆術傷害': 18 }, _t: '普通攻擊時，一定機率對自己施放風屬性附加 Lv1（依習得等級）' }],
    ['鍊金術師系列', { ranged: 5, _c: { '強酸投擲傷害': 20 }, _t: '施放強酸投擲時，再施放魔法效果解除 Lv1' }]]);
  I('橘色海洋', { STR: 1, MDEF: 1 }, { ATK: 25 }, [
    ['刺客系列', { melee: 5, _c: { '毒性感染傷害': 18 }, _t: '施放毒刃時，一定機率再施放毒性感染 Lv1（依習得等級）' }],
    ['流氓系列', { ranged: 5, _c: { '三角射擊傷害': 18 }, _t: '施放二連矢時，一定機率再施放三角射擊 Lv1（依習得等級）' }],
    ['忍者系列', { melee: 5, _c: { '隱身攻擊傷害': 18 }, _t: '施放霧裡砍劈時，再施放隱身攻擊 Lv1（依習得等級）' }]]);
  I('黃色海洋', { AGI: 1, DEF: 10 }, { ATK: 20, MATK: 20 }, [
    ['祭司系列', { spCost: -7, spRec: 20, _t: '習得二道聖光 Lv10 時，普通攻擊一定機率施放天使之怒 Lv1' }],
    ['武道家系列', { melee: 7, _c: { '猛虎硬爬山傷害': 18 }, _t: '施放猛虎硬爬山時，再施放彈指神通 Lv1（依習得等級）' }],
    ['神槍手系列', { MATKp: 5, _c: { '對全體型魔物的魔法傷害': 18 }, _t: '武器為格林機槍時，普通攻擊一定機率施放雷擊術 Lv10' }]]);
  GEAR_DB.filter(x => x.g === G).forEach(x => x.t = [x.n.includes('海洋') ? '取得：異世之靈（海洋）頭盔自選箱' : '取得：異世之靈頭盔自選箱']);
})();

// ===== 城戰（下級／中級公會員，官方裝備道具查詢平台）：說明標註「※WOE-FE戰區追加屬性」=====
(() => {
  const G = '城戰';
  const PD = '對玩家的物理傷害', PI = '忽視玩家的物理防禦力', MD = '對玩家的魔法傷害', MI = '忽視玩家的魔法防禦力', RES = '玩家抗性';
  const wp = (n, type, w, j, b, more) => GEAR_DB.push({ n, g: G, s: 'weapon', type, w, wl: 3, lv: 70, j, ref: true, b, ...more });
  // 物理武器：[名稱, 類型, 下級ATK, 中級ATK, 職業, 對玩家物理%, 忽視防禦%, +9 額外文字, +10 文字]
  const PHYS = [
    ['水紋之劍', '單手劍', 110, 130, '十字軍系列', 20, 5, '', '犧牲執行成功時，30 秒內施法者最多 MHP+1000，武器精煉每 +1 最多再 +50'],
    ['長柄短劍', '短劍', 90, 110, '初學者系列、劍士系列、弓箭手系列、盜賊系列、魔法師系列、商人系列、忍者系列', 15, 5, '', '使用隱匿時，20 秒內潛擊攻擊力+50%、HIT+30'],
    ['切削之斧', '單手斧', 110, 130, '劍士系列、商人系列', 20, 5, '', '使用強酸攻擊、金錢攻擊時，一定機率觸發致命傷口 Lv1'],
    ['步兵長矛', '單手矛', 110, 130, '劍士系列', 20, 5, '', '挑釁成功時，10 秒內連刺攻擊傷害+20%；連刺攻擊一定機率昏迷、黑暗（依長槍使用熟練度提高）'],
    ['昇龍拳套', '拳套', 40, 80, '武僧系列、祭司系列', 25, 5, '', '阿修羅霸凰拳固定詠唱-30%；使用爆氣時 20 秒內 ATK+30，精煉每 +1 再增加'],
    ['吉他', '樂器', 70, 90, '吟遊詩人系列', 15, 5, '', '使用臨機應變技時，60 秒內樂器攻擊傷害+30%、HIT+20、變動詠唱-30%（依精煉再增加）'],
    ['細刃鞭子', '鞭子', 70, 90, '舞孃系列', 15, 5, '', '使用臨機應變技時，60 秒內纏箭投擲傷害+30%、HIT+20、變動詠唱-30%（依精煉再增加）'],
    ['日星錘', '鈍器', 110, 130, '初學者系列、劍士系列、商人系列、服事系列', 20, 5, '', '一般物理攻擊一定機率昏迷、攻擊後延遲-10%（依鈍器使用熟練度提高昏迷機率）'],
    ['十字巨劍', '雙手劍', 175, 195, '劍士系列', 25, 10, '', '一般物理攻擊一定機率 7 秒內再忽視玩家物理防禦力 10%（依精煉再 +1%）'],
    ['秘刃闇嘯', '拳刃', 125, 145, '刺客系列', 20, 5, '', '一般物理攻擊一定機率 7 秒內暴擊傷害+20%（依精煉再 +2%）'],
    ['雙手斧', '雙手斧', 175, 195, '鐵匠系列、鍊金術師系列', 25, 10, '一般物理攻擊一定機率觸發致命傷口、攻擊後延遲-10%', '使用凶砍時，20 秒內物理攻擊低機率破壞敵人武器（依精煉提高）'],
    ['長矛', '雙手矛', 220, 240, '劍士系列', 25, 10, '', '連刺攻擊一定機率昏迷、聖十字攻擊一定機率沉默（依精煉提高）'],
    ['獵人之弓', '弓', 90, 110, '盜賊系列、弓箭手系列、流氓系列', 20, 10, '', '使用心神凝聚時，10 秒內二連矢傷害+20%、HIT+20（依精煉再增加）'],
  ];
  for (const [n, type, w1, w2, j, pd, pi, t9, t10] of PHYS) for (const [tier, w] of [['下級', w1], ['中級', w2]])
    wp(tier + '公會員' + n, type, w, j, { _c: { [PD]: pd, [PI]: pi } },
      { p1: { _c: { [PD]: 1 } }, r: { 7: { _c: { [PI]: 5 } }, 9: { _c: { [PD]: 15 }, ...(t9 ? { _t: t9 } : {}) }, 10: { _t: t10 } } });
  for (const [tier, m1, m2] of [['下級', 115, 180], ['中級', 140, 200]]) {
    wp(tier + '公會員言靈魔杖', '單手杖', 60, '魔法師系列、服事系列', { MATK: m1, _c: { [MD]: 15, [MI]: 10 } },
      { p1: { _c: { [MD]: 1 } }, p2: { MATK: 5 }, r: { 7: { _c: { [MI]: 5 } }, 9: { _c: { [MD]: 5 } }, 10: { _t: '地元素領域變動詠唱-30%；使用水／風／火元素領域時，10 秒內所有魔法少消耗 1 個礦石' } } });
    wp(tier + '公會員毀滅魔杖', '雙手杖', 70, '魔法師系列、服事系列', { MATK: m2, _c: { [MD]: 15, [MI]: 10 } },
      { p1: { MHPp: -2, _c: { [MD]: 1, '隕石術、暴風雪傷害': 3 } }, p2: { MATK: 5 }, r: { 7: { _c: { [MI]: 10 } }, 9: { _c: { [MD]: 5 } } } });
  }
  wp('中級公會員治癒之杖', '單手杖', 70, '魔法師系列、服事系列', { MATK: 145, heal: 10, _c: { '技能後延遲': -5 } },
    { p1: { heal: 1, _c: { '加速術、天使之賜福 SP 消耗量': -2 } }, r: { 7: { heal: 5 }, 9: { heal: 10 }, 10: { _t: '使用治癒術時，一定機率 10 秒內治癒量+25%（精煉每 +1 再 +1%）' } } });

  // 防具
  const ar = (n, s, def, j, b, more) => GEAR_DB.push({ n, g: G, s, def, lv: 70, j, ref: true, b, ...more });
  const MAGE = '初學者系列、魔法師系列、服事系列', LIGHT = '劍士系列、商人系列、盜賊系列、弓箭手系列、忍者系列、神槍手系列', HEAVY = '劍士系列、商人系列';
  const R = n => ({ [RES]: n });
  ar('下級公會員外袍', 'armor', 25, MAGE, { MHP: 700, MSP: 50, MDEF: 5, _c: R(2) });
  ar('下級公會員外套', 'armor', 30, LIGHT, { MHP: 800, MDEF: 5, _c: R(3) });
  ar('下級公會員鋼鐵鎧甲', 'armor', 50, HEAVY, { MHP: 900, _c: R(4) });
  ar('下級公會員斗篷', 'garment', 16, '劍士系列、魔法師系列、弓箭手系列、服事系列、商人系列、盜賊系列、忍者系列、神槍手系列', { MHP: 250, MDEF: 1, _c: R(2) });
  ar('下級公會員圍巾', 'garment', 7, '', { MHP: 150, MDEF: 1, _c: R(1) });
  ar('下級公會員鞋子', 'shoes', 7, MAGE, { MHP: 250, MDEF: 5, _c: R(1) });
  ar('下級公會員長靴', 'shoes', 10, LIGHT, { MHP: 400, MDEF: 3, _c: R(2) });
  ar('下級公會員重靴', 'shoes', 15, HEAVY, { MHP: 500, MDEF: 1, _c: R(3) });
  ar('中級公會員外袍', 'armor', 25, MAGE, { MHP: 1050, MSP: 150, MDEF: 5, _c: R(3) }, { r: { 7: { MATKp: 5 } } });
  ar('中級公會員外套', 'armor', 30, LIGHT, { MHP: 1150, MSP: 100, MDEF: 5, _c: R(4) }, { r: { 7: { ATKp: 5 } } });
  ar('中級公會員鎧甲', 'armor', 50, HEAVY, { MHP: 1250, MSP: 50, _c: R(5) }, { r: { 7: { _c: R(2) } } });
  ar('中級公會員斗篷', 'garment', 16, '', { MHP: 350, MDEF: 2, _c: R(3) }, { r: { 7: { _c: R(2) } } });
  ar('中級公會員圍巾', 'garment', 7, '', { MHP: 250, MDEF: 2, _c: R(3) }, { r: { 7: { ATK: 35, MATK: 35 } } });
  ar('中級公會員鞋子', 'shoes', 7, MAGE, { MHP: 350, MDEF: 7, _c: R(1) }, { r: { 7: { MHPp: 10, _c: R(1) } } });
  ar('中級公會員長靴', 'shoes', 10, LIGHT, { MHP: 550, MDEF: 4, _c: R(2) }, { r: { 7: { MHPp: 10, _c: R(1) } } });
  ar('中級公會員重靴', 'shoes', 15, HEAVY, { MHP: 750, MDEF: 2, _c: R(3) }, { r: { 7: { MHPp: 10, _c: R(1) } } });
  for (const x of GEAR_DB) if (x.g === G && x.j === '') delete x.j;
  // 3 件精煉總和 21 以上
  const set = (tier, label, items, eff) => GEAR_SETS.push({ g: G, label: `${tier}公會員（${label}）`, items: items.map(x => tier + '公會員' + x), b: {}, sum: [21, eff] });
  set('下級', '外袍', ['外袍', '鞋子', '圍巾'], { MHP: 700, _c: R(6) });
  set('下級', '外套', ['外套', '長靴', '斗篷'], { MHP: 800, _c: R(7) });
  set('下級', '鋼鐵鎧甲', ['鋼鐵鎧甲', '重靴', '斗篷'], { MHP: 900, _c: R(8) });
  set('中級', '外袍', ['外袍', '鞋子', '圍巾'], { MHP: 1600, _c: R(7) });
  set('中級', '外套', ['外套', '長靴', '斗篷'], { MHP: 1800, _c: R(8) });
  set('中級', '鎧甲', ['鎧甲', '重靴', '斗篷'], { MHP: 2000, _c: R(9) });
})();

// ===== Lv100 其他飾品／頭飾（官方裝備道具查詢平台；取得地區待確認）=====
(() => {
  const G = '其他';
  GEAR_DB.push({ n: '古代菲力卡的頭箍', g: G, s: 'headTop', def: 0, lv: 100, ref: true, b: { MDEF: 10, INT: 2, MSP: 50 },
    t: ['使用治癒術時，低機率 15 秒內治癒量+15%（精煉越高機率越高）'], w2: [{ with: ['古代摩菲斯臂環'], b: { spRegen: 20 } }, { with: ['古代摩菲斯戒指'], b: { spCost: -5 } }] });
  GEAR_DB.push({ n: '古代摩菲斯戒指', g: G, s: 'accR', def: 0, lv: 100, ref: true, b: { INT: 1, MSPp: 3 }, r: { 7: { MSPp: 1 }, 9: { MSPp: 2, spCost: -2 } } });
  GEAR_DB.push({ n: '古代摩菲斯臂環', g: G, s: 'accL', def: 0, lv: 100, ref: true, b: { VIT: 1, MSPp: 3 }, r: { 7: { MSPp: 1 }, 9: { MSPp: 2, spRec: 20 } } });
  const FALCON = { AGI: 1, LUK: 1, _c: { '閃電衝擊、獵鷹突擊傷害': 5 } };
  GEAR_DB.push({ n: '尾翎', g: G, s: 'headLow', def: 0, lv: 100, j: '獵人系列', ref: false, b: { ...FALCON } });
  GEAR_DB.push({ n: '獵鷹拳套', g: G, s: 'accR', def: 5, lv: 100, j: '獵人系列', ref: false, b: { ...FALCON },
    w2: [{ with: ['尾翎'], b: { _c: { '閃電衝擊、獵鷹突擊傷害': 10 }, _t: '一般遠距離物理攻擊時，高機率自動施放閃電衝擊（依習得等級）' } }] });
  GEAR_DB.push({ n: '貓眼', g: G, s: 'headMid', def: 3, lv: 90, ref: false, b: { FLEE: 5, aspd: 1 } });
  GEAR_DB.push({ n: '烏鴉天狗面具', g: G, s: 'headMid', def: 10, lv: 90, ref: false, b: { CRI: 3, crit: 3 } });
  // 雙龍戒指：左右邊效果不同，拆成兩個選項
  GEAR_DB.push({ n: '雙龍戒指（左邊）', g: G, s: 'accL', def: 0, lv: 100, ref: true, b: { _c: { '連環全身掌、猛龍誇強傷害': 5 } }, r: { 9: { _c: { '連環全身掌、猛龍誇強傷害': 10 } } }, t: ['官方同一件「雙龍戒指」，裝在左邊的效果'] });
  GEAR_DB.push({ n: '雙龍戒指（右邊）', g: G, s: 'accR', def: 0, lv: 100, ref: true, b: { ATK: 3, aspd: 3 }, r: { 9: { ATK: 12, aspd: 5 } }, t: ['官方同一件「雙龍戒指」，裝在右邊的效果'] });
})();

// ===== 鯊魚寶寶聯名（官方裝備道具查詢平台）=====
GEAR_DB.push({ n: '鯊魚寶寶背包', g: '鯊魚寶寶聯名', s: 'garment', def: 0, lv: 1, ref: false, b: {},
  t: ['搭配「(服飾)鯊魚寶寶面具(歸屬)」：FLEE+15、CRI+8', '插「鯊魚寶寶卡片」：ATK+30、攻擊後延遲-8%', '插「鯊魚家族卡片」：MATK+30、變動詠唱-8%', '可使用回歸普隆德拉'] });

// 必須放在檔案最後：w2 搭配的精煉總和統一成 sums 陣列
for (const it of GEAR_DB) for (const c of it.w2 || []) c.sums = c.sums || (c.sum ? [c.sum] : []);
