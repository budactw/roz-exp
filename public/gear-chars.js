// 配裝、技能樹頁的角色名單：{ cur, chars: { id: { name, gear } } }
// 和每日任務、期間活動、攻速計算的角色（roz-daily-v1）分開，新增、刪除、改名、排序、切換都不會互相影響
const GEAR_CHAR_KEY = 'roz-gear-chars-v1';
// 第一次載入：從舊的共用名單搬過來（有配裝的角色，加上配裝頁正在用的角色）；舊資料留著不刪
(function migrateGearChars() {
  try {
    if (localStorage.getItem(GEAR_CHAR_KEY) !== null) return;
    const d = JSON.parse(localStorage.getItem('roz-daily-v1') || 'null'), out = { cur: null, chars: {} };
    const using = localStorage.getItem('roz-gear-who') === 'char' && d && d.cur;
    if (d && d.chars) for (const [id, c] of Object.entries(d.chars)) {
      if (c && (c.gear || id === using)) out.chars[id] = { name: String(c.name || '角色'), gear: c.gear || { slots: {} } };
    }
    out.cur = out.chars[d && d.cur] ? d.cur : Object.keys(out.chars)[0] || null;
    localStorage.setItem(GEAR_CHAR_KEY, JSON.stringify(out));
  } catch (e) {}
})();
