const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

const sessionConfig = {
    secret: '4kit4rig4to', 
    resave: false, 
    saveUninitialized: false,
    cookie: {
        httpOnly: true, 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(session(sessionConfig));
app.use(flash());

// Middleware to have access to some variables in all templates! 😀
// One of my favorite middlewares until now!!
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.failure = req.flash('failure');
    res.locals.user = req.session.userID;
    res.locals.username = req.session.username;
    res.locals.fullName = `${req.session.firstName} ${req.session.lastName}`;
    next();
});

// ROUTES
app.get('/', (req, res) => res.redirect('/finance/index'))
app.use('/finance', require('./src/routes/index'));
app.use('/finance', require('./src/routes/buy'));
app.use('/finance', require('./src/routes/history'));
app.use('/finance', require('./src/routes/login'));
app.use('/finance', require('./src/routes/quote'));
app.use('/finance', require('./src/routes/sell'));
app.use('/finance', require('./src/routes/changePassword'));
app.use('/finance', require('./src/routes/register'));
app.use('/finance', require('./src/routes/logout'));

// STARTING SERVER
app.listen(3000, () => {
    console.log('hello, world - Server on port 3000');
});