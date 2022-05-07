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

    // TODO: I want to display a red error flashed message (instead of the blue one) when the message is some kind of error. Currently all messages are displayed on a blue container. The problem is that I can´t find a way to evaluate the "req.flash" generated object, appart from it's length (which at least allows me to check if there's a message present). On alternative is to use the 'flash' package instead of the 'connec-flash' package, as it seems to be more friendly for these purposes.
    // let foo = req.flash("message")
    // console.log(foo)
    // let bar = Object.getOwnPropertyNames(foo)
    // let bar = Object.keys(foo)
    // console.log(bar)

    res.render('finance/index', { 
        user_portfolio,
        cash: usd(parseFloat(cash)),
        grand_total: usd(grand_total),
        user: req.session.user_id,
        username: req.session.username,
        success: req.flash("success"),
        failure: req.flash("failure"),
        // message: req.flash("message"),
        fullName: `${req.session.firstName} ${req.session.lastName}` 
    });
}); // ✔️:⭐⭐⭐⭐

module.exports = router;
