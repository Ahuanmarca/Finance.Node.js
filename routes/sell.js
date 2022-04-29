const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');

// Helper functions
const lookup = require('../helpers/lookup.js');
const usd = require('../helpers/usd.js');

const SESSION_ID = 1;



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



module.exports = router;
