const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');
const bcrypt = require('bcrypt');

// Helper functions
const lookup = require('../helpers/lookup.js');
const usd = require('../helpers/usd.js');

/*
    ██╗          ██████╗      ██████╗     ██╗    ███╗   ██╗
    ██║         ██╔═══██╗    ██╔════╝     ██║    ████╗  ██║
    ██║         ██║   ██║    ██║  ███╗    ██║    ██╔██╗ ██║
    ██║         ██║   ██║    ██║   ██║    ██║    ██║╚██╗██║
    ███████╗    ╚██████╔╝    ╚██████╔╝    ██║    ██║ ╚████║
    ╚══════╝     ╚═════╝      ╚═════╝     ╚═╝    ╚═╝  ╚═══╝
*/


router.get('/login', (req, res) => {

    if (req.session.user_id) {
        res.redirect('/finance/index');
    }

    res.render('finance/login', {
        user: req.session.user_id,
        username: req.session.username
    });
}); // ✔️


router.post('/login', async (req, res) => {

    if (req.session.user_id) {
        res.redirect('/finance/index');
    }

    const { username, password } = req.body;

    // Find the user with this username
    const user = await prisma.users.findUnique({
        where: {
            username: username
        }
    });

    if (!user) {
        res.send("Invalid username or password!");
        return;
    }

    const validPassword = await bcrypt.compare(password, user.hash);

    if (validPassword) {
        req.session.user_id = user.id;
        req.session.username = user.username;
        res.redirect('/finance/index');
    } else {
        res.send("Invalid username or password!")
    }

})

module.exports = router;
