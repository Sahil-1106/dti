

        const categories = {
            income: ['Salary', 'Freelance', 'Investments', 'Bonus', 'Other'],
            expense: ['Food', 'Rent', 'Utilities', 'Transportation', 'Entertainment', 'Other']
        };
        
        let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        let currentFilter = 'monthly';
        let financeChart = null;
        let expenseChart = null;
        let incomeChart = null;
        
        // Initialize dropdowns and default date
        document.addEventListener('DOMContentLoaded', () => {
            populateCategories();
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
        });
        
        document.getElementById('type').addEventListener('change', populateCategories);
        
        function populateCategories() {
            const type = document.getElementById('type').value;
            const categorySelect = document.getElementById('category');
            categorySelect.innerHTML = categories[type]
                .map(cat => `<option value="${cat}">${cat}</option>`)
                .join('');
        }
        
        document.getElementById('financeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const transaction = {
                type: document.getElementById('type').value,
                date: document.getElementById('date').value,
                amount: parseFloat(document.getElementById('amount').value),
                category: document.getElementById('category').value
            };
        
            transactions.push(transaction);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            updateDisplay();
            document.getElementById('financeForm').reset();
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
        });
        
        // Clear all data function
        function clearAllData() {
            if (confirm("Are you sure you want to clear all data?")) {
                localStorage.removeItem('transactions');
                transactions = [];
                updateDisplay();
            }
        }
        
        function filterTransactions(filter) {
            currentFilter = filter;
            updateDisplay();
        }
        
        function updateDisplay() {
            const filtered = filterData(transactions, currentFilter);
            updateSummary(filtered);
            updateCharts(filtered);
        }
        
        function filterData(data, filter) {
            const now = new Date();
            return data.filter(transaction => {
                const date = new Date(transaction.date);
                switch(filter) {
                    case 'weekly':
                        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return date >= oneWeekAgo;
                    case 'monthly':
                        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    case 'yearly':
                        return date.getFullYear() === now.getFullYear();
                    default:
                        return true;
                }
            });
        }
        
        function updateSummary(data) {
            const summary = data.reduce((acc, transaction) => {
                if (!acc[transaction.type]) acc[transaction.type] = { total: 0, categories: {} };
                acc[transaction.type].total += transaction.amount;
                if (!acc[transaction.type].categories[transaction.category]) {
                    acc[transaction.type].categories[transaction.category] = 0;
                }
                acc[transaction.type].categories[transaction.category] += transaction.amount;
                return acc;
            }, {});
        
            let html = '<h3>Summary</h3>';
            for (let type in summary) {
                html += `<h4>${type.charAt(0).toUpperCase() + type.slice(1)}: $${summary[type].total.toFixed(2)}</h4>`;
                html += '<ul>';
                for (let category in summary[type].categories) {
                    html += `<li>${category}: $${summary[type].categories[category].toFixed(2)}</li>`;
                }
                html += '</ul>';
            }
            document.getElementById('summary').innerHTML = html;
        }
        
        function updateCharts(data) {
            const ctxFinance = document.getElementById('financeChart').getContext('2d');
            const ctxExpense = document.getElementById('expenseChart').getContext('2d');
            const ctxIncome = document.getElementById('incomeChart').getContext('2d');
        
            // Destroy existing charts
            if (financeChart) financeChart.destroy();
            if (expenseChart) expenseChart.destroy();
            if (incomeChart) incomeChart.destroy();
        
            // Combined Chart (Pie)
            const categoriesCombined = [...new Set(data.map(t => t.category))];
            const amountsCombined = categoriesCombined.map(category => 
                data.filter(t => t.category === category)
                    .reduce((sum, t) => sum + t.amount, 0)
            );
        
            financeChart = new Chart(ctxFinance, {
                type: 'pie',
                data: {
                    labels: categoriesCombined,
                    datasets: [{
                        data: amountsCombined,
                        backgroundColor: generateColors(categoriesCombined.length)
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    title: {
                        display: true,
                        text: 'All Transactions by Category'
                    }
                }
            });
        
            // Expense Chart (Bar)
            const expenseData = data.filter(t => t.type === 'expense');
            const expenseCategories = [...new Set(expenseData.map(t => t.category))];
            const expenseAmounts = expenseCategories.map(category =>
                expenseData.filter(t => t.category === category)
                    .reduce((sum, t) => sum + t.amount, 0)
            );
        
            expenseChart = new Chart(ctxExpense, {
                type: 'bar',
                data: {
                    labels: expenseCategories,
                    datasets: [{
                        label: 'Amount',
                        data: expenseAmounts,
                        backgroundColor: '#FF6384',
                        borderColor: '#FF6384',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    title: {
                        display: true,
                        text: 'Expenses by Category'
                    }
                }
            });
        
            // Income Chart (Bar)
            const incomeData = data.filter(t => t.type === 'income');
            const incomeCategories = [...new Set(incomeData.map(t => t.category))];
            const incomeAmounts = incomeCategories.map(category =>
                incomeData.filter(t => t.category === category)
                    .reduce((sum, t) => sum + t.amount, 0)
            );
        
            incomeChart = new Chart(ctxIncome, {
                type: 'bar',
                data: {
                    labels: incomeCategories,
                    datasets: [{
                        label: 'Amount',
                        data: incomeAmounts,
                        backgroundColor: '#36A2EB',
                        borderColor: '#36A2EB',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    title: {
                        display: true,
                        text: 'Income by Category'
                    }
                }
            });
        }
        
        // Utility to generate random colors for charts
        function generateColors(num) {
            const colors = [];
            for (let i = 0; i < num; i++) {
                const r = Math.floor(Math.random() * 255);
                const g = Math.floor(Math.random() * 255);
                const b = Math.floor(Math.random() * 255);
                colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
            }
            return colors;
        }
        
        // Initial load
        updateDisplay();
        