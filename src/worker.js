// 回報問題 API：POST /api/report → 轉送到 Discord Webhook
// 短網址：POST /api/short 建立、GET /s/代號 轉到原本的分享連結
// 其他路徑由靜態資源（public/）處理
const MAX_LEN = 1500;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/short') return createShort(request, env, url);
    if (url.pathname.startsWith('/s/')) return openShort(env, url);
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

// ===== 短網址 =====
// 存 KV：key＝代號，value＝分享碼，metadata＝{ p 頁面, t 最後打開時間 }；一年沒人打開自動過期，打開時（超過 30 天才）重新計時
const SHORT_PAGES = { gear: ['/gear', 's'], skill: ['/skill', 'k'] };
const TTL = 365 * 86400, REFRESH = 30 * 86400 * 1000;
const B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

async function createShort(request, env, url) {
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  const origin = request.headers.get('Origin') || '';
  let originHost = null;
  try { originHost = origin && origin !== 'null' ? new URL(origin).host : null; } catch { originHost = null; }
  if (originHost && originHost !== url.host) return json({ ok: false, error: 'origin' }, 403);
  if (!env.SHORT) return json({ ok: false, error: 'off' }, 503);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.SHORT_LIMIT) { const { success } = await env.SHORT_LIMIT.limit({ key: ip }); if (!success) return json({ ok: false, error: 'rate' }, 429); }

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'json' }, 400); }
  const page = String(body.p || ''), code = String(body.s || '');
  if (!SHORT_PAGES[page] || !/^[\w-]{1,6000}$/.test(code)) return json({ ok: false, error: 'bad' }, 400);

  // 代號由內容雜湊而來：同一組配裝永遠拿到同一個代號；萬一撞到別的內容就加長一碼
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(page + ':' + code)));
  let n = 0n; for (const b of hash.slice(0, 12)) n = (n << 8n) | BigInt(b);
  let full = ''; while (full.length < 12) { full += B62[Number(n % 62n)]; n /= 62n; }
  for (let len = 7; len <= 12; len++) {
    const id = full.slice(0, len);
    const old = await env.SHORT.get(id);
    if (old === null) { await env.SHORT.put(id, code, { expirationTtl: TTL, metadata: { p: page, t: Date.now() } }); return json({ ok: true, id }); }
    if (old === code) return json({ ok: true, id });
  }
  return json({ ok: false, error: 'collide' }, 500);
}

async function openShort(env, url) {
  const id = url.pathname.slice(3);
  const miss = () => new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>連結已失效</title>
<body style="font-family:system-ui,sans-serif;text-align:center;padding:48px 16px;color:#334155">
<p>這個分享連結已經失效（超過一年沒有人打開），或網址不完整。</p><p><a href="/gear">打開配裝模擬器</a></p>`, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
  if (!env.SHORT || !/^[0-9A-Za-z]{7,12}$/.test(id)) return miss();
  const { value, metadata } = await env.SHORT.getWithMetadata(id);
  if (value === null || !metadata || !SHORT_PAGES[metadata.p]) return miss();
  if (!metadata.t || Date.now() - metadata.t > REFRESH) await env.SHORT.put(id, value, { expirationTtl: TTL, metadata: { p: metadata.p, t: Date.now() } });
  const [path, key] = SHORT_PAGES[metadata.p];
  return Response.redirect(`${url.origin}${path}#${key}=${value}`, 302);
}

// 遮罩 IP：IPv4 隱藏最後一組，IPv6 只留前四組
function maskIp(ip) {
  if (ip.includes(':')) return ip.split(':').slice(0, 4).join(':') + ':…';
  return ip.replace(/\.\d+$/, '.x');
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
