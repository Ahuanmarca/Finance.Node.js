const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');

// Helper functions
const lookup = require('../helpers/lookup.js');
const usd = require('../helpers/usd.js');

const SESSION_ID = 1;


/*
    ██╗          ██████╗      ██████╗     ██╗    ███╗   ██╗
    ██║         ██╔═══██╗    ██╔════╝     ██║    ████╗  ██║
    ██║         ██║   ██║    ██║  ███╗    ██║    ██╔██╗ ██║
    ██║         ██║   ██║    ██║   ██║    ██║    ██║╚██╗██║
    ███████╗    ╚██████╔╝    ╚██████╔╝    ██║    ██║ ╚████║
    ╚══════╝     ╚═════╝      ╚═════╝     ╚═╝    ╚═╝  ╚═══╝
*/


router.get('/login', (req, res) => {
    res.render('finance/login');
}); // ✔️




module.exports = router;
