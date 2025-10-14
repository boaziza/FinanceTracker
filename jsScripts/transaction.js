function welcomeMessage() {
    const name = document.getElementById("name")
}

function addStorage() {
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("amount").value);
    
    let totalExpenses = 0;

    if ( localStorage.length !== 0 ) {

        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);
            const value = localStorage.getItem(key);

            if (key.startsWith('transaction_')) {
                
                const transaction = JSON.parse(value);
                totalExpenses += transaction.amount;
                console.log(totalExpenses); 

            }
        }
        

    } else {

        totalExpenses = amount;

    }

    
    const data = {
        date : date,
        description : description,
        category : category,
        amount : amount,
        totalExpenses : totalExpenses,
    }

    const key = `transaction_${Date.now()}`

    document.getElementById("date").value = "";
    document.getElementById("description").value = "";
    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";

    localStorage.setItem(key, JSON.stringify(data));

    displayStorage();
}


function displayStorage() {

    const tbody = document.getElementById("recordTables");
    let html = '';

    if (localStorage.length !== 0) {
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);

            const transaction = JSON.parse(value);

            if (key.startsWith("transaction_") && transaction.amount !== null) {

                html += `
                    <tr>
                        <td>${transaction.date}</td>
                        <td>${transaction.description}</td>
                        <td>${transaction.category}</td>
                        <td>${transaction.amount}</td>
                    </tr>
                `;
            }
            
        }

        tbody.innerHTML = html;
    }
}
displayStorage();

