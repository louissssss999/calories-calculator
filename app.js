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
let MEAL = []; // [{id, grams}]

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
            <button class="add-btn">+</button>
        `;
        row.querySelector('.add-btn').onclick = () => { addToMeal(f.id, 100); };
        container.appendChild(row);
    });
}

// Meal helpers
function findFood(id) {
    return FOODS.find(f => String(f.id) === String(id));
}

function addToMeal(id, grams = 100) {
    const existing = MEAL.find(x => x.id === id);
    if (existing) existing.grams += grams;
    else MEAL.push({ id, grams });
    renderMeal();
}

function removeFromMeal(id) {
    MEAL = MEAL.filter(x => x.id !== id);
    renderMeal();
}

function updateGrams(id, grams) {
    const item = MEAL.find(x => x.id === id);
    if (!item) return;
    item.grams = Math.max(0, grams || 0);
    renderMeal();
}

// Calculations per item
function calcFor(f, grams) {
    const factor = grams / 100;
    const kcal = round(f.kcal100 * factor);
    const p = round(f.p100 * factor, 1);
    const c = round(f.c100 * factor, 1);
    const fat = round(f.f100 * factor, 1);
    const P20 = round(p / 20, 2);
    const C20 = round(c / 20, 2);
    const F10 = round(fat / 10, 2);
    return { kcal, p, c, fat, P20, C20, F10 };
}

// Render meal list and totals
function renderMeal() {
    const container = el('meal-list');
    container.innerHTML = '';
    let tk = 0, tp = 0, tc = 0, tf = 0;
    MEAL.forEach(item => {
        const f = findFood(item.id);
        if (!f) return;
        const calc = calcFor(f, item.grams);
        tk += calc.kcal;
        tp += calc.p;
        tc += calc.c;
        tf += calc.fat;
        const row = document.createElement('div');
        row.className = 'meal-row';
        row.innerHTML = `
            <div class="meal-name">${f.name}</div>
            <input class="meal-grams" type="number" value="${item.grams}" onchange="updateGrams('${f.id}', this.value)">
            <div class="meal-macros">${calc.kcal} kcal • P ${calc.p}g • C ${calc.c}g • F ${calc.fat}g</div>
            <button class="del-btn" onclick="removeFromMeal('${f.id}')">×</button>
        `;
        container.appendChild(row);
    });
    el('total-kcal').textContent = round(tk);
    el('total-p').textContent = round(tp, 1);
    el('total-c').textContent = round(tc, 1);
    el('total-f').textContent = round(tf, 1);
    el('pace-p').textContent = round(tp / 20, 2);
    el('pace-c').textContent = round(tc / 20, 2);
    el('pace-f').textContent = round(tf / 10, 2);
    updateBars(tp, tc, tf);
}

function updateBars(p, c, f) {
    const pt = el('protein-target').value || 150;
    const ct = el('carbs-target').value || 200;
    const ft = el('fat-target').value || 70;
    el('protein-bar').style.width = Math.min(100, (p / pt) * 100) + '%';
    el('carbs-bar').style.width = Math.min(100, (c / ct) * 100) + '%';
    el('fat-bar').style.width = Math.min(100, (f / ft) * 100) + '%';
}

// Export
function exportMeal() {
    let csv = 'Food Name,Grams,kcal,Protein (g),Carbs (g),Fat (g)\n';
    MEAL.forEach(item => {
        const f = findFood(item.id);
        if (!f) return;
        const calc = calcFor(f, item.grams);
        csv += `${f.name},${item.grams},${calc.kcal},${calc.p},${calc.c},${calc.fat}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meal.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Event listeners
el('search').addEventListener('input', renderResults);
el('clear-btn').addEventListener('click', () => { MEAL = []; renderMeal(); });
el('export-btn').addEventListener('click', exportMeal);

// Init
loadFoods();
