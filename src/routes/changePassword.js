const { Router } = require('express');
const router = Router();
const prisma = require('../helpers/client.js');
const bcrypt = require('bcrypt');

// CSRF PROTECTION 🗝️
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
router.use(cookieParser());

// Helper functions
const requireLogin = require('../helpers/requireLogin.js');
const authenticate = require('../helpers/authenticate.js');

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

router.get('/changePassword', requireLogin, csrfProtection, (req, res) => {
    res.render('finance/changePassword', {
        title: "Change Password",
        csrfToken: req.csrfToken(),
    });
})

router.put('/changePassword', requireLogin, csrfProtection, async (req, res) => {

    const { oldPassword, newPassword, newPasswordConfirmation } = req.body;

    // Check if current password is correct
    const auth = await authenticate({username: req.session.username, password: oldPassword});

    if (!auth.validation) {
        req.flash('failure', 'Invalid Password');
        res.redirect('/finance/changePassword');
        return;
    }

    // Check if new password and confirmation match
    if (newPassword != newPasswordConfirmation) {
        req.flash('failure', 'New password and confirmation must match!');
        res.redirect('/finance/changePassword');
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
            id: req.session.userID
        }
    });

    req.flash('success', 'Changed Password');

    res.redirect('/finance/index');
})

module.exports = router;
