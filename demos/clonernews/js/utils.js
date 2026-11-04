// ============================================================
// MODULE 1/7: utils.js
// Tiny helpers shared by every other module.
// ============================================================

// Wait some milliseconds (used to pause between retries).
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Throttle: let "fn" run at most once every "limit" ms, even if
// the event fires many times (scroll, observer, clicks...).
function throttle(fn, limit) {
  let ready = true;
  return function (...args) {
    if (!ready) return; // still cooling down -> skip this call
    ready = false;
    fn(...args);
    setTimeout(() => (ready = true), limit);
  };
}

// Turn a UNIX timestamp (seconds) into "2 hours ago".
function timeAgo(timestamp) {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  const steps = [[86400, "day"], [3600, "hour"], [60, "minute"]];
  for (const [size, name] of steps) {
    if (seconds >= size) {
      const value = Math.floor(seconds / size);
      return `${value} ${name}${value > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}
