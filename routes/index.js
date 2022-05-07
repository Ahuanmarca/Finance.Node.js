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
            id: req.session.userID
        }
    })

    let grandTotal = 0 + parseInt(cash);

    // Query DB for user portfolio and stocks
    const portfolioData = await prisma.portfolios.findMany({
        where: {
            user_id: req.session.userID
        },
        include: {
            stocks: true
        }
    });

    // Loop rows of user portfolio to get:
    //      SYMBOL, SHARES (FROM DB)
    //      NAME, PRICE (FROM IEX)
    //      ROW'S TOTAL (CALCULATE)
    const userPortfolio = [];
    for (portfolioRow of portfolioData) {
        
        // Get symbols and shares from database
        const symbol = portfolioRow.stocks.symbol;
        const shares = portfolioRow.shares;

        // Use symbols to lookup price and name
        const data = await lookup(symbol);
        const name = data.name;
        const price = data.price;

        // Use price and shares to get total
        const total = parseFloat(price) * parseFloat(shares);
        
        // Update grandTotal
        grandTotal += total;

        // Calcular outflowBalance de cada row
        const transacciones = await prisma.transacciones.findMany({
            where: {
                user_id: req.session.userID,
                stock_id: portfolioRow.stocks.id
            }
        });
        let outflowBalance = 0;
        for (row of transacciones) {
            outflowBalance += (parseFloat(row.price) * parseFloat(row.shares));
        }

        let performance = (total >= outflowBalance);

        // Push all data into the user portfolio to be sent into the render response
        userPortfolio.push({
            symbol, 
            name, 
            price: usd(parseFloat(price)), 
            shares, 
            total: usd(parseFloat(total)), 
            performance});
    }

    res.render('finance/index', {
        title: "Portfolio",
        userPortfolio,
        cash: usd(parseFloat(cash)),
        grandTotal: usd(grandTotal),
        user: req.session.userID,
        username: req.session.username,
        success: req.flash("success"),
        failure: req.flash("failure"),
        fullName: `${req.session.firstName} ${req.session.lastName}` 
    });
}); // ✔️:⭐⭐⭐⭐

module.exports = router;
