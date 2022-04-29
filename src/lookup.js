const axios = require('axios');

async function lookup(symbol) {
    
    // Look up quote for symbol.
    
    // Contact API
    // const api_key = 'pk_5d590d49563b4b12a0bf0181da6f5f90'
    const api_key = process.env.API_KEY;
    const url = `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${api_key}`
    try {
        const response = await axios.get(url);
        const data = response.data;
        // Parse response
        console.log(data.latestPrice);
        return {
            name: data.companyName,
            price: data.latestPrice,
            symbol: data.symbol
        }
    } catch (e) {
        return null;
    }
}

module.exports = lookup;

/*
TestURL

https://cloud.iexapis.com/stable/stock/AAPL/quote?token=pk_5d590d49563b4b12a0bf0181da6f5f90

*/
