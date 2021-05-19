var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { sequelize } = require('./models')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established!')
  } catch(err) {
    console.error(err);
  }
})();


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/static', express.static('public'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404
app.use(function(req, res, next) {
  const error = new Error("Resource not found on server");
  error.status = 404;
  console.log(error.stack);
  res.render('page-not-found', { error });
});

// global error handler
app.use(function(err, req, res, next) {
  // render the error page
  err.status = (err.status || 500);
  err.message = (err.message || "Oops there was an error on the server-side");
  res.render('error', { err });
});

module.exports = app;
