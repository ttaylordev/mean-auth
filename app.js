var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var express = require('express');
// ORM for mongodb
var mongoose = require('mongoose');
var sessions = require('client-sessions');


var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = mongoose.model('User', new Schema({
    id: ObjectId,
    firstName: String,
    lastName: String,
    email: { type:  String, unique: true},
    password: String
}));

var app = express();

app.set('view engine', 'jade');
// if (app.get('env') === 'development'){
// must be installed seperately
    // app.use(express.errorHandler());
app.locals.pretty = true;
// };

mongoose.connect('mongodb://localhost/newAuth');

//middleware It's going to run each request through this function first, and then will call our function. It will take the request, and make it availiable on req.body and allow us access to it. like in the app.post...
app.use(bodyParser.urlencoded({extended: true}));
app.use(sessions({
    cookieName: 'session',
    secret: '13298cnqiop8hiuopayd98poq23fq36y7cft7uasdi',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true, // deny cookie access to front-end javascript
    secure: true, // only use cookies over https
    ephemeral: true // delete on browser close
}));

app.use(csrf());

app.use(function (req, res, next) {
    'use strict';
    if (req.session && req.session.user) {
        User.findOne({ email: req.session.user.email}, function (err, user) {
            if (user) {
                req.user = user;
                delete req.user.password;
                req.session.user = req.user;
                res.locals.user = req.user;
            }
            next();
        });
    } else {
        next();
    }
});

function requireLogin(req, res, next) {
    'use strict';
    if (!req.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

// api
app.get('/home', function (req, res) {
    'use strict';
    res.render('index.jade');
});

app.get('/register', function (req, res) {
    'use strict';
    res.render('register.jade', {csrfToken: req.csrfToken()});
});


app.post('/register', function (req, res) {
    'use strict';
    var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    var user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash
    });
    user.save(function (err) {
        if (err) {
            err = 'Something bad happened.';
            if (err.code === 11000) {
                error = 'That email is already taken';
            }
            res.render('register.jade', {error: error});
        } else {
            res.redirect('dashboard');
        }
    });
});


app.get('/login', function (req, res) {
    'use strict';
    res.render('login.jade', {csrfToken: req.csrfToken()});
});

app.post('/login', function (req, res) {
    'use strict';
    User.findOne({email: req.body.email}, function (err, user) {
        if (!user) {
            res.render('login.jade', {error: 'Invalid email or pqassword.'});
        } else {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                req.session.user = user;
                res.redirect('dashboard');
            } else { res.render('login.jade', {error: 'Invalid email or password.'});
                }
        }
    });
});

app.get('/dashboard', requireLogin, function (req, res) {
    'use strict';
    res.render('dashboard.jade');
});

app.get('/logout', function (req, res) {
    'use strict';
    req.session.reset();
    res.redirect('/home');
});

app.listen(3000);