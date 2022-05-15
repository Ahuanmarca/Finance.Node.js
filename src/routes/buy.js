const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');

// CSRF PROTECTION !!!! 🗝️
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
router.use(cookieParser());

// Helper functions
const lookup = require('../helpers/lookup.js');
const usd = require('../helpers/usd.js');
const requireLogin = require('../helpers/requireLogin.js');

/*
    ██████╗     ██╗   ██╗    ██╗   ██╗
    ██╔══██╗    ██║   ██║    ╚██╗ ██╔╝
    ██████╔╝    ██║   ██║     ╚████╔╝ 
    ██╔══██╗    ██║   ██║      ╚██╔╝  
    ██████╔╝    ╚██████╔╝       ██║   
    ╚═════╝      ╚═════╝        ╚═╝    
*/


router.get('/buy', requireLogin, csrfProtection, (req, res) => {
    res.render('finance/buy', {
        title: "Buy",
        csrfToken: req.csrfToken(),
    })
}); // ✔️

router.post('/buy', requireLogin, csrfProtection, async (req, res) => {

    // BUY SHARES OF STOCK

    // Tomar input de usuario
    const { symbol, shares } = req.body;

    // Handle missing input // ERROR CHECKING
    if (!symbol || !shares) {
        req.flash('failure', 'Missing input!');
        res.redirect('/finance/buy');
        return;
    }

    // Check if shares input is numeric
    //      parseFloat shares, then check for NaN
    if (Number.isNaN(parseFloat(shares))) {
        req.flash('failure', 'Must be numeric!');
        res.redirect('/finance/buy');
        return;
    }    

    // Handle fractional and negative values
    if (parseFloat(shares) % 1 != 0) {
        req.flash('failure', "No fraction!");
        res.redirect('/finance/buy');
        return;
    }
    if (parseFloat(shares) < 0) {
        req.flash('failure', 'No negative!');
        res.redirect('/finance/buy');
        return;
    }


    // Lookup symbol and check if it's valid
    const stockInfo = await lookup(symbol);
    
    if (!stockInfo) {
        req.flash('failure', 'Invalid symbol!');
        res.redirect('/finance/buy');
        return;
    }
    
    const name = stockInfo.name;
    const price = parseFloat(stockInfo.price);

    const userInfo = await prisma.users.findUnique({
        where: {
            id: req.session.userID
        }
    })
    
    let cash = parseFloat(userInfo.cash);
    const spending = price * parseFloat(shares);

    // Check if there's enough cash to complete the purchase
    if (spending > cash) {
        req.flash('failure', 'Not enough cash!');
        res.redirect('/finance/buy');
        return;
    }

    // BUY !!
    // INSERT into stocks, INSERT or UPDATE portfolios, INSERT into transacciones

    // Search symbol in stocks
    const storedStock = await prisma.stocks.findFirst({
        where: {
            symbol: symbol.toUpperCase()
        }
    })

    // If the symbol is not present, INSERT symbol and name into stocks, INSERT shares into portfolios, INSERT transaccion into transacciones
    if (!storedStock) {
        const newStock = await prisma.stocks.create({
            data: {
                symbol: symbol.toUpperCase(),
                name: name
            }
        });
        const newShares = await prisma.portfolios.create({
            data: {
                user_id: req.session.userID,
                stock_id: newStock.id,
                shares: parseInt(shares)
            }
        });
        const newTransaction = await prisma.transacciones.create({
            data: {
                user_id: req.session.userID,
                stock_id: newStock.id,
                shares: parseInt(shares),
                price: price
            }
        });
    } else {
        // If the symbol is present and...
        // ... the user owns no shares: INSERT
        // ... the user owns at least one share: UPDATE
        const ownedStock= await prisma.portfolios.findFirst({
            where: {
                user_id: req.session.userID,
                stock_id: storedStock.id
            }
        })

        if (!ownedStock) {
            const buy_shares = await prisma.portfolios.create({
                data: {
                    user_id: req.session.userID,
                    stock_id: storedStock.id,
                    shares: parseInt(shares)
                }
            });
            const newTransaction = await prisma.transacciones.create({
                data: {
                    user_id: req.session.userID,
                    stock_id: storedStock.id,
                    shares: parseInt(shares),
                    price: price
                }
            });
        } else {
            const sharesNewTotal = parseInt(ownedStock.shares) + parseInt(shares);
            const newShares = await prisma.portfolios.updateMany({
                where: {
                    user_id: req.session.userID,
                    stock_id: ownedStock.stock_id
                },
                data: {
                    shares: sharesNewTotal
                }
            });
            const newTransaction = await prisma.transacciones.create({
                data: {
                    user_id: req.session.userID,
                    stock_id: storedStock.id,
                    shares: parseInt(shares),
                    price: price
                }
            });
        }
    }

    // Update user's cash
    cash = cash - spending;
    const newCashTotal = await prisma.users.update({
        where: {
            id: req.session.userID
        },
        data: {
            cash: parseFloat(cash)
        }
    });

    // Generate flashed message
    const message = `Bought ${shares} shares of ${symbol.toUpperCase()} at ${usd(price)} each, for a total of ${usd(parseFloat(price) * parseFloat(shares))}.`;
    req.flash('success', message);
    
    // Redirect to index
    res.redirect('/finance/index');

}); // ✔️:⭐⭐⭐

module.exports = router;
