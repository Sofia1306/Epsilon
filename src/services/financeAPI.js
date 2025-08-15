const axios = require('axios');

class FinanceAPI {
    constructor() {
        this.baseURL = process.env.FINANCE_API_URL || 'https://query1.finance.yahoo.com/v8/finance/chart';
        this.quoteURL = process.env.FINANCE_API_QUOTE_URL || 'https://query1.finance.yahoo.com/v7/finance/quote';
        
        // Stock data cache with realistic prices and daily variations
        this.stockCache = new Map();
        this.lastUpdate = new Map();
        
        // Initialize popular stocks with realistic base prices
        this.initializeStockData();
    }

    initializeStockData() {
        const stockData = {
            // Tech Giants
            'AAPL': { basePrice: 175.50, name: 'Apple Inc.', volatility: 0.025 },
            'GOOGL': { basePrice: 142.80, name: 'Alphabet Inc.', volatility: 0.030 },
            'GOOG': { basePrice: 144.30, name: 'Alphabet Inc. Class C', volatility: 0.030 },
            'MSFT': { basePrice: 338.25, name: 'Microsoft Corporation', volatility: 0.022 },
            'AMZN': { basePrice: 154.75, name: 'Amazon.com Inc.', volatility: 0.035 },
            'TSLA': { basePrice: 238.50, name: 'Tesla Inc.', volatility: 0.050 },
            'META': { basePrice: 325.20, name: 'Meta Platforms Inc.', volatility: 0.040 },
            'NFLX': { basePrice: 445.80, name: 'Netflix Inc.', volatility: 0.038 },
            'NVDA': { basePrice: 485.60, name: 'NVIDIA Corporation', volatility: 0.045 },
            
            // Software & Cloud
            'CRM': { basePrice: 245.30, name: 'Salesforce Inc.', volatility: 0.032 },
            'ADBE': { basePrice: 562.80, name: 'Adobe Inc.', volatility: 0.028 },
            'ORCL': { basePrice: 118.45, name: 'Oracle Corporation', volatility: 0.025 },
            'SAP': { basePrice: 145.20, name: 'SAP SE', volatility: 0.028 },
            'NOW': { basePrice: 678.90, name: 'ServiceNow Inc.', volatility: 0.035 },
            'SNOW': { basePrice: 186.75, name: 'Snowflake Inc.', volatility: 0.045 },
            'PLTR': { basePrice: 16.84, name: 'Palantir Technologies Inc.', volatility: 0.055 },
            
            // Other Tech
            'IBM': { basePrice: 165.30, name: 'International Business Machines Corp.', volatility: 0.025 },
            'INTC': { basePrice: 43.85, name: 'Intel Corporation', volatility: 0.035 },
            'AMD': { basePrice: 118.60, name: 'Advanced Micro Devices Inc.', volatility: 0.040 },
            'PYPL': { basePrice: 62.45, name: 'PayPal Holdings Inc.', volatility: 0.038 },
            'SQ': { basePrice: 78.90, name: 'Block Inc.', volatility: 0.045 },
            'SHOP': { basePrice: 65.20, name: 'Shopify Inc.', volatility: 0.050 },
            'UBER': { basePrice: 58.30, name: 'Uber Technologies Inc.', volatility: 0.042 },
            'LYFT': { basePrice: 14.75, name: 'Lyft Inc.', volatility: 0.048 },
            
            // Banking & Finance
            'JPM': { basePrice: 168.45, name: 'JPMorgan Chase & Co.', volatility: 0.025 },
            'BAC': { basePrice: 34.85, name: 'Bank of America Corp.', volatility: 0.030 },
            'WFC': { basePrice: 48.75, name: 'Wells Fargo & Co.', volatility: 0.028 },
            'GS': { basePrice: 385.20, name: 'Goldman Sachs Group Inc.', volatility: 0.035 },
            'MS': { basePrice: 88.65, name: 'Morgan Stanley', volatility: 0.032 },
            'C': { basePrice: 48.90, name: 'Citigroup Inc.', volatility: 0.035 },
            'USB': { basePrice: 42.30, name: 'U.S. Bancorp', volatility: 0.028 },
            'PNC': { basePrice: 155.60, name: 'PNC Financial Services Group Inc.', volatility: 0.030 },
            
            // Payment Systems
            'V': { basePrice: 258.70, name: 'Visa Inc.', volatility: 0.022 },
            'MA': { basePrice: 418.50, name: 'Mastercard Incorporated', volatility: 0.024 },
            'AXP': { basePrice: 178.40, name: 'American Express Company', volatility: 0.028 },
            
            // Healthcare & Pharma
            'JNJ': { basePrice: 162.85, name: 'Johnson & Johnson', volatility: 0.020 },
            'PFE': { basePrice: 29.45, name: 'Pfizer Inc.', volatility: 0.028 },
            'UNH': { basePrice: 548.90, name: 'UnitedHealth Group Inc.', volatility: 0.022 },
            'ABBV': { basePrice: 154.20, name: 'AbbVie Inc.', volatility: 0.025 },
            'MRK': { basePrice: 108.75, name: 'Merck & Co. Inc.', volatility: 0.024 },
            'BMY': { basePrice: 52.30, name: 'Bristol-Myers Squibb Company', volatility: 0.026 },
            'LLY': { basePrice: 598.40, name: 'Eli Lilly and Company', volatility: 0.028 },
            
            // Consumer Goods
            'KO': { basePrice: 59.85, name: 'Coca-Cola Company', volatility: 0.018 },
            'PEP': { basePrice: 174.60, name: 'PepsiCo Inc.', volatility: 0.020 },
            'WMT': { basePrice: 165.20, name: 'Walmart Inc.', volatility: 0.022 },
            'TGT': { basePrice: 128.45, name: 'Target Corporation', volatility: 0.030 },
            'COST': { basePrice: 785.60, name: 'Costco Wholesale Corporation', volatility: 0.025 },
            'HD': { basePrice: 378.90, name: 'Home Depot Inc.', volatility: 0.024 },
            'LOW': { basePrice: 235.40, name: 'Lowe\'s Companies Inc.', volatility: 0.026 },
            
            // Entertainment & Media
            'DIS': { basePrice: 96.75, name: 'Walt Disney Company', volatility: 0.035 },
            'CMCSA': { basePrice: 43.20, name: 'Comcast Corporation', volatility: 0.025 },
            'VZ': { basePrice: 40.85, name: 'Verizon Communications Inc.', volatility: 0.022 },
            'T': { basePrice: 15.95, name: 'AT&T Inc.', volatility: 0.028 },
            
            // Energy
            'XOM': { basePrice: 105.80, name: 'Exxon Mobil Corporation', volatility: 0.035 },
            'CVX': { basePrice: 158.40, name: 'Chevron Corporation', volatility: 0.032 },
            'COP': { basePrice: 116.30, name: 'ConocoPhillips', volatility: 0.038 },
            
            // Industrial
            'BA': { basePrice: 218.50, name: 'Boeing Company', volatility: 0.042 },
            'CAT': { basePrice: 298.75, name: 'Caterpillar Inc.', volatility: 0.030 },
            'GE': { basePrice: 125.40, name: 'General Electric Company', volatility: 0.035 },
            
            // Automotive
            'F': { basePrice: 12.85, name: 'Ford Motor Company', volatility: 0.040 },
            'GM': { basePrice: 37.20, name: 'General Motors Company', volatility: 0.038 },
            'RIVN': { basePrice: 18.45, name: 'Rivian Automotive Inc.', volatility: 0.065 },
            'LCID': { basePrice: 3.68, name: 'Lucid Group Inc.', volatility: 0.070 },
            
            // Crypto-related
            'COIN': { basePrice: 158.70, name: 'Coinbase Global Inc.', volatility: 0.060 },
            'MSTR': { basePrice: 1485.30, name: 'MicroStrategy Incorporated', volatility: 0.080 },
            
            // Meme Stocks
            'GME': { basePrice: 18.95, name: 'GameStop Corp.', volatility: 0.085 },
            'AMC': { basePrice: 4.82, name: 'AMC Entertainment Holdings Inc.', volatility: 0.090 },
            
            // Market Indices
            '%5EGSPC': { basePrice: 4785.60, name: 'S&P 500', volatility: 0.015 },
            '%5EDJI': { basePrice: 37640.20, name: 'Dow Jones Industrial Average', volatility: 0.018 },
            '%5EIXIC': { basePrice: 14850.80, name: 'NASDAQ Composite', volatility: 0.020 },
            '%5EVIX': { basePrice: 18.45, name: 'CBOE Volatility Index', volatility: 0.150 }
        };

        // Initialize cache with base data
        for (const [symbol, data] of Object.entries(stockData)) {
            this.stockCache.set(symbol, {
                symbol: symbol,
                shortName: data.name,
                basePrice: data.basePrice,
                volatility: data.volatility,
                price: data.basePrice,
                change: 0,
                changePercent: 0,
                volume: this.generateVolume(),
                marketCap: this.generateMarketCap(data.basePrice),
                currency: 'USD',
                lastUpdate: Date.now()
            });
        }
    }

    async getStockPrice(symbol) {
        try {
            // Check if we have cached data and if it's recent (less than 5 minutes old)
            const cached = this.stockCache.get(symbol);
            const now = Date.now();
            
            if (cached && (now - cached.lastUpdate) < 5 * 60 * 1000) {
                // Return cached data with small price movement simulation
                return this.simulateRealTimeMovement(cached);
            }

            // Try to fetch from API first
            try {
                const response = await axios.get(`${this.quoteURL}?symbols=${symbol}`, {
                    timeout: 3000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                const data = response.data.quoteResponse.result[0];
                
                if (data) {
                    const stockInfo = {
                        symbol: data.symbol,
                        shortName: data.shortName || data.longName || symbol,
                        price: data.regularMarketPrice,
                        change: data.regularMarketChange,
                        changePercent: data.regularMarketChangePercent,
                        volume: data.regularMarketVolume,
                        marketCap: data.marketCap,
                        currency: data.currency || 'USD',
                        lastUpdate: now
                    };
                    
                    this.stockCache.set(symbol, stockInfo);
                    return stockInfo;
                }
            } catch (apiError) {
                console.log(`API failed for ${symbol}, using simulated data`);
            }

            // Fallback to simulated data
            return this.generateStockData(symbol);
            
        } catch (error) {
            console.error('Error in getStockPrice:', error);
            return this.generateStockData(symbol);
        }
    }

    simulateRealTimeMovement(cachedData) {
        const now = Date.now();
        const timeSinceUpdate = (now - cachedData.lastUpdate) / 1000 / 60; // minutes
        
        // Simulate small price movements over time
        const volatility = cachedData.volatility || 0.025;
        const randomChange = (Math.random() - 0.5) * volatility * 0.1; // Small movement
        
        const newPrice = cachedData.price * (1 + randomChange);
        const change = newPrice - cachedData.basePrice;
        const changePercent = (change / cachedData.basePrice) * 100;
        
        return {
            ...cachedData,
            price: Math.max(0.01, newPrice),
            change: change,
            changePercent: changePercent,
            volume: this.generateVolume(),
            lastUpdate: now
        };
    }

    generateStockData(symbol) {
        const cached = this.stockCache.get(symbol);
        
        if (cached) {
            // Generate realistic movement based on volatility
            const volatility = cached.volatility;
            const randomChange = (Math.random() - 0.5) * volatility;
            const newPrice = cached.basePrice * (1 + randomChange);
            const change = newPrice - cached.basePrice;
            const changePercent = (change / cached.basePrice) * 100;
            
            const stockData = {
                symbol: symbol,
                shortName: cached.shortName,
                price: Math.max(0.01, newPrice),
                change: change,
                changePercent: changePercent,
                volume: this.generateVolume(),
                marketCap: this.generateMarketCap(newPrice),
                currency: 'USD',
                lastUpdate: Date.now()
            };
            
            // Update cache
            this.stockCache.set(symbol, { ...cached, ...stockData });
            return stockData;
        }
        
        // Generate data for unknown stocks
        const basePrice = 50 + Math.random() * 200; // $50-$250
        const randomChange = (Math.random() - 0.5) * 0.05; // ±5%
        const price = basePrice * (1 + randomChange);
        const change = price - basePrice;
        const changePercent = (change / basePrice) * 100;
        
        return {
            symbol: symbol,
            shortName: `${symbol} Company`,
            price: Math.max(0.01, price),
            change: change,
            changePercent: changePercent,
            volume: this.generateVolume(),
            marketCap: this.generateMarketCap(price),
            currency: 'USD'
        };
    }

    generateVolume() {
        return Math.floor(Math.random() * 10000000) + 1000000; // 1M-11M
    }

    generateMarketCap(price) {
        const shares = Math.floor(Math.random() * 5000000000) + 1000000000; // 1B-6B shares
        return Math.floor(price * shares);
    }

    async searchStocks(query) {
        try {
            // Enhanced stock database with comprehensive list
            const stockDatabase = [
                // Tech Giants
                { symbol: 'AAPL', name: 'Apple Inc.' },
                { symbol: 'GOOGL', name: 'Alphabet Inc. Class A' },
                { symbol: 'GOOG', name: 'Alphabet Inc. Class C' },
                { symbol: 'MSFT', name: 'Microsoft Corporation' },
                { symbol: 'AMZN', name: 'Amazon.com Inc.' },
                { symbol: 'TSLA', name: 'Tesla Inc.' },
                { symbol: 'META', name: 'Meta Platforms Inc.' },
                { symbol: 'NFLX', name: 'Netflix Inc.' },
                { symbol: 'NVDA', name: 'NVIDIA Corporation' },
                
                // Software & Cloud
                { symbol: 'CRM', name: 'Salesforce Inc.' },
                { symbol: 'ADBE', name: 'Adobe Inc.' },
                { symbol: 'ORCL', name: 'Oracle Corporation' },
                { symbol: 'SAP', name: 'SAP SE' },
                { symbol: 'NOW', name: 'ServiceNow Inc.' },
                { symbol: 'SNOW', name: 'Snowflake Inc.' },
                { symbol: 'PLTR', name: 'Palantir Technologies Inc.' },
                
                // Other Tech
                { symbol: 'IBM', name: 'International Business Machines Corp.' },
                { symbol: 'INTC', name: 'Intel Corporation' },
                { symbol: 'AMD', name: 'Advanced Micro Devices Inc.' },
                { symbol: 'PYPL', name: 'PayPal Holdings Inc.' },
                { symbol: 'SQ', name: 'Block Inc.' },
                { symbol: 'SHOP', name: 'Shopify Inc.' },
                { symbol: 'UBER', name: 'Uber Technologies Inc.' },
                { symbol: 'LYFT', name: 'Lyft Inc.' },
                
                // Banking & Finance
                { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
                { symbol: 'BAC', name: 'Bank of America Corporation' },
                { symbol: 'WFC', name: 'Wells Fargo & Company' },
                { symbol: 'GS', name: 'Goldman Sachs Group Inc.' },
                { symbol: 'MS', name: 'Morgan Stanley' },
                { symbol: 'C', name: 'Citigroup Inc.' },
                { symbol: 'USB', name: 'U.S. Bancorp' },
                { symbol: 'PNC', name: 'PNC Financial Services Group Inc.' },
                
                // Payment Systems
                { symbol: 'V', name: 'Visa Inc.' },
                { symbol: 'MA', name: 'Mastercard Incorporated' },
                { symbol: 'AXP', name: 'American Express Company' },
                
                // Healthcare & Pharma
                { symbol: 'JNJ', name: 'Johnson & Johnson' },
                { symbol: 'PFE', name: 'Pfizer Inc.' },
                { symbol: 'UNH', name: 'UnitedHealth Group Inc.' },
                { symbol: 'ABBV', name: 'AbbVie Inc.' },
                { symbol: 'MRK', name: 'Merck & Co. Inc.' },
                { symbol: 'BMY', name: 'Bristol-Myers Squibb Company' },
                { symbol: 'LLY', name: 'Eli Lilly and Company' },
                
                // Consumer Goods
                { symbol: 'KO', name: 'Coca-Cola Company' },
                { symbol: 'PEP', name: 'PepsiCo Inc.' },
                { symbol: 'WMT', name: 'Walmart Inc.' },
                { symbol: 'TGT', name: 'Target Corporation' },
                { symbol: 'COST', name: 'Costco Wholesale Corporation' },
                { symbol: 'HD', name: 'Home Depot Inc.' },
                { symbol: 'LOW', name: 'Lowe\'s Companies Inc.' },
                
                // Entertainment & Media
                { symbol: 'DIS', name: 'Walt Disney Company' },
                { symbol: 'CMCSA', name: 'Comcast Corporation' },
                { symbol: 'VZ', name: 'Verizon Communications Inc.' },
                { symbol: 'T', name: 'AT&T Inc.' },
                
                // Energy
                { symbol: 'XOM', name: 'Exxon Mobil Corporation' },
                { symbol: 'CVX', name: 'Chevron Corporation' },
                { symbol: 'COP', name: 'ConocoPhillips' },
                
                // Industrial
                { symbol: 'BA', name: 'Boeing Company' },
                { symbol: 'CAT', name: 'Caterpillar Inc.' },
                { symbol: 'GE', name: 'General Electric Company' },
                
                // Automotive
                { symbol: 'F', name: 'Ford Motor Company' },
                { symbol: 'GM', name: 'General Motors Company' },
                { symbol: 'RIVN', name: 'Rivian Automotive Inc.' },
                { symbol: 'LCID', name: 'Lucid Group Inc.' },
                
                // Crypto-related
                { symbol: 'COIN', name: 'Coinbase Global Inc.' },
                { symbol: 'MSTR', name: 'MicroStrategy Incorporated' },
                
                // Meme Stocks
                { symbol: 'GME', name: 'GameStop Corp.' },
                { symbol: 'AMC', name: 'AMC Entertainment Holdings Inc.' }
            ];

            // Enhanced search with multiple matching criteria
            const results = stockDatabase.filter(stock => {
                const queryLower = query.toLowerCase();
                const symbolMatch = stock.symbol.toLowerCase().includes(queryLower);
                const nameMatch = stock.name.toLowerCase().includes(queryLower);
                
                // Also check for common alternative names
                const alternativeNames = this.getAlternativeNames(stock.symbol);
                const alternativeMatch = alternativeNames.some(alt => 
                    alt.toLowerCase().includes(queryLower)
                );
                
                return symbolMatch || nameMatch || alternativeMatch;
            });

            // Sort results by relevance (exact symbol match first, then name match)
            results.sort((a, b) => {
                const queryLower = query.toLowerCase();
                
                // Exact symbol matches come first
                if (a.symbol.toLowerCase() === queryLower) return -1;
                if (b.symbol.toLowerCase() === queryLower) return 1;
                
                // Symbol starts with query
                const aSymbolStarts = a.symbol.toLowerCase().startsWith(queryLower);
                const bSymbolStarts = b.symbol.toLowerCase().startsWith(queryLower);
                if (aSymbolStarts && !bSymbolStarts) return -1;
                if (!aSymbolStarts && bSymbolStarts) return 1;
                
                // Name starts with query
                const aNameStarts = a.name.toLowerCase().startsWith(queryLower);
                const bNameStarts = b.name.toLowerCase().startsWith(queryLower);
                if (aNameStarts && !bNameStarts) return -1;
                if (!aNameStarts && bNameStarts) return 1;
                
                // Alphabetical order
                return a.symbol.localeCompare(b.symbol);
            });

            return results.slice(0, 15); // Return top 15 matches
        } catch (error) {
            console.error('Error searching stocks:', error);
            return [];
        }
    }

    // Helper method to get alternative names for stocks
    getAlternativeNames(symbol) {
        const alternatives = {
            'META': ['facebook', 'fb'],
            'GOOGL': ['google', 'alphabet'],
            'GOOG': ['google', 'alphabet'],
            'TSLA': ['tesla'],
            'AAPL': ['apple'],
            'MSFT': ['microsoft'],
            'AMZN': ['amazon'],
            'ORCL': ['oracle'],
            'CRM': ['salesforce'],
            'NFLX': ['netflix'],
            'NVDA': ['nvidia'],
            'AMD': ['amd', 'advanced micro devices'],
            'INTC': ['intel'],
            'IBM': ['ibm', 'international business machines'],
            'PYPL': ['paypal'],
            'UBER': ['uber'],
            'LYFT': ['lyft'],
            'JPM': ['jpmorgan', 'jp morgan'],
            'BAC': ['bank of america'],
            'WFC': ['wells fargo'],
            'GS': ['goldman sachs'],
            'MS': ['morgan stanley'],
            'V': ['visa'],
            'MA': ['mastercard'],
            'JNJ': ['johnson', 'johnson & johnson'],
            'PFE': ['pfizer'],
            'KO': ['coca cola', 'coke'],
            'PEP': ['pepsi', 'pepsico'],
            'WMT': ['walmart'],
            'DIS': ['disney'],
            'HD': ['home depot'],
            'COST': ['costco'],
            'BA': ['boeing'],
            'CAT': ['caterpillar'],
            'F': ['ford'],
            'GM': ['general motors'],
            'XOM': ['exxon', 'exxon mobil'],
            'CVX': ['chevron'],
            'COIN': ['coinbase'],
            'GME': ['gamestop'],
            'AMC': ['amc entertainment']
        };
        
        return alternatives[symbol] || [];
    }

    async getMarketData() {
        try {
            const indices = ['%5EGSPC', '%5EDJI', '%5EIXIC']; // S&P 500, Dow Jones, NASDAQ
            const results = [];
            
            for (const index of indices) {
                try {
                    const stockData = await this.getStockPrice(index);
                    results.push(stockData);
                } catch (error) {
                    console.error(`Error fetching ${index}:`, error);
                }
            }

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

    // Method to manually update base prices (for simulation purposes)
    updateBasePrice(symbol, newBasePrice) {
        const cached = this.stockCache.get(symbol);
        if (cached) {
            cached.basePrice = newBasePrice;
            this.stockCache.set(symbol, cached);
        }
    }

    // Method to get all cached stocks (for admin purposes)
    getAllCachedStocks() {
        return Array.from(this.stockCache.entries());
    }
}

module.exports = new FinanceAPI();