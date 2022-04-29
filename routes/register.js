const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');

// Helper functions
const lookup = require('../helpers/lookup.js');
const usd = require('../helpers/usd.js');

const SESSION_ID = 1;



router.get('/finance/register', (req, res) => {
    console.log("Route: Register - GET (render register template)");
    res.render('finance/register');
});

router.post('/finance/register', (req, res) => {
    console.log("Route: Register - POST (register user data");
    res.redirect('/');
})



module.exports = router;
