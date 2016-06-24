var express = require('express');
var bodyParser = require('body-parser');
// ORM for mongodb
var mongoose = require('mongoose');

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

app.get('/', function (req, res) {
    'use strict';
    res.render('index.jade');
});

app.get('/register', function (req, res) {
    'use strict';
    res.render('register.jade');
});

app.post('/register', function (req, res) {
    'use strict';
    res.json(req.body);
});

app.get('/login', function (req, res) {
    'use strict';
    res.render('login.jade');
});

app.get('/dashboard', function (req, res) {
    'use strict';
    res.render('dashboard.jade');
});

app.get('/logout', function (req, res) {
    'use strict';
    res.redirect('/');
});

app.listen(3000);