/* =============================================================================
   net-cat demo — scripted, faithful replay of sessions against the real
   server. All output formats (welcome banner, prompts, timestamps,
   notifications, command replies) match the server source exactly.
   ============================================================================= */

const BANNER = [
    'Welcome to TCP-Chat!',
    '         _nnnn_',
    '        dGGGGMMb',
    '       @p~qp~~qMb',
    "       M|@||@) M|  ",
    '       @,----.JM|  ',
    "      JS^\\__/  qKL",
    '     dZP        qKRb',
    "    dZP          qKKb",
    "   fZP            SMMb",
    "   HZM            MMMM",
    '   F`qM            MMMM',
    ' __| ".        |\\dS"qML',
    " |    `.       | `. \\' \\Zq",
    "_)      \\.___.,|     .'",
    "\\____   )MMMMMP|   .'",
    "     `-'       `--'",
    '',
].join('\n\r');

const term = document.getElementById('term');
const typed = document.getElementById('typed');
let SPEED = 2;

function esc(s) {
    return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function line(cls, html) {
    const e = document.createElement('div');
    e.className = 'line ' + cls;
    e.innerHTML = html;
    term.appendChild(e);
    term.scrollTop = term.scrollHeight;
    return e;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms / SPEED));

async function typeBar(text, msPerChar) {
    typed.textContent = '';
    for (const ch of text) {
        typed.textContent += ch;
        await wait(msPerChar);
    }
}

async function shellPrompt(cmd) {
    await typeBar(cmd, 28);
    await wait(200);
    typed.textContent = '';
    line('r-echo', `<span class="r-prompt">➜</span> <span class="r-cmd">${esc(cmd)}</span>`);
}

async function namePrompt(client, name) {
    typed.textContent = '';
    await wait(150);
    line('r-msg', `<span class="dim">[${esc(client)} · ${esc(name)}]</span>`);
    typed.textContent = '[ENTER YOUR NAME]: ';
    for (const ch of name) { typed.textContent += ch; await wait(90); }
    await wait(350);
    typed.textContent = '';
}

async function chatLine(client, name, ts, text) {
    await typeBar(`${ts}[${name}]:${text}`, 16);
    await wait(120);
    typed.textContent = '';
    line('r-msg', `${esc(ts)}<b>[${esc(name)}]:</b>${esc(text)}`);
}

function sysText(text) {
    line('r-sys', esc(text));
}

function divider(label) {
    line('r-info dim', `─────  ${esc(label)}  ─────`);
}

/* ---------------- the script ---------------- */

async function play() {
    term.innerHTML = '';
    typed.textContent = '';

    divider('server start');

    await shellPrompt('./TCPChat 8989');
    await wait(300);
    line('r-info', 'Listening on the port :8989.');
    await wait(900);

    divider('client 1 — new connection (nc)');

    line('r-banner', esc(BANNER));
    typed.textContent = '[ENTER YOUR NAME]: ';
    for (const ch of 'Abdullah') { typed.textContent += ch; await wait(90); }
    await wait(350);
    typed.textContent = '';
    await sysText('[2026-03-12 14:31:02][System]: Abdullah has joined our chat.');
    await wait(700);
    await chatLine('T1', 'Abdullah', '2026-03-12 14:31:07', 'Hello all!');
    await wait(800);
    await chatLine('T1', 'Abdullah', '2026-03-12 14:31:21', 'Second terminal, join me for a broadcast test?');
    await wait(800);

    divider('client 2 — new connection');

    line('r-banner', esc(BANNER));
    typed.textContent = '[ENTER YOUR NAME]: ';
    for (const ch of 'Sami') { typed.textContent += ch; await wait(90); }
    await wait(350);
    typed.textContent = '';
    await sysText('[2026-03-12 14:32:40][System]: Sami has joined our chat.');
    await sysText('[2026-03-12 14:31:07][Abdullah]:Hello all!');
    await sysText('[2026-03-12 14:31:21][Abdullah]:Second terminal, join me for a broadcast test?');
    await wait(600);
    await chatLine('T2', 'Sami', '2026-03-12 14:32:47', 'Working! I get the history and all new messages 🙂');
    await wait(700);
    await chatLine('T1', 'Abdullah', '2026-03-12 14:32:53', 'That is broadcast + history replay, right from the server 🔎');
    await wait(800);

    divider('bonus commands');

    await chatLine('T1', 'Abdullah', '2026-03-12 14:34:02', '/name Abdo');
    await sysText('[2026-03-12 14:34:02][System]: Abdullah changed their name to Abdo.');
    await wait(700);
    await chatLine('T2', 'Sami', '2026-03-12 14:34:10', 'Rename showed up live — nice!');
    await wait(700);
    await chatLine('T3 · new client', 'Omar', '2026-03-12 14:34:16', '/rooms');
    line('r-info', 'Available rooms:\n  - General (2 users)');
    await wait(700);
    await chatLine('T3', 'Omar', '2026-03-12 14:34:26', '/room Gaming');
    line('r-info', 'Switched to room: Gaming');
    await sysText('[2026-03-12 14:34:26][System]: Omar has joined our chat.');
    await wait(700);
    await chatLine('T3', 'Omar', '2026-03-12 14:34:33', 'Rooms can be created on the fly — done ✔');
    await wait(900);

    divider('server log — chat.log');
    line('r-info dim', '[2026-03-12 14:31:02][System]: Abdullah has joined our chat.');
    line('r-info dim', '[2026-03-12 14:34:33][Omar]:Rooms run live — done ✔');
    line('r-info', '3 clients served · broadcast + history + rooms working · 10-connection lobby limit enforced.');
    await wait(600);

    divider('end of simulation — press ⟲ to replay');
}

/* ---------------- controls ---------------- */

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-replay').addEventListener('click', play);
    document.getElementById('speed-select').addEventListener('change', (e) => {
        SPEED = Number(e.target.value);
    });
    play();
});
