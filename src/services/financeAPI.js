const axios = require('axios');

class FinanceAPI {
    constructor() {
        this.baseURL = process.env.FINANCE_API_URL || 'https://query1.finance.yahoo.com/v8/finance/chart';
        this.quoteURL = process.env.FINANCE_API_QUOTE_URL || 'https://query1.finance.yahoo.com/v7/finance/quote';
    }

    async getStockPrice(symbol) {
        try {
            const response = await axios.get(`${this.quoteURL}?symbols=${symbol}`);
            const data = response.data.quoteResponse.result[0];
            
            if (!data) {
                throw new Error('Stock not found');
            }

            return {
                symbol: data.symbol,
                shortName: data.shortName || data.longName,
                price: data.regularMarketPrice,
                change: data.regularMarketChange,
                changePercent: data.regularMarketChangePercent,
                volume: data.regularMarketVolume,
                marketCap: data.marketCap,
                currency: data.currency || 'USD'
            };
        } catch (error) {
            console.error('Error fetching stock price:', error);
            // Return mock data if API fails
            return {
                symbol: symbol,
                shortName: 'Company Name',
                price: 100 + Math.random() * 50,
                change: (Math.random() - 0.5) * 10,
                changePercent: (Math.random() - 0.5) * 5,
                volume: Math.floor(Math.random() * 1000000),
                marketCap: Math.floor(Math.random() * 1000000000),
                currency: 'USD'
            };
        }
    }

    async searchStocks(query) {
        try {
            // For simplicity, return popular stocks that match the query
            const popularStocks = [
                { symbol: 'AAPL', name: 'Apple Inc.' },
                { symbol: 'GOOGL', name: 'Alphabet Inc.' },
                { symbol: 'MSFT', name: 'Microsoft Corporation' },
                { symbol: 'AMZN', name: 'Amazon.com Inc.' },
                { symbol: 'TSLA', name: 'Tesla Inc.' },
                { symbol: 'META', name: 'Meta Platforms Inc.' },
                { symbol: 'NFLX', name: 'Netflix Inc.' },
                { symbol: 'NVDA', name: 'NVIDIA Corporation' }
            ];

            return popularStocks.filter(stock => 
                stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
                stock.name.toLowerCase().includes(query.toLowerCase())
            );
        } catch (error) {
            console.error('Error searching stocks:', error);
            return [];
        }
    }

    async getMarketData() {
        try {
            const indices = ['%5EGSPC', '%5EDJI', '%5EIXIC']; // S&P 500, Dow Jones, NASDAQ
            const promises = indices.map(index => this.getStockPrice(index));
            const results = await Promise.all(promises);

            return {
                indices: results,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching market data:', error);
            return {
                indices: [],
                timestamp: new Date().toISOString()
            };
        }
    }
}

module.exports = new FinanceAPI();