const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');

// Helper functions
const lookup = require('../helpers/lookup.js');
const usd = require('../helpers/usd.js');

const SESSION_ID = 1;




router.get('/finance/changePassword', (req, res) => {
    console.log("Route: Change Password - GET (render change password template");
    res.render('finance/changePassword');
})

router.patch('/finance/changePassword', (req, res) => {
    console.log("Route: Change Password - PATCH (update database");
    res.redirect('/');
})



module.exports = router;
