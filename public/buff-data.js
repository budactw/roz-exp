// 配裝頁的 Buff：效果數值取自樂園客戶端的技能說明（skill-desc.json）與物品說明
// { id 分享連結用代號, g 分組, n 名稱, sub 補充, max 最高等級（沒有＝只有開關）, job 只有這些職業能對自己用, wt 武器種類限制, lv 要求 Base 等級,
//   pot 攻速藥水（能不能喝看 aspd-data.js 的職業資料）, excl 不能同時存在的 Buff（可以是陣列）, e(Lv) 效果 }
// 效果用配裝的能力代號；特殊的：_ac 心神凝聚（純素質＋Job 的 AGI、DEX 加 %）、_amod 攻速的狀態修正（和攻速計算頁同一套）
const BUFF_FOOD = ['STR', 'AGI', 'VIT', 'INT', 'DEX', 'LUK'];   // 各素質料理 +1～+10（分享代號 fSTR…）；和頂級料理套餐取較高的
const BUFF_GROUP = { item: '天地樹、料理', potion: '藥水、道具', party: '隊友給的技能', song: '演奏、舞蹈、合奏', self: '自己的技能' };
const BUFFS = (() => {
  const ALL = n => ({ STR: n, AGI: n, VIT: n, INT: n, DEX: n, LUK: n });
  const AXE_MACE = ['單手斧', '雙手斧', '鈍器'];
  return [
    { id: 'yg', g: 'item', n: '天地樹祝福', sub: '天地樹魔杖、戰鬥繃帶', e: () => ({ ...ALL(7), ATK: 30, MATK: 30, HIT: 5, FLEE: 5 }) },
    { id: 'fc', g: 'item', n: '頂級料理套餐', e: () => ({ ...ALL(10), ATK: 30, MATK: 30 }) },
    // 攻速藥水三選一：狀態修正和攻速計算頁相同
    { id: 'p1', g: 'potion', n: '集中藥水', pot: 1, excl: ['p2', 'p3'], e: () => ({ _amod: 4 }) },
    { id: 'p2', g: 'potion', n: '覺醒藥水', pot: 1, lv: 40, excl: ['p1', 'p3'], e: () => ({ _amod: 6 }) },
    { id: 'p3', g: 'potion', n: '菠色克藥水', pot: 1, lv: 85, excl: ['p1', 'p2'], e: () => ({ _amod: 9 }) },
    { id: 'ch', g: 'potion', n: '挑戰藥水', e: () => ({ ATK: 30, MATK: 30, ATKp: 1, MATKp: 1, HIT: 30, FLEE: 30, aspdFlat: 1, spCost: -5, fct: 30 }) },
    { id: 'lm', g: 'potion', n: '極限藥水', e: () => ({ MHPp: 5, MSPp: 5, crit: 5, ranged: 5, magicAll: 5, _t: '詠唱不會中斷' }) },
    { id: 'ws', g: 'potion', n: '打磨石', e: () => ({ CRI: 30 }) },
    { id: 'ed', g: 'potion', n: '能量飲料', e: () => ({ MHPp: -10, MSPp: -10, ATK: 30, MATK: 30, aspd: 5, vct: 5, _t: '物理／魔法攻擊時一定機率發動心神凝聚 Lv3' }) },
    { id: 'bl', g: 'party', n: '天使之賜福', max: 10, excl: 'cl', e: l => ({ STR: l, INT: l, DEX: l, HIT: 2 * l }) },
    // 慈悲術、純白百合花＝天使之賜福 Lv10、加速術 Lv10 再加施展者 Job Lv ÷ 10（以祭司 Job 70 計算）
    { id: 'cl', g: 'party', n: '慈悲術', sub: '祭司 Job 70', excl: 'bl', e: () => ({ STR: 17, INT: 17, DEX: 17, HIT: 34 }) },
    { id: 'ag', g: 'party', n: '加速術', max: 10, excl: 'ly', e: l => ({ AGI: 2 + l, aspdP: l }) },
    { id: 'ly', g: 'party', n: '純白百合花', sub: '祭司 Job 70', excl: 'ag', e: () => ({ AGI: 19, aspdP: 17 }) },
    { id: 'im', g: 'party', n: '神威祈福', max: 5, e: l => ({ ATK: 5 * l, MATK: 5 * l }) },
    { id: 'gl', g: 'party', n: '幸運之頌歌', e: () => ({ LUK: 30 }) },
    { id: 'as', g: 'party', n: '聖母之祈福', max: 5, e: l => ({ DEF: 50 * l, healRecv: 2 * l }) },
    { id: 'ap', g: 'party', n: '速度激發', sub: '鐵匠給的', max: 5, wt: AXE_MACE, excl: 'ad', e: l => ({ HIT: 5 + 3 * l, aspdP: 10, _amod: 6 }) },
    { id: 'wh', g: 'song', n: '吹口哨', max: 10, e: l => ({ FLEE: l < 10 ? 18 + 2 * l : 40, _c: { '完全迴避#': Math.ceil(l / 2) } }) },
    { id: 'ac', g: 'song', n: '刺客的黃昏', max: 10, e: l => ({ aspd: 2 * l }) },
    { id: 'id', g: 'song', n: '伊登的蘋果', max: 10, e: l => ({ MHPp: l < 10 ? 9 + l : 20, healRecv: 2 * l }) },
    { id: 'br', g: 'song', n: '布萊奇之詩', max: 10, e: l => ({ vct: 2 * l, _c: { 技能後延遲: -3 * l } }) },
    { id: 'hm', g: 'song', n: '哼唱之音', max: 10, e: l => ({ HIT: 8 * l }) },
    { id: 'fk', g: 'song', n: '女神之吻', max: 10, e: l => ({ CRI: l, crit: 2 * l }) },
    { id: 'sv', g: 'song', n: '為您服務', max: 10, e: l => ({ MSPp: l < 10 ? 9 + l : 20, spCost: -(5 + l) }) },
    { id: 'dr', g: 'song', n: '戰鼓震天', max: 5, e: l => ({ ATK: 15 + 5 * l, DEF: 15 * l }) },
    { id: 'en', g: 'self', job: ['騎士', '十字軍'], n: '霸體', max: 10, e: l => ({ MDEF: l }) },
    { id: 'tq', g: 'self', job: ['騎士'], wt: ['雙手劍'], n: '雙手劍攻擊速度增加', max: 10, e: l => ({ CRI: 2 + l, HIT: 2 * l, aspdP: 10, _amod: 7 }) },
    { id: 'lc', g: 'self', job: ['騎士'], n: '集中攻擊', max: 5, e: l => ({ HIT: 10 * l, ATKp: 5 + 2 * l, _t: `防禦力 −${5 + 2 * l}%` }) },
    { id: 'sq', g: 'self', job: ['十字軍'], wt: ['單手矛', '雙手矛'], n: '長矛加速術', max: 10, e: l => ({ CRI: 3 * l, FLEE: 2 * l, aspdP: 10, _amod: 7 }) },
    { id: 'mp', g: 'self', job: ['巫師'], n: '魔力增幅', max: 10, e: l => ({ MATKp: 5 * l }) },
    { id: 'ex', g: 'self', job: ['武道家'], n: '爆氣', max: 5, e: l => ({ CRI: 7.5 + 2.5 * l }) },
    { id: 'ad', g: 'self', job: ['鐵匠'], wt: AXE_MACE, n: '速度激發', excl: 'ap', max: 5, e: l => ({ HIT: 5 + 3 * l, aspdP: 10, _amod: 7 }) },
    { id: 'co', g: 'self', job: ['獵人', '吟遊詩人', '舞孃'], n: '心神凝聚', max: 10, e: l => ({ _ac: 2 + l }) },
    { id: 'ts', g: 'self', job: ['獵人'], n: '狙殺瞄準', max: 10, e: l => ({ ...ALL(5), CRI: l, _t: `HIT +${3 * l}%、傷害 +${2 * l}%` }) },
    { id: 'nn', g: 'self', job: ['忍者'], n: '念', max: 5, e: l => ({ STR: l, INT: l }) },
    { id: 'ia', g: 'self', job: ['神槍手'], n: '命中率遞增', e: () => ({ HIT: 20, AGI: 4, DEX: 4 }) },
    { id: 'aj', g: 'self', job: ['神槍手'], n: '終極閃躲', e: () => ({ HIT: -30, FLEE: 30, _t: '受到的遠距離物理傷害 −20%' }) },
    { id: 'gf', g: 'self', job: ['神槍手'], wt: ['格林機槍'], n: '格林狂熱', max: 10, e: l => ({ aspdP: l, FLEE: -5 * l, _t: `傷害 +${20 + 10 * l}` }) },
  ];
})();
