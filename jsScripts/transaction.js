// function addStorage() {
//     const date = document.getElementById("date").value;
//     const description = document.getElementById("description").value;
//     const category = document.getElementById("category").value;
//     const amount = parseFloat(document.getElementById("amount").value);
    
//     let totalExpenses = 0;

//     if ( localStorage.length !== 0 ) {

//         for (let i = 0; i < localStorage.length; i++) {

//             const key = localStorage.key(i);
//             const value = localStorage.getItem(key);

//             if (key.startsWith('transaction_')) {
                
//                 const transaction = JSON.parse(value);
//                 totalExpenses += transaction.amount;
//                 console.log(totalExpenses); 

//             }
//         }
        

//     } else {

//         totalExpenses = amount;

//     }

    
//     const data = {
//         date : date,
//         description : description,
//         category : category,
//         amount : amount,
//         totalExpenses : totalExpenses,
//     }

//     const key = `transaction_${Date.now()}`

//     document.getElementById("date").value = "";
//     document.getElementById("description").value = "";
//     document.getElementById("category").value = "";
//     document.getElementById("amount").value = "";

//     localStorage.setItem(key, JSON.stringify(data));

//     displayStorage();
// }


// function displayStorage() {

//     const tbody = document.getElementById("recordTables");
//     let html = '';

//     if (localStorage.length !== 0) {
        
//         for (let i = 0; i < localStorage.length; i++) {
//             const key = localStorage.key(i);
//             const value = localStorage.getItem(key);

//             const transaction = JSON.parse(value);

//             if (key.startsWith("transaction_") && transaction.amount !== null) {

//                 html += `
//                     <tr>
//                         <td>${transaction.date}</td>
//                         <td>${transaction.description}</td>
//                         <td>${transaction.category}</td>
//                         <td>${transaction.amount}</td>
//                     </tr>
//                 `;
//             }
            
//         }

//         tbody.innerHTML = html;
//     }
// }
// displayStorage();


function addStorage() {
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const amount = parseInt(document.getElementById("amount").value);
    let totalExpenses = 0;
    let totalIncome = 0;

    
    console.log("localStorage",localStorage);    

    if ( category === "income" ) {
        totalIncome += amount ; 
    } else if ( category === "expense") {
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
        category : category,
        amount : amount,
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
    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";


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
                            <td>${transaction.amount}</td>
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
        document.getElementById("totalExpenses").innerText = `${totalExpenses}`;
        document.getElementById("totalIncome").innerText = `${totalIncome}`;
        document.getElementById("balance").innerText = `${(totalIncome - totalExpenses)}`;
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
            const index = categories.indexOf(transaction.category);
            if (index >= 0) {
                totals[index] += transaction.amount;
            } else {
                categories.push(transaction.category); 
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