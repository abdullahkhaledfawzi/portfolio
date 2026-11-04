/**
 * Forum — interactive demo.
 * A faithful client-side simulation of the real Node.js + SQLite forum:
 * same Ember theme, same flows (register/login, posts, comments, votes,
 * filters). Applied state lives in memory + sessionStorage.
 */
const $ = (sel) => document.querySelector(sel);

const CATEGORIES = ['General', 'Technology', 'Sports', 'Games', 'Music', 'Movies', 'Other'];

let POSTS = [
  {
    id: 1, author: 'ahmed_mostafa', created_at: Date.now() - 1000 * 60 * 60 * 42,
    title: 'Done — built my first TCP chat server in Go with goroutines',
    content: 'It was my first real experience with concurrency. Every connection is a goroutine and shared state is guarded with a mutex. The final version supports a lobby, message broadcasting, chat history and graceful handling of disconnects.\n\nNext: custom rooms per category.',
    categories: ['Technology', 'General'],
    likes: 7, dislikes: 0, my_reaction: 0, expanded: false,
    comments: [
      { id: 1, author: 'sara.dev', created_at: Date.now() - 1000 * 60 * 60 * 40, content: 'The moment the whole room receives the message instantly is so satisfying 🙂', likes: 2, dislikes: 0, my_reaction: 0 },
      { id: 2, author: 'nada_k', created_at: Date.now() - 1000 * 60 * 60 * 35, content: '+1 for mutexes on shared maps. Learned that the hard way.', likes: 1, dislikes: 0, my_reaction: 0 },
    ],
  },
  {
    id: 2, author: 'menna.h', created_at: Date.now() - 1000 * 60 * 60 * 20,
    title: 'Docker for beginners: my notes',
    content: 'Writing down what finally made Docker click for me:\n\n1. An image is a snapshot, a container is a running instance.\n2. COPY . . before installing deps is why your builds are slow.\n3. Multi-stage builds keep the runtime image tiny.\n4. docker logs -f <name> when you think it didn\'t work.\n\nWhat tips do you swear by?',
    categories: ['Technology'],
    likes: 12, dislikes: 1, my_reaction: 0, expanded: false,
    comments: [
      { id: 3, author: 'karim95', created_at: Date.now() - 1000 * 60 * 60 * 18, content: 'Ordering layers is 90% of the win. Install deps, then copy source 👌', likes: 3, dislikes: 0, my_reaction: 0 },
    ],
  },
  {
    id: 3, author: 'nada_k', created_at: Date.now() - 1000 * 60 * 60 * 8,
    title: 'Match day!! Who are you backing tonight?',
    content: 'After the last three games I refuse to make predictions. Just going to sit back, watch and suffer like always 💪',
    categories: ['Sports'],
    likes: 4, dislikes: 2, my_reaction: 0, expanded: false,
    comments: [
      { id: 4, author: 'omar_h', created_at: Date.now() - 1000 * 60 * 60 * 7, content: 'Same. Heart says one thing, table says another.', likes: 1, dislikes: 0, my_reaction: 0 },
    ],
  },
  {
    id: 4, author: 'karim95', created_at: Date.now() - 1000 * 60 * 30,
    title: 'That price flip in the new RPG update is wild',
    content: 'Vendors rebalancing happened in the patch and half my inventory strategy is now pointless 😂 Still, the world design this season is incredible. Anyone else at chapter 4 yet?',
    categories: ['Games'],
    likes: 9, dislikes: 0, my_reaction: 0, expanded: false,
    comments: [
      { id: 5, author: 'sara.dev', created_at: Date.now() - 1000 * 60 * 20, content: 'Chapter 4 hit me hard. Screenshots don\'t do that soundtrack justice.', likes: 2, dislikes: 0, my_reaction: 0 },
      { id: 6, author: 'ahmed_mostafa', created_at: Date.now() - 1000 * 60 * 12, content: 'Build variety in chapter 4 is why it is worth it. Coalition spears again 😅', likes: 0, dislikes: 0, my_reaction: 0 },
    ],
  },
  {
    id: 5, author: 'omar_h', created_at: Date.now() - 1000 * 60 * 200,
    title: 'Best film you watched this month?',
    content: 'Anora was a rollercoaster — the lead actor deserves every award on the shelf. Curious what everyone else watched.',
    categories: ['Movies'],
    likes: 6, dislikes: 1, my_reaction: 0, expanded: false,
    comments: [],
  },
  {
    id: 6, author: 'sara.dev', created_at: Date.now() - 1000 * 60 * 60 * 3,
    title: 'Backend or full-stack — how did you choose?',
    content: 'I keep jumping between the two. The backend puzzle of routing, sessions, hashing and caching is deeply fun, but a nice UI makes apps feel real. Currently leaning backend + enough frontend to be dangerous.',
    categories: ['General', 'Technology'],
    likes: 11, dislikes: 0, my_reaction: 0, expanded: false,
    comments: [
      { id: 7, author: 'menna.h', created_at: Date.now() - 1000 * 60 * 60 * 2, content: 'Backend focus with taste in frontend gets the best jobs. That pointing-to where things break also helps.', likes: 1, dislikes: 0, my_reaction: 0 },
    ],
  },
];

let state = {
  user: null,            // { username } or null
  filter: 'all',         // all | mine | liked
  category: '',
  expandedId: null,
  nextId: 100,
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatDate(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `about ${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

/* ---------------- auth ---------------- */

function renderAuth() {
  const box = $('#auth-area');
  if (state.user) {
    box.innerHTML = `
      <span class="welcome" style="color:var(--text-dim); font-size:.9rem;">👋 <b style="color:var(--text);">${esc(state.user.username)}</b></span>
      <button class="btn ghost" id="logout-btn">Log out</button>`;
    $('#logout-btn').addEventListener('click', () => {
      state.user = null;
      sessionStorage.removeItem('demo-user');
      renderAuth();
      render();
      toast('Logged out. See you soon 👋');
    });
  } else {
    box.innerHTML = `
      <a href="login.html" class="btn ghost">Log in</a>
      <a href="register.html" class="btn primary">Register</a>`;
  }
}

/* ---------------- composer ---------------- */

function renderComposer() {
  const logged = !!state.user;
  $('#composer').classList.toggle('hidden', !logged);
  $('#guest-hint').classList.toggle('hidden', logged);

  if (!logged) return;

  if (!$('#post-form').dataset.wired) {
    $('#post-form').dataset.wired = '1';
    $('#post-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = $('#post-title').value.trim();
      const content = $('#post-content').value.trim();
      const cats = [...document.querySelectorAll('#category-checkboxes input:checked')].map(c => c.value);
      const err = $('#post-error');
      if (!title || !content || cats.length === 0) {
        err.textContent = 'Title, content and at least one category are required.';
        return;
      }
      POSTS.unshift({
        id: state.nextId++,
        author: state.user.username, created_at: Date.now(),
        title, content, categories: cats,
        likes: 0, dislikes: 0, my_reaction: 0, expanded: false, comments: [],
      });
      $('#post-title').value = '';
      $('#post-content').value = '';
      document.querySelectorAll('#category-checkboxes input:checked')
        .forEach(c => (c.checked = false));
      err.textContent = '';
      renderPosts();
      toast('Post published 🚀');
    });
  }
}

/* ---------------- posts ---------------- */

function filteredPosts() {
  let list = [...POSTS];
  if (state.category) list = list.filter(p => p.categories.includes(state.category));
  if (state.filter === 'mine' && state.user) list = list.filter(p => p.author === state.user.username);
  if (state.filter === 'liked') list = list.filter(p => p.likes > 5);
  return list;
}

function reactionButton(targetType, item, emoji, value, activeClass) {
  const active = item.my_reaction === value ? ` ${activeClass}` : '';
  const disabled = state.user ? '' : ' disabled';
  const count = value === 1 ? item.likes : item.dislikes;
  return `
    <button class="react${active}" data-type="${targetType}" data-id="${item.id}"
            data-value="${value}"${disabled} title="${state.user ? 'Vote' : 'Log in to vote'}">
      ${emoji} <span class="count">${count}</span>
    </button>`;
}

function commentHtml(comment) {
  return `
    <div class="comment" data-comment-id="${comment.id}">
      <div class="post-meta">
        <span><span class="author">@${esc(comment.author)}</span> · ${formatDate(comment.created_at)}</span>
      </div>
      <p class="comment-text">${esc(comment.content)}</p>
      <div class="post-actions">
        ${reactionButton('comment', comment, '👍', 1, 'active-like')}
        ${reactionButton('comment', comment, '👎', -1, 'active-dislike')}
      </div>
    </div>`;
}

function renderPosts() {
  if (!state.user) {
    const welcome = $('#composer');
    if (welcome) welcome.classList.add('hidden');
  }

  const container = $('#posts');
  const list = filteredPosts();
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state">📭 No posts here yet.<br>
      ${state.user ? 'Be the first to publish one!' : 'Log in to be the first to publish one!'}</div>`;
    return;
  }

  container.innerHTML = list.map((post) => `
    <article class="card post" data-post-id="${post.id}">
      <div class="post-head">
        <div class="post-meta">
          <span class="author">@${esc(post.author)}</span> · ${formatDate(post.created_at)}
        </div>
        <div class="tags">${post.categories.map((c) => `<span class="tag">${esc(c)}</span>`).join('')}</div>
      </div>
      <h3 class="post-title">${esc(post.title)}</h3>
      <p class="post-content">${esc(post.content)}</p>
      <div class="post-actions">
        ${reactionButton('post', post, '👍', 1, 'active-like')}
        ${reactionButton('post', post, '👎', -1, 'active-dislike')}
        <button class="comment-toggle" data-id="${post.id}">
          💬 <span class="count">${post.comments.length}</span> comments
        </button>
      </div>
      <div class="comments hidden" id="comments-${post.id}"></div>
    </article>`).join('');
}

/* ---------------- comments & votes ---------------- */

function toggleComments(postId) {
  const box = $(`#comments-${postId}`);
  if (!box) return;

  const post = POSTS.find((p) => p.id === postId);
  if (!post) return;

  if (state.expandedId === postId) {
    state.expandedId = null;
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }

  state.expandedId = postId;
  const canComment = !!state.user;

  box.innerHTML = `
    <h4 class="comments-title">${post.comments.length} comment${post.comments.length === 1 ? '' : 's'}</h4>
    ${post.comments.map(commentHtml).join('')}
    ${canComment
      ? `<div class="comment-form">
          <textarea placeholder="Write a comment…"></textarea>
          <button class="btn primary send-comment">↩ Post</button>
        </div>`
      : `<div class="empty-state" style="padding:14px">🔒 <a href="login.html">Log in</a> to join this conversation.</div>`
    }`;
  box.classList.remove('hidden');
}

function findItem(type, id) {
  if (type === 'post') {
    return POSTS.find((p) => p.id === id);
  }
  for (const p of POSTS) {
    const c = p.comments.find((c) => c.id === id);
    if (c) return c;
  }
  return null;
}

document.addEventListener('click', (e) => {
  const react = e.target.closest('.react');
  if (react) {
    if (!state.user) return;
    const id = Number(react.dataset.id);
    const value = Number(react.dataset.value);
    const item = findItem(react.dataset.type, id);
    if (!item) return;

    if (item.my_reaction === value) {
      // remove vote
      if (value === 1) item.likes = Math.max(0, item.likes - 1);
      else item.dislikes = Math.max(0, item.dislikes - 1);
      item.my_reaction = 0;
    } else {
      // switch or new vote
      if (item.my_reaction === 1) item.likes = Math.max(0, item.likes - 1);
      if (item.my_reaction === -1) item.dislikes = Math.max(0, item.dislikes - 1);
      if (value === 1) item.likes += 1;
      else item.dislikes += 1;
      item.my_reaction = value;
    }
    renderPosts();
    if (state.expandedId) {
      const box = $(`#comments-${state.expandedId}`);
      if (box && !box.classList.contains('hidden')) toggleBox(state.expandedId, box);
    }
    return;
  }

  const toggle = e.target.closest('.comment-toggle');
  if (toggle) {
    toggleComments(Number(toggle.dataset.id));
    return;
  }

  const send = e.target.closest('.send-comment');
  if (send) {
    if (!state.user) return;
    const box = send.closest('.comments');
    const pid = Number(box.id.replace('comments-', ''));
    const ta = box.querySelector('textarea');
    const content = ta.value.trim();
    if (!content) return;
    const post = POSTS.find((p) => p.id === pid);
    post.comments.push({
      id: state.nextId++, author: state.user.username, created_at: Date.now(),
      content, likes: 0, dislikes: 0, my_reaction: 0,
    });
    toggleComments(pid); // close
    state.expandedId = pid;
    renderPosts();        // update count
    toggleComments(pid);  // reopen fresh
    toast('Comment added 💬');
  }
});

function toggleBox(pid, box) {
  const post = POSTS.find((p) => p.id === pid);
  const freshExpand = state.expandedId === pid;
  box.innerHTML = `
    <h4 class="comments-title">${post.comments.length} comment${post.comments.length === 1 ? '' : 's'}</h4>
    ${post.comments.map(commentHtml).join('')}
    ${state.user
      ? `<div class="comment-form">
          <textarea placeholder="Write a comment…"></textarea>
          <button class="btn primary send-comment">↩ Post</button>
        </div>`
      : `<div class="empty-state" style="padding:14px">🔒 <a href="login.html">Log in</a> to join this conversation.</div>`}`;
  box.classList.remove('hidden');
  return freshExpand;
}

/* ---------------- categories & filters ---------------- */

function renderCategoryBoxes() {
  $('#category-checkboxes').innerHTML = CATEGORIES.map(
    (c) => `<label><input type="checkbox" name="category" value="${c}">${c}</label>`
  ).join('');

  const select = $('#category-filter');
  select.innerHTML = `<option value="">Categories…</option>` + CATEGORIES.map(
    (c) => `<option value="${c}">${c}</option>`
  ).join('');
}

function renderFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    const authOnly = btn.dataset.auth !== undefined;
    btn.classList.toggle('hidden', authOnly && !state.user);
    btn.classList.toggle('active', btn.dataset.filter === state.filter);
  });
  $('#category-filter').value = state.category;
}

document.addEventListener('change', (e) => {
  if (e.target.id === 'category-filter') {
    state.category = e.target.value;
    state.filter = 'all';
    renderPosts();
    renderFilterButtons();
  }
});

document.addEventListener('click', (e) => {
  const fbtn = e.target.closest('.filter-btn');
  if (fbtn) {
    e.preventDefault();
    state.filter = fbtn.dataset.filter;
    state.category = '';
    renderPosts();
    renderFilterButtons();
  }
});

/* ---------------- toast ---------------- */

let toastTimer = null;
function toast(msg) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 3200);
}

/* ---------------- boot ---------------- */

document.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('demo-user');
  if (saved) state.user = { username: saved };

  renderCategoryBoxes();
  renderFilterButtons();
  renderAuth();
  renderComposer();
  renderPosts();
  $('#logo-link').addEventListener('click', (e) => {
    e.preventDefault();
    state.filter = 'all';
    state.category = '';
    renderPosts();
    renderFilterButtons();
  });
});
