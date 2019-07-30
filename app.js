// dependencies
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
var cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const flash = require('connect-flash');
const session = require('express-session');
let users = require('./src/routes/users');
let auth = require('./src/routes/auth');
let quiz = require('./src/routes/Quiz');
const localSignUp = require('./config/passport/local-signup');

const localLogin = require('./config/passport/local-login');

const authCheckMiddleware = require('./src/middleware/auth-check');
const SuperAdminCheckMiddleware = require('./src/middleware/superAdmin-check');

app.use(cors());
app.use(passport.initialize());
passport.use('local-signup', localSignUp);
passport.use('local-login', localLogin);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('short'));

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', function() {
	console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err) {
	console.log(err);
});

// Express Session Middleware
app.use(
	session({
		secret: 'keyboard cat',
		resave: true,
		saveUninitialized: true
	})
);

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

//Route files
app.use('/user', users);
app.use('/auth', auth);
app.use('/quiz', quiz);
//app.use('/auth', SuperAdminCheckMiddleware);

//home route
app.get('/', (req, res) => {
	res.send({ ok: 'hello' });
});
//start server
app.listen(3015, (req, res) => {
	console.log('Listening');
});
