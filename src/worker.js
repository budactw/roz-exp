// 回報問題 API：POST /api/report → 轉送到 Discord Webhook
// 其他路徑由靜態資源（public/）處理
const MAX_LEN = 1500;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/report') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);

    // 只接受同網域送來的請求
    // 只接受同網域送來的請求（Origin 缺少或為 "null" 的 App 內建瀏覽器放行，交給速率限制把關）
    const origin = request.headers.get('Origin') || '';
    let originHost = null;
    try { originHost = origin && origin !== 'null' ? new URL(origin).host : null; } catch { originHost = null; }
    if (originHost && originHost !== url.host) return json({ ok: false, error: 'origin' }, 403);

    // 速率限制：每個 IP 每分鐘 2 次
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (env.REPORT_LIMIT) {
      const { success } = await env.REPORT_LIMIT.limit({ key: ip });
      if (!success) return json({ ok: false, error: 'rate' }, 429);
    }

    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: 'json' }, 400); }
    const kind = body.kind === 'auto' ? 'auto' : 'user';
    const text = String(body.text || '').trim().slice(0, MAX_LEN);
    const contact = String(body.contact || '').trim().slice(0, 100);
    const page = String(body.page || '').slice(0, 200);
    const ua = String(body.ua || '').slice(0, 200);
    const viewport = String(body.viewport || '').slice(0, 40);
    const state = String(body.state || '').slice(0, 980);   // Discord 欄位上限 1024（含 code fence）
    if (kind === 'user' && text.length < 3) return json({ ok: false, error: 'empty' }, 400);
    if (body.hp) return json({ ok: true });   // 蜜罐欄位有值 → 機器人，假裝成功

    const title = kind === 'auto' ? '⚠️ 自動錯誤回報' : '🐞 使用者回報';
    const payload = {
      username: 'RO樂園工具回報',
      embeds: [{
        title,
        description: text || '（無描述）',
        color: kind === 'auto' ? 0xf59e0b : 0x3b82f6,
        fields: [
          { name: '頁面', value: page || '—', inline: false },
          { name: '聯絡方式', value: contact || '—', inline: true },
          { name: '螢幕', value: viewport || '—', inline: true },
          { name: '瀏覽器', value: ua || '—', inline: false },
          { name: '當時資料', value: state ? '```json\n' + state + (state.length >= 980 ? '…' : '') + '\n```' : '—', inline: false },
        ],
        footer: { text: `IP ${maskIp(ip)}` },
        timestamp: new Date().toISOString(),
      }],
    };

    if (!env.DISCORD_WEBHOOK) {
      console.log('[report] (no DISCORD_WEBHOOK set) ' + JSON.stringify(payload));
      return json({ ok: true, dev: true });
    }
    const r = await fetch(env.DISCORD_WEBHOOK, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) return json({ ok: false, error: 'discord ' + r.status }, 502);
    return json({ ok: true });
  },
};

// 遮罩 IP：IPv4 隱藏最後一組，IPv6 只留前四組
function maskIp(ip) {
  if (ip.includes(':')) return ip.split(':').slice(0, 4).join(':') + ':…';
  return ip.replace(/\.\d+$/, '.x');
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
