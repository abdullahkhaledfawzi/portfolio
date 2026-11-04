// ============================================================
// MODULE 6/7: live.js
// Live Data: every 5 seconds we check the ID of the newest
// item on Hacker News. If it grew, new items were published:
// we update the live banner, count them and show a toast.
// One tiny request per check = very friendly to the API.
// ============================================================

const live = { lastId: 0, unseen: 0 };

// Show a small toast at the bottom of the screen for 3 seconds.
function showToast(message) {
  const toast = el("div", "toast", message);
  document.querySelector("#toasts").append(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Update the live banner: newest item info + "new" badge.
function updateLivePanel(item) {
  document.querySelector("#live-count").textContent = live.unseen;
  document.querySelector("#live-button").classList.remove("hidden");
  const label = item.title ? stripHTML(item.title) : "#" + item.id;
  document.querySelector("#live-info").textContent =
    `🆕 Newest item: a ${item.type} by ${item.by} — ${label}`;
}

// One check: read the newest ID and compare with the last one.
async function checkLive() {
  const id = await getNewestItemId();
  if (live.lastId && id > live.lastId) {
    live.unseen += id - live.lastId; // count every new item
    const newest = await getItem(id);
    if (newest) updateLivePanel(newest);
    showToast(`🔔 ${live.unseen} new item(s) on HN (mostly comments!)`);
  }
  live.lastId = id;
}

// Start the 5-second loop (setInterval = the regular cadence).
function startLive() {
  checkLive().catch(() => {}); // first check only remembers the ID
  setInterval(() => checkLive().catch(() => {}), 5000);
}
