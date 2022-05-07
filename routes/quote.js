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
            symbol: false,
            user: req.session.user_id,
            username: req.session.username,
            success: req.flash("success"),
            failure: req.flash("failure"),
            // message: req.flash("message"),
            fullName: `${req.session.firstName} ${req.session.lastName}` 
        });

    } else {
        // Si existe query, valida y responde con info o apology
        let symbol = query.toUpperCase();
        const business_data = await lookup(symbol);
        console.log(business_data)

        if (business_data) {
            res.render('finance/quote', {
                symbol: business_data,
                usd,
                user: req.session.user_id,
                username: req.session.username,
                success: req.flash("success"),
                failure: req.flash("failure"),
                // message: req.flash("message"),
                fullName: `${req.session.firstName} ${req.session.lastName}` 

            });
        } else {
            req.flash('failure', 'Invalid Symbol');
            res.redirect('/finance/flash');
            return;
        }
    }
}); // ✔️:⭐⭐⭐⭐




module.exports = router;
