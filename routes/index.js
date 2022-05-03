const { Router } = require('express');
const router = Router();

const prisma = require('../helpers/client.js');


// Helper functions
const lookup = require('../helpers/lookup.js');
const usd = require('../helpers/usd.js');
const requireLogin = require('../helpers/requireLogin.js');


/*
    ██╗    ███╗   ██╗    ██████╗     ███████╗    ██╗  ██╗
    ██║    ████╗  ██║    ██╔══██╗    ██╔════╝    ╚██╗██╔╝
    ██║    ██╔██╗ ██║    ██║  ██║    █████╗       ╚███╔╝ 
    ██║    ██║╚██╗██║    ██║  ██║    ██╔══╝       ██╔██╗ 
    ██║    ██║ ╚████║    ██████╔╝    ███████╗    ██╔╝ ██╗
    ╚═╝    ╚═╝  ╚═══╝    ╚═════╝     ╚══════╝    ╚═╝  ╚═╝
*/


router.get('/', (req, res) => res.redirect('/finance/index')); // ✔️

router.get('/index', requireLogin, async (req, res) => {

    // SHOW PORTFOLIO STOCKS
    // 1) Sacar de la base de datos SYMBOLS y SHARES del usuario
    // 2) Usar los symbols para obtener los nombres y los precios actuales de cada SYMBOL

    // Query database for user's CASH
    const { cash } = await prisma.users.findUnique({
        select: {
            cash: true
        },
        where: {
            id: req.session.user_id
        }
    })

    let grand_total = 0 + parseInt(cash);

    // Query DB for user portfolio and stocks
    const portfolio_data = await prisma.portfolios.findMany({
        where: {
            user_id: req.session.user_id
        },
        include: {
            stocks: true
        }
    });

    // Loop rows of user portfolio to get:
    //      SYMBOL, SHARES (FROM DB)
    //      NAME, PRICE (FROM IEX)
    //      ROW'S TOTAL (CALCULATE)
    const user_portfolio = [];
    for (portfolio_row of portfolio_data) {
        
        // Get symbols and shares from database
        const symbol = portfolio_row.stocks.symbol;
        const shares = portfolio_row.shares;

        // Use symbols to lookup price and name
        const data = await lookup(symbol);
        const name = data.name;
        const price = data.price;

        // Use price and shares to get total
        const total = parseFloat(price) * parseFloat(shares);
        
        // Update grand_total
        grand_total += total;

        // Calcular outflow_balance de cada row
        const transacciones = await prisma.transacciones.findMany({
            where: {
                user_id: req.session.user_id,
                stock_id: portfolio_row.stocks.id
            }
        });
        let outflow_balance = 0;
        for (row of transacciones) {
            outflow_balance += (parseFloat(row.price) * parseFloat(row.shares));
        }

        let performance = (total >= outflow_balance);

        // Push all data into the user portfolio to be sent into the render response
        user_portfolio.push({
            symbol, 
            name, 
            price: usd(price), 
            shares, 
            total: usd(total), 
            performance});
    }

    res.render('finance/index', { 
        user_portfolio,
        cash: usd(parseFloat(cash)),
        grand_total: usd(grand_total),
        user: req.session.user_id,
        username: req.session.username
    });
}); // ✔️:⭐⭐⭐⭐

module.exports = router;
