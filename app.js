var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var passport = require('passport');
var flash = require('connect-flash');

var app = express();
var port = process.env.PORT || 3035;


function SERVER() {
  var self = this;
  self.handleDatabase();
}

SERVER.prototype.handleDatabase = function () {
  var self = this;
  
  var mongoose = require('mongoose');
  var dbConfig = require('./configs/database');

  mongoose.Promise = Promise;
  //database connection
  var promise = mongoose.connect(dbConfig.url, {
    useMongoClient: true,
  });

  promise.then(function (db) {
    console.log('Mongoose default connection open to ' + dbConfig.url);
    self.configureExpress();
  });

}

SERVER.prototype.configureExpress = function () {
  var self = this;

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  // express setup
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  self.configurePassport();
}

SERVER.prototype.configurePassport = function () {
  var self = this;

  //session setup
  app.use(session({
    secret: 'mynameismoohyong',
    resave: true,
    saveUninitialized: true
  }));

  //passport setup
  require('./configs/passport')(passport);
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  //routes setup
  require('./routes/routes.js')(app, passport);

  self.start();
}

SERVER.prototype.start = function () {
  var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("SERVER RUNNING IN http://%s:%s", host, port);
  });
}

new SERVER();
