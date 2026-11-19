// 版面切換（遊戲風格／一般版面）：配裝以外的頁面共用。要放在 <head> 裡同步載入，畫面才不會先閃一下另一種版面
// 預設遊戲風格，按過「一般版面」才會記住（和配裝頁分開記）。網址加 ?ui=ro 或 ?ui=std 可指定
(() => {
  const u = new URLSearchParams(location.search).get('ui');
  if (u === 'ro' || u === 'std') localStorage.setItem('site-ui', u);
  if (localStorage.getItem('site-ui') !== 'std') document.documentElement.dataset.ui = 'ro';
})();
function syncUiBtn() { const b = document.getElementById('uiBtn'); if (b) b.innerText = document.documentElement.dataset.ui === 'ro' ? '🖥️ 一般版面' : '🎮 遊戲風格'; }
function toggleUi() {
  const ro = document.documentElement.dataset.ui !== 'ro';
  if (ro) document.documentElement.dataset.ui = 'ro'; else delete document.documentElement.dataset.ui;
  localStorage.setItem('site-ui', ro ? 'ro' : 'std'); syncUiBtn();
}
document.addEventListener('DOMContentLoaded', syncUiBtn);
