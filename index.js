const express           = require('express');
const cookieParser      = require('cookie-parser');
const bodyParser        = require('body-parser');
const logger            = require('morgan');

const playground        = require('./routes/playground');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());

app.use('/playground', playground);

app.use(function(req, res, next) {
  res.send({code:404, message: '404 this command was not found'})
});

app.listen(process.env.PORT || 3000);

module.exports = app;
