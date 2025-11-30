# 📈 Stock Gainers Tracker

Full-stack application to track top stock gainers over 3 days with customizable alerts and real-time notifications.

## Features

### 1. **Today's Gainers**
- Real-time scraping of Yahoo Finance top gainers
- Shows current price, change %, volume, and market cap
- Auto-refreshes every hour
- Top 50 stocks tracked

### 2. **3-Day Gainers**
- Calculates performance over 3-day period
- Compares current price vs 3 days ago
- Ranks by highest 3-day gain percentage
- Historical data tracking

### 3. **Alert System**
- **Gain Threshold Alerts**: Get notified when ANY stock gains above X% in 3 days
- **Specific Stock Alerts**: Track specific stocks (e.g., AAPL, TSLA)
- Customizable thresholds
- Real-time alert checking

## Tech Stack

**Backend:**
- Node.js + Express
- Axios (HTTP requests)
- Cheerio (web scraping)
- Node-cron (scheduled tasks)

**Frontend:**
- Vanilla JavaScript
- Responsive CSS
- Real-time data updates

## Installation

```bash
# Clone the repository
git clone https://github.com/sudipp/stock-gainers-tracker.git
cd stock-gainers-tracker

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the server
npm start
```

## Usage

1. **Access the app**: Open `http://localhost:3000` in your browser

2. **View Today's Gainers**: 
   - Click "Today's Gainers" tab
   - See real-time top performers

3. **View 3-Day Gainers**:
   - Click "3-Day Gainers" tab
   - Wait 3 days for data to accumulate
   - See stocks with highest 3-day gains

4. **Set Up Alerts**:
   - Click "Alerts" tab
   - Choose alert type:
     - **Any Stock Above Threshold**: Alerts for any stock gaining X%
     - **Specific Stock**: Track specific symbols
   - Set threshold percentage
   - Click "Create Alert"

## API Endpoints

```
GET  /api/gainers/today    - Get today's top gainers
GET  /api/gainers/3day     - Get 3-day top gainers
GET  /api/alerts           - Get all alerts
POST /api/alerts           - Create new alert
DELETE /api/alerts/:id     - Delete alert
GET  /api/stock/:symbol    - Get stock history
```

## Deployment

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render
1. Connect your GitHub repo
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Deploy

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## How It Works

1. **Data Collection**: 
   - Scrapes Yahoo Finance every hour
   - Stores historical data for 7 days
   - Tracks 50+ top gainers

2. **3-Day Calculation**:
   - Compares current price vs 3 days ago
   - Calculates percentage gain
   - Ranks by performance

3. **Alert System**:
   - Checks alerts every hour
   - Compares stock performance vs thresholds
   - Logs triggered alerts (can be extended to email/SMS)

## Future Enhancements

- [ ] Email/SMS notifications
- [ ] More timeframes (1-day, 7-day, 30-day)
- [ ] Stock charts and visualizations
- [ ] Export data to CSV
- [ ] User authentication
- [ ] Watchlist feature
- [ ] Push notifications
- [ ] Mobile app

## Contributing

Pull requests welcome! For major changes, please open an issue first.

## License

MIT

## Author

Created by Sudip Purkayastha

---

**Note**: This app scrapes public data from Yahoo Finance. Use responsibly and respect rate limits.