const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');
const bcrypt = require('bcrypt');

// Helper functions
// const lookup = require('../helpers/lookup.js');
// const usd = require('../helpers/usd.js');
const requireLogin = require('../helpers/requireLogin.js');

/*
 ██████╗██╗  ██╗ █████╗ ███╗   ██╗ ██████╗ ███████╗                
██╔════╝██║  ██║██╔══██╗████╗  ██║██╔════╝ ██╔════╝                
██║     ███████║███████║██╔██╗ ██║██║  ███╗█████╗                  
██║     ██╔══██║██╔══██║██║╚██╗██║██║   ██║██╔══╝                  
╚██████╗██║  ██║██║  ██║██║ ╚████║╚██████╔╝███████╗                
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝                
██████╗  █████╗ ███████╗███████╗██╗    ██╗ ██████╗ ██████╗ ██████╗ 
██╔══██╗██╔══██╗██╔════╝██╔════╝██║    ██║██╔═══██╗██╔══██╗██╔══██╗
██████╔╝███████║███████╗███████╗██║ █╗ ██║██║   ██║██████╔╝██║  ██║
██╔═══╝ ██╔══██║╚════██║╚════██║██║███╗██║██║   ██║██╔══██╗██║  ██║
██║     ██║  ██║███████║███████║╚███╔███╔╝╚██████╔╝██║  ██║██████╔╝
╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝ ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═════╝ 
*/

router.get('/changePassword', requireLogin, (req, res) => {
    res.render('finance/changePassword', {
        user: req.session.user_id,
        username: req.session.username
    });
})

router.put('/changePassword', requireLogin, async (req, res) => {

    const { oldPassword, newPassword, newPasswordConfirmation } = req.body;

    // Check if current password is correct
    const user = await prisma.users.findUnique({
        where: {
            id: req.session.user_id
        }
    })
    const validPassword = await bcrypt.compare(oldPassword, user.hash);
    if (!validPassword) {
        res.send("Invalid Password");
    }

    // Check if new password and confirmation match
    if (newPassword != newPasswordConfirmation) {
        res.send("New password and confirmation must match");
        return;
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);

    // Update user's hash in DB
    const updatedHash = await prisma.users.update({
        data: {
            hash: newHash
        },
        where: {
            id: req.session.user_id
        }
    });

    res.redirect('/finance/index');
})

module.exports = router;
