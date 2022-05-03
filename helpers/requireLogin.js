// Función para requerir login (para usar como middleware)

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/finance/login');
    }
    next();
}

module.exports = requireLogin;