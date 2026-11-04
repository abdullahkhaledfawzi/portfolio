// ============================================================
// MODULE 2/7: api.js
// The only file that talks to the Hacker News API. It CACHES
// every item (the same ID is never fetched twice), batches
// requests, and retries failures with growing backoff.
// Docs: https://github.com/HackerNews/API
// ============================================================

const API_URL = "https://hacker-news.firebaseio.com/v0";

// Cache: item id -> item object. Filled once, reused forever.
const itemCache = new Map();

// fetch() wrapper with retry + backoff: up to 3 tries, waiting
// 1s, then 2s after a failed try before giving up (the caller
// shows the error). We never wait after the LAST failed try.
async function fetchJSON(url, tries = 3) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } catch (error) {
      if (attempt === tries) throw error;
      await sleep(1000 * attempt); // wait, then try again
    }
  }
}

// One item (story, job, poll, poll option or comment).
async function getItem(id) {
  if (itemCache.has(id)) return itemCache.get(id); // cache hit: 0 requests
  const item = await fetchJSON(`${API_URL}/item/${id}.json`);
  if (item) itemCache.set(id, item);
  return item;
}

// Several items at once, in parallel (our simple "batching").
function getItems(ids) {
  return Promise.all(ids.map(getItem));
}

// The ID list of one feed: top, new, best or job stories.
function getFeedIds(name) {
  return fetchJSON(`${API_URL}/${name}stories.json`);
}

// ID of the very newest item on HN (used by the live checker).
function getNewestItemId() {
  return fetchJSON(`${API_URL}/maxitem.json`);
}
