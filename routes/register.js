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
        csrfToken: req.csrfToken()
    });
});

router.post('/register', csrfProtection, async (req, res) => {

    const { username, password, confirmation } = req.body;

    // Check if all fields are provided
    if (!username || !password || !confirmation) {
        res.send("Invalid username or password");
        return;
    }

    // Check if password and confirmation are the same
    if (password != confirmation) {
        res.send("Invalid username or password");
        return;
    }

    // Check is user already exists
    const stored_user = await prisma.users.findUnique({
        where: {
            username: username
        }
    });
    if (stored_user) {
        res.send("Invalid username or password");
        return;
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    // Save username and password in DB
    const new_user = await prisma.users.create({
        data: {
            username: username,
            hash: hash
        }
    });

    console.log("created new user: ", new_user);

    res.redirect('/finance/index');
})

module.exports = router;
