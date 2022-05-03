const { Router } = require('express');
const router = Router();

// CSRF PROTECTION 🗝️
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
router.use(cookieParser());

// Helper functions
const authenticate = require('../helpers/authenticate.js');

/*
    ██╗          ██████╗      ██████╗     ██╗    ███╗   ██╗
    ██║         ██╔═══██╗    ██╔════╝     ██║    ████╗  ██║
    ██║         ██║   ██║    ██║  ███╗    ██║    ██╔██╗ ██║
    ██║         ██║   ██║    ██║   ██║    ██║    ██║╚██╗██║
    ███████╗    ╚██████╔╝    ╚██████╔╝    ██║    ██║ ╚████║
    ╚══════╝     ╚═════╝      ╚═════╝     ╚═╝    ╚═╝  ╚═══╝
*/


router.get('/login', csrfProtection, (req, res) => {

    if (req.session.user_id) {
        res.redirect('/finance/index');
    }

    res.render('finance/login', {
        user: req.session.user_id,
        username: req.session.username,
        csrfToken: req.csrfToken()
    });
}); // ✔️


router.post('/login', csrfProtection, async (req, res) => {

    // If the user is already logged, redirect to index
    if (req.session.user_id) {
        res.redirect('/finance/index');
    }

    // Authenticate user with helper function
    const auth = await authenticate(req.body);

    if (auth.validation) {
        req.session.user_id = auth.id;
        req.session.username = auth.username;
        res.redirect('/finance/index');
    } else {
        res.send("Invalid username or password!");
        return;
    }
})

module.exports = router;
