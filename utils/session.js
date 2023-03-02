const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('../config/config.js');

const sessionExp = session({
  store: MongoStore.create({
    mongoUrl: config.MONGOURL,
    mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    ttl: 60000 * 10,
    cookie: { maxAge: 60000 * 10 },
  }),
  secret: config.SECRET,
  resave: false,
  saveUninitialized: false,
});

module.exports = { sessionExp };
