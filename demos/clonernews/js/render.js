// ============================================================
// MODULE 3/7: render.js
// Turns API data into DOM cards. Stories, Jobs and Polls share
// one card style: a type badge, the title, a meta line, plus
// the special fields of each type.
// ============================================================

// Create <tag class="className">text</tag> in one line.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// HN sends "text" fields as HTML. We strip the tags with a
// temporary element to show plain text (also XSS-safe).
function stripHTML(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent;
}

// Build one post card. "isNew" highlights cards merged live.
function createPostCard(post, isNew = false) {
  const card = el("article", "card" + (isNew ? " is-new" : ""));
  card.dataset.id = post.id;

  // Type badge: STORY / JOB / POLL.
  card.append(el("span", `badge badge-${post.type}`, post.type));

  // Title: a real link when the item has a url, plain text otherwise.
  const title = el(post.url ? "a" : "h2", "post-title", post.title);
  if (post.url) {
    title.href = post.url;
    title.target = "_blank";
  }
  card.append(title);

  // Meta line: author, date, and score when the type has one.
  const meta = [`by ${post.by}`, timeAgo(post.time)];
  if (post.score !== undefined) meta.push(`${post.score} points`);
  card.append(el("p", "meta", meta.join(" · ")));

  // Jobs and Ask-HN stories carry their body inside "text".
  if (post.text) card.append(el("p", "post-text", stripHTML(post.text)));

  // Polls keep their options as separate "pollopt" items.
  if (post.type === "poll") attachPollOptions(post, card);

  // Comments button + hidden box, filled on the first click.
  if (post.kids) {
    const button = el("button", "comments-toggle", `💬 ${post.kids.length} comments`);
    const box = el("div", "comments hidden");
    button.addEventListener("click", () => toggleComments(post, box));
    card.append(button, box);
  }
  return card;
}

// Fetch a poll's options and list them, most voted first.
async function attachPollOptions(post, card) {
  const list = el("ul", "poll-options");
  list.append(el("li", null, "Loading options…")); // small loading state
  card.append(list);
  try {
    const options = (await getItems(post.parts || [])).filter(Boolean);
    options.sort((a, b) => b.score - a.score);
    list.textContent = "";
    for (const option of options) {
      list.append(el("li", null, `${stripHTML(option.text || "")} — ${option.score} votes`));
    }
  } catch {
    list.textContent = "";
    list.append(el("li", null, "Could not load options.")); // error state
  }
}
