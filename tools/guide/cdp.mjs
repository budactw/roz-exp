// 用 Chrome headless（DevTools Protocol）截配裝頁的說明圖。用法：node cdp.mjs <網址根> <輸出資料夾>
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [BASE, OUT] = process.argv.slice(2);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ['--headless=new', '--remote-debugging-port=9333', '--hide-scrollbars', '--no-first-run', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'shot-'))}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pending = new Map();
for (let i = 0; i < 50 && !ws; i++) { await sleep(200); try { const t = await (await fetch('http://127.0.0.1:9333/json')).json(); const p = t.find(x => x.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {} }
await new Promise(r => ws.addEventListener('open', r));
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400)); return r.result.result.value; };
const view = (w, h, mobile = false) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile });
const go = async url => { await send('Page.navigate', { url }); await sleep(1800); };
// 截一個或多個元素合起來的範圍（pad＝外留白）
const shot = async (name, sel, pad = 8) => {
  const r = await ev(`(() => { const els = ${JSON.stringify(sel)}.flatMap(s => [...document.querySelectorAll(s)]).filter(e => e.offsetParent || getComputedStyle(e).position === 'fixed');
    const rs = els.map(e => e.getBoundingClientRect()); const x = Math.min(...rs.map(r => r.left)), y = Math.min(...rs.map(r => r.top));
    return { x: Math.max(0, x - ${pad} + scrollX), y: Math.max(0, y - ${pad} + scrollY), w: Math.max(...rs.map(r => r.right)) - x + ${pad * 2}, h: Math.max(...rs.map(r => r.bottom)) - y + ${pad * 2} }; })()`);
  const c = await send('Page.captureScreenshot', { format: 'webp', quality: 88, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 }, captureBeyondViewport: true });
  writeFileSync(join(OUT, name + '.webp'), Buffer.from(c.result.data, 'base64')); console.log(name, Math.round(r.w), 'x', Math.round(r.h));
};
await send('Page.enable'); await send('Runtime.enable');
const steps = JSON.parse(process.env.STEPS);
for (const s of steps) {
  if (s.view) await view(...s.view);
  if (s.go) await go(BASE + s.go);
  if (s.js) { await ev(s.js); await sleep(s.wait || 500); }
  if (s.shot) await shot(s.shot, s.sel, s.pad);
}
ws.close(); chrome.kill();
