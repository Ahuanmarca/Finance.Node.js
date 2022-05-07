const { Router } = require('express');
const router = Router();

// CSRF PROTECTION 🗝️
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
router.use(cookieParser());

// Helper functions
const authenticate = require('../helpers/authenticate.js');
const flash = require('connect-flash/lib/flash');

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
        csrfToken: req.csrfToken(),
        success: req.flash("success"),
        failure: req.flash("failure"),
        fullName: `${req.session.firstName} ${req.session.lastName}` 
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
        req.flash('success', `Welcome back ${auth.firstName}!`)
        req.session.user_id = auth.id;
        req.session.username = auth.username;
        req.session.firstName = auth.firstName;
        req.session.lastName = auth.lastName;
        res.redirect('/finance/index');
    } else {
        req.flash('failure', 'Invalid username or password!');
        res.redirect('/finance/changePassword');
        return;
    }
})

module.exports = router;
