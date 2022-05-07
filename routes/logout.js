const { Router } = require('express');
const router = Router();

router.get('/logout', async (req, res) => {

    // TODO: Creo que es mejor "destruir" la sesión, puesto que estoy almacenando varios datos ahí.
    req.session.user_id = null;

    req.flash('success', 'Bye!')

    res.redirect('/finance/login');
});

module.exports = router;
