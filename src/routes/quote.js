const { Router } = require('express');
const router = Router();
// const prisma = require('../helpers/client.js');

// Helper functions
const lookup = require('../helpers/lookup.js');
const usd = require('../helpers/usd.js');
const requireLogin = require('../helpers/requireLogin.js');

/*
     ██████╗     ██╗   ██╗     ██████╗     ████████╗    ███████╗
    ██╔═══██╗    ██║   ██║    ██╔═══██╗    ╚══██╔══╝    ██╔════╝
    ██║   ██║    ██║   ██║    ██║   ██║       ██║       █████╗  
    ██║▄▄ ██║    ██║   ██║    ██║   ██║       ██║       ██╔══╝  
    ╚██████╔╝    ╚██████╔╝    ╚██████╔╝       ██║       ███████╗
    ╚══▀▀═╝      ╚═════╝      ╚═════╝        ╚═╝       ╚══════╝
*/


router.get('/quote', requireLogin, async (req, res) => {

    let query = req.query.symbol;

    if (!query) {
        
        // Si NO existe query, render formulario
        res.render('finance/quote', {
            title: "Quote",
            symbol: false,
        });

    } else {
        // Si existe query, valida y responde con info o apology
        let symbol = query.toUpperCase();
        const stockInfo = await lookup(symbol);

        if (stockInfo) {
            return res.render('finance/quote', {
                title: "Quote",
                symbol: stockInfo,
                usd,
            });
        } else {
            req.flash('failure', 'Invalid Symbol');
            return res.redirect('/finance/quote');
        }
    }
}); // ✔️:⭐⭐⭐⭐




module.exports = router;
