(() => {
  for (const [k] of GEAR_SLOTS) st.slots[k] = { n: '', r: 0 };
  Object.assign(st, { job: '刺客', lv: 120, all: 9, ench: true, sk: true, skl: { '拳刃修練': 10, '高階拳刃修練': 5 }, cs: {}, ps: {} });
  const put = (k, n, r) => { st.slots[k] = { n, r: BY_NAME[n].ref ? r : 0, e: [], a: null }; };
  put('weapon', '驚駭森靈皇后的犬齒', 9); put('headTop', '異世之靈-橘色海洋', 9); put('headLow', '巨神蟒的氣息', 0);
  put('armor', '征服者轉生鎧甲', 9); put('garment', '巨神蟒蛇皮（刺客）', 0); put('shoes', '征服者轉生重靴', 9);
  put('accR', '征服者轉生戒指', 0); put('accL', '紅色盟誓戒指', 9);
  // 鎧甲附魔：每一洞挑最後一個選項
  const ea = enchSlots(BY_NAME['征服者轉生鎧甲']); st.slots.armor.e = ea.map(s => { const all = [...new Set(s.list.flatMap(([, n]) => n))]; return all.find(n => n === '十字刺客精髓2Lv') || all.find(n => /^STR\+/.test(n)) || all[all.length - 1]; });
  // 犬齒附加能力（驚駭森靈皇后的卷軸）：照名稱挑
  const pools = addonPools(BY_NAME['驚駭森靈皇后的犬齒']); const want = [/ATK%|ATK\(%\)/, /暴擊傷害/, /人類|無視/];
  if (pools.length) st.slots.weapon.a = { p: 0, v: pools[0].lines.map((l, i) => { const j = Math.max(0, l.opts.findIndex(o => want[i] && want[i].test(o[0]))); return [j, l.opts[j][4]]; }) };
  // 特殊裝備
  st.cs = { costume: '攻擊石', cMid: '攻擊石', cLow: '攻擊石', cGar: '暴擊石' };
  put('spBoard', '夜歌-繪師典藏板', 0); st.slots.spBoard.r = 10;
  put('spPet', '飼養戒指', 0); st.slots.spPet.e = ['溜溜猴 Lv2', '獸人英雄 Lv2'];
  put('spLucky', '幸運髮飾', 0);
  save(); syncInputs(); render();
})();
