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

    // If user is aready logged, redirect to index
    if (req.session.userID) {
        res.redirect('/finance/index');
    }

    res.render('finance/register', {
        title: "Register",
        user: req.session.userID,
        username: req.session.username,
        csrfToken: req.csrfToken(),
        success: req.flash("success"),
        failure: req.flash("failure"),
        fullName: `${req.session.firstName} ${req.session.lastName}` 
    });
});

router.post('/register', csrfProtection, async (req, res) => {

    // If user is aready logged, redirect to index
    if (req.session.userID) {
        res.redirect('/finance/index');
    }

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

    // Check for password strength
    // Require at least one upper case, one lower case, one digit, one spacial character, 8 characters long.
    const pattern = "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})";
    if (password.search(pattern) < 0) {
        req.flash('failure', 'Password must have at least: 1 uppercase, 1 lowercase, 1 digit, 1 special character, 8 characters long.');
        res.redirect('/finance/register');
        return;
    }

    // Check if email has a valid format
    if (email.search(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) < 0) {
        req.flash('failure', 'Invalid email');
        res.redirect('/finance/register');
        return;
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    // Save new user in DB
    const newUser = await prisma.users.create({
        data: {
            username: username,
            hash: hash,
            first_name: firstName,
            last_name: lastName,
            email: email
        }
    });

    // Login with newly registered user
    req.session.userID = newUser.id;
    req.session.username = newUser.username; 
    req.session.firstName = newUser.first_name;
    req.session.lastName = newUser.last_name;

    req.flash('success', 'Registered!');

    res.redirect('/finance/index');
})

module.exports = router;
