// RO樂園 週期活動資料（週期活動頁專用）
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
  { id: 'academic-2026', name: '秋日祭：學術節', start: '2026-09-08', end: '2026-11-19',
    link: 'https://roz.gnjoy.com.tw/Notice/Notice_Info?id=219166',
    note: '需先透過 Rodex 領「學術邀請信函」，開啟後取得「學術邀請信」才能與鎮內 NPC 對話；開啟後不可轉移，請選定角色。前往會場：找「秋日祭活動啵」（prontera 150,192／payon 170,84／yuno 169,187）。',
    items: [
      { id: 'ac-invite', kind: 'once', name: '活動零：學術邀請函（領取學術邀請信）', goal: '每個帳號透過 Rodex 領「學術邀請信函」，開啟後取得「學術邀請信」（不可轉移）' },
      { id: 'ac-goblin', kind: 'once', name: '活動二：害羞哥布靈的戀情最終章─哥布歐的決心', goal: '在學術鎮與哥布歐對話，看完結局', reward: '稀有服飾' },
      { id: 'ac-malice', kind: 'daily', name: '活動三：復活的惡意（普露娜絲）', npc: '普露娜絲（學術鎮）', goal: '收集道具交給普露娜絲，可重複接取' },
      { id: 'ac-copernicus', kind: 'daily', name: '活動四：實務、務實。（哥白尼祝福）', npc: '哥白尼（朱諾學術鎮）', goal: '觸碰鎮內神秘氣息取得道具，交給哥白尼', reward: '祝福：狩獵經驗值 +50%' },
      { id: 'ac-hunt', kind: 'daily', name: '活動五：直到你翱遊至盡頭（茜老闆）', npc: '茜老闆（學術鎮）', goal: '狩獵 Lv.70 以上魔物 ×300 後回報；給傑斯塔可增加耐心', reward: '禮包（隨機一項）', note: '每日一次，04:00 重置。' },
      { id: 'ac-comet', kind: 'daily', name: '活動七：彗星襲來！（阿卡伊）', npc: '野心研究家 阿卡伊（學術鎮）', goal: '完成任務', reward: '學術節硬幣 ×1（可找扭蛋雞抽學術節認證卡）', note: '每日一次，04:00 重置。扭蛋雞每 10 分鐘重置 1,000 張限制。' },
      { id: 'ac-snack', kind: 'once', name: '活動六：學術零食抽獎處（涼）', npc: '不是海邊的魔法助教─涼（學術鎮）', goal: '給學術節硬幣或哥布靈碎幣換食物（依需要）' },
      { id: 'ac-cards', kind: 'once', name: '活動八：認證卡兌換（陳資涅／羅姆）', npc: '陳資涅、羅姆（學術鎮）', goal: '用不同顏色學術節認證卡換道具；羅姆用 3 張全色認證卡換「新星冠冕」' },
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
