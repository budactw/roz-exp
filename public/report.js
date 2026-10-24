// 回報問題：右下角按鈕 + 表單 → POST /api/report；另外自動捕捉 JS 錯誤
(function () {
  const $ = id => document.getElementById(id);
  const KEYS = ['roz-exp-calc-v2', 'roz-daily-v1'];
  function snapshot() {
    const out = {};
    for (const k of KEYS) { const v = localStorage.getItem(k); if (v) out[k] = v.length > 420 ? v.slice(0, 420) + '…' : v; }
    return JSON.stringify(out).slice(0, 900);
  }
  function ctx(withState) {   // 只有使用者主動回報才附上填的資料；自動錯誤回報不帶
    const base = { page: withState ? location.href : location.origin + location.pathname, ua: navigator.userAgent, viewport: `${innerWidth}×${innerHeight}` };
    return withState ? { ...base, state: snapshot() } : base;
  }
  async function send(kind, text, contact, hp) {
    const r = await fetch('/api/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind, text, contact, hp, ...ctx(kind === 'user') }) });
    let data = {}; try { data = await r.json(); } catch {}
    return { status: r.status, ...data };
  }

  // ---- UI ----
  window.openBug = function () { document.getElementById('bugModal').classList.add('open'); setTimeout(() => document.getElementById('bugText').focus(), 50); };
  document.body.insertAdjacentHTML('beforeend', `
<div class="modal" id="bugModal" onclick="if(event.target===this) this.classList.remove('open')">
  <div class="modal-card" style="max-width:440px;">
    <div class="modal-head"><b>🐞 回報問題</b><button class="btn-ghost" onclick="document.getElementById('bugModal').classList.remove('open')">✕</button></div>
    <label>發生了什麼？（必填）</label>
    <textarea id="bugText" rows="4" maxlength="1500" placeholder="例如：按了清除今日沒反應；或者數字算起來怪怪的，我填了…"></textarea>
    <label style="margin-top:10px;">聯絡方式（選填，例如 Discord ID）</label>
    <input type="text" id="bugContact" maxlength="100" placeholder="方便回覆你的話">
    <input type="text" id="bugHp" tabindex="-1" autocomplete="off" style="position:absolute; left:-9999px;" aria-hidden="true">
    <div class="hint" style="margin-top:8px;">會一併附上目前頁面、瀏覽器與你在這個工具裡填的資料，方便除錯；不會收集其他資訊。</div>
    <div class="row" style="justify-content:flex-end; margin-top:12px;">
      <span class="hint" id="bugMsg" style="margin-right:auto;"></span>
      <button class="btn-sm" id="bugSend" style="background:var(--seg-active); color:#fff; border:0;">送出</button>
    </div>
  </div>
</div>`);

  $('bugSend').addEventListener('click', async () => {
    const text = $('bugText').value.trim();
    if (text.length < 3) { $('bugMsg').innerText = '請描述一下問題。'; return; }
    $('bugSend').disabled = true; $('bugMsg').innerText = '送出中…';
    try {
      const r = await send('user', text, $('bugContact').value, $('bugHp').value);
      if (r.ok) { $('bugMsg').innerText = '已送出，謝謝回報！'; $('bugText').value = ''; if (typeof track === 'function') track('bug_report'); setTimeout(() => $('bugModal').classList.remove('open'), 1200); }
      else $('bugMsg').innerText = r.error === 'rate' ? '送太快了，請一分鐘後再試。' : `送出失敗（${r.error || r.status}），請稍後再試或直接 DC 私訊 zhuge0520。`;
    } catch (e) { $('bugMsg').innerText = '送出失敗（連線問題），請稍後再試或直接 DC 私訊 zhuge0520。'; }
    $('bugSend').disabled = false;
  });

  // ---- 自動錯誤捕捉（同一個錯誤每次開頁只送一次；本機不送）----
  const sent = new Set();
  const isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  function report(desc, noisy) {
    if (!desc || sent.has(desc) || sent.size >= 3) return;
    sent.add(desc);
    if (typeof gtag === 'function') { try { gtag('event', 'exception', { description: desc.slice(0, 150), fatal: false }); } catch {} }
    if (!isLocal && !noisy) send('auto', desc, '', '').catch(() => {});   // 跨網域遮罩錯誤只記 GA，不發 Discord
  }
  window.addEventListener('error', e => report(`${e.message} @ ${(e.filename || '').split('/').pop()}:${e.lineno}:${e.colno}`, /^Script error\.?$/.test(e.message || '') && !e.filename));
  window.addEventListener('unhandledrejection', e => report('Unhandled: ' + (e.reason && (e.reason.stack || e.reason.message || String(e.reason)) || '').slice(0, 300)));
})();
