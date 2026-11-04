// ============================================================
// MODULE 5/7: feed.js
// The state of the post list: which feed is open, its list of
// IDs and how many of them we already showed. loadNextPosts()
// returns only the NEXT page of ready posts, so we never load
// everything at once (progressive loading).
// ============================================================

const PAGE_SIZE = 10; // posts loaded per step

const feed = {
  name: "top", // top | new | best | job
  ids: [],     // all IDs of the current feed
  loaded: 0,   // how many IDs we already took from "ids"
};

// Remember the ID list of a feed and reset the counter.
async function setFeed(name) {
  feed.name = name;
  feed.ids = await getFeedIds(name);
  feed.loaded = 0;
}

// Take the next PAGE_SIZE IDs, fetch those items, drop dead or
// deleted ones, and sort the page from newest to oldest.
async function loadNextPosts() {
  const slice = feed.ids.slice(feed.loaded, feed.loaded + PAGE_SIZE);
  feed.loaded += slice.length;
  const posts = (await getItems(slice)).filter(
    (post) => post && post.type !== "comment" && !post.dead && !post.deleted
  );
  posts.sort((a, b) => b.time - a.time); // newest -> oldest
  return posts;
}

// True when every ID of the feed has been loaded.
function feedFinished() {
  return feed.loaded >= feed.ids.length;
}
