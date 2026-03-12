let transactions = JSON.parse(localStorage.getItem('ff_data')) || [];
let myChart = null;

// --- CONTROLE DE ACESSO ---
function checkAuth() {
    const user = localStorage.getItem('ff_user');
    const modal = document.getElementById('login-modal');
    if (user) {
        modal.style.display = 'none'; // REMOVE O BLOQUEIO
        document.getElementById('welcome-msg').innerText = `Olá, ${user}! 👋`;
        render();
    } else {
        modal.style.display = 'flex';
    }
}

function handleLogin() {
    const name = document.getElementById('user-name').value;
    if (name.trim()) {
        localStorage.setItem('ff_user', name);
        checkAuth();
    }
}

function logout() {
    localStorage.removeItem('ff_user');
    location.reload();
}

// --- NAVEGAÇÃO ---
function changeView(view) {
    const dashboard = document.getElementById('view-dashboard');
    const transactionsView = document.getElementById('view-transactions');
    const btnDash = document.getElementById('btn-dashboard');
    const btnTrans = document.getElementById('btn-transactions');

    if (view === 'dashboard') {
        dashboard.style.display = 'block';
        transactionsView.style.display = 'none';
        btnDash.classList.add('active-btn');
        btnTrans.classList.remove('active-btn');
    } else {
        dashboard.style.display = 'none';
        transactionsView.style.display = 'block';
        btnTrans.classList.add('active-btn');
        btnDash.classList.remove('active-btn');
        renderList();
    }
}

// --- LOGICA DE DADOS ---
document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const data = {
        id: Date.now(),
        desc: document.getElementById('desc').value,
        amount: parseFloat(document.getElementById('amount').value),
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };
    transactions.push(data);
    localStorage.setItem('ff_data', JSON.stringify(transactions));
    this.reset();
    render();
    alert("Registro salvo!");
});

function deleteItem(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('ff_data', JSON.stringify(transactions));
    render();
    renderList();
}

// --- RENDERIZAÇÃO ---
function render() {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;

    document.getElementById('total-income').innerText = `R$ ${income.toLocaleString('pt-BR')}`;
    document.getElementById('total-expense').innerText = `R$ ${expense.toLocaleString('pt-BR')}`;
    document.getElementById('total-balance').innerText = `R$ ${balance.toLocaleString('pt-BR')}`;
    
    updateChart(income, expense);
}

function renderList() {
    const list = document.getElementById('transaction-list');
    list.innerHTML = transactions.map(t => `
        <div class="flex justify-between items-center p-4 glass rounded-2xl">
            <div>
                <div class="font-bold">${t.desc}</div>
                <div class="text-xs text-slate-500">${t.date} | ${t.category}</div>
            </div>
            <div class="flex items-center gap-4">
                <span class="${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'} font-bold">
                    ${t.type === 'income' ? '+' : '-'} R$ ${t.amount.toFixed(2)}
                </span>
                <button onclick="deleteItem(${t.id})" class="text-rose-500 hover:scale-110 transition">Excluir</button>
            </div>
        </div>
    `).join('') || '<p class="text-center text-slate-500">Nenhum registro.</p>';
}

function updateChart(income, expense) {
    const ctx = document.getElementById('financeChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Entradas', 'Saídas'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// INICIAR
window.onload = () => {
    checkAuth();
    lucide.createIcons();
};