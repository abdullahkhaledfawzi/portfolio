const API_URL = 'https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json';

let allHeroes = [];
let heroes = [];
let filtered = [];
let currentPage = 1;
let pageSize = 20;
let sortCol = 'name';
let sortDir = 'asc';

function cleanValue(val) {
  return val === '-' || val == null ? '' : String(val);
}

function parseNumeric(str) {
  if (!str) return null;
  const n = parseFloat(str.replace(',', ''));
  return (isNaN(n) || n === 0) ? null : n;
}

function normalize(hero) {
  const h = hero.appearance?.height?.[1] || '';
  const w = hero.appearance?.weight?.[1] || '';
  return {
    icon: hero.images?.xs || '',
    name: hero.name || '',
    fullName: cleanValue(hero.biography?.fullName),
    intelligence: hero.powerstats?.intelligence ?? null,
    strength: hero.powerstats?.strength ?? null,
    speed: hero.powerstats?.speed ?? null,
    durability: hero.powerstats?.durability ?? null,
    power: hero.powerstats?.power ?? null,
    combat: hero.powerstats?.combat ?? null,
    race: cleanValue(hero.appearance?.race),
    gender: cleanValue(hero.appearance?.gender),
    height: parseNumeric(h),
    weight: parseNumeric(w),
    heightRaw: h,
    weightRaw: w,
    placeOfBirth: cleanValue(hero.biography?.placeOfBirth),
    alignment: cleanValue(hero.biography?.alignment)
  };
}

function getSortValue(hero, col) {
  const v = hero[col];
  if (v === null || v === undefined || v === '') return { type: 'missing' };
  if (typeof v === 'number') return { type: 'number', value: v };
  return { type: 'string', value: String(v).toLowerCase() };
}

function compareHeroes(a, b, col, dir) {
  const va = getSortValue(a, col);
  const vb = getSortValue(b, col);
  
  if (va.type === 'missing' && vb.type === 'missing') return 0;
  if (va.type === 'missing') return 1;
  if (vb.type === 'missing') return -1;
  
  let cmp = 0;
  if (va.type === 'number') {
    cmp = va.value - vb.value;
  } else {
    cmp = va.value.localeCompare(vb.value);
  }
  return dir === 'asc' ? cmp : -cmp;
}

function sortHeroes() {
  filtered.sort((a, b) => compareHeroes(a, b, sortCol, sortDir));
}

function applySearch() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  if (query) {
    filtered = heroes.filter(h => h.name.toLowerCase().includes(query));
  } else {
    filtered = [...heroes];
  }
  currentPage = 1;
  sortHeroes();
  renderTable();
  renderPagination();
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function getDisplayValue(hero, col) {
  if (col === 'icon') {
    return hero.icon ? `<img src="${hero.icon}" alt="" width="32" height="32">` : '<span class="missing">—</span>';
  }
  if (col === 'height') return hero.height !== null ? hero.heightRaw : '<span class="missing">—</span>';
  if (col === 'weight') return hero.weight !== null ? hero.weightRaw : '<span class="missing">—</span>';
  const v = hero[col];
  return (v === null || v === undefined || v === '') ? '<span class="missing">—</span>' : v;
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  const start = (currentPage - 1) * pageSize;
  const end = pageSize === 'all' ? filtered.length : start + pageSize;
  const pageHeroes = filtered.slice(start, end);
  
  const cols = [
    'icon', 'name', 'fullName', 'intelligence', 'strength', 'speed',
    'durability', 'power', 'combat', 'race', 'gender', 'height',
    'weight', 'placeOfBirth', 'alignment'
  ];
  
  tbody.innerHTML = pageHeroes.map(hero => {
    const cells = cols.map(col => {
      const val = getDisplayValue(hero, col);
      const cls = col === 'icon' ? 'icon-cell' : '';
      return `<td class="${cls}">${val}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  
  updateSortIndicators();
}

function updateSortIndicators() {
  document.querySelectorAll('th[data-col]').forEach(th => {
    th.classList.remove('sorted-asc', 'sorted-desc');
    if (th.dataset.col === sortCol) {
      th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }
  });
}

function renderPagination() {
  const pagination = document.getElementById('pagination');
  const total = filtered.length;
  
  if (pageSize === 'all' || total <= pageSize) {
    pagination.innerHTML = '';
    return;
  }
  
  const totalPages = Math.ceil(total / pageSize);
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  let html = '';
  
  html += `<button class="page-btn" data-page="1" ${currentPage === 1 ? 'disabled' : ''}>First</button>`;
  html += `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`;
  
  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  
  html += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
  html += `<button class="page-btn" data-page="${totalPages}" ${currentPage === totalPages ? 'disabled' : ''}>Last</button>`;
  
  pagination.innerHTML = html;
}

function handleSort(col) {
  if (col === sortCol) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortCol = col;
    sortDir = 'asc';
  }
  sortHeroes();
  renderTable();
}

function handlePageChange(page) {
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filtered.length / pageSize);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
  renderPagination();
}

function handlePageSizeChange() {
  const val = document.getElementById('pageSize').value;
  pageSize = val === 'all' ? 'all' : parseInt(val, 10);
  currentPage = 1;
  renderTable();
  renderPagination();
}

async function init() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch');
    allHeroes = await res.json();
    heroes = allHeroes.map(normalize);
    filtered = [...heroes];
    sortHeroes();
    renderTable();
    renderPagination();
  } catch (e) {
    console.error('Error loading data:', e);
    document.getElementById('tableBody').innerHTML = 
      '<tr><td colspan="15" style="text-align:center;padding:2rem;color:var(--muted)">Failed to load data</td></tr>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  
  document.getElementById('searchInput').addEventListener('input', debounce(applySearch, 150));
  
  document.getElementById('pageSize').addEventListener('change', handlePageSizeChange);
  
  document.querySelectorAll('th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      if (th.dataset.col !== 'icon') handleSort(th.dataset.col);
    });
  });
  
  document.getElementById('pagination').addEventListener('click', e => {
    const btn = e.target.closest('.page-btn');
    if (btn && !btn.disabled) {
      handlePageChange(parseInt(btn.dataset.page, 10));
    }
  });
});