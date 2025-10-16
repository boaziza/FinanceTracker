const keySettings = 'finance:settings';
const defaultCategories = ['Food','Books','Transport','Entertainment','Fees','Other'];

const validators = {
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
  currencyCode: /^[A-Z]{3}$/,
  rate: /^(0|[1-9]\d*)(\.\d{1,4})?$/
};

export function compileRegex (input, flags='i'){
    try { return input ? new RegExp(input, flags) : null; } catch(e){ return null; }
}

const saveSettings = (obj) => localStorage.setItem(keySettings, JSON.stringify(obj));
const loadSettings = () => JSON.parse(localStorage.getItem(keySettings) || 'null') || {};

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const baseCurrencyEl = $('#base-currency');
const curr1El = $('#currency-1');
const rate1El = $('#rate-1');
const curr2El = $('#currency-2');
const rate2El = $('#rate-2');
const categoryListEl = $('#category-list');
const newCategoryEl = $('#new-category');
const addCategoryBtn = $('#add-category');
const exportBtn = $('#export-json');
const importFileEl = $('#import-file');
const importErrorsEl = $('#import-errors');
const resetBtn = $('#reset-data');
const saveNowBtn = $('#save-now');
const statusText = $('#status-text');

function renderCategories(categories){
    categoryListEl.innerHTML = '';
    categories.forEach(cat => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${cat}</span>&nbsp&nbsp<span><button data-cat="${cat}" class="btn btn-secondary small remove-cat">Remove</button></span>`;
    categoryListEl.appendChild(li);
    });
}

function loadUI(){
    const settings = loadSettings();
    baseCurrencyEl.value = settings.baseCurrency || 'USD';
    curr1El.value = settings.currency1?.code || '';
    rate1El.value = settings.currency1?.rate || '';
    curr2El.value = settings.currency2?.code || '';
    rate2El.value = settings.currency2?.rate || '';
    renderCategories(settings.categories || defaultCategories);
}

function saveUI(){
    const cfg = {
    baseCurrency: baseCurrencyEl.value,
    currency1: curr1El.value ? { code: curr1El.value.toUpperCase(), rate: rate1El.value } : null,
    currency2: curr2El.value ? { code: curr2El.value.toUpperCase(), rate: rate2El.value } : null,
    categories: Array.from(categoryListEl.querySelectorAll('li span:first-child')).map(s => s.textContent)
    };
    saveSettings(cfg);
    statusText.textContent = 'Settings saved at ' + new Date().toLocaleTimeString();
}

addCategoryBtn.addEventListener('click', (e) => {
    const val = newCategoryEl.value.trim();
    if(!val){ newCategoryEl.focus(); return; }
    if(!validators.category.test(val)){
    alert('Category name invalid. Use letters, spaces, and hyphens only.');
    return;
    }
    const existing = Array.from(categoryListEl.querySelectorAll('li span:first-child')).some(s=>s.textContent.toLowerCase()===val.toLowerCase());
    if(existing){ alert('Category already exists'); return; }
    const li = document.createElement('li');
    li.innerHTML = `<span>${val}</span><span><button data-cat="${val}" class="btn btn-secondary small remove-cat">Remove</button></span>`;
    categoryListEl.appendChild(li);
    newCategoryEl.value='';
    saveUI();
});

categoryListEl.addEventListener('click', (e)=>{
    const btn = e.target.closest('.remove-cat');
    if(!btn) return;
    const cat = btn.dataset.cat;
    if(!confirm(`Remove category "${cat}"? This will not change existing records.`)) return;
    const li = btn.closest('li'); li?.remove();
    saveUI();
});

exportBtn.addEventListener('click', () => {
    const data = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("transaction_")) {
            try {
                const value = localStorage.getItem(key);
                if (value) {
                    data.push(JSON.parse(value));
                }
            } catch (error) {
                console.log("Error with JSON", error);
                
            }
        }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance-data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    statusText.textContent = `Exported ${data.length} records to JSON`;
});

importFileEl.addEventListener('change', async (e) => {
    importErrorsEl.textContent = '';
    const file = e.target.files[0];
    if (!file) return;
    try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error('JSON must be an array of records.');
        
        const errors = [];
        parsed.forEach((rec, idx) => {
            if (typeof rec.id !== 'string') errors.push(idx + 1 + ': missing id');
            if (!rec.description && !rec.title) errors.push(idx + 1 + ': missing description/title');
            if (typeof rec.amount !== 'number') errors.push(idx + 1 + ': amount must be number');
            if (!/^(\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/.test(rec.date || '')) errors.push(idx + 1 + ': date invalid');
        });
        if (errors.length) { importErrorsEl.textContent = 'Import errors: ' + errors.join('; '); return; }
        
        parsed.forEach((rec) => {
            const key = `transaction_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
            localStorage.setItem(key, JSON.stringify(rec));
        });

        statusText.textContent = 'Imported ' + parsed.length + ' records';
    } catch (err) {
        importErrorsEl.textContent = 'Failed to import: ' + err.message;
    } finally {
        e.target.value = '';
    }
});

resetBtn.addEventListener('click', ()=>{
    if(!confirm('Reset all app data (records + settings)?')) return;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith("transaction_") || key === "exp") {                
            localStorage.removeItem(key);
        }
    }
    localStorage.removeItem(keySettings);
    renderCategories(defaultCategories);
    statusText.textContent = 'App data reset';
});

saveNowBtn.addEventListener('click', ()=>{ saveUI(); });

$$("input,select").forEach(el=>el.addEventListener('blur', ()=>saveUI()));

loadUI();

$('#menu-toggle').addEventListener('click', function(){
    const nav = $('#nav-links');
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('active');
});

window.FinanceSettings = { loadSettings, saveSettings, compileRegex };
