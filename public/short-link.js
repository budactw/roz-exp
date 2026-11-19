// 分享用短網址：把分享碼存到 /api/short，拿回 /s/代號；失敗（離線、服務異常）就用原本的長連結
async function shortUrl(page, code, longUrl) {
  try {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 4000);
    const r = await fetch('/api/short', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ p: page, s: code }), signal: ctl.signal });
    clearTimeout(timer);
    const j = await r.json();
    if (j.ok && j.id) return `${location.origin}/s/${j.id}`;
  } catch (e) {}
  return longUrl;
}
