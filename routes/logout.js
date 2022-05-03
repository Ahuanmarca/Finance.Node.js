const { Router } = require('express');
const session = require('express-session');
const router = Router();


router.get('/logout', async (req, res) => {

    req.session.user_id = null;

    res.redirect('/finance/login');
});

module.exports = router;
