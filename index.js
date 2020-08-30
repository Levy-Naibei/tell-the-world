const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs  = require('express-handlebars');
const session = require('express-session');
const SessionStore = require('connect-mongo')(session)
const passport = require('passport');
const methodOverride = require('method-override')
const flash = require('connect-flash');
const connectDB = require('./configs/database');
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers');

//load configs from .env file
dotenv.config({path: './.env'});

// passport config
require('./configs/passport')(passport);

//log mongo connection
connectDB();

const app = express();

// body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// overide the POST
app.use(methodOverride((req, res) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  }))

// for logging on treminal
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

/**
 * Register `hbs.engine` with the Express app.
 * and handle bars helpeer
 */
app.engine('.hbs', exphbs({
    helpers: {
        formatDate,
        truncate,
        stripTags,
        editIcon,
        select
    },
    dafaultLayout: 'main',
    extname: '.hbs'
}));
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

// set express global variable
app.use((res, req, next) => {
    req.locals.user = (res.user || null)
    next();
});

// Define routes
app.use('/', require('./routes'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

// setup for loading static resources from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 5000
app.listen( 
    port,
    console.log(`Server runing in ${process.env.NODE_ENV} mode on port ${port}`)
);