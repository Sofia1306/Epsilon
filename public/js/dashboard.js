document.addEventListener('DOMContentLoaded', function() {
    const netInvestmentElement = document.getElementById('net-investment');
    const cashFlowElement = document.getElementById('cash-flow');
    const investmentsElement = document.getElementById('investments');
    const historicalChartElement = document.getElementById('historical-chart');
    const pieChartElement = document.getElementById('pie-chart');
    const marketMovesElement = document.getElementById('market-moves');

    // Fetch net investment
    async function fetchNetInvestment() {
        const response = await fetch('/api/portfolio/net-investment');
        const data = await response.json();
        netInvestmentElement.textContent = `$${data.netInvestment}`;
    }

    // Fetch cash flow
    async function fetchCashFlow() {
        const response = await fetch('/api/portfolio/cash-flow');
        const data = await response.json();
        cashFlowElement.textContent = `$${data.cashFlow}`;
    }

    // Fetch investments
    async function fetchInvestments() {
        const response = await fetch('/api/investments');
        const data = await response.json();
        investmentsElement.innerHTML = data.investments.map(investment => `<li>${investment.name}: $${investment.amount}</li>`).join('');
    }

    // Fetch historical data for chart
    async function fetchHistoricalData() {
        const response = await fetch('/api/portfolio/historical-data');
        const data = await response.json();
        renderHistoricalChart(data);
    }

    // Fetch market moves
    async function fetchMarketMoves() {
        const response = await fetch('/api/market/moves');
        const data = await response.json();
        marketMovesElement.innerHTML = data.moves.map(move => `<li>${move.name}: ${move.change}%</li>`).join('');
    }

    // Render historical chart
    function renderHistoricalChart(data) {
        const ctx = historicalChartElement.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Investment Value Over Time',
                    data: data.values,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false
                }]
            }
        });
    }

    // Render pie chart
    function renderPieChart(data) {
        const ctx = pieChartElement.getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                    borderWidth: 1
                }]
            }
        });
    }

    // Initialize dashboard
    async function initDashboard() {
        await fetchNetInvestment();
        await fetchCashFlow();
        await fetchInvestments();
        await fetchHistoricalData();
        await fetchMarketMoves();
    }

    initDashboard();
});