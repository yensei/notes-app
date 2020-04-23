const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');


// Initialization
const app = express();
require('./config/database');
require('./config/passport');

// Settings 
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs',exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'),'layaouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname:'.hbs'
}));
app.set('view engine', '.hbs');

// Middlewares
app.use(express.urlencoded({extended:false}));
app.use(methodOverride('_method'))
app.use(session({
    secret : 'myappsecret',
    resave:true,
    saveUninitialized:true
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg   = req.flash('error_msg');
    res.locals.error   = req.flash('error');
    res.locals.user = req.user || null;
    next();
});


// Routes
app.use(require('./routes/index'));
app.use(require('./routes/notes'));
app.use(require('./routes/users'));

// Static Files
app.use(express.static(path.join(__dirname,'public')))

// Server listening
app.listen(app.get('port'), () => {
    console.log(`Server listenig on port ${app.get('port')}`);
    }
);