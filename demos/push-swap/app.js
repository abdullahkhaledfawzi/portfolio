/* =============================================================================
   push-swap demo — replays the exact instruction sequence produced by the
   compiled binary for each baked case and animates both stacks.
   ============================================================================= */

const $ = (id) => document.getElementById(id);

// ---------------- operations (mirror of the checker semantics) ---------------

function newStackState(args) {
    // Stack A is loaded top-first: args order = top to bottom.
    return { a: [...args].map(Number), b: [] };
}

function applyOp(st, op) {
    const swap = (s) => { if (s.length >= 2) [s[0], s[1]] = [s[1], s[0]]; };
    const rot = (s) => { if (s.length >= 2) s.push(s.shift()); };
    const rrot = (s) => { if (s.length >= 2) s.unshift(s.pop()); };
    const push = (from, to) => { if (from.length) to.unshift(from.shift()); };

    switch (op) {
        case 'sa': swap(st.a); break;
        case 'sb': swap(st.b); break;
        case 'ss': swap(st.a); swap(st.b); break;
        case 'pa': push(st.b, st.a); break;
        case 'pb': push(st.a, st.b); break;
        case 'ra': rot(st.a); break;
        case 'rb': rot(st.b); break;
        case 'rr': rot(st.a); rot(st.b); break;
        case 'rra': rrot(st.a); break;
        case 'rrb': rrot(st.b); break;
        case 'rrr': rrot(st.a); rrot(st.b); break;
    }
}

function isSorted(st) {
    if (st.b.length) return false;
    for (let i = 0; i < st.a.length - 1; i++)
        if (st.a[i] > st.a[i + 1]) return false;
    return true;
}

// ---------------- rendering ---------------------------------------------------

const STACK_H = 340; // px height available for items in each column
function valueLabel(v) { return String(v); }

function render(st, currentOp) {
    for (const which of ['a', 'b']) {
        const box = $('stack-' + which);
        const items = st[which];
        box.classList.toggle('empty', items.length === 0);
        box.innerHTML = '';
        if (items.length === 0) {
            box.innerHTML = '<span class="empty-hint">(empty)</span>';
            continue;
        }
        const maxAbs = Math.max(1, ...st.a.map(Math.abs), ...st.b.map(Math.abs));
        // proportions: every item gets a share of the fixed area, taller is bigger
        const share = STACK_H / items.length;
        items.forEach((v, i) => {
            const el = document.createElement('div');
            el.className = 'item' + (i === 0 ? ' top' : '');
            const ratio = Math.abs(v) / maxAbs;
            const h = Math.max(6, Math.min(40, share * (0.42 + 0.58 * ratio)));
            el.style.height = h.toFixed(1) + 'px';
            if (h >= 20) el.textContent = valueLabel(v);
            if (i === 0 && currentOp) el.classList.add('moving');
            box.appendChild(el);
        });
    }
}

function renderOps(index, total) {
    const log = $('op-log');
    const CASE = state.caseData;
    log.innerHTML = CASE.ops
        .map((op, i) => {
            const done = i < index;
            const now = i === index;
            return `<span class="op ${done ? 'done' : now ? 'now' : ''}">${done ? '✓ ' : ''}${op}</span>`;
        })
        .join('');
    const nowEl = log.querySelector('.op.now');
    if (nowEl) nowEl.scrollIntoView({ block: 'nearest' });
    $('stat-ops').textContent = `${index}/${total}`;
}

function updateStats(st) {
    $('stat-n').textContent = state.args.length;
    $('stat-sorted').textContent = isSorted(st) ? 'yes' : 'no';
    $('verdict').textContent = isSorted(st)
        ? `✅ checker: OK — stack a sorted ascending and stack b empty (${state.caseData.ops.length} operations).`
        : 'Watching the machine at work: A holds the input, B is scratch space…';
    $('verdict').classList.toggle('good', isSorted(st));
}

// ---------------- playback -----------------------------------------------------

const state = { caseData: null, args: null, index: 0 };

function msPerOp() {
    // slider: 🐢 = slow (left/min) … 🐇 = fast (right/max)
    return 600 - parseInt($('speed').value, 10);
}

function showIndex(t) {
    state.index = Math.max(0, Math.min(t, state.caseData.ops.length));
    const st = newStackState(state.args);
    for (let i = 0; i < state.index; i++) applyOp(st, state.caseData.ops[i]);
    render(st, state.index < state.caseData.ops.length ? state.caseData.ops[state.index] : null);
    renderOps(state.index, state.caseData.ops.length);
    updateStats(st);
    return st;
}

function step(delta) {
    pauseAuto();
    return showIndex(state.index + delta);
}

let autoTimer = null;
function pauseAuto() {
    clearTimeout(autoTimer);
    autoTimer = null;
    $('btn-play').textContent = '▶ auto-sort (real ops)';
}

function autoPlay() {
    if (autoTimer) return pauseAuto();
    if (state.index >= state.caseData.ops.length) showIndex(0);
    $('btn-play').textContent = '⏸ pause';
    const tick = () => {
        if (state.index >= state.caseData.ops.length) return pauseAuto();
        step(1);
        autoTimer = setTimeout(tick, msPerOp());
    };
    autoTimer = setTimeout(tick, msPerOp() / 2);
}

// ---------------- cases ---------------------------------------------------------

const LABELS = {
    case6: '6 numbers',
    case10: '10 numbers',
    case_sorted: 'already sorted',
    case12: 'random — 12',
    case40: 'random — 40',
    case100: 'big — 100',
};

function loadCase(label) {
    const found = CASES.find((c) => c.label === label);
    if (!found) return;
    pauseAuto();
    state.caseData = found;
    state.args = found.args;
    showIndex(0);
    document.querySelectorAll('.preset-btn').forEach((b) =>
        b.classList.toggle('active', b.dataset.case === label)
    );
}

document.addEventListener('DOMContentLoaded', () => {
    $('preset-btns').innerHTML = CASES.map(
        (c) => `<button class="preset-btn" data-case="${c.label}">${LABELS[c.label] || c.label}</button>`
    ).join('');

    $('preset-btns').addEventListener('click', (e) => {
        const b = e.target.closest('.preset-btn');
        if (b) loadCase(b.dataset.case);
    });
    $('btn-play').addEventListener('click', autoPlay);
    $('btn-step').addEventListener('click', () => step(1));
    $('btn-prev').addEventListener('click', () => step(-1));
    $('btn-reset').addEventListener('click', () => { pauseAuto(); showIndex(0); });
    $('speed').addEventListener('input', () => {});

    loadCase('case10');
    setTimeout(autoPlay, 600);
});
