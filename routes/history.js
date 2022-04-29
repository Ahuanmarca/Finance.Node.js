const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');

// Helper functions
const lookup = require('../helpers/lookup.js');
const usd = require('../helpers/usd.js');

const SESSION_ID = 1;


router.get('/finance/history', async (req, res) => {

    // Get history from current user
    const user_history = await prisma.transacciones.findMany({
        where: {
            user_id: SESSION_ID
        },
        include: {
            stocks: true
        }
    });

    res.render('finance/history', {
        user_history
    });
}); // ✔️:⭐⭐
// TODO:
// - Find a better way to format the time string (currently done inside the template)


module.exports = router;