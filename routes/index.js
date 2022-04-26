const { Router } = require('express');
const router = Router();

// MOCK USER DATA
const userData = require('./mock_user.json');

router.get('/', (req, res) => {
    res.render('finance/index', { 
        "portfolio":  userData["portfolio"], 
        "cash": userData["cash"], 
        "grandtotal": userData["grandtotal"] 
    });
});

module.exports = router;