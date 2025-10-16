let sortColumn = null;
let sortDirection = 'asc';
let searchPattern = null;
let searchCaseSensitive = false;

const settings = JSON.parse(localStorage.getItem('finance:settings')) || {};
const baseCurrency = settings.baseCurrency || 'USD';
const currency1 = settings.currency1?.code || '';
const currency2 = settings.currency2?.code || '';
const customCategories = settings.categories || ['Income','Expense'];

const categorySelect = document.getElementById('category');
categorySelect.innerHTML = ''; // clear first
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

    const data = {
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

    const key = `transaction_${Date.now()}`;
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
function updateChart() {
    const ctx = document.getElementById('expensesChart').getContext('2d');
    const categories = [];
    const totals = [];


    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('transaction_')) {
            const transaction = JSON.parse(localStorage.getItem(key));
            const index = categories.indexOf(transaction.accounts);
            if (index >= 0) {
                totals[index] += transaction.amount;
            } else {
                categories.push(transaction.accounts); 
                totals.push(transaction.amount);
            }
        }
    }


    if (chart) {
        chart.destroy();
        chart = new Chart(ctx, {
        type: 'bar',
        data: {labels: categories, datasets: [{label: 'Expenses by Category', data: totals, backgroundColor: 'rgba(38,38,82,0.7)'}]},
        options: {responsive: true, plugins: {legend: {display: false}}}
        });
    }
}

