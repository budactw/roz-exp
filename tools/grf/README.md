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
def dec(b):
    try: return b.decode('utf-8') if b else ''
    except UnicodeDecodeError: return b.decode('cp950', 'replace')
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

## 裝備圖示

`public/icons/<物品編號>.png`（圖示）、`public/collection/<物品編號>.png`（物品資訊視窗的大圖）、`public/icon-data.js`（名稱 → 編號）、`public/desc-data.json`（名稱 → 遊戲內說明，保留色碼）都取自客戶端：

```bash
node -e "eval(require('fs').readFileSync('public/gear-data.js','utf8')+';global.G=GEAR_DB');console.log(JSON.stringify(G.map(x=>x.n)))" > /tmp/gear-names.json
python -I tools/grf/build-icons.py <data.grf> /tmp/ii64.lub /tmp/gear-names.json public/icons public/icon-data.js public/collection public/desc-data.json
```

## 卡片

`public/card-data.js`：客戶端說明「系列：卡片」的物品，說明文字用 `tools/lib/effparse.js`（和附魔同一套規則）轉成效果，「和 X 卡片一起裝備時」轉成套卡：

```bash
node tools/grf/build-cards.js /tmp/items.json public/gear-data.js public/card-data.js
```

卡片分類（一般／Boss／MVP）在 `tools/grf/card-class.json`，由 `card-class.py` 對照 rAthena 的怪物資料庫產生（掉這張卡的怪物是 MVP／Boss），樂園自己編號的卡片在程式裡的 `MANUAL` 補：

```bash
python3 -I tools/grf/card-class.py <rathena>/db/re/item_db_etc.yml <rathena>/db/re/mob_db.yml,<rathena>/db/pre-re/mob_db.yml public/card-data.js tools/grf/card-class.json
```

## 技能樹

`public/skill-data.js`、`public/skill-desc.json`、`public/skillicons/`：

```bash
python -I tools/grf/build-skills.py <data.grf> public/skill-data.js public/skill-desc.json public/skillicons
```
