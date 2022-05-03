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
const requireLogin = require('../helpers/requireLogin.js')


/*  
    ███████╗    ███████╗    ██╗         ██╗     
    ██╔════╝    ██╔════╝    ██║         ██║     
    ███████╗    █████╗      ██║         ██║     
    ╚════██║    ██╔══╝      ██║         ██║     
    ███████║    ███████╗    ███████╗    ███████╗
    ╚══════╝    ╚══════╝    ╚══════╝    ╚══════╝
*/

// ROUTE: RENDER SELL TEMPLATE
router.get('/sell', requireLogin, csrfProtection, async (req, res) => {

    let user_data = await prisma.portfolios.findMany({
        where: {
            user_id: req.session.user_id
        },
        include: {
            stocks: true
        }
    })

    user_data = user_data.map(s => s.stocks.symbol)

    res.render('finance/sell', {
        user_data,
        user: req.session.user_id,
        username: req.session.username,
        csrfToken: req.csrfToken()
    });
}) // ✔️


// ROUTE: HANDLE POST REQUEST FROM SELL FORM
//      Perform the "Sell" by updating the database
router.post('/sell', requireLogin, csrfProtection, async (req, res) => {

    const { symbol, shares } = req.body;

    // Check if the user owns shares
    const [ user_owns ] = await prisma.$queryRaw`SELECT * FROM portfolios WHERE user_id=${req.session.user_id} AND stock_id IN (SELECT id FROM stocks WHERE symbol=${symbol})`

    // TODO: Render apology (better: redirect to apology, best: flash apology)
    if (!user_owns) {
        res.send("NOPE!");
        return;
    }
    
    let owned_shares = user_owns.shares;
    let owned_stock_id = user_owns.id;
    
    // Check if user owns enough shares
    // TODO: Render apology (better: redirect to apology, best: flash apology)
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
            id: req.session.user_id
        }
    })

    const updated_cash = parseFloat(cash) + (parseFloat(price) * parseFloat(shares));

    const updated_user_info = await prisma.users.update({
        where: {
            id: req.session.user_id
        },
        data: {
            cash: updated_cash
        }
    })

    console.log("updated user info: ", updated_user_info);

    res.redirect('/finance/index');
})

module.exports = router;
