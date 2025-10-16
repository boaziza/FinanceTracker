let sortColumn = null;
let sortDirection = 'asc';
let searchPattern = null;
let searchCaseSensitive = false;

const settings = JSON.parse(localStorage.getItem('finance:settings')) || {};
const baseCurrency = settings.baseCurrency || 'USD';
const currency1 = settings.currency1?.code || '';
const currency2 = settings.currency2?.code || '';
const customCategories = settings.categories || ['Food','Books','Transport','Entertainment','Fees','Other'];

const categorySelect = document.getElementById('category');
categorySelect.innerHTML = ''; 
customCategories.forEach(cat => {
  const opt = document.createElement('option');
  opt.value = cat.toLowerCase();
  opt.textContent = cat;
  categorySelect.appendChild(opt);
});


function addStorage() {
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value;
    const accounts = document.getElementById("accounts").value;
    const amount = parseInt(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    let totalExpenses = 0;
    let totalIncome = 0;

    
    console.log("localStorage",localStorage);    

    if ( accounts === "income" ) {
        totalIncome += amount ; 
    } else if ( accounts === "expense") {
        totalExpenses += amount;
    }

    const expkey = `exp`;    
    const transaction = JSON.parse(localStorage.getItem(expkey));

    if (transaction) {

        totalExpenses += transaction.totalExpenses;
        totalIncome += transaction.totalIncome;
    }
    
    const key = `transaction_${Date.now()}`;

    const data = {
        id : key,
        date: date, 
        description: description, 
        accounts : accounts,
        amount : amount,
        currency : baseCurrency,
        category : category
    };

    const exp = {
        totalExpenses : totalExpenses,
        totalIncome : totalIncome
    };

    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(expkey, JSON.stringify(exp));


    document.getElementById("date").value = "";
    document.getElementById("description").value = "";
    document.getElementById("accounts").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";


    displayStorage();
    updateChart();
}

console.log(localStorage);



function displayStorage() {
    const tbody = document.getElementById("transactionTable");
    let html = '';
    let totalIncome = 0 , 
    totalExpenses = 0;

    if (localStorage !== 0) {

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const transaction = JSON.parse(localStorage.getItem(key));

            if (key.startsWith('transaction_') && transaction.amount !== "null") {
                html += `<tr>
                            <td>${transaction.date}</td>
                            <td>${transaction.description}</td>
                            <td>${transaction.category}</td>
                            <td>${transaction.accounts}</td>
                            <td>${baseCurrency}${transaction.amount}</td>
                        </tr>`;
                totalExpenses += transaction.amount;
            }
        }

        if (localStorage.getItem('exp')) {
            const transaction = JSON.parse(localStorage.getItem('exp'));

            totalIncome = transaction.totalIncome;
            totalExpenses  = transaction.totalExpenses;

        }


        tbody.innerHTML = html;
        document.getElementById("totalIncome").innerText = `${baseCurrency} ${totalIncome}`;
        
        document.getElementById("totalExpenses").innerText = `${baseCurrency} ${totalExpenses}`;
        document.getElementById("balance").innerText = `${baseCurrency} ${totalIncome - totalExpenses}`;

    }
}

displayStorage();


let chart;

updateChart();

function updateChart() {
  const canvas = document.getElementById('expensesChart');
  if (!canvas) {
    console.error('Canvas with id "expensesChart" not found.');
    return;
  }
  const ctx = canvas.getContext('2d');
  
  const categories = [];
  
  const totals = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('transaction_')) {
      const transaction = JSON.parse(localStorage.getItem(key));
      const amount = parseFloat(transaction.amount) || 0;
      const index = categories.indexOf(transaction.accounts);
      if (index >= 0) {
        totals[index] += amount;
      } else {
        categories.push(transaction.accounts);
        totals.push(amount);
      }
    }
  }

  let incomeIndex = categories.indexOf("income");
  
  let expenseIndex = categories.indexOf("expense");
  
  let totalIncome = incomeIndex !== -1 ? totals[incomeIndex] : 0;
  let totalExpenses = expenseIndex !== -1 ? totals[expenseIndex] : 0;

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [{
        data: [totalIncome, totalExpenses],
        backgroundColor: ["#27247eff", "#405c97ff"],
        borderWidth: 0
      }]
    },
    options: {
      
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#333" }
        }
      }
    }
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const tBody = document.getElementById("transactionTable");
  
  const searchInput = document.getElementById("searchInput");
  const caseBtn = document.getElementById("caseSensitiveBtn");
  
  const searchError = document.getElementById("searchError");
  
  const headers = document.querySelectorAll("th[data-sort]");
  let caseSensitive = false;
  let sortState = { key: null, asc: true };

  const transactions = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key.startsWith("transaction_")) {
      
      const item = JSON.parse(localStorage.getItem(key));

      if (item.date && item.description && item.category && item.amount) {
        
        transactions.push(item);
      }
    }
  }

  function renderTable(data) {
    tBody.innerHTML = "";
    if (data.length === 0) {
      tBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No records found</td></tr>`;
      return;
    }
    for (const t of data) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${t.date}</td>
        <td>${t.description}</td>
        <td>${t.category}</td>
        <td>${t.accounts}</td>
        <td>${t.amount}</td>`;
      tBody.appendChild(row);
    }
  }



  headers.forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      sortState.asc = sortState.key === key ? !sortState.asc : true;
      sortState.key = key;
      transactions.sort((a, b) => {
        if (key === "amount") return sortState.asc ? a.amount - b.amount : b.amount - a.amount;
        return sortState.asc
          ? String(a[key]).localeCompare(String(b[key]))
          : String(b[key]).localeCompare(String(a[key]));
      });
      renderTable(transactions);
      applySearch(); 
    });
  });

  function compileRegex(input) {
    try {
      return input ? new RegExp(input, caseSensitive ? "" : "i") : null;
    } catch (e) {
      searchError.textContent = "Invalid regex pattern!";
      return null;
    }
  }

  function applySearch() {
    const pattern = searchInput.value.trim();
    searchError.textContent = "";
    const regex = compileRegex(pattern);
    if (pattern && !regex) return;

    const rows = tBody.querySelectorAll("tr");
    rows.forEach(row => {
      const text = row.textContent;
      if (!regex || regex.test(text)) {
        row.style.display = "";

        Array.from(row.children).forEach(cell => {
          cell.innerHTML = cell.textContent.replace(regex, match => `<mark>${match}</mark>`);
        });
      } else {
        row.style.display = "none";
      }
    });
  }

  caseBtn.addEventListener("click", () => {
    caseSensitive = !caseSensitive;
    caseBtn.textContent = caseSensitive ? "Case: AA" : "Case: aa";
    applySearch();
  });

  searchInput.addEventListener("input", applySearch);

  renderTable(transactions);
});
