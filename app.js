const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');

const app = express();

// USER STATUS
let SESSION_ID = 1;

// ¿Por qué esto está aquí y no mas abajo? ¿Si lo pongo con los demás middlewares se ropmerá algo?
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({secret: 'notASecret'}));



// app.use(express.static(path.join(__dirname, 'public')));


// ROUTES
//      ¡Jala todas las rutas de /routes!!
app.use('/finance', require('./routes/index'));
app.use('/finance', require('./routes/buy'));
app.use('/finance', require('./routes/history'));
app.use('/finance', require('./routes/login'));
app.use('/finance', require('./routes/quote'));
app.use('/finance', require('./routes/sell'));
app.use('/finance', require('./routes/changePassword'));
app.use('/finance', require('./routes/register'));


// STARTING SERVER
app.listen(3000, () => {
    console.log('hello, world - Server on port 3000');
});