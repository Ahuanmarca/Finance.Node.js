const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');



const app = express();

// ¿Por qué esto está aquí y no mas abajo? ¿Si lo pongo con los demás middlewares se ropmerá algo?
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// app.use(express.static(path.join(__dirname, 'public')));

// ROUTES MIDDLEWARE
app.use(require('./routes/index'));

// STARTING SERVER
app.listen(3000, () => {
    console.log('hello, world - Server on port 3000');
});