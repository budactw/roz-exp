# 客戶端資料（洞數）

`public/slot-data.js` 的洞數取自樂園客戶端 `System/iteminfo_new.lub`（`data.grf` 裡的 `iteminfo.lub` 是韓服舊表，沒有樂園裝備）。

重新產生（客戶端更新後）：

```bash
# 1. 32 位元 bytecode 轉 64 位元
python3 -I tools/grf/lub64.py <System>/iteminfo_new.lub /tmp/ii64.lub
# 2. 用 Lua 5.1 讀出 { 編號: { n 名稱, s 洞數, d 說明 } }（需要 pip install lupa）
python - <<'PY'
import lupa.lua51 as L, json, re
lua = L.LuaRuntime(encoding=None); lua.execute(open('/tmp/ii64.lub','rb').read())
dec = lambda b: b.decode('utf-8') if b else ''
out = {}
for k, v in lua.globals().tbl.items():
    d = v[b'identifiedDescriptionName']
    out[int(k)] = {'n': dec(v[b'identifiedDisplayName']), 's': v[b'slotCount'] or 0,
                   'd': ' / '.join(re.sub(r'\^[0-9a-fA-F]{6}', '', dec(d[j])) for j in range(1, len(d) + 1)) if d else ''}
json.dump(out, open('/tmp/items.json', 'w'), ensure_ascii=False)
PY
# 3. 對照配裝資料產生洞數表（名稱不同的寫在 build-slots.js 的 ALIAS）
node tools/grf/build-slots.js /tmp/items.json public/gear-data.js public/slot-data.js
```

`grf.py`：列出／解出 `data.grf`（含 Event Horizon 0x300 版、傳統混淆）。
