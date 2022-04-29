const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');

// Helper functions
const lookup = require('../helpers/lookup.js');
const usd = require('../helpers/usd.js');

const SESSION_ID = 1;


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




module.exports = router;
