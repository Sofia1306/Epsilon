const ctx = document.getElementById('historicalChart').getContext('2d');
const historicalChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Populate with historical dates
        datasets: [{
            label: 'Net Investment Over Time',
            data: [], // Populate with historical net investment data
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const pieCtx = document.getElementById('investmentPieChart').getContext('2d');
const investmentPieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
        labels: [], // Populate with investment categories
        datasets: [{
            label: 'Investment Distribution',
            data: [], // Populate with investment amounts
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true
    }
});

// Function to fetch and update charts data
async function updateCharts() {
    try {
        const historicalData = await fetch('/api/portfolio/historical'); // Endpoint to get historical data
        const investmentData = await fetch('/api/investments'); // Endpoint to get investment data

        const historicalJson = await historicalData.json();
        const investmentJson = await investmentData.json();

        // Update historical chart
        historicalChart.data.labels = historicalJson.dates; // Assuming dates are returned
        historicalChart.data.datasets[0].data = historicalJson.values; // Assuming values are returned
        historicalChart.update();

        // Update pie chart
        investmentPieChart.data.labels = investmentJson.categories; // Assuming categories are returned
        investmentPieChart.data.datasets[0].data = investmentJson.amounts; // Assuming amounts are returned
        investmentPieChart.update();
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

// Call updateCharts on page load
document.addEventListener('DOMContentLoaded', updateCharts);