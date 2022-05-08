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

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(flash());
app.use(session({secret: '4kit4rig4to', resave: false, saveUninitialized: false}));

// ROUTES
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