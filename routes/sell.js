const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');

// CSRF PROTECTION 🗝️
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
router.use(cookieParser());

// Helper functions
const lookup = require('../helpers/lookup.js');
const requireLogin = require('../helpers/requireLogin.js');
const usd = require('../helpers/usd.js');


/*  
    ███████╗    ███████╗    ██╗         ██╗     
    ██╔════╝    ██╔════╝    ██║         ██║     
    ███████╗    █████╗      ██║         ██║     
    ╚════██║    ██╔══╝      ██║         ██║     
    ███████║    ███████╗    ███████╗    ███████╗
    ╚══════╝    ╚══════╝    ╚══════╝    ╚══════╝
*/

// ROUTE: RENDER SELL TEMPLATE ✔️
router.get('/sell', requireLogin, csrfProtection, async (req, res) => {

    // Retrieve user and stocks linked to the user
    // *     'Stocks' table is connected to 'users' table via a join table called 'portfolios'
    // *     Prisma automatically knows hot to get to 'stocks' from 'users', 
    // *     ...no need to mention 'portfolios'... That's nice!
    let userData = await prisma.portfolios.findMany({
        where: {
            user_id: req.session.user_id
        },
        include: {
            stocks: true
        }
    })

    // Map 'stocks' to a simple array of strings with just the symbols
    symbols = userData.map(s => s.stocks.symbol)

    // Send the owned symbols to the "sell" form
    res.render('finance/sell', {
        symbols,
        user: req.session.user_id,
        username: req.session.username,
        csrfToken: req.csrfToken(),
        success: req.flash("success"),
        failure: req.flash("failure"),
        fullName: `${req.session.firstName} ${req.session.lastName}` 
    });
}) // ✔️


// ROUTE: HANDLE POST REQUEST FROM SELL TEMPLATE FORM
//      Perform the "Sell" by updating the database
router.post('/sell', requireLogin, csrfProtection, async (req, res) => {

    // Symbol and shares that the user is trying to sell (posted from "sell" form)
    const { symbol, shares } = req.body;

    // Handle missing input -- ERROR CHECKING
    if (!symbol || !shares) {
        req.flash('failure', 'Missing input!');
        res.redirect('/finance/sell');
        return;
    }

    // Check if shares input is numeric - ERROR CHECKING
    //      parseFloat shares, then check for NaN
    if (Number.isNaN(parseFloat(shares))) {
        req.flash('failure', 'Must be numeric!');
        res.redirect('/finance/sell');
        return;
    }  

    // Handle fractional and negative values - ERROR CHECKING
    if (parseFloat(shares) % 1 != 0) {
        req.flash('failure', "No fraction!");
        res.redirect('/finance/sell');
        return;
    }
    if (parseFloat(shares) < 0) {
        req.flash('failure', 'No negative!');
        res.redirect('/finance/sell');
        return;
    }

    // Check for invalid symbol -- ERROR CHECKING
    //      while on it, remember the stock's info
    const stockInfo = await lookup(symbol);
    if (!stockInfo) {
        req.flash('failure', 'Invalid symbol!');
        res.redirect('/finance/sell');
        return;
    }

    // IF the symbol is already stored in 'stocks' table, retrieve it's id (as stock_id)
    // ELSE IF the symbol is not present, create it's entry and remember it's id
    const storedStock = await prisma.stocks.findFirst({
        where: {
            symbol: symbol
        }
    });

    let stock_id = undefined;
    if (storedStock) {
        stock_id = storedStock.id;
    } else {
        const newStoredStock = await prisma.stocks.create({
            data: {
                symbol: stockInfo.symbol,
                name: stockInfo.name
            }
        });
        stock_id = newStoredStock.id;
    }

    // const { id: stock_id } = await prisma.stocks.findFirst({
    //     where: {
    //         symbol: symbol
    //     }
    // });

    // Check if the user owns the stocks that it's trying to sell - ERROR CHECKING
    //      while on it - remember the user's owned stock (as userOwns)
    const userOwns = await prisma.portfolios.findFirst({
        where: {
            user_id: req.session.user_id,
            stock_id: stock_id
        }
    });
    if (!userOwns) {
        req.flash('failure', "You can't sell what you don't own!");
        res.redirect('/finance/sell');
        return;
    }

    // Shares owned by the user
    let ownedShares = userOwns.shares;

    // 👀 Unique ID from portfolio's row
    let portfolioRow__ID = userOwns.id; 

    // Check if the user owns enough shares - ERROR CHECKING
    if (ownedShares < parseInt(shares)) {
        req.flash('failure', 'Not enough shares');
        res.redirect('/finance/sell');
        return;
    }

    // If the user is selling all his shares, DELETE the row from portfolio table
    if (ownedShares === parseInt(shares)) {
        const updatedPortolio = await prisma.portfolios.delete({
            where: {
                id: portfolioRow__ID
            }
        });
    // Else (the user still onws some shares), UPDATE the amount of shares owned
    } else {
        const updatedPortolio = await prisma.portfolios.update({
            where: {
                id: portfolioRow__ID
            },
            data: {
                // Update shares owned by substracting the sold shares
                shares: ownedShares - parseInt(shares)
            }
        });
    } // ✔️

    // Stock price retrieved from IEX
    const price = stockInfo.price;

    // Calculate the income generated by the sell
    const income = parseFloat(price) * parseFloat(shares);

    // Update user´s cash by adding the income from the sell
    const updated_cash = await prisma.users.update({
        where: {
            id: req.session.user_id
        },
        data: {
            cash: {
                increment: income
            }
        }
    }); // ✔️

    // Output to console: new transaction added to history ("transacciones" table)
    console.log('new transaction added to history: ', {
        user_id: req.session.user_id, 
        symbol, // This wont be created on the table
        stock_id, 
        shares: parseFloat(shares) * -1, 
        price
    });

    // Create new transaction on history ("transacciones" table)
    const new_transaction = await prisma.transacciones.create({
        data: {
            user_id: req.session.user_id,
            stock_id: stock_id,
            shares: parseFloat(shares) * -1,
            price: price
        }
    })

    const message = `Sold ${shares} shares of ${stockInfo.name} (${symbol}) at ${usd(price)} each, for a total of ${usd(parseFloat(price) * parseFloat(shares))}.`

    req.flash('success', message);
       
    res.redirect('/finance/index');
});

module.exports = router;
