module.exports = {
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    },

    calculatePercentage: (part, total) => {
        if (total === 0) return 0;
        return ((part / total) * 100).toFixed(2);
    },

    parseDate: (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    },

    generateRandomId: () => {
        return 'id-' + Math.random().toString(36).substr(2, 16);
    }
};