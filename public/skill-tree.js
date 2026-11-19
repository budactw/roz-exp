// 技能樹（技能樹頁、配裝頁共用）。資料：skill-data.js（SKILLS、SKILL_TREES）
// 點數狀態：{ 技能編號: 等級 }。基本技能固定 9、任務／靈魂技能固定 1，都不佔點數。
// 點數上限：一轉 49（Job 50）；二轉＝Job 等級 − 1；一轉點超過的部分從二轉扣（同 rz.fharr.com 的算法）。只有一頁的職業（忍者、神槍手）上限＝Job 等級 − 1。
const SkillTree = (() => {
  const BASIC = 1;
  const fixedLv = sid => sid === BASIC ? 9 : SKILLS[sid] && SKILLS[sid].q ? 1 : null;
  const lvOf = (state, sid) => fixedLv(sid) ?? Math.max(0, Math.min(SKILLS[sid] ? SKILLS[sid].m : 0, +(state || {})[sid] || 0));
  const pagesOf = cls => (typeof SKILL_TREES !== 'undefined' && SKILL_TREES[cls]) || [];
  const idsOf = cls => pagesOf(cls).map(p => Object.values(p.pos));
  const caps = (cls, jl) => { const j = Math.max(1, Math.min(70, jl || 70)) - 1; return pagesOf(cls).length > 1 ? [49, j] : [j]; };
  // 各頁已用點數（一轉超過上限的部分算到二轉）
  function used(cls, state, jl) {
    const cap = caps(cls, jl), u = idsOf(cls).map(ids => ids.reduce((a, sid) => a + (fixedLv(sid) == null ? lvOf(state, sid) : 0), 0));
    if (u.length > 1 && u[0] > cap[0]) { u[1] += u[0] - cap[0]; u[0] = cap[0]; }
    return u.map((n, i) => [n, cap[i]]);
  }
  // 遊戲的職業編號：技能說明裡「9習得條件」的 9＝巫師；有些技能依職業有不同的前置（jr，例如崩裂術：巫師要地震術 3、賢者只要 1）
  const JOB_ID = { 1: '劍士', 2: '魔法師', 3: '弓箭手', 4: '服事', 5: '商人', 6: '盜賊', 7: '騎士', 8: '祭司', 9: '巫師', 10: '鐵匠', 11: '獵人', 12: '刺客', 14: '十字軍', 15: '武道家',
    16: '賢者', 17: '流氓', 18: '鍊金術師', 19: '吟遊詩人', 20: '舞孃', 23: '超級初學者', 24: '神槍手', 25: '忍者' };
  const JT = { 1: 'JT_SWORDMAN', 2: 'JT_MAGICIAN', 3: 'JT_ARCHER', 4: 'JT_ACOLYTE', 5: 'JT_MERCHANT', 6: 'JT_THIEF', 7: 'JT_KNIGHT', 8: 'JT_PRIEST', 9: 'JT_WIZARD', 10: 'JT_BLACKSMITH',
    11: 'JT_HUNTER', 12: 'JT_ASSASSIN', 14: 'JT_CRUSADER', 15: 'JT_MONK', 16: 'JT_SAGE', 17: 'JT_ROGUE', 18: 'JT_ALCHEMIST', 19: 'JT_BARD', 20: 'JT_DANCER', 24: 'JT_GUNSLINGER', 25: 'JT_NINJA' };
  const CLASS_JOBS = { 騎士: [1, 7], 十字軍: [1, 14], 巫師: [2, 9], 賢者: [2, 16], 獵人: [3, 11], 吟遊詩人: [3, 19], 舞孃: [3, 20], 祭司: [4, 8], 武道家: [4, 15],
    鐵匠: [5, 10], 鍊金術師: [5, 18], 刺客: [6, 12], 流氓: [6, 17], 忍者: [25], 神槍手: [24] };
  const jobsOfClass = cls => CLASS_JOBS[cls] || [];
  function needOf(sid, cls) {
    const s = SKILLS[sid]; if (!s) return [];
    if (s.jr) for (const j of jobsOfClass(cls).slice().reverse()) if (s.jr[JT[j]]) return s.jr[JT[j]];
    return s.r || [];
  }
  // 技能說明：開頭的職業編號換成職業名稱；目前職業有對應的那幾行就只留那幾行
  function descFor(lines, cls) {
    const tagged = lines.map(l => { const m = l.match(/^(\d+)(\^[0-9a-fA-F]{6}.*)$/); return m && JOB_ID[m[1]] ? [+m[1], m[2]] : null; });
    const mine = tagged.some(t => t && jobsOfClass(cls).includes(t[0]));
    return lines.flatMap((l, i) => { const t = tagged[i]; if (!t) return [l];
      if (mine) return jobsOfClass(cls).includes(t[0]) ? [t[1]] : [];
      return [`${JOB_ID[t[0]]}：${t[1]}`]; });
  }
  // 加點：前置技能不夠就一起補到需要的等級
  function raise(state, sid, to, cls) {
    const s = SKILLS[sid]; if (!s || fixedLv(sid) != null) return;
    to = Math.min(s.m, to); if (lvOf(state, sid) >= to) return;
    if (to > 0) for (const [rid, rl] of needOf(sid, cls)) raise(state, rid, rl, cls);
    state[sid] = to;
  }
  // 減點：前置不再滿足的技能歸零（連鎖）
  function lower(state, sid, to, cls) {
    if (fixedLv(sid) != null) return;
    state[sid] = Math.max(0, to); if (!state[sid]) delete state[sid];
    const all = idsOf(cls).flat();
    let changed = true;
    while (changed) {
      changed = false;
      for (const x of all) if (lvOf(state, x) > 0 && fixedLv(x) == null && needOf(x, cls).some(([rid, rl]) => lvOf(state, rid) < rl)) { delete state[x]; changed = true; }
    }
  }
  // 依名稱找技能等級（配裝資料用名稱；「練習舞蹈／操控樂器」任一個都算）
  function lvByName(cls, state, name) {
    const names = name.split('／');
    for (const ids of idsOf(cls)) for (const sid of ids) if (names.includes(SKILLS[sid].n)) return lvOf(state, sid);
    return null;
  }
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // 畫在 el 裡；opt = { cls, jl, state, onChange(state), onInfo(sid, x, y) }
  function render(el, opt) {
    const pages = pagesOf(opt.cls);
    if (!pages.length) { el.innerHTML = `<div class="st-empty">${opt.cls ? '這個職業沒有技能樹資料' : '先選職業'}</div>`; return; }
    const u = used(opt.cls, opt.state, opt.jl);
    el.innerHTML = `<div class="st-pages">` + pages.map((p, i) => {
      const rows = Math.max(4, Math.floor(Math.max(...Object.keys(p.pos).map(Number)) / 7) + 1);
      const cells = Array.from({ length: rows * 7 }, (_, k) => {
        const sid = p.pos[k]; if (sid == null || !SKILLS[sid]) return `<div class="st-cell st-blank"></div>`;
        const s = SKILLS[sid], lv = lvOf(opt.state, sid), fx = fixedLv(sid) != null;
        const lack = needOf(sid, opt.cls).filter(([rid, rl]) => lvOf(opt.state, rid) < rl).map(([rid, rl]) => `${SKILLS[rid] ? SKILLS[rid].n : rid} ${rl}`);
        return `<div class="st-cell${lv ? ' on' : ''}${fx ? ' fixed' : ''}" data-sid="${sid}" title="${esc(s.n)}${lack.length ? `（需要：${esc(lack.join('、'))}）` : ''}">
          <button type="button" class="st-ico" data-act="up" aria-label="${esc(s.n)} 加 1 級">${s.i ? `<img src="skillicons/${sid}.png" alt="" width="24" height="24" loading="lazy">` : ''}</button>
          <button type="button" class="st-name" data-act="info">${esc(s.n)}</button>
          <span class="st-lv">${fx ? `<b>${lv}</b>` : `<button type="button" data-act="down" aria-label="${esc(s.n)} 減 1 級">−</button><b>${lv}</b><small>/${s.m}</small><button type="button" data-act="up" aria-label="${esc(s.n)} 加 1 級">＋</button>`}</span>
        </div>`;
      }).join('');
      const [n, cap] = u[i];
      return `<section class="st-page"><h3>${esc(p.job)}<span class="st-pt${n > cap ? ' over' : ''}">技能點 ${n} / ${cap}</span></h3><div class="st-grid">${cells}</div></section>`;
    }).join('') + `</div>`;
    el.onclick = e => {
      const b = e.target.closest('[data-act]'), c = e.target.closest('.st-cell[data-sid]'); if (!b || !c) return;
      const sid = +c.dataset.sid, lv = lvOf(opt.state, sid);
      if (b.dataset.act === 'info') { const r = b.getBoundingClientRect(); opt.onInfo && opt.onInfo(sid, r.left, r.bottom); return; }
      if (b.dataset.act === 'up') raise(opt.state, sid, lv + (e.shiftKey ? SKILLS[sid].m : 1), opt.cls);
      else lower(opt.state, sid, e.shiftKey ? 0 : lv - 1, opt.cls);
      opt.onChange && opt.onChange(opt.state);
    };
    // 右鍵：減 1 級
    el.oncontextmenu = e => { const c = e.target.closest('.st-cell[data-sid]'); if (!c || e.target.closest('[data-act="info"]')) return; e.preventDefault();
      const sid = +c.dataset.sid; lower(opt.state, sid, lvOf(opt.state, sid) - 1, opt.cls); opt.onChange && opt.onChange(opt.state); };
  }
  // 分享連結用：只留有點的技能
  const pack = state => Object.fromEntries(Object.entries(state || {}).filter(([sid, v]) => v > 0 && SKILLS[sid] && fixedLv(+sid) == null));
  return { render, used, caps, lvOf, lvByName, raise, lower, pack, fixedLv, pagesOf, needOf, descFor };
})();
