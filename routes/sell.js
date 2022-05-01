const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');

// const session = require('express-session');

// Helper functions
const lookup = require('../helpers/lookup.js');
const usd = require('../helpers/usd.js');

// Middleware
// router.use(session({secret:"notSecret"}));

const SESSION_ID = 1;


/*  
    ███████╗    ███████╗    ██╗         ██╗     
    ██╔════╝    ██╔════╝    ██║         ██║     
    ███████╗    █████╗      ██║         ██║     
    ╚════██║    ██╔══╝      ██║         ██║     
    ███████║    ███████╗    ███████╗    ███████╗
    ╚══════╝    ╚══════╝    ╚══════╝    ╚══════╝
*/

// ROUTE: RENDER SELL TEMPLATE
router.get('/sell', async (req, res) => {
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


// ROUTE: HANDLE POST REQUEST FROM SELL FORM
//      Perform the "Sell" by updating the database
router.post('/sell', async (req, res) => {

    const { symbol, shares } = req.body;
    // console.log(symbol, shares);

    // Check if the user owns shares
    const [ user_owns ] = await prisma.$queryRaw`SELECT * FROM portfolios WHERE user_id=${SESSION_ID} AND stock_id IN (SELECT id FROM stocks WHERE symbol=${symbol})`

    if (!user_owns) {
        res.send("NOPE!");
        return;
    }

    let owned_shares = user_owns.shares;
    let owned_stock_id = user_owns.id;

    // console.log(shares)
    // console.log(owned_shares)
    // console.log(owned_stock_id)


    // Check if user owns enough shares
    if (owned_shares < parseInt(shares)) {
        res.send("NOT ENOUGH SHARES!");
        return;
    }

    // Update portfolios table from DB
    //      If resulting shares will be ZERO, remove row from portfolio
    //      Else, update row from portfolio
    if (owned_shares === parseInt(shares)) {
        const updated_portolio = await prisma.portfolios.delete({
            where: {
                id: owned_stock_id
            }
        });
    } else {
        const updated_portolio = await prisma.portfolios.update({
            where: {
                id: owned_stock_id
            },
            data: {
                shares: owned_shares - parseInt(shares)
            }
        });
    }

    // Update cash

    const { price } = await lookup(symbol);
    const { cash } = await prisma.users.findUnique({
        where: {
            id: SESSION_ID
        }
    })

    console.log("price: ", price, typeof(price));
    console.log("cash: ", cash, typeof(cash));
    console.log("shares: ", shares, typeof(shares));

    const updated_cash = parseFloat(cash) + (parseFloat(price) * parseFloat(shares));
    console.log("updated cash: ", updated_cash);

    const updated_user_info = await prisma.users.update({
        where: {
            id: SESSION_ID
        },
        data: {
            cash: updated_cash
        }
    })

    console.log("updated user info: ", updated_user_info);

    res.redirect('/finance/index');
})

module.exports = router;
