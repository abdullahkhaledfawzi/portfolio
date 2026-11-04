/**
 * Groupie Tracker — interactive demo.
 * Renders from a local snapshot of the original REST API data
 * (the upstream API has been decommissioned), using the app's own stylesheet.
 */
(function () {
    const grid = document.getElementById('artists-grid');
    const noResults = document.getElementById('no-results');
    const homeView = document.getElementById('home-view');
    const artistView = document.getElementById('artist-view');
    const searchInput = document.getElementById('search-input');

    // ---------- helpers ----------
    function formatLocation(loc) {
        const [city, country] = loc.split('-');
        return `${city.charAt(0).toUpperCase()}${city.slice(1).replace(/_/g, ' ')}, ${country ? country.toUpperCase() : ''}`;
    }

    function esc(s) {
        return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function renderCards(list) {
        grid.innerHTML = list.map(a => `
            <a href="#artist-${a.id}" class="card" data-id="${a.id}">
                <div class="card-image">
                    <img src="${esc(a.image)}" alt="${esc(a.name)}" loading="lazy" width="300" height="300">
                </div>
                <div class="card-info">
                    <h3 class="card-name">${esc(a.name)}</h3>
                    <p class="card-year">Since ${a.creationDate}</p>
                </div>
            </a>`).join('');
    }

    // ---------- home (cards + search) ----------
    renderCards(ARTISTS);

    // Live search — same debounce pattern as the real app (300 ms).
    let debounce = null;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            const q = e.target.value.trim().toLowerCase();
            const list = q === '' ? ARTISTS : ARTISTS.filter(a => a.name.toLowerCase().includes(q));
            if (list.length === 0) {
                grid.innerHTML = '';
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
                renderCards(list);
            }
        }, 300);
    });

    // ---------- artist detail ----------
    function showArtist(id) {
        const a = ARTISTS.find(x => String(x.id) === String(id));
        if (!a) return;

        const rows = Object.entries(a.datesLocations || {})
            .map(([loc, ds]) => `
                <tr>
                    <td class="location-cell">📍 ${esc(formatLocation(loc))}</td>
                    <td class="dates-cell">${(ds || []).map(d => `<span class="date-tag">${esc(d.replace(/^\*/, ''))}</span>`).join('')}</td>
                </tr>`).join('');

        document.title = `${a.name} — Groupie Tracker`;
        homeView.style.display = 'none';
        searchInput.value = '';

        artistView.innerHTML = `
            <a href="#" class="back-link" id="back-link">← Back to All Artists</a>
            <section class="artist-hero">
                <div class="artist-image-wrapper">
                    <img src="${esc(a.image)}" alt="${esc(a.name)}" class="artist-image" width="400" height="400">
                </div>
                <div class="artist-details">
                    <h1 class="artist-name">${esc(a.name)}</h1>
                    <div class="artist-meta">
                        <div class="meta-item">
                            <span class="meta-label">Active Since</span>
                            <span class="meta-value">${a.creationDate}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">First Album</span>
                            <span class="meta-value">${esc(a.firstAlbum)}</span>
                        </div>
                    </div>
                </div>
            </section>
            <section class="members-section">
                <h2 class="section-title">Members</h2>
                <ul class="members-list">
                    ${a.members.map(m => `<li class="member-item">${esc(m)}</li>`).join('')}
                </ul>
            </section>
            <section class="concerts-section">
                <h2 class="section-title">Concert History</h2>
                ${rows ? `
                <div class="table-wrapper">
                    <table class="concerts-table">
                        <thead><tr><th>Location</th><th>Dates</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>` : '<p class="no-data">No concert data available.</p>'}
            </section>`;

        artistView.style.display = 'block';

        document.getElementById('back-link').addEventListener('click', (e) => {
            e.preventDefault();
            goHome();
        });
        artistView.scrollIntoView({ behavior: 'instant', block: 'start' });
    }

    function goHome() {
        document.title = 'Groupie Tracker — Demo';
        artistView.style.display = 'none';
        artistView.innerHTML = '';
        homeView.style.display = 'block';
        renderCards(ARTISTS);
        noResults.style.display = 'none';
    }

    document.getElementById('logo-link').addEventListener('click', (e) => {
        e.preventDefault();
        goHome();
    });

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card[data-id]');
        if (card) {
            e.preventDefault();
            showArtist(card.dataset.id);
        }
    });
})();
