const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');
const bcrypt = require('bcrypt');

// CSRF PROTECTION 🗝️
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
router.use(cookieParser());

/*
    ██████╗     ███████╗     ██████╗     ██╗    ███████╗    ████████╗    ███████╗    ██████╗ 
    ██╔══██╗    ██╔════╝    ██╔════╝     ██║    ██╔════╝    ╚══██╔══╝    ██╔════╝    ██╔══██╗
    ██████╔╝    █████╗      ██║  ███╗    ██║    ███████╗       ██║       █████╗      ██████╔╝
    ██╔══██╗    ██╔══╝      ██║   ██║    ██║    ╚════██║       ██║       ██╔══╝      ██╔══██╗
    ██║  ██║    ███████╗    ╚██████╔╝    ██║    ███████║       ██║       ███████╗    ██║  ██║
    ╚═╝  ╚═╝    ╚══════╝     ╚═════╝     ╚═╝    ╚══════╝       ╚═╝       ╚══════╝    ╚═╝  ╚═╝
*/


router.get('/register', csrfProtection, (req, res) => {
    res.render('finance/register', {
        user: req.session.user_id,
        username: req. session.username,
        csrfToken: req.csrfToken(),
        success: req.flash("success"),
        failure: req.flash("failure"),
        // message: req.flash("message"),
        fullName: `${req.session.firstName} ${req.session.lastName}` 
    });
});

router.post('/register', csrfProtection, async (req, res) => {

    const { username, password, confirmation, firstName, lastName, email } = req.body;

    // Check if all fields are provided
    if (!username || !password || !confirmation || !firstName || !lastName || !email) {
        req.flash('failure', 'Missing input');
        res.redirect('/finance/register');
        return;
    }
    
    // Check is user already exists
    const stored_user = await prisma.users.findUnique({
        where: {
            username: username
        }
    });
    if (stored_user) {
        req.flash('failure', 'Username unavailable');
        res.redirect('/finance/register');
        return;
    }
    
    // Check if password and confirmation are the same
    if (password != confirmation) {
        req.flash('failure', 'Password and confirmation must match');
        res.redirect('/finance/register');
        return;
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    // Save usar in DB
    const new_user = await prisma.users.create({
        data: {
            username: username,
            hash: hash,
            first_name: firstName,
            last_name: lastName,
            email: email
        }
    });

    // Login with newly registered user
    req.session.user_id = new_user.id;
    req.session.username = new_user.username; 
    req.session.firstName = new_user.first_name;
    req.session.lastName = new_user.last_name;

    req.flash('success', 'Registered!');

    res.redirect('/finance/index');
})

module.exports = router;
