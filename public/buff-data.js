// 配裝頁的 Buff：效果數值取自樂園客戶端的技能說明（skill-desc.json）與物品說明
// { id 分享連結用代號, ic 道具圖示（icons/<物品編號>.png）, sk 技能圖示（skillicons/<技能編號>.png）, g 分組, n 名稱, sub 補充, max 最高等級（沒有＝只有開關）, job 只有這些職業能對自己用, wt 武器種類限制, lv 要求 Base 等級,
//   pot 攻速藥水（能不能喝看 aspd-data.js 的職業資料）, excl 不能同時存在的 Buff（可以是陣列）, e(Lv) 效果 }
// 效果用配裝的能力代號；特殊的：_ac 心神凝聚（純素質＋Job 的 AGI、DEX 加 %）、_amod 攻速的狀態修正（和攻速計算頁同一套）
const BUFF_FOOD = ['STR', 'AGI', 'VIT', 'INT', 'DEX', 'LUK'];   // 各素質料理 +1～+10（分享代號 fSTR…）；和頂級料理套餐取較高的
const BUFF_FOOD_IC = { STR: 12075, AGI: 12090, VIT: 12085, INT: 12080, DEX: 12095, LUK: 12100 };   // 料理圖示：各素質 +10 的料理
const BUFF_GROUP = { item: '天地樹、料理', potion: '藥水、道具', party: '隊友技能：祭司', smith: '隊友技能：鐵匠、商人', sage: '隊友技能：賢者', song: '隊友技能：吟遊詩人、舞孃（演奏、舞蹈、合奏）', self: '自己的技能' };
const BUFFS = (() => {
  const ALL = n => ({ STR: n, AGI: n, VIT: n, INT: n, DEX: n, LUK: n });
  const AXE_MACE = ['單手斧', '雙手斧', '鈍器'];
  return [
    { id: 'yg', ic: 23481, g: 'item', n: '天地樹祝福', sub: '天地樹魔杖、戰鬥繃帶', e: () => ({ ...ALL(7), ATK: 30, MATK: 30, HIT: 5, FLEE: 5 }) },
    { id: 'fc', ic: 23604, g: 'item', n: '頂級料理套餐', e: () => ({ ...ALL(10), ATK: 30, MATK: 30 }) },
    // 攻速藥水三選一：狀態修正和攻速計算頁相同
    { id: 'p1', ic: 645, g: 'potion', n: '集中藥水', pot: 1, excl: ['p2', 'p3'], e: () => ({ _amod: 4 }) },
    { id: 'p2', ic: 656, g: 'potion', n: '覺醒藥水', pot: 1, lv: 40, excl: ['p1', 'p3'], e: () => ({ _amod: 6 }) },
    { id: 'p3', ic: 657, g: 'potion', n: '菠色克藥水', pot: 1, lv: 85, excl: ['p1', 'p2'], e: () => ({ _amod: 9 }) },
    { id: 'ch', ic: 23605, g: 'potion', n: '挑戰藥水', e: () => ({ ATK: 30, MATK: 30, ATKp: 1, MATKp: 1, HIT: 30, FLEE: 30, aspdFlat: 1, spCost: -5, fct: 30 }) },
    { id: 'lm', ic: 23727, g: 'potion', n: '極限藥水', e: () => ({ MHPp: 5, MSPp: 5, crit: 5, ranged: 5, magicAll: 5, _t: '詠唱不會中斷' }) },
    { id: 'ws', ic: 23734, g: 'potion', n: '打磨石', e: () => ({ CRI: 30 }) },
    { id: 'ed', ic: 23728, g: 'potion', n: '能量飲料', e: () => ({ MHPp: -10, MSPp: -10, ATK: 30, MATK: 30, aspd: 5, vct: 5, _t: '物理／魔法攻擊時一定機率發動心神凝聚 Lv3' }) },
    { id: 'bl', sk: 34, g: 'party', n: '天使之賜福', max: 10, excl: 'cl', e: l => ({ STR: l, INT: l, DEX: l, HIT: 2 * l }) },
    // 慈悲術、純白百合花＝天使之賜福 Lv10、加速術 Lv10 再加施展者 Job Lv ÷ 10（以祭司 Job 70 計算）
    { id: 'cl', sk: 2041, g: 'party', n: '慈悲術', sub: '施展者 Job 70', excl: 'bl', e: () => ({ STR: 17, INT: 17, DEX: 17, HIT: 34 }) },
    { id: 'ag', sk: 29, g: 'party', n: '加速術', max: 10, excl: 'ly', e: l => ({ AGI: 2 + l, aspdP: l }) },
    { id: 'ly', sk: 2042, g: 'party', n: '純白百合花', sub: '施展者 Job 70', excl: 'ag', e: () => ({ AGI: 19, aspdP: 17 }) },
    { id: 'im', sk: 66, g: 'party', n: '神威祈福', max: 5, e: l => ({ ATK: 5 * l, MATK: 5 * l }) },
    { id: 'gl', sk: 75, g: 'party', n: '幸運之頌歌', e: () => ({ LUK: 30 }) },
    { id: 'as', sk: 361, g: 'party', n: '聖母之祈福', max: 5, e: l => ({ DEF: 50 * l, healRecv: 2 * l }) },
    { id: 'an', sk: 33, g: 'party', n: '天使之障壁', max: 10, e: l => ({ MHP: 50 * l, _t: `VIT 防禦力 +${5 * l}%` }) },
    { id: 'su', sk: 67, g: 'party', n: '犧牲祈福', max: 3, e: l => ({ vct: 5 + 5 * l }) },
    { id: 'ap', sk: 111, g: 'smith', n: '速度激發', max: 5, wt: AXE_MACE, excl: 'ad', e: l => ({ HIT: 5 + 3 * l, aspdP: 10, _amod: 6 }) },
    { id: 'ot', sk: 113, g: 'smith', n: '凶砍', max: 5, excl: 'os', e: l => ({ _t: `物理傷害 +${5 * Math.ceil(l / 2)}%` }) },
    { id: 'ld', sk: 155, g: 'smith', n: '大聲吶喊', sub: '商人系任務技能', e: () => ({ STR: 4, ATK: 30 }) },
    // 賢者的地面技能三選一（不能重疊）；屬性附加四選一（武器只能有一種屬性）
    { id: 'vo', sk: 285, g: 'sage', n: '火元素領域', max: 5, excl: ['de', 'vg'], e: l => ({ ATK: 5 + 5 * l, MATK: 5 + 5 * l, _t: `火屬性攻擊傷害 +${[10, 14, 17, 19, 20][l - 1]}%` }) },
    { id: 'de', sk: 286, g: 'sage', n: '水元素領域', max: 5, excl: ['vo', 'vg'], e: l => ({ MHPp: [5, 9, 12, 14, 15][l - 1], _t: `水屬性攻擊傷害 +${[10, 14, 17, 19, 20][l - 1]}%` }) },
    { id: 'vg', sk: 287, g: 'sage', n: '風元素領域', max: 5, excl: ['vo', 'de'], e: l => ({ FLEE: 3 * l, _t: `風屬性攻擊傷害 +${[10, 14, 17, 19, 20][l - 1]}%` }) },
    { id: 'ef', sk: 280, g: 'sage', n: '火屬性附加', max: 5, excl: ['ew', 'el', 'es'], e: l => ({ _c: { 火屬性魔法傷害: l }, _t: '武器賦予火屬性' }) },
    { id: 'ew', sk: 281, g: 'sage', n: '水屬性附加', max: 5, excl: ['ef', 'el', 'es'], e: l => ({ _c: { 水屬性魔法傷害: l }, _t: '武器賦予水屬性' }) },
    { id: 'el', sk: 282, g: 'sage', n: '風屬性附加', max: 5, excl: ['ef', 'ew', 'es'], e: l => ({ _c: { 風屬性魔法傷害: l }, _t: '武器賦予風屬性' }) },
    { id: 'es', sk: 283, g: 'sage', n: '地屬性附加', max: 5, excl: ['ef', 'ew', 'el'], e: l => ({ _c: { 地屬性魔法傷害: l }, _t: '武器賦予地屬性' }) },
    { id: 'wh', sk: 319, g: 'song', n: '吹口哨', max: 10, e: l => ({ FLEE: l < 10 ? 18 + 2 * l : 40, _c: { '完全迴避#': Math.ceil(l / 2) } }) },
    { id: 'ac', sk: 320, g: 'song', n: '刺客的黃昏', max: 10, e: l => ({ aspd: 2 * l }) },
    { id: 'id', sk: 322, g: 'song', n: '伊登的蘋果', max: 10, e: l => ({ MHPp: l < 10 ? 9 + l : 20, healRecv: 2 * l }) },
    { id: 'br', sk: 321, g: 'song', n: '布萊奇之詩', max: 10, e: l => ({ vct: 2 * l, _c: { 技能後延遲: -3 * l } }) },
    { id: 'hm', sk: 327, g: 'song', n: '哼唱之音', max: 10, e: l => ({ HIT: 8 * l }) },
    { id: 'fk', sk: 329, g: 'song', n: '女神之吻', max: 10, e: l => ({ CRI: l, crit: 2 * l }) },
    { id: 'sv', sk: 330, g: 'song', n: '為您服務', max: 10, e: l => ({ MSPp: l < 10 ? 9 + l : 20, spCost: -(5 + l) }) },
    { id: 'dr', sk: 309, g: 'song', n: '戰鼓震天', max: 5, e: l => ({ ATK: 15 + 5 * l, DEF: 15 * l }) },
    { id: 'en', sk: 8, g: 'self', job: ['騎士', '十字軍'], n: '霸體', max: 10, e: l => ({ MDEF: l }) },
    { id: 'tq', sk: 60, g: 'self', job: ['騎士'], wt: ['雙手劍'], n: '雙手劍攻擊速度增加', max: 10, e: l => ({ CRI: 2 + l, HIT: 2 * l, aspdP: 10, _amod: 7 }) },
    { id: 'lc', sk: 357, g: 'self', job: ['騎士'], n: '集中攻擊', max: 5, e: l => ({ HIT: 10 * l, ATKp: 5 + 2 * l, _t: `防禦力 −${5 + 2 * l}%` }) },
    { id: 'sq', sk: 258, g: 'self', job: ['十字軍'], wt: ['單手矛', '雙手矛'], n: '長矛加速術', max: 10, e: l => ({ CRI: 3 * l, FLEE: 2 * l, aspdP: 10, _amod: 7 }) },
    { id: 'mp', sk: 366, g: 'self', job: ['巫師'], n: '魔力增幅', max: 10, e: l => ({ MATKp: 5 * l }) },
    { id: 'ex', sk: 270, g: 'self', job: ['武道家'], n: '爆氣', max: 5, e: l => ({ CRI: 7.5 + 2.5 * l }) },
    { id: 'ad', sk: 111, g: 'self', job: ['鐵匠'], wt: AXE_MACE, n: '速度激發', excl: 'ap', max: 5, e: l => ({ HIT: 5 + 3 * l, aspdP: 10, _amod: 7 }) },
    { id: 'os', sk: 113, g: 'self', job: ['鐵匠'], n: '凶砍', excl: 'ot', max: 5, e: l => ({ _t: `物理傷害 +${5 * l}%` }) },
    { id: 'co', sk: 45, g: 'self', job: ['獵人', '吟遊詩人', '舞孃'], n: '心神凝聚', max: 10, e: l => ({ _ac: 2 + l }) },
    { id: 'ts', sk: 380, g: 'self', job: ['獵人'], n: '狙殺瞄準', max: 10, e: l => ({ ...ALL(5), CRI: l, _t: `HIT +${3 * l}%、傷害 +${2 * l}%` }) },
    { id: 'nn', sk: 543, g: 'self', job: ['忍者'], n: '念', max: 5, e: l => ({ STR: l, INT: l }) },
    { id: 'ia', sk: 506, g: 'self', job: ['神槍手'], n: '命中率遞增', e: () => ({ HIT: 20, AGI: 4, DEX: 4 }) },
    { id: 'aj', sk: 505, g: 'self', job: ['神槍手'], n: '終極閃躲', e: () => ({ HIT: -30, FLEE: 30, _t: '受到的遠距離物理傷害 −20%' }) },
    { id: 'gf', sk: 517, g: 'self', job: ['神槍手'], wt: ['格林機槍'], n: '格林狂熱', max: 10, e: l => ({ aspdP: l, FLEE: -5 * l, _t: `傷害 +${20 + 10 * l}` }) },
  ];
})();
