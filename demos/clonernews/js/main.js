// ============================================================
// MODULE 7/7: main.js
// Connects every module to the page: the feed tabs, progressive
// loading (Load more button + IntersectionObserver), the
// loading / error / empty states, and the live merge button.
// ============================================================

const feedList = document.querySelector("#feed");
const statusLine = document.querySelector("#status");
const loadMoreButton = document.querySelector("#load-more");

let isLoading = false; // guard: never load two pages at once

// Show a message in the status line (red when it is an error).
function setStatus(message, isError = false) {
  statusLine.textContent = message;
  statusLine.classList.toggle("error", isError);
}

// Progressive loading: append the next page of posts.
// "force" bypasses the isLoading guard: openFeed uses it to load
// page 1 while it still holds the guard against stray observer calls.
async function loadMorePosts(force = false) {
  if ((isLoading && !force) || feedFinished()) return;
  isLoading = true;
  loadMoreButton.disabled = true;
  setStatus("Loading posts…"); // loading state
  try {
    const posts = await loadNextPosts(); // next 10 items (feed.js)
    for (const post of posts) feedList.append(createPostCard(post));
    if (feedFinished()) {
      loadMoreButton.classList.add("hidden");
      setStatus("You reached the end of the feed 🎉");
    } else setStatus("");
  } catch (error) {
    setStatus(`Could not load posts (click Load more to retry). ${error.message}`, true);
  }
  isLoading = false;
  loadMoreButton.disabled = false;
}

// Open a feed from zero (app start and tab clicks).
async function openFeed(name) {
  while (isLoading) await sleep(50); // let an in-flight page of the OLD feed finish first
  isLoading = true; // block stray auto-loads while we swap feeds
  feedList.textContent = "";
  loadMoreButton.classList.remove("hidden");
  setStatus("Loading posts…");
  try {
    await setFeed(name);
    await loadMorePosts(true); // page 1 - explicit, forced past the guard
    isLoading = false; // page 1 done: the observer now owns pages 2+
    if (!feedList.firstChild && !statusLine.classList.contains("error")) {
      setStatus("Nothing to show here yet.", true); // empty state
    }
  } catch (error) {
    setStatus(`Could not load the feed. ${error.message}`, true);
  } finally {
    isLoading = false; // never leave the guard stuck if setFeed failed
  }
}

// Live merge: re-fetch the FIRST ids of the current feed, skip
// cards already on screen, and prepend the fresh ones. Nothing
// is removed or moved, so the user keeps their scroll place.
async function mergeNewPosts() {
  try {
    const ids = (await getFeedIds(feed.name)).slice(0, PAGE_SIZE); // fresh IDs
    const posts = (await getItems(ids)).filter(
      (post) => post && post.type !== "comment" && !post.dead && !post.deleted
    );
    posts.sort((a, b) => b.time - a.time); // newest first...
    posts.reverse(); // ...so prepending keeps the newest on top
    let added = 0;
    for (const post of posts) {
      if (document.querySelector(`[data-id="${post.id}"]`)) continue; // already shown
      feedList.prepend(createPostCard(post, true)); // highlighted card
      added++;
    }
    live.unseen = 0;
    document.querySelector("#live-count").textContent = "0";
    document.querySelector("#live-button").classList.add("hidden");
    showToast(added ? `✅ ${added} new post(s) merged on top.` : "ℹ️ No new posts in this feed yet.");
  } catch {
    showToast("⚠️ Could not merge new posts. Try again.");
  }
}

// Tabs: every click switches the feed (event-driven UI).
for (const tab of document.querySelectorAll(".tab")) {
  tab.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    tab.classList.add("active");
    openFeed(tab.dataset.feed);
  });
}

// The explicit "Load more" affordance (click event). The arrow wrapper
// keeps the click event object from being taken as force=true.
loadMoreButton.addEventListener("click", () => loadMorePosts());

// IntersectionObserver: when the button scrolls into view we
// auto-load more posts (throttled: at most once per 800ms).
const sentinel = new IntersectionObserver(
  throttle((entries) => {
    if (entries[0].isIntersecting) loadMorePosts();
  }, 800)
);
sentinel.observe(loadMoreButton);

// Live banner button merges the new posts (throttled clicks).
document.querySelector("#live-button").addEventListener("click", throttle(mergeNewPosts, 1000));

// App start: open the default feed and start the 5s live loop.
openFeed("top");
startLive();
