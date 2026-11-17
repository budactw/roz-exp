# 附魔資料

`out_*.json` 是官方「遊戲指南 → 附魔系統」各專屬附魔公告圖片表格的逐項抄錄（不含機率）。

重新產生 `public/enchant-data.js`：

```bash
node tools/enchant/build-ench.js tools/enchant public/gear-data.js public/enchant-data.js
```
