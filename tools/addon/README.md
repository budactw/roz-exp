# 附加能力資料

`out_*.json` 是官方「遊戲指南 → 附加能力系統」各公告圖片表格的逐項抄錄。

重新產生 `public/addon-data.js`：

```bash
node tools/addon/build-addon.js tools/addon public/addon-data.js
```

- `out_drop.json`（魔物掉落裝備，池 1～5、克雷斯特漢姆）：官方表格沒寫各池對應哪些裝備，配裝頁讓玩家自己選池；武器依類型預設近距離／遠距離／魔法，防具依部位對到池 5（披肩另有克雷斯特漢姆）。
- `out_mvp.json`（MVP 武器）、`out_smith.json`（鐵匠鍛造）、`out_lucky.json`（幸運髮飾）：配裝資料還沒有這些裝備，先保留抄錄。
