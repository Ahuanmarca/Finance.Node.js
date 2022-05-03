const { Router } = require('express');
// const res = require('express/lib/response');
const router = Router();
const prisma = require('../helpers/client.js');
const bcrypt = require('bcrypt');


// Helper functions
// const lookup = require('../helpers/lookup.js');
// const usd = require('../helpers/usd.js');

const SESSION_ID = 1;


/*
    ██████╗     ███████╗     ██████╗     ██╗    ███████╗    ████████╗    ███████╗    ██████╗ 
    ██╔══██╗    ██╔════╝    ██╔════╝     ██║    ██╔════╝    ╚══██╔══╝    ██╔════╝    ██╔══██╗
    ██████╔╝    █████╗      ██║  ███╗    ██║    ███████╗       ██║       █████╗      ██████╔╝
    ██╔══██╗    ██╔══╝      ██║   ██║    ██║    ╚════██║       ██║       ██╔══╝      ██╔══██╗
    ██║  ██║    ███████╗    ╚██████╔╝    ██║    ███████║       ██║       ███████╗    ██║  ██║
    ╚═╝  ╚═╝    ╚══════╝     ╚═════╝     ╚═╝    ╚══════╝       ╚═╝       ╚══════╝    ╚═╝  ╚═╝
*/


router.get('/register', (req, res) => {
    res.render('finance/register', {
        user: req.session.user_id,
        username: req. session.username
    });
});

router.post('/register', async (req, res) => {

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
