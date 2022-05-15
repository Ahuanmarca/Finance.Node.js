const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');

// Helper functions
const usd = require('../helpers/usd.js');
const requireLogin = require('../helpers/requireLogin.js');
const parseDateTime = require('../helpers/parseDateTime');

/*
██╗  ██╗    ██╗    ███████╗    ████████╗     ██████╗     ██████╗     ██╗   ██╗
██║  ██║    ██║    ██╔════╝    ╚══██╔══╝    ██╔═══██╗    ██╔══██╗    ╚██╗ ██╔╝
███████║    ██║    ███████╗       ██║       ██║   ██║    ██████╔╝     ╚████╔╝ 
██╔══██║    ██║    ╚════██║       ██║       ██║   ██║    ██╔══██╗      ╚██╔╝  
██║  ██║    ██║    ███████║       ██║       ╚██████╔╝    ██║  ██║       ██║   
╚═╝  ╚═╝    ╚═╝    ╚══════╝       ╚═╝        ╚═════╝     ╚═╝  ╚═╝       ╚═╝   
*/

router.get('/history', requireLogin, async (req, res) => {

    // Get history from current user
    const userHistory = await prisma.transacciones.findMany({
        where: {
            user_id: req.session.userID
        },
        include: {
            stocks: true
        }
    });

    res.render('finance/history', {
        title: "History",
        userHistory,
        usd,
        parseDateTime,
    });
}); // ✔️:⭐⭐

// TODO: Find a better way to format the time string (currently done inside the template) - ✔️ Done!
//      Created a helper function that parses the date from the DB format to a nice string, then passed the function to the EJS template. Commented out the noise to the bottom, just as a nice reminder.

module.exports = router;
