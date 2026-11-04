// ============================================================
// MODULE 4/7: comments.js
// Comments load PROGRESSIVELY: one level at a time AND ten at
// a time ("▸ N replies" buttons + "▸ Load more" buttons), so
// even a 1000-comment thread never floods the page or the API.
// Every level is sorted from newest to oldest.
// ============================================================

const COMMENTS_PAGE = 10; // comments rendered per step

// Build one comment box: clickable head, body and (if it has
// any) a button that shows and loads its replies on demand.
function createCommentNode(comment) {
  const box = el("div", "comment");
  const head = el("p", "comment-head", `${comment.by} · ${timeAgo(comment.time)}`);
  const body = el("div", "comment-body", stripHTML(comment.text || "(no text)"));

  // Collapse / expand: clicking the head hides the text.
  head.addEventListener("click", () => body.classList.toggle("hidden"));

  box.append(head, body);
  if (comment.kids) attachRepliesButton(comment, box);
  return box;
}

// A comment with kids gets a "▸ N replies" button plus a hidden
// box: the first successful open loads ONLY that comment's kids.
function attachRepliesButton(comment, box) {
  const button = el("button", "comments-toggle", `▸ ${comment.kids.length} replies`);
  const replies = el("div", "comment-replies hidden");
  button.addEventListener("click", () => {
    replies.classList.toggle("hidden"); // show or hide the box
    if (!replies.classList.contains("hidden") && !replies.dataset.loaded) {
      renderComments(comment.kids, replies).then((loaded) => {
        if (loaded) replies.dataset.loaded = "true"; // success only
      });
    }
  });
  box.append(button, replies);
}

// Render ONE page of an already fetched + sorted list, then add
// a "Load more" button when comments remain. Clicking it draws
// the next page from memory — zero new requests to the API.
function renderCommentPage(comments, container, start = 0) {
  for (const comment of comments.slice(start, start + COMMENTS_PAGE)) {
    container.append(createCommentNode(comment));
  }
  const rest = comments.length - (start + COMMENTS_PAGE);
  if (rest <= 0) return; // everything is already on screen
  const button = el("button", "comments-toggle", `▸ Load ${Math.min(rest, COMMENTS_PAGE)} more comments`);
  button.addEventListener("click", () => {
    button.remove(); // keep the order: new cards go after old ones
    renderCommentPage(comments, container, start + COMMENTS_PAGE);
  });
  container.append(button);
}

// Fetch ONE level of comments: filter dead ones, sort newest ->
// oldest, render the first page. Returns true when it worked, so
// callers can mark their box as loaded only on success.
async function renderComments(kidIds, container) {
  container.textContent = "Loading…"; // loading state
  try {
    const comments = (await getItems(kidIds)).filter((c) => c && !c.dead && !c.deleted);
    comments.sort((a, b) => b.time - a.time); // newest -> oldest
    container.textContent = "";
    if (!comments.length) {
      container.textContent = "No comments yet."; // empty state
      return true;
    }
    renderCommentPage(comments, container); // first page only
    return true;
  } catch {
    container.textContent = "Could not load comments. Try again."; // error state
    return false;
  }
}

// Called by the card's "💬 N comments" button (see render.js).
async function toggleComments(post, box) {
  const wasHidden = box.classList.toggle("hidden");
  if (wasHidden || box.dataset.loaded) return; // just closed, or ready
  const loaded = await renderComments(post.kids, box);
  if (loaded) box.dataset.loaded = "true"; // only success = ready
}
