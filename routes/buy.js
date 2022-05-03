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
        user: req.session.user_id,
        username: req.session.username,
        csrfToken: req.csrfToken()
    })
}); // ✔️

router.post('/buy', requireLogin, csrfProtection, async (req, res) => {

    // BUY SHARES OF STOCK

    // Tomar input de usuario
    const { symbol, shares } = req.body;

    // TODO: Handle invalid characters
    // ...

    // TODO: Handle fractional and negative values
    // ...

    // Lookup symbol and check if it's valid
    const business_info = await lookup(symbol);
    
    if (!business_info) {
        res.render('finance/apology', {
            top: 400,
            bottom: "Invalid Symbol"
        });
        return;
    }
    
    const name = business_info.name;
    const price = parseFloat(business_info.price);

    const user_info = await prisma.users.findUnique({
        where: {
            id: req.session.user_id
        }
    })
    
    let cash = parseFloat(user_info.cash);
    const spending = price * parseFloat(shares);

    // Check if there's enough cash to complete the purchase
    if (spending > cash) {
        res.render('finance/apology', {
            top: 400,
            bottom: "Not enough cash"
        })
        return;
    }

    // BUY !!
    // INSERT into stocks, INSERT or UPDATE portfolios, INSERT into transacciones

    // Search symbol in stocks
    const stored_stock = await prisma.stocks.findFirst({
        where: {
            symbol: symbol.toUpperCase()
        }
    })

    // If the symbol is not present, INSERT symbol and name into stocks, INSERT shares into portfolios, INSERT transaccion into transacciones
    if (!stored_stock) {
        const new_stock = await prisma.stocks.create({
            data: {
                symbol: symbol.toUpperCase(),
                name: name
            }
        });
        const new_shares = await prisma.portfolios.create({
            data: {
                user_id: req.session.user_id,
                stock_id: new_stock.id,
                shares: parseInt(shares)
            }
        });
        const new_transaction = await prisma.transacciones.create({
            data: {
                user_id: req.session.user_id,
                stock_id: new_stock.id,
                shares: parseInt(shares),
                price: price
            }
        });
    } else {
        // If the symbol is present and...
        // ... the user owns no shares: INSERT
        // ... the user owns at least one share: UPDATE
        const owned_stock= await prisma.portfolios.findFirst({
            where: {
                user_id: req.session.user_id,
                stock_id: stored_stock.id
            }
        })

        if (!owned_stock) {
            const buy_shares = await prisma.portfolios.create({
                data: {
                    user_id: req.session.user_id,
                    stock_id: stored_stock.id,
                    shares: parseInt(shares)
                }
            });
            const new_transaction = await prisma.transacciones.create({
                data: {
                    user_id: req.session.user_id,
                    stock_id: stored_stock.id,
                    shares: parseInt(shares),
                    price: price
                }
            });
        } else {
            const shares_new_total = parseInt(owned_stock.shares) + parseInt(shares);
            const new_shares = await prisma.portfolios.updateMany({
                where: {
                    user_id: req.session.user_id,
                    stock_id: owned_stock.stock_id
                },
                data: {
                    shares: shares_new_total
                }
            });
            const new_transaction = await prisma.transacciones.create({
                data: {
                    user_id: req.session.user_id,
                    stock_id: stored_stock.id,
                    shares: parseInt(shares),
                    price: price
                }
            });
        }
    }

    // Update user's cash
    cash = cash - spending;
    const new_cash_total = await prisma.users.update({
        where: {
            id: req.session.user_id
        },
        data: {
            cash: parseFloat(cash)
        }
    });

    // Redirect to index (FALTA FLASH MESSAGE""")
    // console.log("Buy succesfull!")
    res.redirect('/finance/index');
}); // ✔️:⭐⭐
// TODO: Handle invalid characters in "symbol" field
// TODO: Handle franctional or negative values in "shares" field
// TODO: Flash message when operation is complete

module.exports = router;
