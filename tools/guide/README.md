# 使用說明的截圖

`public/guide/*.webp` 是 `public/gear-guide.html` 的配圖，用 Chrome headless 截配裝頁產生：

- `demo.js`：示範用的配裝（刺客、驚駭森靈皇后的犬齒、征服者轉生、特殊裝備）
- `cdp.mjs`：開 Chrome、依 `STEPS`（JSON）逐步開頁、執行程式、截指定元素

介面改版後要重截時，開好本機預覽（`npx wrangler dev --port 8787`），照這次的步驟（見 git 紀錄）重新執行即可。
