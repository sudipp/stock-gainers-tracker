const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store historical data
let stockHistory = {};
let alerts = [];
let latestGainers = [];

// Scrape Yahoo Finance for top gainers
async function scrapeTopGainers() {
  try {
    const response = await axios.get('https://finance.yahoo.com/markets/stocks/gainers/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const gainers = [];
    
    // Parse the table data
    $('table tbody tr').each((i, row) => {
      if (i < 50) { // Get top 50
        const symbol = $(row).find('td:nth-child(1)').text().trim();
        const name = $(row).find('td:nth-child(2)').text().trim();
        const price = parseFloat($(row).find('td:nth-child(4)').text().replace(/[^0-9.]/g, ''));
        const change = parseFloat($(row).find('td:nth-child(5)').text().replace(/[^0-9.-]/g, ''));
        const changePercent = parseFloat($(row).find('td:nth-child(6)').text().replace(/[^0-9.-]/g, ''));
        const volume = $(row).find('td:nth-child(7)').text().trim();
        const marketCap = $(row).find('td:nth-child(9)').text().trim();
        
        if (symbol && price) {
          gainers.push({
            symbol,
            name,
            price,
            change,
            changePercent,
            volume,
            marketCap,
            timestamp: new Date().toISOString()
          });
        }
      }
    });
    
    return gainers;
  } catch (error) {
    console.error('Error scraping data:', error.message);
    return [];
  }
}

// Calculate 3-day performance
function calculate3DayGainers() {
  const now = Date.now();
  const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
  
  const results = [];
  
  for (const [symbol, history] of Object.entries(stockHistory)) {
    const oldData = history.find(h => new Date(h.timestamp).getTime() <= threeDaysAgo);
    const latestData = history[history.length - 1];
    
    if (oldData && latestData) {
      const gain = ((latestData.price - oldData.price) / oldData.price) * 100;
      
      results.push({
        symbol,
        name: latestData.name,
        currentPrice: latestData.price,
        oldPrice: oldData.price,
        gain3Day: gain.toFixed(2),
        todayChange: latestData.changePercent,
        volume: latestData.volume,
        marketCap: latestData.marketCap
      });
    }
  }
  
  return results.sort((a, b) => parseFloat(b.gain3Day) - parseFloat(a.gain3Day));
}

// Check alerts
function checkAlerts(gainers) {
  const triggeredAlerts = [];
  
  alerts.forEach(alert => {
    gainers.forEach(stock => {
      if (alert.type === 'gain_threshold' && parseFloat(stock.gain3Day) >= alert.threshold) {
        triggeredAlerts.push({
          alertId: alert.id,
          symbol: stock.symbol,
          message: `${stock.symbol} gained ${stock.gain3Day}% in 3 days (threshold: ${alert.threshold}%)`,
          stock
        });
      }
      
      if (alert.type === 'specific_stock' && stock.symbol === alert.symbol && parseFloat(stock.gain3Day) >= alert.threshold) {
        triggeredAlerts.push({
          alertId: alert.id,
          symbol: stock.symbol,
          message: `${stock.symbol} alert triggered: ${stock.gain3Day}% gain`,
          stock
        });
      }
    });
  });
  
  return triggeredAlerts;
}

// Update data every hour
cron.schedule('0 * * * *', async () => {
  console.log('Fetching latest stock data...');
  const gainers = await scrapeTopGainers();
  latestGainers = gainers;
  
  // Store in history
  gainers.forEach(stock => {
    if (!stockHistory[stock.symbol]) {
      stockHistory[stock.symbol] = [];
    }
    stockHistory[stock.symbol].push(stock);
    
    // Keep only last 7 days of data
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    stockHistory[stock.symbol] = stockHistory[stock.symbol].filter(
      h => new Date(h.timestamp).getTime() > sevenDaysAgo
    );
  });
  
  // Check alerts
  const threeDayGainers = calculate3DayGainers();
  const triggered = checkAlerts(threeDayGainers);
  
  if (triggered.length > 0) {
    console.log('Alerts triggered:', triggered);
  }
});

// API Routes
app.get('/api/gainers/today', async (req, res) => {
  if (latestGainers.length === 0) {
    latestGainers = await scrapeTopGainers();
  }
  res.json({ success: true, data: latestGainers.slice(0, 25) });
});

app.get('/api/gainers/3day', (req, res) => {
  const gainers = calculate3DayGainers();
  res.json({ success: true, data: gainers.slice(0, 25) });
});

app.get('/api/alerts', (req, res) => {
  res.json({ success: true, data: alerts });
});

app.post('/api/alerts', (req, res) => {
  const { type, threshold, symbol } = req.body;
  
  const alert = {
    id: Date.now().toString(),
    type,
    threshold: parseFloat(threshold),
    symbol: symbol || null,
    createdAt: new Date().toISOString()
  };
  
  alerts.push(alert);
  res.json({ success: true, data: alert });
});

app.delete('/api/alerts/:id', (req, res) => {
  const { id } = req.params;
  alerts = alerts.filter(a => a.id !== id);
  res.json({ success: true, message: 'Alert deleted' });
});

app.get('/api/stock/:symbol', (req, res) => {
  const { symbol } = req.params;
  const history = stockHistory[symbol] || [];
  res.json({ success: true, data: history });
});

// Initialize on startup
(async () => {
  console.log('Initializing stock data...');
  latestGainers = await scrapeTopGainers();
  latestGainers.forEach(stock => {
    if (!stockHistory[stock.symbol]) {
      stockHistory[stock.symbol] = [];
    }
    stockHistory[stock.symbol].push(stock);
  });
  console.log(`Loaded ${latestGainers.length} stocks`);
})();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the app at http://localhost:${PORT}`);
});