const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');

// Helper functions
const lookup = require('../helpers/lookup.js');
const usd = require('../helpers/usd.js');

const SESSION_ID = 1;

router.get('/finance/buy', (req, res) => {
    res.render('finance/buy')
}); // ✔️

router.post('/finance/buy', async (req, res) => {
    
    // BUY SHARES OF STOCK

    // Tomar input de usuario
    const { symbol, shares } = req.body;
    console.log(symbol, shares);

    // Handle invalid characters
    // ...

    // Handle fractional and negative values
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
            id: SESSION_ID
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

    // DO BUY
    //      INSERT into stocks, INSERT or UPDATE portfolios, INSERT into transacciones

    // Search symbol in stocks
    const stored_stock = await prisma.stocks.findFirst({
        where: {
            symbol: symbol
        }
    })

    // If the symbol is not present, INSERT symbol and name into stocks, INSERT shares into portfolios, INSERT transaccion into transacciones
    if (!stored_stock) {
        const new_stock = await prisma.stocks.create({
            data: {
                symbol: symbol,
                name: name
            }
        });
        const new_shares = await prisma.portfolios.create({
            data: {
                user_id: SESSION_ID,
                stock_id: new_stock.id,
                shares: parseInt(shares)
            }
        });
        const new_transaction = await prisma.transacciones.create({
            data: {
                user_id: SESSION_ID,
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
                user_id: SESSION_ID,
                stock_id: stored_stock.id
            }
        })

        if (!owned_stock) {
            const buy_shares = await prisma.portfolios.create({
                data: {
                    user_id: SESSION_ID,
                    stock_id: stored_stock.id,
                    shares: parseInt(shares)
                }
            });
            const new_transaction = await prisma.transacciones.create({
                data: {
                    user_id: SESSION_ID,
                    stock_id: stored_stock.id,
                    shares: parseInt(shares),
                    price: price
                }
            });
        } else {
            const shares_new_total = parseInt(owned_stock.shares) + parseInt(shares);
            const new_shares = await prisma.portfolios.updateMany({
                where: {
                    user_id: SESSION_ID,
                    stock_id: owned_stock.stock_id
                },
                data: {
                    shares: shares_new_total
                }
            });
            const new_transaction = await prisma.transacciones.create({
                data: {
                    user_id: SESSION_ID,
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
            id: SESSION_ID
        },
        data: {
            cash: parseFloat(cash)
        }
    });

    // Redirect to index (FALTA FLASH MESSAGE""")
    console.log("Buy succesfull!")
    res.redirect('/finance');
}); // ✔️:⭐⭐
// TODO:
// - Handle invalid characters in "symbol" field
// - Handle franctional or negative values in "shares" field
// - Flash message when operation is complete
// - Render apology template instead of res.send



module.exports = router;