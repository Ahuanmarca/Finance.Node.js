const { Router } = require('express');
const router = Router();

// CSRF PROTECTION 🗝️
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
router.use(cookieParser());

// Helper functions
const authenticate = require('../helpers/authenticate.js');
// const flash = require('connect-flash/lib/flash');

/*
    ██╗          ██████╗      ██████╗     ██╗    ███╗   ██╗
    ██║         ██╔═══██╗    ██╔════╝     ██║    ████╗  ██║
    ██║         ██║   ██║    ██║  ███╗    ██║    ██╔██╗ ██║
    ██║         ██║   ██║    ██║   ██║    ██║    ██║╚██╗██║
    ███████╗    ╚██████╔╝    ╚██████╔╝    ██║    ██║ ╚████║
    ╚══════╝     ╚═════╝      ╚═════╝     ╚═╝    ╚═╝  ╚═══╝
*/


router.get('/login', csrfProtection, (req, res) => {

    if (req.session.userID) {
        res.redirect('/finance/index');
        return;
    }


    res.render('finance/login', {
        title: "Login",
        csrfToken: req.csrfToken(),
    });
}); // ✔️


router.post('/login', csrfProtection, async (req, res) => {

    // If the user is already logged, redirect to index
    if (req.session.userID) {
        res.redirect('/finance/index');
        return;
    }

    // Authenticate user with helper function
    const auth = await authenticate(req.body);

    if (auth.validation) {
        req.flash('success', `Welcome back ${auth.firstName}!`)
        req.session.userID = auth.id;
        req.session.username = auth.username;
        req.session.firstName = auth.firstName;
        req.session.lastName = auth.lastName;
        res.redirect('/finance/index');
        return;
    } else {
        req.flash('failure', 'Invalid username or password!');
        res.redirect('/finance/changePassword');
        return;
    }
})

module.exports = router;
