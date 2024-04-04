const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function lookup(symbol) {
    try {
        // Prepare API request
        symbol = symbol.toUpperCase();
        const end = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
        const start = new Date(end);
        start.setDate(start.getDate() - 7);

        // Yahoo Finance API
        const url = `https://query1.finance.yahoo.com/v7/finance/download/${encodeURIComponent(symbol)}?period1=${Math.floor(start.getTime() / 1000)}&period2=${Math.floor(new Date(end).getTime() / 1000)}&interval=1d&events=history&includeAdjustedClose=true`;

        // Query API
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'axios',
                'Cookie': `session=${uuidv4()}`
            }
        });
        if (!response.status === 200) {
            throw new Error('Network response was not ok');
        }

        const data = response.data;

        // Parse CSV
        const quotes = [];
        const rows = data.trim().split('\n');
        const header = rows.shift().split(',');
        rows.forEach(row => {
            const values = row.split(',');
            const entry = {};
            header.forEach((key, i) => {
                entry[key] = values[i];
            });
            quotes.push(entry);
        });

        const price = parseFloat(quotes[quotes.length - 1]['Adj Close']).toFixed(2);

        return { price, symbol };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

module.exports = lookup;

// Example usage:
// lookup('AAPL').then(quote => console.log(quote)).catch(error => console.error(error));
