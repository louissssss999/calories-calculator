// Simple CSV parsing for small files
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines.shift().split(",");
    return lines.map(line => {
        const parts = [];
        let cur = "", inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && inQuotes) {
                inQuotes = false;
            } else if (char === '"') {
                inQuotes = true;
            } else if (char === ',' && !inQuotes) {
                parts.push(cur);
                cur = "";
            } else {
                cur += char;
            }
        }
        parts.push(cur);
        const obj = {};
        headers.forEach((h, idx) => obj[h] = parts[idx]);
        return obj;
    });
}

function toNumber(v) {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
}

function round(n, d = 0) {
    const f = Math.pow(10, d);
    return Math.round(n * f) / f;
}

let FOODS = [];
let MEALS = { // {category: [{id, grams}]}
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snacks: []
};

const el = id => document.getElementById(id);

// Load CSV
async function loadFoods() {
    const res = await fetch('foods.csv');
    const text = await res.text();
    FOODS = parseCSV(text).map(r => ({
        id: r["ID"],
        name: r["Food Name"],
        category: r["Category"],
        kcal100: toNumber(r["kcal_100g"]),
        p100: toNumber(r["protein_g_100g"]),
        c100: toNumber(r["carbs_g_100g"]),
        f100: toNumber(r["fat_g_100g"]),
        fiber100: toNumber(r["fiber_g_100g"]),
        sugar100: toNumber(r["sugars_g_100g"]),
        sodium100: toNumber(r["sodium_mg_100g"]),
    }));
    renderResults();
    renderMeals();
}

// Search
function filterFoods(q) {
    q = q.trim().toLowerCase();
    if (!q) return FOODS.slice(0, 25);
    return FOODS.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)).slice(0, 50);
}

// Render search results
function renderResults() {
    const q = el('search').value;
    const list = filterFoods(q);
    const container = el('results');
    container.innerHTML = '';
    list.forEach(f => {
        const row = document.createElement('div');
        row.className = 'result-row';
        row.innerHTML = `
            <div>
                <div class="result-name">${f.name} (${f.category})</div>
                <div class="result-meta">${f.kcal100} kcal • P ${f.p100}g • C ${f.c100}g • F ${f.f100}g per 100g</div>
            </div>
            <button class="add-btn" data-category="Breakfast">+</button>
            <button class="add-btn" data-category="Lunch">+</button>
            <button class="add-btn" data-category="Dinner">+</button>
            <button class="add-btn" data-category="Snacks">+</button>
        `;
        row.querySelectorAll('.add-btn').forEach(btn => {
            btn.onclick = () => { addToMeal(btn.dataset.category, f.id, 100); };
        });
        container.appendChild(row);
    });
}

// Meal helpers
function findFood(id) {
    return FOODS.find(f => String(f.id) === String(id));
}

function addToMeal(category, id, grams = 100) {
    if (!MEALS[category]) MEALS[category] = [];
    const existing = MEALS[category].find(x => x.id === id);
    if (existing) existing.grams += grams;
    else MEALS[category].push({ id, grams });
    renderMeals();
}

function removeFromMeal(category, id) {
    if (MEALS[category]) {
        MEALS[category] = MEALS[category].filter(x => x.id !== id);
    }
    renderMeals();
}

function updateGrams(category, id, grams) {
    if (!MEALS[category]) return;
    const item = MEALS[category].find(x => x.id === id);
    if (!item) return;
    item.grams = Math.max(0, grams || 0);
    renderMeals();
}

// Calculations per item
function calcFor(f, grams) {
    const factor = grams / 100;
    const kcal = round(f.kcal100 * factor);
    const p = round(f.p100 * factor, 1);
    const c = round(f.c100 * factor, 1);
    const fat = round(f.f100 * factor, 1);
    const PRO = round(p / 20, 2);
    const CHO = round(c / 20, 2);
    const FAT = round(fat / 10, 2);
    return { kcal, p, c, fat, PRO, CHO, FAT };
}

// Render meal categories
function renderMeals() {
    const container = el('meal-categories');
    container.innerHTML = '';
    let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;
    Object.keys(MEALS).forEach(cat => {
        const details = document.createElement('details');
        details.className = 'meal-category';
        const summary = document.createElement('summary');
        summary.textContent = cat;
        details.appendChild(summary);
        const list = document.createElement('div');
        list.className = 'meal-list';
        let catKcal = 0, catP = 0, catC = 0, catF = 0;
        MEALS[cat].forEach(item => {
            const f = findFood(item.id);
            if (!f) return;
            const calc = calcFor(f, item.grams);
            catKcal += calc.kcal;
            catP += calc.p;
            catC += calc.c;
            catF += calc.fat;
            const row = document.createElement('div');
            row.className = 'meal-row';
            row.innerHTML = `
                <div class="meal-name">${f.name}</div>
                <input class="meal-grams" type="number" value="${item.grams}" onchange="updateGrams('${cat}', '${f.id}', this.value)">
                <div class="meal-macros">${calc.kcal} kcal • P ${calc.p}g • C ${calc.c}g • F ${calc.fat}g</div>
                <button class="del-btn" onclick="removeFromMeal('${cat}', '${f.id}')">×</button>
            `;
            list.appendChild(row);
        });
        totalKcal += catKcal;
        totalP += catP;
        totalC += catC;
        totalF += catF;
        const totalsRow = document.createElement('div');
        totalsRow.className = 'category-totals';
        totalsRow.innerHTML = `
            <div>${cat} Totals: ${round(catKcal)} kcal • P ${round(catP, 1)}g • C ${round(catC, 1)}g • F ${round(catF, 1)}g</div>
        `;
        list.appendChild(totalsRow);
        details.appendChild(list);
        container.appendChild(details);
    });
    el('total-kcal').textContent = round(totalKcal);
    el('total-p').textContent = round(totalP, 1);
    el('total-c').textContent = round(totalC, 1);
    el('total-f').textContent = round(totalF, 1);
    el('pace-p').textContent = round(totalP / 20, 2);
    el('pace-c').textContent = round(totalC / 20, 2);
    el('pace-f').textContent = round(totalF / 10, 2);
    updateBars(totalKcal, totalP, totalC, totalF);
    updateDifferences(totalKcal, totalP, totalC, totalF);
}

function updateBars(kcal, p, c, f) {
    const kcalT = el('calories-target').value || 2000;
    const pt = el('protein-target').value || 150;
    const ct = el('carbs-target').value || 200;
    const ft = el('fat-target').value || 70;
    el('calories-bar').style.width = Math.min(100, (kcal / kcalT) * 100) + '%';
    el('protein-bar').style.width = Math.min(100, (p / pt) * 100) + '%';
    el('carbs-bar').style.width = Math.min(100, (c / ct) * 100) + '%';
    el('fat-bar').style.width = Math.min(100, (f / ft) * 100) + '%';
}

function updateDifferences(kcal, p, c, f) {
    const kcalT = el('calories-target').value || 2000;
    const pt = el('protein-target').value || 150;
    const ct = el('carbs-target').value || 200;
    const ft = el('fat-target').value || 70;
    el('diff-kcal').textContent = round(kcal - kcalT);
    el('diff-p').textContent = round(p - pt, 1);
    el('diff-c').textContent = round(c - ct, 1);
    el('diff-f').textContent = round(f - ft, 1);
}

// Event listeners
el('search').addEventListener('input', renderResults);
el('clear-btn').addEventListener('click', () => { 
    Object.keys(MEALS).forEach(cat => MEALS[cat] = []);
    renderMeals(); 
});

// Init
loadFoods();
