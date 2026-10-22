// RO樂園 限定活動資料（限定活動頁專用）
// 來源：官方公告 https://roz.gnjoy.com.tw/Notice
// 欄位：id、name、start/end（活動期間，YYYY-MM-DD；end 當天維護前）、link、note、
//       imgs：[{ src、alt、cap }] 參考圖（選填）
//       items：[{ id、name、kind（daily 每日 / once 一次性）、npc、map、x、y、goal、reward、note }]
const EVENT_DB = [
  { id: 'halloween-2026', name: '黃昏暗影、萬聖再臨', start: '2026-10-20', end: '2026-11-03',
    link: 'https://roz.gnjoy.com.tw/Notice/Notice_Info?id=219464',
    note: '需先透過 Rodex 領取「黃昏的契約信封」，開啟後取得「黃昏的契約」才能進行任務；契約取得後不可轉移，請選定角色。',
    items: [
      { id: 'hw-contract', kind: 'once', name: '活動零：黃昏之誓（領取黃昏的契約）', goal: '每個帳號透過 Rodex 領「黃昏的契約信封」，開啟後取得「黃昏的契約」（不可轉移）' },
      { id: 'hw-ghoul', kind: 'once', name: '活動一：綠腐屍的願望', npc: '聽懂人話的綠腐屍', map: 'gef_dun00', x: 110, y: 92, goal: '接取後前往找「普露娜絲」（morocc 69,156）', reward: '（服飾）咧嘴笑容的面具（歸屬）' },
      { id: 'hw-candy', kind: 'daily', name: '活動二：萬聖糖果祭', npc: '假扮妖道的里奇', map: 'geffen', x: 103, y: 57, goal: '六選一交材料：不死心臟 ×350／腐爛繃帶 ×400／南瓜頭 ×350／死人遺骨 ×450／龍鱗 ×300／哥布靈硬幣 ×1', reward: '2026 萬聖節糖果禮盒（開啟隨機一項）', note: '每日 04:00 重置。' },
      { id: 'hw-truth', kind: 'once', name: '活動三：神話(?)的真相', npc: '女神研究人員 薇奧娜', map: 'geffen', x: 85, y: 73, goal: '收集「研究員紀錄表」×500 交給薇奧娜', reward: '護身羽毛等' },
    ]},
  { id: 'pass-autumn', name: '樂園通行證（秋季）', start: '2026-10-20', end: '2027-01-12',
    link: 'https://roz.gnjoy.com.tw/Notice/Notice_Info?id=219454',
    note: '一般 Lv1～50 靠每日任務每日升 1 級（最晚約 11/23 開始才能拿滿）；高級 Lv51～70 每級 20 傑斯塔、共 400，不需等待天數。通行證於 2027/01/12 維護後刪除。',
    imgs: [{ src: 'img/pass-autumn-rewards.webp', alt: '樂園通行證（秋季）獎勵總數', cap: '獎勵總數一覽（點圖放大）' }],
    items: [
      { id: 'pass-daily', kind: 'daily', name: '通行證每日任務', goal: '完成當日通行證任務（每日一次）', reward: '通行證等級獎勵' },
    ]},
];
const EVENT_KIND = { daily: '每日', once: '一次性' };
