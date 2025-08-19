const axios = require('axios');

class FinanceAPI {
    constructor() {
        this.chartURL = process.env.FINANCE_API_URL || 'https://query1.finance.yahoo.com/v8/finance/chart';
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
            'LOW': { basePrice: 235.40, name: 'Lowe\'s Companies Inc.', volatility: 0.026 }
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
            // Check if we have cached data and if it's recent
            const cached = this.stockCache.get(symbol);
            const now = Date.now();
            
            if (cached && (now - cached.lastUpdate) < 2 * 60 * 1000) {
                // Return cached data with small price movement simulation
                return this.simulateRealTimeMovement(cached);
            }

            // For demonstration, always use simulated data
            return this.generateStockData(symbol);
            
        } catch (error) {
            console.error(`Error in getStockPrice for ${symbol}:`, error);
            return this.generateStockData(symbol);
        }
    }

    simulateRealTimeMovement(cachedData) {
        const now = Date.now();
        const volatility = cachedData.volatility || 0.025;
        const randomChange = (Math.random() - 0.5) * volatility * 0.2;
        
        const newPrice = cachedData.price * (1 + randomChange);
        const change = newPrice - (cachedData.basePrice || cachedData.price);
        const changePercent = cachedData.basePrice ? (change / cachedData.basePrice) * 100 : 0;
        
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

    // Enhanced search with better ranking
    async searchStocks(query) {
        try {
            console.log(`🔍 Searching for: "${query}"`);
            const results = await this.searchStocksBase(query);
            
            // If no results, suggest popular alternatives
            if (results.length === 0) {
                console.log('No exact matches found, returning popular suggestions');
                const topStocks = await this.getTopStocks(5);
                return topStocks.map(stock => ({
                    symbol: stock.symbol,
                    name: stock.shortName,
                    suggestion: true
                }));
            }
            
            console.log(`Found ${results.length} matching stocks`);
            return results;
        } catch (error) {
            console.error('Enhanced search error:', error);
            return [];
        }
    }

    async searchStocksBase(query) {
        // Comprehensive stock database with more companies
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
            
            // More Tech Companies
            { symbol: 'CRM', name: 'Salesforce Inc.' },
            { symbol: 'ADBE', name: 'Adobe Inc.' },
            { symbol: 'ORCL', name: 'Oracle Corporation' },
            { symbol: 'SAP', name: 'SAP SE' },
            { symbol: 'NOW', name: 'ServiceNow Inc.' },
            { symbol: 'SNOW', name: 'Snowflake Inc.' },
            { symbol: 'PLTR', name: 'Palantir Technologies Inc.' },
            { symbol: 'IBM', name: 'International Business Machines Corp.' },
            { symbol: 'INTC', name: 'Intel Corporation' },
            { symbol: 'AMD', name: 'Advanced Micro Devices Inc.' },
            { symbol: 'PYPL', name: 'PayPal Holdings Inc.' },
            { symbol: 'SQ', name: 'Block Inc.' },
            { symbol: 'SHOP', name: 'Shopify Inc.' },
            { symbol: 'UBER', name: 'Uber Technologies Inc.' },
            { symbol: 'LYFT', name: 'Lyft Inc.' },
            { symbol: 'ZOOM', name: 'Zoom Video Communications Inc.' },
            { symbol: 'TWTR', name: 'Twitter Inc.' },
            { symbol: 'SNAP', name: 'Snap Inc.' },
            { symbol: 'SPOT', name: 'Spotify Technology SA' },
            { symbol: 'ROKU', name: 'Roku Inc.' },
            
            // Banking & Finance
            { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
            { symbol: 'BAC', name: 'Bank of America Corporation' },
            { symbol: 'WFC', name: 'Wells Fargo & Company' },
            { symbol: 'GS', name: 'Goldman Sachs Group Inc.' },
            { symbol: 'MS', name: 'Morgan Stanley' },
            { symbol: 'C', name: 'Citigroup Inc.' },
            { symbol: 'USB', name: 'U.S. Bancorp' },
            { symbol: 'PNC', name: 'PNC Financial Services Group Inc.' },
            { symbol: 'TD', name: 'Toronto-Dominion Bank' },
            { symbol: 'RY', name: 'Royal Bank of Canada' },
            
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
            { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.' },
            { symbol: 'DHR', name: 'Danaher Corporation' },
            { symbol: 'ABT', name: 'Abbott Laboratories' },
            
            // Consumer Goods
            { symbol: 'KO', name: 'Coca-Cola Company' },
            { symbol: 'PEP', name: 'PepsiCo Inc.' },
            { symbol: 'WMT', name: 'Walmart Inc.' },
            { symbol: 'TGT', name: 'Target Corporation' },
            { symbol: 'COST', name: 'Costco Wholesale Corporation' },
            { symbol: 'HD', name: 'Home Depot Inc.' },
            { symbol: 'LOW', name: 'Lowe\'s Companies Inc.' },
            { symbol: 'NKE', name: 'Nike Inc.' },
            { symbol: 'SBUX', name: 'Starbucks Corporation' },
            { symbol: 'MCD', name: 'McDonald\'s Corporation' },
            
            // Energy & Utilities
            { symbol: 'XOM', name: 'Exxon Mobil Corporation' },
            { symbol: 'CVX', name: 'Chevron Corporation' },
            { symbol: 'COP', name: 'ConocoPhillips' },
            { symbol: 'EOG', name: 'EOG Resources Inc.' },
            { symbol: 'SLB', name: 'Schlumberger NV' },
            
            // Entertainment & Media
            { symbol: 'DIS', name: 'Walt Disney Company' },
            { symbol: 'CMCSA', name: 'Comcast Corporation' },
            { symbol: 'VZ', name: 'Verizon Communications Inc.' },
            { symbol: 'T', name: 'AT&T Inc.' },
            
            // Industrial
            { symbol: 'BA', name: 'Boeing Company' },
            { symbol: 'CAT', name: 'Caterpillar Inc.' },
            { symbol: 'DE', name: 'Deere & Company' },
            { symbol: 'GE', name: 'General Electric Company' },
            { symbol: 'HON', name: 'Honeywell International Inc.' },
            
            // Food & Beverage
            { symbol: 'MDLZ', name: 'Mondelez International Inc.' },
            { symbol: 'KHC', name: 'Kraft Heinz Company' },
            { symbol: 'GIS', name: 'General Mills Inc.' },
            { symbol: 'K', name: 'Kellogg Company' },
            
            // Real Estate
            { symbol: 'AMT', name: 'American Tower Corporation' },
            { symbol: 'PLD', name: 'Prologis Inc.' },
            { symbol: 'CCI', name: 'Crown Castle International Corp.' },
            
            // Airlines
            { symbol: 'AAL', name: 'American Airlines Group Inc.' },
            { symbol: 'DAL', name: 'Delta Air Lines Inc.' },
            { symbol: 'UAL', name: 'United Airlines Holdings Inc.' },
            { symbol: 'LUV', name: 'Southwest Airlines Co.' },
            
            // Automotive
            { symbol: 'F', name: 'Ford Motor Company' },
            { symbol: 'GM', name: 'General Motors Company' },
            { symbol: 'NIO', name: 'NIO Inc.' },
            { symbol: 'RIVN', name: 'Rivian Automotive Inc.' },
            { symbol: 'LCID', name: 'Lucid Group Inc.' },
            
            // Crypto-related
            { symbol: 'COIN', name: 'Coinbase Global Inc.' },
            { symbol: 'MSTR', name: 'MicroStrategy Incorporated' },
            
            // Meme Stocks
            { symbol: 'GME', name: 'GameStop Corp.' },
            { symbol: 'AMC', name: 'AMC Entertainment Holdings Inc.' },
            { symbol: 'BB', name: 'BlackBerry Limited' },
            
            // International
            { symbol: 'BABA', name: 'Alibaba Group Holding Limited' },
            { symbol: 'JD', name: 'JD.com Inc.' },
            { symbol: 'NIO', name: 'NIO Inc.' },
            { symbol: 'BIDU', name: 'Baidu Inc.' },
            { symbol: 'TSM', name: 'Taiwan Semiconductor Manufacturing Company' },
            { symbol: 'ASML', name: 'ASML Holding NV' },
            { symbol: 'SAP', name: 'SAP SE' },
            { symbol: 'NESN', name: 'Nestle SA' },
            { symbol: 'RHHBY', name: 'Roche Holding AG' }
        ];

        // Improved search algorithm
        const queryLower = query.toLowerCase().trim();
        console.log(`Searching database of ${stockDatabase.length} stocks for: "${queryLower}"`);
        
        if (!queryLower) {
            return [];
        }

        const results = stockDatabase.filter(stock => {
            const symbolMatch = stock.symbol.toLowerCase().includes(queryLower);
            const nameMatch = stock.name.toLowerCase().includes(queryLower);
            
            // More flexible matching for company names
            const companyWords = stock.name.toLowerCase().split(' ');
            const queryWords = queryLower.split(' ');
            
            // Check if any query word matches any company word
            const wordMatch = queryWords.some(queryWord => 
                companyWords.some(companyWord => 
                    companyWord.startsWith(queryWord) || queryWord.startsWith(companyWord)
                )
            );
            
            return symbolMatch || nameMatch || wordMatch;
        });

        console.log(`Found ${results.length} matches before sorting`);

        // Enhanced sorting with better relevance scoring
        results.sort((a, b) => {
            const aSymbol = a.symbol.toLowerCase();
            const aName = a.name.toLowerCase();
            const bSymbol = b.symbol.toLowerCase();
            const bName = b.name.toLowerCase();
            
            // Exact symbol match gets highest priority
            if (aSymbol === queryLower) return -1;
            if (bSymbol === queryLower) return 1;
            
            // Symbol starts with query
            if (aSymbol.startsWith(queryLower) && !bSymbol.startsWith(queryLower)) return -1;
            if (!aSymbol.startsWith(queryLower) && bSymbol.startsWith(queryLower)) return 1;
            
            // Popular stocks boost (give preference to well-known companies)
            const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'JPM', 'V'];
            const aIsPopular = popularStocks.includes(a.symbol);
            const bIsPopular = popularStocks.includes(b.symbol);
            
            if (aIsPopular && !bIsPopular) return -1;
            if (!aIsPopular && bIsPopular) return 1;
            
            // Company name starts with query
            if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
            if (!aName.startsWith(queryLower) && bName.startsWith(queryLower)) return 1;
            
            // Symbol contains query
            if (aSymbol.includes(queryLower) && !bSymbol.includes(queryLower)) return -1;
            if (!aSymbol.includes(queryLower) && bSymbol.includes(queryLower)) return 1;
            
            // Alphabetical order by symbol as final tiebreaker
            return a.symbol.localeCompare(b.symbol);
        });

        const finalResults = results.slice(0, 20); // Limit to top 20 results
        console.log(`Returning ${finalResults.length} sorted results:`, finalResults.map(r => `${r.symbol} - ${r.name}`));
        
        return finalResults;
    }

    async getTopStocks(limit = 10) {
        try {
            const topSymbols = [
                'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 
                'META', 'NVDA', 'JPM', 'V', 'JNJ'
            ].slice(0, limit);

            const stockPromises = topSymbols.map(async (symbol) => {
                try {
                    const stockData = await this.getStockPrice(symbol);
                    return {
                        ...stockData,
                        rank: topSymbols.indexOf(symbol) + 1,
                        category: this.getStockCategory(symbol)
                    };
                } catch (error) {
                    console.error(`Error fetching ${symbol}:`, error);
                    return null;
                }
            });

            const results = await Promise.all(stockPromises);
            return results.filter(Boolean);
        } catch (error) {
            console.error('Error getting top stocks:', error);
            return [];
        }
    }

    getStockCategory(symbol) {
        const categories = {
            'AAPL': { type: 'market-leader', label: '👑 Líder' },
            'GOOGL': { type: 'high-volume', label: '📊 Alto Volumen' },
            'MSFT': { type: 'market-leader', label: '👑 Líder' },
            'AMZN': { type: 'high-volume', label: '📊 Alto Volumen' },
            'TSLA': { type: 'top-gainer', label: '🚀 Tendencia' },
            'META': { type: 'top-gainer', label: '🚀 Tendencia' },
            'NVDA': { type: 'top-gainer', label: '🚀 Tendencia' },
            'JPM': { type: 'market-leader', label: '🏦 Bancario' },
            'V': { type: 'market-leader', label: '💳 Fintech' },
            'JNJ': { type: 'market-leader', label: '🏥 Salud' }
        };
        
        return categories[symbol] || { type: 'popular', label: '⭐ Popular' };
    }

    async getMarketData() {
        try {
            const indices = [
                { symbol: 'SPY', name: 'S&P 500' },
                { symbol: 'DIA', name: 'Dow Jones' },
                { symbol: 'QQQ', name: 'NASDAQ' }
            ];
            
            const results = [];
            
            for (const index of indices) {
                try {
                    const stockData = await this.getStockPrice(index.symbol);
                    results.push({
                        ...stockData,
                        displayName: index.name
                    });
                } catch (error) {
                    console.error(`Error fetching ${index.symbol}:`, error);
                    // Add fallback data
                    results.push({
                        symbol: index.symbol,
                        shortName: index.name,
                        price: 4500 + Math.random() * 1000,
                        change: (Math.random() - 0.5) * 100,
                        changePercent: (Math.random() - 0.5) * 3,
                        volume: this.generateVolume()
                    });
                }
            }

            return {
                indices: results,
                timestamp: new Date().toISOString(),
                marketStatus: this.getMarketStatus()
            };
        } catch (error) {
            console.error('Error fetching market data:', error);
            return {
                indices: [],
                timestamp: new Date().toISOString(),
                marketStatus: 'UNKNOWN'
            };
        }
    }

    getMarketStatus() {
        const now = new Date();
        const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
        const hour = easternTime.getHours();
        const day = easternTime.getDay();
        
        // Market is open Monday-Friday 9:30 AM - 4:00 PM ET
        if (day >= 1 && day <= 5 && hour >= 9 && hour < 16) {
            if (hour === 9 && easternTime.getMinutes() < 30) {
                return 'PRE_MARKET';
            }
            return 'OPEN';
        } else if (day >= 1 && day <= 5 && ((hour >= 4 && hour < 20))) {
            return 'AFTER_HOURS';
        } else {
            return 'CLOSED';
        }
    }

    async getHistoricalData(symbol, period = '1mo', interval = '1d') {
        try {
            // Return simulated historical data
            return this.generateHistoricalData(symbol, period);
        } catch (error) {
            console.error(`Error fetching historical data for ${symbol}:`, error);
            return this.generateHistoricalData(symbol, period);
        }
    }

    generateHistoricalData(symbol, period) {
        const cached = this.stockCache.get(symbol);
        const basePrice = cached ? cached.basePrice : 100;
        const volatility = cached ? cached.volatility : 0.025;
        
        // Determine number of data points based on period
        let days;
        switch (period) {
            case '1d': days = 1; break;
            case '5d': days = 5; break;
            case '1mo': days = 30; break;
            case '3mo': days = 90; break;
            case '6mo': days = 180; break;
            case '1y': days = 365; break;
            case '2y': days = 730; break;
            case '5y': days = 1825; break;
            default: days = 30;
        }
        
        const data = [];
        let currentPrice = basePrice;
        const now = new Date();
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            
            // Generate daily price movement
            const dailyChange = (Math.random() - 0.5) * volatility;
            currentPrice = currentPrice * (1 + dailyChange);
            
            // Ensure price doesn't go too low
            currentPrice = Math.max(currentPrice, basePrice * 0.1);
            
            // Generate OHLC data
            const open = currentPrice;
            const dailyVolatility = volatility * 0.5;
            const high = open * (1 + Math.random() * dailyVolatility);
            const low = open * (1 - Math.random() * dailyVolatility);
            const close = low + (high - low) * Math.random();
            
            data.push({
                date: date,
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: this.generateVolume()
            });
            
            currentPrice = close;
        }
        
        return {
            symbol: symbol,
            data: data
        };
    }
}

module.exports = new FinanceAPI();