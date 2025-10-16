function loadDashboard() {
  const expData = JSON.parse(localStorage.getItem("exp")) || { totalIncome: 0, totalExpenses: 0 };

  const totalIncome = expData.totalIncome || 0;
  const totalExpenses = expData.totalExpenses || 0;
  const balance = totalIncome - totalExpenses;

  document.getElementById("totalIncome").textContent = `$${totalIncome}`;
  document.getElementById("totalExpenses").textContent = `$${totalExpenses}`;
  document.getElementById("balance").textContent = `$${balance}`;

  const tbody = document.getElementById("recentTransactions");
  let html = "";

  const keys = Object.keys(localStorage).filter(k => k.startsWith("transaction_"));
  keys.sort((a, b) => b.localeCompare(a));

  for (const key of keys.slice(0, 5)) { 
    const tx = JSON.parse(localStorage.getItem(key));
    html += `
      <tr>
        <td>${tx.date}</td>
        <td>${tx.description}</td>
        <td>${tx.category}</td>
        <td>${tx.amount}</td>
      </tr>
    `;
  }
  tbody.innerHTML = html;

  const ctx = document.getElementById("financeChart").getContext("2d");

  new Chart(ctx, {
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

window.addEventListener("load", loadDashboard);
