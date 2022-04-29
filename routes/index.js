const { Router } = require('express');
const router = Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// MIDDLEWARE // CREO QUE ESTO SOLO VA EN APP.JS !!!!
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride('_method'));

// Helper functions
//      TODO: JOIN IN A SINGLE FILE LATER
const lookup = require('../src/lookup.js');
const usd = require('../src/usd.js');
// const apology = require('../src/apology.js');

// MOCK USER DATA
const SESSION_ID = 1;
const userData = require('./mock_user.json');
const { append } = require('express/lib/response'); // SE REQUIRIÓ AUTOMÁTICAMENTE 🤔

router.get('/', (req, res) => {
    res.redirect('/finance');
}); // ✔️

router.get('/finance', async (req, res) => {
    
    // SHOW PORTFOLIO STOCKS
    // 1) Sacar de la base de datos SYMBOLS y SHARES del usuario
    // 2) Usar los symbols para obtener los nombres y los precios actuales de cada SYMBOL

    // Query database for user's CASH
    const { cash } = await prisma.users.findUnique({
        select: {
            cash: true
        },
        where: {
            id: SESSION_ID
        }
    })

    let grand_total = 0 + parseInt(cash);

    // Query DB for user portfolio and stocks
    const portfolio_data = await prisma.portfolios.findMany({
        where: {
            user_id: SESSION_ID
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
                user_id: SESSION_ID,
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
        grand_total: usd(grand_total)
    });
}); // ✔️:⭐⭐⭐⭐


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


router.get('/finance/history', async (req, res) => {

    // Get history from current user
    const user_history = await prisma.transacciones.findMany({
        where: {
            user_id: SESSION_ID
        },
        include: {
            stocks: true
        }
    });

    res.render('finance/history', {
        user_history
    });
}); // ✔️:⭐⭐
// TODO:
// - Find a better way to format the time string (currently done inside the template)


router.get('/finance/login', (req, res) => {
    res.render('finance/login');
}); // ✔️


router.get('/finance/logout', (req, res) => {
    console.log("Route: Logout - GET");
    res.redirect('/');
});


router.get('/finance/quote', async (req, res) => {

    let query = req.query.symbol;

    if (!query) {
        // Si NO existe query, render formulario
        res.render('finance/quote', {
            symbol: false
        });
    } else {
        // Si existe query, valida y responde con info o apology
        let symbol = query.toUpperCase();
        const business_data = await lookup(symbol);
        console.log(business_data)

        if (business_data) {
            res.render('finance/quote', {
                symbol: business_data,
                usd
            });
        } else {
            res.render('finance/apology', {
                top: 400,
                bottom: "Invalid Symbol"
            });
            return;
        }
    }





}); // ✔️:⭐⭐⭐⭐


router.get('/finance/register', (req, res) => {
    console.log("Route: Register - GET (render register template)");
    res.render('finance/register');
});

router.post('/finance/register', (req, res) => {
    console.log("Route: Register - POST (register user data");
    res.redirect('/');
})

router.get('/finance/sell', async (req, res) => {
    let user_data = await prisma.portfolios.findMany({
        where: {
            user_id: SESSION_ID
        },
        include: {
            stocks: true
        }
    })
    user_data = user_data.map(s => s.stocks.symbol)
    // console.log(user_data)
    res.render('finance/sell', {
        user_data
    });
}) // ✔️

router.post('/finance/sell', (req, res) => {

    const { symbol, shares } = req.body;
    console.log(symbol, shares);

    res.redirect('/');
})

router.get('/finance/changePassword', (req, res) => {
    console.log("Route: Change Password - GET (render change password template");
    res.render('finance/changePassword');
})

router.patch('/finance/changePassword', (req, res) => {
    console.log("Route: Change Password - PATCH (update database");
    res.redirect('/');
})

module.exports = router;
