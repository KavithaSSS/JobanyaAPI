console.info('\nThe server initializing... ');

const express = require('express');
const bodyParser = require('body-parser')
const morgan = require('morgan');
const cors = require('cors');
var timeout = require('connect-timeout');
const app = express();

//process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
//process.env.port = process.env.port || 8000;
process.env.TZ = 'Asia/Calcutta'

process.on('SIGINT', () => { console.log('exiting…'); process.exit(); });

process.on('exit', () => { console.log('exiting…'); process.exit(); });

app.use(cors());
app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// // parse application/json
// app.use(bodyParser.json())
app.use(timeout('60s'));
app.use(morgan('dev'));

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
// console.log(__dirname);
console.info('\nThe mongoDB connection initializing... ');
require('./config/database');
//require('./routes')(app);
require('./route')(app);

// app.listen(process.env.port, () => {
//   console.info('\x1b[36m%s\x1b[0m', '\nThe server is running on environment    : ' + process.env.NODE_ENV);
//   console.info('\x1b[36m%s\x1b[0m', '\nThe server is running on port           : ' + process.env.port);

// });
module.exports = app;