const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs  = require('express-handlebars');
const session = require('express-session');
const SessionStore = require('connect-mongo')(session);
const connectDB = require('./configs/database');
const passport = require('passport');
const flash = require('connect-flash');

//load configs from .env file
dotenv.config({path: './.env'});

// passport config
require('./configs/passport')(passport);

connectDB();

const app = express();

// for logging on treminal
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// Register `hbs.engine` with the Express app.
app.engine('.hbs', exphbs({dafaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

// sessions middleware setup
app.use(session({
    secret: 'some-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({mongooseConnection: mongoose.connection})
}));

/*
Initialize Passport and restore authentication state,
if any, from the session.
*/
app.use(passport.initialize());
app.use(passport.session());

// Define routes
app.use('/', require('./routes'));
app.use('/auth', require('./routes/auth'));

// setup for loading static resources from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 5000
app.listen( 
    port,
    console.log(`Server runing in ${process.env.NODE_ENV} mode on port ${port}`)
);